import { useEffect, useState } from "react";
import Papa from 'papaparse';
import MapData from "../assets/MapData";
const csvFiles = import.meta.glob('../../../../data/processed/*.csv', { as: 'raw' });
const map_values_2019  = MapData.cluster_map_2019;
const map_values_2015  = MapData.cluster_map_2015;
const map_values_2010  = MapData.cluster_map_2010;
const prediction_to_annotation = MapData.prediction_to_annotation;

export default function TractInfo({ tractID }) {
    const [loading, setLoading] = useState(true);
    const [listedData, setListedData] = useState([])

    const fetchTractData = async (tractID) => {
        const modules = await Promise.all(Object.values(csvFiles).map(importFn => importFn()));
        const allData = modules.map(rawCsv => {
            const results = Papa.parse(rawCsv, { header: true });
            return results.data.filter(row => 
                String(row.CensusTract).trim() === String(tractID).trim()
            );
        });
        const flattened = allData.flat();
        setListedData(flattened);
        setLoading(false);
        // const cluster2010 = allData.flat[0];
        // const cluster2015 = allData.flat[1];
        // const cluster2019 = allData.flat[2];
        // const predictedCluster = allData.flat[3];
        // const simplifiedCluster2010 = allData.flat[4];
        // const simplifiedCluster2015 = allData.flat[5];
        // const simplifiedCluster2019 = allData.flat[6];
        setLoading(false);
    };

    useEffect(() => {
        console.log("Spawned tractinfo for tractID: "+tractID)
        if (tractID) {
            setLoading(true);
            fetchTractData(tractID).finally(() => setLoading(false));
        }
    }, [tractID]);

    if(loading || !listedData.length === 0){
        return <h1>Loading tract data...</h1>
    }
    if(tractID == null){
        return <h1>No tract selected</h1>
    }
    return (
        <div className="TractInfo">
            <h1>Tract Info for: {tractID}</h1>
            <h2>Complex clusters</h2>
            <h3>2010 complex cluster: {map_values_2010[listedData[0]?.Cluster]}</h3>
            <h3>2015 complex cluster: {map_values_2015[listedData[1]?.Cluster]}</h3>
            <h3>2019 complex cluster: {map_values_2019[listedData[2]?.Cluster]}</h3>

            <h2>Simple clusters</h2>
            <h3>2025 predicted simple cluster: {prediction_to_annotation[listedData[3]?.Predicted_Cluster]}</h3>
            <h3>2010 simple cluster: {listedData[4]?.["2010_cluster"]}</h3>
            <h3>2015 simple cluster: {listedData[5]?.["2015_cluster"]}</h3>
            <h3>2019 simple cluster: {listedData[6]?.["2019_cluster"]}</h3>
        </div>
    );
}
