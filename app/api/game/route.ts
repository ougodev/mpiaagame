import { NextRequest, NextResponse } from 'next/server';
import { createGame, getGame, addPlayer } from '@/lib/gameStore';

export async function POST(req: NextRequest) {
  try {
    const { action, code, playerId, playerName } = await req.json();
    
    if (action === 'create') {
      const game = createGame(code, playerId, playerName);
      return NextResponse.json({ success: true, game });
    }
    
    if (action === 'join') {
      let game = getGame(code);
      
      if (!game) {
        // Create the game if it doesn't exist (for the host)
        return NextResponse.json({ success: false, error: 'Partie introuvable' });
      }
      
      game = addPlayer(code, playerId, playerName);
      
      if (!game) {
        return NextResponse.json({ success: false, error: 'Impossible de rejoindre' });
      }
      
      return NextResponse.json({ success: true, game });
    }
    
    if (action === 'get') {
      const game = getGame(code);
      if (!game) {
        return NextResponse.json({ success: false, error: 'Partie introuvable' });
      }
      return NextResponse.json({ success: true, game });
    }
    
    return NextResponse.json({ success: false, error: 'Action invalide' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erreur serveur' });
  }
}
