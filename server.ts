import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { Table, Player, Order, WaiterState, TableItem3D, ChatMessage } from './src/types/game.js';
import { INITIAL_TABLES_COORDINATES, MENU_ITEMS } from './src/data/menuData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

app.use(express.json());

// Initialize 10 tables
const tables: Table[] = INITIAL_TABLES_COORDINATES.map((coord) => ({
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
}));

// Populate some initial authentic Southern regulars
const localRegulars: Player[] = [
  {
    id: 'bot_chu_hai',
    guestSessionId: 'bot_chu_hai',
    name: 'Chú Hai Miệt Vườn',
    avatar: {
      gender: 'male',
      skinColor: '#8d5524',
      hairStyle: 'classic',
      hairColor: '#2b2b2b',
      shirtColor: '#3d405b',
      pantsColor: '#1a1a1a',
      accessory: 'non_la',
      presetName: 'Chú Hai Nón Lá',
    },
    tableId: 3,
    seatIndex: 0,
    joinedAt: Date.now() - 3600000,
    lastActiveAt: Date.now(),
    isBot: true,
  },
  {
    id: 'bot_anh_bay',
    guestSessionId: 'bot_anh_bay',
    name: 'Anh Bảy Bến Tre',
    avatar: {
      gender: 'male',
      skinColor: '#c68642',
      hairStyle: 'short',
      hairColor: '#1a1a1a',
      shirtColor: '#e07a5f',
      pantsColor: '#3d405b',
      accessory: 'khan_ran',
      presetName: 'Anh Bảy Khăn Rằn',
    },
    tableId: 3,
    seatIndex: 1,
    joinedAt: Date.now() - 3000000,
    lastActiveAt: Date.now(),
    isBot: true,
  },
  {
    id: 'bot_co_ba',
    guestSessionId: 'bot_co_ba',
    name: 'Cô Ba Cần Thơ',
    avatar: {
      gender: 'female',
      skinColor: '#f1c27d',
      hairStyle: 'tied',
      hairColor: '#1a1a1a',
      shirtColor: '#f4a261',
      pantsColor: '#264653',
      accessory: 'none',
      presetName: 'Cô Ba Duyên Dáng',
    },
    tableId: 6,
    seatIndex: 2,
    joinedAt: Date.now() - 2500000,
    lastActiveAt: Date.now(),
    isBot: true,
  },
  {
    id: 'bot_thanh_nien',
    guestSessionId: 'bot_thanh_nien',
    name: 'Út Sang Cà Mau',
    avatar: {
      gender: 'male',
      skinColor: '#e0ac69',
      hairStyle: 'stylish',
      hairColor: '#3d2612',
      shirtColor: '#2a9d8f',
      pantsColor: '#264653',
      accessory: 'sunglasses',
      presetName: 'Dân Chơi Miệt Vườn',
    },
    tableId: 6,
    seatIndex: 3,
    joinedAt: Date.now() - 2000000,
    lastActiveAt: Date.now(),
    isBot: true,
  },
];

// Seat regulars into tables
localRegulars.forEach((bot) => {
  if (bot.tableId !== null && bot.seatIndex !== null) {
    const table = tables.find((t) => t.id === bot.tableId);
    if (table) {
      table.seats[bot.seatIndex].player = bot;
      table.status = 'available';
    }
  }
});

// Seed default table items on occupied tables (beer bottles and snacks)
const table3 = tables.find((t) => t.id === 3);
if (table3) {
  table3.itemsOnTable = [
    { id: 'seed_1', type: 'beer_bottle', name: 'Saigon Special', slotIndex: 0, placedAt: Date.now() },
    { id: 'seed_2', type: 'beer_bottle', name: 'Saigon Special', slotIndex: 1, placedAt: Date.now() },
    { id: 'seed_3', type: 'food_fish', name: 'Cá lóc nướng trui', slotIndex: 6, placedAt: Date.now() },
    { id: 'seed_4', type: 'snack_peanuts', name: 'Củ kiệu đậu phộng', slotIndex: 7, placedAt: Date.now() },
  ];
  table3.totalBill = 198000;
}

