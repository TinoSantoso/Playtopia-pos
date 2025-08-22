import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar } from 'react-bootstrap';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import {
  MapPin,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Plus,
  Minus
} from 'lucide-react';
import { PlayZone, Kid } from '../types';

const Zones: React.FC = () => {
  const { zones, kids, updateZone } = useApp();
  const { user } = useAuth();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const activeKids = kids.filter(kid => !kid.exitTime);
  
  const getZoneKids = (zoneId: string): Kid[] => {
    return activeKids.filter(kid => kid.currentZone === zoneId);
  };

  const getUtilizationLevel = (currentCount: number, capacity: number) => {
    const percentage = (currentCount / capacity) * 100;
    if (percentage >= 90) return { level: 'critical', color: 'danger', text: 'Critical' };
    if (percentage >= 70) return { level: 'high', color: 'warning', text: 'High' };
    if (percentage >= 50) return { level: 'medium', color: 'secondary', text: 'Medium' };
    return { level: 'low', color: 'success', text: 'Low' };
  };

  const toggleZoneStatus = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (zone) {
      updateZone(zoneId, { isActive: !zone.isActive });
    }
  };

  const adjustCapacity = (zoneId: string, change: number) => {
    const zone = zones.find(z => z.id === zoneId);
    if (zone) {
      const newCapacity = Math.max(1, zone.capacity + change);
      if (newCapacity >= zone.currentCount) {
        updateZone(zoneId, { capacity: newCapacity });
      }
    }
  };

  const ZoneCard: React.FC<{ zone: PlayZone }> = ({ zone }) => {
    const utilization = getUtilizationLevel(zone.currentCount, zone.capacity);
    const zoneKids = getZoneKids(zone.id);
    const utilizationPercentage = (zone.currentCount / zone.capacity) * 100;

    const getProgressVariant = (percentage: number) => {
      if (percentage >= 90) return 'danger';
      if (percentage >= 70) return 'warning';
      return 'success';
    };

    return (
      <Card className={`h-100 ${!zone.isActive ? 'opacity-75' : ''}`}>
        <Card.Body>
          <div className="d-flex align-items-start justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <div className={`p-3 rounded-circle me-3 ${
                zone.isActive ? 'bg-primary-500' : 'bg-secondary'
              }`}>
                <MapPin className="text-white" size={24} />
              </div>
              <div>
                <Card.Title className="mb-1">{zone.name}</Card.Title>
                <Card.Text className="text-muted small mb-0">
                  Ages {zone.ageRange[0]}-{zone.ageRange[1]}
                </Card.Text>
              </div>
            </div>
            
            <div className="d-flex align-items-center gap-2">
              <Badge bg={utilization.color}>
                {utilization.text}
              </Badge>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => toggleZoneStatus(zone.id)}
                title={zone.isActive ? 'Deactivate Zone' : 'Activate Zone'}
              >
                {zone.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
              </Button>
            </div>
          </div>

          {/* Capacity Display */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small fw-medium">Capacity</span>
              <span className="small fw-bold">
                {zone.currentCount}/{zone.capacity}
              </span>
            </div>
            <ProgressBar
              now={Math.min(utilizationPercentage, 100)}
              variant={getProgressVariant(utilizationPercentage)}
              style={{ height: '12px' }}
            />
            <div className="d-flex justify-content-between text-muted small mt-1">
              <span>0</span>
              <span>{Math.round(utilizationPercentage)}%</span>
              <span>{zone.capacity}</span>
            </div>
          </div>

          {/* Capacity Controls */}
          {(user?.role === 'owner' || user?.role === 'manager') && (
            <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
              <span className="small fw-medium">Adjust Capacity</span>
              <div className="d-flex align-items-center gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => adjustCapacity(zone.id, -1)}
                  disabled={zone.capacity <= zone.currentCount}
                >
                  <Minus size={16} />
                </Button>
                <span className="small fw-bold" style={{ minWidth: '2rem', textAlign: 'center' }}>
                  {zone.capacity}
                </span>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => adjustCapacity(zone.id, 1)}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Kids in Zone */}
          <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small fw-medium">
                Kids in Zone ({zoneKids.length})
              </span>
              <Button
                variant="link"
                size="sm"
                className="p-0"
                onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
              >
                {selectedZone === zone.id ? 'Hide' : 'View All'}
              </Button>
            </div>
            
            {selectedZone === zone.id && (
              <div className="d-flex flex-column gap-2" style={{ maxHeight: '10rem', overflowY: 'auto' }}>
                {zoneKids.map(kid => (
                  <div key={kid.id} className="d-flex align-items-center justify-content-between p-2 bg-white rounded border">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary-500 rounded-circle d-flex align-items-center justify-content-center me-2"
                           style={{ width: '1.5rem', height: '1.5rem' }}>
                        <span className="text-white small fw-bold">
                          {kid.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="small fw-medium mb-0">{kid.name}</p>
                        <p className="text-muted small mb-0">Age {kid.age} • {kid.wristbandId}</p>
                      </div>
                    </div>
                    <div className="text-muted small">
                      {Math.round((new Date().getTime() - new Date(kid.entryTime).getTime()) / (1000 * 60))}m
                    </div>
                  </div>
                ))}
                {zoneKids.length === 0 && (
                  <p className="text-muted small text-center py-2">No kids in this zone</p>
                )}
              </div>
            )}
          </div>

          {/* Zone Status Indicator */}
          <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
            <div className="d-flex align-items-center">
              {zone.isActive ? (
                <CheckCircle className="text-success me-2" size={16} />
              ) : (
                <AlertTriangle className="text-warning me-2" size={16} />
              )}
              <span className="small text-muted">
                {zone.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            {zone.currentCount >= zone.capacity && (
              <Badge bg="danger">At Capacity</Badge>
            )}
          </div>
        </Card.Body>
      </Card>
    );
  };

  const ZoneStats: React.FC = () => {
    const totalCapacity = zones.reduce((sum, zone) => sum + zone.capacity, 0);
    const totalOccupancy = zones.reduce((sum, zone) => sum + zone.currentCount, 0);
    const activeZones = zones.filter(zone => zone.isActive).length;
    const fullZones = zones.filter(zone => zone.currentCount >= zone.capacity).length;

    return (
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="h2 fw-bold text-primary">{activeZones}</div>
              <div className="text-muted small">Active Zones</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="h2 fw-bold text-success">
                {totalOccupancy}/{totalCapacity}
              </div>
              <div className="text-muted small">Total Occupancy</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="h2 fw-bold text-warning">
                {Math.round((totalOccupancy / totalCapacity) * 100)}%
              </div>
              <div className="text-muted small">Utilization Rate</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center">
            <Card.Body>
              <div className={`h2 fw-bold ${fullZones > 0 ? 'text-danger' : 'text-success'}`}>
                {fullZones}
              </div>
              <div className="text-muted small">Zones at Capacity</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <Container fluid className="p-4">
      <div className="mb-4">
        <h1 className="h2 fw-bold text-dark font-kid-friendly">
          Zone Management
        </h1>
        <p className="text-muted">
          Monitor and manage playground zones and capacity
        </p>
      </div>

      <ZoneStats />

      {/* Zones Grid */}
      <Row className="g-4 mb-4">
        {zones.map(zone => (
          <Col key={zone.id} lg={6}>
            <ZoneCard zone={zone} />
          </Col>
        ))}
      </Row>

      {/* Zone Management Tips */}
      <Card className="border-start border-info border-4 bg-info bg-opacity-10">
        <Card.Body>
          <Card.Title className="text-info">Zone Management Tips</Card.Title>
          <ul className="text-info mb-0">
            <li>Monitor capacity levels to ensure safety and comfort</li>
            <li>Deactivate zones during maintenance or cleaning</li>
            <li>Adjust capacity based on staff availability and safety requirements</li>
            <li>Move kids between zones to balance utilization</li>
          </ul>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Zones;