import { useOutletContext } from "react-router";

export interface AppContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  userId: string | null;
  userRole: string | null;
  accountType: 'demo' | 'real';
  setAccountType: (type: 'demo' | 'real') => void;
  handleLogout: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export function useAppContext() {
  return useOutletContext<AppContextType>();
}