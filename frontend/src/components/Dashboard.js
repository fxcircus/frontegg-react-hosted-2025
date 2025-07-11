import React from 'react';
import { useAuth, useIsSteppedUp, AdminPortal } from "@frontegg/react";
import { jwtDecode } from "jwt-decode";
import StatsCard from './StatsCard';
import Card from './Card';
import './Dashboard.css';

const Dashboard = ({ onSectionChange }) => {
  const { user } = useAuth();
  const isSteppedUp = useIsSteppedUp({ maxAge: 60 });
  
  // Get token expiration
  const getTokenExpiry = () => {
    if (!user?.accessToken) return null;
    try {
      const decoded = jwtDecode(user.accessToken);
      const expiryDate = new Date(decoded.exp * 1000);
      const now = new Date();
      const hoursLeft = Math.floor((expiryDate - now) / (1000 * 60 * 60));
      const minutesLeft = Math.floor((expiryDate - now) / (1000 * 60)) % 60;
      return { hoursLeft, minutesLeft, isExpired: expiryDate < now };
    } catch {
      return null;
    }
  };

  const tokenExpiry = getTokenExpiry();

  // Stats data
  const stats = [
    {
      label: 'Active Tenant',
      value: user?.tenantId ? 'Connected' : 'Not Connected',
      icon: '🏢',
      color: 'primary',
      trend: user?.tenantId ? 'up' : 'neutral'
    },
    {
      label: 'MFA Status',
      value: isSteppedUp ? 'Verified' : 'Not Verified',
      icon: '🔐',
      color: isSteppedUp ? 'success' : 'warning',
      trend: isSteppedUp ? 'up' : 'down'
    },
    {
      label: 'Token Expires In',
      value: tokenExpiry?.isExpired ? 'Expired' : `${tokenExpiry?.hoursLeft || 0}h ${tokenExpiry?.minutesLeft || 0}m`,
      icon: '⏱️',
      color: tokenExpiry?.isExpired ? 'error' : 'primary',
      trend: tokenExpiry?.hoursLeft > 12 ? 'up' : 'down'
    },
    {
      label: 'User Role',
      value: user?.roles?.[0]?.name || user?.roles?.[0]?.key || 'No Role',
      icon: '👤',
      color: 'secondary',
      trend: 'neutral'
    }
  ];


  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome back, {user?.name || 'User'}!</h1>
        <p className="dashboard-subtitle">Here's an overview of your authentication status and available features.</p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats-grid">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content-grid">
        {/* User Profile Card */}
        <Card className="dashboard-profile-card">
          <div className="profile-header">
            <img
              src={user?.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=5b68f5&color=fff`}
              alt={user?.name}
              className="profile-avatar"
              referrerPolicy="no-referrer"
            />
            <div className="profile-info">
              <h3>{user?.name}</h3>
              <p>{user?.email}</p>
              <span className="profile-badge">{user?.tenantIds?.length || 0} Tenants</span>
            </div>
          </div>
        </Card>


        {/* Recent Activity Card */}
        <Card title="Recent Activity" className="dashboard-activity-card">
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">🔐</span>
              <div className="activity-content">
                <p>Successfully authenticated</p>
                <time>Just now</time>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">🏢</span>
              <div className="activity-content">
                <p>Switched to tenant: {user?.tenantId}</p>
                <time>5 minutes ago</time>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">🔑</span>
              <div className="activity-content">
                <p>Token refreshed</p>
                <time>1 hour ago</time>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;