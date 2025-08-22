export interface Kid {
  id: string;
  name: string;
  age: number;
  guardianPhone: string;
  wristbandId: string;
  currentZone?: string;
  entryTime: Date;
  exitTime?: Date;
  photo?: string;
}

export interface PlayZone {
  id: string;
  name: string;
  capacity: number;
  currentCount: number;
  ageRange: [number, number];
  isActive: boolean;
}

export interface PartyBooking {
  id: string;
  date: Date;
  kidName: string;
  guestCount: number;
  package: 'basic' | 'premium';
  cost: number;
  guardianName: string;
  guardianPhone: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type UserRole = 'owner' | 'manager' | 'cashier' | 'supervisor';

export interface SafetyIncident {
  id: string;
  kidId: string;
  kidName: string;
  type: 'injury' | 'lost' | 'behavioral' | 'emergency';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedBy: string;
  timestamp: Date;
  resolved: boolean;
  actions: string[];
}

export interface DailyReport {
  date: Date;
  totalVisitors: number;
  totalRevenue: number;
  partyBookings: number;
  incidents: number;
  peakHours: string[];
  zoneUtilization: Record<string, number>;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface AppContextType {
  kids: Kid[];
  zones: PlayZone[];
  parties: PartyBooking[];
  incidents: SafetyIncident[];
  addKid: (kid: Omit<Kid, 'id'>) => void;
  updateKid: (id: string, updates: Partial<Kid>) => void;
  removeKid: (id: string) => void;
  updateZone: (id: string, updates: Partial<PlayZone>) => void;
  addParty: (party: Omit<PartyBooking, 'id'>) => void;
  updateParty: (id: string, updates: Partial<PartyBooking>) => void;
  addIncident: (incident: Omit<SafetyIncident, 'id'>) => void;
  updateIncident: (id: string, updates: Partial<SafetyIncident>) => void;
}