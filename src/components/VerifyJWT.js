import React, { useState } from 'react';
import { useAuth } from "@frontegg/react";

const VerifyJWT = () => {
  const { user } = useAuth();
  const [verificationResult, setVerificationResult] = useState('');

  // ------------------------------------------------------------
  // Ensure you have a backend service to verify JWT tokens.
  // Sample repository: https://github.com/fxcircus/frontegg-JWT-Verify
  // TODO: Replace with your own backend service URL
  const serverUrl = 'http://0.0.0.0:8000/';
  // ------------------------------------------------------------
  
  const verifyToken = async () => {
    if (!user?.accessToken) {
      console.error("No access token available");
      return;
    }

    try {
      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Failed to verify JWT: ${text}.`);
      }

      setVerificationResult(text); // Display the text response
      console.log('JWT verified:', text);
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        setVerificationResult('Unable to connect to the server. Do you have a backend service that checks the token? Refer to the sample repository: https://github.com/fxcircus/frontegg-JWT-Verify');
      } else {
        setVerificationResult(error.message);
      }
      console.error('Error verifying JWT:', error);
    }
  };

  return (
    <div className="verify-jwt">
      <button className="action-button" onClick={verifyToken}>Verify JWT</button>
      <textarea
        className="jwt"
        readOnly
        value={verificationResult}
        style={{
          width: '100%',
          maxWidth: '600px',
          height: '150px',
          marginTop: '10px',
          border: '1px solid #d5dee2',
          borderRadius: '5px',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          color: '#37474f',
          fontFamily: 'Courier New, Courier, monospace',
          resize: 'none',
          overflow: 'auto',
        }}
      />
    </div>
  );
};

export default VerifyJWT; 