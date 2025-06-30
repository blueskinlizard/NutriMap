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
    const [selectedFips, setSelectedFips] = useState('48');
    const [currentYear, setCurrentYear] = useState(2019);
    const [colorLoading, setColorLoading] = useState(true)
    const [tractColors, setTractColors] = useState({});
    const [selectedTract, setSelectedTract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filteredGeojsons, setFilteredGeojsons] = useState([]);
    const [sliderIndex, setSliderIndex] = useState([2010, 2015, 2019].indexOf(currentYear));

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
        loadGeoJson(selectedFips);
        fetchTractColor(selectedFips, currentYear);
    }, [currentYear]);

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
        setSelectedFips(state_abbrev_to_fips[e.target.stateSearchInput.value.toUpperCase()]);
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
    const handleSliderChange = (e) => {
        setSliderIndex(parseInt(e.target.value));
    };

    const handleSliderCommit = () => {
        const selectedYear = [2010, 2015, 2019][sliderIndex];
        setCurrentYear(selectedYear);
        setColorLoading(true);
    };

    
    
    return (
        <div>

            <div className="map-container" style={{ 
                height: '100vh', 
                width: '100vw', 
                position: 'relative',
                overflow: 'hidden'
            }}>
                
            <form id="stateForm" onSubmit={handleForm}>
                <input id="stateSearchInput" name="stateSearchInput" type="text" placeholder='2 state abbreviation, i.e "TX"'></input>
            </form>
            <div style={{ 
                margin: '10px', 
                padding: '10px', 
                zIndex: 1000, 
                width: '300px',
            }}>
            <label htmlFor="yearSlider"><h2>Projection year: {[2010, 2015, 2019][sliderIndex]}</h2> </label>
            <input
                id="yearSlider"
                type="range"
                min="0"
                max="2"
                value={sliderIndex}
                onChange={handleSliderChange}
                onMouseUp={handleSliderCommit}
                onTouchEnd={handleSliderCommit}
                style={{ width: '100%' }}
            />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>2010</span>
                    <span>2015</span>
                    <span>2019</span>
                </div>
            </div>
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
                    <GeoJSON 
                        key={`${idx}-${currentYear}-${Object.keys(tractColors).length}`} 
                        data={geojson} 
                        onEachFeature={onEachTract} 
                        style={getTractStyle} />
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
            <div className='TractElaboration'>
                <h2>What do clusters mean?</h2>
                <p>Complex clusters are rated on a scale from 0 to 6, where 0 indicates a high risk of being a food desert and 6 indicates low or no risk.</p>
                <p>Simple clusters are paraphrased variants of complex clusters.</p>
                <h2>What is this prediction?</h2>
                <p>While we do cluster our tracts into food desert labels, a prediction model was also built with NutriMap.</p>
                <p>This prediction model evaluated the deltas tracts had possessed across years, along with their current simple cluster to predict future socioeconomic activity. </p>
                <h3 id="footing">For more information, check out the "notebooks" section in the GitHub repository.</h3>
            </div>
        </div>
        
        );
    };


export default MapView;
