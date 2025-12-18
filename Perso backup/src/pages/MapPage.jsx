import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Eye, EyeOff, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapPage = () => {
    const [ghostMode, setGhostMode] = useState(false);

    const students = [
        { id: 1, name: "Alice M.", role: "Data Science", position: [48.8566, 2.3522], city: "Paris" },
        { id: 2, name: "Bob D.", role: "Business", position: [51.5074, -0.1278], city: "London" },
        { id: 3, name: "Charlie T.", role: "Engineering", position: [40.7128, -74.0060], city: "New York" },
        { id: 4, name: "Diana P.", role: "Product", position: [52.5200, 13.4050], city: "Berlin" },
    ];

    return (
        <div className="h-[calc(100vh-4rem)] relative">
            {/* Map Controls */}
            <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-xl shadow-xl max-w-xs">
                <h2 className="font-bold text-lg mb-2">Networking Map</h2>
                <p className="text-sm text-gray-500 mb-4">Find fellow students near you for meetups or internships.</p>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                        {ghostMode ? <EyeOff size={20} className="text-gray-500" /> : <Eye size={20} className="text-eugenia-red" />}
                        <span className="font-medium text-sm">Ghost Mode</span>
                    </div>
                    <button
                        onClick={() => setGhostMode(!ghostMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${ghostMode ? 'bg-eugenia-red' : 'bg-gray-300'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ghostMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    {ghostMode ? "You are hidden from the map." : "Your approximate location is visible."}
                </p>
            </div>

            <MapContainer center={[48.8566, 2.3522]} zoom={4} scrollWheelZoom={true} className="h-full w-full z-0">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {students.map(student => (
                    <Marker key={student.id} position={student.position}>
                        <Popup>
                            <div className="p-2 text-center">
                                <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2 overflow-hidden">
                                    <img src={`https://ui-avatars.com/api/?name=${student.name}&background=random`} alt={student.name} />
                                </div>
                                <h3 className="font-bold text-eugenia-dark">{student.name}</h3>
                                <p className="text-xs text-eugenia-red font-medium">{student.role}</p>
                                <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                                    <MapPin size={10} /> {student.city}
                                </p>
                                <button className="mt-2 w-full py-1 bg-eugenia-dark text-white text-xs rounded hover:bg-eugenia-red transition-colors">
                                    Message
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapPage;
