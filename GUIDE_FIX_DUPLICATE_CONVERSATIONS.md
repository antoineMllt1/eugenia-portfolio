# Guide : Corriger les conversations dupliquées

Ce guide vous explique comment corriger le problème des conversations dupliquées (72 conversations avec une seule personne au lieu d'une seule).

## Problème

Actuellement, le système crée une nouvelle conversation à chaque fois qu'on essaie de démarrer une conversation avec quelqu'un, même si une conversation existe déjà. Cela résulte en plusieurs conversations avec la même personne.

## Solution

Nous allons créer deux fonctions SQL :
1. `check_existing_conversation` - Vérifie si une conversation existe déjà entre deux utilisateurs
2. `create_conversation_with_participants` (améliorée) - Vérifie d'abord l'existence avant de créer une nouvelle conversation

## Étapes

### 1. Exécuter la fonction de vérification

Dans le SQL Editor de Supabase, exécutez le contenu de `check_existing_conversation_function.sql` :

```sql
-- Function to check if a conversation already exists between two users
-- Returns the conversation_id if it exists, NULL otherwise

CREATE OR REPLACE FUNCTION check_existing_conversation(
  user1_id UUID,
  user2_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_conv_id UUID;
BEGIN
  -- Find a conversation where both users are participants
  SELECT DISTINCT cp1.conversation_id
  INTO existing_conv_id
  FROM conversation_participants cp1
  INNER JOIN conversation_participants cp2
    ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = user1_id
    AND cp2.user_id = user2_id
    AND cp1.conversation_id = cp2.conversation_id
  LIMIT 1;
  
  RETURN existing_conv_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_existing_conversation(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_existing_conversation(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION check_existing_conversation(UUID, UUID) TO service_role;
```

### 2. Mettre à jour la fonction de création

Exécutez le contenu de `create_conversation_function_improved.sql` :

```sql
-- Improved function to create a conversation with participants
-- First checks if a conversation already exists between the two users
-- If it exists, returns the existing conversation_id
-- If not, creates a new conversation

CREATE OR REPLACE FUNCTION create_conversation_with_participants(
  participant1_id UUID,
  participant2_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_conv_id UUID;
  new_conv_id UUID;
BEGIN
  -- First, check if a conversation already exists between these two users
  SELECT check_existing_conversation(participant1_id, participant2_id)
  INTO existing_conv_id;
  
  -- If conversation exists, return it
  IF existing_conv_id IS NOT NULL THEN
    RETURN existing_conv_id;
  END IF;
  
  -- Create new conversation
  INSERT INTO conversations DEFAULT VALUES
  RETURNING id INTO new_conv_id;
  
  -- Add both participants
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES
    (new_conv_id, participant1_id),
    (new_conv_id, participant2_id)
  ON CONFLICT (conversation_id, user_id) DO NOTHING;
  
  RETURN new_conv_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and re-raise
    RAISE EXCEPTION 'Error creating conversation: %', SQLERRM;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_conversation_with_participants(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_conversation_with_participants(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION create_conversation_with_participants(UUID, UUID) TO service_role;
```

### 3. (Optionnel) Nettoyer les conversations dupliquées existantes

Si vous souhaitez nettoyer les conversations dupliquées existantes, vous pouvez exécuter cette requête pour identifier les doublons :

```sql
-- Trouver les conversations dupliquées entre deux utilisateurs
SELECT 
  cp1.user_id as user1_id,
  cp2.user_id as user2_id,
  COUNT(DISTINCT cp1.conversation_id) as conversation_count,
  array_agg(DISTINCT cp1.conversation_id) as conversation_ids
FROM conversation_participants cp1
INNER JOIN conversation_participants cp2
  ON cp1.conversation_id = cp2.conversation_id
WHERE cp1.user_id < cp2.user_id  -- Évite les doublons (A-B et B-A)
GROUP BY cp1.user_id, cp2.user_id
HAVING COUNT(DISTINCT cp1.conversation_id) > 1
ORDER BY conversation_count DESC;
```

**⚠️ ATTENTION** : Ne supprimez pas les conversations manuellement sans sauvegarder les messages importants. Si vous souhaitez nettoyer, gardez la conversation la plus récente (celle avec le dernier message) et supprimez les autres.

## Résultat

Après avoir exécuté ces scripts :
- ✅ Le système vérifiera automatiquement si une conversation existe avant d'en créer une nouvelle
- ✅ Une seule conversation sera maintenue entre deux utilisateurs
- ✅ Les nouvelles conversations ne seront créées que s'il n'en existe pas déjà une

## Test

Pour tester :
1. Essayez de démarrer une conversation avec quelqu'un avec qui vous avez déjà une conversation
2. Le système devrait ouvrir la conversation existante au lieu d'en créer une nouvelle
3. Vérifiez dans la console que le message "Found existing conversation" apparaît

