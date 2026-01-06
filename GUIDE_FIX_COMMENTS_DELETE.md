# Guide : Corriger la suppression de commentaires pour les admins

## Problème

Les admins doivent pouvoir supprimer n'importe quel commentaire, mais cela nécessite des politiques RLS (Row Level Security) appropriées dans Supabase.

## Solution

Exécutez le script SQL `fix_comments_delete_rls.sql` dans votre Supabase SQL Editor.

## Étapes

### 1. Ouvrir le SQL Editor dans Supabase

1. Allez sur votre projet Supabase
2. Cliquez sur **SQL Editor** dans le menu de gauche
3. Cliquez sur **New query**

### 2. Exécuter le script

1. Copiez le contenu du fichier `fix_comments_delete_rls.sql`
2. Collez-le dans l'éditeur SQL
3. Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter` / `Cmd+Enter`)

### 3. Vérifier que les politiques ont été créées

Le script affichera automatiquement les politiques créées. Vous devriez voir :
- `Users can delete their own comments` - Permet aux utilisateurs de supprimer leurs propres commentaires
- `Admins can delete any comment` - Permet aux admins de supprimer n'importe quel commentaire

### 4. Tester la suppression

1. Rechargez votre application
2. Connectez-vous en tant qu'admin
3. Ouvrez un post avec des commentaires
4. Survolez un commentaire - un bouton de suppression devrait apparaître
5. Cliquez sur le bouton et confirmez la suppression
6. Le commentaire devrait disparaître immédiatement

## Politiques créées

### 1. Utilisateurs peuvent supprimer leurs propres commentaires
```sql
CREATE POLICY "Users can delete their own comments"
  ON public.comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

### 2. Admins peuvent supprimer n'importe quel commentaire
```sql
CREATE POLICY "Admins can delete any comment"
  ON public.comments
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
WHERE tablename = 'comments'
ORDER BY policyname;
```

## Fonctionnalités implémentées

- ✅ Bouton de suppression visible uniquement pour les admins
- ✅ Apparition du bouton au survol du commentaire
- ✅ Confirmation avant suppression
- ✅ Mise à jour automatique du compteur de commentaires
- ✅ Mise à jour immédiate de l'interface après suppression
- ✅ Gestion d'erreurs avec messages informatifs

## Notes

- Les politiques RLS sont nécessaires pour la sécurité des données
- Les admins sont identifiés par `is_admin = true` OU `role = 'admin'` dans la table `profiles`
- La suppression est irréversible - assurez-vous de confirmer avant de supprimer

