// src/pages/EditService.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import DatePicker from "react-multi-date-picker";
import { useNavigate, useParams } from "react-router-dom";

const categoriesDisponibles = [
  { nom: "Bien-Être", couleur: "#27AE60" },
  { nom: "Sport", couleur: "#212E53" },
  { nom: "Musique & Son", couleur: "#FFBF66" },
  { nom: "Art", couleur: "#F27438" },
  { nom: "Architecture", couleur: "#E3CD8B" },
  { nom: "Développement Personnel", couleur: "#9B59B6" },
  { nom: "Illustration & Design", couleur: "#e76f51" },
  { nom: "Vidéo & Montage", couleur: "#585B4C" },
  { nom: "Santé", couleur: "#AFA4CE" },
  { nom: "Artisanat", couleur: "#CA7C5C" },
  { nom: "Décoration & Aménagement", couleur: "#C89F9C" },
  { nom: "Formation, Transmission & Accompagnement", couleur: "#C8574D" },
  { nom: "Informatique & Technologies", couleur: "#3498DB" },
];

const EditService = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // ← ID du service à modifier

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
          typePrestation: service.typePrestation || "distanciel",
          nombrePlaces: service.nombrePlaces || "",
          creditsProposes: service.creditsProposes || "",
          dateService: Array.isArray(service.dateService) ? service.dateService : [],
          heure: service.heure || "",
          duree: service.duree || "",
          typeCours: service.typeCours || "",
          publicCible: service.publicCible || "",
          accessiblePMR: service.accessiblePMR || false,
          lieu: service.lieu || "",
          categories: Array.isArray(service.categories) ? service.categories : [],
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

    // Rafraîchir le token si expiré
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now && refreshToken) {
        const refreshRes = await axios.post("https://backend-hqhy.onrender.com/api/auth/refreshToken", { refreshToken });
        token = refreshRes.data.accessToken;
        localStorage.setItem("token", token);
      }
    } catch (err) {
      setMessage("❌ Session expirée. Veuillez vous reconnecter.");
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();

    // Ajouter tous les champs du formulaire
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => data.append(key, item));
      } else {
        data.append(key, value);
      }
    });

    // Ajouter les nouvelles images (remplaceront les anciennes côté backend)
    images.forEach(img => data.append("image", img));

    try {
      await axios.put(`https://backend-hqhy.onrender.com/api/services/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("✅ Service mis à jour avec succès !");
      setTimeout(() => navigate("/serviceList"), 1500);
    } catch (error) {
      console.error("Erreur :", error);
      setMessage("❌ Erreur lors de la mise à jour.");
    } finally {
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
              <label className="block text-gray-700 font-medium mb-2">Catégories *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {categoriesDisponibles.map((cat) => {
                  const rgb = parseInt(cat.couleur.slice(1), 16);
                  const r = (rgb >> 16) & 0xff;
                  const g = (rgb >> 8) & 0xff;
                  const b = rgb & 0xff;
                  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                  const textColor = luminance > 0.5 ? "#333" : "white";

                  return (
                    <label
                      key={cat.nom}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition ${
                        formData.categories.includes(cat.nom)
                          ? "border-[#16A14A] scale-105"
                          : "border-transparent"
                      }`}
                      style={{
                        backgroundColor: cat.couleur,
                        color: textColor,
                      }}
                    >
                      <input
                        type="checkbox"
                        name="categories"
                        value={cat.nom}
                        checked={formData.categories.includes(cat.nom)}
                        onChange={(e) => {
                          const categories = e.target.checked
                            ? [...formData.categories, cat.nom]
                            : formData.categories.filter((c) => c !== cat.nom);
                          setFormData({ ...formData, categories });
                        }}
                        className="sr-only"
                      />
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 border-2 rounded ${
                          formData.categories.includes(cat.nom)
                            ? "bg-white border-white"
                            : "border-white"
                        }`}
                      >
                        {formData.categories.includes(cat.nom) && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      <span className="font-medium">{cat.nom}</span>
                    </label>
                  );
                })}
              </div>
              {formData.categories.length === 0 && (
                <p className="text-red-500 text-sm mt-2">
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
            {(formData.typePrestation === "presentiel" || formData.typePrestation === "hybride") && (
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