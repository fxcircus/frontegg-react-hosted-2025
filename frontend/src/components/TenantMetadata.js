import React, { useState, useEffect } from 'react';
import { useAuth, useTenantsState, useGroupsState, useAuthActions } from "@frontegg/react";
import { createApiClient } from "@frontegg/rest-api";
import Card from './Card';
import LoadingSpinner from './LoadingSpinner';
import Toast from './Toast';
import './TenantMetadata.css';
import TenantMetadataEditor from './TenantMetadataEditor';

const TenantMetadata = () => {
  const { user } = useAuth();
  const { tenants } = useTenantsState();
  const { groups } = useGroupsState();
  const { loadGroups } = useAuthActions();
  const [tenantsData, setTenantsData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState(user?.tenantId);
  const [expandedSections, setExpandedSections] = useState({});
  
  // Create API client
  const api = createApiClient();
  
  useEffect(() => {
    if (tenants && tenants.length > 0) {
      fetchAllTenantsData();
    }
  }, [tenants]);
  
  useEffect(() => {
    setSelectedTenantId(user?.tenantId);
  }, [user?.tenantId]);

  useEffect(() => {
    loadGroups();
  }, []);
  
  const fetchAllTenantsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const dataPromises = tenants.map(async (tenant) => {
        try {
          // Initialize tenant data with basic info
          let tenantData = {
            tenantId: tenant.tenantId,
            tenantName: tenant.name,
            metadata: {},
            subTenants: [],
            isActive: true
          };

          // Try to fetch detailed tenant information
          try {
            if (api && api.tenants && api.tenants.getTenant) {
              const tenantDetails = await api.tenants.getTenant(tenant.tenantId);
              tenantData = {
                ...tenantData,
                details: tenantDetails,
                metadata: tenantDetails.metadata || {},
                createdAt: tenantDetails.createdAt,
                updatedAt: tenantDetails.updatedAt,
                isActive: tenantDetails.isActive !== false,
              };
            }
          } catch (detailErr) {
            console.warn(`Could not fetch details for tenant ${tenant.tenantId}:`, detailErr);
          }
          
          // Try to fetch sub-tenants (may fail for non-hierarchical setups)
          try {
            if (api && api.tenants && api.tenants.getSubTenantsAsTree) {
              const subTenantsTree = await api.tenants.getSubTenantsAsTree();
              tenantData.subTenants = findSubTenants(subTenantsTree, tenant.tenantId);
            }
          } catch (subErr) {
            // Ignore sub-tenant errors
          }

          return tenantData;
        } catch (err) {
          console.error(`Error processing tenant ${tenant.tenantId}:`, err);
          return {
            tenantId: tenant.tenantId,
            tenantName: tenant.name,
            metadata: {},
            error: err.message
          };
        }
      });
      
      const results = await Promise.all(dataPromises);
      
      // Convert array to object with tenantId as key
      const dataMap = results.reduce((acc, item) => {
        acc[item.tenantId] = item;
        return acc;
      }, {});
      
      setTenantsData(dataMap);
    } catch (err) {
      console.error('Error fetching tenants data:', err);
      setError('Failed to load tenants data');
    } finally {
      setIsLoading(false);
    }
  };

  const findSubTenants = (tree, parentId) => {
    let subTenants = [];
    
    const findInTree = (nodes) => {
      for (const node of nodes) {
        if (node.tenantId === parentId && node.children) {
          return node.children;
        }
        if (node.children) {
          const found = findInTree(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    const foundChildren = findInTree(Array.isArray(tree) ? tree : [tree]);
    return foundChildren || [];
  };
  
  const copyValue = (value) => {
    navigator.clipboard.writeText(value);
    setToastMessage("Copied to clipboard!");
    setTimeout(() => setToastMessage(""), 2000);
  };

  const toggleSection = (tenantId, section) => {
    setExpandedSections(prev => ({
      ...prev,
      [`${tenantId}-${section}`]: !prev[`${tenantId}-${section}`]
    }));
  };
  
  const handleMetadataUpdate = (newMetadata) => {
    if (selectedTenantId) {
      setTenantsData(prev => ({
        ...prev,
        [selectedTenantId]: {
          ...prev[selectedTenantId],
          metadata: newMetadata
        }
      }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  const renderTenantSelector = () => {
    if (!tenants || tenants.length === 0) {
      return <p>No tenants available.</p>;
    }
    
    return (
      <div className="tenant-selector">
        <label htmlFor="tenant-select">Select Tenant:</label>
        <select 
          id="tenant-select"
          value={selectedTenantId || ''}
          onChange={(e) => setSelectedTenantId(e.target.value)}
        >
          {tenants.map(tenant => (
            <option key={tenant.tenantId} value={tenant.tenantId}>
              {tenant.name} {tenant.tenantId === user?.tenantId ? '(current)' : ''}
            </option>
          ))}
        </select>
      </div>
    );
  };
  
  const renderTenantDetails = (tenantId) => {
    const data = tenantsData[tenantId];
    
    if (!data) {
      return <p>No data available for this tenant.</p>;
    }
    
    if (data.error) {
      return <p className="error-message">Error: {data.error}</p>;
    }

    const sectionExpanded = (section) => expandedSections[`${tenantId}-${section}`];
    
    return (
      <div className="tenant-details">
        {/* Basic Information */}
        <div className="tenant-section">
          <h4 
            className="section-header clickable"
            onClick={() => toggleSection(tenantId, 'basic')}
          >
            <span className="toggle-icon">{sectionExpanded('basic') ? '▼' : '▶'}</span>
            Basic Information
          </h4>
          {sectionExpanded('basic') && (
            <div className="section-content">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Tenant ID:</span>
                  <code 
                    className="info-value clickable" 
                    onClick={() => copyValue(data.tenantId)}
                  >
                    {data.tenantId}
                  </code>
                </div>
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{data.tenantName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className={`status-badge ${data.isActive ? 'active' : 'inactive'}`}>
                    {data.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Created:</span>
                  <span className="info-value">{formatDate(data.createdAt)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Updated:</span>
                  <span className="info-value">{formatDate(data.updatedAt)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Custom Metadata */}
        <div className="tenant-section">
          <h4 
            className="section-header clickable"
            onClick={() => toggleSection(tenantId, 'metadata')}
          >
            <span className="toggle-icon">{sectionExpanded('metadata') ? '▼' : '▶'}</span>
            Custom Metadata ({Object.keys(data.metadata).length})
          </h4>
          {sectionExpanded('metadata') && (
            <div className="section-content">
              {Object.keys(data.metadata).length === 0 ? (
                <p className="no-data">No custom metadata defined</p>
              ) : (
                <table className="metadata-table">
                  <thead>
                    <tr>
                      <th>Key</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.metadata).map(([key, value]) => (
                      <tr key={key} onClick={() => copyValue(JSON.stringify(value))}>
                        <td>{key}</td>
                        <td>
                          {typeof value === 'object' 
                            ? JSON.stringify(value, null, 2) 
                            : String(value)
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Sub-Tenants */}
        {data.subTenants && data.subTenants.length > 0 && (
          <div className="tenant-section">
            <h4 
              className="section-header clickable"
              onClick={() => toggleSection(tenantId, 'subtenants')}
            >
              <span className="toggle-icon">{sectionExpanded('subtenants') ? '▼' : '▶'}</span>
              Sub-Tenants ({data.subTenants.length})
            </h4>
            {sectionExpanded('subtenants') && (
              <div className="section-content">
                <div className="sub-tenants-list">
                  {data.subTenants.map(subTenant => (
                    <div key={subTenant.tenantId} className="sub-tenant-item">
                      <span className="sub-tenant-name">{subTenant.name}</span>
                      <code 
                        className="sub-tenant-id clickable"
                        onClick={() => copyValue(subTenant.tenantId)}
                      >
                        {subTenant.tenantId}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Current Tenant Groups */}
        {tenantId === user?.tenantId && groups && groups.length > 0 && (
          <div className="tenant-section">
            <h4 
              className="section-header clickable"
              onClick={() => toggleSection(tenantId, 'groups')}
            >
              <span className="toggle-icon">{sectionExpanded('groups') ? '▼' : '▶'}</span>
              Groups ({groups.length})
            </h4>
            {sectionExpanded('groups') && (
              <div className="section-content">
                <div className="groups-list">
                  {groups.map(group => (
                    <div key={group.id} className="group-item">
                      <div className="group-header">
                        <span className="group-name">{group.name}</span>
                        <code 
                          className="group-id clickable"
                          onClick={() => copyValue(group.id)}
                        >
                          {group.id}
                        </code>
                      </div>
                      {group.roles && group.roles.length > 0 && (
                        <div className="group-roles">
                          {group.roles.map((role, idx) => (
                            <span key={idx} className="role-badge">
                              {role.name || role.key}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Additional Details */}
        {data.details && (
          <div className="tenant-section">
            <h4 
              className="section-header clickable"
              onClick={() => toggleSection(tenantId, 'details')}
            >
              <span className="toggle-icon">{sectionExpanded('details') ? '▼' : '▶'}</span>
              Additional Details
            </h4>
            {sectionExpanded('details') && (
              <div className="section-content">
                <pre className="details-json">
                  {JSON.stringify(data.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  const renderAllTenantsData = () => {
    if (Object.keys(tenantsData).length === 0) {
      return <p>No data available for any tenants.</p>;
    }
    
    return (
      <div className="all-tenants-data">
        {Object.entries(tenantsData).map(([tenantId, data]) => (
          <div key={tenantId} className="tenant-data-section">
            <h3 className="tenant-name">
              {data.tenantName}
              {tenantId === user?.tenantId && <span className="current-badge">Current</span>}
            </h3>
            {renderTenantDetails(tenantId)}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <Card 
      title="Tenant Information" 
      subtitle="Comprehensive tenant data including metadata, hierarchy, and groups"
    >
      <div className="metadata-header">
        <div className="header-actions">
          <button 
            className="refresh-button" 
            onClick={fetchAllTenantsData}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button 
            className="edit-button" 
            onClick={() => setShowEditor(!showEditor)}
          >
            {showEditor ? 'Hide Editor' : 'Edit Metadata'}
          </button>
        </div>
      </div>
        
      {isLoading ? (
        <LoadingSpinner message="Loading tenant data..." />
      ) : error ? (
          <div className="error-message">
            {error}
            <button onClick={fetchAllTenantsData} className="retry-button">
              Retry
            </button>
          </div>
        ) : (
          renderAllTenantsData()
        )}
        
        {showEditor && (
          <>
            {renderTenantSelector()}
            <TenantMetadataEditor 
              onUpdate={handleMetadataUpdate} 
              tenantId={selectedTenantId} 
            />
          </>
        )}
      
      <Toast 
        message={toastMessage} 
        type="success" 
        onClose={() => setToastMessage('')} 
      />
    </Card>
  );
};

export default TenantMetadata;