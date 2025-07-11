import React from 'react';
import { useAuthActions } from "@frontegg/react";

const Utility = () => {
  const { __requestHostedLoginSilentAuthorize } = useAuthActions();

  const handleRefresh = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    __requestHostedLoginSilentAuthorize(); // Use the silent authorize method
  };

  return (
    <div className="utility-section">
      <h2>SDK Utilities</h2>
      <div className="utility-buttons">
        <button className="Button" onClick={handleRefresh}>
          Refresh Token
        </button>
      </div>
    </div>
  );
};

export default Utility; 