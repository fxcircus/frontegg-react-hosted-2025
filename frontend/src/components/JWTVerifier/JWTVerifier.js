import React, { useState } from 'react';
import { useAuth } from '@frontegg/react';
import './JWTVerifier.css';
import '../DocsLink.css';
import Card from '../Card';
import Button from '../Button';

const JWTVerifier = () => {
  const { user } = useAuth();
  const [token, setToken] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const verifyToken = async () => {
    if (!token.trim()) {
      setVerificationResult({
        valid: false,
        errors: ['Please enter a JWT token']
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token.trim() })
      });

      const result = await response.json();
      setVerificationResult(result);
    } catch (error) {
      setVerificationResult({
        valid: false,
        errors: ['Failed to verify token: ' + error.message]
      });
    } finally {
      setLoading(false);
    }
  };

  const useCurrentToken = () => {
    if (user?.accessToken) {
      setToken(user.accessToken);
    }
  };

  const clearResults = () => {
    setToken('');
    setVerificationResult(null);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getValidationIcon = (status) => {
    return status === 'valid' ? '✅' : '❌';
  };

  return (
    <div className="jwt-verifier-page">
      <div className="page-header">
        <div className="page-title-wrapper">
          <h1>JWT Token Verifier</h1>
          <a href="https://developers.frontegg.com/guides/integrations/protect-backend-api/validate-jwt#validate-jwt-token-without-frontegg-middleware" 
             target="_blank" 
             rel="noopener noreferrer"
             className="docs-link"
             title="Learn how to validate JWT tokens without Frontegg middleware">
            <span className="tooltip-icon">?</span>
          </a>
        </div>
        <p>Validate and inspect JWT tokens with comprehensive checks</p>
      </div>

      <div className="verifier-content">
        <Card title="Token Input" className="input-card">
          <div className="token-input-section">
            <label htmlFor="token-input">JWT Token:</label>
            <textarea
              id="token-input"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your JWT token here..."
              rows={6}
              className="token-textarea"
            />
            <div className="input-actions">
              <Button onClick={useCurrentToken} variant="secondary" size="small">
                Use My Current Token
              </Button>
              <Button onClick={clearResults} variant="outline" size="small">
                Clear
              </Button>
            </div>
          </div>
          <div className="verify-action">
            <Button
              onClick={verifyToken}
              disabled={loading || !token.trim()}
              variant="primary"
              size="large"
            >
              {loading ? 'Verifying...' : 'Verify Token'}
            </Button>
          </div>
        </Card>

        {verificationResult && (
          <>
            <Card title="Verification Result" className={`result-card ${verificationResult.valid ? 'valid' : 'invalid'}`}>
              <div className="overall-result">
                <span className="result-icon">{verificationResult.valid ? '✅' : '❌'}</span>
                <span className="result-text">
                  Token is {verificationResult.valid ? 'VALID' : 'INVALID'}
                </span>
              </div>

              <div className="validation-details">
                <h3>Validation Checks:</h3>
                <div className="check-grid">
                  <div className="check-item">
                    <span className="check-icon">{getValidationIcon(verificationResult.validation?.signature)}</span>
                    <span className="check-label">Signature</span>
                  </div>
                  <div className="check-item">
                    <span className="check-icon">{getValidationIcon(verificationResult.validation?.audience)}</span>
                    <span className="check-label">Audience (aud)</span>
                  </div>
                  <div className="check-item">
                    <span className="check-icon">{getValidationIcon(verificationResult.validation?.issuer)}</span>
                    <span className="check-label">Issuer (iss)</span>
                  </div>
                  <div className="check-item">
                    <span className="check-icon">{getValidationIcon(verificationResult.validation?.expiration)}</span>
                    <span className="check-label">Expiration</span>
                  </div>
                  <div className="check-item">
                    <span className="check-icon">{getValidationIcon(verificationResult.validation?.format)}</span>
                    <span className="check-label">Format</span>
                  </div>
                </div>
              </div>

              {verificationResult.errors && verificationResult.errors.length > 0 && (
                <div className="errors-section">
                  <h3>Errors:</h3>
                  <ul className="error-list">
                    {verificationResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            {verificationResult.decoded && (
              <Card title="Token Details" className="details-card">
                {verificationResult.decoded.header && (
                  <div className="detail-section">
                    <h3>Header:</h3>
                    <pre className="json-display">
                      {JSON.stringify(verificationResult.decoded.header, null, 2)}
                    </pre>
                  </div>
                )}

                {verificationResult.decoded.payload && (
                  <div className="detail-section">
                    <h3>Payload:</h3>
                    <div className="payload-details">
                      <div className="detail-item">
                        <span className="detail-label">Subject (sub):</span>
                        <span className="detail-value">{verificationResult.decoded.payload.sub || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{verificationResult.decoded.payload.email || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Name:</span>
                        <span className="detail-value">{verificationResult.decoded.payload.name || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Audience (aud):</span>
                        <span className="detail-value">{verificationResult.decoded.payload.aud || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Issuer (iss):</span>
                        <span className="detail-value">{verificationResult.decoded.payload.iss || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Issued At:</span>
                        <span className="detail-value">{formatDate(verificationResult.decoded.payload.iat)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Expires At:</span>
                        <span className="detail-value">{formatDate(verificationResult.decoded.payload.exp)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Tenant ID:</span>
                        <span className="detail-value">{verificationResult.decoded.payload.tenantId || 'N/A'}</span>
                      </div>
                    </div>

                    {verificationResult.decoded.payload.permissions && (
                      <div className="permissions-section">
                        <h4>Permissions:</h4>
                        <div className="permission-list">
                          {verificationResult.decoded.payload.permissions.length > 0 ? (
                            verificationResult.decoded.payload.permissions.map((perm, index) => (
                              <span key={index} className="permission-tag">{perm}</span>
                            ))
                          ) : (
                            <span className="no-permissions">No permissions</span>
                          )}
                        </div>
                      </div>
                    )}

                    {verificationResult.decoded.payload.roles && (
                      <div className="roles-section">
                        <h4>Roles:</h4>
                        <div className="role-list">
                          {verificationResult.decoded.payload.roles.length > 0 ? (
                            verificationResult.decoded.payload.roles.map((role, index) => (
                              <span key={index} className="role-tag">{role}</span>
                            ))
                          ) : (
                            <span className="no-roles">No roles</span>
                          )}
                        </div>
                      </div>
                    )}

                    <details className="raw-payload">
                      <summary>View Raw Payload</summary>
                      <pre className="json-display">
                        {JSON.stringify(verificationResult.decoded.payload, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}

                {verificationResult.decoded.signature && (
                  <div className="detail-section">
                    <h3>Signature:</h3>
                    <code className="signature">{verificationResult.decoded.signature}</code>
                  </div>
                )}

                {verificationResult.decoded.payload?.warning && (
                  <div className="warning-section">
                    <p>⚠️ {verificationResult.decoded.payload.warning}</p>
                  </div>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JWTVerifier;