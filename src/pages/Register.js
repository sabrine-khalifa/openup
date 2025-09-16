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
    role: 'particulier',
    photo: null,
    metier: '',
    domaine: '',
    telephone: '',
    langues: [],
    nationalites: '',
    video: '',
    description: '',
    valeurs: '',
    lieuPrestation: '',
    pmr: false,
    typeCours: '',
    publicCible: '',
    liens: '',
  });

  const navigate = useNavigate();

  const domaines = [
    'Bien-être', 'Éducation', 'Création', 'Tech', 'Artisanat',
    'Conseil', 'Sport', 'Musique', 'Développement personnel'
  ];
  const publicCibleOptions = ['Débutants', 'Professionnels', 'Tous niveaux'];
  const languesDisponibles = ['Français', 'Anglais', 'Arabe', 'Espagnol', 'Allemand'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, photo: e.target.files[0] });
  };

  const handleLangueChange = (langue) => {
    setForm((prev) => ({
      ...prev,
      langues: prev.langues.includes(langue)
        ? prev.langues.filter((l) => l !== langue)
        : [...prev.langues, langue],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(form).forEach((key) => {
      if (Array.isArray(form[key])) {
        form[key].forEach(item => data.append(key, item));
      } else {
        data.append(key, form[key] ?? '');
      }
    });

    try {
      await api.post('/api/auth/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Inscription réussie !');
      navigate('/login');
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
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
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
              <input
                type="tel"
                name="telephone"
                placeholder="Téléphone (optionnel)"
                value={form.telephone}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
              />
            </div>

            {/* Photo */}
            <div>
              <label className="block mb-2 text-gray-700">
                📁 Télécharger une photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {form.photo && <p className="text-sm text-gray-500">{form.photo.name}</p>}
            </div>

            {/* Champs Créateur */}
            {form.role === 'createur' && (
              <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                <h3 className="font-semibold text-gray-800">Informations Créateur</h3>

                <input
                  type="text"
                  name="metier"
                  placeholder="Métier (optionnel)"
                  value={form.metier}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />

                <select
                  name="domaine"
                  value={form.domaine}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                >
                  <option value="">Domaine d’activité</option>
                  {domaines.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <div>
                  <p className="text-gray-700">Langues parlées :</p>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {languesDisponibles.map(langue => (
                      <label key={langue} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={form.langues.includes(langue)}
                          onChange={() => handleLangueChange(langue)}
                        /> {langue}
                      </label>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  name="nationalites"
                  placeholder="Nationalités"
                  value={form.nationalites}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
                <input
                  type="url"
                  name="video"
                  placeholder="Lien vidéo (optionnel)"
                  value={form.video}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
                <textarea
                  name="description"
                  placeholder="À propos de vous"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
                <textarea
                  name="valeurs"
                  placeholder="Vos valeurs (optionnel)"
                  value={form.valeurs}
                  onChange={handleChange}
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />

                <select
                  name="lieuPrestation"
                  value={form.lieuPrestation}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                >
                  <option value="">Lieu de prestation</option>
                  <option value="distanciel">Distanciel</option>
                  <option value="presentiel">Présentiel</option>
                  <option value="hybride">Hybride</option>
                </select>

                <label className="flex items-center gap-2">
                  <input type="checkbox" name="pmr" checked={form.pmr} onChange={handleChange} />
                  Accessible PMR
                </label>

                <select
                  name="typeCours"
                  value={form.typeCours}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                >
                  <option value="">Type de cours</option>
                  <option value="individuel">Individuel</option>
                  <option value="collectif">Collectif</option>
                </select>

                <select
                  name="publicCible"
                  value={form.publicCible || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                >
                  <option value="">Public cible</option>
                  {publicCibleOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>

                <input
                  type="text"
                  name="liens"
                  placeholder="Liens (site, réseaux sociaux)"
                  value={form.liens}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
              </div>
            )}

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