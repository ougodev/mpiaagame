'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GameState, Player } from '@/lib/types';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  const [game, setGame] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [description, setDescription] = useState('');
  const [selectedVote, setSelectedVote] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [mrWhiteGuess, setMrWhiteGuess] = useState('');

  const fetchGame = useCallback(async () => {
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get', code }),
      });
      const data = await res.json();
      if (data.success) {
        setGame(data.game);
      }
    } catch (e) {
      console.error('Fetch error:', e);
    }
  }, [code]);

  useEffect(() => {
    const id = localStorage.getItem('playerId') || '';
    const name = localStorage.getItem('playerName') || '';
    const host = localStorage.getItem('isHost') === 'true';
    
    if (!id || !name) {
      router.push('/');
      return;
    }
    
    setPlayerId(id);
    setPlayerName(name);
    setIsHost(host);
    
    const initGame = async () => {
      try {
        const action = host ? 'create' : 'join';
        const res = await fetch('/api/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, code, playerId: id, playerName: name }),
        });
        const data = await res.json();
        
        if (data.success) {
          setGame(data.game);
          setIsHost(data.game.hostId === id);
        } else {
          setError(data.error || 'Erreur de connexion');
        }
      } catch (e) {
        setError('Erreur de connexion au serveur');
      }
      setLoading(false);
    };
    
    initGame();
    
    // Poll for updates
    const interval = setInterval(fetchGame, 1500);
    return () => clearInterval(interval);
  }, [code, router, fetchGame]);

  const performAction = async (action: string, data?: any) => {
    try {
      const res = await fetch('/api/game/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, code, playerId, data }),
      });
      const result = await res.json();
      if (result.success) {
        setGame(result.game);
      } else {
        alert(result.error);
      }
    } catch (e) {
      console.error('Action error:', e);
    }
  };

  const copyCode = () => {
    const url = `${window.location.origin}/game/${code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startGame = () => performAction('start');
  
  const submitDesc = () => {
    if (!description.trim()) return;
    performAction('submitDescription', { description: description.trim() });
    setDescription('');
  };
  
  const startVoting = () => performAction('startVoting');
  
  const vote = () => {
    if (!selectedVote) return;
    performAction('vote', { targetId: selectedVote });
    setSelectedVote('');
  };
  
  const submitGuess = () => {
    if (!mrWhiteGuess.trim()) return;
    performAction('mrWhiteGuess', { guess: mrWhiteGuess.trim() });
    setMrWhiteGuess('');
  };
  
  const continueGame = () => performAction('continue');
  
  const resetGame = () => performAction('reset');

  const currentPlayer = game?.players.find(p => p.id === playerId);
  const activePlayers = game?.players.filter(p => !p.isEliminated) || [];
  const hasSubmittedDescription = currentPlayer?.description;
  const hasVoted = currentPlayer?.hasVoted;
  
  // Ordre de parole et tour actuel
  const speakingOrder = game?.speakingOrder || [];
  const currentSpeakerIndex = speakingOrder.findIndex(id => {
    const player = game?.players.find(p => p.id === id);
    return player && !player.isEliminated && !player.description;
  });
  const currentSpeakerId = currentSpeakerIndex >= 0 ? speakingOrder[currentSpeakerIndex] : null;
  const isMyTurn = currentSpeakerId === playerId;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-white/70">Connexion à la partie...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-4">❌ Erreur</h2>
          <p className="text-white/70 mb-4">{error}</p>
          <button onClick={() => router.push('/')} className="btn-primary">
            Retour à l'accueil
          </button>
        </div>
      </main>
    );
  }

  if (!game) return null;

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gradient">🕵️ MPIAA Game</h1>
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-sm">Round {game.currentRound || '-'}</span>
          </div>
        </div>

        {/* Game Code */}
        <div 
          onClick={copyCode}
          className="card cursor-pointer hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-sm">Code de la partie</p>
              <p className="text-2xl font-mono font-bold text-primary tracking-widest">{code}</p>
            </div>
            <span className="text-2xl">{copied ? '✅' : '📋'}</span>
          </div>
        </div>

        {/* LOBBY PHASE */}
        {game.phase === 'lobby' && (
          <>
            <div className="card">
              <h2 className="text-xl font-bold mb-4">
                👥 Joueurs ({game.players.length}/10)
              </h2>
              <div className="space-y-2">
                {game.players.map((player, i) => (
                  <div 
                    key={player.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      player.id === playerId ? 'bg-primary/20 border border-primary/50' : 'bg-white/5'
                    }`}
                  >
                    <span className="text-2xl">{i === 0 ? '👑' : '🎮'}</span>
                    <span className="flex-1">{player.name}</span>
                    {player.id === playerId && (
                      <span className="text-primary text-sm">(Toi)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isHost && (
              <div className="space-y-3">
                <button
                  onClick={startGame}
                  disabled={game.players.length < 3}
                  className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🚀 Lancer la partie ({game.players.length < 3 ? `${3 - game.players.length} joueurs manquants` : 'Prêt !'})
                </button>
              </div>
            )}

            {!isHost && (
              <div className="card text-center">
                <p className="text-white/70">⏳ En attente que l'hôte lance la partie...</p>
              </div>
            )}
          </>
        )}

        {/* WORD REVEAL PHASE */}
        {game.phase === 'wordReveal' && currentPlayer && (
          <>
            <div className="card text-center">
              <h2 className="text-xl font-bold mb-4">🎭 Ton rôle secret</h2>
              
              {currentPlayer.isEliminated ? (
                <div className="bg-red-500/20 rounded-lg p-4">
                  <p className="text-red-400 text-lg">Tu as été éliminé 💀</p>
                </div>
              ) : currentPlayer.role === 'mrwhite' ? (
                <div className="bg-purple-500/20 rounded-lg p-4">
                  <p className="text-purple-400 text-2xl font-bold mb-2">Mr. White 🎩</p>
                  <p className="text-white/70">Tu n'as pas de mot ! Écoute les autres et improvise.</p>
                  <p className="text-white/50 text-sm mt-2">💡 Bluff en écoutant les descriptions des autres !</p>
                </div>
              ) : currentPlayer.role === 'undercover' ? (
                <div className="bg-red-500/20 rounded-lg p-4">
                  <p className="text-red-400 text-sm mb-1">Tu es Undercover 🕵️</p>
                  <p className="text-3xl font-bold">{currentPlayer.word}</p>
                </div>
              ) : (
                <div className="bg-green-500/20 rounded-lg p-4">
                  <p className="text-green-400 text-sm mb-1">Ton mot</p>
                  <p className="text-3xl font-bold">{currentPlayer.word}</p>
                </div>
              )}
            </div>

            {/* Ordre de parole */}
            <div className="card">
              <h3 className="font-bold mb-3">🎯 Ordre de passage</h3>
              <div className="space-y-2">
                {speakingOrder.map((id, index) => {
                  const player = game.players.find(p => p.id === id);
                  if (!player || player.isEliminated) return null;
                  
                  const hasSpoken = !!player.description;
                  const isSpeaking = id === currentSpeakerId;
                  const isMe = id === playerId;
                  
                  return (
                    <div 
                      key={id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        isSpeaking 
                          ? 'bg-yellow-500/20 border-2 border-yellow-500 animate-pulse' 
                          : hasSpoken 
                            ? 'bg-green-500/10 border border-green-500/30' 
                            : 'bg-white/5'
                      } ${isMe ? 'ring-2 ring-primary' : ''}`}
                    >
                      <span className="text-lg font-bold text-white/50 w-6">{index + 1}</span>
                      <span className="text-xl">
                        {hasSpoken ? '✅' : isSpeaking ? '🎤' : '⏳'}
                      </span>
                      <span className={`flex-1 ${isSpeaking ? 'font-bold text-yellow-400' : ''}`}>
                        {player.name}
                        {isMe && <span className="text-primary ml-2">(Toi)</span>}
                      </span>
                      {hasSpoken && (
                        <span className="text-white/50 text-sm truncate max-w-[100px]">
                          "{player.description}"
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Zone de saisie */}
            {!currentPlayer.isEliminated && (
              <div className="card">
                {hasSubmittedDescription ? (
                  <div className="bg-green-500/20 rounded-lg p-4 text-center">
                    <p className="text-green-400 text-lg">✅ C'est bon !</p>
                    <p className="text-white/70 mt-2">Ta description : "{currentPlayer.description}"</p>
                    <p className="text-white/50 text-sm mt-2">En attente des autres joueurs...</p>
                  </div>
                ) : isMyTurn ? (
                  <div className="space-y-3">
                    <div className="bg-yellow-500/20 rounded-lg p-3 text-center mb-3">
                      <p className="text-yellow-400 font-bold text-lg">🎤 C'est ton tour !</p>
                      <p className="text-white/70 text-sm">Décris ton mot en un mot ou une phrase courte</p>
                    </div>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ta description..."
                      className="input-field text-lg"
                      maxLength={50}
                      autoFocus
                    />
                    <button 
                      onClick={submitDesc} 
                      disabled={!description.trim()}
                      className="btn-primary w-full text-lg disabled:opacity-50"
                    >
                      📤 Envoyer ma description
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-white/50 text-lg">⏳ Attends ton tour...</p>
                    <p className="text-white/30 text-sm mt-2">
                      C'est au tour de : <span className="text-yellow-400 font-bold">
                        {game.players.find(p => p.id === currentSpeakerId)?.name || '...'}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {isHost && (
              <button onClick={startVoting} className="btn-primary w-full">
                🗳️ Passer au vote
              </button>
            )}
          </>
        )}

        {/* VOTING PHASE */}
        {game.phase === 'voting' && currentPlayer && (
          <>
            <div className="card text-center">
              <h2 className="text-2xl font-bold mb-2">🗳️ Vote !</h2>
              <p className="text-white/70">Qui est l'infiltré ?</p>
            </div>

            {currentPlayer.isEliminated ? (
              <div className="card text-center">
                <p className="text-white/50">Tu ne peux pas voter 💀</p>
              </div>
            ) : hasVoted ? (
              <div className="card text-center">
                <p className="text-green-400">✅ Vote enregistré !</p>
                <p className="text-white/70">En attente des autres joueurs...</p>
              </div>
            ) : (
              <div className="card">
                <div className="space-y-2 mb-4">
                  {activePlayers
                    .filter(p => p.id !== playerId)
                    .map((player) => (
                    <button
                      key={player.id}
                      onClick={() => setSelectedVote(player.id)}
                      className={`w-full p-4 rounded-lg text-left transition-all ${
                        selectedVote === player.id 
                          ? 'bg-primary text-white' 
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <p className="font-medium">{player.name}</p>
                      {player.description && (
                        <p className="text-sm opacity-70">"{player.description}"</p>
                      )}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={vote} 
                  disabled={!selectedVote}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  Voter
                </button>
              </div>
            )}

            <div className="card">
              <h3 className="font-bold mb-3">📊 Votes</h3>
              <div className="space-y-2">
                {activePlayers.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span>{player.name}</span>
                    <span>{player.hasVoted ? '✅' : '⏳'}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* MR WHITE GUESS PHASE */}
        {game.phase === 'mrWhiteGuess' && (
          <>
            <div className="card text-center">
              <div className="bg-purple-500/20 rounded-lg p-6 mb-4">
                <p className="text-4xl mb-3">🎩</p>
                <h2 className="text-2xl font-bold text-purple-400 mb-2">Mr. White a été démasqué !</h2>
                <p className="text-white/70">
                  {game.players.find(p => p.id === game.eliminatedPlayerId)?.name} était Mr. White !
                </p>
              </div>
              
              <div className="bg-yellow-500/20 rounded-lg p-4">
                <p className="text-yellow-400 font-bold text-lg mb-2">🎯 Dernière chance !</p>
                <p className="text-white/70 text-sm">
                  Mr. White peut tenter de deviner le mot des Civils pour gagner la partie !
                </p>
              </div>
            </div>

            {currentPlayer?.id === game.eliminatedPlayerId ? (
              <div className="card">
                <h3 className="font-bold mb-3 text-center text-purple-400">🎩 C'est ta dernière chance !</h3>
                <p className="text-white/70 text-sm text-center mb-4">
                  Devine le mot des Civils pour gagner !
                </p>
                <input
                  type="text"
                  value={mrWhiteGuess}
                  onChange={(e) => setMrWhiteGuess(e.target.value)}
                  placeholder="Le mot des civils est..."
                  className="input-field text-lg mb-3"
                  maxLength={50}
                  autoFocus
                />
                <button 
                  onClick={submitGuess}
                  disabled={!mrWhiteGuess.trim()}
                  className="btn-primary w-full text-lg disabled:opacity-50"
                >
                  🎯 Deviner !
                </button>
              </div>
            ) : (
              <div className="card text-center">
                <p className="text-white/50 text-lg">⏳ Mr. White réfléchit...</p>
                <p className="text-white/30 text-sm mt-2">
                  En attente de sa tentative de devinette
                </p>
              </div>
            )}
          </>
        )}

        {/* RESULTS PHASE */}
        {game.phase === 'results' && (
          <>
            <div className="card text-center">
              <h2 className="text-2xl font-bold mb-4">📢 Résultats du vote</h2>
              
              {game.eliminatedPlayerId && (
                <div className="bg-red-500/20 rounded-lg p-6 mb-4">
                  <p className="text-white/70 mb-2">Éliminé :</p>
                  <p className="text-3xl font-bold text-red-400">
                    {game.players.find(p => p.id === game.eliminatedPlayerId)?.name}
                  </p>
                  <p className="text-lg mt-2">
                    {(() => {
                      const eliminated = game.players.find(p => p.id === game.eliminatedPlayerId);
                      if (eliminated?.role === 'mrwhite') return '🎩 C\'était Mr. White !';
                      if (eliminated?.role === 'undercover') return '🕵️ C\'était l\'Undercover !';
                      return '😇 C\'était un Civil...';
                    })()}
                  </p>
                </div>
              )}

              <div className="space-y-2 text-left">
                <h3 className="font-bold">Récapitulatif des votes :</h3>
                {Object.entries(game.votingResults).map(([voterId, targetId]) => (
                  <div key={voterId} className="flex justify-between p-2 bg-white/5 rounded text-sm">
                    <span>{game.players.find(p => p.id === voterId)?.name}</span>
                    <span>→ {game.players.find(p => p.id === targetId)?.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {isHost && (
              <button onClick={continueGame} className="btn-primary w-full">
                ▶️ Prochain tour
              </button>
            )}
          </>
        )}

        {/* GAME END PHASE */}
        {game.phase === 'gameEnd' && (
          <>
            <div className="card text-center">
              <h2 className="text-3xl font-bold mb-4">🎮 Fin de partie !</h2>
              
              <div className={`rounded-lg p-6 mb-6 ${
                game.winner === 'civilian' ? 'bg-green-500/20' :
                game.winner === 'undercover' ? 'bg-red-500/20' :
                'bg-purple-500/20'
              }`}>
                <p className="text-lg mb-2">Les gagnants sont :</p>
                <p className="text-4xl font-bold">
                  {game.winner === 'civilian' && '😇 Les Civils !'}
                  {game.winner === 'undercover' && '🕵️ Les Undercovers !'}
                  {game.winner === 'mrwhite' && '🎩 Mr. White !'}
                </p>
              </div>

              {/* Afficher la tentative de Mr. White si elle existe */}
              {game.mrWhiteGuess && (
                <div className={`rounded-lg p-4 mb-4 ${
                  game.winner === 'mrwhite' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  <p className="text-white/70 mb-1">Mr. White a deviné :</p>
                  <p className={`text-xl font-bold ${
                    game.winner === 'mrwhite' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    "{game.mrWhiteGuess}" {game.winner === 'mrwhite' ? '✅' : '❌'}
                  </p>
                </div>
              )}

              <div className="text-left space-y-4">
                <div>
                  <p className="text-white/50 mb-2">Les mots étaient :</p>
                  <p className="text-lg">😇 Civils : <span className="text-green-400 font-bold">{game.majorityWord}</span></p>
                  <p className="text-lg">🕵️ Undercover : <span className="text-red-400 font-bold">{game.undercoverWord}</span></p>
                </div>

                <div>
                  <p className="text-white/50 mb-2">Les rôles :</p>
                  {game.players.map((player) => (
                    <div key={player.id} className="flex items-center gap-2 p-2 bg-white/5 rounded mb-1">
                      <span>
                        {player.role === 'civilian' && '😇'}
                        {player.role === 'undercover' && '🕵️'}
                        {player.role === 'mrwhite' && '🎩'}
                      </span>
                      <span className={player.isEliminated ? 'line-through text-white/50' : ''}>
                        {player.name}
                      </span>
                      <span className="text-white/50 text-sm">
                        ({player.role})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {isHost && (
              <button onClick={resetGame} className="btn-primary w-full text-lg">
                🔄 Nouvelle partie
              </button>
            )}
          </>
        )}

        {/* Back button */}
        <button 
          onClick={() => {
            localStorage.removeItem('isHost');
            router.push('/');
          }}
          className="btn-secondary w-full"
        >
          ← Quitter la partie
        </button>
      </div>
    </main>
  );
}
