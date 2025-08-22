import React, { useState, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Badge, Nav } from 'react-bootstrap';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import {
  UserPlus,
  UserMinus,
  Search,
  Camera,
  Phone,
  Clock,
  MapPin,
  CheckCircle
} from 'lucide-react';
import { Kid } from '../types';

interface EntryFormProps {
  entryForm: {
    name: string;
    age: string;
    guardianPhone: string;
    wristbandId: string;
    currentZone: string;
  };
  zones: any[];
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAgeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleWristbandChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleZoneChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleEntrySubmit: (e: React.FormEvent) => void;
  setShowEntryForm: (show: boolean) => void;
}

const EntryForm: React.FC<EntryFormProps> = ({
  entryForm,
  zones,
  handleNameChange,
  handleAgeChange,
  handlePhoneChange,
  handleWristbandChange,
  handleZoneChange,
  handleEntrySubmit,
  setShowEntryForm
}) => (
  <Card>
    <Card.Header className="d-flex justify-content-between align-items-center">
      <Card.Title className="mb-0">New Kid Entry</Card.Title>
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => setShowEntryForm(false)}
      >
        ×
      </Button>
    </Card.Header>
    <Card.Body>
      <Form onSubmit={handleEntrySubmit}>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Child's Name *</Form.Label>
              <Form.Control
                type="text"
                value={entryForm.name}
                onChange={handleNameChange}
                placeholder="Enter child's name"
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Age *</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="15"
                value={entryForm.age}
                onChange={handleAgeChange}
                placeholder="Age"
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Guardian Phone *</Form.Label>
              <Form.Control
                type="tel"
                value={entryForm.guardianPhone}
                onChange={handlePhoneChange}
                placeholder="+1234567890"
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Wristband ID *</Form.Label>
              <Form.Control
                type="text"
                value={entryForm.wristbandId}
                onChange={handleWristbandChange}
                placeholder="WB001"
                required
              />
            </Form.Group>
          </Col>

          <Col xs={12}>
            <Form.Group>
              <Form.Label>Initial Zone (Optional)</Form.Label>
              <Form.Select
                value={entryForm.currentZone}
                onChange={handleZoneChange}
              >
                <option value="">Select a zone</option>
                {zones.filter(zone => zone.isActive && zone.currentCount < zone.capacity).map(zone => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} ({zone.currentCount}/{zone.capacity})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex gap-3 mt-4">
          <Button type="submit" variant="primary" className="d-flex align-items-center">
            <UserPlus size={20} className="me-2" />
            Check In
          </Button>
          
          <Button type="button" variant="secondary" className="d-flex align-items-center">
            <Camera size={20} className="me-2" />
            Take Photo
          </Button>
        </div>
      </Form>
    </Card.Body>
  </Card>
);