const table6 = tables.find((t) => t.id === 6);
if (table6) {
  table6.itemsOnTable = [
    { id: 'seed_5', type: 'beer_can', name: 'Tiger Crystal', slotIndex: 0, placedAt: Date.now() },
    { id: 'seed_6', type: 'beer_mug', name: 'Ly bia mát lạnh', slotIndex: 1, placedAt: Date.now() },
    { id: 'seed_7', type: 'food_hotpot', name: 'Lẩu mắm miền Tây', slotIndex: 6, placedAt: Date.now() },
  ];
  table6.totalBill = 245000;
}

// Update table statuses
tables.forEach((t) => {
  const seatedCount = t.seats.filter((s) => s.player !== null).length;
  if (seatedCount === 0) t.status = 'empty';
  else if (seatedCount >= t.capacity) t.status = 'full';
  else t.status = 'available';
});

// Waiter State
const waiter: WaiterState = {
  id: 'waiter_01',
  name: 'Chú Ba Phục Vụ',
  position: [8, 0, -5], // near counter/kitchen
  rotation: Math.PI / 4,
  targetTableId: null,
  state: 'idle_bar',
  trayItems: [],
};

const connectedPlayers = new Map<string, Player>();
const tableOrders = new Map<number, Order[]>();
const tableChatHistories = new Map<number, ChatMessage[]>();

// Seed welcome chat message for active tables
tableChatHistories.set(3, [
  {
    id: 'msg_init_1',
    tableId: 3,
    senderId: 'bot_chu_hai',
    senderName: 'Chú Hai Miệt Vườn',
    senderAvatar: localRegulars[0].avatar,
    text: 'Cá lóc nướng trui cuốn bánh tráng rau rừng bữa nay bén quá Bảy ơi! 🍻',
    timestamp: Date.now() - 600000,
    type: 'text',
  },
  {
    id: 'msg_init_2',
    tableId: 3,
    senderId: 'bot_anh_bay',
    senderName: 'Anh Bảy Bến Tre',
    senderAvatar: localRegulars[1].avatar,
    text: 'Dzô một trăm phần trăm Chú Hai ơi! Làm thêm kết Tiger bạc nữa nha! 🔥',
    timestamp: Date.now() - 300000,
    type: 'shout',
  },
]);

// Waiter queue logic
const orderQueue: { tableId: number; items: string[]; orderId: string }[] = [];
let isWaiterBusy = false;

function processWaiterQueue() {
  if (isWaiterBusy || orderQueue.length === 0) return;
  const nextOrder = orderQueue.shift();
  if (!nextOrder) return;

  isWaiterBusy = true;
  const targetTable = tables.find((t) => t.id === nextOrder.tableId);
  if (!targetTable) {
    isWaiterBusy = false;
    return;
  }

  waiter.targetTableId = nextOrder.tableId;
  waiter.state = 'preparing_kitchen';
  waiter.trayItems = nextOrder.items;
  waiter.currentOrderId = nextOrder.orderId;
  io.emit('waiter_state_updated', waiter);

  // Phase 1: Preparing in kitchen (1.2s)
  setTimeout(() => {
    waiter.state = 'walking_to_table';
    io.emit('waiter_state_updated', waiter);

    // Phase 2: Walking to table (2.5s)
    setTimeout(() => {
      waiter.state = 'serving_table';
      waiter.position = [targetTable.position[0], 0, targetTable.position[2] + 1.6];
      io.emit('waiter_state_updated', waiter);

      // Phase 3: Delivering & placing food (1.5s)
      setTimeout(() => {
        waiter.trayItems = [];
        waiter.state = 'returning';
        io.emit('waiter_state_updated', waiter);

        // Phase 4: Returned to bar
        setTimeout(() => {
          waiter.state = 'idle_bar';
          waiter.targetTableId = null;
          waiter.currentOrderId = undefined;
          waiter.position = [8, 0, -5];
          io.emit('waiter_state_updated', waiter);
          isWaiterBusy = false;
          processWaiterQueue();
        }, 2200);
      }, 1500);
    }, 2500);
  }, 1200);
}

