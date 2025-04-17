import "./App.css";
import { useEffect } from "react";
import {
  useAuth,
  useLoginWithRedirect,
} from "@frontegg/react";

import UserInfo from './components/UserInfo';
import EntitlementsInfo from './components/EntitlementsInfo';
import VerifyJWT from './components/VerifyJWT';
import Navbar from './components/Navbar';
import TenantHierarchySwitcher from './components/TenantHierarchySwitcher';

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
          <div className="app-layout">
            <div className="main-content">
              <UserInfo />
              <div className="info-layout divider">
                <VerifyJWT />
                <EntitlementsInfo />
              </div>
            </div>
            {/* <div className="sidebar">
              <TenantHierarchySwitcher title="Tenant Hierarchy" />
            </div> */}
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
