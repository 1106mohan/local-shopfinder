import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";

// Component to move map when lat/lng changes
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
}

function LocationMarker({ setLatitude, setLongitude, position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setLatitude(e.latlng.lat);
      setLongitude(e.latlng.lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function LocationPicker({ latitude, longitude, setLatitude, setLongitude }) {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude]);

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{ height: "400px", width: "100%", marginTop: "10px" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ChangeView center={position} />

      <LocationMarker
        setLatitude={setLatitude}
        setLongitude={setLongitude}
        position={position}
        setPosition={setPosition}
      />
    </MapContainer>
  );
}
