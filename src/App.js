import "./App.css";
import { useEffect, useState } from "react";
import {
  useAuth,
  useLoginWithRedirect,
} from "@frontegg/react";
import UserProfile from './components/UserProfile';
import ActionButtons from './components/ActionButtons';
import AccountSwitcher from './components/AccountSwitcher';
import UserInfo from './components/UserInfo';
import EntitlementsInfo from './components/EntitlementsInfo';
import AppInfo from './components/AppInfo';

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
          <AppInfo />
          <UserProfile />
          <ActionButtons />
          <AccountSwitcher />
          <UserInfo />
          <EntitlementsInfo />
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
