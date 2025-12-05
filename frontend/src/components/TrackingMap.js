import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import socketService from '../services/socket';
import 'leaflet/dist/leaflet.css';
import './TrackingMap.css';

// Fix pour les icônes Leaflet avec Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Icône personnalisée pour les coursiers
const courierIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#6366f1">
      <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 18c-3.87-.78-7-4.42-7-8.91V6.31l7-2.62 7 2.62v4.78c0 4.49-3.13 8.13-7 8.91z"/>
      <circle cx="12" cy="12" r="3" fill="#ec4899"/>
    </svg>
  `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// Composant pour recentrer la carte
const MapController = ({ center }) => {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);

    return null;
};

const TrackingMap = ({ couriers = [], center = [48.8566, 2.3522], zoom = 12 }) => {
    const [courierLocations, setCourierLocations] = useState(couriers);
    const [mapCenter, setMapCenter] = useState(center);

    useEffect(() => {
        // Demander toutes les positions au chargement
        socketService.requestAllLocations();

        // Écouter les mises à jour de position en temps réel
        const handleLocationUpdate = (data) => {
            setCourierLocations((prev) => {
                const index = prev.findIndex((c) => c._id === data.courierId);
                if (index !== -1) {
                    const updated = [...prev];
                    updated[index] = {
                        ...updated[index],
                        currentLocation: {
                            coordinates: [data.location.longitude, data.location.latitude]
                        },
                        lastLocationUpdate: data.timestamp
                    };
                    return updated;
                } else {
                    return [
                        ...prev,
                        {
                            _id: data.courierId,
                            name: data.courierName,
                            currentLocation: {
                                coordinates: [data.location.longitude, data.location.latitude]
                            },
                            lastLocationUpdate: data.timestamp
                        }
                    ];
                }
            });
        };

        const handleAllLocations = (data) => {
            setCourierLocations(data.couriers);
        };

        socketService.onLocationUpdate(handleLocationUpdate);
        socketService.onAllLocations(handleAllLocations);

        return () => {
            socketService.off('location:updated', handleLocationUpdate);
            socketService.off('location:all', handleAllLocations);
        };
    }, []);

    useEffect(() => {
        setCourierLocations(couriers);
    }, [couriers]);

    const getTimeSince = (timestamp) => {
        if (!timestamp) return 'Jamais';
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        if (seconds < 60) return `Il y a ${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `Il y a ${minutes}min`;
        const hours = Math.floor(minutes / 60);
        return `Il y a ${hours}h`;
    };

    return (
        <div className="tracking-map-container">
            <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ height: '100%', width: '100%', borderRadius: 'var(--border-radius-lg)' }}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapController center={mapCenter} />

                {courierLocations.map((courier) => {
                    if (!courier.currentLocation?.coordinates) return null;

                    const [lng, lat] = courier.currentLocation.coordinates;
                    if (!lat || !lng || lat === 0 || lng === 0) return null;

                    return (
                        <Marker
                            key={courier._id}
                            position={[lat, lng]}
                            icon={courierIcon}
                        >
                            <Popup>
                                <div className="courier-popup">
                                    <h4 className="courier-name">🚴 {courier.name}</h4>
                                    <div className="courier-info">
                                        <p>
                                            <strong>Email:</strong> {courier.email}
                                        </p>
                                        <p>
                                            <strong>Statut:</strong>{' '}
                                            <span className={`status-badge status-${courier.availability || 'offline'}`}>
                                                {courier.availability || 'offline'}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Dernière mise à jour:</strong>{' '}
                                            {getTimeSince(courier.lastLocationUpdate)}
                                        </p>
                                        <p className="coordinates">
                                            📍 {lat.toFixed(6)}, {lng.toFixed(6)}
                                        </p>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            <div className="map-legend">
                <h4>Légende</h4>
                <div className="legend-item">
                    <span className="legend-icon">📍</span>
                    <span>Coursier actif</span>
                </div>
                <div className="legend-item">
                    <span className="status-badge status-available">Available</span>
                    <span>Disponible</span>
                </div>
                <div className="legend-item">
                    <span className="status-badge status-busy">Busy</span>
                    <span>En livraison</span>
                </div>
            </div>
        </div>
    );
};

export default TrackingMap;
