import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
// Import des images depuis le dossier src/images
import creditsImg from '../images/credit.png';
import messagerieImg from '../images/messagerie.png';
import profilImg from '../images/profil.png';


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
