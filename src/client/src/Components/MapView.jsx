import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import Papa from 'papaparse';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import TractInfo from './TractInfo';
import MapData from '../assets/MapData';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';


const geojsonFiles = import.meta.glob('../../../../data/geojsondata/GIS_GEOJSON_CENSUS_TRACTS/*.json', {query: '?json'});
const colorSettingFiles = import.meta.glob('../../../../data/processed/color_settings/*.csv', { as: 'raw' });


// Don't criticize my import parths ok 

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
    const [colorLoading, setColorLoading] = useState(true)
    const [tractColors, setTractColors] = useState({});
    const [selectedTract, setSelectedTract] = useState(null);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filteredGeojsons, setFilteredGeojsons] = useState([]);

    const fetchTractColor = async(stateId, year) =>{
        try {
            const allColorData = [];
            for (const path in colorSettingFiles) {
                const filename = path.split('/').pop();
                if (filename.startsWith(year.toString())) {
                    const csvRaw = await colorSettingFiles[path]();
                    const parsed = Papa.parse(csvRaw, {
                        header: true,
                        skipEmptyLines: true,
                        dynamicTyping: false
                    });

                parsed.data.forEach(row => {
                    let CensusTract = row.CensusTract || row['CensusTract'];
                    const Color = row.Color || row['Color'];
                    if (typeof CensusTract === 'number') {
                        CensusTract = CensusTract.toString().padStart(11, '0');
                    } else if (typeof CensusTract === 'string') {
                        CensusTract = CensusTract.padStart(11, '0');
                    }
                    if (CensusTract.startsWith(stateId)) {
                        allColorData.push({
                            CensusTract,
                            Color
                        });
                    }
                });

                }
            }
            const tractColorMap = {};
            allColorData.forEach(({ CensusTract, Color }) => {
                const CensusTractString = String(CensusTract).padStart(11, '0');
                tractColorMap[CensusTractString] = Color;
            })
            setTractColors(tractColorMap);

        }catch (error) {
            console.error('Error loading color file:', error);
        }finally {
            setColorLoading(false);
        }
    }

    useEffect(() => {
        loadGeoJson('48');
        fetchTractColor('48', currentYear);
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
        }finally{
            setLoading(false)
        }
    };
    if(loading || colorLoading){
        return <h1>Loading map data...</h1>
    }
    const handleForm = (e) =>{
        e.preventDefault();
        console.log("User inputted value: "+e.target.stateSearchInput.value)
        if (!state_abbrev_to_fips[e.target.stateSearchInput.value.toUpperCase()]) {
            alert("Invalid state abbreviation (use 2-letter code, e.g., TX.)");
            return;
        }
        if(e.target.stateSearchInput.value == "AK"){
            alert("Alaska's tracts do not work with this model.");
            return;
        }
        setLoading(true);
        setFilteredGeojsons([]);
        loadGeoJson(state_abbrev_to_fips[e.target.stateSearchInput.value.toUpperCase()]);
        setTractColors([]);
        fetchTractColor(state_abbrev_to_fips[e.target.stateSearchInput.value.toUpperCase()].toString(), currentYear)
    }
    const getTractStyle = (feature) => {
        const tractId = String(feature.properties.GEOID).padStart(11, '0');
        const fillColor = tractColors[tractId] || '#cccccc'; //Fallback color
        return {
            color: '#333',
            weight: 1,
            fillOpacity: 0.6,
            fillColor
        };
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
            mouseout: (e) => {
                const layer = e.target;
                const feature = layer.feature;
                layer.setStyle(getTractStyle(feature));
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
                    <GeoJSON key={idx} data={geojson} onEachFeature={onEachTract} style={getTractStyle}/>
                ))}
                    
            </MapContainer>
            {(loading || colorLoading) && (
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
