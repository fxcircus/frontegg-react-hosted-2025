import React, { useState, useEffect } from 'react';
import { useAuth } from '@frontegg/react';
import './Pokemon.css';
import '../DocsLink.css';
import Card from '../Card';
import Button from '../Button';
import LoadingSpinner from '../LoadingSpinner';
import Toast from '../Toast';

const Pokemon = () => {
  const { user } = useAuth();
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catching, setCatching] = useState(false);
  const [trading, setTrading] = useState(false);
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState(null);
  const [tradeUserId, setTradeUserId] = useState('');
  const [permissions, setPermissions] = useState({
    canCatch: false,
    canView: false,
    canTrade: false
  });

  useEffect(() => {
    checkPermissions();
    fetchMyPokemon();
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [user]);

  const checkPermissions = () => {
    // Permissions might be at top level or within roles
    let userPermissions = user?.permissions || [];
    
    // If permissions array is empty, check within roles
    if ((!userPermissions || userPermissions.length === 0) && user?.roles) {
      // Extract permissions from all roles
      userPermissions = user.roles.reduce((allPerms, role) => {
        if (typeof role === 'object' && role.permissions) {
          return [...allPerms, ...role.permissions];
        }
        return allPerms;
      }, []);
    }
    
    // Extract permission keys if permissions are objects
    let permissionKeys = [];
    if (Array.isArray(userPermissions)) {
      permissionKeys = userPermissions.map(perm => {
        // If permission is an object with a 'key' property, use that
        if (typeof perm === 'object' && perm.key) {
          return perm.key;
        }
        // Otherwise assume it's already a string
        return perm;
      });
    }
    
    console.log('User permissions objects:', userPermissions); // Debug log
    console.log('Extracted permission keys:', permissionKeys); // Debug log
    
    setPermissions({
      canCatch: permissionKeys.includes('pokemon.catch'),
      canView: permissionKeys.includes('pokemon.view'),
      canTrade: permissionKeys.includes('pokemon.trade')
    });
  };

  const fetchMyPokemon = async () => {
    // Always try to fetch, even without permissions, to show actual backend response
    // This helps demonstrate how the backend SDK protects the API
    
    setLoading(true);
    try {
      const response = await fetch('/api/pokemon/my-collection', {
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPokemon(data.pokemon || []);
        setStats(data.stats);
      } else {
        const error = await response.json();
        if (response.status === 403) {
          showToast(
            <div>
              <div>🚫 Permission Denied (403)</div>
              <div className="error-details">Backend Response: {error.message || 'You need the "pokemon.view" permission'}</div>
              <div className="error-hint">The backend SDK validated your JWT and found missing permissions</div>
            </div>,
            'error'
          );
          // Clear pokemon list when permission denied
          setPokemon([]);
          setStats(null);
        } else {
          showToast(error.message || 'Failed to load Pokemon', 'error');
        }
      }
    } catch (error) {
      showToast('Failed to load Pokemon collection', 'error');
    } finally {
      setLoading(false);
    }
  };

  const catchPokemon = async () => {
    setCatching(true);
    try {
      const response = await fetch('/api/pokemon/catch', {
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        showToast(
          <div>
            <div>{data.message}</div>
            {data.celebratory && <div className="celebratory">{data.celebratory}</div>}
          </div>, 
          'success'
        );
        
        // Add the new Pokemon to the list
        setPokemon(prev => [data.pokemon, ...prev]);
        
        // Update stats
        if (stats) {
          const newStats = { ...stats };
          newStats.total += 1;
          newStats.byRarity[data.pokemon.rarity] += 1;
          setStats(newStats);
        }
      } else {
        if (response.status === 403) {
          showToast(
            <div>
              <div>🚫 Permission Denied (403)</div>
              <div className="error-details">Backend Response: {data.message || 'You need the "pokemon.catch" permission'}</div>
              <div className="error-hint">This is Frontegg's SDK protecting your backend API</div>
            </div>,
            'error'
          );
        } else {
          showToast(data.message || 'Failed to catch Pokemon', 'error');
        }
      }
    } catch (error) {
      showToast('Failed to catch Pokemon', 'error');
    } finally {
      setCatching(false);
    }
  };

  const tradePokemon = async () => {
    if (!tradeUserId.trim()) {
      showToast('Please enter a trainer ID to trade with', 'error');
      return;
    }

    setTrading(true);
    try {
      const response = await fetch(`/api/pokemon/trade/${tradeUserId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        showToast(
          <div>
            <div>Trade successful!</div>
            <div>Gave: {data.trade.gave.emoji} {data.trade.gave.name}</div>
            <div>Received: {data.trade.received.emoji} {data.trade.received.name}</div>
            {data.celebratory && <div className="celebratory">{data.celebratory}</div>}
          </div>,
          'success'
        );
        
        // Refresh collection
        fetchMyPokemon();
        setTradeUserId('');
      } else {
        if (response.status === 403) {
          showToast(
            <div>
              <div>🚫 Permission Denied (403)</div>
              <div className="error-details">Backend Response: {data.message || 'You need the "pokemon.trade" permission'}</div>
              <div className="error-hint">This is Frontegg's SDK protecting your backend API</div>
            </div>,
            'error'
          );
        } else {
          showToast(data.message || 'Trade failed', 'error');
        }
      }
    } catch (error) {
      showToast('Failed to complete trade', 'error');
    } finally {
      setTrading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const getRarityClass = (rarity) => {
    return `rarity-${rarity}`;
  };

  return (
    <div className="pokemon-page">
      <div className="page-header">
        <div className="page-title-wrapper">
          <h1>Backend SDK Demo</h1>
          <a href="https://developers.frontegg.com/guides/integrations/protect-backend-api/validate-jwt" 
             target="_blank" 
             rel="noopener noreferrer"
             className="docs-link"
             title="Learn more about protecting backend APIs">
            <span className="tooltip-icon">?</span>
          </a>
        </div>
        <p className="subtitle">Protecting Backend APIs with Frontegg Permissions</p>
        <div className="demo-explanation">
          <div className="info-box">
            <h3>🎓 What This Demo Shows</h3>
            <p>This interactive demo illustrates how Frontegg protects your backend APIs using JWT tokens and role-based permissions.</p>
            <p>We use a fun Pokemon game to demonstrate real-world API protection patterns.</p>
          </div>
          <div className="protection-flow">
            <h4>Protection Flow:</h4>
            <div className="flow-steps">
              <div className="flow-step">
                <span className="step-number">1</span>
                <span>Frontend sends JWT token with API request</span>
              </div>
              <div className="flow-step">
                <span className="step-number">2</span>
                <span>Backend validates JWT signature with Frontegg JWKS</span>
              </div>
              <div className="flow-step">
                <span className="step-number">3</span>
                <span>Backend checks user permissions from token</span>
              </div>
              <div className="flow-step">
                <span className="step-number">4</span>
                <span>API responds based on permission check</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="pokemon-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Pokemon</div>
          </div>
          <div className="stat-card legendary">
            <div className="stat-value">{stats.byRarity.legendary}</div>
            <div className="stat-label">Legendary</div>
          </div>
          <div className="stat-card rare">
            <div className="stat-value">{stats.byRarity.rare}</div>
            <div className="stat-label">Rare</div>
          </div>
          <div className="stat-card uncommon">
            <div className="stat-value">{stats.byRarity.uncommon}</div>
            <div className="stat-label">Uncommon</div>
          </div>
          <div className="stat-card common">
            <div className="stat-value">{stats.byRarity.common}</div>
            <div className="stat-label">Common</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="pokemon-actions">
        <Card title="API: Catch Pokemon" className="action-card">
          <div className="endpoint-info">
            <code>GET /api/pokemon/catch</code>
            <span className="permission-badge">Requires: pokemon.catch</span>
          </div>
          <p>This endpoint demonstrates permission-protected API access.</p>
          <Button
            onClick={catchPokemon}
            disabled={catching}
            variant="primary"
          >
            {catching ? 'Calling API...' : 'Try API Call'}
          </Button>
          {!permissions.canCatch && (
            <div className="permission-denied-info">
              <p className="permission-hint">⚠️ Missing Permission</p>
              <p className="permission-explanation">Your JWT token doesn't include the "pokemon.catch" permission.</p>
              <p className="permission-fix">Click "Try API Call" to see the actual backend error response.</p>
            </div>
          )}
        </Card>

        <Card title="API: Trade Pokemon" className="action-card">
          <div className="endpoint-info">
            <code>POST /api/pokemon/trade/:userId</code>
            <span className="permission-badge">Requires: pokemon.trade</span>
          </div>
          <p>This endpoint shows user-to-user interactions with permission checks.</p>
          <div className="trade-form">
            <input
              type="text"
              placeholder="Enter user ID"
              value={tradeUserId}
              onChange={(e) => setTradeUserId(e.target.value)}
            />
            <Button
              onClick={tradePokemon}
              disabled={trading || !tradeUserId}
              variant="secondary"
            >
              {trading ? 'Calling API...' : 'Try API Call'}
            </Button>
          </div>
          {!permissions.canTrade && (
            <div className="permission-denied-info">
              <p className="permission-hint">⚠️ Missing Permission</p>
              <p className="permission-explanation">Your JWT token doesn't include the "pokemon.trade" permission.</p>
              <p className="permission-fix">Click "Try API Call" to see the actual backend error response.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Current Permissions Display */}
      <Card title="Your Current Permissions" className="permissions-display">
        <div className="permissions-grid">
          <div className={`permission-status ${permissions.canCatch ? 'granted' : 'denied'}`}>
            <span className="status-icon">{permissions.canCatch ? '✅' : '❌'}</span>
            <span className="permission-name">pokemon.catch</span>
          </div>
          <div className={`permission-status ${permissions.canView ? 'granted' : 'denied'}`}>
            <span className="status-icon">{permissions.canView ? '✅' : '❌'}</span>
            <span className="permission-name">pokemon.view</span>
          </div>
          <div className={`permission-status ${permissions.canTrade ? 'granted' : 'denied'}`}>
            <span className="status-icon">{permissions.canTrade ? '✅' : '❌'}</span>
            <span className="permission-name">pokemon.trade</span>
          </div>
        </div>
        <p className="permissions-note">These permissions are extracted from your JWT token and checked by the backend on each API call.</p>
      </Card>

      {/* Pokemon Collection */}
      <Card title="API Response: My Collection" className="collection-card">
        <div className="endpoint-info">
          <code>GET /api/pokemon/my-collection</code>
          <span className="permission-badge">Requires: pokemon.view</span>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : pokemon.length === 0 ? (
          <div className="empty-collection">
            {!permissions.canView ? (
              <>
                <p>⚠️ Missing "pokemon.view" permission</p>
                <p style={{fontSize: '0.9rem', color: '#888'}}>The backend API denied access. This collection would show your Pokemon if you had permission.</p>
              </>
            ) : (
              <p>No Pokemon yet! Start catching some!</p>
            )}
          </div>
        ) : (
          <div className="pokemon-grid">
            {pokemon.map((p) => (
              <div key={p.id} className={`pokemon-card ${getRarityClass(p.rarity)}`}>
                <div className="pokemon-emoji">{p.emoji}</div>
                <div className="pokemon-name">{p.name}</div>
                <div className="pokemon-type">{p.type}</div>
                <div className="pokemon-level">Lv. {p.level}</div>
                <div className="pokemon-rarity">{p.rarity}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Pokemon;