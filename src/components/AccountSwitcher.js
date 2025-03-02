import React, { useState, useEffect, useRef } from 'react';
import { useTenantsState, useAuthActions, useAuth } from "@frontegg/react";
import "../App.css";
import "../index.css";

const AccountSwitcher = () => {
  const { user } = useAuth();
  const { switchTenant } = useAuthActions();
  const { tenants } = useTenantsState();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState(user?.tenantId);
  const [selectedTenantName, setSelectedTenantName] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (tenants && user?.tenantId) {
      const currentTenant = tenants.find(tenant => tenant.tenantId === user.tenantId);
      if (currentTenant) {
        setSelectedTenantId(currentTenant.tenantId);
        setSelectedTenantName(currentTenant.name);
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
  }, [dropdownRef]);

  const handleTenantSwitch = (tenant) => {
    setSelectedTenantId(tenant.tenantId);
    setSelectedTenantName(tenant.name);
    switchTenant({ tenantId: tenant.tenantId });
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="account-switcher">
      <label className="account-switcher-label">Account Switcher</label>
      <div className="custom-dropdown" onClick={toggleDropdown} ref={dropdownRef}>
        <div className="dropdown-selected">{selectedTenantName || 'Select Account'}</div>
        {isDropdownOpen && (
          <div className="dropdown-options">
            {tenants
              .filter((tenant) => tenant.tenantId !== selectedTenantId)
              .map((option) => (
                <div
                  key={option.tenantId}
                  className="dropdown-option"
                  onClick={() => handleTenantSwitch(option)}
                >
                  {option.name}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSwitcher; 