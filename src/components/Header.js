import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { FaCoins, FaEnvelope, FaUserCircle } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';

const Header = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('user')) || {};
  const credits = userData.credits || 0;
  const token = localStorage.getItem('token');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Fermer le dropdown si clic à l’extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Récupérer le nombre de messages non lus
  useEffect(() => {
    if (!token) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/api/messages/unread/count', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(res.data?.count || 0);
      } catch (err) {
        console.error('Erreur lors du chargement des messages non lus :', err);
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 3000);
    return () => clearInterval(interval);
  }, [token]);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        <span style={styles.logoText}>OpenUp</span>
      </div>

      <div style={styles.rightSection}>
        {/* Crédits */}
        <div style={styles.item}>
          <FaCoins size={20} aria-label="Crédits disponibles" />
          <span style={styles.creditText}>{credits}</span>
        </div>

        {/* Messagerie */}
        <div style={styles.item}>
          <Link to="/messagerie" style={styles.linkStyle} aria-label={`Messagerie${unreadCount > 0 ? `, ${unreadCount} messages non lus` : ''}`}>
            <FaEnvelope size={20} />
            {unreadCount > 0 && <span style={badgeStyle}>{unreadCount}</span>}
          </Link>
        </div>

        {/* Profil */}
        <div style={styles.profileSection} ref={dropdownRef}>
          <button
            type="button"
            onClick={toggleDropdown}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            style={styles.profileButton}
          >
            <FaUserCircle size={24} color="#16A14A" aria-hidden="true" />
            <FiChevronDown
              size={16}
              color="#16A14A"
              style={{
                marginLeft: '4px',
                transition: 'transform 0.2s ease',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
              aria-hidden="true"
            />
          </button>

          {dropdownOpen && (
            <ul style={styles.dropdownMenu} role="menu">
              <li style={styles.dropdownItem}>
                <Link to="/profile" style={styles.dropdownLink} role="menuitem">
                  Voir profil
                </Link>
              </li>
              <li style={styles.dropdownItem}>
                <Link to="/modifier-profil" style={styles.dropdownLink} role="menuitem">
                  Modifier le profil
                </Link>
              </li>
              <li
                style={styles.dropdownItem}
                onClick={handleLogout}
                onKeyDown={(e) => e.key === 'Enter' && handleLogout()}
                role="menuitem"
                tabIndex={0}
              >
                Se déconnecter
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
};

// Styles
const badgeStyle = {
  position: 'absolute',
  top: '-8px',
  right: '-8px',
  backgroundColor: '#e53e3e',
  color: 'white',
  fontSize: '12px',
  fontWeight: 'bold',
  borderRadius: '50%',
  width: '18px',
  height: '18px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 0 4px rgba(0,0,0,0.3)',
};

const styles = {
  header: {
    backgroundColor: '#ffffff',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #eee',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1001,
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontFamily: 'Lexend, sans-serif',
  },
  logoText: {
    color: '#16A14A',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  item: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  creditText: {
    fontWeight: 'bold',
  },
  linkStyle: {
    color: 'inherit',
    textDecoration: 'none',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  profileSection: {
    position: 'relative',
    cursor: 'pointer',
  },
  profileButton: {
    background: 'none',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    padding: 0,
    color: 'inherit',
    fontSize: 'inherit',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '6px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    listStyle: 'none',
    margin: 0,
    padding: '6px 0',
    zIndex: 1000,
    minWidth: '160px',
  },
  dropdownItem: {
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    outline: 'none',
  },
  dropdownLink: {
    color: 'inherit',
    textDecoration: 'none',
    display: 'block',
    width: '100%',
    height: '100%',
  },
};

export default Header;