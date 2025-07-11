import React from 'react';
import './StatsCard.css';

const StatsCard = ({ label, value, icon, color = 'primary', trend = 'neutral' }) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'success';
      case 'down':
        return 'error';
      default:
        return 'neutral';
    }
  };

  return (
    <div className={`stats-card stats-card-${color}`}>
      <div className="stats-card-header">
        <span className="stats-card-icon">{icon}</span>
        <span className={`stats-card-trend trend-${getTrendColor()}`}>
          {getTrendIcon()}
        </span>
      </div>
      <div className="stats-card-content">
        <h3 className="stats-card-value">{value}</h3>
        <p className="stats-card-label">{label}</p>
      </div>
    </div>
  );
};

export default StatsCard;