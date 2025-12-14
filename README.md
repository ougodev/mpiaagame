# 🕵️ MPIAA Game

**Développé par Oussama Gobji**

Un jeu de déduction sociale où tu dois trouver l'infiltré parmi tes amis !

## 🎮 Comment jouer

1. **Créer une partie** : Un joueur crée la partie et obtient un code
2. **Inviter des amis** : Partage le lien ou le code avec tes amis (minimum 3 joueurs)
3. **Recevoir un mot** : Chaque joueur reçoit un mot secret
   - 😇 **Civils** : ont le même mot
   - 🕵️ **Undercover** : a un mot similaire mais différent
   - 🎩 **Mr. White** : n'a pas de mot (à partir de 5 joueurs)
4. **Décrire son mot** : Chaque joueur décrit son mot sans le dire directement
5. **Voter** : Éliminez celui que vous pensez être l'infiltré !
6. **Gagner** : 
   - Les Civils gagnent s'ils éliminent tous les infiltrés
   - Les Infiltrés gagnent s'il ne reste qu'un seul Civil

## 🚀 Déploiement sur Vercel

### Méthode rapide

1. Push ton code sur GitHub
2. Connecte-toi sur [vercel.com](https://vercel.com)
3. Importe ton repository
4. Clique sur "Deploy" !

### Commandes locales

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build

# Lancer en production
npm start
```

## 🛠️ Technologies

- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styles utilitaires
- **Vercel** - Hébergement et déploiement

## 📝 Notes

- Le jeu utilise le polling pour synchroniser les états entre joueurs
- Les données sont stockées en mémoire (se réinitialisent au redéploiement)
- Pour une persistance des données, utilisez Redis ou une base de données

## 🎯 Fonctionnalités

- ✅ Création de partie avec code unique
- ✅ Rejoindre une partie via lien ou code
- ✅ Attribution aléatoire des rôles
- ✅ Phase de description
- ✅ Système de vote
- ✅ Détection automatique des gagnants
- ✅ Relancer une nouvelle partie

Amuse-toi bien avec tes amis ! 🎉
