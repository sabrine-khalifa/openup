// src/pages/CreateService.jsx
import React, { useState } from "react";
import api from "../api";
import Header from "../components/Header";
import DatePicker from "react-multi-date-picker";
import { useNavigate } from "react-router-dom";

const categoriesDisponibles = [
  { nom: "Animaux & monde vivant", couleur: "#FF6B6B" },
  { nom: "Architecture & urbanisme", couleur: "#6BCB77" },
  { nom: "Arts vivants", couleur: "#4D96FF" },
  { nom: "Arts visuels", couleur: "#FFD93D" },
  { nom: "Artisanat", couleur: "#FF6F91" },
  { nom: "Bien-être", couleur: "#27AE60" },
  { nom: "Décoration & aménagement", couleur: "#845EC2" },
  { nom: "Développement personnel", couleur: "#00C9A7" },
  { nom: "Écologie & durabilité", couleur: "#FF9671" },
  { nom: "Écriture & littérature", couleur: "#FFC75F" },
  { nom: "Entrepreneuriat & innovation", couleur: "#F9F871" },
  { nom: "Finances personnelles & économie", couleur: "#B39CD0" },
  { nom: "Formation, enseignement & accompagnement", couleur: "#00C2FF" },
  { nom: "Gastronomie & art culinaire", couleur: "#FFABAB" },
  { nom: "Humanitaire & droits humains", couleur: "#8CFFDB" },
  { nom: "Inclusion & solidarité", couleur: "#FF8C42" },
  { nom: "Informatique & numérique", couleur: "#FF7F50" },
  { nom: "Jeux & expériences interactives", couleur: "#008080" },
  { nom: "Management & organisation", couleur: "#FFB347" },
  { nom: "Marketing & communication", couleur: "#DFFF00" },
  { nom: "Médias, journalisme & storytelling", couleur: "#FF6347" },
  { nom: "Musique & son", couleur: "#DA70D6" },
  { nom: "Nature, jardinage & permaculture", couleur: "#32CD32" },
  { nom: "Parentalité & famille", couleur: "#FF69B4" },
  { nom: "Politique, citoyenneté & engagement sociétal", couleur: "#7B68EE" },
  { nom: "Relations & développement social", couleur: "#CD5C5C" },
  { nom: "Santé", couleur: "#20B2AA" },
  { nom: "Sciences & technologies", couleur: "#FFA07A" },
  { nom: "Sport, loisirs physiques & outdoor", couleur: "#9370DB" },
  { nom: "Spiritualité", couleur: "#3CB371" },
  { nom: "Stylisme & mode", couleur: "#FF4500" },
  { nom: "Thérapies alternatives", couleur: "#4682B4" },
  { nom: "Voyage, tourisme & interculturalité", couleur: "#F08080" },
  { nom: "Autres", couleur: "#6A5ACD" }

];


const CreateService = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    typePrestation: "distanciel",
    nombrePlaces: "",
    creditsProposes: "",
    dateService: [],
    heure: "",
    duree: "",
    typeCours: "",
    publicCible: "",
    accessiblePMR: false,
    lieu: "",
    categories: [],
    prix: "",
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
    
  // Envoi des données avec conversion des dates
Object.entries(formData).forEach(([key, value]) => {
  if (key === "dateService" && Array.isArray(value)) {
    value.forEach(dateStr => {
      if (dateStr) {
        data.append("dateService", new Date(dateStr).toISOString()); // ✅ Format valide
      }
    });
  } else if (Array.isArray(value)) {
    value.forEach(item => data.append(key, item));
  } else {
    data.append(key, value);
  }
});
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
<div>
  <label className="block text-gray-700 font-medium mb-2">Catégories *</label>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {categoriesDisponibles.map((cat) => (
      <div key={cat.nom} className="flex items-center gap-2">
        <input
          type="checkbox"
          value={cat.nom}
          checked={formData.categories.includes(cat.nom)}
          onChange={() => handleCategoryToggle(cat.nom)}
          className="w-4 h-4 border-gray-300 rounded focus:ring-[#16A14A]"
        />
        <span className="text-sm font-medium" style={{ color: cat.couleur }}>
          {cat.nom}
        </span>
      </div>
    ))}
  </div>

  {/* Message d'erreur si aucune catégorie sélectionnée */}
  {formData.categories.length === 0 && (
    <p className="text-red-500 text-sm mt-1">
      Veuillez sélectionner au moins une catégorie
    </p>
  )}
</div>


            {/* Type de prestation */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Type de prestation*</label>
              <select
  name="typePrestation"
  value={formData.typePrestation}
  onChange={handleChange}
>
  <option value="">Sélectionnez</option>
  <option value="En ligne">Distanciel</option>
  <option value="Présentiel">Présentiel</option>
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
    placeholder="Ville, quartier, ou 'En ligne' si pertinent"
    className="w-full border border-gray-300 px-4 py-3 rounded-lg"
  />
</div>

<div>
    <label className="block text-gray-700 font-medium mb-1">
      Prix en crédits *
    </label>
    <input
      type="number"
      name="prix"
      value={formData.prix}
      onChange={handleChange}
      placeholder="Ex: 50 crédits"
      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
      required
    />
    
  </div>
            {/* Dates */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Dates disponibles</label>
              <DatePicker
                multiple
                value={formData.dateService}
                onChange={(dates) =>
                  setFormData({
                    ...formData,
                    dateService: dates.map(d => d.format("YYYY-MM-DD")),
                  })
                }
                format="DD/MM/YYYY"
                inputClass="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
              />
            </div>

            {/* Heure + Durée */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Heure</label>
                <input
                  type="time"
                  name="heure"
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

            {/* Type de cours */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Type de cours</label>
              <select
                name="typeCours"
                value={formData.typeCours}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg"
              >
                <option value="">Sélectionnez</option>
                <option value="Individuel">Individuel</option>
                <option value="collectif">Collectif</option>
              </select>
            </div>

            {/* Public cible */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Public cible</label>
              <select
                name="publicCible"
                value={formData.publicCible}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg"
              >
                <option value="">Tous niveaux</option>
                <option value="Débutants">Débutants</option>
                <option value="Professionnels">Professionnels</option>
              </select>
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
              <div>
                <label className="block text-gray-700 font-medium mb-1">Crédits proposés</label>
                <input
                  type="number"
                  name="creditsProposes"
                  value={formData.creditsProposes}
                  onChange={handleChange}
                  placeholder="Ex: 50"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg"
                  required
                />
              </div>
            </div>

            {/* PMR */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="pmr"
                name="accessiblePMR"
                checked={formData.accessiblePMR}
                onChange={handleChange}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="pmr" className="text-gray-700 font-medium">
                Accessible PMR
              </label>
            </div>

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