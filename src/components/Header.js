import React, { useState, useEffect } from 'react';
import api from "../api";
// components/Header.jsx
import { Link } from "react-router-dom";
import logo from '../images/logo.png'; // ou le bon chemin

const Header = () => {
  const userData = JSON.parse(localStorage.getItem("user"));
  const credits = userData?.credits || 0;
  const token = localStorage.getItem("token");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Charger le nombre de messages non lus
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

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        <img src={logo} alt="Logo OpenUp" style={{ height: "40px", marginRight: "10px" }} />
        <span style={styles.logoText}>OpenUp</span>
      </div>

      <div style={styles.rightSection}>
        <span style={styles.item}>Crédits : <strong>{credits}</strong></span>

        {/* Lien vers messagerie */}
        <div style={styles.item}>
          <Link to="/messagerie">
            <span style={styles.icon}>✉️</span> Messagerie
          </Link>
          {unreadCount > 0 && (
            <span style={badgeStyle}>
              {unreadCount}
            </span>
          )}
        </div>

        <div style={styles.profileSection}>
          <span onClick={toggleDropdown} style={styles.profileName}>
            Profil ⏷
          </span>

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
  right: '-16px',
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
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  icon: {
    fontSize: '1.2rem',
  },
  profileSection: {
    position: 'relative',
    cursor: 'pointer',
  },
  profileName: {
    fontWeight: 'bold',
    color: '#16A14A',
  },
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
  dropdownItem: {
    padding: '8px 10px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
};

export default Header;