# Guide : Corriger la suppression de posts

## Problème

Lorsque vous supprimez un post en tant qu'admin, il réapparaît après le rechargement de la page. Cela est dû à l'absence de politiques RLS (Row Level Security) permettant la suppression de posts.

## Solution

Exécutez le script SQL `fix_posts_delete_rls.sql` dans votre Supabase SQL Editor.

## Étapes

### 1. Ouvrir le SQL Editor dans Supabase

1. Allez sur votre projet Supabase
2. Cliquez sur **SQL Editor** dans le menu de gauche
3. Cliquez sur **New query**

### 2. Exécuter le script

1. Copiez le contenu du fichier `fix_posts_delete_rls.sql`
2. Collez-le dans l'éditeur SQL
3. Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter` / `Cmd+Enter`)

### 3. Vérifier que les politiques ont été créées

Le script affichera automatiquement les politiques créées. Vous devriez voir :
- `Users can delete their own posts` - Permet aux utilisateurs de supprimer leurs propres posts
- `Admins can delete any post` - Permet aux admins de supprimer n'importe quel post

### 4. Tester la suppression

1. Rechargez votre application
2. Connectez-vous en tant qu'admin
3. Essayez de supprimer un post
4. Rechargez la page - le post ne devrait plus réapparaître

## Politiques créées

### 1. Utilisateurs peuvent supprimer leurs propres posts
```sql
CREATE POLICY "Users can delete their own posts"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

### 2. Admins peuvent supprimer n'importe quel post
```sql
CREATE POLICY "Admins can delete any post"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );
```

## Vérification

Pour vérifier que les politiques sont actives :

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'posts'
ORDER BY policyname;
```

## Notes

- Les politiques RLS sont nécessaires pour la sécurité des données
- Les admins sont identifiés par `is_admin = true` OU `role = 'admin'` dans la table `profiles`
- La suppression en cascade supprime automatiquement les likes, commentaires et posts sauvegardés liés

