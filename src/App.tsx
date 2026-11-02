import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Table, Player, AvatarConfig, WaiterState, ChatMessage } from './types/game';
import { INITIAL_TABLES_COORDINATES } from './data/menuData';
import { SceneCanvas } from './three/SceneCanvas';
import { TopBar } from './components/TopBar';
import { BottomDock } from './components/BottomDock';
import { WelcomeModal } from './components/WelcomeModal';
import { CharacterCreatorModal } from './components/CharacterCreatorModal';
import { TableDetailModal } from './components/TableDetailModal';
import { OrderMenuModal } from './components/OrderMenuModal';
import { SpeechBubbleDirectInput } from './components/SpeechBubbleDirectInput';
import { TableListModal } from './components/TableListModal';
import { DrinkingMinigamesModal } from './components/DrinkingMinigamesModal';
import { ZoneNavigation } from './components/ZoneNavigation';
import { soundManager } from './audio/soundManager';

const DEFAULT_AVATAR: AvatarConfig = {
  gender: 'male',
  skinColor: '#8d5524',
  hairStyle: 'classic',
  hairColor: '#2b2b2b',
  shirtColor: '#3d405b',
  pantsColor: '#1a1a1a',
  accessory: 'non_la',
  presetName: 'Chú Hai Miệt Vườn',
};

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);

  // Fallback initial tables in case socket connects asynchronously
  const [tables, setTables] = useState<Table[]>(() =>
    INITIAL_TABLES_COORDINATES.map((coord) => ({
      id: coord.id,
      name: coord.name,
      capacity: 6,
      position: coord.position,
      status: 'empty',
      totalBill: 0,
      seats: Array.from({ length: 6 }, (_, seatIndex) => ({
        seatIndex,
        player: null,
        angle: (seatIndex * 2 * Math.PI) / 6,
      })),
      itemsOnTable: [],
    }))
  );

  const [waiter, setWaiter] = useState<WaiterState>({
    id: 'waiter_01',
    name: 'Chú Ba Phục Vụ',
    position: [8, 0, -5],
    rotation: Math.PI / 4,
    targetTableId: null,
    state: 'idle_bar',
    trayItems: [],
  });

  const [onlineCount, setOnlineCount] = useState<number>(14);

  // Player state persisted in localStorage
  const [myPlayer, setMyPlayer] = useState<Player | null>(() => {
    try {
      const saved = localStorage.getItem('quan_nhau_player');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      id: 'guest_' + Math.random().toString(36).slice(2, 8),
      guestSessionId: 'guest_' + Math.random().toString(36).slice(2, 8),
      name: 'Út Nhậu',
      avatar: DEFAULT_AVATAR,
      tableId: null,
      seatIndex: null,
      joinedAt: Date.now(),
      lastActiveAt: Date.now(),
    };
  });

  // UI Navigation states
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(true);
  const [isCharacterCreatorOpen, setIsCharacterCreatorOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTableListOpen, setIsTableListOpen] = useState(false);
  const [isMinigameOpen, setIsMinigameOpen] = useState(false);
  const [minigameTab, setMinigameTab] = useState<'clicker' | 'dice' | 'wheel' | 'fortune'>('clicker');
  const [cameraPreset, setCameraPreset] = useState<'overview' | 'my_table' | 'river' | 'grill' | 'music' | 'beer_tap'>('overview');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Recent chat message to display as a 3D speech bubble above character
  const [recentChat, setRecentChat] = useState<ChatMessage | null>(null);
  // Chat messages for current table
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Socket Connection setup
  useEffect(() => {
    const s = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });
    setSocket(s);

    s.on('connect', () => {
      if (myPlayer) {
        s.emit('player_join', {
          name: myPlayer.name,
          avatar: myPlayer.avatar,
          guestSessionId: myPlayer.guestSessionId,
        });
      }
    });

    s.on('lobby_state', (data: { tables: Table[]; waiter: WaiterState; onlineCount: number }) => {
      if (data.tables) setTables(data.tables);
      if (data.waiter) setWaiter(data.waiter);
      if (data.onlineCount) setOnlineCount(data.onlineCount);
    });

    s.on('table_updated', (updatedTable: Table) => {
      setTables((prev) => prev.map((t) => (t.id === updatedTable.id ? updatedTable : t)));
    });

    s.on('table_joined', (data: { table: Table; seatIndex: number; chatHistory: ChatMessage[] }) => {
      setMyPlayer((prev) => (prev ? { ...prev, tableId: data.table.id, seatIndex: data.seatIndex } : null));
      setChatMessages(data.chatHistory || []);
      setCameraPreset('my_table');
      // No chat window opened; ready for direct 3D speech bubbles
      soundManager.playBeerCrack();
    });

    s.on('table_left', () => {
      setMyPlayer((prev) => (prev ? { ...prev, tableId: null, seatIndex: null } : null));
      setChatMessages([]);
      setIsChatOpen(false);
      setCameraPreset('overview');
    });

    s.on('new_chat_message', (msg: ChatMessage) => {
      setRecentChat(msg);
      setChatMessages((prev) => [...prev, msg]);
      if (msg.type === 'shout') {
        soundManager.playCheers();
      }
    });

    s.on('waiter_state_updated', (newWaiter: WaiterState) => {
      setWaiter(newWaiter);
    });

    s.on('online_count_updated', (count: number) => {
      setOnlineCount(count);
    });

    s.on('player_action_triggered', (actionData: { action: string; playerName: string }) => {
      if (actionData.action === 'cheers') {
        soundManager.playGlassClink();
      }
    });

    s.on('order_placed', (data: { table: Table }) => {
      setTables((prev) => prev.map((t) => (t.id === data.table.id ? data.table : t)));
      soundManager.playOrderChime();
    });

    return () => {
      s.disconnect();
    };
  }, []);

  // Save player state changes to localStorage
  useEffect(() => {
    if (myPlayer) {
      try {
        localStorage.setItem('quan_nhau_player', JSON.stringify(myPlayer));
      } catch {
        // ignore
      }
    }
  }, [myPlayer]);

  // Handle Table Selection from 3D View or Modal
  const handleSelectTable = useCallback((tableId: number, seatIndex?: number) => {
    setSelectedTableId(tableId);
    if (seatIndex !== undefined) {
      // User directly clicked an empty seat in 3D
      const table = tables.find((t) => t.id === tableId);
      if (table && table.seats[seatIndex]?.player === null) {
        handleJoinTable(tableId, seatIndex);
      }
    }
  }, [tables]);

  // Join table and seat
  const handleJoinTable = useCallback((tableId: number, seatIndex: number) => {
    if (socket) {
      socket.emit('sit_table', { tableId, seatIndex });
    } else {
      // Local fallback for quick preview
      setTables((prev) =>
        prev.map((t) => {
          if (t.id === tableId && myPlayer) {
            const newSeats = [...t.seats];
            newSeats[seatIndex] = { ...newSeats[seatIndex], player: { ...myPlayer, tableId, seatIndex } };
            return { ...t, seats: newSeats, status: 'available' };
          }
          return t;
        })
      );
      setMyPlayer((prev) => (prev ? { ...prev, tableId, seatIndex } : null));
      setCameraPreset('my_table');
      soundManager.playBeerCrack();
    }
    setSelectedTableId(null);
  }, [socket, myPlayer]);

  // Leave current table
  const handleLeaveTable = useCallback(() => {
    if (socket) {
      socket.emit('leave_table');
    } else {
      setMyPlayer((prev) => (prev ? { ...prev, tableId: null, seatIndex: null } : null));
      setCameraPreset('overview');
    }
    setSelectedTableId(null);
  }, [socket]);

  // Send Chat message directly to 3D speech bubble
  const handleSendMessage = useCallback((text: string, type: 'text' | 'shout' | 'cheers' = 'text') => {
    const localMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      tableId: myPlayer?.tableId || 1,
      senderId: myPlayer?.id || 'me',
      senderName: myPlayer?.name || 'Bạn',
      senderAvatar: myPlayer?.avatar,
      text,
      timestamp: Date.now(),
      type,
    };
    setRecentChat(localMsg);

    if (socket) {
      socket.emit('send_table_chat', { text, type });
    } else {
      setChatMessages((prev) => [...prev, localMsg]);
    }
  }, [socket, myPlayer]);

  // Trigger social action
  const handleTriggerAction = useCallback((action: string) => {
    if (socket) {
      socket.emit('social_action', { action });
    } else {
      soundManager.playGlassClink();
    }
  }, [socket]);

  // Order food & drinks
  const handleOrderItems = useCallback((items: Array<{ itemId: string; quantity: number }>) => {
    if (socket) {
      socket.emit('order_items', { items });
    }
  }, [socket]);

  // Save new character
  const handleSaveCharacter = useCallback((name: string, avatar: AvatarConfig) => {
    const updated: Player = myPlayer
      ? { ...myPlayer, name, avatar }
      : {
          id: 'guest_' + Math.random().toString(36).slice(2, 8),
          guestSessionId: 'guest_' + Math.random().toString(36).slice(2, 8),
          name,
          avatar,
          tableId: null,
          seatIndex: null,
          joinedAt: Date.now(),
          lastActiveAt: Date.now(),
        };

    setMyPlayer(updated);
    try {
      localStorage.setItem('quan_nhau_player', JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (updated.tableId !== null && updated.seatIndex !== null) {
      setTables((prev) =>
        prev.map((t) => {
          if (t.id === updated.tableId) {
            const newSeats = [...t.seats];
            newSeats[updated.seatIndex!] = {
              ...newSeats[updated.seatIndex!],
              player: updated,
            };
            return { ...t, seats: newSeats };
          }
          return t;
        })
      );
    }

    setIsCharacterCreatorOpen(false);

    if (socket) {
      socket.emit('player_join', {
        name,
        avatar,
        guestSessionId: updated.guestSessionId,
      });
    }
  }, [socket, myPlayer]);

  const handleSelectZone = useCallback((zone: 'overview' | 'my_table' | 'river' | 'grill' | 'music' | 'beer_tap') => {
    setCameraPreset(zone);
    if (zone === 'river') soundManager.playFishSplash();
    else if (zone === 'music') soundManager.playDonCaTaiTu();
    else if (zone === 'beer_tap') soundManager.playPourBeer();
    else soundManager.playGlassClink();
  }, []);

  const handleTriggerHotspot = useCallback((action: string) => {
    if (action === 'music') {
      setCameraPreset('music');
      soundManager.playDonCaTaiTu();
    } else if (action === 'fish') {
      setCameraPreset('river');
      soundManager.playFishSplash();
    } else if (action === 'beer_tap') {
      setCameraPreset('beer_tap');
      setMinigameTab('clicker');
      setIsMinigameOpen(true);
    } else if (action === 'grill') {
      setCameraPreset('grill');
    }
  }, []);

  const handleFeedFish = useCallback(() => {
    setCameraPreset('river');
    soundManager.playFishSplash();
    if (myPlayer?.tableId) {
      handleSendMessage('🐟 Vừa ném mồi cho đàn cá sông Mekong ăn quẫy nước!', 'shout');
    }
  }, [myPlayer, handleSendMessage]);

  const handlePlayFolkMusic = useCallback(() => {
    setCameraPreset('music');
    soundManager.playDonCaTaiTu();
    if (myPlayer?.tableId) {
      handleSendMessage('🎶 Mời anh em nghe một khúc Đờn Ca Tài Tử Nam Bộ!', 'shout');
    }
  }, [myPlayer, handleSendMessage]);

  const handleOpenMinigame = useCallback((tab: 'clicker' | 'dice' | 'wheel' | 'fortune' = 'clicker') => {
    setMinigameTab(tab);
    setIsMinigameOpen(true);
  }, []);

  const currentTable = tables.find((t) => t.id === myPlayer?.tableId);
  const selectedTable = tables.find((t) => t.id === selectedTableId);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sans select-none">
      {/* 1. Flagship 3D Isometric Pub Scene */}
      <SceneCanvas
        tables={tables}
        waiter={waiter}
        selectedTableId={selectedTableId}
        myTableId={myPlayer?.tableId || null}
        myPlayerId={myPlayer?.id || null}
        recentChat={recentChat}
        onSelectTable={handleSelectTable}
        onTriggerHotspot={handleTriggerHotspot}
        cameraViewPreset={cameraPreset}
      />

      {/* 2. Top Header Bar */}
      <TopBar
        onlineCount={onlineCount}
        currentTableName={currentTable ? currentTable.name : null}
        playerName={myPlayer?.name || 'Khách Miền Tây'}
        onOpenCharacterCreator={() => setIsCharacterCreatorOpen(true)}
        onOpenTableList={() => setIsTableListOpen(true)}
      />

      {/* 2b. Scenic Zone Navigation & Activities (Giống Thali Chùa 3D) */}
      <ZoneNavigation
        currentPreset={cameraPreset}
        onSelectZone={handleSelectZone}
        onOpenMinigame={handleOpenMinigame}
        onFeedFish={handleFeedFish}
        onPlayFolkMusic={handlePlayFolkMusic}
      />

      {/* 3. Direct Speech Bubble Input (Chat trực tiếp trên bóng thoại 3D - Không khung chat) */}
      <SpeechBubbleDirectInput
        tableName={currentTable?.name}
        hasTable={myPlayer?.tableId !== null}
        onSendMessage={handleSendMessage}
        onTriggerAction={handleTriggerAction}
      />

      {/* 4. Collapsible Bottom Controls Dock */}
      <BottomDock
        hasTable={myPlayer?.tableId !== null}
        tableName={currentTable?.name}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenMinigame={handleOpenMinigame}
        onTriggerAction={handleTriggerAction}
        onLeaveTable={handleLeaveTable}
        cameraPreset={cameraPreset}
        onChangeCameraPreset={setCameraPreset}
        onOpenTableList={() => setIsTableListOpen(true)}
      />

      {/* 5. Modals */}
      {isWelcomeOpen && (
        <WelcomeModal
          onlineCount={onlineCount}
          playerName={myPlayer?.name || 'Khách Miền Tây'}
          onEnter={() => setIsWelcomeOpen(false)}
          onCustomize={() => {
            setIsWelcomeOpen(false);
            setIsCharacterCreatorOpen(true);
          }}
        />
      )}

      {isCharacterCreatorOpen && (
        <CharacterCreatorModal
          initialConfig={myPlayer?.avatar || DEFAULT_AVATAR}
          initialName={myPlayer?.name || 'Út Nhậu'}
          onSave={handleSaveCharacter}
          onClose={() => setIsCharacterCreatorOpen(false)}
        />
      )}

      {selectedTable && (
        <TableDetailModal
          table={selectedTable}
          myPlayer={myPlayer}
          onJoinTable={handleJoinTable}
          onLeaveTable={handleLeaveTable}
          onOpenMenu={() => {
            setSelectedTableId(null);
            setIsMenuOpen(true);
          }}
          onClose={() => setSelectedTableId(null)}
        />
      )}

      {isMenuOpen && currentTable && (
        <OrderMenuModal
          tableId={currentTable.id}
          tableName={currentTable.name}
          onOrder={handleOrderItems}
          onClose={() => setIsMenuOpen(false)}
        />
      )}

      {isTableListOpen && (
        <TableListModal
          tables={tables}
          myPlayer={myPlayer}
          onSelectTable={(tableId) => {
            setSelectedTableId(tableId);
            setIsTableListOpen(false);
          }}
          onClose={() => setIsTableListOpen(false)}
        />
      )}

      {/* 6. Drinking Minigames Modal (Gõ ly tích điểm, xí ngầu, vòng quay, rút quẻ) */}
      {isMinigameOpen && (
        <DrinkingMinigamesModal
          initialTab={minigameTab}
          onClose={() => setIsMinigameOpen(false)}
          onAnnounceChat={(text) => handleSendMessage(text, 'shout')}
        />
      )}
    </main>
  );
}
