import React from 'react';
import { 
  AdminPortal as FronteggAdminPortal, 
  ChangePasswordForm, 
  ProfilePage, 
  useAuth, 
  UsersTable
} from '@frontegg/react';
import './AdminPortal.css';

const AdminPortal = () => {
  const { user } = useAuth();

  return (
    <div className="embedded-components-page">
      <div className="page-header">
        <h1>Embedded Components</h1>
        <p className="header-description">
          This page demonstrates how components from the Frontegg Self Service Portal can be embedded directly into your application's UI. 
          These components provide a seamless, integrated experience while maintaining full functionality for user management, 
          profile settings, and security configuration.
        </p>
      </div>

      <div className="page-content">
        {/* Users Management Section */}
        <section className="component-section">
          <h2 className="section-title">Users Management</h2>
          <p className="section-description">Manage team members, send invitations, and control user access</p>
          <div className="component-wrapper">
            <UsersTable 
              props={{}} 
              hostStyle={{ 
                width: '100%', 
                height: '500px',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }} 
            />
          </div>
        </section>

        {/* Profile Section */}
        <section className="component-section">
          <h2 className="section-title">User Profile</h2>
          <p className="section-description">View and edit user profile information</p>
          <div className="component-wrapper">
            <ProfilePage 
              props={{}} 
              hostStyle={{ 
                width: '100%', 
                height: '400px',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }} 
            />
          </div>
        </section>

        {/* Security Section */}
        <section className="component-section">
          <h2 className="section-title">Security Settings</h2>
          <p className="section-description">Update password and manage security preferences</p>
          <div className="component-wrapper security-wrapper">
            <ChangePasswordForm 
              props={{}} 
              hostStyle={{ 
                width: '100%', 
                maxWidth: '500px',
                height: '300px',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                padding: '20px'
              }} 
            />
          </div>
        </section>

      </div>
    </div>
  );
};

export default AdminPortal;