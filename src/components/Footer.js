// components/Footer.jsx
import React from 'react';
import logo from '../images/logo.png'; // ou le bon chemin

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.logoSection}>
          <img src={logo} alt="OpenUp" style={styles.logo} />
          <span style={styles.logoText}>OpenUp</span>
        </div>

        <div style={styles.copyright}>
          © {new Date().getFullYear()} OpenUp. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#16A14A',
    color: 'white',
    padding: '1px 0',
    marginTop: '4rem',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logo: {
    height: '40px',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'white',
  },
  links: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'color 0.3s',
  },
  linkHover: {
    color: '#fff279',
  },
  copyright: {
    fontSize: '0.9rem',
    textAlign: 'center',
    color: '#ccc',
  },
};

export default Footer;