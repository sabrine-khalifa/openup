import React, { useState, useEffect } from 'react';
import api from "../api";
import { Link } from "react-router-dom";
import { FaCoins, FaEnvelope, FaUserCircle } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi'; // flèche vers le bas

const Header = () => {
  const userData = JSON.parse(localStorage.getItem("user"));
  const credits = userData?.credits || 0;
  const token = localStorage.getItem("token");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get("/api/messages/unread/count", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(res.data.count);
      } catch (err) {
        console.error("Erreur chargement messages non lus :", err);
      }
    };

    if (token) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 3000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        <span style={styles.logoText}>OpenUp</span>
      </div>

      <div style={styles.rightSection}>
        {/* Icône Crédits */}
        <div style={styles.item}>
          <FaCoins size={20} />
          <span style={{ fontWeight: 'bold' }}>{credits}</span>
        </div>

        {/* Icône Messagerie */}
        <div style={styles.item}>
          <Link to="/messagerie" style={{ color: 'inherit', position: 'relative' }}>
            <FaEnvelope size={20} />
            {unreadCount > 0 && <span style={badgeStyle}>{unreadCount}</span>}
          </Link>
        </div>

        {/* Icône Profil avec flèche */}
        <div style={styles.profileSection} onClick={toggleDropdown}>
          <div style={styles.profileButton}>
            <FaUserCircle size={24} style={{ color: '#16A14A' }} />
            <FiChevronDown
              size={16}
              style={{
                marginLeft: '4px',
                color: '#16A14A',
                transition: 'transform 0.2s',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            />
          </div>

          {dropdownOpen && (
            <ul style={styles.dropdownMenu}>
              <li style={styles.dropdownItem}><Link to="/profile">Voir profil</Link></li>
              <li style={styles.dropdownItem}><Link to="/modifier-profil">Modifier le profil</Link></li>
              <li style={styles.dropdownItem} onClick={handleLogout}>Se déconnecter</li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
};

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
  boxShadow: '0 0 4px rgba(0,0,0,0.3)'
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
  },
  leftSection: { display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'Lexend, sans-serif' },
  logoText: { color: '#16A14A', fontSize: '1.5rem', fontWeight: 'bold' },
  rightSection: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  item: { cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', gap: '5px' },
  profileSection: { position: 'relative', cursor: 'pointer' },
  profileButton: { display: 'flex', alignItems: 'center', gap: '4px' },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    padding: '10px',
    listStyle: 'none',
    margin: 0,
    zIndex: 1000,
    width: '150px',
    borderRadius: '6px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  dropdownItem: { padding: '8px 10px', cursor: 'pointer', fontSize: '0.9rem' },
};

export default Header;
