// pages/Register.jsx
import { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import logo from '../images/logo.png';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    prenom: '',
    email: '',
    password: '',
    role: 'particulier'
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await api.post('/api/auth/register', form);
      alert('Inscription réussie !');
      // Redirige vers un écran de complétion ou dashboard
      navigate('/completer-profil', {
    state: { user: form } // ← Envoie les données ici
  });

    } catch (err) {
      alert(err.response?.data?.msg || 'Erreur lors de l’inscription');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="p-4 text-center border-b bg-white">
        <img src={logo} alt="Logo" className="h-10 mx-auto" />
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Créer un compte
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rôle */}
            <div className="text-center">
              <h3 className="font-medium text-gray-700 mb-3">Je suis :</h3>
              <div className="flex justify-center gap-6 mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="particulier"
                    checked={form.role === 'particulier'}
                    onChange={handleChange}
                  />
                  Particulier
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="createur"
                    checked={form.role === 'createur'}
                    onChange={handleChange}
                  />
                  Créateur
                </label>
              </div>
            </div>

            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Nom"
                value={form.name}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
              />
              <input
                type="text"
                name="prenom"
                placeholder="Prénom"
                value={form.prenom}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
              />
              <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={form.password}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#16A14A] hover:bg-[#1a9d53] text-white py-3 rounded-lg font-semibold transition"
            >
              S'inscrire
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Déjà inscrit ?{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-[#16A14A] font-medium hover:underline cursor-pointer"
            >
              Se connecter
            </span>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-500 text-sm">
        © {new Date().getFullYear()} OpenUp. Tous droits réservés.
      </footer>
    </div>
  );
};

export default Register;