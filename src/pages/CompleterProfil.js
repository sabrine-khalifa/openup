// pages/CompleterProfil.jsx
import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../images/logo.png';

const CompleterProfil = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

 // Vérifier connexion
  useEffect(() => {
    if (!storedUser || !token) {
      alert('Veuillez vous connecter.');
      navigate('/login');
    }
  }, [navigate]);

  const userId = storedUser?.id; // ← utilise l'ID depuis localStorage
  const [form, setForm] = useState({
    name: userData.name || '',
    prenom: userData.prenom || '',
    email: userData.email || '',
    telephone: userData.telephone || '',
    photo: userData.photo || null,
    role: userData.role || 'particulier',
    // Champs créateur
    metier: userData.metier || '',
    domaine: userData.domaine || '',
    langues: userData.langues || [],
    nationalites: userData.nationalites || '',
    video: userData.video || '',
    description: userData.description || '',
    valeurs: userData.valeurs || '',
    lieuPrestation: userData.lieuPrestation || '',
    pmr: userData.pmr || false,
    typeCours: userData.typeCours || '',
    publicCible: userData.publicCible || '',
    liens: userData.liens || '',
  });

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
  
  if (!userId) return alert("Utilisateur non connecté");

  const data = new FormData();
  Object.keys(form).forEach((key) => {
    if (Array.isArray(form[key])) {
      form[key].forEach(item => data.append(key, item));
    } else {
      data.append(key, form[key] ?? '');
    }
  });

try {
      // ✅ Ajoutez le header d'authentification !
      await api.put(`/api/auth/${userId}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}` // ← crucial !
        },
      });

      // Mettre à jour localStorage avec les nouvelles données
      const updatedUser = { ...storedUser, ...form };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      alert("Profil complété avec succès !");
      navigate("/profil");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Erreur lors de la complétion du profil");
    }
  
  
};
 
  

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="p-4 text-center border-b bg-white">
       {/* <img src={logo} alt="Logo" className="h-10 mx-auto" /> */}
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
  Bonjour  {form.name}  👋 Complétez votre profil
          </h2>
          <p className="text-gray-600 mb-6">
  Veuillez compléter les informations suivantes pour finaliser votre profil.
</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Infos de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              

  
              <input
                type="tel"
                name="telephone"
                placeholder="Téléphone"
                value={form.telephone}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-4 py-3"
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
                  placeholder="Métier"
                  value={form.metier}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />

                <select
                  name="domaine"
                  value={form.domaine}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
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
                  placeholder="Lien vidéo"
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
                  required
                />
                <textarea
                  name="valeurs"
                  placeholder="Vos valeurs"
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
                  value={form.publicCible}
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
              Compléter le profil
            </button>
          </form>
        </div>
      </main>

      <footer className="text-center py-4 text-gray-500 text-sm">
        © {new Date().getFullYear()} OpenUp. Tous droits réservés.
      </footer>
    </div>
  );
};

export default CompleterProfil;
