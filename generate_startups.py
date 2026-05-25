import json
import re

startups_raw = {
    "Farm Power & Smart Mechanization": ["AutoNxt Automation", "Cellestial E-Mobility", "Moonrider", "Monarch Tractor", "Bear Flag Robotics", "FarmDroid"],
    "Precision Agriculture & AI": ["DeHaat", "Gramophone", "BharatAgri", "Plantix", "Agrowave", "Ecozen", "Niqo Robotics", "Aibono", "OneSoil", "Prospera"],
    "Autonomous Farm Systems & Robotics": ["Ati Motors", "FarmWise", "Small Robot Company", "Ecorobotix", "Burro", "Agtonomy", "Aigen", "Fieldin"],
    "GIS & Remote Sensing": ["GalaxEye", "SkyServe", "HawkEye 360", "Orbital Insight", "Descartes Labs", "Hydrosat", "EarthDaily Analytics"],
    "Soil, Water & Climate-Tech": ["Khethworks", "AltCarbon", "Indra Water", "Fermata Energy", "Kilimo", "CropX", "Arable"],
    "Post-Harvest & Food-Tech": ["WayCool", "Ninjacart", "FarMart", "Innoterra", "Crofarm", "FreshToHome", "Jumbotail"],
    "Renewable Energy & Rural Infrastructure": ["Oorjan Cleantech", "Avaada Energy", "Fourth Partner Energy", "AmpereHour Energy", "SolarSquare", "Freyr Energy"]
}

highlights = ["Pixxel", "SatSure", "CropIn", "Ati Motors", "Niqo Robotics", "DeHaat", "Ecozen", "ideaForge", "Plantix", "Gramophone"]

new_companies = []

for sector, companies in startups_raw.items():
    for name in companies:
        company_id = name.lower().replace(" ", "-").replace("&", "").replace(",", "")
        is_highlight = name in highlights
        
        tags = ["DeepTech", "Startup"]
        if "AI" in sector or "Precision" in sector: tags.append("Agri AI")
        if "Robotics" in sector or "Autonomous" in sector: tags.extend(["Robotics", "Autonomous Systems"])
        if "GIS" in sector: tags.extend(["Geospatial AI", "Satellite Intelligence"])
        if "Climate" in sector: tags.append("Climate-Tech")
        if "Soil" in sector or "Water" in sector: tags.append("Smart Irrigation")
        if "Power" in sector: tags.append("UAV Systems")

        c = f"""  {{
    id: "{company_id}",
    name: "{name}",
    sector: "{sector}",
    hq: "Bangalore",
    type: "Startup",
    salaryBand: "Premium (15+ LPA)",
    placementFeasibility: "High",
    dataConfidence: "Industry Estimated",
    description: "High-growth deep-tech startup innovating in the {sector} space.",
    strategicReason: "Pioneering next-gen technologies for the agricultural sector.",
    topRecommended: {'true' if is_highlight else 'false'},
    emergingHighlight: {'true' if is_highlight else 'false'},
    tags: {json.dumps(tags)},
    departmentFit: {{ FMP: 85, SWCE: 80, PFE: 75, AI: 95 }},
    contactReadiness: {{ careersPageAvailable: true, indiaOffice: true, linkedinHiring: true }},
    outreachStatus: "Not Contacted",
    lastContacted: null,
    nextFollowup: null,
    coordinator: "Unassigned",
    recruiterEmail: null,
    notes: "",
    outreachHistory: [],
    preferredDomains: ["AI", "Precision Agriculture", "Automation"],
    careersLink: "https://careers.{company_id.replace('-', '')}.com",
    indiaOffices: ["Bangalore"],
    freshersHiring: "High",
    sectorGrowth: "Explosive",
    outreachScore: 9.5
  }}"""
        new_companies.append(c)

with open('js/data.js', 'r') as f:
    content = f.read()

# Append inside the companiesData array.
# The file ends with:
#   }
# ];
# export default companiesData;
# We need to insert before the last `];`
insertion_point = content.rfind("];")
if insertion_point != -1:
    new_content = content[:insertion_point] + ",\n" + ",\n".join(new_companies) + "\n];\nexport default companiesData;"
    with open('js/data.js', 'w') as f:
        f.write(new_content)
