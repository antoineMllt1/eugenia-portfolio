# 🔧 Configuration Supabase CLI - Guide Rapide

Si `npm run supabase:login` ne fonctionne pas, voici comment se connecter avec un Access Token :

## Méthode Alternative : Access Token

### 1. Générer un Access Token

1. Va sur [https://supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
2. Clique sur **Generate new token**
3. Donne-lui un nom (ex: "Eugenia Portfolio")
4. **Copie le token** (il ne sera affiché qu'une seule fois !)

### 2. Configurer le token dans le terminal

**Sur Windows PowerShell :**
```powershell
$env:SUPABASE_ACCESS_TOKEN="colle-ton-token-ici"
```

**Sur Windows CMD :**
```cmd
set SUPABASE_ACCESS_TOKEN=colle-ton-token-ici
```

### 3. Vérifier que ça fonctionne

```bash
npm run supabase:link
```

Si ça fonctionne, tu verras une demande pour ton Project Reference ID.

### 4. Lier ton projet

Quand on te demande le **Project Reference ID**, colle celui que tu as copié depuis Supabase Dashboard > Settings > General.

### 5. Déployer la fonction

```bash
npm run supabase:deploy
```

---

## ⚠️ Note importante

Le token est valable pour cette session de terminal uniquement. Si tu fermes le terminal, tu devras le reconfigurer.

Pour le rendre permanent, tu peux créer un fichier `.env` à la racine du projet (mais ne le commite pas dans Git !).

