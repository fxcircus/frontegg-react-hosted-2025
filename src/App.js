import "./App.css";
import { useEffect } from "react";
import {
  useAuth,
  useLoginWithRedirect,
} from "@frontegg/react";
import UserProfile from './components/UserProfile';
import ActionButtons from './components/ActionButtons';
import UserInfo from './components/UserInfo';
import EntitlementsInfo from './components/EntitlementsInfo';
import AppInfo from './components/AppInfo';
import VerifyJWT from './components/VerifyJWT';
import Navbar from './components/Navbar';

function App() {
  const { isAuthenticated } = useAuth();
  const loginWithRedirect = useLoginWithRedirect();

  useEffect(() => {
    if (!isAuthenticated) {
      loginWithRedirect({});
    }
  }, [isAuthenticated, loginWithRedirect]);

  return (
    <div className="App">
      {isAuthenticated ? (
        <div className="user-zone">
          <h1 className="app-title">🥚🥚🥚 Frontegg Demo App 🥚🥚🥚</h1>
          <Navbar />
          <UserInfo />
          <div className="info-layout divider">
            <VerifyJWT /> {/* Ensure you have the backend server running to decode the JWT token. Here is a simple example: https://github.com/fxcircus/frontegg-JWT-Verify */}
            <EntitlementsInfo />
          </div>
        </div>
      ) : (
        <div className="login-section">
          <h1 onClick={() => loginWithRedirect()}>No Session, Redirecting.</h1>
        </div>
      )}
    </div>
  );
}

export default App;
