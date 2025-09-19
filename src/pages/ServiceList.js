import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [categorie, setCategorie] = useState("Tous");
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [notes, setNotes] = useState({});
  const [user, setUser] = useState(null); // Pour stocker les infos utilisateur

  const navigate = useNavigate();

  const categoriesDisponibles = [
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

  // Charger les services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const resServices = await axios.get(
          "https://backend-hqhy.onrender.com/api/services"
        );
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

        const servicesDisponibles = servicesWithRemaining.filter(
          (s) => s.placesRestantes > 0
        );
        setServices(servicesDisponibles);
        setFiltered(servicesDisponibles);

      const uniqueCats = [
  ...new Set(
    servicesDisponibles.flatMap((s) => s.categories || []) // ⚡ tableau
  ),
];
setCategories(uniqueCats);

        setCategories(uniqueCats);

        // ✅ Charger les notes pour chaque service
        servicesDisponibles.forEach((s) => loadNoteForService(s._id));
      } catch (error) {
        console.error("Erreur :", error);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
  console.log("Services chargés :", services);
}, [services]);
  // Charger la note d'un service
  const loadNoteForService = async (serviceId) => {
    try {
      const res = await axios.get(
        `https://backend-hqhy.onrender.com/api/avis/service/${serviceId}`
      );
      const avis = res.data;

      if (avis.length === 0) {
        setNotes((prev) => ({ ...prev, [serviceId]: null }));
        return;
      }

      // ✅ Filtrer les avis avec une note valide
      const avisAvecNote = avis.filter((a) => {
        const n = typeof a.note === "string" ? parseFloat(a.note) : a.note;
        return typeof n === "number" && !isNaN(n) && n >= 1 && n <= 5;
      });

      // ✅ Calculer la moyenne uniquement sur les avis notés
      if (avisAvecNote.length === 0) {
        setNotes((prev) => ({ ...prev, [serviceId]: null }));
        return;
      }

      const noteMoyenne =
        avisAvecNote
          .map((a) =>
            typeof a.note === "string" ? parseFloat(a.note) : a.note
          )
          .reduce((acc, n) => acc + n, 0) / avisAvecNote.length;

      setNotes((prev) => ({
        ...prev,
        [serviceId]: {
          note: noteMoyenne.toFixed(1),
          count: avis.length, // nombre total d'avis
        },
      }));
    } catch (err) {
      console.error("Erreur chargement note:", err);
      setNotes((prev) => ({ ...prev, [serviceId]: null }));
    }
  };
  // Filtrer les services
 
  // Filtrer les services
useEffect(() => {
  const lowerSearch = search.toLowerCase();

  const results = services.filter((s) => {
    const matchSearch = s.titre?.toLowerCase().includes(lowerSearch);

    // ✅ Normaliser `categories` en tableau
    const serviceCategories = Array.isArray(s.categories)
      ? s.categories
      : s.categories
      ? [s.categories]
      : [];

    const matchCategorie =
      categorie === "Tous" ||
      serviceCategories.some(
        (cat) =>
          cat &&
          cat.trim().toLowerCase() === categorie.trim().toLowerCase()
      );

    return matchSearch && matchCategorie;
  });

  console.log("Catégorie choisie :", categorie);
  console.log("Services filtrés :", results);
  console.log(
    "Catégories depuis la BDD :",
    services.map((s) => s.categories)
  );

  setFiltered(results);
}, [search, categorie, services]);




 




  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
  }, []);
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

          {/* Recherche et filtre */}
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="🔍 Rechercher un service ou une création..."
              className="flex-1 border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--green-main)]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={categorie}
              onChange={(e) => setCategorie(e.target.value)}
              className="border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--green-main)]"
              style={{
                backgroundColor: "white", // Vert principal
                color: "#16A14A", // Texte blanc
                border: "1px solid #ccc",
                borderRadius: "0.375rem",
                padding: "0.5rem 1rem",
              }}
            >
              <option value="Tous">Tous</option>
              {categoriesDisponibles.map((cat, i) => (
                <option
                  key={i}
                  value={cat.nom}
                  style={{ backgroundColor: " #16A14A ", color: "white" }}
                >
                  {" "}
                  {cat.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Liste des services */}
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
                    src={`https://backend-hqhy.onrender.com${
                      Array.isArray(service.images)
                        ? service.images[0]
                        : service.images
                    }`}
                    alt={service.titre}
                    className="rounded-t-xl h-40 w-full object-cover"
                  />
                )}

                <div className="p-4 flex flex-col flex-1">
                  {/* Créateur + Note */}
                  <div className="flex items-center mb-2">
                    {/* ✅ Photo du créateur (ou avatar local) */}
                    <img
                      src={`https://backend-hqhy.onrender.com${
                        service.createur?.photo || "/default-avatar.png"
                      }`}
                      alt=""
                      className="rounded-full w-9 h-9 mr-2"
                    />
                    <div>
                      <span className="font-medium text-sm">
                      {service.createur.name} {service.createur.prenom}

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
    </div>
  );
};

export default ServiceList;
