import { Outlet, useNavigate, useLocation } from 'react-router';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';
import { PriceProvider } from '../context/PriceContext';
import { DeploymentAlert } from './DeploymentAlert';
import { useState, useEffect } from 'react';
import type { AppContextType } from '../hooks/useAppContext';

export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<'demo' | 'real'>('demo');

  // Check authentication status from localStorage
  useEffect(() => {
    const token = localStorage.getItem('investoft_token');
    const uid = localStorage.getItem('investoft_user_id');
    const role = localStorage.getItem('investoft_user_role');
    
    if (token && uid) {
      setIsAuthenticated(true);
      setUserRole(role);
      setAccessToken(token);
      setUserId(uid);
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
      setAccessToken(null);
      setUserId(null);
    }
  }, [location.pathname]); // Re-check on route change

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('investoft_token');
    localStorage.removeItem('investoft_user_id');
    localStorage.removeItem('investoft_user_email');
    localStorage.removeItem('investoft_user_role');
    localStorage.removeItem('investoft_user_name');
    setIsAuthenticated(false);
    setUserRole(null);
    setAccessToken(null);
    setUserId(null);
    navigate('/');
  };

  // Hide header/footer on specific pages
  const hideHeaderFooter = ['/login', '/member', '/admin', '/real-trading'].some(path => 
    location.pathname.startsWith(path)
  );

  // Context to pass to child routes
  const contextValue: AppContextType = {
    isAuthenticated,
    accessToken,
    userId,
    userRole,
    accountType,
    setAccountType,
    handleLogout,
    onLoginClick: handleLoginClick,
    onSignupClick: handleSignupClick,
  };

  return (
    <PriceProvider>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        {!hideHeaderFooter && (
          <PublicHeader 
            onLoginClick={handleLoginClick}
            onSignupClick={handleSignupClick}
            isAuthenticated={isAuthenticated}
            userRole={userRole}
            onLogout={handleLogout}
          />
        )}
        
        <main className="flex-1">
          <Outlet context={contextValue} />
        </main>
        
        {!hideHeaderFooter && <PublicFooter />}
        <DeploymentAlert />
      </div>
    </PriceProvider>
  );
}