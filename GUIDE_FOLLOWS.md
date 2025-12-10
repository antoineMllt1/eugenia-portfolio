# Guide: Système de Suivi (Follow/Unfollow)

Ce guide explique comment mettre en place le système de suivi des utilisateurs dans votre application.

## 📋 Prérequis

- Accès à votre projet Supabase
- Base de données configurée avec les tables `profiles` et `auth.users`

## 🗄️ Migration de la Base de Données

### Étape 1: Exécuter la Migration SQL

1. Ouvrez votre projet Supabase
2. Allez dans **SQL Editor**
3. Créez une nouvelle requête
4. Copiez et collez le contenu du fichier `supabase_migration_follows.sql`
5. Exécutez la requête

Cette migration va :
- Créer la table `follows` pour stocker les relations de suivi
- Créer les index pour optimiser les performances
- Configurer les politiques RLS (Row Level Security)
- Empêcher les utilisateurs de se suivre eux-mêmes

### Structure de la Table `follows`

```sql
- id: UUID (clé primaire)
- follower_id: UUID (référence à auth.users - celui qui suit)
- following_id: UUID (référence à auth.users - celui qui est suivi)
- created_at: TIMESTAMPTZ (date de création)
```

## ✅ Vérification

Après avoir exécuté la migration, vérifiez que :

1. La table `follows` existe dans votre base de données
2. Les politiques RLS sont activées
3. Les index sont créés

## 🎯 Fonctionnalités Implémentées

### 1. Boutons Follow/Unfollow

- **Dans les profils publics** : Bouton "Follow" / "Unfollow" visible pour les autres utilisateurs
- **Dans les reels** : Bouton "Follow" / "Unfollow" à côté du nom d'utilisateur
- **État dynamique** : Le bouton change automatiquement selon si vous suivez déjà l'utilisateur

### 2. Compteurs de Suivi

- **Followers** : Nombre de personnes qui suivent l'utilisateur
- **Following** : Nombre de personnes que l'utilisateur suit
- **Mise à jour en temps réel** : Les compteurs se mettent à jour automatiquement

### 3. Gestion des États

- Vérification automatique de l'état de suivi
- Prévention des doublons (contrainte UNIQUE)
- Prévention de se suivre soi-même

## 🔒 Sécurité

Les politiques RLS garantissent que :
- Les utilisateurs ne peuvent suivre que d'autres utilisateurs (pas eux-mêmes)
- Les utilisateurs ne peuvent supprimer que leurs propres relations de suivi
- Tous les utilisateurs peuvent voir les relations de suivi (pour les compteurs)

## 📝 Notes

- Les compteurs sont calculés dynamiquement à partir de la table `follows`
- L'état de suivi est vérifié à chaque ouverture de profil
- Les actions de suivi/désabonnement sont persistées immédiatement en base de données

