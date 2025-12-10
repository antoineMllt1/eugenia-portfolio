# 🎥 Guide : Support des vidéos dans les Stories

## ✅ Fonctionnalités ajoutées

Vous pouvez maintenant ajouter des **vidéos** en plus des images dans vos stories !

### Ce qui a été modifié :

1. ✅ **Création de stories** : Le formulaire accepte maintenant les images ET les vidéos
2. ✅ **Affichage des stories** : Les vidéos sont automatiquement détectées et affichées avec un lecteur vidéo
3. ✅ **Base de données** : Ajout de colonnes `media_url` et `media_type` pour supporter les deux types de médias
4. ✅ **Rétrocompatibilité** : Les anciennes stories avec images continuent de fonctionner

## 📋 Étapes d'installation

### 1. Exécuter la migration SQL

Pour activer le support vidéo, vous devez exécuter la migration SQL dans Supabase :

1. **Ouvrez votre tableau de bord Supabase**
   - Allez sur [https://supabase.com](https://supabase.com)
   - Connectez-vous à votre projet

2. **Accédez à l'éditeur SQL**
   - Dans le menu de gauche, cliquez sur **"SQL Editor"**
   - Cliquez sur **"New query"** pour créer une nouvelle requête

3. **Copiez et collez le contenu du fichier de migration**
   - Ouvrez le fichier `supabase_migration_stories_video.sql` dans votre projet
   - Copiez tout son contenu
   - Collez-le dans l'éditeur SQL de Supabase

4. **Exécutez la migration**
   - Cliquez sur le bouton **"Run"** (ou appuyez sur `Ctrl+Enter`)
   - Attendez la confirmation que la requête a été exécutée avec succès

5. **Vérifiez les colonnes**
   - Dans le menu de gauche, allez dans **"Table Editor"**
   - Sélectionnez la table `stories`
   - Vous devriez voir les nouvelles colonnes `media_url` et `media_type`

## 🎬 Comment utiliser

### Créer une story avec une vidéo

1. Cliquez sur le bouton **"+"** pour créer une nouvelle story
2. Dans le formulaire, cliquez sur la zone de téléchargement
3. **Sélectionnez une vidéo** (formats supportés : MP4, WebM, OGG, MOV)
4. Un aperçu de la vidéo s'affiche avec des contrôles de lecture
5. Ajoutez un titre optionnel
6. Cliquez sur **"Share Story"**

### Créer une story avec une image

Le processus reste identique, mais vous sélectionnez une image au lieu d'une vidéo.

## 📝 Détails techniques

### Colonnes ajoutées à la table `stories`

- **`media_url`** : URL du fichier média (image ou vidéo)
- **`media_type`** : Type de média (`'image'` ou `'video'`)

### Rétrocompatibilité

- Les anciennes stories utilisent toujours `image_url` et fonctionnent normalement
- Le code détecte automatiquement le type de média et affiche soit une image, soit une vidéo
- Les stories existantes sont automatiquement marquées comme `media_type = 'image'`

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
4. Assurez-vous que le fichier vidéo n'est pas trop volumineux (recommandé : < 50 MB)

### Erreur lors de l'upload

1. Vérifiez que le bucket `portfolio-media` existe dans Supabase Storage
2. Vérifiez les permissions du bucket
3. Vérifiez la taille du fichier (limite Supabase par défaut)

### Les anciennes stories ne s'affichent plus

Cela ne devrait pas arriver grâce à la rétrocompatibilité. Si c'est le cas :
1. Vérifiez que la migration a bien copié `image_url` vers `media_url`
2. Exécutez manuellement : `UPDATE stories SET media_url = image_url WHERE media_url IS NULL;`

## ✨ Fonctionnalités futures possibles

- Compression automatique des vidéos
- Filtres vidéo
- Édition vidéo basique
- Miniatures personnalisées pour les vidéos
- Support de la lecture automatique en boucle

---

**Note** : Les vidéos sont stockées dans le même bucket Supabase Storage que les images (`portfolio-media`).

