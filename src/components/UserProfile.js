import React from 'react';
import { useAuth } from "@frontegg/react";

const UserProfile = () => {
  const { user } = useAuth();

  return (
    <div className="profile-section">
      <img
        src={user?.profilePictureUrl}
        alt={user?.name}
        referrerPolicy="no-referrer"
        className="profile-pic"
      />
      <span className="user-name">{user?.name}</span>
      <span className="user-name">{user?.email}</span>
    </div>
  );
};

export default UserProfile; 