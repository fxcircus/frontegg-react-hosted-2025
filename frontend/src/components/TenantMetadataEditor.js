import React, { useState, useEffect } from 'react';
import { useAuth } from "@frontegg/react";
import { createApiClient } from "@frontegg/rest-api";
import './TenantMetadataEditor.css';

const TenantMetadataEditor = ({ onUpdate, tenantId }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [metadata, setMetadata] = useState({});
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [isJsonValue, setIsJsonValue] = useState(false);
  
  // Create API client
  const api = createApiClient();
  
  // Use the provided tenantId or fall back to the user's current tenantId
  const activeTenantId = tenantId || user?.tenantId;
  
  useEffect(() => {
    if (activeTenantId) {
      fetchTenantMetadata();
    }
  }, [activeTenantId]);
  
  const fetchTenantMetadata = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch the tenant metadata
      const response = await api.tenants.getTenant(activeTenantId);
      setMetadata(response.metadata || {});
    } catch (err) {
      console.error('Error fetching tenant metadata:', err);
      setError('Failed to load tenant metadata');
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateTenantMetadata = async (newMetadata) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      // Update the tenant's metadata
      await api.tenants.updateTenant(activeTenantId, {
        metadata: newMetadata
      });
      
      setMetadata(newMetadata);
      setSuccess('Metadata updated successfully');
      
      // Notify parent component if callback provided
      if (onUpdate) {
        onUpdate(newMetadata);
      }
    } catch (err) {
      console.error('Error updating tenant metadata:', err);
      setError('Failed to update metadata');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddOrUpdate = (e) => {
    e.preventDefault();
    
    if (!key.trim()) {
      setError('Key cannot be empty');
      return;
    }
    
    try {
      // Parse value as JSON if isJsonValue is true
      const parsedValue = isJsonValue ? JSON.parse(value) : value;
      
      // Create a new metadata object with the updated/added key-value pair
      const updatedMetadata = {
        ...metadata,
        [key]: parsedValue
      };
      
      updateTenantMetadata(updatedMetadata);
      
      // Clear the form
      setKey('');
      setValue('');
      setIsJsonValue(false);
    } catch (err) {
      setError('Invalid JSON format');
    }
  };
  
  const handleDelete = (keyToDelete) => {
    // Create a copy of the metadata
    const updatedMetadata = { ...metadata };
    
    // Delete the specified key
    delete updatedMetadata[keyToDelete];
    
    updateTenantMetadata(updatedMetadata);
  };
  
  const handleClear = () => {
    // Confirm before clearing all metadata
    if (window.confirm('Are you sure you want to clear all metadata?')) {
      updateTenantMetadata({});
    }
  };
  
  return (
    <div className="tenant-metadata-editor">
      <h3>Edit Tenant Metadata</h3>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleAddOrUpdate} className="metadata-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="metadata-key">Key:</label>
            <input
              id="metadata-key"
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter metadata key"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="metadata-value">Value:</label>
            <textarea
              id="metadata-value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={isJsonValue ? '{"property": "value"}' : 'Enter metadata value'}
              disabled={isLoading}
              rows={3}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="checkbox-group">
            <input
              id="is-json"
              type="checkbox"
              checked={isJsonValue}
              onChange={(e) => setIsJsonValue(e.target.checked)}
              disabled={isLoading}
            />
            <label htmlFor="is-json">Value is JSON</label>
          </div>
          
          <div className="button-group">
            <button
              type="submit"
              className="action-button"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Add/Update'}
            </button>
            
            <button
              type="button"
              className="action-button clear-button"
              onClick={handleClear}
              disabled={isLoading || Object.keys(metadata).length === 0}
            >
              Clear All
            </button>
          </div>
        </div>
      </form>
      
      {Object.keys(metadata).length > 0 && (
        <div className="current-metadata">
          <h4>Current Metadata</h4>
          <table className="metadata-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(metadata).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>
                    <div className="value-container">
                      {typeof value === 'object' 
                        ? JSON.stringify(value) 
                        : String(value)
                      }
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(key)}
                      className="delete-button"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TenantMetadataEditor; 