export type PlayerRole = 'civilian' | 'undercover' | 'mrwhite';

export interface Player {
  id: string;
  name: string;
  role?: PlayerRole;
  word?: string;
  isEliminated: boolean;
  hasVoted: boolean;
  votedFor?: string;
  description?: string;
}

export interface GameState {
  code: string;
  players: Player[];
  phase: 'lobby' | 'wordReveal' | 'discussion' | 'voting' | 'results' | 'mrWhiteGuess' | 'gameEnd';
  currentRound: number;
  majorityWord: string;
  undercoverWord: string;
  hostId: string;
  votingResults: Record<string, string>;
  eliminatedPlayerId?: string;
  winner?: 'civilian' | 'undercover' | 'mrwhite';
  currentSpeakerIndex: number;
  speakingOrder: string[]; // IDs des joueurs dans l'ordre de parole
  mrWhiteGuess?: string; // La tentative de devinette de Mr. White
}

export const WORD_PAIRS: [string, string][] = [
  ['Pizza', 'Burger'],
  ['Chat', 'Chien'],
  ['Facebook', 'Instagram'],
  ['Netflix', 'YouTube'],
  ['iPhone', 'Samsung'],
  ['McDonald\'s', 'KFC'],
  ['Football', 'Basketball'],
  ['Paris', 'Londres'],
  ['Été', 'Hiver'],
  ['Café', 'Thé'],
  ['Chocolat', 'Vanille'],
  ['Avion', 'Train'],
  ['Plage', 'Montagne'],
  ['Guitare', 'Piano'],
  ['Batman', 'Spiderman'],
  ['Mario', 'Sonic'],
  ['WhatsApp', 'Messenger'],
  ['TikTok', 'Snapchat'],
  ['Coca', 'Pepsi'],
  ['Nike', 'Adidas'],
  ['PlayStation', 'Xbox'],
  ['Harry Potter', 'Le Seigneur des Anneaux'],
  ['Star Wars', 'Star Trek'],
  ['Pomme', 'Poire'],
  ['Soleil', 'Lune'],
  ['Océan', 'Mer'],
  ['Lion', 'Tigre'],
  ['Requin', 'Dauphin'],
  ['Vélo', 'Moto'],
  ['Lunettes', 'Lentilles'],
  ['Crayon', 'Stylo'],
  ['Livre', 'Magazine'],
  ['Cinéma', 'Théâtre'],
  ['Bière', 'Vin'],
  ['Croissant', 'Pain au chocolat'],
  ['Fortnite', 'Minecraft'],
  ['Twitter', 'Reddit'],
  ['Google', 'Bing'],
  ['Sushi', 'Sashimi'],
  ['Fromage', 'Beurre'],
  ['Médecin', 'Infirmier'],
  ['Professeur', 'Étudiant'],
  ['Roi', 'Reine'],
  ['Ange', 'Démon'],
  ['Zombie', 'Vampire'],
  ['Père Noël', 'Lapin de Pâques'],
  ['Halloween', 'Carnaval'],
  ['Mariage', 'Anniversaire'],
  ['Restaurant', 'Fast-food'],
  ['Hôtel', 'Airbnb'],
];
