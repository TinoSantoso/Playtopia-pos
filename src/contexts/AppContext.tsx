import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Kid, PlayZone, PartyBooking, SafetyIncident, AppContextType } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock initial data
const initialZones: PlayZone[] = [
  {
    id: '1',
    name: 'Toddler Zone',
    capacity: 15,
    currentCount: 8,
    ageRange: [1, 3],
    isActive: true
  },
  {
    id: '2',
    name: 'Adventure Playground',
    capacity: 25,
    currentCount: 18,
    ageRange: [4, 8],
    isActive: true
  },
  {
    id: '3',
    name: 'Teen Zone',
    capacity: 20,
    currentCount: 12,
    ageRange: [9, 15],
    isActive: true
  },
  {
    id: '4',
    name: 'Party Room A',
    capacity: 12,
    currentCount: 0,
    ageRange: [1, 15],
    isActive: false
  }
];

const initialKids: Kid[] = [
  {
    id: '1',
    name: 'Emma Johnson',
    age: 5,
    guardianPhone: '+1234567890',
    wristbandId: 'WB001',
    currentZone: '2',
    entryTime: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: '2',
    name: 'Liam Smith',
    age: 3,
    guardianPhone: '+1234567891',
    wristbandId: 'WB002',
    currentZone: '1',
    entryTime: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
  }
];

const initialParties: PartyBooking[] = [
  {
    id: '1',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    kidName: 'Sophie Wilson',
    guestCount: 8,
    package: 'premium',
    cost: 299,
    guardianName: 'Sarah Wilson',
    guardianPhone: '+1234567892',
    status: 'confirmed'
  }
];

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [kids, setKids] = useState<Kid[]>([]);
  const [zones, setZones] = useState<PlayZone[]>([]);
  const [parties, setParties] = useState<PartyBooking[]>([]);
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedKids = localStorage.getItem('playground_kids');
    const storedZones = localStorage.getItem('playground_zones');
    const storedParties = localStorage.getItem('playground_parties');
    const storedIncidents = localStorage.getItem('playground_incidents');

    setKids(storedKids ? JSON.parse(storedKids) : initialKids);
    setZones(storedZones ? JSON.parse(storedZones) : initialZones);
    setParties(storedParties ? JSON.parse(storedParties) : initialParties);
    setIncidents(storedIncidents ? JSON.parse(storedIncidents) : []);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('playground_kids', JSON.stringify(kids));
  }, [kids]);

  useEffect(() => {
    localStorage.setItem('playground_zones', JSON.stringify(zones));
  }, [zones]);

  useEffect(() => {
    localStorage.setItem('playground_parties', JSON.stringify(parties));
  }, [parties]);

  useEffect(() => {
    localStorage.setItem('playground_incidents', JSON.stringify(incidents));
  }, [incidents]);

  const addKid = (kidData: Omit<Kid, 'id'>) => {
    const newKid: Kid = {
      ...kidData,
      id: Date.now().toString(),
      entryTime: new Date(kidData.entryTime)
    };
    setKids(prev => [...prev, newKid]);
    
    // Update zone count if kid is assigned to a zone
    if (newKid.currentZone) {
      updateZone(newKid.currentZone, { 
        currentCount: zones.find(z => z.id === newKid.currentZone)!.currentCount + 1 
      });
    }
  };

  const updateKid = (id: string, updates: Partial<Kid>) => {
    setKids(prev => prev.map(kid => {
      if (kid.id === id) {
        const oldZone = kid.currentZone;
        const newZone = updates.currentZone;
        
        // Update zone counts if zone changed
        if (oldZone !== newZone) {
          if (oldZone) {
            const oldZoneData = zones.find(z => z.id === oldZone);
            if (oldZoneData) {
              updateZone(oldZone, { currentCount: oldZoneData.currentCount - 1 });
            }
          }
          if (newZone) {
            const newZoneData = zones.find(z => z.id === newZone);
            if (newZoneData) {
              updateZone(newZone, { currentCount: newZoneData.currentCount + 1 });
            }
          }
        }
        
        return { ...kid, ...updates };
      }
      return kid;
    }));
  };

  const removeKid = (id: string) => {
    const kid = kids.find(k => k.id === id);
    if (kid?.currentZone) {
      const zone = zones.find(z => z.id === kid.currentZone);
      if (zone) {
        updateZone(kid.currentZone, { currentCount: zone.currentCount - 1 });
      }
    }
    setKids(prev => prev.filter(kid => kid.id !== id));
  };

  const updateZone = (id: string, updates: Partial<PlayZone>) => {
    setZones(prev => prev.map(zone => 
      zone.id === id ? { ...zone, ...updates } : zone
    ));
  };

  const addParty = (partyData: Omit<PartyBooking, 'id'>) => {
    const newParty: PartyBooking = {
      ...partyData,
      id: Date.now().toString(),
      date: new Date(partyData.date)
    };
    setParties(prev => [...prev, newParty]);
  };

  const updateParty = (id: string, updates: Partial<PartyBooking>) => {
    setParties(prev => prev.map(party => 
      party.id === id ? { ...party, ...updates } : party
    ));
  };

  const addIncident = (incidentData: Omit<SafetyIncident, 'id'>) => {
    const newIncident: SafetyIncident = {
      ...incidentData,
      id: Date.now().toString(),
      timestamp: new Date(incidentData.timestamp)
    };
    setIncidents(prev => [...prev, newIncident]);
  };

  const updateIncident = (id: string, updates: Partial<SafetyIncident>) => {
    setIncidents(prev => prev.map(incident => 
      incident.id === id ? { ...incident, ...updates } : incident
    ));
  };

  const value: AppContextType = {
    kids,
    zones,
    parties,
    incidents,
    addKid,
    updateKid,
    removeKid,
    updateZone,
    addParty,
    updateParty,
    addIncident,
    updateIncident
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};