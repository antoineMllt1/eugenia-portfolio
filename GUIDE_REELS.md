# 🎬 Guide : Support des Reels (Vidéos)

## ✅ Fonctionnalités ajoutées

Vous pouvez maintenant créer et partager des **Reels** (vidéos) dans votre application !

### Ce qui a été modifié :

1. ✅ **Création de Reels** : Nouveau composant `CreateReelDialog` pour uploader des vidéos
2. ✅ **Affichage des Reels** : Section Reels affiche maintenant les vrais reels depuis la base de données
3. ✅ **Base de données** : Ajout de colonnes `video_url` et `post_type` dans la table `posts`
4. ✅ **Interactions** : Likes, commentaires et sauvegarde fonctionnent pour les reels
5. ✅ **Son activé** : Les vidéos démarrent avec le son activé (quand le navigateur le permet)

## 📋 Étapes d'installation

### 1. Exécuter la migration SQL

Pour activer le support des Reels, vous devez exécuter la migration SQL dans Supabase :

1. **Ouvrez votre tableau de bord Supabase**
   - Allez sur [https://supabase.com](https://supabase.com)
   - Connectez-vous à votre projet

2. **Accédez à l'éditeur SQL**
   - Dans le menu de gauche, cliquez sur **"SQL Editor"**
   - Cliquez sur **"New query"** pour créer une nouvelle requête

3. **Copiez et collez le contenu du fichier de migration**
   - Ouvrez le fichier `supabase_migration_reels.sql` dans votre projet
   - Copiez tout son contenu
   - Collez-le dans l'éditeur SQL de Supabase

4. **Exécutez la migration**
   - Cliquez sur le bouton **"Run"** (ou appuyez sur `Ctrl+Enter`)
   - Attendez la confirmation que la requête a été exécutée avec succès

5. **Vérifiez les colonnes**
   - Dans le menu de gauche, allez dans **"Table Editor"**
   - Sélectionnez la table `posts`
   - Vous devriez voir les nouvelles colonnes `video_url` et `post_type`

## 🎬 Comment utiliser

### Créer un Reel

1. Cliquez sur le bouton **"+"** dans la barre de navigation
2. Dans le modal "Create New", cliquez sur **"Reel"**
3. **Sélectionnez une vidéo** (formats supportés : MP4, WebM, OGG, MOV)
4. Un aperçu de la vidéo s'affiche avec des contrôles de lecture
5. Ajoutez un titre et une description (optionnels)
6. Cliquez sur **"Share Reel"**

### Voir les Reels

1. Cliquez sur l'icône **"Reels"** dans la barre de navigation
2. Les reels s'affichent en plein écran avec scroll vertical
3. Cliquez sur les boutons d'interaction (Like, Comment, Save, Share)

## 📝 Détails techniques

### Colonnes ajoutées à la table `posts`

- **`video_url`** : URL du fichier vidéo (pour les reels uniquement)
- **`post_type`** : Type de post (`'post'` pour les images, `'reel'` pour les vidéos)

### Séparation Posts / Reels

- Les **posts** (images) sont affichés dans l'onglet "Home"
- Les **reels** (vidéos) sont affichés dans l'onglet "Reels"
- Les deux utilisent la même table `posts` mais sont filtrés par `post_type`

### Formats vidéo supportés

- MP4 (recommandé)
- WebM
- OGG
- MOV

## 🔧 Dépannage

### La vidéo ne s'affiche pas

1. Vérifiez que la migration SQL a été exécutée correctement
2. Vérifiez que le format vidéo est supporté
3. Vérifiez la console du navigateur pour les erreurs
4. Assurez-vous que le fichier vidéo n'est pas trop volumineux (recommandé : < 100 MB)

### Erreur lors de l'upload

1. Vérifiez que le bucket `portfolio-media` existe dans Supabase Storage
2. Vérifiez les permissions du bucket
3. Vérifiez la taille du fichier (limite Supabase par défaut)

### Les reels ne s'affichent pas

1. Vérifiez que `post_type = 'reel'` dans la base de données
2. Vérifiez que `video_url` est rempli
3. Vérifiez la console du navigateur pour les erreurs

## ✨ Fonctionnalités

- ✅ Upload de vidéos
- ✅ Aperçu avant publication
- ✅ Affichage en plein écran avec scroll vertical
- ✅ Son activé automatiquement
- ✅ Interactions (Like, Comment, Save, Share)
- ✅ Navigation vers le profil du créateur

---

**Note** : Les reels sont stockés dans le même bucket Supabase Storage que les images (`portfolio-media`).

