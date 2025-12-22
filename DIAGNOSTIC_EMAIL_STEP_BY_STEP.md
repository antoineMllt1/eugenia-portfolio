# 🔍 Diagnostic étape par étape - Email de réinitialisation non reçu

## ✅ Étape 1 : Vérifier les logs dans la console

1. **Ouvrez la console du navigateur** (F12 ou Cmd+Option+I)
2. **Filtrez les logs** avec "Reset password"
3. **Demandez une réinitialisation de mot de passe**
4. **Vérifiez que vous voyez ces messages** :
   ```
   Reset password - Envoi de la demande pour: votre@email.com
   Reset password - URL de redirection: http://localhost:5173
   Reset password - Demande envoyée avec succès
   ```

**Si vous ne voyez PAS ces messages** → Le code ne s'exécute pas correctement
**Si vous voyez ces messages** → Le code fonctionne, le problème est dans Supabase

---

## ✅ Étape 2 : Vérifier si vous êtes en local ou production

### Si vous êtes en LOCAL (Supabase local)

Les emails **ne sont pas envoyés réellement** mais sont capturés par **Inbucket**.

1. **Vérifiez que Supabase local est démarré** :
   ```bash
   supabase status
   ```

2. **Ouvrez Inbucket** dans votre navigateur :
   - URL : `http://localhost:54324`
   - Tous les emails envoyés y apparaissent

3. **Si vous ne voyez pas d'email dans Inbucket** :
   - Vérifiez que Supabase local est bien démarré
   - Vérifiez les logs : `supabase logs`

### Si vous êtes en PRODUCTION (Supabase cloud)

Passez à l'étape 3.

---

## ✅ Étape 3 : Vérifier la configuration Supabase Dashboard

### 3.1 URLs de redirection (⭐ CRITIQUE)

1. Allez dans **Supabase Dashboard** > **Authentication** > **URL Configuration**
2. Dans **Redirect URLs**, vérifiez que votre URL est présente :
   - En développement : `http://localhost:5173`
   - En production : `https://votre-domaine.com`
3. **Important** : L'URL doit être EXACTEMENT la même (sans le hash `#`)
4. Si elle n'est pas là, **ajoutez-la** et cliquez sur **Save**

### 3.2 Site URL

1. Dans la même page, vérifiez **Site URL** :
   - En développement : `http://localhost:5173`
   - En production : `https://votre-domaine.com`
2. Si elle est incorrecte, **modifiez-la** et cliquez sur **Save**

### 3.3 Email Templates

1. Allez dans **Authentication** > **Email Templates** > **Reset Password**
2. Vérifiez que le template contient :
   ```
   {{ .ConfirmationURL }}
   ```
3. Si ce n'est pas le cas, **remplacez le lien** par `{{ .ConfirmationURL }}`

### 3.4 Settings d'email

1. Allez dans **Authentication** > **Settings**
2. Vérifiez que :
   - **Enable email confirmations** : Peut être désactivé (pas nécessaire pour reset password)
   - **Enable email change confirmations** : Peut être activé ou désactivé

---

## ✅ Étape 4 : Vérifier les spams

1. **Ouvrez votre boîte email**
2. **Vérifiez le dossier spam/courrier indésirable**
3. **Cherchez un email de** : `noreply@mail.app.supabase.io`
4. **Si vous trouvez l'email en spam** :
   - Marquez-le comme "Non spam"
   - Ajoutez `noreply@mail.app.supabase.io` à vos contacts

---

## ✅ Étape 5 : Vérifier les logs Supabase

1. Allez dans **Supabase Dashboard** > **Logs** > **Postgres Logs** ou **API Logs**
2. **Filtrez par** : "reset" ou "password"
3. **Cherchez les erreurs** éventuelles lors de l'envoi d'email

---

## ✅ Étape 6 : Tester avec un autre email

1. **Créez un compte de test** avec un autre email
2. **Demandez une réinitialisation** avec ce nouvel email
3. **Vérifiez si l'email arrive**

Si ça fonctionne avec un autre email → Le problème est spécifique à votre email
Si ça ne fonctionne pas → Le problème est général

---

## ✅ Étape 7 : Vérifier les limites Supabase

Les comptes **gratuits** de Supabase ont des limites sur l'envoi d'emails :
- **Rate limiting** : Nombre limité d'emails par heure/jour
- **Quota** : Nombre total d'emails par mois

1. Allez dans **Supabase Dashboard** > **Settings** > **Billing**
2. Vérifiez votre quota d'emails
3. Si vous avez atteint la limite, vous devrez attendre ou passer à un plan payant

---

## 🎯 Solution rapide - Checklist

- [ ] Les logs "Reset password -" apparaissent dans la console
- [ ] URL de redirection configurée dans Supabase Dashboard
- [ ] Site URL configurée dans Supabase Dashboard
- [ ] Template d'email contient `{{ .ConfirmationURL }}`
- [ ] Vérifié les spams
- [ ] Si en local, vérifié Inbucket sur `http://localhost:54324`
- [ ] Testé avec un autre email
- [ ] Vérifié les logs Supabase pour les erreurs

---

## 🆘 Si rien ne fonctionne

1. **Vérifiez votre projet Supabase** :
   - Allez dans **Project Settings** > **General**
   - Vérifiez que le projet est actif

2. **Contactez le support Supabase** :
   - Si vous avez un compte payant, contactez le support
   - Les comptes gratuits ont des limites strictes

3. **Alternative** : Utilisez un service d'email externe (Resend, SendGrid, etc.) avec une Edge Function Supabase

---

## 📝 Note importante

Le code masque volontairement si l'email existe ou non pour des raisons de sécurité. Même si l'email n'existe pas dans la base de données, vous verrez le message "Si cette adresse email existe...". C'est normal et sécurisé.

