# Guide : Supprimer toutes les conversations

Ce guide vous explique comment supprimer toutes les conversations existantes pour repartir sur une base propre.

## ⚠️ ATTENTION

**Ce script supprime TOUTES les conversations, tous les participants et tous les messages de manière irréversible.**

Assurez-vous de :
- ✅ Avoir sauvegardé les données importantes si nécessaire
- ✅ Comprendre que cette action est irréversible
- ✅ Vouloir vraiment supprimer toutes les conversations

## Étapes

### 1. Ouvrir le SQL Editor dans Supabase

1. Allez sur votre projet Supabase
2. Cliquez sur "SQL Editor" dans le menu de gauche
3. Cliquez sur "New query"

### 2. Exécuter le script de suppression

Copiez et exécutez le contenu de `delete_all_conversations.sql` :

```sql
-- Script pour supprimer toutes les conversations, participants et messages
-- ⚠️ ATTENTION : Ce script supprime TOUTES les conversations et tous les messages

-- Option 1 : Suppression avec CASCADE (plus simple)
-- Cette méthode supprime automatiquement les participants et messages liés
DELETE FROM conversations CASCADE;

-- Option 2 : Suppression manuelle dans l'ordre (si CASCADE ne fonctionne pas)
-- Décommentez cette section si l'option 1 ne fonctionne pas

-- DELETE FROM messages;
-- DELETE FROM conversation_participants;
-- DELETE FROM conversations;

-- Vérification : Afficher le nombre de conversations restantes (devrait être 0)
SELECT COUNT(*) as remaining_conversations FROM conversations;
SELECT COUNT(*) as remaining_participants FROM conversation_participants;
SELECT COUNT(*) as remaining_messages FROM messages;
```

### 3. Vérifier la suppression

Après l'exécution, les requêtes de vérification à la fin du script devraient retourner `0` pour toutes les tables :
- `remaining_conversations` : 0
- `remaining_participants` : 0
- `remaining_messages` : 0

### 4. Si CASCADE ne fonctionne pas

Si vous obtenez une erreur concernant les contraintes de clés étrangères, utilisez l'option 2 (suppression manuelle) :

1. Décommentez les lignes de l'option 2 dans le script
2. Commentez la ligne `DELETE FROM conversations CASCADE;`
3. Ré-exécutez le script

## Résultat

Après l'exécution :
- ✅ Toutes les conversations sont supprimées
- ✅ Tous les participants sont supprimés
- ✅ Tous les messages sont supprimés
- ✅ La base de données est propre et prête pour de nouvelles conversations

## Prochaines étapes

Après avoir nettoyé les conversations :

1. **Exécutez les fonctions SQL** (si ce n'est pas déjà fait) :
   - `check_existing_conversation_function.sql`
   - `create_conversation_function_improved.sql`

2. **Testez le système** :
   - Démarrez une nouvelle conversation avec quelqu'un
   - Vérifiez qu'une seule conversation est créée
   - Essayez de redémarrer une conversation avec la même personne
   - Vérifiez que la conversation existante est réutilisée

## Notes

- Les autres données (profils, posts, reels, etc.) ne sont **PAS** affectées par ce script
- Seules les conversations, participants et messages sont supprimés
- Vous pouvez recommencer à créer des conversations immédiatement après la suppression

