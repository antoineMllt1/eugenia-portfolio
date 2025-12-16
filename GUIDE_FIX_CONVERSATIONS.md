# Guide pour corriger les problèmes de conversations

## Problème
La fonction `create_conversation_with_participants` ne crée qu'un seul participant au lieu de deux, ce qui empêche l'affichage correct de l'interlocuteur dans les conversations.

## Solution

### Étape 1 : Exécuter le script de correction de la fonction principale

1. Ouvrez le SQL Editor dans Supabase Dashboard
2. Copiez-collez le contenu de `fix_create_conversation_function.sql`
3. Exécutez le script

Ce script :
- Supprime et recrée la fonction `create_conversation_with_participants`
- Ajoute une validation pour s'assurer que les deux participants sont créés
- Utilise `SET search_path = public` pour éviter les problèmes de schéma
- Gère les conflits avec `ON CONFLICT DO NOTHING`

### Étape 2 : Exécuter le script pour ajouter un participant manquant

1. Dans le SQL Editor, copiez-collez le contenu de `add_participant_function.sql`
2. Exécutez le script

Ce script crée une fonction RPC `add_conversation_participant` qui permet d'ajouter un participant manquant à une conversation existante, en contournant les politiques RLS.

### Étape 3 : Exécuter le script pour récupérer l'autre participant

1. Dans le SQL Editor, copiez-collez le contenu de `get_other_participant_function.sql`
2. Exécutez le script

Ce script crée une fonction RPC `get_other_participant` qui permet de récupérer l'ID de l'autre participant dans une conversation, en contournant les politiques RLS qui empêchent de voir les participants des autres utilisateurs.

### Étape 4 : Exécuter le script pour récupérer toutes les conversations

1. Dans le SQL Editor, copiez-collez le contenu de `get_user_conversations_function.sql`
2. Exécutez le script

Ce script crée une fonction RPC `get_user_conversations` qui permet de récupérer toutes les conversations d'un utilisateur avec les informations de l'autre participant et le dernier message, en contournant les politiques RLS.

### Étape 5 : Vérifier que les fonctions existent

Exécutez cette requête pour vérifier :

```sql
SELECT 
  proname as function_name,
  proargnames as argument_names
FROM pg_proc
WHERE proname IN ('create_conversation_with_participants', 'add_conversation_participant', 'get_other_participant', 'get_user_conversations');
```

Vous devriez voir les quatre fonctions listées.

### Étape 6 : Tester

1. Rechargez l'application
2. Essayez de créer une nouvelle conversation
3. Vérifiez dans la console que les deux participants sont créés
4. Vérifiez que le nom de l'interlocuteur s'affiche correctement dans le header

## Notes

- Les fonctions utilisent `SECURITY DEFINER` pour contourner les politiques RLS
- Si le problème persiste, vérifiez les logs de la console pour voir quelles erreurs se produisent
- Les conversations existantes avec un seul participant peuvent être corrigées manuellement en utilisant la fonction `add_conversation_participant`

