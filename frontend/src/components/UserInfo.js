import React, { useState } from 'react';
import { useAuth, useStepUp, useIsSteppedUp, ContextHolder } from "@frontegg/react";
import { jwtDecode } from "jwt-decode";
import Card from './Card';
import Toast from './Toast';
import "../App.css";

const UserInfo = () => {
  const { user } = useAuth();
  const [showDecodedToken, setShowDecodedToken] = useState(false);
  const [cursorStyle, setCursorStyle] = useState("pointer");
  const [toastMessage, setToastMessage] = useState("");

  const stepUp = useStepUp();
  const MAX_AGE = 60;
  const isSteppedUp = useIsSteppedUp({ maxAge: MAX_AGE });

  const copyValue = (value) => {
    navigator.clipboard.writeText(value);
    setCursorStyle("copy");
    setToastMessage("Copied to clipboard!");
    setTimeout(() => {
      setToastMessage("");
      setCursorStyle("pointer");
    }, 1000);
  };

  const toggleTokenView = () => {
    setShowDecodedToken(!showDecodedToken);
  };

  const renderDecodedToken = (decodedToken) => {
    const formatValue = (value) => {
      if (typeof value === "object" && value !== null) {
        return JSON.stringify(value, null, 2);
      }
      return JSON.stringify(value);
    };

    const entries = Object.entries(decodedToken);

    return (
      <pre
        style={{
          textAlign: "left",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          fontFamily: "monospace",
        }}
      >
        {"{"}
        {entries.map(([key, value], index) => (
          <div key={index} style={{ marginBottom: "5px" }}>
            <span style={{ fontWeight: "bold", color: "#42a5f5" }}>{key}:</span>{" "}
            {formatValue(value)}
            {index < entries.length - 1 ? "," : ""}
          </div>
        ))}
        {"}"}
      </pre>
    );
  };

  const tokenContent = user?.accessToken
    ? showDecodedToken
      ? renderDecodedToken(jwtDecode(user.accessToken))
      : user.accessToken
    : "";

  const jwtContainerStyle = {
    cursor: cursorStyle,
    backgroundColor: "#f5f5f5",
    paddingLeft: "10px",
    borderRadius: "4px",
    maxHeight: "200px",
    maxWidth: "600px",
    overflowY: "scroll",
    border: "1px solid #d5dee2",
    transition: "background-color 0.3s",
  };

  const jwtContainerHoverStyle = {
    ...jwtContainerStyle,
    backgroundColor: "#e0e0e0",
  };

  const handleStepUp = () => {
    stepUp({ maxAge: MAX_AGE });
  };

  return (
    <div className="info-layout">
      <div className="left-column">
        <Card title="User JWT" subtitle="The JWT Frontegg issued for this user. Click to copy.">

          {showDecodedToken ? (
            <div
              className="jwt-container"
              onClick={() => copyValue(JSON.stringify(jwtDecode(user?.accessToken), null, 2))}
              style={jwtContainerStyle}
              onMouseEnter={() => setCursorStyle("copy")}
              onMouseLeave={() => setCursorStyle("pointer")}
            >
              {tokenContent}
            </div>
          ) : (
            <textarea
              className="jwt"
              cols="70"
              rows="10"
              value={user?.accessToken}
              readOnly
              onClick={() => copyValue(user?.accessToken)}
              aria-label="JWT Token - Click to copy"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  copyValue(user?.accessToken);
                }
              }}
              style={{
                cursor: cursorStyle,
                backgroundColor: "#f5f5f5",
                padding: "10px",
                borderRadius: "4px",
                maxHeight: "300px",
                overflowY: "scroll",
                border: "1px solid #d5dee2",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={() => setCursorStyle("copy")}
              onMouseLeave={() => setCursorStyle("pointer")}
            />
          )}

          <div className="toggle-container">
            <label className="toggle-label">Show Decoded Token</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={showDecodedToken}
                onChange={toggleTokenView}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </Card>
      </div>
      <div className="right-column">
        <Card title="User ID" subtitle="Your unique User ID (sub) assigned by Frontegg.">
          <textarea
            cols="35"
            readOnly
            onClick={() => copyValue(user?.id)}
            aria-label="User ID - Click to copy"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                copyValue(user?.id);
              }
            }}
            style={{ cursor: cursorStyle }}
          >
            {user?.id}
          </textarea>
        </Card>
        <Card title="Active Account ID" subtitle="The Account ID (tenantId) currently associated with this user.">
          <textarea
            cols="35"
            readOnly
            onClick={() => copyValue(user?.tenantId)}
            aria-label="Tenant ID - Click to copy"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                copyValue(user?.tenantId);
              }
            }}
            style={{ cursor: cursorStyle }}
          >
            {user?.tenantId}
          </textarea>
        </Card>
        <Card title="Multi-Factor Authentication" subtitle="Additional verification step before granting access to restricted app areas.">
          {isSteppedUp ? (
            <div className="stepped-up-message">You are STEPPED UP!</div>
          ) : (
            <button 
              className="action-button" 
              onClick={handleStepUp}
              aria-label="Initiate multi-factor authentication step-up"
            >
              Step up MFA
            </button>
          )}
        </Card>
      </div>
      <Toast 
        message={toastMessage} 
        type="success" 
        onClose={() => setToastMessage('')} 
      />
    </div>
  );
};

export default UserInfo; 