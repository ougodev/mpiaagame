'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const [playerName, setPlayerName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const router = useRouter();

  const createGame = () => {
    if (!playerName.trim()) {
      alert('Entre ton nom !');
      return;
    }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const playerId = uuidv4();
    
    localStorage.setItem('playerId', playerId);
    localStorage.setItem('playerName', playerName);
    localStorage.setItem('isHost', 'true');
    
    router.push(`/game/${code}`);
  };

  const joinGame = () => {
    if (!playerName.trim()) {
      alert('Entre ton nom !');
      return;
    }
    if (!gameCode.trim()) {
      alert('Entre le code de la partie !');
      return;
    }
    const playerId = uuidv4();
    
    localStorage.setItem('playerId', playerId);
    localStorage.setItem('playerName', playerName);
    localStorage.setItem('isHost', 'false');
    
    router.push(`/game/${gameCode.toUpperCase()}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gradient mb-4">🕵️ MPIAA Game</h1>
          <p className="text-white/70 text-lg">Trouve l'infiltré parmi tes amis !</p>
          <p className="text-white/50 text-sm mt-2">By Oussama Gobji</p>
        </div>

        {mode === 'menu' && (
          <div className="space-y-4 animate-slide-up">
            <div className="card">
              <input
                type="text"
                placeholder="Ton pseudo"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="input-field mb-4"
                maxLength={20}
              />
              
              <div className="space-y-3">
                <button
                  onClick={() => setMode('create')}
                  className="btn-primary w-full text-lg"
                >
                  🎮 Créer une partie
                </button>
                
                <button
                  onClick={() => setMode('join')}
                  className="btn-secondary w-full text-lg"
                >
                  🔗 Rejoindre une partie
                </button>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-semibold mb-3">📖 Comment jouer ?</h3>
              <ul className="text-white/70 text-sm space-y-2">
                <li>• Chaque joueur reçoit un mot secret</li>
                <li>• Les <span className="text-green-400">Civils</span> ont le même mot</li>
                <li>• L'<span className="text-red-400">Undercover</span> a un mot similaire</li>
                <li>• <span className="text-purple-400">Mr. White</span> n'a pas de mot</li>
                <li>• Décrivez votre mot et trouvez l'infiltré !</li>
              </ul>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <div className="card animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">Créer une partie</h2>
            <p className="text-white/70 mb-4">
              Un code sera généré pour inviter tes amis
            </p>
            <button
              onClick={createGame}
              className="btn-primary w-full text-lg mb-3"
            >
              🚀 Lancer la partie
            </button>
            <button
              onClick={() => setMode('menu')}
              className="btn-secondary w-full"
            >
              ← Retour
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="card animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">Rejoindre une partie</h2>
            <input
              type="text"
              placeholder="Code de la partie"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              className="input-field mb-4 text-center text-2xl tracking-widest"
              maxLength={6}
            />
            <button
              onClick={joinGame}
              className="btn-primary w-full text-lg mb-3"
            >
              🎯 Rejoindre
            </button>
            <button
              onClick={() => setMode('menu')}
              className="btn-secondary w-full"
            >
              ← Retour
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
