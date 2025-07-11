import React, { useState, useEffect, useRef } from 'react';
import { useTenantsState, useAuthActions, useAuth } from "@frontegg/react";
import './TenantSelector.css';

const TenantSelector = ({ isCollapsed }) => {
  const { user } = useAuth();
  const { switchTenant } = useAuthActions();
  const { tenants } = useTenantsState();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (tenants && user?.tenantId) {
      const currentTenant = tenants.find(tenant => tenant.tenantId === user.tenantId);
      if (currentTenant) {
        setSelectedTenant(currentTenant);
      }
    }
  }, [tenants, user?.tenantId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTenantSwitch = (tenant) => {
    setSelectedTenant(tenant);
    switchTenant({ tenantId: tenant.tenantId });
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (!tenants || tenants.length === 0) {
    return null;
  }

  return (
    <div className={`tenant-selector ${isCollapsed ? 'collapsed' : ''}`} ref={dropdownRef}>
      <button 
        className="tenant-selector-button"
        onClick={toggleDropdown}
        aria-expanded={isDropdownOpen}
        aria-label="Select tenant"
      >
        {!isCollapsed && (
          <>
            <div className="tenant-info">
              <span className="tenant-label">Current Tenant</span>
              <span className="tenant-name">{selectedTenant?.name || 'Select Tenant'}</span>
            </div>
            <div className="tenant-meta">
              <span className="tenant-count">{tenants.length} {tenants.length === 1 ? 'tenant' : 'tenants'}</span>
              <svg 
                className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
                width="12" 
                height="12" 
                viewBox="0 0 12 12"
              >
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
          </>
        )}
        {isCollapsed && (
          <div className="tenant-icon" title={selectedTenant?.name}>
            {selectedTenant?.name?.charAt(0).toUpperCase() || 'T'}
          </div>
        )}
      </button>

      {isDropdownOpen && (
        <div className="tenant-dropdown">
          <div className="tenant-dropdown-header">
            <h4>Switch Workspace</h4>
            <p>{tenants.length} available</p>
          </div>
          <div className="tenant-list">
            {tenants.map((tenant) => (
              <button
                key={tenant.tenantId}
                className={`tenant-item ${tenant.tenantId === selectedTenant?.tenantId ? 'active' : ''}`}
                onClick={() => handleTenantSwitch(tenant)}
              >
                <div className="tenant-item-icon">
                  {tenant.name.charAt(0).toUpperCase()}
                </div>
                <div className="tenant-item-info">
                  <span className="tenant-item-name">{tenant.name}</span>
                  <span className="tenant-item-id">{tenant.tenantId.slice(0, 8)}...</span>
                </div>
                {tenant.tenantId === selectedTenant?.tenantId && (
                  <svg className="tenant-check" width="16" height="16" viewBox="0 0 16 16">
                    <path d="M13.5 2L6 9.5L2.5 6" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantSelector;