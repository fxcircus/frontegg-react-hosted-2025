import React, { useState, useEffect } from 'react';
import { useAuth, useIsSteppedUp, useAuthActions, useTenantsState } from "@frontegg/react";
import { jwtDecode } from "jwt-decode";
import StatsCard from './StatsCard';
import Card from './Card';
import './Dashboard.css';

const Dashboard = ({ onSectionChange }) => {
  const { user } = useAuth();
  const { tenants } = useTenantsState();
  const isSteppedUp = useIsSteppedUp({ maxAge: 60 });
  const [activities, setActivities] = useState(() => {
    // Load activities from localStorage on mount
    const savedActivities = localStorage.getItem('userActivities');
    return savedActivities ? JSON.parse(savedActivities) : [];
  });
  
  // Helper function to add activity
  const addActivity = (activity) => {
    const newActivity = {
      ...activity,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };
    setActivities(prev => {
      const updated = [newActivity, ...prev].slice(0, 10); // Keep only last 10 activities
      localStorage.setItem('userActivities', JSON.stringify(updated));
      return updated;
    });
  };
  
  // Track authentication on mount
  useEffect(() => {
    if (user && activities.length === 0) {
      addActivity({
        type: 'auth',
        icon: '🔐',
        message: 'Successfully authenticated',
        userId: user.id
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Track tenant switches
  useEffect(() => {
    if (user?.tenantId && activities.length > 0) {
      const lastActivity = activities[0];
      if (!lastActivity || lastActivity.tenantId !== user.tenantId) {
        const tenant = tenants?.find(t => t.tenantId === user.tenantId);
        addActivity({
          type: 'tenant',
          icon: '🏢',
          message: `Switched to tenant: ${tenant?.name || user.tenantId}`,
          tenantId: user.tenantId
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.tenantId, tenants]);
  
  // Listen for token refresh events
  useEffect(() => {
    const handleTokenRefresh = () => {
      addActivity({
        type: 'token',
        icon: '🔑',
        message: 'Token refreshed',
        userId: user?.id
      });
    };
    
    // Add event listener for custom token refresh event
    window.addEventListener('frontegg-token-refreshed', handleTokenRefresh);
    
    return () => {
      window.removeEventListener('frontegg-token-refreshed', handleTokenRefresh);
    };
  }, [user]);
  
  // Update times every minute
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update relative times
      setActivities(prev => [...prev]);
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Format relative time
  const formatRelativeTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSeconds < 60) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };
  
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
      label: user?.roles?.length > 1 ? 'User Roles' : 'User Role',
      value: user?.roles?.length > 0 
        ? user.roles.map(role => role.name || role.key).join(', ')
        : 'No Role',
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
            {activities.length > 0 ? (
              activities.slice(0, 5).map(activity => (
                <div key={activity.id} className="activity-item">
                  <span className="activity-icon">{activity.icon}</span>
                  <div className="activity-content">
                    <p>{activity.message}</p>
                    <time>{formatRelativeTime(activity.timestamp)}</time>
                  </div>
                </div>
              ))
            ) : (
              <div className="activity-item">
                <span className="activity-icon">📝</span>
                <div className="activity-content">
                  <p>No recent activity</p>
                  <time>Start using the app to see activity</time>
                </div>
              </div>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;