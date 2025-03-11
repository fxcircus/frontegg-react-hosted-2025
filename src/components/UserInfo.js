import React, { useState } from 'react';
import { useAuth, useStepUp, useIsSteppedUp } from "@frontegg/react";
import { jwtDecode } from "jwt-decode";
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
    maxHeight: "265px",
    maxWidth: "350px",
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
        <div className="info-section">
          <label className="info-label">User JWT</label>
          <p className="info-description">
            The JWT Frontegg issued for this user.
          </p>

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
        </div>
      </div>
      <div className="right-column">
        <div className="info-section">
          <label className="info-label">User ID</label>
          <p className="info-description">
            This is your unique User ID (sub) assigned by Frontegg.
          </p>
          <textarea
            cols="35"
            readOnly
            onClick={() => copyValue(user?.id)}
            style={{ cursor: cursorStyle }}
          >
            {user?.id}
          </textarea>
        </div>
        <div className="info-section">
          <label className="info-label">Active Account ID</label>
          <p className="info-description">
            This is the Account ID (tenantId) that is currently associated
            with this user. When the user logs in, they will be logged
            into this account.
          </p>
          <textarea
            cols="35"
            readOnly
            onClick={() => copyValue(user?.tenantId)}
            style={{ cursor: cursorStyle }}
          >
            {user?.tenantId}
          </textarea>
        </div>
        <div className="info-section">
          {/* <label className="info-label">Multi-Factor Authentication</label> */}
          <p className="info-description">
            Additional verification step before granting access to restricted app areas.
          </p>
          {isSteppedUp ? (
            <div className="stepped-up-message">You are STEPPED UP!</div>
          ) : (
            <button className="action-button" onClick={handleStepUp}>
              Step up MFA
            </button>
          )}
        </div>
      </div>
      {toastMessage && <div className="toast">{toastMessage}</div>}
    </div>
  );
};

export default UserInfo; 