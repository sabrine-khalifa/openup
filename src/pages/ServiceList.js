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

  const categoriesDisponibles = [
    "Animaux & monde vivant",
    "Architecture & urbanisme",
    "Arts vivants",
    "Arts visuels",
    "Artisanat",
    "Bien-être",
    "Décoration & aménagement",
    "Développement personnel",
    "Écologie & durabilité",
    "Écriture & littérature",
    "Entrepreneuriat & innovation",
    "Finances personnelles & économie",
    "Formation, enseignement & accompagnement",
    "Gastronomie & art culinaire",
    "Humanitaire & droits humains",
    "Inclusion & solidarité",
    "Informatique & numérique",
    "Jeux & expériences interactives",
    "Management & organisation",
    "Marketing & communication",
    "Médias, journalisme & storytelling",
    "Musique & son",
    "Nature, jardinage & permaculture",
    "Parentalité & famille",
    "Politique, citoyenneté & engagement sociétal",
    "Relations & développement social",
    "Santé",
    "Sciences & technologies",
    "Sport, loisirs physiques & outdoor",
    "Spiritualité",
    "Stylisme & mode",
    "Thérapies alternatives",
    "Voyage, tourisme & interculturalité",
    "Autres" // ✅ Important
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
                {categoriesDisponibles.map((cat) => (
                  <label key={cat} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="mr-2"
                    />
                    <span>{cat}</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((service) => (
            <div key={service._id} className="bg-white p-4 rounded shadow cursor-pointer" onClick={() => navigate(`/service/${service._id}`)}>
              <h3 className="font-bold">{service.titre}</h3>
              <p className="text-sm text-gray-600">Par {service.createur?.name}</p>
              <p className="mt-2 text-green-600 font-semibold">{service.creditsProposes} crédits</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceList;