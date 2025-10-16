import React, { useState, useEffect } from "react";
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

  const navigate = useNavigate();

  const categoriesDisponibles = [
    { nom: "Animaux & monde vivant", couleur: "#8BC34A" },
    { nom: "Architecture & urbanisme", couleur: "#E3CD8B" },
    { nom: "Arts vivants", couleur: "#FF7043" },
    { nom: "Arts visuels", couleur: "#FFB74D" },
    { nom: "Artisanat", couleur: "#CA7C5C" },
    { nom: "Bien-être", couleur: "#4DB6AC" },
    { nom: "Décoration & aménagement", couleur: "#C89F9C" },
    { nom: "Développement personnel", couleur: "#9B59B6" },
    { nom: "Écologie & durabilité", couleur: "#7CB342" },
    { nom: "Écriture & littérature", couleur: "#F06292" },
    { nom: "Entrepreneuriat & innovation", couleur: "#FF8A65" },
    { nom: "Finances personnelles & économie", couleur: "#FFD54F" },
    { nom: "Formation, enseignement & accompagnement", couleur: "#C8574D" },
    { nom: "Gastronomie & art culinaire", couleur: "#A1887F" },
    { nom: "Humanitaire & droits humains", couleur: "#90A4AE" },
    { nom: "Inclusion & solidarité", couleur: "#4DD0E1" },
    { nom: "Informatique & numérique", couleur: "#3498DB" },
    { nom: "Jeux & expériences interactives", couleur: "#7986CB" },
    { nom: "Management & organisation", couleur: "#F06292" },
    { nom: "Marketing & communication", couleur: "#BA68C8" },
    { nom: "Médias, journalisme & storytelling", couleur: "#FFB74D" },
    { nom: "Musique & son", couleur: "#FFBF66" },
    { nom: "Nature, jardinage & permaculture", couleur: "#81C784" },
    { nom: "Parentalité & famille", couleur: "#FF8A65" },
    { nom: "Politique, citoyenneté & engagement sociétal", couleur: "#64B5F6" },
    { nom: "Relations & développement social", couleur: "#AED581" },
    { nom: "Santé", couleur: "#AFA4CE" },
    { nom: "Sciences & technologies", couleur: "#4DB6AC" },
    { nom: "Sport, loisirs physiques & outdoor", couleur: "#212E53" },
    { nom: "Spiritualité", couleur: "#BA68C8" },
    { nom: "Stylisme & mode", couleur: "#FF7043" },
    { nom: "Thérapies alternatives", couleur: "#4DB6AC" },
    { nom: "Voyage, tourisme & interculturalité", couleur: "#FFD54F" },
    { nom: "Autres", couleur: "#9E9E9E" },
  ];

  // Charger les services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const resServices = await axios.get("https://backend-hqhy.onrender.com/api/services");
        const servicesData = resServices.data;

        const servicesWithRemaining = await Promise.all(
          servicesData.map(async (service) => {
            const resReservations = await axios.get(
              `https://backend-hqhy.onrender.com/api/reservations/count/${service._id}`
            );
            const nbReservations = resReservations.data.count || 0;
            const placesRestantes = service.nombrePlaces - nbReservations;
            return { ...service, placesRestantes };
          })
        );

        const servicesDisponibles = servicesWithRemaining.filter((s) => s.placesRestantes > 0);
        setServices(servicesDisponibles);
        setFiltered(servicesDisponibles);
        servicesDisponibles.forEach((s) => loadNoteForService(s._id));
      } catch (error) {
        console.error("Erreur :", error);
      }
    };

    fetchServices();
  }, []);

  // Charger les notes
  const loadNoteForService = async (serviceId) => {
    try {
      const res = await axios.get(`https://backend-hqhy.onrender.com/api/avis/service/${serviceId}`);
      const avis = res.data;

      if (avis.length === 0) {
        setNotes((prev) => ({ ...prev, [serviceId]: null }));
        return;
      }

      const avisAvecNote = avis.filter((a) => {
        const n = typeof a.note === "string" ? parseFloat(a.note) : a.note;
        return typeof n === "number" && !isNaN(n) && n >= 1 && n <= 5;
      });

      if (avisAvecNote.length === 0) {
        setNotes((prev) => ({ ...prev, [serviceId]: null }));
        return;
      }

      const noteMoyenne =
        avisAvecNote
          .map((a) => (typeof a.note === "string" ? parseFloat(a.note) : a.note))
          .reduce((acc, n) => acc + n, 0) / avisAvecNote.length;

      setNotes((prev) => ({
        ...prev,
        [serviceId]: {
          note: noteMoyenne.toFixed(1),
          count: avis.length,
        },
      }));
    } catch (err) {
      console.error("Erreur chargement note:", err);
      setNotes((prev) => ({ ...prev, [serviceId]: null }));
    }
  };

  // Filtre
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const hasCustom = selectedCategories.includes("Autres") && customCategory.trim();

    const results = services.filter((s) => {
      const matchSearch = s.titre?.toLowerCase().includes(lowerSearch);
      const serviceCats = Array.isArray(s.categories) ? s.categories : s.categories ? [s.categories] : [];

      const matchesSelected = selectedCategories.length === 0 || 
        selectedCategories.some((cat) => {
          if (cat === "Autres" && hasCustom) {
            return serviceCats.some(sc => sc && sc.toLowerCase() === customCategory.trim().toLowerCase());
          }
          return serviceCats.some(sc => sc && sc.toLowerCase() === cat.toLowerCase());
        });

      return matchSearch && matchesSelected;
    });

    setFiltered(results);
  }, [search, selectedCategories, customCategory, services]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
  }, []);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="p-6 bg-[#f5f5f5] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-black">Services disponibles</h1>
            <p className="text-gray-600">Découvrez les talents de notre communauté</p>
          </div>
          {user?.role === "createur" && (
            <button
              onClick={() => navigate("/create-service")}
              className="bg-[#16A14A] text-white px-4 py-2 rounded hover:bg-[#138a3f] transition"
            >
              + Ajouter un créneau
            </button>
          )}
        </div>

        {/* Barre de recherche + filtres */}
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="🔍 Rechercher un service..."
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Catégories sous forme de tags cliquables */}
          <div className="flex flex-wrap gap-2">
            {categoriesDisponibles.map((cat) => (
              <button
                key={cat.nom}
                type="button"
                onClick={() => toggleCategory(cat.nom)}
                className={`px-3 py-1.5 text-sm rounded-full transition ${
                  selectedCategories.includes(cat.nom)
                    ? "text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
                style={{
                  backgroundColor: selectedCategories.includes(cat.nom) ? cat.couleur : "white",
                  color: selectedCategories.includes(cat.nom) ? "white" : cat.couleur,
                }}
              >
                {cat.nom}
              </button>
            ))}
          </div>

          {/* Champ "Autres" */}
          {selectedCategories.includes("Autres") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Votre catégorie personnalisée :
              </label>
              <input
                type="text"
                placeholder="Ex: Calligraphie, Robotique..."
                className="w-full border px-3 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Liste des services */}
        <ul className="space-y-4">
          {filtered.length === 0 ? (
            <li className="text-center py-8 text-gray-500">Aucun service trouvé.</li>
          ) : (
            filtered.map((service) => (
              <li
                key={service._id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-4 cursor-pointer flex items-start gap-4"
                onClick={() => navigate(`/service/${service._id}`)}
              >
                {/* Image miniature */}
                <div className="flex-shrink-0 w-24 h-24 rounded overflow-hidden">
                  {service.images && (
                    <img
                      src={
                        Array.isArray(service.images) && service.images.length > 0
                          ? service.images[0]
                          : "/default-image.jpg"
                      }
                      alt={service.titre}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.src = "/default-image.jpg")}
                    />
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 truncate">{service.titre}</h3>

                  {/* Créateur + note */}
                  <div className="flex items-center mt-1">
                    <img
                      src={
                        service.createur?.photo
                          ? service.createur.photo
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              (service.createur?.name || "") + " " + (service.createur?.prenom || "")
                            ).slice(0, 50)}&background=16A14A&color=fff&size=24`
                      }
                      alt="Créateur"
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      {service.createur?.name} {service.createur?.prenom}
                    </span>

                    {notes[service._id] && (
                      <span className="ml-2 text-yellow-600 text-sm">
                        ⭐ {notes[service._id].note}
                      </span>
                    )}
                  </div>

                  {/* Catégories du service */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Array.isArray(service.categories)
                      ? service.categories.map((cat, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-gray-100 text-xs text-gray-600 rounded"
                          >
                            {cat}
                          </span>
                        ))
                      : service.categories && (
                          <span className="px-2 py-0.5 bg-gray-100 text-xs text-gray-600 rounded">
                            {service.categories}
                          </span>
                        )}
                  </div>

                  {/* Crédits + bouton */}
                  <div className="mt-3 flex justify-between items-center">
                    <span className="font-semibold text-green-600">{service.creditsProposes} crédits</span>
                    <button className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition">
                      Réserver
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default ServiceList;