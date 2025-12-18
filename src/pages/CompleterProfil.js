// pages/CompleterProfil.jsx
import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../images/logo.png';

const CompleterProfil = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = JSON.parse(localStorage.getItem('user'));

 // Vérifier connexion
  useEffect(() => {
    if (!storedUser) {
      alert('Veuillez vous connecter.');
      navigate('/login');
    }
  }, [navigate]);

  const userId = storedUser?.id; // ← utilise l'ID depuis localStorage
  const [form, setForm] = useState({
    // Utiliser storedUser si disponible, sinon valeurs vides
    name: storedUser?.name || '',
    prenom: storedUser?.prenom || '',
    email: storedUser?.email || '',
    telephone: storedUser?.telephone || '',
    photo: storedUser?.photo || null,
    role: storedUser?.role || 'particulier',
    // Champs créateur
    metier: storedUser?.metier || '',
    domaine: Array.isArray(storedUser?.domaine) ? storedUser.domaine : [],
    langues: Array.isArray(storedUser?.langues) ? storedUser.langues : [],
    nationalites: storedUser?.nationalites || '',
    video: storedUser?.video || '',
    description: storedUser?.description || '',
    valeurs: storedUser?.valeurs || '',
    lieuPrestation: storedUser?.lieuPrestation || '',
    pmr: storedUser?.pmr || false,
    typeCours: storedUser?.typeCours || '',
    publicCible: storedUser?.publicCible || '',
    liens: storedUser?.liens || '',
siteWeb: storedUser?.siteWeb || '',
instagram: storedUser?.instagram || '',
linkedin: storedUser?.linkedin || '',

  });

  
const categoriesDisponibles = [
  { nom: "Animaux & monde vivant", couleur: "#B36A5E" },
  { nom: "Architecture & urbanisme", couleur: "#E3CD8B" },
  { nom: "Arts vivants", couleur: "#F27438" },
  { nom: "Arts visuels", couleur: "#F39C12" },
  { nom: "Artisanat", couleur: "#CA7C5C" },
  { nom: "Bien-être", couleur: "#27AE60" },
  { nom: "Décoration & aménagement", couleur: "#e76f51" },
  { nom: "Développement personnel", couleur: "#9B59B6" },
  { nom: "Écologie & durabilité", couleur: "#7AA95C" },
  { nom: "Écriture & littérature", couleur: "#C89F9C" },
  { nom: "Entrepreneuriat & innovation", couleur: "#427AA1" },
  { nom: "Finances personnelles & économie", couleur: "#E8EDDF" },
  { nom: "Formation, enseignement & accompagnement", couleur: "#C8574D" },
  { nom: "Gastronomie & art culinaire", couleur: "#FFAE9D" },
  { nom: "Humanitaire & droits humains", couleur: "#7C4C53" },
  { nom: "Inclusion & solidarité", couleur: "#FF584D" },
  { nom: "Informatique & numérique", couleur: "#3498DB" },
  { nom: "Jeux & expériences interactives", couleur: "#0FAC71" },
  { nom: "Management & organisation", couleur: "#9281C0" },
  { nom: "Marketing, Communication & Événementiel", couleur: "#4A919E" },
  { nom: "Médias, journalisme & storytelling", couleur: "#A92831" },
  { nom: "Musique & son", couleur: "#FFBF66" },
  { nom: "Nature, jardinage & permaculture", couleur: "#B7CE66" },
  { nom: "Parentalité & famille", couleur: "#EA5863" },
  { nom: "Politique, citoyenneté & engagement sociétal", couleur: "#585B4C" },
  { nom: "Relations & développement social", couleur: "#E74C3C" },
  { nom: "Santé", couleur: "#EDCDFA" },
  { nom: "Sciences & technologies", couleur: "#62B9CB" },
  { nom: "Sport, loisirs physiques & outdoor", couleur: "#5CAFE7" },
  { nom: "Spiritualité", couleur: "#FFE361" },
  { nom: "Stylisme & mode", couleur: "#F0A1BF" },
  { nom: "Thérapies alternatives", couleur: "#A4BD01" },
  { nom: "Voyage, tourisme & interculturalité", couleur: "#7DC2A5" },
  { nom: "Autres", couleur: "#95a5a6" }
];

  
  const languesDisponibles = ['Français', 'Anglais'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
const handleDomaineChange = (value) => {
  setForm((prev) => ({
    ...prev,
    domaine: prev.domaine.includes(value)
      ? prev.domaine.filter((d) => d !== value)
      : [...prev.domaine, value],
  }));
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
   await api.put(`/api/auth/complete-profile/${userId}`, data);


      // Mettre à jour localStorage avec les nouvelles données
      //const updatedUser = { ...storedUser, ...form };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      alert("Profil complété avec succès !");
      navigate("/profile");
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
<div>
  <p className="text-gray-700 font-medium mb-2">Domaines d’activité :</p>
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
    {categoriesDisponibles.map((cat) => (
      <label
        key={cat.nom}
        className={`flex items-center justify-center p-2 rounded-lg cursor-pointer text-white font-medium transition-all`}
        style={{
          backgroundColor: form.domaine.includes(cat.nom) ? '#16A14A' : cat.couleur,
        }}
      >
        <input
          type="checkbox"
          checked={form.domaine.includes(cat.nom)}
          onChange={() => handleDomaineChange(cat.nom)}
          className="hidden"
        />
        {cat.nom}
      </label>
    ))}
  </div>
</div>


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
                  placeholder="Lien vidéo de présentation "
                  value={form.video}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
                <textarea
                  name="description"
                  placeholder="À propos"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                />
                <textarea
                  name="valeurs"
                  placeholder="Mes valeurs profondes "
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
                  <option value="">Type de prestation
</option>
                  <option value="En ligne">Distanciel</option>
  <option value="Présentiel">Présentiel</option>
                </select>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="pmr" checked={form.pmr} onChange={handleChange} />
                  Accessible PMR (Personnes à mobilité réduite) 
                </label>
                <select
                  name="typeCours"
                  value={form.typeCours}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                >
                  <option value="">Type de séance</option>
                 
                <option value="Individuel">Individuelle</option>
                <option value="Collectif">Collective </option>
                <option value="Groupe">Individuelle & Collective </option>
                </select>
                <div>
              <label className="block text-gray-700 font-medium mb-1">Public cible</label>
              <input
                  type="text"
                  name="publicCible"
                  value={form.publicCible}
                  onChange={handleChange}
                  placeholder="Débutants, Professionnels,Tous niveaux"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg"
                />
            </div>
                <div className="space-y-3">
  <p className="text-gray-700 font-medium">Liens</p>

  <input
    type="url"
    name="siteWeb"
    placeholder="Site Web"
    value={form.siteWeb || ""}
    onChange={handleChange}
    className="w-full border border-gray-300 rounded-lg px-4 py-3"
  />

  <input
    type="url"
    name="instagram"
    placeholder="Instagram"
    value={form.instagram || ""}
    onChange={handleChange}
    className="w-full border border-gray-300 rounded-lg px-4 py-3"
  />

  <input
    type="url"
    name="linkedin"
    placeholder="LinkedIn"
    value={form.linkedin || ""}
    onChange={handleChange}
    className="w-full border border-gray-300 rounded-lg px-4 py-3"
  />
</div>

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
