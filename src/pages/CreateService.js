// src/pages/CreateService.jsx
import React, { useState } from "react";
import api from "../api";
import Header from "../components/Header";
import DatePicker from "react-multi-date-picker";
import { useNavigate } from "react-router-dom";

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

const CreateService = () => {
  const navigate = useNavigate();
 const [formData, setFormData] = useState({
  titre: "",
  description: "",
  typePrestation: "",
  nombrePlaces: "",
  dateService: [],
  heure: "",
  duree: "",
  typeCours: "",
  publicCible: "",
  prerequis: "",     // ✅
  materiel: "",      // ✅

  accessiblePMR: false,
  lieu: "",
  categories: [],
  creditsProposes: "", 
    pmrDetails: "",
     dateAConvenir: false, // ✅ AJOUT ICI

});
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleCategoryToggle = (category) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setMessage("");

  let token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!token) {
    setMessage("❌ Vous devez être connecté.");
    setIsSubmitting(false);
    return;
  }

  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now && refreshToken) {
      const refreshRes = await api.post("/auth/refreshToken", { refreshToken });
      token = refreshRes.data.accessToken;
      localStorage.setItem("token", token);
    }
  } catch (err) {
    setMessage("❌ Session expirée. Veuillez vous reconnecter.");
    setIsSubmitting(false);
    return;
  }

  const userId = JSON.parse(localStorage.getItem("user"))?.id;
  const data = new FormData();

  // ✅ Validation CORRECTE du prix (sans ReferenceError)
 

 const rawCredits = formData.creditsProposes;
if (!rawCredits || rawCredits.trim() === "") {
  setMessage("❌ Crédits invalides. Veuillez saisir un nombre entier positif.");
  setIsSubmitting(false);
  return;
}

const creditsNumber = parseInt(rawCredits, 10);
if (isNaN(creditsNumber) || creditsNumber < 1) {
  setMessage("❌ Crédits invalides. Veuillez saisir un nombre entier positif.");
  setIsSubmitting(false);
  return;
}
// Ajouter "autreCategorie" au tableau des catégories si nécessaire
let finalCategories = [...formData.categories];
if (formData.categories.includes("Autres") && formData.autreCategorie?.trim()) {
  finalCategories = finalCategories.filter(c => c !== "Autres"); // retire "Autres"
  finalCategories.push(formData.autreCategorie.trim()); // ajoute la vraie valeur
}

  // Ajout des champs dans FormData
Object.entries(formData).forEach(([key, value]) => {
  if (key === "creditsProposes") return;
  if (key === "dateAConvenir") return; // ✅ AJOUT ICI

  if (key === "dateService" && Array.isArray(value)) {
    value.forEach(d => d && data.append("dateService", d));
  } else if (Array.isArray(value)) {
    value.forEach(item => data.append(key, item));
  } else {
    data.append(key, value);
  }
});

