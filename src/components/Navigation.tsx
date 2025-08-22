import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Offcanvas, Button, Badge } from 'react-bootstrap';
import { useAuth, hasPermission } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import {
  Home,
  UserPlus,
  MapPin,
  Calendar,
  Shield,
  BarChart3,
  LogOut,
  Users,
  Menu,
  X
} from 'lucide-react';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path: string, label: string) => {
    if (location.pathname !== path) {
      setLoading(true, `Loading ${label}...`);
      // Simulate loading time for better UX
      setTimeout(() => {
        setLoading(false);
      }, 800);
    }
  };

  const navigationItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: Home,
      roles: ['owner', 'manager', 'cashier', 'supervisor']
    },
    {
      path: '/admission',
      label: 'Admission',
      icon: UserPlus,
      roles: ['owner', 'manager', 'cashier', 'supervisor']
    },
    {
      path: '/zones',
      label: 'Zones',
      icon: MapPin,
      roles: ['owner', 'manager', 'supervisor']
    },
    {
      path: '/parties',
      label: 'Parties',
      icon: Calendar,
      roles: ['owner', 'manager', 'cashier']
    },
    {
      path: '/safety',
      label: 'Safety',
      icon: Shield,
      roles: ['owner', 'manager', 'supervisor']
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: BarChart3,
      roles: ['owner', 'manager']
    }
  ];

  const visibleItems = navigationItems.filter(item => 
    hasPermission(user.role, item.roles as any)
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-500';
      case 'manager': return 'bg-blue-500';
      case 'cashier': return 'bg-green-500';
      case 'supervisor': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className="nav-sidebar d-none d-lg-flex flex-column position-fixed" style={{ width: '16rem', height: '100vh', zIndex: 1000 }}>
        <div className="d-flex align-items-center justify-content-center border-bottom p-3" style={{ height: '4rem' }}>
          <div className="d-flex align-items-center">
            <Users className="text-primary me-2" size={32} />
            <span className="h5 fw-bold text-dark font-kid-friendly mb-0">
              Playtopia
            </span>
          </div>
        </div>

        <div className="flex-grow-1 d-flex flex-column overflow-auto">
          <div className="p-3">
            <div className="d-flex align-items-center mb-4">
              <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${getRoleColor(user.role)}`}
                   style={{ width: '2.5rem', height: '2.5rem' }}>
                <span className="text-white fw-bold small">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="small fw-medium text-dark mb-0">{user.name}</p>
                <p className="text-muted small mb-0 text-capitalize">{user.role}</p>
              </div>
            </div>

            <Nav className="flex-column">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Nav.Link
                    key={item.path}
                    as={Link}
                    to={item.path}
                    onClick={() => handleNavigation(item.path, item.label)}
                    className={`nav-link-custom ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={20} className="me-3" />
                    <span>{item.label}</span>
                  </Nav.Link>
                );
              })}
            </Nav>
          </div>

          <div className="p-3 border-top mt-auto">
            <Button
              variant="outline-secondary"
              className="w-100 d-flex align-items-center justify-content-start"
              onClick={handleLogout}
            >
              <LogOut size={20} className="me-3" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="d-lg-none">
        <Navbar bg="white" className="border-bottom">
          <div className="d-flex align-items-center">
            <Users className="text-primary me-2" size={24} />
            <Navbar.Brand className="font-kid-friendly fw-bold mb-0">
              Playtopia
            </Navbar.Brand>
          </div>
          
          <Button
            variant="outline-secondary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </Navbar>

        <Offcanvas
          show={isMobileMenuOpen}
          onHide={() => setIsMobileMenuOpen(false)}
          placement="end"
          className="mobile-menu"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title className="font-kid-friendly">Menu</Offcanvas.Title>
          </Offcanvas.Header>
          
          <Offcanvas.Body>
            <div className="d-flex align-items-center mb-4">
              <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${getRoleColor(user.role)}`}
                   style={{ width: '2.5rem', height: '2.5rem' }}>
                <span className="text-white fw-bold small">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="small fw-medium text-dark mb-0">{user.name}</p>
                <p className="text-muted small mb-0 text-capitalize">{user.role}</p>
              </div>
            </div>

            <Nav className="flex-column mb-4">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Nav.Link
                    key={item.path}
                    as={Link}
                    to={item.path}
                    onClick={() => {
                      handleNavigation(item.path, item.label);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`nav-link-custom ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={20} className="me-3" />
                    <span>{item.label}</span>
                  </Nav.Link>
                );
              })}
            </Nav>

            <Button
              variant="outline-secondary"
              className="w-100 d-flex align-items-center justify-content-start"
              onClick={handleLogout}
            >
              <LogOut size={20} className="me-3" />
              <span>Sign Out</span>
            </Button>
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    </>
  );
};

export default Navigation;