import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api';
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";



const ModifierProfil = () => {

  const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();
// Fonction pour nettoyer les langues corrompues
const extractValidLangues = (rawLangues) => {
  if (!Array.isArray(rawLangues)) return [];
  
  const validLangues = [];
  const allowed = ['Français', 'Anglais'];

  for (let item of rawLangues) {
    // Tente de parser jusqu'à obtenir une chaîne simple
    while (typeof item === 'string' && (item.startsWith('[') || item.startsWith('"'))) {
      try {
        const parsed = JSON.parse(item);
        if (typeof parsed === 'string') {
          item = parsed;
        } else if (Array.isArray(parsed) && parsed.length > 0) {
          item = parsed[0]; // prends le premier si c'est un tableau
        } else {
          break;
        }
      } catch (e) {
        break;
      }
    }

    // Vérifie que c'est une langue valide
    if (typeof item === 'string') {
      const clean = item.trim();
      if (allowed.includes(clean)) {
        validLangues.push(clean);
      }
    }
  }

  // Supprime les doublons
  return [...new Set(validLangues)];
};
  const [form, setForm] = useState({
    name: "",
    prenom: "",
    email: "",
    password: "",
    photo: null,
    metier: "",
    domaine: "", 
    categories: [],
    telephone: "",
    langues: [],
    nationalites: "",
    video: "",
    description: "",
    valeurs: "",
    lieuPrestation: "",
   // pmr: false,
    typeCours: "",
    publicCible: "",
    liens: "",
    siteWeb:"",
    instagram:"",
    linkedin:""

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

useEffect(() => {
  if (loading) return;

  if (!user || (!user.id && !user._id)) {
    navigate("/login", { replace: true });
    return;
  }

  const userId = user.id || user._id;

  api.get(`/api/users/${userId}`)
    .then((res) => {
      const userData = res.data;
      setForm({
        name: userData.name || "",
        prenom: userData.prenom || "",
        email: userData.email || "",
        password: "",
        photo: null,
        metier: userData.metier || "",
        domaine: Array.isArray(userData.domaine)
          ? userData.domaine[0] || ""
          : userData.domaine || "",
langues: extractValidLangues(userData.langues),
          telephone: userData.telephone || "",
        description: userData.description || "",
        valeurs: userData.valeurs || "",
        nationalites: userData.nationalites || "",
        video: userData.video || "",
        lieuPrestation: userData.lieuPrestation || "",
        typeCours: userData.typeCours || "",
        publicCible: userData.publicCible || "",
        siteWeb: userData.siteWeb || "",
        instagram: userData.instagram || "",
        linkedin: userData.linkedin || "",

categories: Array.isArray(userData.categories)
  ? userData.categories.map(cat =>
      typeof cat === "string" ? cat : cat.nom
    )
  : [],
      });
    })
    .catch((err) => {
      console.error("Erreur chargement profil :", err);
      navigate("/dashboard", { replace: true });
    });
}, [user, loading, navigate]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleLangueChange = (langue) => {
    setForm((prev) => ({
      ...prev,
      langues: prev.langues.includes(langue)
        ? prev.langues.filter((l) => l !== langue)
        : [...prev.langues, langue],
    }));
  };

  const handlePhotoChange = (e) => {
    setForm({ ...form, photo: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
   const userId = JSON.parse(localStorage.getItem("user"))?.id 
            || JSON.parse(localStorage.getItem("user"))?._id;


    if (!token || !userId) {
      alert("Non authentifié");
      return navigate("/login");
    }

    // Ajouter "autreCategorie" au tableau des catégories si nécessaire
let finalCategories = [...form.categories];
if (form.categories.includes("Autres") && form.autreCategorie?.trim()) {
  finalCategories = finalCategories.filter(c => c !== "Autres"); // retire "Autres"
  finalCategories.push(form.autreCategorie.trim()); // ajoute la vraie valeur
}
    const data = new FormData();
    Object.keys(form).forEach((key) => {
      if (key === "photo" && !form.photo) return;
      if (Array.isArray(form[key])) {
        form[key].forEach((item) => data.append(key, item));
      } else {
        data.append(key, form[key] ?? "");
      }
    });

    try {
      const res = await api.put(`/api/auth/${userId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const storedUser = JSON.parse(localStorage.getItem("user"));

localStorage.setItem(
  "user",
  JSON.stringify({
    ...storedUser,   // garde _id, role, credits, etc.
    ...res.data,     // mets à jour les champs modifiés
  })
);


      alert("Profil mis à jour !");
      navigate("/profile");
    } catch (error) {
      alert(error.response?.data?.msg || "Erreur");
    }
  };

  if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Chargement...
    </div>
  );
}



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
       { /*<img src={logo} alt="Logo" className="h-8" /> */} 
        <button
          onClick={() => navigate("/profile")}
          className="text-[#16A14A] hover:underline"
        >
          ← Retour au profil
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Modifier le profil</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Nouveau mot de passe (optionnel)"
                value={form.password}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
              />
            </div>

            {/* Photo */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                📁 Télécharger une photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              />
              {form.photo && (
                <p className="text-sm text-gray-500 mt-1">Fichier sélectionné : {form.photo.name}</p>
              )}
            </div>

            {/* Champs Créateur */}
             {user?.role === "createur" && (

              <div className="bg-gray-50 p-6 rounded-xl space-y-5">
                <h2 className="text-xl font-semibold text-gray-800">Informations Créateur</h2>

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
                  {categoriesDisponibles.map(cat => (
  <option key={cat.nom} value={cat.nom}>
    {cat.nom}
  </option>
))}

                </select>

                <div>
                  <p className="text-gray-700 font-medium">Langues parlées :</p>
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
                  type="tel"
                  name="telephone"
                  placeholder="Téléphone (optionnel)"
                  value={form.telephone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />

                <input
                  type="url"
                  name="video"
                  placeholder=" Lien vidéo de présentation"
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
                  <option value="">Lieu de prestation</option>
                  <option value="distanciel">Distanciel</option>
                  <option value="presentiel">Présentiel</option>
                  <option value="Distanciel & Présentiel">Distanciel & Présentiel</option>
                </select>

             {/*   <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="pmr"
                    checked={form.pmr}
                    onChange={handleChange}
                  />
                                    Accessible PMR (Personnes à mobilité réduite) 

                </label>   */}  

                 <select
                  name="typeCours"
                  value={form.typeCours}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                >
                  <option value="">Type de séance</option>
                 
                <option value="Individuel">Individuelle</option>
                <option value="Collectif">Collective </option>
                <option value="Individuelle & Collective">Individuelle & Collective </option>
                </select>

                <div>
              <label className="block text-gray-700 font-medium mb-1">Public cible</label>
              <input
                  type="text"
                  name="publicCible"
                  value={form.publicCible}
                  onChange={handleChange}
                  placeholder="Débutants, Professionnels, Tous niveaux"
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

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
  type="submit"
  className="bg-[#16A14A] hover:bg-[#1a9d53] text-white py-3 px-6 rounded-lg font-semibold transition"
>
  Enregistrer les modifications
</button>

              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm bg-white border-t">
        © {new Date().getFullYear()} OpenUp. Tous droits réservés.
      </footer>
    </div>
  );
};

export default ModifierProfil;