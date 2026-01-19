import React, { useState, useEffect, useRef } from 'react';
import api from "../api";
import { Link } from "react-router-dom";
import creditsImg from '../images/credit.png';
import messagerieImg from '../images/messagerie.png';
import profilImg from '../images/profil.png';


const Header = () => {
  const userData = JSON.parse(localStorage.getItem("user"));
  const [credits, setCredits] = useState(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.credits ?? 0;
});

  const token = localStorage.getItem("token");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null); // Ref pour le dropdown

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

useEffect(() => {
  const updateCredits = (e) => {
    if (e?.detail !== undefined) {
      setCredits(e.detail);
    } else {
      const user = JSON.parse(localStorage.getItem("user"));
      setCredits(user?.credits ?? 0);
    }
  };

  window.addEventListener("creditsUpdated", updateCredits);

  return () => {
    window.removeEventListener("creditsUpdated", updateCredits);
  };
}, []);



  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

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

  // Fermer le dropdown si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        <span style={styles.logoText}>OpenUp</span>
      </div>

      <div style={styles.rightSection}>
        {/* Crédits avec image */}
        <div style={styles.item}>
          <img src={creditsImg} alt="Crédits" style={{ width: 20, height: 20 }} />
                    <span>{credits}</span>

        </div>

        {/* Lien vers messagerie avec image */}
        <div style={styles.item}>
          <Link to="/messagerie" style={styles.linkStyle}>
            <img src={messagerieImg} alt="Messagerie" style={{ width: 20, height: 20 }} />
          </Link>
          {unreadCount > 0 && (
            <span style={badgeStyle}>{unreadCount}</span>
          )}
        </div>

        {/* Profil avec image */}
        <div style={styles.profileSection} ref={dropdownRef}>
          <img src={profilImg} alt="Profil" style={{ width: 24, height: 24, borderRadius: '50%', marginRight: '4px' }}   onClick={toggleDropdown}
/>
         {/*<span style={styles.profileName} onClick={toggleDropdown}>⏷</span>*/}

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
  linkStyle: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: 'inherit',
    gap: '4px',
  },
  profileSection: {
    position: 'relative',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
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
