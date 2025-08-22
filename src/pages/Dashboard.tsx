import React from 'react';
import { Container, Row, Col, Card, Badge, ProgressBar } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import {
  Users,
  MapPin,
  Calendar,
  AlertTriangle,
  DollarSign,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { kids, zones, parties, incidents } = useApp();

  const activeKids = kids.filter(kid => !kid.exitTime);
  const todayParties = parties.filter(party => {
    const today = new Date();
    const partyDate = new Date(party.date);
    return partyDate.toDateString() === today.toDateString();
  });
  const openIncidents = incidents.filter(incident => !incident.resolved);
  const totalRevenue = parties
    .filter(party => party.status === 'completed')
    .reduce((sum, party) => sum + party.cost, 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon: Icon, color, subtitle }) => (
    <Card className="h-100">
      <Card.Body>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <p className="text-muted small mb-1">{title}</p>
            <h3 className="fw-bold mb-0">{value}</h3>
            {subtitle && <p className="text-muted small mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-circle ${color}`}>
            <Icon className="text-white" size={24} />
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  const ZoneStatus: React.FC = () => (
    <Card>
      <Card.Body>
        <Card.Title>Zone Status</Card.Title>
        <div className="d-flex flex-column gap-3">
          {zones.map(zone => {
            const utilization = (zone.currentCount / zone.capacity) * 100;
            const getUtilizationVariant = (util: number) => {
              if (util >= 90) return 'danger';
              if (util >= 70) return 'warning';
              return 'success';
            };

            return (
              <div key={zone.id} className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                <div>
                  <p className="fw-medium mb-1">{zone.name}</p>
                  <p className="text-muted small mb-0">
                    Ages {zone.ageRange[0]}-{zone.ageRange[1]}
                  </p>
                </div>
                <div className="text-end">
                  <p className="small fw-medium mb-1">
                    {zone.currentCount}/{zone.capacity}
                  </p>
                  <ProgressBar
                    now={Math.min(utilization, 100)}
                    variant={getUtilizationVariant(utilization)}
                    style={{ width: '80px', height: '8px' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card.Body>
    </Card>
  );

  const RecentActivity: React.FC = () => (
    <Card>
      <Card.Body>
        <Card.Title>Recent Activity</Card.Title>
        <div className="d-flex flex-column gap-3">
          {activeKids.slice(0, 5).map(kid => (
            <div key={kid.id} className="d-flex align-items-center p-2 bg-light rounded">
              <div className="bg-primary-500 rounded-circle d-flex align-items-center justify-content-center me-3"
                   style={{ width: '2rem', height: '2rem' }}>
                <span className="text-white small fw-bold">
                  {kid.name.charAt(0)}
                </span>
              </div>
              <div className="flex-grow-1">
                <p className="small fw-medium mb-0">{kid.name}</p>
                <p className="text-muted small mb-0">
                  Entered {new Date(kid.entryTime).toLocaleTimeString()}
                </p>
              </div>
              <Badge bg="success">Active</Badge>
            </div>
          ))}
          {activeKids.length === 0 && (
            <p className="text-muted text-center py-4">No active visitors</p>
          )}
        </div>
      </Card.Body>
    </Card>
  );

  const UpcomingParties: React.FC = () => (
    <Card>
      <Card.Body>
        <Card.Title>Today's Parties</Card.Title>
        <div className="d-flex flex-column gap-3">
          {todayParties.map(party => (
            <div key={party.id} className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
              <div>
                <p className="fw-medium mb-1">{party.kidName}</p>
                <p className="text-muted small mb-0">
                  {party.guestCount} guests • {party.package} package
                </p>
              </div>
              <div className="text-end">
                <p className="small fw-medium mb-1">
                  ${party.cost}
                </p>
                <Badge bg={
                  party.status === 'confirmed' ? 'success' :
                  party.status === 'pending' ? 'warning' :
                  'secondary'
                }>
                  {party.status}
                </Badge>
              </div>
            </div>
          ))}
          {todayParties.length === 0 && (
            <p className="text-muted text-center py-4">No parties scheduled today</p>
          )}
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid className="p-4">
      <div className="mb-4">
        <h1 className="h2 fw-bold text-dark font-kid-friendly">
          {getGreeting()}, {user?.name}!
        </h1>
        <p className="text-muted">
          Here's what's happening at the playground today
        </p>
      </div>

      {/* Stats Grid */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <StatCard
            title="Active Kids"
            value={activeKids.length}
            icon={Users}
            color="bg-primary-500"
            subtitle="Currently playing"
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <StatCard
            title="Zone Capacity"
            value={`${zones.reduce((sum, zone) => sum + zone.currentCount, 0)}/${zones.reduce((sum, zone) => sum + zone.capacity, 0)}`}
            icon={MapPin}
            color="bg-secondary-500"
            subtitle="Total utilization"
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <StatCard
            title="Today's Parties"
            value={todayParties.length}
            icon={Calendar}
            color="bg-success-500"
            subtitle="Scheduled events"
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <StatCard
            title="Open Incidents"
            value={openIncidents.length}
            icon={AlertTriangle}
            color={openIncidents.length > 0 ? "bg-danger-500" : "bg-success-500"}
            subtitle="Safety alerts"
          />
        </Col>
      </Row>

      {/* Role-specific additional stats */}
      {(user?.role === 'owner' || user?.role === 'manager') && (
        <Row className="g-4 mb-4">
          <Col xs={12} sm={6} lg={3}>
            <StatCard
              title="Today's Revenue"
              value={`$${totalRevenue}`}
              icon={DollarSign}
              color="bg-success-500"
              subtitle="From completed parties"
            />
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <StatCard
              title="Avg. Visit Time"
              value="2.5h"
              icon={Clock}
              color="bg-info"
              subtitle="Average duration"
            />
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <StatCard
              title="Peak Hours"
              value="2-4 PM"
              icon={TrendingUp}
              color="bg-primary-500"
              subtitle="Busiest time"
            />
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <StatCard
              title="Staff On Duty"
              value="6"
              icon={Activity}
              color="bg-secondary"
              subtitle="Current shift"
            />
          </Col>
        </Row>
      )}

      {/* Content Grid */}
      <Row className="g-4">
        <Col lg={6}>
          <div className="d-flex flex-column gap-4">
            <ZoneStatus />
            {(user?.role === 'owner' || user?.role === 'manager' || user?.role === 'cashier') && (
              <UpcomingParties />
            )}
          </div>
        </Col>
        <Col lg={6}>
          <div className="d-flex flex-column gap-4">
            <RecentActivity />
            
            {/* Safety Alerts */}
            {openIncidents.length > 0 && (
              <Card className="border-start border-danger border-4">
                <Card.Body>
                  <Card.Title className="d-flex align-items-center">
                    <AlertTriangle className="text-danger me-2" size={20} />
                    Safety Alerts
                  </Card.Title>
                  <div className="d-flex flex-column gap-2">
                    {openIncidents.slice(0, 3).map(incident => (
                      <div key={incident.id} className="p-3 bg-danger bg-opacity-10 rounded">
                        <p className="fw-medium text-danger mb-1">{incident.type}</p>
                        <p className="small text-danger mb-1">{incident.kidName}</p>
                        <p className="small text-danger mb-0">
                          {new Date(incident.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;