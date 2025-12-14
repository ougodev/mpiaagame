import { GameState, Player, WORD_PAIRS } from './types';

// In-memory store (for demo purposes - will reset on server restart)
// For production, use a database like Redis, MongoDB, or Vercel KV
const games: Map<string, GameState> = new Map();

export function createGame(code: string, hostId: string, hostName: string): GameState {
  const game: GameState = {
    code,
    players: [{
      id: hostId,
      name: hostName,
      isEliminated: false,
      hasVoted: false,
    }],
    phase: 'lobby',
    currentRound: 0,
    majorityWord: '',
    undercoverWord: '',
    hostId,
    votingResults: {},
    currentSpeakerIndex: 0,
  };
  games.set(code, game);
  return game;
}

export function getGame(code: string): GameState | undefined {
  return games.get(code);
}

export function addPlayer(code: string, playerId: string, playerName: string): GameState | null {
  const game = games.get(code);
  if (!game) return null;
  
  // Check if player already exists
  const existingPlayer = game.players.find(p => p.id === playerId);
  if (existingPlayer) {
    existingPlayer.name = playerName;
    return game;
  }
  
  if (game.players.length >= 10) return null;
  if (game.phase !== 'lobby') return null;
  
  game.players.push({
    id: playerId,
    name: playerName,
    isEliminated: false,
    hasVoted: false,
  });
  
  return game;
}

export function removePlayer(code: string, playerId: string): GameState | null {
  const game = games.get(code);
  if (!game) return null;
  
  game.players = game.players.filter(p => p.id !== playerId);
  return game;
}

function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function startGame(code: string): GameState | null {
  const game = games.get(code);
  if (!game) return null;
  if (game.players.length < 3) return null;
  
  // Select random word pair
  const pair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
  const [majorityWord, undercoverWord] = Math.random() > 0.5 ? pair : [pair[1], pair[0]];
  
  game.majorityWord = majorityWord;
  game.undercoverWord = undercoverWord;
  game.currentRound = 1;
  game.votingResults = {};
  game.currentSpeakerIndex = 0;
  
  // Assign roles
  const shuffledPlayers = shuffle(game.players);
  const playerCount = shuffledPlayers.length;
  
  // Role distribution based on player count
  let undercoverCount = 1;
  let mrWhiteCount = 0;
  
  if (playerCount >= 5) mrWhiteCount = 1;
  if (playerCount >= 7) undercoverCount = 2;
  
  shuffledPlayers.forEach((player, index) => {
    player.isEliminated = false;
    player.hasVoted = false;
    player.votedFor = undefined;
    player.description = undefined;
    
    if (index < mrWhiteCount) {
      player.role = 'mrwhite';
      player.word = '';
    } else if (index < mrWhiteCount + undercoverCount) {
      player.role = 'undercover';
      player.word = undercoverWord;
    } else {
      player.role = 'civilian';
      player.word = majorityWord;
    }
  });
  
  game.players = shuffle(shuffledPlayers);
  game.phase = 'wordReveal';
  
  return game;
}

export function submitDescription(code: string, playerId: string, description: string): GameState | null {
  const game = games.get(code);
  if (!game) return null;
  
  const player = game.players.find(p => p.id === playerId);
  if (player) {
    player.description = description;
  }
  
  // Check if all non-eliminated players have submitted
  const activePlayers = game.players.filter(p => !p.isEliminated);
  const allSubmitted = activePlayers.every(p => p.description);
  
  if (allSubmitted) {
    game.phase = 'voting';
  }
  
  return game;
}

export function startVoting(code: string): GameState | null {
  const game = games.get(code);
  if (!game) return null;
  
  game.phase = 'voting';
  game.players.forEach(p => {
    p.hasVoted = false;
    p.votedFor = undefined;
  });
  game.votingResults = {};
  
  return game;
}

export function submitVote(code: string, voterId: string, targetId: string): GameState | null {
  const game = games.get(code);
  if (!game) return null;
  
  const voter = game.players.find(p => p.id === voterId);
  if (!voter || voter.isEliminated || voter.hasVoted) return game;
  
  voter.hasVoted = true;
  voter.votedFor = targetId;
  game.votingResults[voterId] = targetId;
  
  // Check if all non-eliminated players have voted
  const activePlayers = game.players.filter(p => !p.isEliminated);
  const allVoted = activePlayers.every(p => p.hasVoted);
  
  if (allVoted) {
    // Count votes
    const voteCount: Record<string, number> = {};
    Object.values(game.votingResults).forEach(id => {
      voteCount[id] = (voteCount[id] || 0) + 1;
    });
    
    // Find player with most votes
    let maxVotes = 0;
    let eliminatedId = '';
    Object.entries(voteCount).forEach(([id, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        eliminatedId = id;
      }
    });
    
    // Eliminate player
    const eliminatedPlayer = game.players.find(p => p.id === eliminatedId);
    if (eliminatedPlayer) {
      eliminatedPlayer.isEliminated = true;
      game.eliminatedPlayerId = eliminatedId;
    }
    
    game.phase = 'results';
    
    // Check win conditions
    checkWinCondition(game);
  }
  
  return game;
}

function checkWinCondition(game: GameState): void {
  const alivePlayers = game.players.filter(p => !p.isEliminated);
  const aliveCivilians = alivePlayers.filter(p => p.role === 'civilian');
  const aliveUndercovers = alivePlayers.filter(p => p.role === 'undercover');
  const aliveMrWhites = alivePlayers.filter(p => p.role === 'mrwhite');
  
  // Civilians win if all impostors are eliminated
  if (aliveUndercovers.length === 0 && aliveMrWhites.length === 0) {
    game.winner = 'civilian';
    game.phase = 'gameEnd';
    return;
  }
  
  // Impostors win if civilians are outnumbered or only 1 civilian left
  if (aliveCivilians.length <= 1) {
    if (aliveUndercovers.length > 0) {
      game.winner = 'undercover';
    } else {
      game.winner = 'mrwhite';
    }
    game.phase = 'gameEnd';
  }
}

export function continueGame(code: string): GameState | null {
  const game = games.get(code);
  if (!game) return null;
  
  if (game.phase === 'gameEnd') return game;
  
  // Reset for next round
  game.currentRound++;
  game.votingResults = {};
  game.currentSpeakerIndex = 0;
  game.eliminatedPlayerId = undefined;
  
  game.players.forEach(p => {
    p.hasVoted = false;
    p.votedFor = undefined;
    p.description = undefined;
  });
  
  game.phase = 'wordReveal';
  
  return game;
}

export function resetGame(code: string): GameState | null {
  const game = games.get(code);
  if (!game) return null;
  
  game.phase = 'lobby';
  game.currentRound = 0;
  game.majorityWord = '';
  game.undercoverWord = '';
  game.votingResults = {};
  game.winner = undefined;
  game.eliminatedPlayerId = undefined;
  game.currentSpeakerIndex = 0;
  
  game.players.forEach(p => {
    p.role = undefined;
    p.word = undefined;
    p.isEliminated = false;
    p.hasVoted = false;
    p.votedFor = undefined;
    p.description = undefined;
  });
  
  return game;
}