// Periodic bot activity for authentic tavern atmosphere
setInterval(() => {
  // Occasional cheer or clink from table 3 or table 6
  const randTableId = Math.random() > 0.5 ? 3 : 6;
  const phrases = [
    '1, 2, 3 DZÔÔÔ! 🍻',
    'Mồi bén quá anh em ơi! Làm thêm vài chai!',
    'Mời anh em bàn bên ly bia mát lạnh!',
    'Gió sông thổi mát rượi đã đời quá!',
  ];
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];
  const sender = randTableId === 3 ? localRegulars[0] : localRegulars[2];

  const msg: ChatMessage = {
    id: 'bot_msg_' + Date.now(),
    tableId: randTableId,
    senderId: sender.id,
    senderName: sender.name,
    senderAvatar: sender.avatar,
    text: phrase,
    timestamp: Date.now(),
    type: 'shout',
  };

  const history = tableChatHistories.get(randTableId) || [];
  history.push(msg);
  if (history.length > 50) history.shift();
  tableChatHistories.set(randTableId, history);

  io.to(`table_${randTableId}`).emit('new_chat_message', msg);
  io.emit('table_social_event', {
    tableId: randTableId,
    action: 'cheers',
    playerName: sender.name,
  });
}, 35000);

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/tables', (req, res) => {
  res.json({ tables, waiter });
});

app.get('/api/menu', (req, res) => {
  res.json({ items: MENU_ITEMS });
});

