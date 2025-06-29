import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const geojsonFiles = import.meta.glob('../assets/geojsondata/GIS_GEOJSON_CENSUS_TRACTS/*.json', {query: '?json'});

const state_abbrev_to_fips = {
  'AL': '01', 'AK': '02', 'AZ': '04', 'AR': '05', 'CA': '06',
  'CO': '08', 'CT': '09', 'DE': '10', 'DC': '11', 'FL': '12',
  'GA': '13', 'HI': '15', 'ID': '16', 'IL': '17', 'IN': '18',
  'IA': '19', 'KS': '20', 'KY': '21', 'LA': '22', 'ME': '23',
  'MD': '24', 'MA': '25', 'MI': '26', 'MN': '27', 'MS': '28',
  'MO': '29', 'MT': '30', 'NE': '31', 'NV': '32', 'NH': '33',
  'NJ': '34', 'NM': '35', 'NY': '36', 'NC': '37', 'ND': '38',
  'OH': '39', 'OK': '40', 'OR': '41', 'PA': '42', 'RI': '44',
  'SC': '45', 'SD': '46', 'TN': '47', 'TX': '48', 'UT': '49',
  'VT': '50', 'VA': '51', 'WA': '53', 'WV': '54', 'WI': '55',
  'WY': '56'
};

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});
const US_BOUNDS = [
  [24.396308, -125.0],     
  [49.384358, -66.93457]  
];

const MapView = () => {
    const [loading, setLoading] = useState(true);
    const [filteredGeojsons, setFilteredGeojsons] = useState([]);

    useEffect(() => {
        loadGeoJson('48');
    }, []);


    const loadGeoJson = async (fips) => {
        try {
            const allLoadedData = [];
            for (const path in geojsonFiles) {
                const filename = path.split('/').pop();
                    if (filename.startsWith(fips)) {
                        const module = await geojsonFiles[path]();
                        allLoadedData.push(module.default || module);
                        console.log("GeoJSON sample", JSON.stringify(module.default || module, null, 2));
                        console.log("Loaded data from fips: "+fips)
                    }
            }
            setFilteredGeojsons(allLoadedData);
        } catch (error) {
            console.error('Error loading GeoJSON file:', error);
        } finally {
            setLoading(false);
        }
    };
    const getCoordinates = (geometry) => {

        if (!geometry) return null;
    
        if (geometry.type === 'Point') {
            return [geometry.coordinates[1], geometry.coordinates[0]];
        }
        else if (geometry.type === 'Polygon') {
            const coords = geometry.coordinates[0];
            const centroid = coords.reduce((acc, coord) => {
            acc[0] += coord[1]; 
            acc[1] += coord[0]; 
            return acc;
            }, [0, 0]);
            return [centroid[0] / coords.length, centroid[1] / coords.length];
        }
        else if (geometry.type === 'MultiPolygon') {
            const coords = geometry.coordinates[0][0];
            const centroid = coords.reduce((acc, coord) => {
            acc[0] += coord[1];
            acc[1] += coord[0];
            return acc;
            }, [0, 0]);
            return [centroid[0] / coords.length, centroid[1] / coords.length];
        }
        return null;
    };
    if(loading){
        return <h1>Loading map data...</h1>
    }
    const handleForm = (e) =>{
        e.preventDefault();
        console.log("User inputted value: "+e.target.stateSearchInput.value)
        if (!state_abbrev_to_fips[e.target.stateSearchInput.value]) {
            alert("Invalid state abbreviation (use 2-letter code, e.g., TX)");
            return;
        }
        setLoading(true);
        setFilteredGeojsons([]);
        loadGeoJson(state_abbrev_to_fips[e.target.stateSearchInput.value]);
    }
    return (
        <div className="map-container" style={{ 
            height: '100vh', 
            width: '100vw', 
            position: 'relative',
            overflow: 'hidden'
        }}>
            
            <div className="map-overlay">NutriMap</div>
            <form id="stateForm" onSubmit={handleForm}>
                <input id="stateSearchInput" name="stateSearchInput" type="text"></input>
            </form>
            <MapContainer
                center={[37.8, -96]}
                zoom={4}
                minZoom={4}
                maxZoom={15}
                maxBounds={US_BOUNDS}
                maxBoundsViscosity={1.0}
                style={{ height: '100%', width: '100%' }}>
                <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
                />
                {filteredGeojsons.map((geojson, idx) => (
                    <GeoJSON key={idx} data={geojson} />
                ))}
                
            </MapContainer>
            
            {loading && (
            <div className="loading-overlay">
                <p>Loading map data...</p>
            </div>
            )}
        </div>
        );
    };


export default MapView;
