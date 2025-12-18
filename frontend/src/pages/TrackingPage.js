import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tasksAPI } from '../services/api';
import './TrackingPage.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Icônes personnalisées
const courierIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png', // Scooter icon
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

const destIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Pin icon
    iconSize: [35, 35],
    iconAnchor: [17, 35],
});

const TrackingPage = () => {
    const { taskId } = useParams();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTask = async () => {
            try {
                // Pour une vraie app, on utiliserait un endpoint public sécurisé par token
                // Ici on simule avec l'API standard (suppose que l'utilisateur est connecté ou que l'API est ouverte)
                // Évolution future : Créer endpoint /api/public/tracking/:token
                const response = await tasksAPI.getById(taskId);
                setTask(response.data.data);
            } catch (err) {
                console.error(err);
                setError("Impossible de charger les infos de livraison. Vérifiez le lien.");
            } finally {
                setLoading(false);
            }
        };

        if (taskId) fetchTask();

        // Polling pour mise à jour temps réel (toutes les 10s)
        const interval = setInterval(() => {
            if (taskId) fetchTask();
        }, 10000);

        return () => clearInterval(interval);
    }, [taskId]);

    if (loading) return <div className="tracking-loading"><div className="spinner"></div><p>Chargement de votre livraison...</p></div>;
    if (error) return <div className="tracking-error">😕 {error}</div>;
    if (!task) return <div className="tracking-error">Livraison introuvable.</div>;

    // Calcul de l'avancement
    const steps = [
        { status: 'CREATED', label: 'Commande reçue', icon: '📝' },
        { status: 'IN_PROGRESS', label: 'En route', icon: '🛵' },
        { status: 'COMPLETED', label: 'Livré', icon: '✅' }
    ];

    const currentStepIndex = steps.findIndex(s => s.status === task.status);
    const progress = Math.max(5, (currentStepIndex / (steps.length - 1)) * 100);

    // Coordonnées sécurisées
    const destCoords = task.deliveryAddress?.location?.coordinates ? [task.deliveryAddress.location.coordinates[1], task.deliveryAddress.location.coordinates[0]] : null;
    const courierCoords = task.assignedTo?.currentLocation?.coordinates ? [task.assignedTo.currentLocation.coordinates[1], task.assignedTo.currentLocation.coordinates[0]] : null;

    return (
        <div className="tracking-page">
            <header className="tracking-header">
                <h2>📦 Suivi de Colis</h2>
                <div className="tracking-id">#{task._id.slice(-6).toUpperCase()}</div>
            </header>

            <div className="tracking-map-wrapper">
                {destCoords ? (
                    <MapContainer
                        center={destCoords}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />

                        <Marker position={destCoords} icon={destIcon}>
                            <Popup>Votre adresse de livraison</Popup>
                        </Marker>

                        {courierCoords && task.status === 'IN_PROGRESS' && (
                            <Marker position={courierCoords} icon={courierIcon}>
                                <Popup>Votre livreur {task.assignedTo?.name}</Popup>
                            </Marker>
                        )}
                    </MapContainer>
                ) : (
                    <div className="no-map">Carte non disponible</div>
                )}
            </div>

            <div className="tracking-info-card">
                <div className="progress-track">
                    <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="steps-container">
                        {steps.map((step, idx) => (
                            <div key={idx} className={`step-item ${idx <= currentStepIndex ? 'active' : ''}`}>
                                <div className="step-icon">{step.icon}</div>
                                <div className="step-label">{step.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="delivery-details">
                    <div className="detail-row">
                        <span className="detail-label">Destinataire</span>
                        <span className="detail-value">{task.recipient?.name || 'Client'}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Livreur</span>
                        <span className="detail-value">{task.assignedTo ? task.assignedTo.name : 'En attente'}</span>
                    </div>
                    {task.status === 'IN_PROGRESS' && (
                        <div className="eta-badge">
                            🚀 Arrivée estimée : ~15 min
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrackingPage;
