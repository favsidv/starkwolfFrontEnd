import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Shield, Volume2, VolumeX, Clock, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import defaultAvatar from '../assets/images/avatars/default-avatar.png';
import backgroundNight from '../assets/images/backgrounds/background_night.webp';
import backgroundDay from '../assets/images/backgrounds/background_day.webp';

const PHASE_DURATION = 10;
const MAP_SIZE = 2000;
const POSITION_X = 1565;
const POSITION_Y = 1215;

interface Player {
  id: number;
  name: string;
  role: 'villager' | 'werewolf' | 'seer' | 'witch' | 'hunter' | 'guard';
  status: 'alive' | 'dead';
  position: { x: number; y: number };
  voteCount: number;
  isProtected: boolean;
}

interface GameState {
  phase: 'day' | 'night';
  day: number;
  timeLeft: number;
  aliveWerewolves: number;
  aliveVillagers: number;
}

const INITIAL_PLAYERS: Player[] = [
  { id: 1, name: "Emma", role: "werewolf", status: "alive", position: { x: 0, y: 0 }, voteCount: 0, isProtected: false },
  { id: 2, name: "Marcus", role: "werewolf", status: "alive", position: { x: 0, y: 0 }, voteCount: 0, isProtected: false },
  { id: 3, name: "Luna", role: "seer", status: "alive", position: { x: 0, y: 0 }, voteCount: 0, isProtected: false },
  { id: 4, name: "Isabella", role: "witch", status: "alive", position: { x: 0, y: 0 }, voteCount: 0, isProtected: false },
  { id: 5, name: "Alex", role: "hunter", status: "alive", position: { x: 0, y: 0 }, voteCount: 0, isProtected: false },
  { id: 6, name: "Grace", role: "guard", status: "alive", position: { x: 0, y: 0 }, voteCount: 0, isProtected: false },
  { id: 7, name: "Olivia", role: "villager", status: "alive", position: { x: 0, y: 0 }, voteCount: 0, isProtected: false },
  { id: 8, name: "James", role: "villager", status: "alive", position: { x: 0, y: 0 }, voteCount: 0, isProtected: false }
];

function calculateCirclePositions(numPlayers: number, radius: number): Player[] {
  const center = { x: POSITION_X, y: POSITION_Y };
  const angleStep = (2 * Math.PI) / numPlayers;
  return INITIAL_PLAYERS.map((player, i) => ({
    ...player,
    position: {
      x: center.x + radius * Math.cos(i * angleStep),
      y: center.y + radius * Math.sin(i * angleStep)
    }
  }));
}

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

export default function Game({ onLeaveGame }: { onLeaveGame: () => void }) {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'night',
    day: 1,
    timeLeft: PHASE_DURATION,
    aliveWerewolves: 2,
    aliveVillagers: 6
  });

  const [players] = useState<Player[]>(calculateCirclePositions(INITIAL_PLAYERS.length, 195));
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [chatMessages, setChatMessages] = useState<{ id: string; content: string; playerName: string }[]>([]);
  const audioRef = useRef({
    ambience: new Audio('/sounds/night-ambience.mp3'),
    wolf: new Audio('/sounds/wolf-howl.mp3'),
    bell: new Audio('/sounds/village-bell.mp3')
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        const timeLeft = Math.max(0, prev.timeLeft - 1);
        if (timeLeft === 0) {
          const newPhase = prev.phase === 'night' ? 'day' : 'night';
          if (soundEnabled) {
            audioRef.current[newPhase === 'night' ? 'wolf' : 'bell'].play();
            audioRef.current.ambience[prev.phase === 'night' ? 'pause' : 'play']();
          }
          return { ...prev, phase: newPhase, timeLeft: PHASE_DURATION };
        }
        return { ...prev, timeLeft };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [soundEnabled]);

  const handleSendMessage = (content: string) => {
    if (content.trim()) {
      setChatMessages(prev => [...prev, { id: Date.now().toString(), content, playerName: 'You' }]);
    }
  };

  return (
    <div className="min-h-screen bg-[#120907] text-amber-200 flex flex-col">
      <header className="bg-gradient-to-r from-[#1a0f00] to-black h-16 flex items-center px-4 gap-4">
        <button onClick={onLeaveGame}>
          <ArrowLeft size={24} className="text-amber-500" />
        </button>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">StarkWolf</h1>
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full">
          <Clock size={16} /> {formatTime(gameState.timeLeft)}
        </div>
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full">
          {gameState.phase === 'night' ? <Moon size={16} /> : <Sun size={16} />} Day {gameState.day}
        </div>
        <button className="ml-auto" onClick={() => setSoundEnabled(!soundEnabled)}>
          {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
      </header>
      <div className="flex flex-1">
        <div className="relative flex-1" style={{ backgroundImage: `url(${backgroundDay})`, backgroundSize: 'cover' }}>
          <div
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${backgroundNight})`,
              backgroundSize: 'cover',
              opacity: gameState.phase === 'night' ? 1 : 0
            }}
          />
          <div className="absolute inset-0" style={{ transform: `translate(-${MAP_SIZE / 2}px, -${MAP_SIZE / 2}px)` }}>
            {players.map(player => (
              <motion.div
                key={player.id}
                className={`absolute cursor-pointer ${player.status === 'dead' ? 'grayscale opacity-50' : ''}`}
                style={{ x: player.position.x, y: player.position.y }}
                animate={{ scale: selectedPlayer === player.id ? 1.1 : 1 }}
                onClick={() => setSelectedPlayer(player.id)}
              >
                <img src={defaultAvatar} alt={player.name} className="w-16 h-16 rounded-full border-2 border-amber-500/30" />
                {player.isProtected && <Shield size={12} className="absolute -top-1 -right-1 text-amber-200" />}
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-sm bg-black/60 px-2 rounded-full">{player.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="w-72 bg-gradient-to-b from-[#1a0f00] to-black p-4 flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">Status</h2>
            <div className="mt-2 space-y-2">
              <div>Werewolves: {gameState.aliveWerewolves}/2</div>
              <div>Villagers: {gameState.aliveVillagers}/6</div>
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">Chat</h2>
            <div className="flex-1 overflow-y-auto mt-2 space-y-2">
              {chatMessages.map(msg => (
                <div key={msg.id} className="bg-black/30 p-2 rounded">
                  <span className="font-medium">{msg.playerName}: </span>{msg.content}
                </div>
              ))}
            </div>
            <form
              className="mt-2 flex gap-2"
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage(e.currentTarget.message.value);
                e.currentTarget.reset();
              }}
            >
              <input
                name="message"
                className="flex-1 bg-black/30 p-2 rounded border border-amber-500/30"
                placeholder="Message..."
              />
              <button className="px-4 bg-amber-500/20 rounded">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}