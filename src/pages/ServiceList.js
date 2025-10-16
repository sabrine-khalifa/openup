import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [categorie, setCategorie] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriePerso, setCategoriePerso] = useState(""); // catégorie personnalisée

  const [filtered, setFiltered] = useState([]);
  const [notes, setNotes] = useState({});
  const [user, setUser] = useState(null); // Pour stocker les infos utilisateur

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
  { nom: "Voyage, tourisme & interculturalité", couleur: "#FFD54F" }
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
  const matchSearch = s.titre?.toLowerCase().includes(search.toLowerCase());

  const serviceCategories = Array.isArray(s.categories)
    ? s.categories
    : s.categories
    ? [s.categories]
    : [];

  const allSelectedCats = [...categorie];
  if (categoriePerso.trim()) allSelectedCats.push(categoriePerso.trim());

  const matchCategorie =
    allSelectedCats.length === 0 || // aucune sélection → tout correspond
    serviceCategories.some((cat) =>
      allSelectedCats.some(
        (sel) => sel.trim().toLowerCase() === cat.trim().toLowerCase()
      )
    );

  return matchSearch && matchCategorie;
});
 

  setFiltered(results);
  }, [search, categorie, categoriePerso, services]);


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
<div className="flex flex-col gap-4 mb-6">
  <div className="flex gap-4">
    <input
      type="text"
      placeholder="🔍 Rechercher un service ou une création..."
      className="flex-1 border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--green-main)]"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />

    {/* Sélection multiple */}
    <select
      multiple
      value={categorie} // maintenant c'est un tableau
      onChange={(e) =>
        setCategorie(Array.from(e.target.selectedOptions, (option) => option.value))
      }
      className="border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--green-main)]"
      style={{
        backgroundColor: "white",
        color: "#16A14A",
        border: "1px solid #ccc",
        borderRadius: "0.375rem",
        padding: "0.5rem 1rem",
      }}
    >
      <option value="" disabled>
                Catégories
              </option>
      {categoriesDisponibles.map((cat, i) => (
        <option
          key={i}
          value={cat.nom}
          style={{ backgroundColor: "#16A14A", color: "white" }}
        >
          {cat.nom}
        </option>
      ))}
      <option value="Autres" style={{ backgroundColor: "#16A14A", color: "white" }}>
        Autres
      </option>
    </select>
  </div>

  {/* Champ texte pour "Autres" */}
  {categorie.includes("Autres") && (
    <input
      type="text"
      placeholder="Entrez votre catégorie..."
      className="border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--green-main)]"
      value={categoriePerso || ""}
      onChange={(e) => setCategoriePerso(e.target.value)}
    />
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
