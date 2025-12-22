# Bug : Pas d'email reçu pour la réinitialisation de mot de passe

## 🔍 Diagnostic du problème

Quand vous demandez une réinitialisation de mot de passe, vous ne recevez pas d'email. Voici les causes possibles et les solutions.

## ✅ Causes principales

### 1. **Configuration Supabase Dashboard - URLs de redirection** (⭐ Plus probable)

Supabase ne peut pas envoyer d'email si l'URL de redirection n'est pas autorisée.

**Solution :**
1. Allez dans votre **Supabase Dashboard**
2. Naviguez vers **Authentication** > **URL Configuration**
3. Dans **Redirect URLs**, ajoutez votre URL :
   - En développement : `http://localhost:5173`
   - En production : `https://votre-domaine.com`
4. **Important** : L'URL doit correspondre EXACTEMENT à celle utilisée dans le code (sans le hash `#`, Supabase l'ajoute automatiquement)
5. Cliquez sur **Save**

**Vérification dans le code :**
```typescript
// src/components/auth/AuthDialog.tsx ligne 56
const redirectUrl = `${window.location.origin}${window.location.pathname}`
// Si vous êtes sur http://localhost:5173, cela donne : http://localhost:5173
```

### 2. **Service d'email Supabase non configuré ou désactivé**

Par défaut, Supabase utilise son propre service d'email, mais il peut avoir des limites ou être désactivé.

**Solution :**
1. Allez dans **Supabase Dashboard** > **Authentication** > **Settings**
2. Vérifiez que **Enable email confirmations** est activé si nécessaire
3. Vérifiez **Email Templates** > **Reset Password** - le template doit contenir `{{ .ConfirmationURL }}`
4. Si vous utilisez un domaine personnalisé, vérifiez que les DNS (SPF, DKIM, DMARC) sont configurés

### 3. **Emails en spam** 

Les emails peuvent être bloqués par le filtre anti-spam.

**Solution :**
- Vérifiez votre dossier **spam/courrier indésirable**
- Si vous utilisez Gmail, vérifiez aussi **Tous les messages** et **Promotions**
- Ajoutez `noreply@mail.app.supabase.io` à vos contacts

### 4. **Environnement local - Emails dans Inbucket**

Si vous utilisez Supabase en local (`supabase start`), les emails **ne sont pas envoyés réellement** mais sont capturés par **Inbucket**.

**Solution :**
1. Vérifiez l'interface Inbucket : `http://localhost:54324`
2. Tous les emails envoyés y apparaissent
3. Cliquez sur l'email pour voir son contenu et le lien de réinitialisation

### 5. **Rate limiting - Trop de tentatives**

Supabase limite le nombre d'emails envoyés pour éviter le spam.

**Solution :**
- Attendez quelques minutes avant de réessayer
- Le message d'erreur dans la console indiquera "rate limit" ou "too many"

### 6. **Erreur silencieuse dans le code**

Le code actuel masque les erreurs pour des raisons de sécurité. Vérifiez la console du navigateur.

**Solution :**
1. Ouvrez la console du navigateur (F12)
2. Filtrez les logs avec "Reset password"
3. Regardez les messages d'erreur éventuels
4. Le code amélioré log maintenant :
   - `Reset password - Envoi de la demande pour: email@example.com`
   - `Reset password - URL de redirection: http://...`
   - `Reset password error: { message, status, name }`

## 🔧 Améliorations apportées au code

J'ai amélioré le code dans `src/components/auth/AuthDialog.tsx` pour :
- ✅ Mieux gérer les erreurs avec des messages spécifiques
- ✅ Logger plus d'informations pour le debug (console)
- ✅ Gérer correctement l'état `loading` pour éviter les états bloqués
- ✅ Afficher des messages d'erreur clairs si l'envoi échoue vraiment

## 📋 Checklist de vérification

- [ ] URL de redirection configurée dans Supabase Dashboard
- [ ] Vérifier les spams/courrier indésirable
- [ ] Vérifier la console du navigateur pour les erreurs
- [ ] Si en local, vérifier Inbucket sur `http://localhost:54324`
- [ ] Vérifier que le template d'email contient `{{ .ConfirmationURL }}`
- [ ] Vérifier que le service d'email est activé dans Supabase

## 🧪 Test après correction

1. Ouvrez la console du navigateur (F12)
2. Demandez une réinitialisation de mot de passe
3. Vérifiez les logs dans la console :
   ```
   Reset password - Envoi de la demande pour: votre@email.com
   Reset password - URL de redirection: http://localhost:5173
   Reset password - Demande envoyée avec succès
   ```
4. Si vous voyez une erreur, notez le message exact
5. Vérifiez votre boîte email (et spam)
6. Si en local, vérifiez Inbucket

## 🆘 Si le problème persiste

1. **Vérifiez les logs Supabase** :
   - Dashboard > Logs > Postgres Logs ou API Logs
   - Cherchez les erreurs liées à l'envoi d'email

2. **Testez avec un autre email** :
   - Utilisez un email différent pour voir si c'est spécifique à un email

3. **Vérifiez votre configuration Supabase** :
   - Project Settings > API
   - Vérifiez que les variables d'environnement sont correctes

4. **Contactez le support Supabase** :
   - Si vous avez un compte payant, contactez le support
   - Les comptes gratuits ont des limites sur l'envoi d'emails

## 📝 Notes importantes

- Le code masque volontairement si l'email existe ou non (sécurité)
- Même si l'email n'existe pas, vous verrez le message "Si cette adresse email existe..."
- Les erreurs sont loggées dans la console pour le debug
- En production, assurez-vous d'avoir configuré les DNS (SPF, DKIM, DMARC) pour votre domaine

