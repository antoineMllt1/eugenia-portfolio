# 🔧 Solution : Email de réinitialisation non reçu (après correction URL)

## ✅ Vérifications à faire maintenant

### 1. Vérifier si vous êtes en LOCAL ou PRODUCTION

**En LOCAL (Supabase local)** :
- Les emails ne sont PAS envoyés réellement
- Ils sont capturés par **Inbucket** : `http://localhost:54324`
- Ouvrez cette URL dans votre navigateur pour voir les emails

**En PRODUCTION (Supabase cloud)** :
- Les emails sont envoyés réellement
- Continuez avec les étapes suivantes

---

### 2. Vérifier les logs dans la console (IMPORTANT)

1. **Ouvrez la console** (F12)
2. **Filtrez avec "Reset password"**
3. **Demandez une réinitialisation**
4. **Vérifiez les messages** :
   - ✅ `Reset password - Envoi de la demande pour: votre@email.com`
   - ✅ `Reset password - URL de redirection: http://...`
   - ✅ `Reset password - Demande envoyée avec succès`

**Si vous voyez "Demande envoyée avec succès"** → Supabase a accepté la demande, mais l'email n'est pas envoyé (problème côté Supabase)

**Si vous voyez une erreur** → Notez le message exact

---

### 3. Vérifier les logs Supabase Dashboard

1. Allez dans **Supabase Dashboard** > **Logs** > **Postgres Logs**
2. **Filtrez par** : "reset" ou "password" ou "email"
3. **Cherchez les erreurs** lors de l'envoi d'email
4. **Regardez aussi** : **API Logs** pour voir les requêtes

---

### 4. Vérifier le template d'email dans Supabase

1. Allez dans **Supabase Dashboard** > **Authentication** > **Email Templates**
2. Cliquez sur **Reset Password**
3. **Vérifiez que le template contient** :
   ```
   {{ .ConfirmationURL }}
   ```
4. **Si ce n'est pas le cas** :
   - Remplacez le lien par : `{{ .ConfirmationURL }}`
   - Sauvegardez

---

### 5. Vérifier les limites Supabase (compte gratuit)

Les comptes **gratuits** de Supabase ont des **limites strictes** sur l'envoi d'emails :
- **Rate limiting** : Nombre limité d'emails par heure/jour
- **Quota mensuel** : Nombre total d'emails limité

**Pour vérifier** :
1. Allez dans **Supabase Dashboard** > **Settings** > **Billing**
2. Vérifiez votre quota d'emails
3. Si vous avez atteint la limite, vous devrez :
   - Attendre (les limites se réinitialisent)
   - Passer à un plan payant

---

### 6. Vérifier les spams (IMPORTANT)

1. **Ouvrez votre boîte email**
2. **Vérifiez le dossier spam/courrier indésirable**
3. **Cherchez un email de** : `noreply@mail.app.supabase.io`
4. **Si vous trouvez l'email en spam** :
   - Marquez-le comme "Non spam"
   - Ajoutez `noreply@mail.app.supabase.io` à vos contacts
   - Vérifiez aussi les dossiers "Promotions" ou "Autres" (Gmail)

---

### 7. Vérifier que l'email existe dans Supabase

1. Allez dans **Supabase Dashboard** > **Authentication** > **Users**
2. **Cherchez l'email** que vous avez utilisé
3. **Si l'email n'existe pas** :
   - Supabase ne peut pas envoyer d'email à un utilisateur inexistant
   - Le code masque cette erreur pour des raisons de sécurité
   - Créez d'abord un compte avec cet email

---

### 8. Tester avec un autre email

1. **Créez un compte de test** avec un autre email
2. **Demandez une réinitialisation** avec ce nouvel email
3. **Vérifiez si l'email arrive**

**Si ça fonctionne avec un autre email** → Le problème est spécifique à votre email
**Si ça ne fonctionne pas** → Le problème est général (configuration Supabase)

---

### 9. Vérifier la configuration d'email Supabase

1. Allez dans **Supabase Dashboard** > **Project Settings** > **Auth**
2. Vérifiez que :
   - **Enable email confirmations** : Peut être désactivé (pas nécessaire pour reset password)
   - **Enable email change confirmations** : Peut être activé ou désactivé
   - **SMTP Settings** : Si vous utilisez un SMTP personnalisé, vérifiez la configuration

---

### 10. Si vous êtes en PRODUCTION, vérifier les DNS

Si vous utilisez un domaine personnalisé, vérifiez que les DNS sont configurés :
- **SPF** : Autorise Supabase à envoyer des emails depuis votre domaine
- **DKIM** : Signature cryptographique pour authentifier les emails
- **DMARC** : Politique de gestion des emails non authentifiés

Ces configurations se font dans **Supabase Dashboard** > **Settings** > **Authentication** > **SMTP Settings**

---

## 🎯 Checklist rapide

- [ ] Vérifié si en local (Inbucket : `http://localhost:54324`)
- [ ] Vérifié les logs console ("Reset password - Demande envoyée avec succès")
- [ ] Vérifié les logs Supabase Dashboard
- [ ] Vérifié le template d'email contient `{{ .ConfirmationURL }}`
- [ ] Vérifié les limites/quota Supabase
- [ ] Vérifié les spams/courrier indésirable
- [ ] Vérifié que l'email existe dans Supabase Users
- [ ] Testé avec un autre email
- [ ] Vérifié la configuration SMTP (si domaine personnalisé)

---

## 🆘 Solutions alternatives

### Solution 1 : Utiliser un service d'email externe

Si Supabase ne peut pas envoyer d'emails, vous pouvez utiliser un service externe (Resend, SendGrid, etc.) avec une Edge Function Supabase.

### Solution 2 : Vérifier les logs API Supabase

1. Allez dans **Supabase Dashboard** > **Logs** > **API Logs**
2. Filtrez par "auth" ou "reset"
3. Cherchez les requêtes POST vers `/auth/v1/recover`
4. Vérifiez les réponses (200 = succès, 4xx/5xx = erreur)

### Solution 3 : Contactez le support Supabase

Si vous avez un compte payant et que rien ne fonctionne :
1. Allez dans **Supabase Dashboard** > **Support**
2. Créez un ticket de support
3. Fournissez :
   - Le message d'erreur (si présent)
   - Les logs Supabase
   - L'URL de redirection configurée

---

## 📝 Informations à noter

Quand vous testez, notez :
1. **L'URL de redirection** que vous voyez dans la console
2. **Le message exact** dans la console (succès ou erreur)
3. **L'heure** de la demande (pour vérifier les logs Supabase)
4. **L'email utilisé** (pour vérifier s'il existe dans Supabase Users)
5. **Le résultat** (email reçu ou non, spam ou non)

Ces informations aideront à diagnostiquer le problème plus précisément.

