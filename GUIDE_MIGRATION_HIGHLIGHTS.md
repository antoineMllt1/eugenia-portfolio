# 🔧 Guide de résolution : Erreur "Could not find the table 'public.highlights'"

## Problème
L'erreur `Could not find the table 'public.highlights' in the schema cache` apparaît lorsque vous essayez de créer une story à la une (highlight).

## Solution : Exécuter la migration SQL

La table `highlights` n'existe pas encore dans votre base de données Supabase. Vous devez l'exécuter manuellement.

### Étapes à suivre :

1. **Ouvrez votre tableau de bord Supabase**
   - Allez sur [https://supabase.com](https://supabase.com)
   - Connectez-vous à votre projet

2. **Accédez à l'éditeur SQL**
   - Dans le menu de gauche, cliquez sur **"SQL Editor"** (ou "Éditeur SQL")
   - Cliquez sur **"New query"** (ou "Nouvelle requête") pour créer une nouvelle requête

3. **Copiez et collez le contenu du fichier de migration**
   - Ouvrez le fichier `supabase_migration_highlights.sql` dans votre projet
   - Copiez tout son contenu
   - Collez-le dans l'éditeur SQL de Supabase

4. **Exécutez la migration**
   - Cliquez sur le bouton **"Run"** (ou appuyez sur `Ctrl+Enter` / `Cmd+Enter` sur Mac)
   - Attendez la confirmation que la requête a été exécutée avec succès
   - Vous devriez voir un message de succès en bas de l'éditeur

5. **Vérifiez que la table a été créée**
   - Dans le menu de gauche, allez dans **"Table Editor"** (ou "Éditeur de table")
   - Vous devriez voir la table `highlights` dans la liste, **au même endroit que vos autres tables** (`profiles`, `posts`, `stories`, `contact_message`, etc.)
   - Toutes ces tables sont dans le schéma **`public`** (c'est le schéma par défaut)

### 📍 Emplacement de la table

La table `highlights` sera créée dans le **schéma `public`**, exactement au même endroit que :
- ✅ `profiles`
- ✅ `posts`
- ✅ `stories`
- ✅ `contact_message`
- ✅ Toutes vos autres tables

C'est l'emplacement correct ! Le code de l'application cherche automatiquement dans le schéma `public`.

### Contenu de la migration

La migration crée :
- ✅ La table `highlights` avec les colonnes nécessaires
- ✅ Un index pour améliorer les performances
- ✅ Un trigger pour mettre à jour automatiquement `updated_at`
- ✅ Les politiques de sécurité (RLS) pour protéger les données

### Après la migration

Une fois la migration exécutée :
1. Rafraîchissez votre application
2. Essayez à nouveau de créer une story à la une
3. L'erreur devrait être résolue !

### Vérification

Pour vérifier que tout fonctionne :
```sql
-- Dans l'éditeur SQL de Supabase, exécutez :
SELECT * FROM highlights LIMIT 1;
```

Si cette requête s'exécute sans erreur, la table existe et est prête à être utilisée.

---

**Note** : Si vous rencontrez toujours des problèmes après avoir exécuté la migration, vérifiez :
- Que vous êtes connecté au bon projet Supabase
- Que les variables d'environnement `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont correctement configurées
- Les logs de la console du navigateur pour d'autres erreurs potentielles

