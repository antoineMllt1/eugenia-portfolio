# GUIDE : Messagerie (conversations & messages)

Ce guide décrit comment créer les tables et les règles pour avoir des conversations et messages persistés (façon Instagram) dans Supabase.

---
## 1) Ce qui sera créé
- `conversations` : chaque fil de discussion.
- `conversation_participants` : participants d’une conversation.
- `messages` : messages liés à une conversation.
- RLS : accès uniquement si l’utilisateur est participant ; insertion limitée à l’auteur/participant.
- Index et trigger pour les timestamps.

---
## 2) Exécuter la migration SQL
1. Ouvre Supabase → **SQL Editor** → **New query**.
2. Colle le contenu de `supabase_migration_messages.sql`.
3. Clique **Run**.

Le script crée :
- Tables : `conversations`, `conversation_participants`, `messages`.
- Index : sur participants et messages.
- RLS : sécurité par participant.
- Trigger : met à jour `updated_at` sur `conversations`.

---
## 3) Structure des tables (résumé)
- `conversations`
  - `id` UUID PK, `is_group` bool, `created_at`, `updated_at`.
- `conversation_participants`
  - `id` UUID PK, `conversation_id` FK, `user_id` FK, `role`, `created_at`, unique `(conversation_id, user_id)`.
- `messages`
  - `id` UUID PK, `conversation_id` FK, `sender_id` FK, `content`, `created_at`, `seen_at`.

---
## 4) RLS (principe)
- Conversations : SELECT/UPDATE si participant.
- Participants : SELECT/INSERT/DELETE seulement pour soi.
- Messages : SELECT si participant ; INSERT si participant et `sender_id = auth.uid()`.
- Suppression/édition des messages limitée à l’auteur (optionnel mais inclus).

---
## 5) Étapes côté Front (à intégrer ensuite)
- Charger les conversations de l’utilisateur (via `conversation_participants`).
- Afficher le dernier message (ORDER BY `created_at` DESC LIMIT 1).
- Ouvrir une conversation → charger ses messages (ORDER BY `created_at` ASC).
- Envoyer un message → insert dans `messages`, append optimiste au state.
- Créer une nouvelle conversation → insert dans `conversations` + `conversation_participants` (utilisateur + cible), puis ouvrir.
- (Optionnel) Supabase Realtime sur `messages` filtré par `conversation_id` pour live update.

---
## 6) Vérification après exécution
- Les tables existent dans le schéma `public`.
- Les politiques RLS sont actives.
- Les index sont créés.
- Les inserts/lectures fonctionnent en tant qu’utilisateur connecté.

---
## 7) Fichier SQL
Le fichier à exécuter est : `supabase_migration_messages.sql`

---
## 8) Prochaines étapes possibles
- Lier l’UI de messagerie au back-end Supabase (remplacer les données mock par de vraies requêtes).
- Ajouter le Realtime pour les messages entrants.
- Ajouter les états “vu” / “non lu” (champ `seen_at` déjà prévu).


