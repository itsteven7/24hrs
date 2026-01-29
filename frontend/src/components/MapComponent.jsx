import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { decode } from '../utils/decode';

// Fix for default marker icons in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const HOSPITALS = [
    { id: 1, name: "City Hospital", position: [28.560000, 77.140000] },
    { id: 2, name: "General Hospital", position: [28.545000, 77.120000] },
    { id: 3, name: "Trauma Center", position: [28.570000, 77.150000] }
];

const API_KEY = import.meta.env.VITE_MAPPLS_API_KEY;

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const MapComponent = ({ ambulanceStart, onRouteCalculated, dronePosition }) => {
    const [route, setRoute] = useState(null);
    const [selectedHospital, setSelectedHospital] = useState(null);

    const handleHospitalClick = async (hospital) => {
        setSelectedHospital(hospital);

        // Mappls API expects Longitude,Latitude
        const start = `${ambulanceStart[1]},${ambulanceStart[0]}`;
        const end = `${hospital.position[1]},${hospital.position[0]}`;

        // Use the standard REST API endpoint structure via local proxy to avoid CORS
        // Proxy configured in vite.config.js: /api/mappls -> https://apis.mappls.com/advancedmaps/v1
        const url = `/api/mappls/${API_KEY}/route_adv/driving/${start};${end}?steps=true&geometries=polyline&overview=full`;

        try {
            const response = await axios.get(url);
            if (response.data.routes && response.data.routes.length > 0) {
                const encodedGeometry = response.data.routes[0].geometry;
                const decodedPoints = decode(encodedGeometry);
                setRoute(decodedPoints);
                if (onRouteCalculated) {
                    onRouteCalculated(decodedPoints);
                }
            } else {
                 console.warn("No routes found in response:", response.data);
                 alert("No route found.");
            }
        } catch (error) {
            console.error("Error fetching route:", error);
            if (error.response) {
                console.error("Response Data:", error.response.data);
                console.error("Response Status:", error.response.status);
                alert(`Failed to calculate route. Status: ${error.response.status}. See console for details.`);
            } else {
                alert(`Failed to calculate route: ${error.message}`);
            }
        }
    };

    return (
        <MapContainer center={ambulanceStart} zoom={14} style={{ height: "100%", width: "100%" }}>
            <ChangeView center={ambulanceStart} zoom={14} />
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Ambulance Marker */}
            <Marker position={ambulanceStart}>
                <Popup>Ambulance (Start)</Popup>
            </Marker>

            {/* Hospital Markers */}
            {HOSPITALS.map(hospital => (
                <Marker
                    key={hospital.id}
                    position={hospital.position}
                    eventHandlers={{
                        click: () => handleHospitalClick(hospital),
                    }}
                >
                    <Popup>
                        <b>{hospital.name}</b><br/>
                        Click to route here
                    </Popup>
                </Marker>
            ))}

            {/* Route Polyline */}
            {route && <Polyline positions={route} color="blue" />}

            {/* Drone Marker */}
            {dronePosition && (
                <Marker position={dronePosition} icon={new L.Icon({
                    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3069/3069172.png', // Placeholder drone icon
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                })}>
                    <Popup>Drone Active</Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default MapComponent;
