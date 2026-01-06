# Guide : Restriction des domaines email pour l'inscription

## ✅ Implémentation actuelle

La validation du domaine email est maintenant implémentée **côté client** dans `src/components/auth/AuthDialog.tsx`.

### Fonctionnalités :
- ✅ Validation automatique du domaine email avant l'inscription
- ✅ Seules les adresses `@eugeniaschool.com` et `@albertschool.com` sont acceptées
- ✅ Message d'erreur clair pour l'utilisateur
- ✅ Indication visuelle dans le placeholder du champ email

### Comment ça fonctionne :
1. L'utilisateur saisit son email lors de l'inscription
2. Avant d'envoyer la requête à Supabase, le domaine est vérifié
3. Si le domaine n'est pas autorisé, un message d'erreur s'affiche et l'inscription est bloquée

## 🔒 Sécurité supplémentaire (optionnel mais recommandé)

Pour une sécurité maximale, vous pouvez également ajouter une validation **côté serveur** dans Supabase. Cela empêchera les utilisateurs de contourner la validation côté client.

### Option 1 : Hook Supabase (Recommandé)

Créez un hook Edge Function dans Supabase qui vérifie le domaine avant de créer le compte.

### Option 2 : Trigger PostgreSQL

Créez un trigger qui vérifie le domaine lors de l'insertion dans `auth.users`.

**Exemple de trigger SQL :**

```sql
-- Fonction pour vérifier le domaine email
CREATE OR REPLACE FUNCTION check_email_domain()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email NOT LIKE '%@eugeniaschool.com' 
     AND NEW.email NOT LIKE '%@albertschool.com' THEN
    RAISE EXCEPTION 'Seules les adresses email @eugeniaschool.com et @albertschool.com sont autorisées';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger (nécessite les permissions admin Supabase)
-- Note: Cette approche nécessite d'accéder à la table auth.users
-- qui peut nécessiter des permissions spéciales
```

### Option 3 : Hook Auth (Meilleure approche)

Dans Supabase Dashboard :
1. Allez dans **Authentication** → **Hooks**
2. Créez un nouveau hook pour l'événement `user.created`
3. Ajoutez une validation du domaine email

## 📝 Notes importantes

- La validation côté client est suffisante pour la plupart des cas d'usage
- La validation côté serveur ajoute une couche de sécurité supplémentaire
- Les utilisateurs avec des emails non autorisés verront un message d'erreur clair
- La connexion (login) n'est pas affectée - seules les nouvelles inscriptions sont restreintes

## 🧪 Test

Pour tester la restriction :
1. Essayez de créer un compte avec `test@gmail.com` → devrait être bloqué
2. Essayez de créer un compte avec `test@eugeniaschool.com` → devrait fonctionner
3. Essayez de créer un compte avec `test@albertschool.com` → devrait fonctionner

