const MapData = {
    clusterColorMap : {
        '1': '#bd2f42',
        '2': '#c44927',
        '3': '#c49027',
        '4': '#c4c127',
        '5': '#8dc427',
        '6': '#73c916',
        '7': '#38ad15'
    },
    
    simpleColorMap : {
        '0': '#bd2f42',
        '1': '#d4d126',
        '2': '#24bd24'
    },
    cluster_map_2019: {
        4: 0,
        5: 1,
        6: 2,
        3: 3,
        0: 4,
        1: 5,
        2: 6
    },

    cluster_map_2015: {
        3: 0,
        5: 1,
        6: 2,
        4: 3,
        0: 4,
        1: 5,
        2: 6
    },

    cluster_map_2010: {
        3: 0,
        4: 1,
        2: 2,
        5: 3,
        1: 4,
        6: 5,
        0: 6
    },
    
    state_abbrev_to_fips : {
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
    },

    prediction_to_annotation :{
        '0': 'Moderate decline',
        '1': 'Little/no growth',
        '2': 'Moderate growth'
    },

    simple_to_annotation:{
        '0': 'High risk',
        '1': 'Moderate risk',
        '2': 'Low risk'
    },

    year_to_index:{
        '2010': 0,
        '2015': 1,
        '2019': 2
    }
}
export default MapData