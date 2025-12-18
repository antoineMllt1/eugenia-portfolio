# Diagnostic - Problème de réinitialisation de mot de passe

## Problème observé
L'erreur "Le lien de réinitialisation est invalide ou a expiré" s'affiche même avec un lien valide.

## Causes possibles

### 1. Configuration Supabase Dashboard

**Vérifications à faire dans Supabase Dashboard :**

1. **URLs autorisées (Site URL / Redirect URLs)**
   - Aller dans : **Authentication > URL Configuration**
   - Vérifier que votre URL est dans la liste des **Redirect URLs**
   - Format attendu : `http://localhost:5173` (dev) ou `https://votre-domaine.com` (prod)
   - **Important** : L'URL doit correspondre EXACTEMENT à celle utilisée dans `redirectTo`

2. **Email Templates**
   - Aller dans : **Authentication > Email Templates > Reset Password**
   - Vérifier que le template contient bien le lien avec le token
   - Le lien devrait ressembler à : `{{ .ConfirmationURL }}`

3. **Expiration des tokens**
   - Par défaut : 1 heure
   - Vérifier dans : **Authentication > Settings > Password Reset**

### 2. Vérification de l'URL de redirection dans le code

Dans `src/components/auth/AuthDialog.tsx`, ligne 55 :
```typescript
const redirectUrl = `${window.location.origin}${window.location.pathname}#reset-password`
```

**Problème potentiel** : Cette URL doit être EXACTEMENT la même que celle configurée dans Supabase Dashboard.

**Solution** : Vérifier que :
- En développement : `http://localhost:5173#reset-password` est dans les Redirect URLs
- En production : `https://votre-domaine.com#reset-password` est dans les Redirect URLs

### 3. Format du token dans l'URL

Quand vous cliquez sur le lien dans l'email, l'URL devrait ressembler à :
```
http://localhost:5173#access_token=eyJ...&type=recovery&...
```

**Vérifications** :
1. Ouvrir la console du navigateur (F12)
2. Regarder les logs qui commencent par "Reset password -"
3. Vérifier que le hash contient bien `access_token=`

### 4. Configuration du client Supabase

Dans `src/lib/supabase.ts`, on a ajouté :
```typescript
auth: {
    detectSessionInUrl: true, // Important pour détecter les tokens dans le hash
}
```

**Vérification** : S'assurer que cette configuration est bien présente.

## Étapes de diagnostic

### Étape 1 : Vérifier les logs dans la console

1. Ouvrir la console du navigateur (F12)
2. Cliquer sur le lien de réinitialisation dans l'email
3. Regarder les messages qui commencent par "Reset password -"
4. Noter les erreurs éventuelles

### Étape 2 : Vérifier l'URL complète

1. Cliquer sur le lien dans l'email
2. Regarder l'URL complète dans la barre d'adresse
3. Vérifier qu'elle contient `#access_token=...`

### Étape 3 : Vérifier la configuration Supabase

1. Aller dans Supabase Dashboard
2. **Authentication > URL Configuration**
3. Vérifier que votre URL est dans la liste
4. Si ce n'est pas le cas, l'ajouter

### Étape 4 : Tester avec une URL absolue

Si le problème persiste, essayer de modifier temporairement `AuthDialog.tsx` :

```typescript
// Au lieu de :
const redirectUrl = `${window.location.origin}${window.location.pathname}#reset-password`

// Essayer :
const redirectUrl = `http://localhost:5173#reset-password` // Pour dev
// ou
const redirectUrl = `https://votre-domaine.com#reset-password` // Pour prod
```

## Solutions possibles

### Solution 1 : Ajouter l'URL dans Supabase Dashboard

1. Aller dans Supabase Dashboard > Authentication > URL Configuration
2. Ajouter votre URL dans "Redirect URLs"
3. Format : `http://localhost:5173` (sans le hash, Supabase l'ajoute automatiquement)

### Solution 2 : Vérifier que l'email est bien envoyé

1. Vérifier dans Supabase Dashboard > Authentication > Users
2. Vérifier les logs d'email dans Supabase Dashboard
3. Vérifier les spams dans votre boîte email

### Solution 3 : Utiliser une URL sans hash personnalisé

Modifier `AuthDialog.tsx` pour utiliser simplement l'origin :

```typescript
const redirectUrl = `${window.location.origin}`
```

Supabase ajoutera automatiquement le hash avec le token.

## Test après correction

1. Demander un nouveau lien de réinitialisation
2. Vérifier que l'email arrive (vérifier les spams)
3. Cliquer sur le lien
4. Vérifier dans la console les logs "Reset password -"
5. Le dialog devrait s'ouvrir sans erreur
6. Saisir le nouveau mot de passe
7. Vérifier que la mise à jour fonctionne

## Logs à surveiller

Dans la console, vous devriez voir :
- `Reset password - Hash détecté: ...`
- `Reset password - Traitement du token par Supabase...`
- `Reset password - Session créée: ...` ou `Reset password - Pas de session encore...`
- `Reset password - Tentative de mise à jour, hash: ...`
- `Reset password - Appel à updateUser...`

Si vous voyez des erreurs, les noter et les partager pour un diagnostic plus précis.

