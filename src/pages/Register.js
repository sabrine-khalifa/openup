// pages/Register.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedRole = location.state?.preselectedRole;

  // Si on arrive sans rôle (ex: accès direct à /register), redirige vers le choix
  useEffect(() => {
    if (!preselectedRole || (preselectedRole !== 'particulier' && preselectedRole !== 'createur')) {
      navigate('/');
    }
  }, [preselectedRole, navigate]);

  const [form, setForm] = useState({
    name: '',
    prenom: '',
    email: '',
    password: '',
    role: preselectedRole // ← rôle forcé par le bouton cliqué
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await api.post('/api/auth/register', form);

    // Affiche le message réel du serveur
    alert(res.data.msg);

    // Redirige vers confirmation
    navigate('/confirmation', { state: { email: form.email } });
  } catch (err) {
    alert(err.response?.data?.msg || 'Erreur lors de l’inscription');
  }
};

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="p-4 text-center border-b bg-white">
        <button onClick={() => navigate(-1)} className="text-[#16A14A]">
          ← Retour
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Inscription {form.role === 'createur' ? 'Créateur' : 'Particulier'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Plus de choix de rôle ici ! */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Nom"
                value={form.name}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-4 py-3"
              />
              <input
                type="text"
                name="prenom"
                placeholder="Prénom"
                value={form.prenom}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-4 py-3"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-4 py-3"
              />
              <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={form.password}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-4 py-3"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#16A14A] hover:bg-[#1a9d53] text-white py-3 rounded-lg font-semibold transition"
            >
              S'inscrire
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Register;