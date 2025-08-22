import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, InputGroup, Alert } from 'react-bootstrap';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield,
  AlertTriangle,
  Plus,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';
import { SafetyIncident } from '../types';

interface IncidentFormProps {
  formData: {
    kidId: string;
    kidName: string;
    type: SafetyIncident['type'];
    description: string;
    severity: SafetyIncident['severity'];
    actions: string[];
  };
  activeKids: any[];
  handleSubmit: (e: React.FormEvent) => void;
  handleKidSelect: (kidId: string) => void;
  setShowForm: (show: boolean) => void;
  setFormData: React.Dispatch<React.SetStateAction<{
    kidId: string;
    kidName: string;
    type: SafetyIncident['type'];
    description: string;
    severity: SafetyIncident['severity'];
    actions: string[];
  }>>;
  addAction: () => void;
  updateAction: (index: number, value: string) => void;
  removeAction: (index: number) => void;
}

const IncidentForm: React.FC<IncidentFormProps> = ({
  formData,
  activeKids,
  handleSubmit,
  handleKidSelect,
  setShowForm,
  setFormData,
  addAction,
  updateAction,
  removeAction
}) => (
  <Card>
    <Card.Header className="d-flex justify-content-between align-items-center">
      <Card.Title className="mb-0">Report Safety Incident</Card.Title>
      <Button variant="outline-secondary" size="sm" onClick={() => setShowForm(false)}>
        ×
      </Button>
    </Card.Header>
    <Card.Body>
      <Form onSubmit={handleSubmit}>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Select Kid *</Form.Label>
              <Form.Select
                value={formData.kidId}
                onChange={(e) => handleKidSelect(e.target.value)}
                required
              >
                <option value="">Choose a kid</option>
                {activeKids.map(kid => (
                  <option key={kid.id} value={kid.id}>
                    {kid.name} (Age {kid.age}) - {kid.wristbandId}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Or Enter Name Manually</Form.Label>
              <Form.Control
                type="text"
                value={formData.kidName}
                onChange={(e) => setFormData(prev => ({ ...prev, kidName: e.target.value, kidId: '' }))}
                placeholder="Kid's name"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Incident Type *</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as SafetyIncident['type'] }))}
                required
              >
                <option value="injury">Injury</option>
                <option value="lost">Lost Child</option>
                <option value="behavioral">Behavioral Issue</option>
                <option value="emergency">Emergency</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Severity Level *</Form.Label>
              <Form.Select
                value={formData.severity}
                onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as SafetyIncident['severity'] }))}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12}>
            <Form.Group>
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what happened in detail..."
                required
              />
            </Form.Group>
          </Col>

          <Col xs={12}>
            <Form.Group>
              <Form.Label>Actions Taken</Form.Label>
              {formData.actions.map((action, index) => (
                <div key={index} className="d-flex align-items-center gap-2 mb-2">
                  <Form.Control
                    type="text"
                    value={action}
                    onChange={(e) => updateAction(index, e.target.value)}
                    placeholder="Action taken..."
                  />
                  {formData.actions.length > 1 && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeAction(index)}
                    >
                      <XCircle size={16} />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="link"
                size="sm"
                className="p-0 text-primary"
                onClick={addAction}
              >
                <Plus size={16} className="me-1" />
                Add Action
              </Button>
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex gap-3 mt-4">
          <Button type="submit" variant="danger" className="d-flex align-items-center">
            <AlertTriangle size={20} className="me-2" />
            Report Incident
          </Button>
          
          <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        </div>
      </Form>
    </Card.Body>
  </Card>
);

const Safety: React.FC = () => {
  const { incidents, kids, addIncident, updateIncident } = useApp();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'resolved'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [formData, setFormData] = useState({
    kidId: '',
    kidName: '',
    type: 'injury' as SafetyIncident['type'],
    description: '',
    severity: 'medium' as SafetyIncident['severity'],
    actions: ['']
  });

  const activeKids = kids.filter(kid => !kid.exitTime);

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.kidName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'open' && !incident.resolved) ||
                         (filterStatus === 'resolved' && incident.resolved);
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const incidentData: Omit<SafetyIncident, 'id'> = {
      kidId: formData.kidId,
      kidName: formData.kidName,
      type: formData.type,
      description: formData.description,
      severity: formData.severity,
      reportedBy: user?.name || 'Unknown',
      timestamp: new Date(),
      resolved: false,
      actions: formData.actions.filter(action => action.trim() !== '')
    };

    addIncident(incidentData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      kidId: '',
      kidName: '',
      type: 'injury',
      description: '',
      severity: 'medium',
      actions: ['']
    });
    setShowForm(false);
  };

  const handleKidSelect = (kidId: string) => {
    const selectedKid = activeKids.find(kid => kid.id === kidId);
    if (selectedKid) {
      setFormData(prev => ({
        ...prev,
        kidId: selectedKid.id,
        kidName: selectedKid.name
      }));
    }
  };

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, '']
    }));
  };

  const updateAction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => i === index ? value : action)
    }));
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const toggleResolved = (incidentId: string) => {
    const incident = incidents.find(i => i.id === incidentId);
    if (incident) {
      updateIncident(incidentId, { resolved: !incident.resolved });
    }
  };

  const getSeverityColor = (severity: SafetyIncident['severity']) => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      case 'low': return 'success';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: SafetyIncident['type']) => {
    switch (type) {
      case 'injury': return '🩹';
      case 'lost': return '🔍';
      case 'behavioral': return '⚠️';
      case 'emergency': return '🚨';
      default: return '📋';
    }
  };

  const IncidentCard: React.FC<{ incident: SafetyIncident }> = ({ incident }) => (
    <Card className={`border-start border-4 ${
      !incident.resolved ? 'border-danger' : 'border-success'
    }`}>
      <Card.Body>
        <div className="d-flex align-items-start justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <div className="me-3" style={{ fontSize: '2rem' }}>{getTypeIcon(incident.type)}</div>
            <div>
              <Card.Title className="mb-1">{incident.kidName}</Card.Title>
              <Card.Text className="text-muted small mb-2 text-capitalize">{incident.type} Incident</Card.Text>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center text-muted small">
                  <Clock size={14} className="me-1" />
                  <span>{new Date(incident.timestamp).toLocaleString()}</span>
                </div>
                <div className="d-flex align-items-center text-muted small">
                  <User size={14} className="me-1" />
                  <span>{incident.reportedBy}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            <Badge bg={getSeverityColor(incident.severity)}>
              {incident.severity}
            </Badge>
            <Button
              variant={incident.resolved ? "outline-success" : "outline-secondary"}
              size="sm"
              onClick={() => toggleResolved(incident.id)}
              title={incident.resolved ? 'Mark as unresolved' : 'Mark as resolved'}
            >
              {incident.resolved ? <CheckCircle size={16} /> : <XCircle size={16} />}
            </Button>
          </div>
        </div>

        <div className="mb-3">
          <p className="text-dark">{incident.description}</p>
        </div>

        {incident.actions.length > 0 && (
          <div className="mb-3">
            <h6 className="small fw-medium mb-2">Actions Taken:</h6>
            <ul className="list-unstyled small text-muted">
              {incident.actions.map((action, index) => (
                <li key={index} className="d-flex align-items-start mb-1">
                  <span className="text-primary me-2">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center pt-3 border-top">
          <Badge bg={incident.resolved ? 'success' : 'danger'}>
            {incident.resolved ? 'Resolved' : 'Open'}
          </Badge>
          
          <div className="text-muted small">
            ID: {incident.id}
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  const openIncidents = incidents.filter(i => !i.resolved);
  const criticalIncidents = incidents.filter(i => i.severity === 'critical' && !i.resolved);

  return (
    <Container fluid className="p-4">
      <div className="mb-4">
        <h1 className="h2 fw-bold text-dark font-kid-friendly">
          Safety Management
        </h1>
        <p className="text-muted">
          Report and track safety incidents and alerts
        </p>
      </div>

      {/* Critical Alerts */}
      {criticalIncidents.length > 0 && (
        <Alert variant="danger" className="mb-4">
          <div className="d-flex align-items-center mb-2">
            <AlertTriangle size={20} className="me-2" />
            <Alert.Heading className="mb-0">Critical Incidents</Alert.Heading>
          </div>
          <p className="mb-0">
            {criticalIncidents.length} critical incident{criticalIncidents.length > 1 ? 's' : ''} require immediate attention
          </p>
        </Alert>
      )}

      {/* Quick Stats */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="h2 fw-bold text-danger">{openIncidents.length}</div>
              <div className="text-muted small">Open Incidents</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="h2 fw-bold text-warning">
                {incidents.filter(i => i.severity === 'critical').length}
              </div>
              <div className="text-muted small">Critical Incidents</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="h2 fw-bold text-success">
                {incidents.filter(i => i.resolved).length}
              </div>
              <div className="text-muted small">Resolved</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="h2 fw-bold text-primary">{incidents.length}</div>
              <div className="text-muted small">Total Reports</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Controls */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={8}>
              <Row className="g-3">
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <Search size={20} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search incidents..."
                    />
                  </InputGroup>
                </Col>
                
                <Col md={4}>
                  <Form.Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="resolved">Resolved</option>
                  </Form.Select>
                </Col>
                
                <Col md={4}>
                  <Form.Select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value as any)}
                  >
                    <option value="all">All Severity</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </Form.Select>
                </Col>
              </Row>
            </Col>
            
            <Col md={4} className="text-md-end">
              <Button
                variant="danger"
                onClick={() => setShowForm(true)}
                className="d-flex align-items-center"
              >
                <Plus size={20} className="me-2" />
                Report Incident
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {showForm && (
        <IncidentForm
          formData={formData}
          activeKids={activeKids}
          handleSubmit={handleSubmit}
          handleKidSelect={handleKidSelect}
          setShowForm={setShowForm}
          setFormData={setFormData}
          addAction={addAction}
          updateAction={updateAction}
          removeAction={removeAction}
        />
      )}

      {/* Incidents List */}
      <div className="d-flex flex-column gap-4">
        {filteredIncidents.length > 0 ? (
          filteredIncidents.map(incident => (
            <IncidentCard key={incident.id} incident={incident} />
          ))
        ) : (
          <Card className="text-center">
            <Card.Body className="py-5">
              <Shield size={64} className="text-success mx-auto mb-4" />
              <Card.Title>
                {searchTerm || filterStatus !== 'all' || filterSeverity !== 'all'
                  ? 'No matching incidents found'
                  : 'No incidents reported'
                }
              </Card.Title>
              <Card.Text className="text-muted">
                {searchTerm || filterStatus !== 'all' || filterSeverity !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Great! No safety incidents have been reported'
                }
              </Card.Text>
            </Card.Body>
          </Card>
        )}
      </div>

      {/* Safety Tips */}
      <Card className="mt-4 border-start border-info border-4 bg-info bg-opacity-10">
        <Card.Body>
          <Card.Title className="text-info">Safety Guidelines</Card.Title>
          <ul className="text-info mb-0">
            <li>Report all incidents immediately, no matter how minor</li>
            <li>Document actions taken and follow-up required</li>
            <li>Notify guardians for any injury or behavioral incidents</li>
            <li>Mark incidents as resolved only after proper follow-up</li>
            <li>Review incident patterns regularly to improve safety measures</li>
          </ul>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Safety;