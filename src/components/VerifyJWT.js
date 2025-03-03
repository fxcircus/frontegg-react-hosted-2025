import React, { useState } from 'react';
import { useAuth } from "@frontegg/react";

const VerifyJWT = () => {
  const { user } = useAuth();
  const [verificationResult, setVerificationResult] = useState('');

  const verifyToken = async () => {
    if (!user?.accessToken) {
      console.error("No access token available");
      return;
    }

    try {
      const response = await fetch('http://0.0.0.0:8000/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Failed to verify JWT: ${text}`);
      }

      setVerificationResult(text); // Display the text response
      console.log('JWT verified:', text);
    } catch (error) {
      setVerificationResult(error.message);
      console.error('Error verifying JWT:', error);
    }
  };

  return (
    <div className="verify-jwt" style={{ marginTop: '20px' }}>
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