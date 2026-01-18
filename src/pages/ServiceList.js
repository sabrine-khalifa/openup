import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [customCategory, setCustomCategory] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [notes, setNotes] = useState({});
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

const categories = [
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


  { nom: "Autres", couleur: "#6A5ACD" }
];

  // Fermer dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

useEffect(() => {
  const u = JSON.parse(localStorage.getItem("user"));
  setUser(u);

  const handleCreditsUpdate = (e) => {
    if (e?.detail) {
      setUser(e.detail); // ✅ utilisateur complet
    }
  };

  window.addEventListener("creditsUpdated", handleCreditsUpdate);

  return () => {
    window.removeEventListener("creditsUpdated", handleCreditsUpdate);
  };
}, []);



  // Charger services, notes, user... (inchangé)
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get("https://backend-hqhy.onrender.com/api/services");
        const servicesData = res.data;

        const servicesWithRemaining = await Promise.all(
          servicesData.map(async (s) => {
            const countRes = await axios.get(`https://backend-hqhy.onrender.com/api/reservations/count/${s._id}`);
            const placesRestantes = s.nombrePlaces - (countRes.data.count || 0);
            return { ...s, placesRestantes };
          })
        );

        const available = servicesWithRemaining.filter(s => s.placesRestantes > 0);
        setServices(available);
        setFiltered(available);
        available.forEach(s => loadNoteForService(s._id));
      } catch (err) {
        console.error(err);
      }
    };
    fetchServices();
  }, []);

  const loadNoteForService = async (id) => { /* ... identique à avant ... */ };

  // Filtre (inchangé)
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const hasCustom = selectedCategories.includes("Autres") && customCategory.trim();

    const results = services.filter(s => {
      const matchSearch = s.titre?.toLowerCase().includes(lowerSearch);
      const serviceCats = Array.isArray(s.categories) ? s.categories : (s.categories ? [s.categories] : []);

      const matchCat = selectedCategories.length === 0 || selectedCategories.some(cat => {
        if (cat === "Autres" && hasCustom) {
          return serviceCats.some(sc => sc?.toLowerCase() === customCategory.trim().toLowerCase());
        }
        return serviceCats.some(sc => sc?.toLowerCase() === cat.toLowerCase());
      });

      return matchSearch && matchCat;
    });

    setFiltered(results);
  }, [search, selectedCategories, customCategory, services]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    setUser(u);
  }, []);

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const displayLabel = selectedCategories.length === 0
    ? "Catégories"
    : selectedCategories.length === 1
      ? selectedCategories[0]
      : `${selectedCategories.length} catégories sélectionnées`;

  return (
    <div className="p-6 bg-[#f5f5f5] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Services disponibles</h2>
          {user?.role === "createur" && (
            <button onClick={() => navigate("/create-service")} className="bg-[#16A14A] text-white px-4 py-2 rounded">
              + Ajouter un créneau
            </button>
          )}
        </div>

        {/* Barre de recherche + filtre */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Rechercher..."
            className="flex-1 border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Dropdown personnalisé "comme un select" */}
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#16A14A] cursor-pointer bg-white w-full md:w-64 text-left"
            >
              {displayLabel}
            </div>

            {dropdownOpen && (
              <div className="absolute z-10 mt-1 w-full md:w-64 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                {categories.map((cat) => (
                  <label key={cat.nom} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.nom)}
                      onChange={() => toggleCategory(cat.nom)}
                      className="mr-2"
                    />
                    <span>{cat.nom}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Champ "Autres" si sélectionné */}
        {selectedCategories.includes("Autres") && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Votre catégorie personnalisée :
            </label>
            <input
              type="text"
              placeholder="Ex: Photographie, Danse..."
              className="border px-3 py-2 rounded w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
            />
          </div>
        )}

        {/* Liste des services (en grille ou liste, selon vous) */}
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filtered.map((service) => (
              <div
                key={service._id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition flex flex-col cursor-pointer"
                onClick={() => navigate(`/service/${service._id}`)}
              >
                    {console.log("Image du service:", service.images)}

                {/* Image */}
                {service.images && (
                  <img
  src={
    Array.isArray(service.images) && service.images.length > 0
      ? service.images[0]
      : service.images || "/default-image.jpg"
  }
  alt={service.titre}
  className="rounded-t-xl h-40 w-full object-cover"
  onError={(e) => {
    e.target.src = "/default-image.jpg"; // Image de secours si échec
  }}
/>
                )}

                <div className="p-4 flex flex-col flex-1">
                  {/* Créateur + Note */}
                  <div className="flex items-center mb-2">
                    {/* ✅ Photo du créateur (ou avatar local) */}
                    <img
  src={
    service.createur?.photo
      ? service.createur.photo
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          service.createur?.name || 'U'
        )}&background=16A14A&color=fff&size=36`
  }
  alt=""
  className="rounded-full w-9 h-9 mr-2"
/>
                    <div>
                      <span className="font-medium text-sm">
                       {service.createur.prenom} {service.createur.name} 
                      </span>

                      {/* ✅ Note (si existe) */}
                      {notes[service._id] && (
                        <div className="flex items-center text-yellow-500 text-xs mt-1">
                          <span>⭐</span>
                          <span className="text-gray-600 ml-1">
                            {notes[service._id].note}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Titre */}
                  <h3 className="text-md font-semibold mb-1">
                    {service.titre}
                  </h3>

                  {/* ✅ Crédits */}
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-semibold text-green-600">
                      {service.creditsProposes} crédits
                    </span>
                    <button className="w-20 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm">
                      Réserver
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
};

export default ServiceList;