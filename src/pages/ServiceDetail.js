import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Header from "../components/Header";
import {
  FaClock,
  FaMapMarkerAlt,
  FaUser,
  FaWheelchair,
  FaBullseye,
  FaCheckCircle,
  FaClipboardList,
  FaCalendarAlt,
} from "react-icons/fa";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [avis, setAvis] = useState([]); 
  const [message, setMessage] = useState("");
  const [showMsg, setShowMsg] = useState(false);
  const [newAvis, setNewAvis] = useState("");
  const [loadingAvis, setLoadingAvis] = useState(false);
  const [note, setNote] = useState(null); // Ajoute cet état


 const renderStarRating = () => (
  <div 
    className="flex mb-3" 
    key={`star-rating-${note}`} // 🔁 Force le re-render quand note change
  >
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        role="button"
        tabIndex={0}
        onClick={() => {
          setNote(star);
          console.log("Note sélectionnée :", star); // ✅ Debug
        }}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setNote(star);
            console.log("Note via clavier :", star);
          }
        }}
        style={{
          cursor: "pointer",
          fontSize: "1.5rem",
          color: star <= (note || 0) ? "#FFD700" : "#ccc",
        }}
        aria-label={`Noter ${star} étoile${star > 1 ? 's' : ''}`}
      >
        ⭐
      </span>
    ))}
  </div>
);
useEffect(() => {
  console.log("Note actuelle :", note);
}, [note]);
  const categoriesDisponibles = [
    { nom: "Musique", couleur: "#FF5733" },
    { nom: "Peinture", couleur: "#33A1FF" },
    { nom: "Cuisine", couleur: "#28A745" },
    { nom: "Sport", couleur: "#FFC107" },
    { nom: "Photographie", couleur: "#9C27B0" },
  ];

  useEffect(() => {
    const fetchServiceAndAvis = async () => {
      try {
        // Charger le service
        const resService = await api.get(`/services/${id}`);
        setService(resService.data);

        // Charger les avis du service ✅
        const resAvis = await api.get(`/avis/service/${id}`);
        setAvis(resAvis.data || []);
      } catch (err) {
        console.error("Erreur lors du chargement :", err);
      }
    };
    fetchServiceAndAvis();
  }, [id]);

  if (!service) return <p className="text-center py-10">Chargement...</p>;

  // Poster un avis
 const handleSubmitAvis = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  try {
    setLoadingAvis(true);
    const res = await api.post(
      `/avis/service/${service._id}`,
      { 
        commentaire: newAvis,
        note: note // ✅ Envoie la note ou `null`
      },
      { 
        headers: { Authorization: `Bearer ${token}` } 
      }
    );
    console.log("Réponse API après POST :", res.data); // 🔥 Regarde ici !

    setAvis((prev) => [res.data.avis || res.data, ...prev]);
    setNewAvis("");
    setNote(null); // réinitialise
    setMessage("Avis ajouté avec succès !");
    setShowMsg(true);
    setTimeout(() => setShowMsg(false), 3000);
  } catch (err) {
    setMessage(err.response?.data?.msg || "Erreur lors de l'ajout de l'avis");
    setShowMsg(true);
    setTimeout(() => setShowMsg(false), 3000);
  } finally {
    setLoadingAvis(false);
  }
};

  // Réserver un service
  const handleReservation = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("⚠️ Vous devez être connecté pour réserver.");
        setShowMsg(true);
        return;
      }

      const res = await api.post(
        `/services/${service._id}/reserver`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Réservation confirmée !");
      setShowMsg(true);
      setTimeout(() => setShowMsg(false), 3000);
      setService(res.data.service);
    } catch (err) {
      setMessage(err.response?.data?.msg || "Erreur lors de la réservation");
      setShowMsg(true);
      setTimeout(() => setShowMsg(false), 3000);
    }
  };

  // Calcul de la note moyenne du service
// ✅ Filtrer les avis qui ont une note
const avisAvecNote = avis.filter(a => a.note !== null && a.note !== undefined);

const noteMoyenne = avisAvecNote.length > 0
  ? avisAvecNote
      .map(a => {
        const n = typeof a.note === 'string' ? parseFloat(a.note) : a.note;
        return typeof n === 'number' && !isNaN(n) ? n : 0;
      })
      .reduce((acc, n) => acc + n, 0) / avisAvecNote.length
  : null;

const noteAffichee = noteMoyenne ? noteMoyenne.toFixed(1) : "Non noté";

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      {showMsg && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: message.includes("succès") || message.includes("confirmée") ? "green" : "red",
            color: "white",
            padding: "1rem 2rem",
            borderRadius: "8px",
            zIndex: 1000,
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          {message}
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="text-green-600 mb-4 hover:underline"
        >
          ← Retour
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche */}
          <div className="lg:col-span-2">
            {/* Images */}
            {service.images?.length > 0 && (
              <img
                src={`https://backend-hqhy.onrender.com${service.images[0]}`}
                alt={service.titre}
                className="w-full h-80 object-cover rounded-lg mb-4"
              />
            )}
            {service.images?.length > 1 && (
              <div className="flex gap-2 mb-4">
                {service.images.slice(1).map((img, idx) => (
                  <img
                    key={idx}
                    src={`https://backend-hqhy.onrender.com${img}`}
                    alt="miniature"
                    className="w-20 h-20 object-cover rounded border"
                  />
                ))}
              </div>
            )}

            {/* Titre et catégorie */}
            <h1 className="text-2xl font-bold mb-2">{service.titre}</h1>
            <div className="flex gap-2 mb-4">
              {service.categorie && (
                <span
                  className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                  style={{
                    backgroundColor:
                      categoriesDisponibles.find((c) => c.nom === service.categorie)?.couleur || "#000",
                  }}
                >
                  {service.categorie}
                </span>
              )}
            </div>

            {/* Créateur */}
            {service.createur && (
              <div className="flex items-center gap-2 mb-4">
                <img
                  onClick={() => navigate(`/UserProfile/${service.createur._id}`)}
                  src={`https://backend-hqhy.onrender.com${service.createur.photo || "/default-avatar.png"}`}
                  alt={service.createur.name && service.createur.prenom}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium">
                    <h3>
                      {service.createur.name} {service.createur.prenom}
                    </h3>
                  </div>
                 {avis.length > 0 ? (
        noteMoyenne ? (
          <p className="text-yellow-500 text-sm flex items-center gap-1">
            <span>⭐</span>
            <span>{noteAffichee}</span>
            <span className="text-gray-500 font-normal">({avis.length} avis)</span>
          </p>
        ) : (
          <p className="text-gray-500 text-sm">
            <span>⭐</span>
            <span className="ml-1">Non noté</span>
            <span className="text-gray-400"> ({avis.length} avis)</span>
          </p>
        )
      ) : (
        <p className="text-gray-400 text-sm"></p>
      )}
    </div>
  </div>
)}

            {/* Description et détails */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-gray-700 mb-4">{service.description}</p>

              {service.programme && (
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {service.programme.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}

              <br />
              <h2 className="text-lg font-semibold mb-4">Détails du service</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-green-600" />
                  <span>
                    <strong>Lieu :</strong> {service.lieu || "Non renseigné"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-green-600" />
                  <span>
                    <strong>Durée :</strong> {service.duree || "Non renseignée"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUser className="text-green-600" />
                  <span>
                    <strong>Type :</strong> {service.typePrestation || "Non renseigné"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaWheelchair className="text-green-600" />
                  <span>
                    <strong>Accessibilité PMR :</strong> {service.accessibilite || "Non"}
                  </span>
                </div>
              </div>

              <hr className="my-4" />
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <FaBullseye className="text-green-600 mt-1" />
                  <p>
                    <strong>Public cible :</strong> {service.publicCible || "Tous publics"}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-600 mt-1" />
                  <p>
                    <strong>Prérequis :</strong> {service.prerequis || "Aucun prérequis"}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <FaClipboardList className="text-green-600 mt-1" />
                  <p>
                    <strong>Matériel nécessaire :</strong> {service.materiel || "Aucun matériel requis"}
                  </p>
                </div>
              </div>
            </div>

            {/* Formulaire pour poster un avis */}
           {/* Formulaire pour poster un avis */}
<div className="bg-white p-6 rounded-lg shadow mb-6">
  <h2 className="text-lg font-semibold mb-3">Poster un avis</h2>
  <form onSubmit={handleSubmitAvis}>
    
    {/* Sélection de note (optionnelle) */}
    <label className="block mb-1 text-sm text-gray-600">
      Note (optionnelle)
    </label>
          {renderStarRating()}

    <textarea
      value={newAvis}
      onChange={(e) => setNewAvis(e.target.value)}
      placeholder="Écrivez votre avis ici..."
      className="w-full border rounded p-2 mb-3"
      rows={3}
      required
    />

    <button
      type="submit"
      disabled={loadingAvis}
      className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
    >
      {loadingAvis ? "Envoi..." : "Poster l'avis"}
    </button>
  </form>
</div>

            {/* Liste des avis */}
            
          </div>

          {/* Colonne droite : réservation */}
          <div className="bg-white p-6 rounded-lg shadow h-fit">
            <p className="text-green-600 font-bold text-lg mb-2">
              {service.creditsProposes} crédits
            </p>
            <button
              onClick={handleReservation}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded mb-6"
            >
              Réserver ce service
            </button>

            <h3 className="flex items-center font-semibold mb-3">
              <FaCalendarAlt className="text-green-500 mr-2" />
              Créneaux disponibles
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center border p-2 rounded">
                <div className="flex flex-col">
                  <span className="text-black">
                    {new Date(service.dateService).toLocaleDateString("fr-FR")}
                  </span>
                  <span className="text-gray-500">{service.heure}</span>
                </div>
                <button className="text-green-600 hover:underline">Choisir</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
