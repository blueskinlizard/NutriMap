import { useEffect, useState } from "react";
import Papa from 'papaparse';
import MapData from "../assets/MapData";
const csvFiles = import.meta.glob('../../../../data/processed/*.csv', { as: 'raw' });
const map_values_2019  = MapData.cluster_map_2019;
const map_values_2015  = MapData.cluster_map_2015;
const map_values_2010  = MapData.cluster_map_2010;
const prediction_to_annotation = MapData.prediction_to_annotation;

const simple_to_annotation = MapData.simple_to_annotation;
const cluster_color_map = MapData.clusterColorMap;
const year_to_index = MapData.year_to_index;

const simple_to_className = MapData.simple_to_className;

export default function TractInfo({ tractID }) {
    const [loading, setLoading] = useState(true);
    const [listedData, setListedData] = useState([])
    const [listedDataLabels, setListedDataLabels] = useState([]);
    useEffect(() => {
        console.log("Spawned tractinfo for tractID: "+tractID);
        if (tractID) {
            setLoading(true);
            (async () => {
                const flattened = await fetchTractData(tractID);
                setListedData(flattened);
            })();
        }
        return(() =>{
            setListedData([])
        })
    }, [tractID]);

    useEffect(() => {
        if (listedData.length < 7) {
            console.log("listedData not ready yet:", listedData);
            return;
        }

        const tempArray = [
            simple_to_className[listedData[4]?.["2010_cluster"]],
            simple_to_className[listedData[5]?.["2015_cluster"]],
            simple_to_className[listedData[6]?.["2019_cluster"]],
        ];
        setListedDataLabels(tempArray);
        setLoading(false);
    }, [listedData]);

    if(loading || listedData.length === 0){
        return <h1>Loading tract data...</h1>
    }
    if(tractID == null){
        return <h1>No tract selected</h1>
    }
    
    return (
        <div className="TractInfo">
            <h1>Selected Tract Information</h1>
            <h2 className='tract_light'>Tract ID: {tractID}</h2>
            <h2>Complex clusters</h2>
            <h3 className='tract_light'>2010 complex cluster: {map_values_2010[listedData[0]?.Cluster]}</h3>
            <h3 className='tract_light'>2015 complex cluster: {map_values_2015[listedData[1]?.Cluster]}</h3>
            <h3 className='tract_light'>2019 complex cluster: {map_values_2019[listedData[2]?.Cluster]}</h3>

            <h2>Simple clusters</h2>
            <h3>2025 predicted simple cluster: {prediction_to_annotation[listedData[3]?.Predicted_Cluster]}</h3>
            <h3 className='tract_light' >2010 simple cluster: <span className={`ColorStatistic${listedDataLabels[0]}`}>{simple_to_annotation[listedData[4]?.['2010_cluster']]}</span></h3>
            <h3 className='tract_light' >2015 simple cluster: <span className={`ColorStatistic${listedDataLabels[1]}`}>{simple_to_annotation[listedData[5]?.['2015_cluster']]}</span></h3>
            <h3 className='tract_light' >2019 simple cluster: <span className={`ColorStatistic${listedDataLabels[2]}`}>{simple_to_annotation[listedData[6]?.['2019_cluster']]}</span></h3>
        </div>
    );
}

const fetchTractData = async (tractID) => {
    const paddedTractID = String(tractID).padStart(11, '0'); // Ensure 11-digit match
    const modules = await Promise.all(Object.values(csvFiles).map(importFn => importFn()));
    const allData = modules.map(rawCsv => {
        const results = Papa.parse(rawCsv, { header: true, skipEmptyLines: true, dynamicTyping: false });
        return results.data.filter(row => {
            let rowTract = row.CensusTract || row['CensusTract'];
            if (typeof rowTract === 'number') {
                rowTract = rowTract.toString().padStart(11, '0');
            } else if (typeof rowTract === 'string') {
                rowTract = rowTract.padStart(11, '0');
            }
            return rowTract === paddedTractID;
        });
    });
    return allData.flat();
    // const cluster2010 = allData.flat[0];
    // const cluster2015 = allData.flat[1];
    // const cluster2019 = allData.flat[2];
    // const predictedCluster = allData.flat[3];
    // const simplifiedCluster2010 = allData.flat[4];
    // const simplifiedCluster2015 = allData.flat[5];
    // const simplifiedCluster2019 = allData.flat[6];
};

