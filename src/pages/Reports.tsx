import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Card, Form, Button, ProgressBar } from 'react-bootstrap';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Download,
  Filter,
  AlertTriangle
} from 'lucide-react';

const Reports: React.FC = () => {
  const { kids, parties, incidents, zones } = useApp();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  });

  const filteredData = useMemo(() => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999); // End of day

    const filteredKids = kids.filter(kid => {
      const entryDate = new Date(kid.entryTime);
      return entryDate >= startDate && entryDate <= endDate;
    });

    const filteredParties = parties.filter(party => {
      const partyDate = new Date(party.date);
      return partyDate >= startDate && partyDate <= endDate;
    });

    const filteredIncidents = incidents.filter(incident => {
      const incidentDate = new Date(incident.timestamp);
      return incidentDate >= startDate && incidentDate <= endDate;
    });

    return { filteredKids, filteredParties, filteredIncidents };
  }, [kids, parties, incidents, dateRange]);

  const analytics = useMemo(() => {
    const { filteredKids, filteredParties, filteredIncidents } = filteredData;

    // Revenue analytics
    const completedParties = filteredParties.filter(party => party.status === 'completed');
    const totalRevenue = completedParties.reduce((sum, party) => sum + party.cost, 0);
    const averagePartyValue = completedParties.length > 0 
      ? totalRevenue / completedParties.length
      : 0;

    // Visitor analytics
    const totalVisitors = filteredKids.length;
    const averageAge = filteredKids.length > 0
      ? filteredKids.reduce((sum, kid) => sum + kid.age, 0) / filteredKids.length
      : 0;

    // Visit duration analytics
    const completedVisits = filteredKids.filter(kid => kid.exitTime);
    const averageVisitDuration = completedVisits.length > 0
      ? completedVisits.reduce((sum, kid) => {
          const duration = new Date(kid.exitTime!).getTime() - new Date(kid.entryTime).getTime();
          return sum + duration;
        }, 0) / completedVisits.length / (1000 * 60) // Convert to minutes
      : 0;

    // Peak hours analysis
    const hourlyVisits: Record<number, number> = {};
    filteredKids.forEach(kid => {
      const hour = new Date(kid.entryTime).getHours();
      hourlyVisits[hour] = (hourlyVisits[hour] || 0) + 1;
    });

    const peakHour = Object.entries(hourlyVisits).reduce((peak, [hour, count]) => 
      count > peak.count ? { hour: parseInt(hour), count } : peak
    , { hour: 0, count: 0 });

    // Zone utilization
    const zoneUtilization = zones.map(zone => {
      const zoneVisits = filteredKids.filter(kid => kid.currentZone === zone.id).length;
      return {
        zoneName: zone.name,
        visits: zoneVisits,
        utilization: zone.capacity > 0 ? (zoneVisits / zone.capacity) * 100 : 0
      };
    });

    // Safety metrics
    const safetyMetrics = {
      totalIncidents: filteredIncidents.length,
      criticalIncidents: filteredIncidents.filter(i => i.severity === 'critical').length,
      resolvedIncidents: filteredIncidents.filter(i => i.resolved).length,
      incidentRate: totalVisitors > 0 ? (filteredIncidents.length / totalVisitors) * 100 : 0
    };

    return {
      totalRevenue,
      averagePartyValue,
      totalVisitors,
      averageAge,
      averageVisitDuration,
      peakHour,
      zoneUtilization,
      safetyMetrics,
      completedParties: completedParties.length,
      pendingParties: filteredParties.filter(p => p.status === 'pending').length
    };
  }, [filteredData, zones]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    subtitle?: string;
    trend?: { value: number; isPositive: boolean };
  }> = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <Card className="h-100">
      <Card.Body>
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className={`p-2 rounded ${color}`}>
            <Icon className="text-white" size={20} />
          </div>
          {trend && (
            <div className={`d-flex align-items-center small ${
              trend.isPositive ? 'text-success' : 'text-danger'
            }`}>
              <TrendingUp size={16} className={`me-1 ${trend.isPositive ? '' : 'rotate-180'}`} />
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div>
          <p className="h3 fw-bold mb-1">{value}</p>
          <p className="small fw-medium text-muted mb-0">{title}</p>
          {subtitle && <p className="text-muted small mt-1">{subtitle}</p>}
        </div>
      </Card.Body>
    </Card>
  );

  const ZoneUtilizationChart: React.FC = () => (
    <Card>
      <Card.Body>
        <Card.Title>Zone Utilization</Card.Title>
        <div className="d-flex flex-column gap-4">
          {analytics.zoneUtilization.map((zone, index) => (
            <div key={index}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small fw-medium">{zone.zoneName}</span>
                <span className="small text-muted">{zone.visits} visits</span>
              </div>
              <ProgressBar
                now={Math.min(zone.utilization, 100)}
                variant={
                  zone.utilization >= 80 ? 'danger' :
                  zone.utilization >= 60 ? 'warning' :
                  'success'
                }
                style={{ height: '12px' }}
              />
              <div className="text-muted small mt-1">
                {zone.utilization.toFixed(1)}% utilization
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );

  const SafetyReport: React.FC = () => (
    <Card>
      <Card.Body>
        <Card.Title className="d-flex align-items-center">
          <AlertTriangle className="text-warning me-2" size={20} />
          Safety Report
        </Card.Title>
        <Row className="g-4">
          <Col xs={6}>
            <div className="text-center">
              <div className="h3 fw-bold">{analytics.safetyMetrics.totalIncidents}</div>
              <div className="small text-muted">Total Incidents</div>
            </div>
          </Col>
          <Col xs={6}>
            <div className="text-center">
              <div className={`h3 fw-bold ${
                analytics.safetyMetrics.criticalIncidents > 0 ? 'text-danger' : 'text-success'
              }`}>
                {analytics.safetyMetrics.criticalIncidents}
              </div>
              <div className="small text-muted">Critical</div>
            </div>
          </Col>
          <Col xs={6}>
            <div className="text-center">
              <div className="h3 fw-bold text-success">
                {analytics.safetyMetrics.resolvedIncidents}
              </div>
              <div className="small text-muted">Resolved</div>
            </div>
          </Col>
          <Col xs={6}>
            <div className="text-center">
              <div className="h3 fw-bold">
                {analytics.safetyMetrics.incidentRate.toFixed(2)}%
              </div>
              <div className="small text-muted">Incident Rate</div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  const exportReport = () => {
    const reportData = {
      dateRange,
      analytics,
      generatedAt: new Date().toISOString(),
      generatedBy: user?.name
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `playground-report-${dateRange.start}-to-${dateRange.end}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container fluid className="p-4">
      <div className="mb-4">
        <h1 className="h2 fw-bold text-dark font-kid-friendly">
          Analytics & Reports
        </h1>
        <p className="text-muted">
          Comprehensive insights into playground operations and performance
        </p>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex align-items-center gap-4">
                <Filter className="text-muted" size={20} />
                <div className="d-flex align-items-center gap-2">
                  <Form.Label className="mb-0 small fw-medium">From:</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    style={{ width: 'auto' }}
                  />
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Form.Label className="mb-0 small fw-medium">To:</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    style={{ width: 'auto' }}
                  />
                </div>
              </div>
            </Col>
            
            <Col md={4} className="text-md-end">
              <Button
                variant="primary"
                onClick={exportReport}
                className="d-flex align-items-center"
              >
                <Download size={20} className="me-2" />
                Export Report
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Key Metrics */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Revenue"
            value={`$${analytics.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="bg-success"
            subtitle={`${analytics.completedParties} completed parties`}
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Visitors"
            value={analytics.totalVisitors.toLocaleString()}
            icon={Users}
            color="bg-primary"
            subtitle={`Avg age: ${analytics.averageAge.toFixed(1)} years`}
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <StatCard
            title="Avg Visit Duration"
            value={`${Math.round(analytics.averageVisitDuration)}m`}
            icon={Clock}
            color="bg-secondary"
            subtitle="Per visitor"
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <StatCard
            title="Peak Hour"
            value={`${analytics.peakHour.hour}:00`}
            icon={TrendingUp}
            color="bg-info"
            subtitle={`${analytics.peakHour.count} entries`}
          />
        </Col>
      </Row>

      {/* Secondary Metrics */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <StatCard
            title="Average Party Value"
            value={`$${Math.round(analytics.averagePartyValue)}`}
            icon={Calendar}
            color="bg-info"
            subtitle="Per completed party"
          />
        </Col>
        <Col md={4}>
          <StatCard
            title="Pending Parties"
            value={analytics.pendingParties}
            icon={Calendar}
            color="bg-warning"
            subtitle="Awaiting confirmation"
          />
        </Col>
        <Col md={4}>
          <StatCard
            title="Safety Incidents"
            value={analytics.safetyMetrics.totalIncidents}
            icon={AlertTriangle}
            color={analytics.safetyMetrics.totalIncidents > 0 ? "bg-danger" : "bg-success"}
            subtitle={`${analytics.safetyMetrics.incidentRate.toFixed(2)}% incident rate`}
          />
        </Col>
      </Row>

      {/* Charts and Detailed Reports */}
      <Row className="g-4 mb-4">
        <Col lg={6}>
          <ZoneUtilizationChart />
        </Col>
        <Col lg={6}>
          <SafetyReport />
        </Col>
      </Row>

      {/* Summary Insights */}
      <Card className="border-start border-info border-4 bg-info bg-opacity-10">
        <Card.Body>
          <Card.Title className="text-info">Key Insights</Card.Title>
          <div className="text-info">
            <p>• Peak activity occurs at {analytics.peakHour.hour}:00 with {analytics.peakHour.count} entries</p>
            <p>• Average visit duration is {Math.round(analytics.averageVisitDuration)} minutes</p>
            <p>• Most popular zone: {analytics.zoneUtilization.reduce((max, zone) =>
              zone.visits > max.visits ? zone : max, analytics.zoneUtilization[0] || { zoneName: 'N/A', visits: 0 }
            ).zoneName}</p>
            <p>• Safety incident rate: {analytics.safetyMetrics.incidentRate.toFixed(2)}% of total visitors</p>
            {analytics.totalRevenue > 0 && (
              <p className="mb-0">• Revenue per visitor: ${(analytics.totalRevenue / Math.max(analytics.totalVisitors, 1)).toFixed(2)}</p>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Reports;