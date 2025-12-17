# Guide : Notifications Email pour les Conversations

Ce guide explique comment configurer l'envoi d'emails de notification lorsqu'une nouvelle conversation est créée.

> **📌 Pour un guide simplifié, voir [GUIDE_EMAIL_SIMPLE.md](./GUIDE_EMAIL_SIMPLE.md)**

## ✅ Fonctionnalités Implémentées

- ✅ Bouton "Message" dans le profil public
- ✅ Ouverture automatique de la page des messages avec la conversation
- ✅ Envoi d'email de notification à la personne concernée
- ✅ Edge Function Supabase pour gérer l'envoi d'emails

## 📋 Prérequis

1. Un compte [Resend](https://resend.com) (gratuit jusqu'à 3000 emails/mois)
2. Un domaine vérifié dans Resend (ou utiliser l'email de test)
3. Accès à Supabase Dashboard pour configurer les secrets

## 🚀 Configuration

### Étape 1 : Créer un compte Resend

1. Allez sur [https://resend.com](https://resend.com)
2. Créez un compte gratuit
3. Vérifiez votre domaine (ou utilisez l'email de test fourni)

### Étape 2 : Obtenir votre API Key

1. Dans Resend Dashboard, allez dans **API Keys**
2. Cliquez sur **Create API Key**
3. Donnez-lui un nom (ex: "Eugeniagram")
4. Copiez la clé API (elle ne sera affichée qu'une seule fois)

### Étape 3 : Déployer l'Edge Function Supabase

✅ **Le fichier `config.toml` a déjà été créé automatiquement !**

1. **Trouvez votre Project Reference ID** :
   - Allez dans votre **Supabase Dashboard**
   - Cliquez sur **Settings** (⚙️) > **General**
   - Copiez votre **Reference ID** (ex: `abcdefghijklmnop`)

2. **Liez votre projet** :
   ```bash
   npm run supabase:link
   ```
   Puis entrez votre **Reference ID** quand demandé.

   **OU** si vous préférez utiliser npx directement :
   ```bash
   npx supabase link --project-ref votre-project-ref
   ```

3. **Déployez la fonction** :
   ```bash
   npm run supabase:deploy
   ```

   **OU** si vous préférez utiliser npx directement :
   ```bash
   npx supabase functions deploy send-conversation-notification
   ```

> **Note** : Les scripts npm utilisent `npx` pour exécuter Supabase CLI sans installation globale.

### Étape 4 : Configurer les secrets dans Supabase

1. Allez dans votre **Supabase Dashboard**
2. Naviguez vers **Project Settings** > **Edge Functions** > **Secrets**
3. Ajoutez les secrets suivants :
   - `RESEND_API_KEY` : Votre clé API Resend
   - `APP_URL` : L'URL de votre application (ex: `https://your-app.com`)
   - `SUPABASE_URL` : L'URL de votre projet Supabase (trouvable dans Project Settings > API)
   - `SUPABASE_SERVICE_ROLE_KEY` : La clé service role de votre projet (trouvable dans Project Settings > API, section "service_role" - **⚠️ Gardez-la secrète !**)

### Étape 5 : Configurer les permissions

L'Edge Function doit pouvoir accéder à `auth.users`. Vérifiez que les RLS policies sont correctement configurées.

## 🔧 Configuration Alternative (Sans Resend)

Si vous préférez utiliser un autre service d'email (SendGrid, Mailgun, etc.), modifiez le fichier `supabase/functions/send-conversation-notification/index.ts` pour utiliser leur API.

### Exemple avec SendGrid :

```typescript
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')

const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SENDGRID_API_KEY}`,
  },
  body: JSON.stringify({
    personalizations: [{
      to: [{ email: to }],
    }],
    from: { email: 'noreply@yourdomain.com' },
    subject: `${senderName} vous a envoyé un message`,
    content: [{
      type: 'text/html',
      value: htmlContent,
    }],
  }),
})
```

## 📧 Personnalisation de l'Email

Vous pouvez personnaliser le template HTML dans `supabase/functions/send-conversation-notification/index.ts` :

- Modifiez le style CSS dans la section `<style>`
- Changez le texte du message
- Ajustez le lien vers votre application

## 🧪 Test

1. Créez deux comptes utilisateurs
2. Connectez-vous avec le premier compte
3. Allez sur le profil du second utilisateur
4. Cliquez sur "Message"
5. Vérifiez que l'email est bien reçu par le second utilisateur

## ⚠️ Notes Importantes

- **Limite Resend gratuite** : 3000 emails/mois
- **Vérification du domaine** : Nécessaire pour envoyer depuis votre propre domaine
- **Email de test** : Resend fournit un email de test (`onboarding@resend.dev`) pour tester sans vérifier de domaine
- **Gestion des erreurs** : Si l'envoi d'email échoue, la conversation sera quand même créée (l'email n'est pas bloquant)

## 🔍 Dépannage

### L'email n'est pas envoyé

1. Vérifiez que `RESEND_API_KEY` est bien configuré dans Supabase
2. Vérifiez les logs de l'Edge Function dans Supabase Dashboard
3. Vérifiez que le domaine est vérifié dans Resend (ou utilisez l'email de test)

### Erreur "Missing required fields"

Vérifiez que tous les champs sont bien passés à la fonction :
- `to` : Email du destinataire
- `senderName` : Nom de l'expéditeur
- `senderUsername` : Username de l'expéditeur (optionnel)
- `conversationId` : ID de la conversation

### Erreur d'authentification Resend

Vérifiez que votre API key est correcte et active dans Resend Dashboard.

## 📚 Ressources

- [Documentation Resend](https://resend.com/docs)
- [Documentation Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Exemples d'Edge Functions](https://github.com/supabase/supabase/tree/master/examples/edge-functions)

