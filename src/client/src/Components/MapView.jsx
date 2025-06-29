import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import TractInfo from './TractInfo';
import MapData from '../assets/MapData';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const geojsonFiles = import.meta.glob('../../../../data/geojsondata/GIS_GEOJSON_CENSUS_TRACTS/*.json', {query: '?json'});
// Don't criticize my import parths ok 
const classificationLabels2019 = import.meta.glob('../../../../data/processed/clustered_atlas_labels_2019.csv');
const classificationLabels2015 = import.meta.glob('../../../../data/processed/clustered_atlas_labels_2015.csv');
const classificationLabels2010 = import.meta.glob('../../../../data/processed/clustered_atlas_labels_2010.csv');

const simpleLabels2019 = import.meta.glob('../../../../data/processed/random_forest_labels_2019.csv');
const simpleLabels2015 = import.meta.glob('../../../../data/processed/random_forest_labels_2015.csv');
const simpleLabels2010 = import.meta.glob('../../../../data/processed/random_forest_labels_2010.csv');

const predictionLabels2025 = import.meta.glob('../../../../data/processed/predicted_2025_food_desert_values.csv');

const state_abbrev_to_fips = MapData.state_abbrev_to_fips;

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
    const [currentYear, setCurrentYear] = useState(2019);
    const [selectedTract, setSelectedTract] = useState(null);
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
    const tractStyle = {
        color: '#3388ff',
        weight: 1,
        fillOpacity: 0.5
    };

    const onEachTract = (feature, layer) => {
        layer.on({
            click: () => {
                const tractId = feature.properties.GEOID || 'Unknown';
                const name = feature.properties.NAME || '';
                alert(`Clicked on Tract ${tractId} ${name ? `(${name})` : ''}`);
                setSelectedTract(tractId);
                <TractInfo tractID={tractId}></TractInfo>
            },
            mouseover: () => {
            layer.setStyle({
                weight: 2,
                fillOpacity: 0.8
            });
            },
            mouseout: () => {
                layer.setStyle(tractStyle);
            }
        });
    };
    
    return (
        <div>
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
                    <GeoJSON key={idx} data={geojson} onEachFeature={onEachTract} style={tractStyle}/>
                ))}
                    
            </MapContainer>
            {loading && (
                <div className="loading-overlay">
                    <p>Loading map data...</p>
                </div>
            )}
            </div>
            <div className='TractInfo'>
                {selectedTract && <TractInfo tractID={selectedTract} />}
            </div>
        </div>
        
        );
    };


export default MapView;