data.append("creditsProposes", creditsNumber);
data.append("dateAConvenir", formData.dateAConvenir ? "true" : "false");

  finalCategories.forEach(cat => data.append("categories", cat));


  data.append("createur", userId);
  images.forEach(img => data.append("image", img));

  try {
    await api.post("/api/services", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMessage("✅ Service créé avec succès !");
    setTimeout(() => navigate("/dashboard"), 1500);
  } catch (error) {
    console.error("Erreur détaillée :", error.response?.data || error.message);
    setMessage(`❌ ${error.response?.data?.erreur || "Erreur lors de la création."}`);
    setIsSubmitting(false); // ⚠️ Important : réactiver le bouton en cas d'erreur API
  }
};


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Bandeau jaune décoratif (UNIQUEMENT ici) */}
      <div className="bg-[#fff279] py-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-[#16A14A]"> Proposer un service ou une création </h1>
          <p className="text-gray-700 mt-1">Partagez votre savoir-faire avec la communauté</p>
        </div>
      </div>

      {/* Formulaire */}
      <main className="py-8 px-4">
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8">
          
          {message && (
            <div
              className={`text-center font-semibold py-3 rounded-lg mb-6 ${
                message.startsWith("✅")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Titre du service*</label>
              <input
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                placeholder="Ex: Atelier de méditation guidée"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Décrivez votre service..."
                className="w-full border border-gray-300 px-4 py-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
                required
              />
            </div>

            {/* Catégories */}
 {/* Catégories */}
{/* Catégories */}
<div>
  <label className="block text-gray-700 font-medium mb-2">Catégories *</label>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {categoriesDisponibles.map((cat, index) => {
      const catId = `category-${index}`;
      return (
        <div key={cat.nom} className="flex items-center gap-2">
          <input
            type="checkbox"
            id={catId}
            value={cat.nom}
            checked={formData.categories.includes(cat.nom)}
            onChange={() => handleCategoryToggle(cat.nom)}
            className="w-4 h-4 border-gray-300 rounded focus:ring-[#16A14A]"
          />
          <label htmlFor={catId} className="text-sm text-gray-700">
            {cat.nom}
          </label>
        </div>
      );
    })}
  </div>

  {/* Champ texte pour "Autres" */}
  {formData.categories.includes("Autres") && (
    <div className="mt-2">
      <label className="block text-gray-700 text-sm mb-1">
        Précisez votre catégorie :
      </label>
      <input
        type="text"
        name="autreCategorie"
        value={formData.autreCategorie || ""}
        onChange={(e) =>
          setFormData({ ...formData, autreCategorie: e.target.value })
        }
        placeholder="Entrez votre catégorie"
        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
      />
    </div>
  )}

  {/* Message d'erreur si aucune catégorie sélectionnée */}
  {formData.categories.length === 0 && (
    <p className="text-red-500 text-sm mt-1">
      Veuillez sélectionner au moins une catégorie
    </p>
  )}
</div>



            {/* Type de prestation */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Type de prestation</label>
              <select
  name="typePrestation"
  value={formData.typePrestation}
  onChange={handleChange}
>
  <option value="">Sélectionnez</option>
  <option value="En ligne">Distanciel</option>Distanciel & Présentiel
  <option value="Présentiel">Présentiel</option>
  <option value="Distanciel & Présentiel">Distanciel & Présentiel</option>
</select>
            </div>

            {/* Lieu (si besoin) */}
           {/* Champ Lieu - toujours présent */}
<div>
  <label className="block text-gray-700 font-medium mb-1">Lieu</label>
  <input
    type="text"
    name="lieu"
    value={formData.lieu}
    onChange={handleChange}
    placeholder="Adresse "
    className="w-full border border-gray-300 px-4 py-3 rounded-lg"
  />
</div>

<div>
    <label className="block text-gray-700 font-medium mb-1">
      Valeur en crédits  *
    </label>
  <input
  type="number"
  name="creditsProposes"  // ✅
  value={formData.creditsProposes || ""}
  onChange={handleChange}
  placeholder="Ex: 50 crédits"
  min="1"
  step="1"
  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
  required
/>
    
  </div>
            {/* Dates */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Dates disponibles</label>
  
  <DatePicker
  multiple
  disabled={formData.dateAConvenir} // ✅
  value={formData.dateService.map(str => new Date(str))}
  onChange={(dates) =>
    setFormData({
      ...formData,
      dateService: dates.map(d => d.format("YYYY-MM-DD")),
    })
  }
  format="DD/MM/YYYY"
  inputClass="w-full border border-gray-300 px-4 py-3 rounded-lg"
/>

            </div>

            {/* Heure + Durée */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Heure</label>
               <input
  type="time"
  name="heure"
  disabled={formData.dateAConvenir} // ✅
  value={formData.heure}
  onChange={handleChange}
  className="w-full border border-gray-300 px-4 py-3 rounded-lg"
/>

              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Durée</label>
                <input
                  type="text"
                  name="duree"
                  value={formData.duree}
                  onChange={handleChange}
                  placeholder="ex: 1h30"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg"
                />
              </div>
            </div>
             <div className="flex items-center gap-3">
              <input
  type="checkbox"
  id="date-convenir"
  name="dateAConvenir"
  checked={formData.dateAConvenir}
  onChange={(e) => {
    const checked = e.target.checked;
    setFormData({
      ...formData,
      dateAConvenir: checked,
      dateService: checked ? [] : formData.dateService, // ✅ vider dates
      heure: checked ? "" : formData.heure,             // ✅ vider heure
    });
  }}
/>

              <label htmlFor="date-convenir" className="text-gray-700 font-medium">
                Date et heure de rdv à convenir ensemble 
              </label>
            </div>

            {/* Type de cours */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Type de séance  </label>
              <select
                name="typeCours"
                value={formData.typeCours}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg"
              >
                <option value="">Sélectionnez</option>
                <option value="Individuel">Individuelle</option>
                <option value="Collectif">Collective </option>
                <option value="Individuelle & Collective">Individuelle & Collective </option>
              </select>
            </div>

            {/* Public cible */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Public cible</label>
              <input
                  type="text"
                  name="publicCible"
                  value={formData.publicCible}
                  onChange={handleChange}
                  placeholder="Débutants, Professionnels, Tous niveaux"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg"
                />
            </div>
           
<div>
  <label className="block text-gray-700 font-medium mb-1">
    Prérequis
  </label>
  <input
    type="text"
    name="prerequis"
    value={formData.prerequis}
    onChange={handleChange}
    placeholder="Ex : aucun, bases recommandées, motivation requise…"
    className="w-full border border-gray-300 px-4 py-3 rounded-lg"
  />
</div>

{/* Matériel nécessaire */}
<div>
  <label className="block text-gray-700 font-medium mb-1">
    Matériel nécessaire
  </label>
  <input
    type="text"
    name="materiel"
    value={formData.materiel}
    onChange={handleChange}
    placeholder="Ex : ordinateur, tapis, carnet…"
    className="w-full border border-gray-300 px-4 py-3 rounded-lg"
  />
</div>

            {/* Nombre de places + Crédits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Nombre de places</label>
                <input
                  type="number"
                  name="nombrePlaces"
                  value={formData.nombrePlaces}
                  onChange={handleChange}
                  placeholder="Max participants"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg"
                  required
                />
              </div>
            
            </div>

            {/* PMR */}
            {/* Case à cocher */}
<div className="flex items-center gap-3">
  <input
    type="checkbox"
    id="accessible-pmr"
    name="accessiblePMR"
    checked={formData.accessiblePMR}
    onChange={handleChange}
    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
  />
  <label htmlFor="accessible-pmr" className="text-gray-700 font-medium">
    Accessible PMR (Personne à mobilité réduite)
  </label>
</div>
{/* Champ texte conditionnel PMR */}
{formData.accessiblePMR && (
  <div className="mt-3">
    <label className="block text-gray-700 font-medium mb-1">
      Information Complémentaire
    </label>
    <input
      type="text"
      name="pmrDetails"
      value={formData.pmrDetails}
      onChange={handleChange}
      placeholder="Ex : rampe d’accès, ascenseur, toilettes adaptées…"
      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
    />
  </div>
)}


{/* Champ texte conditionnel */}


            {/* Image */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Photos du service</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
              {images.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {images.length} fichier(s) sélectionné(s)
                </p>
              )}
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#16A14A] hover:bg-[#1a9d53] disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              {isSubmitting ? "Publication..." : "🎯 Publier le service"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateService;