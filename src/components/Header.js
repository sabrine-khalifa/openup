import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import api from '../api';

// Import des images depuis le dossier src/images
import creditsImg from '../images/credit.png';
import messagerieImg from '../images/messagerie.png';
import profilImg from '../images/profil.png';

const Header = () => {
  const [credits, setCredits] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    // Logique de déconnexion
    console.log('Déconnexion...');
  };

  // Exemple : fetch des crédits et messages (adapter selon ton API)
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await api.get('/user/credits');
        setCredits(res.data.credits);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchUnreadMessages = async () => {
      try {
        const res = await api.get('/messages/unread');
        setUnreadCount(res.data.unread);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCredits();
    fetchUnreadMessages();
  }, []);

  // Style CSS en JS
  const styles = {
    rightSection: { display: 'flex', alignItems: 'center' },
    item: { marginRight: '16px', display: 'flex', alignItems: 'center' },
    creditText: { marginLeft: '4px' },
    linkStyle: { textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' },
    profileSection: { position: 'relative' },
    profileButton: { display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' },
    dropdownMenu: { 
      position: 'absolute', 
      top: '100%', 
      right: 0, 
      background: '#fff', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)', 
      listStyle: 'none', 
      padding: 0, 
      margin: 0, 
      zIndex: 1000 
    },
    dropdownItem: { padding: '8px 16px' },
    dropdownLink: { textDecoration: 'none', color: 'inherit' },
  };

  const badgeStyle = {
    marginLeft: '4px',
    backgroundColor: 'red',
    color: '#fff',
    borderRadius: '50%',
    padding: '2px 6px',
    fontSize: '12px',
  };

  return (
    <div style={styles.rightSection}>
      {/* Crédits */}
      <div style={styles.item}>
        <img src={creditsImg} alt="Crédits disponibles" style={{ width: 20, height: 20 }} />
        <span style={styles.creditText}>{credits}</span>
      </div>

      {/* Messagerie */}
      <div style={styles.item}>
        <Link
          to="/messagerie"
          style={styles.linkStyle}
          aria-label={`Messagerie${unreadCount > 0 ? `, ${unreadCount} messages non lus` : ''}`}
        >
          <img src={messagerieImg} alt="Messagerie" style={{ width: 20, height: 20 }} />
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
          <img src={profilImg} alt="Profil" style={{ width: 24, height: 24, borderRadius: '50%' }} />
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
  );
};

export default Header;
