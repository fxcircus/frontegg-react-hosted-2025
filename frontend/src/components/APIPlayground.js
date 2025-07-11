import React, { useState } from 'react';
import { useAuth } from "@frontegg/react";
import Card from './Card';
import './APIPlayground.css';

const APIPlayground = () => {
  const { user } = useAuth();
  const [selectedEndpoint, setSelectedEndpoint] = useState('GET');
  const [url, setUrl] = useState('/identity/resources/users/v2');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(null);
  const [headers, setHeaders] = useState({});
  const [showHeaders, setShowHeaders] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copySuccess, setCopySuccess] = useState(false);

  // Common Frontegg API endpoints organized by category
  const commonEndpoints = [
    { method: 'GET', path: '/identity/resources/users/v2', description: 'List all users', category: 'users' },
    { method: 'GET', path: '/identity/resources/me', description: 'Get current user', category: 'users' },
    { method: 'POST', path: '/identity/resources/users/v2', description: 'Create new user', category: 'users' },
    { method: 'GET', path: '/identity/resources/tenants/v1', description: 'List tenants', category: 'tenants' },
    { method: 'GET', path: '/identity/resources/tenants/hierarchy', description: 'Get tenant hierarchy', category: 'tenants' },
    { method: 'GET', path: '/identity/resources/roles/v1', description: 'List roles', category: 'auth' },
    { method: 'GET', path: '/identity/resources/permissions/v1', description: 'List permissions', category: 'auth' },
    { method: 'POST', path: '/identity/resources/auth/v1/api-token', description: 'Create API token', category: 'auth' },
    { method: 'GET', path: '/audits/v1', description: 'Get audit logs', category: 'audit' },
    { method: 'GET', path: '/audits/v1/stats', description: 'Get audit statistics', category: 'audit' },
  ];

  const categories = [
    { value: 'all', label: 'All Endpoints' },
    { value: 'users', label: 'Users' },
    { value: 'tenants', label: 'Tenants' },
    { value: 'auth', label: 'Auth & Roles' },
    { value: 'audit', label: 'Audit' },
  ];

  const filteredEndpoints = selectedCategory === 'all' 
    ? commonEndpoints 
    : commonEndpoints.filter(e => e.category === selectedCategory);

  const executeRequest = async () => {
    setIsLoading(true);
    setResponse(null);
    const startTime = performance.now();

    try {
      const baseUrl = process.env.REACT_APP_BASE_URL;
      const fullUrl = `${baseUrl}${url}`;
      
      const defaultHeaders = {
        'Authorization': `Bearer ${user?.accessToken}`,
        'Content-Type': 'application/json',
        'frontegg-tenant-id': user?.tenantId
      };

      const options = {
        method: selectedEndpoint,
        headers: {
          ...defaultHeaders,
          ...headers
        }
      };

      if (selectedEndpoint !== 'GET' && requestBody) {
        try {
          options.body = JSON.stringify(JSON.parse(requestBody));
        } catch (e) {
          throw new Error('Invalid JSON in request body');
        }
      }

      const res = await fetch(fullUrl, options);
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));

      const data = await res.text();
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch {
        parsedData = data;
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data: parsedData
      });
    } catch (error) {
      setResponse({
        error: true,
        message: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyAsCurl = () => {
    const baseUrl = process.env.REACT_APP_BASE_URL;
    const defaultHeaders = {
      'Authorization': `Bearer ${user?.accessToken}`,
      'Content-Type': 'application/json',
      'frontegg-tenant-id': user?.tenantId
    };
    
    const allHeaders = { ...defaultHeaders, ...headers };
    let curlCommand = `curl -X ${selectedEndpoint} \\
  '${baseUrl}${url}'`;
    
    Object.entries(allHeaders).forEach(([key, value]) => {
      curlCommand += ` \\
  -H '${key}: ${value}'`;
    });

    if (selectedEndpoint !== 'GET' && requestBody) {
      curlCommand += ` \\
  -d '${requestBody}'`;
    }

    navigator.clipboard.writeText(curlCommand);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(requestBody);
      setRequestBody(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // Invalid JSON, do nothing
    }
  };

  return (
    <div className="api-playground">
      <div className="api-header">
        <h1>API Playground</h1>
        <p>Test Frontegg APIs with your current authentication</p>
      </div>

      <div className="api-content">
        <Card title="Request Builder" className="request-card">
          <div className="endpoint-selector">
            <select 
              value={selectedEndpoint} 
              onChange={(e) => setSelectedEndpoint(e.target.value)}
              className="method-select"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/api/endpoint"
              className="url-input"
            />
          </div>

          <div className="common-endpoints">
            <div className="endpoints-header">
              <h4>Common Endpoints</h4>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="endpoint-list">
              {filteredEndpoints.map((endpoint, index) => (
                <button
                  key={index}
                  className="endpoint-item"
                  onClick={() => {
                    setSelectedEndpoint(endpoint.method);
                    setUrl(endpoint.path);
                  }}
                >
                  <span className={`method-badge ${endpoint.method.toLowerCase()}`}>
                    {endpoint.method}
                  </span>
                  <span className="endpoint-path">{endpoint.path}</span>
                  <span className="endpoint-desc">{endpoint.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Headers Section */}
          <div className="custom-headers">
            <div className="headers-toggle">
              <h4>Headers</h4>
              <button 
                className="toggle-headers-btn"
                onClick={() => setShowHeaders(!showHeaders)}
              >
                {showHeaders ? 'Hide' : 'Add Custom Headers'}
              </button>
            </div>
            {showHeaders && (
              <div className="headers-editor">
                <textarea
                  value={Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join('\n')}
                  onChange={(e) => {
                    const newHeaders = {};
                    e.target.value.split('\n').forEach(line => {
                      const [key, ...valueParts] = line.split(':');
                      if (key && valueParts.length) {
                        newHeaders[key.trim()] = valueParts.join(':').trim();
                      }
                    });
                    setHeaders(newHeaders);
                  }}
                  placeholder="X-Custom-Header: value&#10;Another-Header: value"
                  rows={4}
                  className="headers-input"
                />
              </div>
            )}
          </div>

          {selectedEndpoint !== 'GET' && (
            <div className="request-body">
              <div className="body-header">
                <h4>Request Body</h4>
                <button 
                  onClick={formatJson} 
                  className="format-json-btn"
                  title="Format JSON"
                >
                  Format JSON
                </button>
              </div>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder='{\n  "key": "value"\n}'
                rows={8}
                className="body-input"
              />
            </div>
          )}

          <div className="request-actions">
            <button 
              onClick={executeRequest} 
              disabled={isLoading}
              className="execute-btn"
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Executing...
                </>
              ) : (
                'Execute Request'
              )}
            </button>
            <button 
              onClick={copyAsCurl} 
              className={`copy-curl-btn ${copySuccess ? 'copied' : ''}`}
            >
              {copySuccess ? 'Copied!' : 'Copy as cURL'}
            </button>
          </div>
        </Card>

        {response && (
          <Card title="Response" className="response-card">
            <div className="response-header">
              <div className="response-status">
                <span className={`status-code ${response.error || response.status >= 400 ? 'error' : 'success'}`}>
                  {response.error ? 'Error' : response.status}
                </span>
                {response.statusText && <span className="status-text">{response.statusText}</span>}
              </div>
              {responseTime && (
                <div className="response-time">
                  Response time: {responseTime}ms
                </div>
              )}
            </div>

            {response.headers && (
              <details className="response-headers">
                <summary>Response Headers</summary>
                <pre>{JSON.stringify(response.headers, null, 2)}</pre>
              </details>
            )}

            <div className="response-body">
              <div className="response-body-header">
                <h4>Response Body</h4>
                <button 
                  onClick={() => {
                    const data = response.error 
                      ? response.message 
                      : JSON.stringify(response.data, null, 2);
                    navigator.clipboard.writeText(data);
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                  }}
                  className="copy-response-btn"
                >
                  Copy Response
                </button>
              </div>
              <pre className="response-data">
                {response.error 
                  ? response.message 
                  : JSON.stringify(response.data, null, 2)
                }
              </pre>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default APIPlayground;