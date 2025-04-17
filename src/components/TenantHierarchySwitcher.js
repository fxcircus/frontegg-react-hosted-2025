import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth, useAuthActions, useTenantsState } from "@frontegg/react";
import { createApiClient } from "@frontegg/rest-api";
import './TenantHierarchySwitcher.css';

// Icons component
const Icons = {
  ChevronDownIcon: () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="12" 
      height="12" 
      fill="currentColor" 
      viewBox="0 0 16 16"
    >
      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
    </svg>
  ),
  
  ChevronRightIcon: () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="12" 
      height="12" 
      fill="currentColor" 
      viewBox="0 0 16 16"
    >
      <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
    </svg>
  )
};

// HierarchyTreeNode component
const HierarchyTreeNode = ({ 
  node, 
  level = 0, 
  user, 
  onTenantSwitch 
}) => {
  const isCurrentTenant = node.tenantId === user?.tenantId;
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const hasChildren = node.children?.length > 0;
  
  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  
  const handleTenantClick = (e) => {
    e.stopPropagation();
    onTenantSwitch({ tenantId: node.tenantId, name: node.tenantName });
  };
  
  return (
    <div className="hierarchy-node">
      <div 
        className={`hierarchy-item ${isCurrentTenant ? 'current-tenant' : ''}`}
        style={{ paddingLeft: `${level * 20}px` }}
      >
        <span className="hierarchy-icon">
          {hasChildren ? (
            <button 
              onClick={toggleExpand}
              className="expand-button"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <Icons.ChevronDownIcon /> : <Icons.ChevronRightIcon />}
            </button>
          ) : (
            <span className="placeholder-icon" />
          )}
        </span>
        
        <button 
          onClick={handleTenantClick}
          className="tenant-button"
        >
          {node.tenantName} {isCurrentTenant && '(current)'}
        </button>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="hierarchy-children">
          {node.children.map((child) => (
            <HierarchyTreeNode 
              key={child.tenantId} 
              node={child} 
              level={level + 1}
              user={user}
              onTenantSwitch={onTenantSwitch}
            />
          ))}
        </div>
      )}
    </div>
  );
};

HierarchyTreeNode.propTypes = {
  node: PropTypes.shape({
    tenantId: PropTypes.string.isRequired,
    tenantName: PropTypes.string.isRequired,
    children: PropTypes.array
  }).isRequired,
  level: PropTypes.number,
  user: PropTypes.object,
  onTenantSwitch: PropTypes.func.isRequired
};

// Main TenantHierarchySwitcher component
const TenantHierarchySwitcher = ({ 
  onTenantSwitch,
  className,
  title = "Tenant Hierarchy",
  loadingText = "Loading hierarchy...",
  noDataText = "No hierarchy data available"
}) => {
  const { user } = useAuth();
  const { switchTenant } = useAuthActions();
  const { tenants } = useTenantsState();
  
  // Create API client
  const api = createApiClient();
  
  // State management
  const [hierarchyData, setHierarchyData] = useState(null);
  const [isHierarchyLoading, setIsHierarchyLoading] = useState(false);
  
  // Fetch hierarchy data
  useEffect(() => {
    if (user?.tenantId) {
      fetchHierarchyData();
    }
  }, [user?.tenantId]);
  
  // API calls
  const fetchHierarchyData = async () => {
    try {
      setIsHierarchyLoading(true);
      const response = await api.tenants.getSubTenantsAsTree();
      setHierarchyData(response);
    } catch (error) {
      console.error('Error fetching hierarchy data:', error);
    } finally {
      setIsHierarchyLoading(false);
    }
  };
  
  // Actions
  const handleTenantSwitch = (tenant) => {
    if (onTenantSwitch) {
      onTenantSwitch(tenant);
    } else {
      // Default behavior if no callback provided
      switchTenant({ tenantId: tenant.tenantId, silentReload: true });
    }
  };
  
  return (
    <div className={`tenant-hierarchy-switcher ${className || ''}`}>
      <h3 className="hierarchy-title">{title}</h3>
      
      <div className="hierarchy-container">
        {isHierarchyLoading ? (
          <div className="hierarchy-loading">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
            {loadingText}
          </div>
        ) : hierarchyData ? (
          <div className="hierarchy-tree">
            <HierarchyTreeNode 
              node={hierarchyData} 
              onTenantSwitch={handleTenantSwitch}
              user={user}
            />
          </div>
        ) : (
          <div className="hierarchy-error">
            {noDataText}
          </div>
        )}
      </div>
    </div>
  );
};

TenantHierarchySwitcher.propTypes = {
  onTenantSwitch: PropTypes.func,
  className: PropTypes.string,
  title: PropTypes.string,
  loadingText: PropTypes.string,
  noDataText: PropTypes.string
};

export default TenantHierarchySwitcher; 