// Socket.io handlers
io.on('connection', (socket: Socket) => {
  // 1. Initial Handshake
  socket.emit('lobby_state', {
    tables,
    waiter,
    onlineCount: connectedPlayers.size + localRegulars.length + 1,
  });

  // 2. Player joins lobby / creates character
  socket.on('player_join', (data: { name: string; avatar: Player['avatar']; guestSessionId?: string }) => {
    const player: Player = {
      id: socket.id,
      guestSessionId: data.guestSessionId || socket.id,
      name: data.name.trim().slice(0, 16) || 'Khách Miền Tây',
      avatar: data.avatar,
      tableId: null,
      seatIndex: null,
      joinedAt: Date.now(),
      lastActiveAt: Date.now(),
    };
    connectedPlayers.set(socket.id, player);

    io.emit('online_count_updated', connectedPlayers.size + localRegulars.length);
    socket.emit('player_registered', player);
  });

  // 3. Sit at a specific table and seat
  socket.on('sit_table', (data: { tableId: number; seatIndex?: number }) => {
    const player = connectedPlayers.get(socket.id);
    if (!player) return;

    const table = tables.find((t) => t.id === data.tableId);
    if (!table) return;

    // Leave previous table if any
    if (player.tableId !== null && player.seatIndex !== null) {
      const prevTable = tables.find((t) => t.id === player.tableId);
      if (prevTable) {
        prevTable.seats[player.seatIndex].player = null;
        socket.leave(`table_${prevTable.id}`);
        updateTableStatus(prevTable);
        io.emit('table_updated', prevTable);
      }
    }

    // Determine seat
    let targetSeatIndex = data.seatIndex ?? -1;
    if (targetSeatIndex < 0 || targetSeatIndex > 5 || table.seats[targetSeatIndex].player !== null) {
      targetSeatIndex = table.seats.findIndex((s) => s.player === null);
    }

    if (targetSeatIndex === -1) {
      socket.emit('error_notification', 'Bàn này đã kín chỗ (6/6 người)! Vui lòng chọn bàn khác.');
      return;
    }

    // Seat player
    player.tableId = table.id;
    player.seatIndex = targetSeatIndex;
    player.lastActiveAt = Date.now();
    table.seats[targetSeatIndex].player = player;

    updateTableStatus(table);
    socket.join(`table_${table.id}`);

    // Send updated table and chat history
    io.emit('table_updated', table);
    socket.emit('table_joined', {
      table,
      seatIndex: targetSeatIndex,
      chatHistory: tableChatHistories.get(table.id) || [],
      orders: tableOrders.get(table.id) || [],
    });

    // Announce to table
    const joinMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      tableId: table.id,
      senderId: 'system',
      senderName: 'Hệ Thống Quán',
      senderAvatar: player.avatar,
      text: `${player.name} vừa kéo ghế ngồi vào bàn. Chúc anh em nhậu vui vẻ!`,
      timestamp: Date.now(),
      type: 'system',
    };
    const history = tableChatHistories.get(table.id) || [];
    history.push(joinMsg);
    tableChatHistories.set(table.id, history);
    io.to(`table_${table.id}`).emit('new_chat_message', joinMsg);
  });

  // 4. Leave table
  socket.on('leave_table', () => {
    const player = connectedPlayers.get(socket.id);
    if (!player || player.tableId === null || player.seatIndex === null) return;

    const table = tables.find((t) => t.id === player.tableId);
    if (table) {
      table.seats[player.seatIndex].player = null;
      socket.leave(`table_${table.id}`);
      updateTableStatus(table);
      io.emit('table_updated', table);

      const leaveMsg: ChatMessage = {
        id: 'msg_' + Date.now(),
        tableId: table.id,
        senderId: 'system',
        senderName: 'Hệ Thống Quán',
        senderAvatar: player.avatar,
        text: `${player.name} đã đứng dậy rời bàn.`,
        timestamp: Date.now(),
        type: 'system',
      };
      const history = tableChatHistories.get(table.id) || [];
      history.push(leaveMsg);
      tableChatHistories.set(table.id, history);
      io.to(`table_${table.id}`).emit('new_chat_message', leaveMsg);
    }

    player.tableId = null;
    player.seatIndex = null;
    socket.emit('table_left');
  });

  // 5. Send Chat Message / Emoji / Shout (Broadcasts to 3D scene speech bubbles)
  socket.on('send_table_chat', (data: { text: string; type?: 'text' | 'shout' | 'cheers' }) => {
    const player = connectedPlayers.get(socket.id);
    const safeText = data.text?.trim().slice(0, 140);
    if (!safeText) return;

    const tableId = player?.tableId || 1;
    const msg: ChatMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      tableId,
      senderId: player?.id || 'guest_' + socket.id.slice(0, 5),
      senderName: player?.name || 'Khách Miền Tây',
      senderAvatar: player?.avatar,
      text: safeText,
      timestamp: Date.now(),
      type: data.type || 'text',
    };

    const history = tableChatHistories.get(tableId) || [];
    history.push(msg);
    if (history.length > 50) history.shift();
    tableChatHistories.set(tableId, history);

    // Broadcast to all clients so speech bubble appears in everyone's 3D scene
    io.emit('new_chat_message', msg);
  });

  // Periodic ambient pub chatter
  // (Handled below outside connection block)

  // 6. Social Actions (cheers, drink, wave, laugh, toast_all)
  socket.on('social_action', (data: { action: string }) => {
    const player = connectedPlayers.get(socket.id);
    if (!player || player.tableId === null) return;

    player.currentAction = data.action;
    io.to(`table_${player.tableId}`).emit('player_action_triggered', {
      tableId: player.tableId,
      playerId: player.id,
      playerName: player.name,
      seatIndex: player.seatIndex,
      action: data.action,
    });

    // Reset action after 3s
    setTimeout(() => {
      player.currentAction = undefined;
    }, 3000);
  });

  // 7. Order Food & Drinks
  socket.on('order_items', (data: { items: Array<{ itemId: string; quantity: number }> }) => {
    const player = connectedPlayers.get(socket.id);
    if (!player || player.tableId === null) return;

    const table = tables.find((t) => t.id === player.tableId);
    if (!table) return;

    let orderTotal = 0;
    const orderItemsList: Order['items'] = [];
    const itemNames: string[] = [];

    data.items.forEach((reqItem) => {
      const menuItem = MENU_ITEMS.find((m) => m.id === reqItem.itemId);
      if (menuItem && reqItem.quantity > 0) {
        const itemCost = menuItem.price * reqItem.quantity;
        orderTotal += itemCost;
        orderItemsList.push({
          itemId: menuItem.id,
          itemName: menuItem.name,
          category: menuItem.category,
          quantity: reqItem.quantity,
          unitPrice: menuItem.price,
          totalPrice: itemCost,
          modelType: menuItem.modelType,
        });
        itemNames.push(`${reqItem.quantity}x ${menuItem.name}`);

        // Add 3D representation on table
        for (let i = 0; i < Math.min(reqItem.quantity, 4); i++) {
          if (table.itemsOnTable.length < 12) {
            const slot = table.itemsOnTable.length;
            const tableItem: TableItem3D = {
              id: 'item_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
              type: menuItem.modelType,
              name: menuItem.name,
              slotIndex: slot,
              placedAt: Date.now(),
            };
            table.itemsOnTable.push(tableItem);
          }
        }
      }
    });

    if (orderItemsList.length === 0) return;

    table.totalBill += orderTotal;

    const order: Order = {
      id: 'ord_' + Date.now(),
      tableId: table.id,
      orderedBy: player.name,
      items: orderItemsList,
      totalAmount: orderTotal,
      status: 'sent',
      createdAt: Date.now(),
    };

    const currentOrders = tableOrders.get(table.id) || [];
    currentOrders.push(order);
    tableOrders.set(table.id, currentOrders);

    // Notify table
    io.to(`table_${table.id}`).emit('order_placed', { order, table });
    io.emit('table_updated', table);

    // Queue for Waiter 3D animation
    orderQueue.push({
      tableId: table.id,
      items: itemNames,
      orderId: order.id,
    });
    processWaiterQueue();
  });

  // 8. Disconnect handling
  socket.on('disconnect', () => {
    const player = connectedPlayers.get(socket.id);
    if (player && player.tableId !== null && player.seatIndex !== null) {
      const table = tables.find((t) => t.id === player.tableId);
      if (table) {
        table.seats[player.seatIndex].player = null;
        updateTableStatus(table);
        io.emit('table_updated', table);

        const disconnectMsg: ChatMessage = {
          id: 'msg_' + Date.now(),
          tableId: table.id,
          senderId: 'system',
          senderName: 'Hệ Thống Quán',
          senderAvatar: player.avatar,
          text: `${player.name} đã rời quán.`,
          timestamp: Date.now(),
          type: 'system',
        };
        const history = tableChatHistories.get(table.id) || [];
        history.push(disconnectMsg);
        tableChatHistories.set(table.id, history);
        io.to(`table_${table.id}`).emit('new_chat_message', disconnectMsg);
      }
    }
    connectedPlayers.delete(socket.id);
    io.emit('online_count_updated', connectedPlayers.size + localRegulars.length);
  });
});

