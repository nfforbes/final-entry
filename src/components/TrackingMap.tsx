'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet + Next.js - executed only on client
let DefaultIcon: L.Icon | null = null;
let TechnicianIcon: L.Icon | null = null;

if (typeof window !== 'undefined') {
  DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  TechnicianIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  L.Marker.prototype.options.icon = DefaultIcon;
}

// Helper to auto-fit map bounds when markers change
function MapAutoBounds({ techLocation, jobLocation }: { techLocation: [number, number] | null, jobLocation: [number, number] }) {
  const map = useMap();
  React.useEffect(() => {
    if (techLocation) {
      const bounds = L.latLngBounds([techLocation, jobLocation]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView(jobLocation, 14);
    }
  }, [techLocation, jobLocation, map]);
  return null;
}

interface MapProps {
  jobLocation: { lat: number; lng: number };
  techLocation?: { lat: number; lng: number } | null;
  status: string;
}

export default function TrackingMap({ jobLocation, techLocation, status }: MapProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const destination: [number, number] = [jobLocation.lat, jobLocation.lng];
  const technician: [number, number] | null = techLocation ? [techLocation.lat, techLocation.lng] : null;

  if (!isMounted) return null;

  return (
    <MapContainer 
      center={destination} 
      zoom={13} 
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <Marker position={destination}>
        <Popup>Service Location</Popup>
      </Marker>

      {technician && (
        <Marker position={technician} icon={TechnicianIcon}>
          <Popup>Technician is here</Popup>
        </Marker>
      )}

      <MapAutoBounds techLocation={technician} jobLocation={destination} />
    </MapContainer>
  );
}
