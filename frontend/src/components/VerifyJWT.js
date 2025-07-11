import React, { useState } from 'react';
import { useAuth } from "@frontegg/react";
import { jwtDecode } from 'jwt-decode';
import Card from './Card';

const VerifyJWT = () => {
  const { user } = useAuth();
  const [verificationResult, setVerificationResult] = useState('');
  const [showDecoded, setShowDecoded] = useState(false);

  const verifyToken = () => {
    if (!user?.accessToken) {
      setVerificationResult("No access token available");
      return;
    }

    try {
      // Decode the JWT token
      const decoded = jwtDecode(user.accessToken);
      
      // Check if token is expired
      const currentTime = Date.now() / 1000;
      const isExpired = decoded.exp && decoded.exp < currentTime;
      
      // Format the verification result
      const result = {
        status: isExpired ? 'expired' : 'valid',
        issuedAt: decoded.iat ? new Date(decoded.iat * 1000).toLocaleString() : 'N/A',
        expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toLocaleString() : 'N/A',
        issuer: decoded.iss || 'N/A',
        subject: decoded.sub || 'N/A',
        audience: decoded.aud || 'N/A',
        claims: decoded
      };
      
      if (showDecoded) {
        setVerificationResult(JSON.stringify(result, null, 2));
      } else {
        setVerificationResult(
          `JWT Status: ${result.status.toUpperCase()}\n` +
          `Issued At: ${result.issuedAt}\n` +
          `Expires At: ${result.expiresAt}\n` +
          `Issuer: ${result.issuer}\n` +
          `Subject: ${result.subject}`
        );
      }
    } catch (error) {
      setVerificationResult(`Error decoding JWT: ${error.message}`);
      console.error('Error verifying JWT:', error);
    }
  };

  return (
    <Card title="JWT Verification" subtitle="Verify and decode your JWT token">
      <div className="verify-jwt">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <button className="action-button" onClick={verifyToken}>Verify JWT</button>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', color: 'var(--secondary-color)' }}>
            <input
              type="checkbox"
              checked={showDecoded}
              onChange={(e) => setShowDecoded(e.target.checked)}
              style={{ marginRight: '5px' }}
            />
            Show full decoded token
          </label>
        </div>
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
    </Card>
  );
};

export default VerifyJWT; 