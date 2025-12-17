-- Script pour supprimer toutes les conversations, participants et messages
-- ⚠️ ATTENTION : Ce script supprime TOUTES les conversations et tous les messages
-- Assurez-vous de vouloir vraiment supprimer toutes les données avant d'exécuter ce script

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

