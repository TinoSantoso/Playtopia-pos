import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Users, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
  };

  return (
    <div className="min-h-screen kid-friendly-bg d-flex align-items-center justify-content-center">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="shadow-lg">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <div className="mx-auto bg-primary-500 rounded-circle d-flex align-items-center justify-content-center mb-3"
                       style={{ width: '4rem', height: '4rem' }}>
                    <Users className="text-white" size={32} />
                  </div>
                  <h1 className="h3 fw-bold text-dark font-kid-friendly">
                    Playtopia POS
                  </h1>
                  <p className="text-muted mt-2">
                    Kids Playground Management System
                  </p>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <Mail size={20} />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <Lock size={20} />
                      </InputGroup.Text>
                      <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                    </InputGroup>
                  </Form.Group>

                  {error && (
                    <Alert variant="danger" className="d-flex align-items-center">
                      <AlertCircle size={20} className="me-2" />
                      <span>{error}</span>
                    </Alert>
                  )}

                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 py-2 d-flex align-items-center justify-content-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="me-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <Lock size={18} className="me-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </Form>

                <div className="mt-4">
                  <h6 className="text-muted mb-3">Quick Login (Demo):</h6>
                  <Row className="g-2">
                    <Col xs={6}>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="w-100"
                        onClick={() => quickLogin('owner@playground.com', 'owner123')}
                      >
                        Owner
                      </Button>
                    </Col>
                    <Col xs={6}>
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="w-100"
                        onClick={() => quickLogin('manager@playground.com', 'manager123')}
                      >
                        Manager
                      </Button>
                    </Col>
                    <Col xs={6}>
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="w-100"
                        onClick={() => quickLogin('cashier@playground.com', 'cashier123')}
                      >
                        Cashier
                      </Button>
                    </Col>
                    <Col xs={6}>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        className="w-100"
                        onClick={() => quickLogin('supervisor@playground.com', 'super123')}
                      >
                        Supervisor
                      </Button>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;