const Admission: React.FC = () => {
  const { kids, zones, addKid, updateKid } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'entry' | 'exit'>('entry');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [entryForm, setEntryForm] = useState({
    name: '',
    age: '',
    guardianPhone: '',
    wristbandId: '',
    currentZone: ''
  });

  const activeKids = kids.filter(kid => !kid.exitTime);
  const filteredKids = activeKids.filter(kid =>
    kid.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kid.wristbandId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate wristband ID is unique
    const existingWristband = kids.find(kid => kid.wristbandId === entryForm.wristbandId && !kid.exitTime);
    if (existingWristband) {
      alert('Wristband ID already in use!');
      return;
    }

    // Check zone capacity
    if (entryForm.currentZone) {
      const zone = zones.find(z => z.id === entryForm.currentZone);
      if (zone && zone.currentCount >= zone.capacity) {
        alert('Selected zone is at full capacity!');
        return;
      }
    }

    const newKid: Omit<Kid, 'id'> = {
      name: entryForm.name,
      age: parseInt(entryForm.age),
      guardianPhone: entryForm.guardianPhone,
      wristbandId: entryForm.wristbandId,
      currentZone: entryForm.currentZone || undefined,
      entryTime: new Date()
    };

    addKid(newKid);
    setEntryForm({
      name: '',
      age: '',
      guardianPhone: '',
      wristbandId: '',
      currentZone: ''
    });
    setShowEntryForm(false);
  };

  const handleExit = (kidId: string) => {
    const kid = kids.find(k => k.id === kidId);
    if (kid) {
      const exitTime = new Date();
      const duration = Math.round((exitTime.getTime() - new Date(kid.entryTime).getTime()) / (1000 * 60));
      
      if (window.confirm(`Check out ${kid.name}? Visit duration: ${duration} minutes`)) {
        updateKid(kidId, { 
          exitTime,
          currentZone: undefined
        });
      }
    }
  };

  const getVisitDuration = (entryTime: Date) => {
    const now = new Date();
    const duration = Math.round((now.getTime() - new Date(entryTime).getTime()) / (1000 * 60));
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleFormChange = useCallback((field: keyof typeof entryForm, value: string) => {
    setEntryForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFormChange('name', e.target.value);
  }, [handleFormChange]);

  const handleAgeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFormChange('age', e.target.value);
  }, [handleFormChange]);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFormChange('guardianPhone', e.target.value);
  }, [handleFormChange]);

  const handleWristbandChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFormChange('wristbandId', e.target.value.toUpperCase());
  }, [handleFormChange]);

  const handleZoneChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFormChange('currentZone', e.target.value);
  }, [handleFormChange]);

  const KidCard: React.FC<{ kid: Kid }> = ({ kid }) => {
    const currentZone = zones.find(z => z.id === kid.currentZone);
    
    return (
      <Card className="h-100">
        <Card.Body>
          <div className="d-flex align-items-start justify-content-between">
            <div className="d-flex align-items-center">
              <div className="bg-primary-500 rounded-circle d-flex align-items-center justify-content-center me-3"
                   style={{ width: '3rem', height: '3rem' }}>
                <span className="text-white fw-bold">
                  {kid.name.charAt(0)}
                </span>
              </div>
              <div>
                <h5 className="fw-semibold mb-1">{kid.name}</h5>
                <p className="text-muted small mb-2">Age {kid.age} • {kid.wristbandId}</p>
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center text-muted small">
                    <Clock size={14} className="me-1" />
                    <span>{getVisitDuration(kid.entryTime)}</span>
                  </div>
                  <div className="d-flex align-items-center text-muted small">
                    <Phone size={14} className="me-1" />
                    <span>{kid.guardianPhone}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-end">
              {currentZone && (
                <div className="d-flex align-items-center text-muted small mb-2">
                  <MapPin size={16} className="me-1" />
                  <span>{currentZone.name}</span>
                </div>
              )}
              
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleExit(kid.id)}
                className="d-flex align-items-center"
              >
                <UserMinus size={16} className="me-1" />
                Check Out
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container fluid className="p-4">
      <div className="mb-4">
        <h1 className="h2 fw-bold text-dark font-kid-friendly">
          Admission Control
        </h1>
        <p className="text-muted">
          Manage kid entries and exits with wristband tracking
        </p>
      </div>

      {/* Tab Navigation */}
      <Nav variant="pills" className="mb-4">
        <Nav.Item>
          <Nav.Link
            active={activeTab === 'entry'}
            onClick={() => setActiveTab('entry')}
          >
            Kid Entry
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            active={activeTab === 'exit'}
            onClick={() => setActiveTab('exit')}
          >
            Kid Exit
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {activeTab === 'entry' && (
        <div className="d-flex flex-column gap-4">
          {!showEntryForm ? (
            <Card className="text-center">
              <Card.Body className="py-5">
                <UserPlus size={64} className="text-primary mx-auto mb-4" />
                <Card.Title>Ready to Check In a New Kid?</Card.Title>
                <Card.Text className="text-muted mb-4">
                  Click below to start the admission process
                </Card.Text>
                <Button
                  variant="primary"
                  onClick={() => setShowEntryForm(true)}
                  className="d-flex align-items-center mx-auto"
                >
                  <UserPlus size={20} className="me-2" />
                  New Kid Entry
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <EntryForm
              entryForm={entryForm}
              zones={zones}
              handleNameChange={handleNameChange}
              handleAgeChange={handleAgeChange}
              handlePhoneChange={handlePhoneChange}
              handleWristbandChange={handleWristbandChange}
              handleZoneChange={handleZoneChange}
              handleEntrySubmit={handleEntrySubmit}
              setShowEntryForm={setShowEntryForm}
            />
          )}

          {/* Quick Stats */}
          <Row className="g-4">
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <div className="h2 fw-bold text-primary">{activeKids.length}</div>
                  <div className="text-muted small">Kids Currently Playing</div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <div className="h2 fw-bold text-success">
                    {zones.reduce((sum, zone) => sum + zone.currentCount, 0)}
                  </div>
                  <div className="text-muted small">Total Zone Occupancy</div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <div className="h2 fw-bold text-warning">
                    {zones.filter(zone => zone.currentCount >= zone.capacity * 0.8).length}
                  </div>
                  <div className="text-muted small">Zones Near Capacity</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {activeTab === 'exit' && (
        <div className="d-flex flex-column gap-4">
          {/* Search Bar */}
          <Card>
            <Card.Body>
              <InputGroup>
                <InputGroup.Text>
                  <Search size={20} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or wristband ID..."
                />
              </InputGroup>
            </Card.Body>
          </Card>

          {/* Active Kids List */}
          <Row className="g-4">
            {filteredKids.length > 0 ? (
              filteredKids.map(kid => (
                <Col key={kid.id} lg={6}>
                  <KidCard kid={kid} />
                </Col>
              ))
            ) : (
              <Col xs={12}>
                <Card className="text-center">
                  <Card.Body className="py-5">
                    <CheckCircle size={64} className="text-success mx-auto mb-4" />
                    <Card.Title>
                      {searchTerm ? 'No matching kids found' : 'No active kids'}
                    </Card.Title>
                    <Card.Text className="text-muted">
                      {searchTerm
                        ? 'Try adjusting your search terms'
                        : 'All kids have been checked out'
                      }
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        </div>
      )}
    </Container>
  );
};

export default Admission;