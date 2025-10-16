import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]); // ✅ tableau de catégories sélectionnées
  const [customCategory, setCustomCategory] = useState(""); // ✅ pour "Autres"
  const [filtered, setFiltered] = useState([]);
  const [notes, setNotes] = useState({});
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  const categoriesDisponibles = [
    { nom: "Animaux & monde vivant", couleur: "#8BC34A" },
    { nom: "Architecture & urbanisme", couleur: "#E3CD8B" },
    // ... (vos catégories existantes)
    { nom: "Voyage, tourisme & interculturalité", couleur: "#FFD54F" },
    { nom: "Autres", couleur: "#9E9E9E" }, // ✅ Ajout explicite de "Autres"
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

  // 🔍 Filtre dynamique
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const hasCustom = selectedCategories.includes("Autres") && customCategory.trim();

    const results = services.filter((s) => {
      const matchSearch = s.titre?.toLowerCase().includes(lowerSearch);

      // Normaliser les catégories du service
      const serviceCats = Array.isArray(s.categories) ? s.categories : s.categories ? [s.categories] : [];

      // Vérifier si AU MOINS UNE catégorie sélectionnée correspond
      const matchesSelected = selectedCategories.length === 0 || 
        selectedCategories.some((cat) => {
          if (cat === "Autres" && hasCustom) {
            // Comparer avec la catégorie personnalisée
            return serviceCats.some(sc => 
              sc && sc.toLowerCase() === customCategory.trim().toLowerCase()
            );
          }
          // Sinon, comparaison normale
          return serviceCats.some(sc => 
            sc && sc.toLowerCase() === cat.toLowerCase()
          );
        });

      return matchSearch && matchesSelected;
    });

    setFiltered(results);
  }, [search, selectedCategories, customCategory, services]);

  // Charger utilisateur
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
  }, []);

  // Gestion de la sélection/désélection
  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div>
      <div className="p-6 bg-[#f5f5f5] min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-black">
                Services et créations disponibles
              </h2>
              <p>Découvrez les talents de notre communauté de créateurs</p>
            </div>
            {user?.role === "createur" && (
              <button
                onClick={() => navigate("/create-service")}
                className="bg-[#16A14A] text-white px-4 py-2 rounded"
              >
                + Ajouter un créneau
              </button>
            )}
          </div>

          {/* Recherche et filtres */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="🔍 Rechercher un service ou une création..."
              className="w-full md:w-auto flex-1 border px-4 py-2 rounded mb-4 md:mb-0 md:mr-4 focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Filtres par catégories (boutons cliquables) */}
            <div className="flex flex-wrap gap-2 mt-4">
              {categoriesDisponibles.map((cat) => (
                <button
                  key={cat.nom}
                  type="button"
                  onClick={() => toggleCategory(cat.nom)}
                  className={`px-3 py-1.5 text-sm rounded-full transition ${
                    selectedCategories.includes(cat.nom)
                      ? "bg-[#16A14A] text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                  style={{
                    backgroundColor: selectedCategories.includes(cat.nom)
                      ? cat.couleur
                      : "white",
                    color: selectedCategories.includes(cat.nom) ? "white" : cat.couleur,
                  }}
                >
                  {cat.nom}
                </button>
              ))}
            </div>

            {/* Champ "Autres" si sélectionné */}
            {selectedCategories.includes("Autres") && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spécifiez votre catégorie :
                </label>
                <input
                  type="text"
                  placeholder="Ex: Photographie, Danse classique..."
                  className="border px-3 py-1.5 rounded w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Liste des services */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filtered.map((service) => (
              <div
                key={service._id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition flex flex-col cursor-pointer"
                onClick={() => navigate(`/service/${service._id}`)}
              >
                {service.images && (
                  <img
                    src={
                      Array.isArray(service.images) && service.images.length > 0
                        ? service.images[0]
                        : "/default-image.jpg"
                    }
                    alt={service.titre}
                    className="rounded-t-xl h-40 w-full object-cover"
                    onError={(e) => {
                      e.target.src = "/default-image.jpg";
                    }}
                  />
                )}

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center mb-2">
                    <img
                      src={
                        service.createur?.photo
                          ? service.createur.photo
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              service.createur?.name || "U"
                            )}&background=16A14A&color=fff&size=36`
                      }
                      alt=""
                      className="rounded-full w-9 h-9 mr-2"
                    />
                    <div>
                      <span className="font-medium text-sm">
                        {service.createur?.name} {service.createur?.prenom}
                      </span>
                      {notes[service._id] && (
                        <div className="flex items-center text-yellow-500 text-xs mt-1">
                          <span>⭐</span>
                          <span className="text-gray-600 ml-1">{notes[service._id].note}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-md font-semibold mb-1">{service.titre}</h3>

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
    </div>
  );
};

export default ServiceList;