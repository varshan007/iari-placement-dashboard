const fs = require('fs');

const quickStats = {
  "John Deere": {
    indiaOffices: ["Pune"],
    freshersHiring: "High",
    sectorGrowth: "Very Strong",
    outreachScore: 9.8
  },
  "AGCO Corporation": {
    indiaOffices: ["Pune", "Hyderabad"],
    freshersHiring: "High",
    sectorGrowth: "Strong",
    outreachScore: 9.4
  },
  "CNH Industrial": {
    indiaOffices: ["Noida", "Gurugram"],
    freshersHiring: "Medium",
    sectorGrowth: "Strong",
    outreachScore: 8.9
  },
  "Kubota Corporation": {
    indiaOffices: ["Ahmedabad"],
    freshersHiring: "Medium",
    sectorGrowth: "Strong",
    outreachScore: 8.6
  },
  "Mahindra & Mahindra Farm Equip.": {
    indiaOffices: ["Mumbai", "Nagpur", "Chennai"],
    freshersHiring: "High",
    sectorGrowth: "Stable",
    outreachScore: 9.1
  },
  "TAFE (Tractors & Farm Equip.)": {
    indiaOffices: ["Chennai"],
    freshersHiring: "High",
    sectorGrowth: "Stable",
    outreachScore: 8.4
  },
  "Escorts Kubota": {
    indiaOffices: ["Faridabad"],
    freshersHiring: "Medium",
    sectorGrowth: "Strong",
    outreachScore: 8.2
  },
  "Claas": {
    indiaOffices: ["Mumbai"],
    freshersHiring: "Low",
    sectorGrowth: "Moderate",
    outreachScore: 7.8
  },
  "Sonalika International": {
    indiaOffices: ["Hoshiarpur"],
    freshersHiring: "High",
    sectorGrowth: "Strong",
    outreachScore: 8.0
  },
  "Same Deutz-Fahr (SDF)": {
    indiaOffices: ["Ranipet"],
    freshersHiring: "Medium",
    sectorGrowth: "Moderate",
    outreachScore: 7.9
  },
  "Lemken": {
    indiaOffices: ["Nagpur"],
    freshersHiring: "Medium",
    sectorGrowth: "Strong",
    outreachScore: 8.3
  },
  "Kverneland (Kubota group)": {
    indiaOffices: ["Bangalore"],
    freshersHiring: "Low",
    sectorGrowth: "Moderate",
    outreachScore: 7.5
  },

  "Bayer Crop Science / Climate Corp.": {
    indiaOffices: ["Hyderabad"],
    freshersHiring: "High",
    sectorGrowth: "Very Strong",
    outreachScore: 9.7
  },
  "Trimble Agriculture": {
    indiaOffices: ["Hyderabad", "Chennai"],
    freshersHiring: "High",
    sectorGrowth: "Very Strong",
    outreachScore: 9.5
  },
  "Corteva Agriscience": {
    indiaOffices: ["Hyderabad"],
    freshersHiring: "Medium",
    sectorGrowth: "Strong",
    outreachScore: 8.8
  },
  "Microsoft Azure (FarmBeats)": {
    indiaOffices: ["Hyderabad", "Bangalore"],
    freshersHiring: "Selective",
    sectorGrowth: "Explosive",
    outreachScore: 9.9
  },
  "IBM Research (Agri AI)": {
    indiaOffices: ["Bangalore"],
    freshersHiring: "Selective",
    sectorGrowth: "Very Strong",
    outreachScore: 9.3
  },
  "SatSure Analytics": {
    indiaOffices: ["Bangalore"],
    freshersHiring: "High",
    sectorGrowth: "Explosive",
    outreachScore: 9.2
  },
  "CropIn Technology": {
    indiaOffices: ["Bangalore"],
    freshersHiring: "High",
    sectorGrowth: "Explosive",
    outreachScore: 9.4
  },
  "Pixxel": {
    indiaOffices: ["Bangalore"],
    freshersHiring: "Selective",
    sectorGrowth: "Explosive",
    outreachScore: 9.8
  },
  "Fasal": {
    indiaOffices: ["Bangalore"],
    freshersHiring: "Medium",
    sectorGrowth: "Strong",
    outreachScore: 8.7
  },
  "Intello Labs": {
    indiaOffices: ["Gurugram"],
    freshersHiring: "High",
    sectorGrowth: "Strong",
    outreachScore: 8.9
  },

  "ideaForge Technology": {
    indiaOffices: ["Mumbai", "Bangalore"],
    freshersHiring: "High",
    sectorGrowth: "Explosive",
    outreachScore: 9.5
  },
  "Garuda Aerospace": {
    indiaOffices: ["Chennai"],
    freshersHiring: "High",
    sectorGrowth: "Explosive",
    outreachScore: 9.0
  },
  "DJI Agriculture": {
    indiaOffices: ["Bangalore", "Delhi"],
    freshersHiring: "Medium",
    sectorGrowth: "Very Strong",
    outreachScore: 8.8
  },

  "Jain Irrigation Systems": {
    indiaOffices: ["Jalgaon", "Pune"],
    freshersHiring: "High",
    sectorGrowth: "Stable",
    outreachScore: 8.6
  },
  "Netafim": {
    indiaOffices: ["Mumbai", "Hyderabad"],
    freshersHiring: "Medium",
    sectorGrowth: "Strong",
    outreachScore: 8.7
  },
  "Xylem Inc.": {
    indiaOffices: ["Pune"],
    freshersHiring: "Medium",
    sectorGrowth: "Strong",
    outreachScore: 8.5
  },
  "Grundfos": {
    indiaOffices: ["Chennai", "Delhi"],
    freshersHiring: "Medium",
    sectorGrowth: "Strong",
    outreachScore: 8.4
  },

  "Bühler Group": {
    indiaOffices: ["Bangalore"],
    freshersHiring: "Medium",
    sectorGrowth: "Strong",
    outreachScore: 9.0
  },
  "TOMRA": {
    indiaOffices: ["Bangalore"],
    freshersHiring: "Selective",
    sectorGrowth: "Very Strong",
    outreachScore: 8.9
  },
  "Multivac": {
    indiaOffices: ["Mumbai"],
    freshersHiring: "Medium",
    sectorGrowth: "Moderate",
    outreachScore: 7.9
  },

  "Cargill India": {
    indiaOffices: ["Gurugram", "Bangalore", "Mumbai"],
    freshersHiring: "High",
    sectorGrowth: "Very Strong",
    outreachScore: 9.4
  },
  "Nestlé India": {
    indiaOffices: ["Gurugram", "Moga", "Chennai"],
    freshersHiring: "High",
    sectorGrowth: "Strong",
    outreachScore: 9.1
  },
  "Tetra Pak India": {
    indiaOffices: ["Gurugram", "Pune"],
    freshersHiring: "Medium",
    sectorGrowth: "Strong",
    outreachScore: 8.8
  },

  "Adani Green Energy": {
    indiaOffices: ["Ahmedabad"],
    freshersHiring: "Medium",
    sectorGrowth: "Explosive",
    outreachScore: 8.9
  },
  "ReNew Power": {
    indiaOffices: ["Gurugram"],
    freshersHiring: "High",
    sectorGrowth: "Explosive",
    outreachScore: 9.1
  },
  "Schneider Electric India": {
    indiaOffices: ["Bangalore", "Mumbai", "Gurugram"],
    freshersHiring: "High",
    sectorGrowth: "Very Strong",
    outreachScore: 9.2
  },
  "Siemens Energy India": {
    indiaOffices: ["Mumbai", "Bangalore"],
    freshersHiring: "Medium",
    sectorGrowth: "Very Strong",
    outreachScore: 9.0
  },
  "Bosch (Energy & Building Tech.)": {
    indiaOffices: ["Bangalore"],
    freshersHiring: "High",
    sectorGrowth: "Very Strong",
    outreachScore: 9.4
  },
  "GE Vernova": {
    indiaOffices: ["Bangalore", "Hyderabad"],
    freshersHiring: "Selective",
    sectorGrowth: "Explosive",
    outreachScore: 9.3
  }
};

let rawData = fs.readFileSync('js/data.js', 'utf8');

for (const [name, stats] of Object.entries(quickStats)) {
    const formattedStats = `
    indiaOffices: ${JSON.stringify(stats.indiaOffices)},
    freshersHiring: "${stats.freshersHiring}",
    sectorGrowth: "${stats.sectorGrowth}",
    outreachScore: ${stats.outreachScore},`;
    
    // Regex to match the company block
    const regex = new RegExp(`(name:\\s*"${name.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\$&')}",)`);
    rawData = rawData.replace(regex, `$1${formattedStats}`);
}

fs.writeFileSync('js/data.js', rawData);
console.log('Merged quick stats successfully.');
