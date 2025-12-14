import { NextRequest, NextResponse } from 'next/server';
import { 
  startGame, 
  submitDescription, 
  startVoting, 
  submitVote, 
  continueGame, 
  resetGame,
  getGame,
  removePlayer,
  submitMrWhiteGuess
} from '@/lib/gameStore';

export async function POST(req: NextRequest) {
  try {
    const { action, code, playerId, data } = await req.json();
    
    let game;
    
    switch (action) {
      case 'start':
        game = startGame(code);
        if (!game) {
          return NextResponse.json({ success: false, error: 'Minimum 3 joueurs requis' });
        }
        break;
        
      case 'submitDescription':
        game = submitDescription(code, playerId, data.description);
        break;
        
      case 'startVoting':
        game = startVoting(code);
        break;
        
      case 'vote':
        game = submitVote(code, playerId, data.targetId);
        break;
        
      case 'mrWhiteGuess':
        game = submitMrWhiteGuess(code, data.guess);
        break;
        
      case 'continue':
        game = continueGame(code);
        break;
        
      case 'reset':
        game = resetGame(code);
        break;
        
      case 'leave':
        game = removePlayer(code, playerId);
        break;
        
      case 'sync':
        game = getGame(code);
        break;
        
      default:
        return NextResponse.json({ success: false, error: 'Action invalide' });
    }
    
    if (!game) {
      return NextResponse.json({ success: false, error: 'Partie introuvable' });
    }
    
    return NextResponse.json({ success: true, game });
  } catch (error) {
    console.error('Action error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' });
  }
}
