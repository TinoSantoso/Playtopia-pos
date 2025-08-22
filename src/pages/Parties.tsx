import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Modal } from 'react-bootstrap';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Calendar,
  Plus,
  Users,
  DollarSign,
  Phone,
  Gift,
  Edit,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { PartyBooking } from '../types';

interface PartyFormProps {
  formData: {
    date: string;
    kidName: string;
    guestCount: string;
    package: 'basic' | 'premium';
    guardianName: string;
    guardianPhone: string;
    cost: number;
  };
  editingParty: PartyBooking | null;
  handleSubmit: (e: React.FormEvent) => void;
  setFormData: React.Dispatch<React.SetStateAction<{
    date: string;
    kidName: string;
    guestCount: string;
    package: 'basic' | 'premium';
    guardianName: string;
    guardianPhone: string;
    cost: number;
  }>>;
  setShowForm: (show: boolean) => void;
  setEditingParty: React.Dispatch<React.SetStateAction<PartyBooking | null>>;
  packagePrices: { basic: number; premium: number };
  packageFeatures: { basic: string[]; premium: string[] };
}

const PartyForm: React.FC<PartyFormProps> = ({
  formData,
  editingParty,
  handleSubmit,
  setFormData,
  setShowForm,
  setEditingParty,
  packagePrices,
  packageFeatures
}) => (
  <Card>
    <Card.Header className="d-flex justify-content-between align-items-center">
      <Card.Title className="mb-0">
        {editingParty ? 'Edit Party Booking' : 'New Party Booking'}
      </Card.Title>
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => {
          setShowForm(false);
          setEditingParty(null);
        }}
      >
        ×
      </Button>
    </Card.Header>
    <Card.Body>
      <Form onSubmit={handleSubmit}>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Party Date *</Form.Label>
              <Form.Control
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Birthday Child's Name *</Form.Label>
              <Form.Control
                type="text"
                value={formData.kidName}
                onChange={(e) => setFormData(prev => ({ ...prev, kidName: e.target.value }))}
                placeholder="Enter child's name"
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Guardian Name *</Form.Label>
              <Form.Control
                type="text"
                value={formData.guardianName}
                onChange={(e) => setFormData(prev => ({ ...prev, guardianName: e.target.value }))}
                placeholder="Parent/Guardian name"
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Contact Phone *</Form.Label>
              <Form.Control
                type="tel"
                value={formData.guardianPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, guardianPhone: e.target.value }))}
                placeholder="+1234567890"
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Number of Guests *</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="15"
                value={formData.guestCount}
                onChange={(e) => setFormData(prev => ({ ...prev, guestCount: e.target.value }))}
                placeholder="Number of guests"
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Custom Price (Optional)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                value={formData.cost || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                placeholder={`Default: $${packagePrices[formData.package]}`}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Package Selection */}
        <div className="mt-4">
          <Form.Label className="fw-medium mb-3">Party Package *</Form.Label>
          <Row className="g-3">
            {(['basic', 'premium'] as const).map(pkg => (
              <Col key={pkg} md={6}>
                <Card
                  className={`cursor-pointer ${
                    formData.package === pkg
                      ? 'border-primary border-2 bg-primary bg-opacity-10'
                      : 'border-secondary'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, package: pkg }))}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <Card.Title className="text-capitalize mb-0">{pkg} Package</Card.Title>
                      <span className="h5 fw-bold text-primary mb-0">
                        ${packagePrices[pkg]}
                      </span>
                    </div>
                    <ul className="list-unstyled small">
                      {packageFeatures[pkg].map((feature, index) => (
                        <li key={index} className="d-flex align-items-center mb-1">
                          <CheckCircle className="text-success me-2 flex-shrink-0" size={16} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div className="d-flex gap-3 mt-4">
          <Button type="submit" variant="primary" className="d-flex align-items-center">
            <Calendar size={20} className="me-2" />
            {editingParty ? 'Update Booking' : 'Book Party'}
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setShowForm(false);
              setEditingParty(null);
            }}
          >
            Cancel
          </Button>
        </div>
      </Form>
    </Card.Body>
  </Card>
);

const Parties: React.FC = () => {
  const { parties, addParty, updateParty, zones } = useApp();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingParty, setEditingParty] = useState<PartyBooking | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    date: '',
    kidName: '',
    guestCount: '',
    package: 'basic' as 'basic' | 'premium',
    guardianName: '',
    guardianPhone: '',
    cost: 0
  });

  const packagePrices = {
    basic: 149,
    premium: 299
  };

  const packageFeatures = {
    basic: [
      '2 hours of play time',
      'Party room for 1 hour',
      'Basic decorations',
      'Juice and water',
      'Up to 8 guests'
    ],
    premium: [
      '3 hours of play time',
      'Party room for 2 hours',
      'Premium decorations',
      'Pizza, cake, and drinks',
      'Party host included',
      'Up to 12 guests',
      'Party favors'
    ]
  };

  const getPartiesForDate = (date: string) => {
    return parties.filter(party => {
      const partyDate = new Date(party.date).toISOString().split('T')[0];
      return partyDate === date;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const partyData: Omit<PartyBooking, 'id'> = {
      date: new Date(formData.date),
      kidName: formData.kidName,
      guestCount: parseInt(formData.guestCount),
      package: formData.package,
      cost: formData.cost || packagePrices[formData.package],
      guardianName: formData.guardianName,
      guardianPhone: formData.guardianPhone,
      status: 'pending'
    };

    if (editingParty) {
      updateParty(editingParty.id, partyData);
      setEditingParty(null);
    } else {
      addParty(partyData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: '',
      kidName: '',
      guestCount: '',
      package: 'basic',
      guardianName: '',
      guardianPhone: '',
      cost: 0
    });
    setShowForm(false);
  };

  const handleEdit = (party: PartyBooking) => {
    setEditingParty(party);
    setFormData({
      date: new Date(party.date).toISOString().split('T')[0],
      kidName: party.kidName,
      guestCount: party.guestCount.toString(),
      package: party.package,
      guardianName: party.guardianName,
      guardianPhone: party.guardianPhone,
      cost: party.cost
    });
    setShowForm(true);
  };

  const handleStatusChange = (partyId: string, status: PartyBooking['status']) => {
    updateParty(partyId, { status });
  };

  const getStatusColor = (status: PartyBooking['status']) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'completed': return 'primary';
      case 'cancelled': return 'danger';
      default: return 'warning';
    }
  };

  const PartyCard: React.FC<{ party: PartyBooking }> = ({ party }) => (
    <Card className="h-100">
      <Card.Body>
        <div className="d-flex align-items-start justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <div className="bg-secondary-500 rounded-circle d-flex align-items-center justify-content-center me-3"
                 style={{ width: '3rem', height: '3rem' }}>
              <Gift className="text-white" size={24} />
            </div>
            <div>
              <Card.Title className="mb-1">{party.kidName}'s Party</Card.Title>
              <Card.Text className="text-muted small mb-0">
                {new Date(party.date).toLocaleDateString()} at {new Date(party.date).toLocaleTimeString()}
              </Card.Text>
            </div>
          </div>
          
          <Badge bg={getStatusColor(party.status)}>
            {party.status}
          </Badge>
        </div>

        <Row className="g-3 mb-3">
          <Col xs={6}>
            <div className="d-flex align-items-center text-muted small">
              <Users size={16} className="me-2" />
              <span>{party.guestCount} guests</span>
            </div>
          </Col>
          <Col xs={6}>
            <div className="d-flex align-items-center text-muted small">
              <DollarSign size={16} className="me-2" />
              <span>${party.cost}</span>
            </div>
          </Col>
          <Col xs={6}>
            <div className="d-flex align-items-center text-muted small">
              <Gift size={16} className="me-2" />
              <span className="text-capitalize">{party.package} package</span>
            </div>
          </Col>
          <Col xs={6}>
            <div className="d-flex align-items-center text-muted small">
              <Phone size={16} className="me-2" />
              <span>{party.guardianPhone}</span>
            </div>
          </Col>
        </Row>

        <div className="d-flex justify-content-between align-items-center pt-3 border-top">
          <div className="small text-muted">
            <strong>{party.guardianName}</strong>
          </div>
          
          <div className="d-flex align-items-center gap-1">
            {party.status === 'pending' && (
              <>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => handleStatusChange(party.id, 'confirmed')}
                  title="Confirm booking"
                >
                  <CheckCircle size={16} />
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleStatusChange(party.id, 'cancelled')}
                  title="Cancel booking"
                >
                  <AlertCircle size={16} />
                </Button>
              </>
            )}
            
            {party.status === 'confirmed' && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleStatusChange(party.id, 'completed')}
                title="Mark as completed"
              >
                <CheckCircle size={16} />
              </Button>
            )}
            
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => handleEdit(party)}
              title="Edit booking"
            >
              <Edit size={16} />
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  const selectedDateParties = getPartiesForDate(selectedDate);
  const upcomingParties = parties.filter(party =>
    new Date(party.date) >= new Date() && party.status !== 'cancelled'
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Container fluid className="p-4">
      <div className="mb-4">
        <h1 className="h2 fw-bold text-dark font-kid-friendly">
          Party Bookings
        </h1>
        <p className="text-muted">
          Manage birthday parties and special events
        </p>
      </div>

      {/* Quick Stats */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="h2 fw-bold text-primary">
                {parties.filter(p => p.status === 'pending').length}
              </div>
              <div className="text-muted small">Pending Bookings</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="h2 fw-bold text-success">
                {parties.filter(p => p.status === 'confirmed').length}
              </div>
              <div className="text-muted small">Confirmed Parties</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="h2 fw-bold text-secondary">
                {upcomingParties.length}
              </div>
              <div className="text-muted small">Upcoming Events</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="h2 fw-bold text-success">
                ${parties.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.cost, 0)}
              </div>
              <div className="text-muted small">Total Revenue</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Date Selector */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Calendar className="text-primary me-3" size={24} />
              <div>
                <Form.Label className="mb-1">View parties for date:</Form.Label>
                <Form.Control
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ width: 'auto' }}
                />
              </div>
            </div>
            
            <Button
              variant="primary"
              onClick={() => setShowForm(true)}
              className="d-flex align-items-center"
            >
              <Plus size={20} className="me-2" />
              New Booking
            </Button>
          </div>
        </Card.Body>
      </Card>

      {showForm && (
        <PartyForm
          formData={formData}
          editingParty={editingParty}
          handleSubmit={handleSubmit}
          setFormData={setFormData}
          setShowForm={setShowForm}
          setEditingParty={setEditingParty}
          packagePrices={packagePrices}
          packageFeatures={packageFeatures}
        />
      )}

      {/* Parties for Selected Date */}
      <div className="mb-4">
        <h2 className="h4 fw-semibold mb-3">
          Parties on {new Date(selectedDate).toLocaleDateString()}
        </h2>
        
        {selectedDateParties.length > 0 ? (
          <Row className="g-4">
            {selectedDateParties.map(party => (
              <Col key={party.id} lg={6}>
                <PartyCard party={party} />
              </Col>
            ))}
          </Row>
        ) : (
          <Card className="text-center">
            <Card.Body className="py-5">
              <Calendar size={64} className="text-muted mx-auto mb-4" />
              <Card.Title>No parties scheduled</Card.Title>
              <Card.Text className="text-muted">
                No birthday parties are scheduled for this date
              </Card.Text>
            </Card.Body>
          </Card>
        )}
      </div>

      {/* Upcoming Parties */}
      {upcomingParties.length > 0 && (
        <div>
          <h2 className="h4 fw-semibold mb-3">Upcoming Parties</h2>
          <Row className="g-4">
            {upcomingParties.slice(0, 6).map(party => (
              <Col key={party.id} lg={6}>
                <PartyCard party={party} />
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Container>
  );
};

export default Parties;