function updateTableStatus(table: Table) {
  const count = table.seats.filter((s) => s.player !== null).length;
  if (count === 0) table.status = 'empty';
  else if (count >= table.capacity) table.status = 'full';
  else table.status = 'available';
}

// Periodic ambient bot chatter to keep 3D speech bubbles popping up across the pub
const PUB_AMBIENT_QUOTES = [
  { name: 'Anh Bảy Cần Thơ', tableId: 3, id: 'regular_1', text: '1, 2, 3 DZÔÔÔ! Cạn ly anh em ơi! 🍻', type: 'shout' as const },
  { name: 'Chú Sáu Bến Tre', tableId: 3, id: 'regular_2', text: 'Bia Saigon ướp lạnh uống đã thiệt! 🍺', type: 'text' as const },
  { name: 'Ba Đực Long An', tableId: 6, id: 'regular_4', text: 'Mực một nắng với khô mực chấm mắm me hết sảy! 🔥', type: 'text' as const },
  { name: 'Út Khờ Tiền Giang', tableId: 6, id: 'regular_5', text: 'Dzô trăm phần trăm nha anh em ơi! 🥂', type: 'shout' as const },
  { name: 'Chú Ba Phục Vụ', tableId: 0, id: 'waiter_01', text: 'Dạ món mới lên bàn thơm phức, chúc bà con ngon miệng! 🍲', type: 'text' as const },
  { name: 'Bác Sáu Đờn Ca', tableId: 0, id: 'musician', text: 'Khúc Dạ Cổ Hoài Lang này nhậu là thấm vô ruột nghen! 🎶', type: 'text' as const },
];

setInterval(() => {
  const quote = PUB_AMBIENT_QUOTES[Math.floor(Math.random() * PUB_AMBIENT_QUOTES.length)];
  const msg: ChatMessage = {
    id: 'ambient_' + Date.now(),
    tableId: quote.tableId,
    senderId: quote.id,
    senderName: quote.name,
    text: quote.text,
    timestamp: Date.now(),
    type: quote.type,
  };
  io.emit('new_chat_message', msg);
}, 22000);

// Dev vs Prod Vite mounting
async function startServer() {
  const PORT = process.env.PORT || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`[Quán Nhậu Anh Út Giào] Server running on http://localhost:${PORT}`);
  });
}

startServer();
