// src/pages/EditService.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import DatePicker from "react-multi-date-picker";
import { useNavigate, useParams } from "react-router-dom";

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

const EditService = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // ← ID du service à modifier

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
  prerequis: "",
  materiel: "",
  accessiblePMR: false,
  pmrDetails: "",
  lieu: "",
  categories: [],
  autreCategorie: "",
  creditsProposes: "",
  dateAConvenir: false,
});


  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Charger le service au montage
  useEffect(() => {
    const fetchService = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`https://backend-hqhy.onrender.com/api/services/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const service = res.data;

       setFormData({
  titre: service.titre || "",
  description: service.description || "",
  typePrestation: service.typePrestation || "",
  nombrePlaces: service.nombrePlaces || "",
  creditsProposes: service.creditsProposes?.toString() || "",
  dateService: Array.isArray(service.dateService)
    ? service.dateService.map(d => d.split("T")[0])
    : [],
  heure: service.heure || "",
  duree: service.duree || "",
  typeCours: service.typeCours || "",
  publicCible: service.publicCible || "",
  prerequis: service.prerequis || "",
  materiel: service.materiel || "",
  accessiblePMR: service.accessiblePMR || false,
  pmrDetails: service.pmrDetails || "",
  lieu: service.lieu || "",
  categories: service.categories || [],
  autreCategorie: "",
  dateAConvenir: service.dateAConvenir || false,
});

      } catch (err) {
        console.error("Erreur chargement service :", err);
        setMessage("❌ Impossible de charger ce service.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchService();
  }, [id]);

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

  // Refresh token
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now && refreshToken) {
      const refreshRes = await axios.post(
        "https://backend-hqhy.onrender.com/api/auth/refreshToken",
        { refreshToken }
      );
      token = refreshRes.data.accessToken;
      localStorage.setItem("token", token);
    }
  } catch {
    setMessage("❌ Session expirée.");
    setIsSubmitting(false);
    return;
  }

  const creditsNumber = parseInt(formData.creditsProposes, 10);
  if (isNaN(creditsNumber) || creditsNumber <= 0) {
    setMessage("❌ Crédits invalides.");
    setIsSubmitting(false);
    return;
  }

  const safeFormData = {
    ...formData,
    dateService: formData.dateAConvenir ? [] : formData.dateService,
    heure: formData.dateAConvenir ? "" : formData.heure,
  };

  let finalCategories = [...safeFormData.categories];
  if (finalCategories.includes("Autres") && safeFormData.autreCategorie?.trim()) {
    finalCategories = finalCategories.filter(c => c !== "Autres");
    finalCategories.push(safeFormData.autreCategorie.trim());
  }

  const data = new FormData();

  Object.entries(safeFormData).forEach(([key, value]) => {
    if (["categories", "autreCategorie", "creditsProposes"].includes(key)) return;

    if (Array.isArray(value)) {
      value.forEach(v => data.append(key, v));
    } else {
      data.append(key, value);
    }
  });

  data.append("creditsProposes", creditsNumber);
  data.append("accessiblePMR", safeFormData.accessiblePMR === true);
  // Après avoir créé `data`
data.append("dateAConvenir", safeFormData.dateAConvenir ? "true" : "false");
  
  data.append("prerequis", formData.prerequis);
data.append("materiel", formData.materiel);




  finalCategories.forEach(cat => data.append("categories", cat));
  images.forEach(img => data.append("image", img));

  try {
    await axios.put(
      `https://backend-hqhy.onrender.com/api/services/${id}`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setMessage("✅ Service mis à jour avec succès !");
    setTimeout(() => navigate("/dashboard"), 1500);
  } catch (error) {
  console.error("❌ Erreur update service COMPLETE :", error);

  if (error.response) {
    console.error("📩 DATA :", error.response.data);
    console.error("📌 STATUS :", error.response.status);
    console.error("📎 HEADERS :", error.response.headers);
  } else if (error.request) {
    console.error("🚫 Aucune réponse du serveur :", error.request);
  } else {
    console.error("⚠️ Erreur JS :", error.message);
  }
}

   finally {
    setIsSubmitting(false);
  }
};



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Chargement du service...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Bandeau jaune décoratif */}
      <div className="bg-[#fff279] py-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-[#16A14A]">Modifier votre service</h1>
          <p className="text-gray-700 mt-1">Mettez à jour les détails de votre service</p>
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
              <label className="block text-gray-700 font-medium mb-1">Titre du service</label>
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
<div>
  <label className="block text-gray-700 font-medium mb-2">
    Catégories *
  </label>

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
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
              >
                <option value="En ligne">Distanciel</option>
                <option value="Présentiel">Présentiel</option>
              </select>
            </div>

            {/* Lieu (si besoin) */}
            {formData.typePrestation === "Présentiel" && (
              <div>
                <label className="block text-gray-700 font-medium mb-1">Lieu</label>
                <input
                  type="text"
                  name="lieu"
                  value={formData.lieu}
                  onChange={handleChange}
                  placeholder="Ville ou adresse"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg"
                />
              </div>
            )}

            {/* Dates */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Dates disponibles</label>
 <DatePicker
  multiple
  disabled={formData.dateAConvenir}
  value={formData.dateService} // ← garde les chaînes "YYYY-MM-DD"
  onChange={(dates) => {
    // dates est un tableau d'objets Date (de la lib react-multi-date-picker)
    const formatted = dates.map(d => d.format("YYYY-MM-DD")); // ✅ OK ici car d est un objet de la lib
    setFormData({
      ...formData,
      dateService: formatted,
    });
  }}
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
              {/* Date à convenir */}
<div className="flex items-center gap-3">
  <input
    type="checkbox"
    id="dateAConvenir"
    name="dateAConvenir"
    checked={formData.dateAConvenir}
    onChange={handleChange}
    className="w-5 h-5 text-green-600 border-gray-300 rounded"
  />
  <label htmlFor="dateAConvenir" className="text-gray-700 font-medium">
    Date et heure à convenir ensemble
  </label>
</div>
            </div>


            {/* Type de cours */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Type de séance</label>
              <select
                name="typeCours"
                value={formData.typeCours}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg"
              >
                <option value="">Sélectionnez</option>
                <option value="Individuel">Individuelle</option>
                <option value="Collectif">Collective </option>
                <option value="Groupe">Individuelle & Collective </option>
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
                  placeholder="Débutants, Professionnels,Tous niveaux"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg"
                />
            </div>
            {/* Prérequis */}
<div>
  <label className="block text-gray-700 font-medium mb-1">
    Prérequis
  </label>
  <textarea
    name="prerequis"
    value={formData.prerequis}
    onChange={handleChange}
    rows={2}
    placeholder="Ex : aucun, bases recommandées, motivation requise…"
    className="w-full border border-gray-300 px-4 py-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
  />
</div>
{/* Matériel nécessaire */}
<div>
  <label className="block text-gray-700 font-medium mb-1">
    Matériel nécessaire
  </label>
  <textarea
    name="materiel"
    value={formData.materiel}
    onChange={handleChange}
    rows={2}
    placeholder="Ex : ordinateur, connexion internet, carnet…"
    className="w-full border border-gray-300 px-4 py-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
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
                Accessible PMR (Personne à mobilité réduite)
              </label>
            </div>

            {/* Images */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Remplacer les photos (optionnel)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
              {images.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {images.length} nouvelle(s) image(s) sélectionnée(s) — remplacera les anciennes.
                </p>
              )}   
            </div>

            {/* Boutons */}
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="px-5 py-2.5 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition"
              >
                ← Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#16A14A] hover:bg-[#1a9d53] disabled:bg-gray-400 text-white font-semibold py-2.5 px-6 rounded-lg transition"
              >
                {isSubmitting ? "Enregistrement..." : "💾 Enregistrer les modifications"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditService;