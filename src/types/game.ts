export type AccessoryType = 'none' | 'non_la' | 'khan_ran' | 'sunglasses';

export interface AvatarConfig {
  gender: 'male' | 'female';
  skinColor: string;
  hairStyle: 'short' | 'stylish' | 'tied' | 'classic' | 'bald';
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
  accessory: AccessoryType;
  presetName?: string;
}

export interface Player {
  id: string;
  guestSessionId: string;
  name: string;
  avatar: AvatarConfig;
  tableId: number | null; // 1 to 10 or null (standing/lobby)
  seatIndex: number | null; // 0 to 5
  joinedAt: number;
  lastActiveAt: number;
  isBot?: boolean;
  currentAction?: string; // 'drinking' | 'cheering' | 'waving' | 'laughing'
}

export interface Seat {
  seatIndex: number; // 0 to 5
  player: Player | null;
  angle: number; // in radians around the table
}

export interface TableItem3D {
  id: string;
  type: 'beer_bottle' | 'beer_can' | 'beer_mug' | 'food_fish' | 'food_hotpot' | 'food_plate' | 'food_clams' | 'snack_peanuts';
  name: string;
  slotIndex: number; // placement position on table (0 to 11)
  placedAt: number;
}

export interface Table {
  id: number; // 1 to 10
  name: string; // "Bàn 01" to "Bàn 10"
  capacity: number; // 6
  seats: Seat[];
  itemsOnTable: TableItem3D[];
  position: [number, number, number]; // x, y, z in 3D world
  status: 'empty' | 'available' | 'full';
  totalBill: number;
}

export type MenuCategory = 
  | 'beer'
  | 'soft_drink'
  | 'grilled'
  | 'stir_fried'
  | 'steamed'
  | 'hotpot'
  | 'snacks'
  | 'veggies';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number; // in game VNĐ
  description: string;
  unit: string;
  modelType: 'beer_bottle' | 'beer_can' | 'beer_mug' | 'food_fish' | 'food_hotpot' | 'food_plate' | 'food_clams' | 'snack_peanuts';
  imageBadge: string;
  isAlcohol?: boolean;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export interface OrderItem {
  itemId: string;
  itemName: string;
  category: MenuCategory;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  modelType: TableItem3D['type'];
}

export interface Order {
  id: string;
  tableId: number;
  orderedBy: string; // Player name
  items: OrderItem[];
  totalAmount: number;
  status: 'sent' | 'preparing' | 'serving' | 'delivered';
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  tableId: number; // tableId or 0 for tavern general announcement
  senderId: string;
  senderName: string;
  senderAvatar?: AvatarConfig;
  text: string;
  timestamp: number;
  type?: 'text' | 'shout' | 'system' | 'cheers';
}

export interface WaiterState {
  id: string;
  name: string; // "Chú Ba phục vụ"
  position: [number, number, number];
  rotation: number;
  targetTableId: number | null;
  state: 'idle_bar' | 'preparing_kitchen' | 'walking_to_table' | 'serving_table' | 'returning';
  currentOrderId?: string;
  trayItems: string[];
}
