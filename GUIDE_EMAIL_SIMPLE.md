# 📧 Guide Simple : Activer les Notifications Email

## ⚠️ Si tu as une erreur "row-level security policy"

Si tu vois l'erreur `Failed to start conversation: new row violates row-level security policy`, exécute le fichier `fix_conversations_rls.sql` dans Supabase SQL Editor.

## ✅ Ce qui est déjà fait
- ✅ Le bouton "Message" fonctionne
- ✅ La fonction Edge Function est créée
- ✅ Le fichier de configuration est prêt

## 🎯 Ce qu'il te reste à faire (3 étapes simples)

### Étape 1 : Trouver ton Project Reference ID

1. Va sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Clique sur ton projet
3. Va dans **Settings** (⚙️) en bas à gauche
4. Clique sur **General**
5. Copie le **Reference ID** (c'est une série de lettres/chiffres comme `abcdefghijklmnop`)

### Étape 2 : Se connecter à Supabase CLI

**Option A : Login interactif (si ça fonctionne)**

Ouvre un terminal dans ton dossier projet et tape :

```bash
npm run supabase:login
```

Appuie sur **Entrée** pour ouvrir le navigateur et te connecter.

**Option B : Utiliser un Access Token (si Option A ne fonctionne pas)**

1. Va sur [https://supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
2. Clique sur **Generate new token**
3. Donne-lui un nom (ex: "Eugenia Portfolio CLI")
4. Copie le token généré
5. Dans le terminal, tape (remplace `TON_TOKEN` par le token copié) :
   ```bash
   $env:SUPABASE_ACCESS_TOKEN="TON_TOKEN"
   ```
   (Sur Windows PowerShell) ou
   ```bash
   set SUPABASE_ACCESS_TOKEN=TON_TOKEN
   ```
   (Sur Windows CMD)

### Étape 3 : Lier ton projet

Une fois connecté (via Option A ou B), tape :

```bash
npm run supabase:link
```

Quand on te demande le **Project Reference ID**, colle celui que tu as copié à l'étape 1.

Si on te demande un **Database Password**, c'est le mot de passe de ta base de données Supabase (trouvable dans **Settings** > **Database** > **Database password**).

### Étape 4 : Déployer la fonction

Toujours dans le terminal, tape :

```bash
npm run supabase:deploy
```

C'est tout ! La fonction est maintenant déployée.

> ✅ **Note** : Si tu vois un avertissement sur la version de la base de données, c'est normal. Le fichier `config.toml` a été automatiquement mis à jour.

---

## 📧 Configurer l'envoi d'emails (optionnel mais recommandé)

### Étape 4 : Créer un compte Resend (gratuit)

1. Va sur [https://resend.com](https://resend.com)
2. Crée un compte (gratuit jusqu'à 3000 emails/mois)
3. Va dans **API Keys**
4. Clique sur **Create API Key**
5. Donne-lui un nom (ex: "Eugenia Portfolio")
6. **Copie la clé API** (elle ne sera affichée qu'une seule fois !)

### Étape 5 : Configurer les secrets dans Supabase

1. Va sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Clique sur ton projet
3. Va dans **Settings** (⚙️) > **Edge Functions** > **Secrets**
4. Clique sur **Add new secret** et ajoute ces 4 secrets :

   **Secret 1 :**
   - Nom : `RESEND_API_KEY`
   - Valeur : La clé API que tu as copiée de Resend

   **Secret 2 :**
   - Nom : `APP_URL`
   - Valeur : L'URL de ton site (ex: `https://ton-site.com` ou `http://localhost:5173` pour le dev)

   **Secret 3 :**
   - Nom : `SUPABASE_URL`
   - Valeur : Trouve-la dans **Settings** > **API** > **Project URL**

   **Secret 4 :**
   - Nom : `SUPABASE_SERVICE_ROLE_KEY`
   - Valeur : Trouve-la dans **Settings** > **API** > **service_role** (⚠️ Garde-la secrète !)

---

## ✅ Test

1. Crée deux comptes utilisateurs différents
2. Connecte-toi avec le premier compte
3. Va sur le profil du second utilisateur
4. Clique sur "Message"
5. Le second utilisateur devrait recevoir un email de notification !

---

## ❓ Problèmes courants

**"npm run supabase:link ne fonctionne pas"**
- Assure-toi d'être dans le bon dossier (celui avec `package.json`)
- Essaie : `npx supabase link --project-ref TON-PROJECT-REF`

**"L'email n'est pas envoyé"**
- Vérifie que tous les secrets sont bien configurés dans Supabase
- Vérifie que ta clé API Resend est correcte
- Regarde les logs dans Supabase Dashboard > Edge Functions > Logs

**"Je ne trouve pas mon Project Reference ID"**
- Va dans **Settings** > **General** dans ton dashboard Supabase
- C'est écrit en haut de la page

