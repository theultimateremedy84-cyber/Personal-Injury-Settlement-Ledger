import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "pi-ledger:v1";

type PersistedState = {
  medExpenses: number;
  lostIncome: number;
  propertyDamage: number;
  multiplier: number;
  step: number;
};

// 1. Programmatic Regional Dataset Configuration (Easily scaled to 200 cities)
const localCityData: Record<string, { cityName: string; stateName: string; lawNotice: string }> = {
  "los-angeles": {
    cityName: "Los Angeles",
    stateName: "California",
    lawNotice: "California operates under a pure comparative negligence doctrine and enforces a standard 2-year statute of limitations for personal injury claims."
  },
  "houston": {
    cityName: "Houston",
    stateName: "Texas",
    lawNotice: "Texas enforces a 51% modified comparative fault bar, meaning recovery is prohibited if your liability allocation exceeds 50%."
  },
  "miami": {
    cityName: "Miami",
    stateName: "Florida",
    lawNotice: "Florida utilize a modified comparative fault standard alongside a specialized vehicle No-Fault framework requiring active PIP coverage."
  },
  "chicago": {
    cityName: "Chicago",
    stateName: "Illinois",
    lawNotice: "Illinois applies a modified comparative negligence system (51% recovery bar) with a standard 2-year filing window for bodily injury."
  },
  "phoenix": {
    cityName: "Phoenix",
    stateName: "Arizona",
    lawNotice: "Arizona applies a pure comparative negligence system under A.R.S. § 12-2505 and maintains a strict 2-year statute of limitations for filing personal injury claims."
  },
  "philadelphia": {
    cityName: "Philadelphia",
    stateName: "Pennsylvania",
    lawNotice: "Pennsylvania uses a 51% modified comparative negligence rule. It also operates under a unique choice no-fault insurance framework affecting tort thresholds."
  },
  "san-antonio": {
    cityName: "San Antonio",
    stateName: "Texas",
    lawNotice: "Texas enforces a 51% modified comparative fault bar, meaning recovery is completely prohibited if your liability allocation exceeds 50%."
  },
  "san-diego": {
    cityName: "San Diego",
    stateName: "California",
    lawNotice: "California operates under a pure comparative negligence doctrine, allowing recovery even if you are partially at fault, with a standard 2-year filing window."
  },
  "dallas": {
    cityName: "Dallas",
    stateName: "Texas",
    lawNotice: "Texas enforces a 51% modified comparative fault bar, meaning recovery is completely prohibited if your liability allocation exceeds 50%."
  },
  "atlanta": {
    cityName: "Atlanta",
    stateName: "Georgia",
    lawNotice: "Georgia follows a 50% modified comparative negligence rule and mandates a 2-year statute of limitations for personal injury."
  },
  "charlotte": {
    cityName: "Charlotte",
    stateName: "North Carolina",
    lawNotice: "North Carolina is one of the few jurisdictions enforcing a strict contributory negligence bar, prohibiting recovery if you are even 1% at fault."
  },
  "raleigh": {
    cityName: "Raleigh",
    stateName: "North Carolina",
    lawNotice: "North Carolina enforces a strict contributory negligence doctrine with a 3-year statute of limitations for injury claims."
  },
  "richmond": {
    cityName: "Richmond",
    stateName: "Virginia",
    lawNotice: "Virginia operates under a contributory negligence system and enforces a 2-year statute of limitations for personal injury."
  },
  "nashville": {
    cityName: "Nashville",
    stateName: "Tennessee",
    lawNotice: "Tennessee uses a 50% modified comparative fault system and provides a 1-year window for filing personal injury claims."
  },
  "memphis": {
    cityName: "Memphis",
    stateName: "Tennessee",
    lawNotice: "Tennessee applies a 50% modified comparative fault rule; you cannot recover if your fault equals or exceeds 50%."
  },
  "indianapolis": {
    cityName: "Indianapolis",
    stateName: "Indiana",
    lawNotice: "Indiana utilizes a 51% modified comparative fault system and enforces a 2-year statute of limitations for injury claims."
  },
  "st-louis": {
    cityName: "St. Louis",
    stateName: "Missouri",
    lawNotice: "Missouri follows a pure comparative negligence standard and allows 5 years to file a personal injury claim."
  },
  "kansas-city": {
    cityName: "Kansas City",
    stateName: "Missouri",
    lawNotice: "Missouri operates under a pure comparative fault doctrine, allowing recovery regardless of your percentage of fault."
  },
  "baltimore": {
    cityName: "Baltimore",
    stateName: "Maryland",
    lawNotice: "Maryland is a contributory negligence jurisdiction, meaning any degree of fault on your part can bar recovery entirely."
  },
  "las-vegas": {
    cityName: "Las Vegas",
    stateName: "Nevada",
    lawNotice: "Nevada applies a 51% modified comparative negligence rule and enforces a 2-year statute of limitations."
  },
  "portland": {
    cityName: "Portland",
    stateName: "Oregon",
    lawNotice: "Oregon utilizes a 51% modified comparative negligence system with a 2-year statute of limitations."
  },
  "milwaukee": {
    cityName: "Milwaukee",
    stateName: "Wisconsin",
    lawNotice: "Wisconsin applies a 51% modified comparative negligence rule and has a 3-year filing limit."
  },
  "albuquerque": {
    cityName: "Albuquerque",
    stateName: "New Mexico",
    lawNotice: "New Mexico follows a pure comparative negligence doctrine and enforces a 3-year statute of limitations."
  },
  "tucson": {
    cityName: "Tucson",
    stateName: "Arizona",
    lawNotice: "Arizona uses a pure comparative negligence system under A.R.S. \u00a7 12-2505 with a 2-year filing window."
  },
  "sacramento": {
    cityName: "Sacramento",
    stateName: "California",
    lawNotice: "California operates under a pure comparative negligence doctrine with a 2-year statute of limitations."
  },
  "fresno": {
    cityName: "Fresno",
    stateName: "California",
    lawNotice: "California applies pure comparative negligence, allowing recovery even with high levels of personal fault."
  },
  "mesa": {
    cityName: "Mesa",
    stateName: "Arizona",
    lawNotice: "Arizona applies a pure comparative negligence framework with a 2-year statute of limitations for claims."
  },
  "omaha": {
    cityName: "Omaha",
    stateName: "Nebraska",
    lawNotice: "Nebraska applies a 50% modified comparative negligence rule and a 4-year statute of limitations."
  },
  "tulsa": {
    cityName: "Tulsa",
    stateName: "Oklahoma",
    lawNotice: "Oklahoma operates under a 51% modified comparative negligence system with a 2-year statute of limitations."
  },
  "detroit": {
    cityName: "Detroit",
    stateName: "Michigan",
    lawNotice: "Michigan operates under a modified comparative fault system and adheres to a 3-year statute of limitations for injury claims."
  },
  "louisville": {
    cityName: "Louisville",
    stateName: "Kentucky",
    lawNotice: "Kentucky applies a pure comparative negligence standard and a 1-year statute of limitations for personal injury."
  },
  "oklahoma-city": {
    cityName: "Oklahoma City",
    stateName: "Oklahoma",
    lawNotice: "Oklahoma enforces a 51% modified comparative negligence rule with a 2-year statute of limitations."
  },
  "el-paso": {
    cityName: "El Paso",
    stateName: "Texas",
    lawNotice: "Texas applies a 51% modified comparative fault bar, prohibiting recovery if you are over 50% at fault."
  },
  "denver": {
    cityName: "Denver",
    stateName: "Colorado",
    lawNotice: "Colorado follows a 50% modified comparative negligence rule with a 3-year statute of limitations."
  },
  "boston": {
    cityName: "Boston",
    stateName: "Massachusetts",
    lawNotice: "Massachusetts applies a 51% modified comparative negligence rule and a 3-year filing window."
  },
  "washington": {
    cityName: "Washington",
    stateName: "District of Columbia",
    lawNotice: "DC follows a strict contributory negligence doctrine, meaning any fault can bar recovery."
  },
  "san-jose": {
    cityName: "San Jose",
    stateName: "California",
    lawNotice: "California operates under a pure comparative negligence doctrine with a 2-year statute of limitations."
  },
  "san-francisco": {
    cityName: "San Francisco",
    stateName: "California",
    lawNotice: "California applies a pure comparative negligence system allowing recovery regardless of fault percentage."
  },
  "minneapolis": {
    cityName: "Minneapolis",
    stateName: "Minnesota",
    lawNotice: "Minnesota uses a 51% modified comparative fault system and a 6-year statute of limitations."
  },
  "new-orleans": {
    cityName: "New Orleans",
    stateName: "Louisiana",
    lawNotice: "Louisiana follows a pure comparative fault system with a 1-year prescriptive period."
  },
  "cincinnati": {
    cityName: "Cincinnati",
    stateName: "Ohio",
    lawNotice: "Ohio uses a 51% modified comparative negligence bar and a 2-year statute of limitations."
  },
  "pittsburgh": {
    cityName: "Pittsburgh",
    stateName: "Pennsylvania",
    lawNotice: "Pennsylvania applies a 51% modified comparative negligence rule with a 2-year statute of limitations."
  },
  "honolulu": {
    cityName: "Honolulu",
    stateName: "Hawaii",
    lawNotice: "Hawaii utilizes a 51% modified comparative negligence system with a 2-year statute of limitations."
  },
  "anchorage": {
    cityName: "Anchorage",
    stateName: "Alaska",
    lawNotice: "Alaska operates under a pure comparative negligence system with a 2-year statute of limitations."
  },
  "salt-lake-city": {
    cityName: "Salt Lake City",
    stateName: "Utah",
    lawNotice: "Utah follows a 51% modified comparative negligence rule and a 4-year statute of limitations."
  },
  "des-moines": {
    cityName: "Des Moines",
    stateName: "Iowa",
    lawNotice: "Iowa uses a 51% modified comparative negligence rule with a 2-year statute of limitations."
  },
  "boise": {
    cityName: "Boise",
    stateName: "Idaho",
    lawNotice: "Idaho applies a 51% modified comparative negligence rule and a 2-year statute of limitations."
  },
  "little-rock": {
    cityName: "Little Rock",
    stateName: "Arkansas",
    lawNotice: "Arkansas follows a 50% modified comparative fault rule with a 3-year statute of limitations."
  },
  "birmingham": {
    cityName: "Birmingham",
    stateName: "Alabama",
    lawNotice: "Alabama operates under a strict contributory negligence doctrine with a 2-year statute of limitations."
  },
  "jackson": {
    cityName: "Jackson",
    stateName: "Mississippi",
    lawNotice: "Mississippi follows a pure comparative negligence system and a 3-year statute of limitations."
  },
  "charleston": {
    cityName: "Charleston",
    stateName: "South Carolina",
    lawNotice: "South Carolina applies a 51% modified comparative negligence rule and a 3-year statute of limitations."
  },
  "savannah": {
    cityName: "Savannah",
    stateName: "Georgia",
    lawNotice: "Georgia follows a 50% modified comparative negligence rule and a 2-year statute of limitations."
  },
  "providence": {
    cityName: "Providence",
    stateName: "Rhode Island",
    lawNotice: "Rhode Island applies a pure comparative negligence system with a 3-year statute of limitations."
  },
  "hartford": {
    cityName: "Hartford",
    stateName: "Connecticut",
    lawNotice: "Connecticut follows a 51% modified comparative negligence rule with a 2-year statute of limitations."
  },
  "wilmington": {
    cityName: "Wilmington",
    stateName: "Delaware",
    lawNotice: "Delaware applies a 51% modified comparative negligence rule and a 2-year statute of limitations."
  },
  "burlington": {
    cityName: "Burlington",
    stateName: "Vermont",
    lawNotice: "Vermont uses a 51% modified comparative negligence rule and a 3-year statute of limitations."
  },
  "billings": {
    cityName: "Billings",
    stateName: "Montana",
    lawNotice: "Montana follows a 51% modified comparative negligence rule and a 3-year statute of limitations."
  },
  "fargo": {
    cityName: "Fargo",
    stateName: "North Dakota",
    lawNotice: "North Dakota applies a 51% modified comparative negligence rule and a 6-year statute of limitations."
  },
  "sioux-falls": {
    cityName: "Sioux Falls",
    stateName: "South Dakota",
    lawNotice: "South Dakota uses a 51% modified comparative negligence rule and a 3-year statute of limitations."
  },
  "cheyenne": {
    cityName: "Cheyenne",
    stateName: "Wyoming",
    lawNotice: "Wyoming follows a 51% modified comparative negligence rule and a 4-year statute of limitations."
  },
  "reno": {
    cityName: "Reno",
    stateName: "Nevada",
    lawNotice: "Nevada applies a 51% modified comparative negligence rule and a 2-year statute of limitations."
  },
  "spokane": {
    cityName: "Spokane",
    stateName: "Washington",
    lawNotice: "Washington state utilizes a pure comparative fault system with a 3-year statute of limitations."
  },
  "eugene": {
    cityName: "Eugene",
    stateName: "Oregon",
    lawNotice: "Oregon applies a 51% modified comparative negligence rule and a 2-year statute of limitations."
  },
  "wichita": {
    cityName: "Wichita",
    stateName: "Kansas",
    lawNotice: "Kansas follows a 51% modified comparative negligence rule and a 2-year statute of limitations."
  },
  "topeka": {
    cityName: "Topeka",
    stateName: "Kansas",
    lawNotice: "Kansas enforces a 51% modified comparative negligence rule with a 2-year statute of limitations."
  },
  "springfield": {
    cityName: "Springfield",
    stateName: "Missouri",
    lawNotice: "Missouri operates under a pure comparative negligence doctrine and a 5-year statute of limitations."
  },
  "lexington": {
    cityName: "Lexington",
    stateName: "Kentucky",
    lawNotice: "Kentucky applies a pure comparative negligence standard and a 1-year statute of limitations."
  },
  "aurora": {
    cityName: "Aurora",
    stateName: "Colorado",
    lawNotice: "Colorado follows a 50% modified comparative negligence rule and a 3-year statute of limitations."
  },
  "anaheim": {
    cityName: "Anaheim",
    stateName: "California",
    lawNotice: "California operates under a pure comparative negligence doctrine and enforces a 2-year statute of limitations."
  },
  "santa-ana": {
    cityName: "Santa Ana",
    stateName: "California",
    lawNotice: "California uses pure comparative negligence allowing recovery regardless of fault percentage."
  },
  "riverside": {
    cityName: "Riverside",
    stateName: "California",
    lawNotice: "California mandates a 2-year statute of limitations under a pure comparative negligence framework."
  },
  "stockton": {
    cityName: "Stockton",
    stateName: "California",
    lawNotice: "California applies pure comparative negligence with a 2-year filing window for injury claims."
  },
  "chula-vista": {
    cityName: "Chula Vista",
    stateName: "California",
    lawNotice: "California operates under a pure comparative negligence doctrine with a 2-year statute of limitations."
  },
  "irvine": {
    cityName: "Irvine",
    stateName: "California",
    lawNotice: "California applies pure comparative negligence and a 2-year filing limit for personal injury."
  },
  "fremont": {
    cityName: "Fremont",
    stateName: "California",
    lawNotice: "California follows pure comparative negligence principles with a 2-year statute of limitations."
  },
  "san-bernardino": {
    cityName: "San Bernardino",
    stateName: "California",
    lawNotice: "California uses pure comparative negligence; recovery is possible regardless of the level of fault."
  },
  "modesto": {
    cityName: "Modesto",
    stateName: "California",
    lawNotice: "California adheres to a 2-year statute of limitations under a pure comparative negligence system."
  },
  "oxnard": {
    cityName: "Oxnard",
    stateName: "California",
    lawNotice: "California applies pure comparative negligence and enforces a 2-year filing period."
  },
  "fontana": {
    cityName: "Fontana",
    stateName: "California",
    lawNotice: "California operates under pure comparative negligence with a 2-year statute of limitations."
  },
  "moreno-valley": {
    cityName: "Moreno Valley",
    stateName: "California",
    lawNotice: "California uses pure comparative negligence allowing partial recovery regardless of fault percentage."
  },
  "glendale": {
    cityName: "Glendale",
    stateName: "California",
    lawNotice: "California follows pure comparative negligence doctrine and a 2-year statute of limitations."
  },
  "huntington-beach": {
    cityName: "Huntington Beach",
    stateName: "California",
    lawNotice: "California applies pure comparative negligence with a 2-year filing window."
  },
  "santa-clarita": {
    cityName: "Santa Clarita",
    stateName: "California",
    lawNotice: "California adheres to pure comparative negligence principles with a 2-year statute of limitations."
  },
  "garden-grove": {
    cityName: "Garden Grove",
    stateName: "California",
    lawNotice: "California operates under pure comparative negligence and a 2-year filing limit."
  },
  "santa-rosa": {
    cityName: "Santa Rosa",
    stateName: "California",
    lawNotice: "California follows pure comparative negligence rules and a 2-year statute of limitations."
  },
  "oceanside": {
    cityName: "Oceanside",
    stateName: "California",
    lawNotice: "California uses pure comparative negligence with a 2-year window for personal injury claims."
  },
  "rancho-cucamonga": {
    cityName: "Rancho Cucamonga",
    stateName: "California",
    lawNotice: "California applies pure comparative negligence and a 2-year statute of limitations."
  },
  "ontario": {
    cityName: "Ontario",
    stateName: "California",
    lawNotice: "California operates under pure comparative negligence with a 2-year filing period."
  },
  "elk-grove": {
    cityName: "Elk Grove",
    stateName: "California",
    lawNotice: "California follows pure comparative negligence and enforces a 2-year statute of limitations."
  },
  "corona": {
    cityName: "Corona",
    stateName: "California",
    lawNotice: "California uses pure comparative negligence; you may recover damages regardless of your fault percentage."
  },
  "lancaster": {
    cityName: "Lancaster",
    stateName: "California",
    lawNotice: "California adheres to pure comparative negligence rules and a 2-year statute of limitations."
  },
  "palmdale": {
    cityName: "Palmdale",
    stateName: "California",
    lawNotice: "California operates under pure comparative negligence with a 2-year filing window."
  },
  "salinas": {
    cityName: "Salinas",
    stateName: "California",
    lawNotice: "California applies pure comparative negligence and a 2-year statute of limitations."
  },
  "hayward": {
    cityName: "Hayward",
    stateName: "California",
    lawNotice: "California follows pure comparative negligence and a 2-year filing limit."
  },
  "pomona": {
    cityName: "Pomona",
    stateName: "California",
    lawNotice: "California uses pure comparative negligence and a 2-year statute of limitations."
  },
  "escondido": {
    cityName: "Escondido",
    stateName: "California",
    lawNotice: "California operates under pure comparative negligence with a 2-year filing window."
  },
  "sunnyvale": {
    cityName: "Sunnyvale",
    stateName: "California",
    lawNotice: "California applies pure comparative negligence and a 2-year statute of limitations."
  },
  "torrance": {
    cityName: "Torrance",
    stateName: "California",
    lawNotice: "California follows pure comparative negligence with a 2-year filing period."
  },
  "pasadena": {
    cityName: "Pasadena",
    stateName: "California",
    lawNotice: "California uses pure comparative negligence and a 2-year statute of limitations."
  },
  "orange": {
    cityName: "Orange",
    stateName: "California",
    lawNotice: "California operates under pure comparative negligence and a 2-year filing limit."
  },
  "fullerton": {
    cityName: "Fullerton",
    stateName: "California",
    lawNotice: "California adheres to pure comparative negligence principles and a 2-year statute of limitations."
  },
  "thousand-oaks": {
    cityName: "Thousand Oaks",
    stateName: "California",
    lawNotice: "California follows pure comparative negligence and a 2-year filing window."
  },
  "visalia": {
    cityName: "Visalia",
    stateName: "California",
    lawNotice: "California applies pure comparative negligence and a 2-year statute of limitations."
  },
  "simi-valley": {
    cityName: "Simi Valley",
    stateName: "California",
    lawNotice: "California uses pure comparative negligence and a 2-year filing limit."
  },
  "concord": {
    cityName: "Concord",
    stateName: "California",
    lawNotice: "California operates under pure comparative negligence with a 2-year statute of limitations."
  },
  "roseville": {
    cityName: "Roseville",
    stateName: "California",
    lawNotice: "California follows pure comparative negligence rules and a 2-year filing window."
  },
  "victorville": {
    cityName: "Victorville",
    stateName: "California",
    lawNotice: "California applies pure comparative negligence and a 2-year statute of limitations."
  },
  "clovis": {
    cityName: "Clovis",
    stateName: "California",
    lawNotice: "California adheres to pure comparative negligence principles with a 2-year filing limit."
  },
  "vallejo": {
    cityName: "Vallejo",
    stateName: "California",
    lawNotice: "California operates under pure comparative negligence with a 2-year statute of limitations."
  },
  "berkeley": {
    cityName: "Berkeley",
    stateName: "California",
    lawNotice: "California follows pure comparative negligence and a 2-year filing window."
  },
  "el-monte": {
    cityName: "El Monte",
    stateName: "California",
    lawNotice: "California applies pure comparative negligence and a 2-year statute of limitations."
  },
  "downey": {
    cityName: "Downey",
    stateName: "California",
    lawNotice: "California uses pure comparative negligence with a 2-year filing limit."
  },
  "costa-mesa": {
    cityName: "Costa Mesa",
    stateName: "California",
    lawNotice: "California adheres to pure comparative negligence principles and a 2-year statute of limitations."
  },
  "carlsbad": {
    cityName: "Carlsbad",
    stateName: "California",
    lawNotice: "California operates under pure comparative negligence with a 2-year filing window."
  },
  "inglewood": {
    cityName: "Inglewood",
    stateName: "California",
    lawNotice: "California follows pure comparative negligence and a 2-year statute of limitations."
  },
  "fairfield": {
    cityName: "Fairfield",
    stateName: "California",
    lawNotice: "California applies pure comparative negligence and a 2-year filing limit."
  },
  "murrieta": {
    cityName: "Murrieta",
    stateName: "California",
    lawNotice: "California uses pure comparative negligence with a 2-year statute of limitations."
  },
  "santa-maria": {
    cityName: "Santa Maria",
    stateName: "California",
    lawNotice: "California operates under pure comparative negligence with a 2-year statute of limitations."
  },
  "vacaville": {
    cityName: "Vacaville",
    stateName: "California",
    lawNotice: "California applies pure comparative negligence and a 2-year filing window for injury claims."
  },
  "hesperia": {
    cityName: "Hesperia",
    stateName: "California",
    lawNotice: "California follows pure comparative negligence principles and a 2-year statute of limitations."
  },
  "el-cajon": {
    cityName: "El Cajon",
    stateName: "California",
    lawNotice: "California operates under pure comparative negligence and a 2-year statute of limitations."
  },
  "san-leandro": {
    cityName: "San Leandro",
    stateName: "California",
    lawNotice: "California adheres to pure comparative negligence rules and a 2-year filing window."
  },
  "whittier": {
    cityName: "Whittier",
    stateName: "California",
    lawNotice: "California follows pure comparative negligence and a 2-year statute of limitations."
  },
  "hawthorne": {
    cityName: "Hawthorne",
    stateName: "California",
    lawNotice: "California applies pure comparative negligence and a 2-year filing period."
  },
  "alhamra": {
    cityName: "Alhambra",
    stateName: "California",
    lawNotice: "California operates under pure comparative negligence with a 2-year statute of limitations."
  },
  "buena-park": {
    cityName: "Buena Park",
    stateName: "California",
    lawNotice: "California follows pure comparative negligence and a 2-year filing limit."
  },
  "lakewood": {
    cityName: "Lakewood",
    stateName: "California",
    lawNotice: "California uses pure comparative negligence and a 2-year statute of limitations."
  },
  "merced": {
    cityName: "Merced",
    stateName: "California",
    lawNotice: "California adheres to pure comparative negligence principles and a 2-year filing window."
  },
  "chico": {
    cityName: "Chico",
    stateName: "California",
    lawNotice: "California operates under pure comparative negligence with a 2-year statute of limitations."
  },
  "indio": {
    cityName: "Indio",
    stateName: "California",
    lawNotice: "California follows pure comparative negligence and a 2-year filing period."
  },
  "baldwin-park": {
    cityName: "Baldwin Park",
    stateName: "California",
    lawNotice: "California applies pure comparative negligence and a 2-year statute of limitations."
  },
  "chino": {
    cityName: "Chino",
    stateName: "California",
    lawNotice: "California uses pure comparative negligence and a 2-year filing limit."
  },
  "santa-barbara": {
    cityName: "Santa Barbara",
    stateName: "California",
    lawNotice: "California applies pure comparative negligence and a 2-year statute of limitations."
  },
  "redding": {
    cityName: "Redding",
    stateName: "California",
    lawNotice: "California uses pure comparative negligence with a 2-year filing limit."
  },
  "livermore": {
    cityName: "Livermore",
    stateName: "California",
    lawNotice: "California adheres to pure comparative negligence principles and a 2-year statute of limitations."
  },
  "hemet": {
    cityName: "Hemet",
    stateName: "California",
    lawNotice: "California follows pure comparative negligence and a 2-year filing window."
  },
  "carson": {
    cityName: "Carson",
    stateName: "California",
    lawNotice: "California operates under pure comparative negligence with a 2-year statute of limitations."
  },
  "napa": {
    cityName: "Napa",
    stateName: "California",
    lawNotice: "California applies pure comparative negligence and a 2-year filing period."
  },
  "tustin": {
    cityName: "Tustin",
    stateName: "California",
    lawNotice: "California follows pure comparative negligence and a 2-year statute of limitations."
  },
  "newport-beach": {
    cityName: "Newport Beach",
    stateName: "California",
    lawNotice: "California uses pure comparative negligence with a 2-year filing limit."
  },
  "laguna-niguel": {
    cityName: "Laguna Niguel",
    stateName: "California",
    lawNotice: "California adheres to pure comparative negligence and a 2-year statute of limitations."
  },
  "san-rafael": {
    cityName: "San Rafael",
    stateName: "California",
    lawNotice: "California operates under pure comparative negligence with a 2-year filing window."
  },
  "menifee": {
    cityName: "Menifee",
    stateName: "California",
    lawNotice: "California follows pure comparative negligence and a 2-year statute of limitations."
  },
  "san-pablo": {
    cityName: "San Pablo",
    stateName: "California",
    lawNotice: "California applies pure comparative negligence and a 2-year filing period."
  },
  "walnut-creek": {
    cityName: "Walnut Creek",
    stateName: "California",
    lawNotice: "California uses pure comparative negligence and a 2-year statute of limitations."
  },
  "pittsburg": {
    cityName: "Pittsburg",
    stateName: "California",
    lawNotice: "California adheres to pure comparative negligence and a 2-year filing limit."
  },
  "porterville": {
    cityName: "Porterville",
    stateName: "California",
    lawNotice: "California follows pure comparative negligence with a 2-year statute of limitations."
  },
  "folsom": {
    cityName: "Folsom",
    stateName: "California",
    lawNotice: "California operates under pure comparative negligence and a 2-year filing window."
  },
  "turlock": {
    cityName: "Turlock",
    stateName: "California",
    lawNotice: "California applies pure comparative negligence and a 2-year statute of limitations."
  },
  "cupertino": {
    cityName: "Cupertino",
    stateName: "California",
    lawNotice: "California uses pure comparative negligence with a 2-year filing limit."
  },
  "campbell": {
    cityName: "Campbell",
    stateName: "California",
    lawNotice: "California follows pure comparative negligence and a 2-year statute of limitations."
  },
  "san-clemente": {
    cityName: "San Clemente",
    stateName: "California",
    lawNotice: "California operates under pure comparative negligence and a 2-year filing window."
  },
  "arcadia": {
    cityName: "Arcadia",
    stateName: "California",
    lawNotice: "California applies pure comparative negligence and a 2-year statute of limitations."
  },
  "la-mesa": {
    cityName: "La Mesa",
    stateName: "California",
    lawNotice: "California uses pure comparative negligence and a 2-year filing period."
  },
  "yuba-city": {
    cityName: "Yuba City",
    stateName: "California",
    lawNotice: "California adheres to pure comparative negligence and a 2-year statute of limitations."
  },
  "rocklin": {
    cityName: "Rocklin",
    stateName: "California",
    lawNotice: "California follows pure comparative negligence with a 2-year filing limit."
  },
  "camarillo": {
    cityName: "Camarillo",
    stateName: "California",
    lawNotice: "California operates under pure comparative negligence and a 2-year statute of limitations."
  },
  "bakersfield": {
    cityName: "Bakersfield",
    stateName: "California",
    lawNotice: "California applies pure comparative negligence and a 2-year filing window."
  },
  "aurora-il": {
    cityName: "Aurora",
    stateName: "Illinois",
    lawNotice: "Illinois applies a modified comparative negligence system (51% bar) with a 2-year statute of limitations."
  },
  "yonkers": {
    cityName: "Yonkers",
    stateName: "New York",
    lawNotice: "New York follows a pure comparative negligence doctrine and a 3-year statute of limitations for personal injury."
  },
  "worcester": {
    cityName: "Worcester",
    stateName: "Massachusetts",
    lawNotice: "Massachusetts operates under a 51% modified comparative negligence rule and a 3-year filing window."
  },
  "tallahassee": {
    cityName: "Tallahassee",
    stateName: "Florida",
    lawNotice: "Florida utilizes a modified comparative fault standard alongside mandatory PIP coverage requirements."
  },
  "columbus-ga": {
    cityName: "Columbus",
    stateName: "Georgia",
    lawNotice: "Georgia follows a 50% modified comparative negligence rule and a 2-year statute of limitations."
  },
  "augusta": {
    cityName: "Augusta",
    stateName: "Georgia",
    lawNotice: "Georgia applies a 50% modified comparative negligence bar for personal injury claims."
  },
  "grand-rapids": {
    cityName: "Grand Rapids",
    stateName: "Michigan",
    lawNotice: "Michigan enforces a modified comparative fault system with a 3-year statute of limitations."
  },
  "amarillo": {
    cityName: "Amarillo",
    stateName: "Texas",
    lawNotice: "Texas follows a 51% modified comparative negligence rule with a 2-year statute of limitations."
  },
  "mobile": {
    cityName: "Mobile",
    stateName: "Alabama",
    lawNotice: "Alabama operates under a strict contributory negligence doctrine with a 2-year statute of limitations."
  },
  "shreveport": {
    cityName: "Shreveport",
    stateName: "Louisiana",
    lawNotice: "Louisiana uses a pure comparative fault system with a 1-year prescriptive period."
  },
  "knoxville": {
    cityName: "Knoxville",
    stateName: "Tennessee",
    lawNotice: "Tennessee follows a 50% modified comparative fault framework and a 1-year statute of limitations."
  },
  "newport-news": {
    cityName: "Newport News",
    stateName: "Virginia",
    lawNotice: "Virginia follows a strict contributory negligence doctrine and a 2-year statute of limitations."
  },
  "alexandria": {
    cityName: "Alexandria",
    stateName: "Virginia",
    lawNotice: "Virginia applies a strict contributory negligence doctrine for injury claims."
  },
  "tempe": {
    cityName: "Tempe",
    stateName: "Arizona",
    lawNotice: "Arizona follows a pure comparative negligence system with a 2-year statute of limitations."
  },
  "scottsdale": {
    cityName: "Scottsdale",
    stateName: "Arizona",
    lawNotice: "Arizona uses a pure comparative negligence doctrine and a 2-year filing window."
  },
  "peoria": {
    cityName: "Peoria",
    stateName: "Arizona",
    lawNotice: "Arizona operates under pure comparative negligence with a 2-year statute of limitations."
  },
  "surprise": {
    cityName: "Surprise",
    stateName: "Arizona",
    lawNotice: "Arizona follows pure comparative negligence principles and a 2-year filing limit."
  },
  "temecula": {
    cityName: "Temecula",
    stateName: "California",
    lawNotice: "California applies pure comparative negligence and a 2-year statute of limitations."
  },
  "jurupa-valley": {
    cityName: "Jurupa Valley",
    stateName: "California",
    lawNotice: "California uses pure comparative negligence with a 2-year statute of limitations."
  },
  "alhambra": {
    cityName: "Alhambra",
    stateName: "California",
    lawNotice: "California operates under pure comparative negligence and a 2-year filing window."
  },
  "waco": {
    cityName: "Waco",
    stateName: "Texas",
    lawNotice: "Texas follows a 51% modified comparative negligence rule with a 2-year statute of limitations."
  },
  "thornton": {
    cityName: "Thornton",
    stateName: "Colorado",
    lawNotice: "Colorado uses a 50% modified comparative negligence rule and a 3-year statute of limitations."
  },
  "columbia-sc": {
    cityName: "Columbia",
    stateName: "South Carolina",
    lawNotice: "South Carolina applies a 51% modified comparative negligence rule and a 3-year statute of limitations."
  },
  "meridian": {
    cityName: "Meridian",
    stateName: "Idaho",
    lawNotice: "Idaho follows a 51% modified comparative negligence rule and a 2-year statute of limitations."
  },
  "gainesville": {
    cityName: "Gainesville",
    stateName: "Florida",
    lawNotice: "Florida utilizes a modified comparative fault standard alongside mandatory PIP coverage requirements."
  },
  "newport-news-va": {
    cityName: "Newport News",
    stateName: "Virginia",
    lawNotice: "Virginia follows a strict contributory negligence doctrine and a 2-year statute of limitations."
  },
  "sterling-heights": {
    cityName: "Sterling Heights",
    stateName: "Michigan",
    lawNotice: "Michigan enforces a modified comparative fault system with a 3-year statute of limitations."
  },
  "santa-maria-ca": {
    cityName: "Santa Maria",
    stateName: "California",
    lawNotice: "California operates under pure comparative negligence with a 2-year statute of limitations."
  },
  "athens": {
    cityName: "Athens",
    stateName: "Georgia",
    lawNotice: "Georgia follows a 50% modified comparative negligence rule and a 2-year statute of limitations."
  },
  "clearwater": {
    cityName: "Clearwater",
    stateName: "Florida",
    lawNotice: "Florida uses a modified comparative fault standard and requires mandatory PIP insurance."
  },
  "evansville": {
    cityName: "Evansville",
    stateName: "Indiana",
    lawNotice: "Indiana utilizes a 51% modified comparative fault system and a 2-year statute of limitations."
  },
  "hartford-ct": {
    cityName: "Hartford",
    stateName: "Connecticut",
    lawNotice: "Connecticut follows a 51% modified comparative negligence rule and a 2-year statute of limitations."
  },
  "norman": {
    cityName: "Norman",
    stateName: "Oklahoma",
    lawNotice: "Oklahoma operates under a 51% modified comparative negligence system with a 2-year statute of limitations."
  },
  "elgin": {
    cityName: "Elgin",
    stateName: "Illinois",
    lawNotice: "Illinois applies a modified comparative negligence system (51% bar) with a 2-year statute of limitations."
  },
  "carlsbad-ca": {
    cityName: "Carlsbad",
    stateName: "California",
    lawNotice: "California operates under pure comparative negligence with a 2-year filing window."
  },
  "green-bay": {
    cityName: "Green Bay",
    stateName: "Wisconsin",
    lawNotice: "Wisconsin applies a 51% modified comparative negligence rule and a 3-year statute of limitations."
  },
  "broken-arrow": {
    cityName: "Broken Arrow",
    stateName: "Oklahoma",
    lawNotice: "Oklahoma enforces a 51% modified comparative negligence rule with a 2-year statute of limitations."
  },
  "gresham": {
    cityName: "Gresham",
    stateName: "Oregon",
    lawNotice: "Oregon applies a 51% modified comparative negligence rule and a 2-year statute of limitations."
  },
  "billings-mt": {
    cityName: "Billings",
    stateName: "Montana",
    lawNotice: "Montana follows a 51% modified comparative negligence rule and a 3-year statute of limitations."
  },
  "clovis-ca": {
    cityName: "Clovis",
    stateName: "California",
    lawNotice: "California adheres to pure comparative negligence principles and a 2-year filing limit."
  },
  "daly-city": {
    cityName: "Daly City",
    stateName: "California",
    lawNotice: "California operates under pure comparative negligence with a 2-year statute of limitations."
  },
  "antioch": {
    cityName: "Antioch",
    stateName: "California",
    lawNotice: "California follows pure comparative negligence principles and a 2-year statute of limitations."
  },
  "default": {
    cityName: "Local Regional",
    stateName: "Statewide",
    lawNotice: "Calculations run via generalized baseline economic multiplier equations and standardized regional civil evaluation formulas."
  }
};

function loadPersisted(): Partial<PersistedState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function AdSlot({
  className,
  label = "Advertisement Space",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div className={`overflow-hidden ${className || ""}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot="XXXXXXXXXX"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

// 2. Dynamic Route Definition mapping to the $citySlug path parameters
export const Route = createFileRoute("/$citySlug")({
  head: ({ params }) => {
    const data = localCityData[params.citySlug] || localCityData["default"];
    const displayTitle = `${data.cityName} Personal Injury Settlement Case Ledger`;
    const displayDesc = `Calculate personal injury damage values instantly in ${data.cityName}, ${data.stateName}. Fully transparent insurance adjuster estimate logic.`;
    
    return {
      meta: [
        { title: displayTitle },
        { name: "description", content: displayDesc },
        { property: "og:title", content: displayTitle },
        { property: "og:description", content: displayDesc },
      ],
    };
  },
  component: Index,
});

const severityMap = [
  {
    min: 1.5,
    max: 2.1,
    label: "Minor Soft Tissue Issues",
    detail:
      "Minor adjustments typical of low-impact whiplash, bruising, or minor muscle strains with short recovery frames.",
  },
  {
    min: 2.2,
    max: 3.0,
    label: "Moderate Sprains & Tears",
    detail:
      "Significant soft tissue damage, deep muscle sprains, joint tears, or minor non-surgical bone fractures.",
  },
  {
    min: 3.1,
    max: 4.0,
    label: "Severe & Structural Faults",
    detail:
      "Severe broken bones, compound fractures, disc herniations, or injuries requiring standard surgical procedures.",
  },
  {
    min: 4.1,
    max: 5.0,
    label: "Permanent / Life Altering",
    detail:
      "Permanent structural impairment, severe neurological loss, brain trauma, or extensive multi-staged reconstructive surgeries.",
  },
];

const fmt = (val: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);

function CurrencyField({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-800 tracking-tight">
        {label}
      </label>
      <span className="text-xs text-slate-500 block leading-relaxed">{hint}</span>
      <div className="relative mt-2">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <span className="text-slate-400 text-sm font-medium">$</span>
        </div>
        <input
          type="number"
          id={id}
          min={0}
          step={100}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="block w-full rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm py-3.5 pl-9 pr-4 text-slate-900 font-semibold text-lg outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300"
        />
      </div>
    </div>
  );
}

const steps = [
  { id: 1, title: "Economic Losses", caption: "Medical & property costs" },
  { id: 2, title: "Work & Income Impact", caption: "Wages & lost capacity" },
  { id: 3, title: "Injury Severity", caption: "Pain & suffering multiplier" },
];

function Index() {
  // 3. Extract parameter hook context
  const { citySlug } = Route.useParams();
  const region = useMemo(() => localCityData[citySlug] || localCityData["default"], [citySlug]);

  const [medExpenses, setMed] = useState(7500);
  const [lostIncome, setLost] = useState(2400);
  const [propertyDamage, setProp] = useState(3200);
  const [multiplier, setMult] = useState(2.0);
  const [step, setStep] = useState(1);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from localStorage on mount (client-only, SSR-safe)
  useEffect(() => {
    const data = loadPersisted();
    if (data) {
      if (typeof data.medExpenses === "number") setMed(data.medExpenses);
      if (typeof data.lostIncome === "number") setLost(data.lostIncome);
      if (typeof data.propertyDamage === "number") setProp(data.propertyDamage);
      if (typeof data.multiplier === "number") setMult(data.multiplier);
      if (typeof data.step === "number") setStep(data.step);
    }
    setHydrated(true);
  }, []);

  // Persist on changes (after hydration so we don't overwrite with defaults)
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      const payload: PersistedState = {
        medExpenses,
        lostIncome,
        propertyDamage,
        multiplier,
        step,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setSavedAt(Date.now());
      setJustSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setJustSaved(false), 1200);
    } catch {
      /* ignore quota / privacy mode errors */
    }
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, [hydrated, medExpenses, lostIncome, propertyDamage, multiplier, step]);

  const { totalSpecials, totalGenerals, baseTotal, low, high, severity } = useMemo(() => {
    const totalSpecials = medExpenses + lostIncome + propertyDamage;
    const totalGenerals = medExpenses * multiplier;
    const baseTotal = totalSpecials + totalGenerals;
    const severity =
      severityMap.find((s) => multiplier >= s.min && multiplier <= s.max) ?? severityMap[0];
    return {
      totalSpecials,
      totalGenerals,
      baseTotal,
      low: baseTotal * 0.92,
      high: baseTotal * 1.18,
      severity,
    };
  }, [medExpenses, lostIncome, propertyDamage, multiplier]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 text-slate-800 antialiased selection:bg-blue-500/20">
      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-[40rem] h-[40rem] rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[40rem] h-[40rem] rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      {/* Trust banner */}
      <div className="bg-slate-950 text-slate-100 text-xs sm:text-sm font-medium py-3 px-4 text-center tracking-wide">
        <span className="opacity-90">
          🔒 <strong className="font-semibold">Anonymous Estimate Engine</strong> · No email, name, or phone number required to view your calculated breakdown.
        </span>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-10 sm:py-16 lg:py-24 pb-32 lg:pb-24">
        {/* Editorial header with Regional Injection */}
        <header className="text-center mb-10 sm:mb-16 lg:mb-20 max-w-3xl mx-auto">
          <span className="inline-block text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-semibold text-blue-600 mb-3 sm:mb-5">
            {region.cityName} Settlement Intelligence · 2026
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-950 tracking-tighter leading-[0.95] mb-4 sm:mb-6">
            The {region.cityName}
            <br />
            <span className="italic font-serif text-slate-700 font-light">Injury Case Ledger.</span>
          </h1>
          <p className="text-slate-500 text-base sm:text-lg lg:text-xl leading-relaxed font-light max-w-2xl mx-auto">
            See exactly how insurance adjusters multiply, calculate, and evaluate claim damages inside {region.stateName}. Adjust your variables for an instant transparent estimation.
          </p>
          {hydrated && savedAt !== null && (
            <div className="mt-6 flex justify-center">
              <span
                aria-live="polite"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-slate-500 backdrop-blur-sm shadow-sm"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    justSaved ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                />
                Autosaved locally
              </span>
            </div>
          )}
        </header>

        {/* AdSense — Horizontal Banner */}
        <div className="max-w-5xl mx-auto mb-8 sm:mb-12">
          <AdSlot className="border border-dashed border-slate-300 rounded-xl bg-slate-50/50" />
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* Inputs */}
          <section className="w-full lg:col-span-5 lg:sticky lg:top-10">
            <div className="bg-white/60 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/80 p-5 sm:p-8 lg:p-10 shadow-xl shadow-slate-900/5 ring-1 ring-slate-900/[0.03]">
              {/* Step header + progress */}
              <div className="space-y-5 pb-7 border-b border-slate-200/70">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-blue-600">
                      Step {String(step).padStart(2, "0")} of 03
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
                      {steps[step - 1].title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 font-light">
                      {steps[step - 1].caption}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {steps.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setStep(s.id)}
                        aria-label={`Go to step ${s.id}`}
                        className={`w-7 h-7 rounded-full text-[11px] font-mono font-semibold transition-all ${
                          step === s.id
                            ? "bg-slate-950 text-white shadow-md"
                            : step > s.id
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                        }`}
                      >
                        {step > s.id ? "✓" : s.id}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(step / steps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Step panels */}
              <div className="pt-8 min-h-[340px]">
                {step === 1 && (
                  <div key="s1" className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                    <CurrencyField
                      id="medExpenses"
                      label="Total Medical Expenses"
                      hint="ER visits, surgeries, medications, therapy, and future projected costs."
                      value={medExpenses}
                      onChange={setMed}
                    />
                    <CurrencyField
                      id="propertyDamage"
                      label="Property Damage"
                      hint="Vehicle repairs, diminished vehicle value, or destroyed personal items."
                      value={propertyDamage}
                      onChange={setProp}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div key="s2" className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                    <CurrencyField
                      id="lostIncome"
                      label="Lost Income & Wages"
                      hint="Unearned pay from missed work shifts, PTO used, or future capacity loss."
                      value={lostIncome}
                      onChange={setLost}
                    />
                    <div className="bg-blue-50/60 backdrop-blur border border-blue-100 rounded-xl p-4 text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-900 font-semibold block mb-1">
                        Why this matters
                      </strong>
                      Lost wages roll directly into your Special (Economic) Damages and increase the base before the severity multiplier is applied.
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div key="s3" className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="flex justify-between items-center">
                      <label htmlFor="injurySeverity" className="text-sm font-semibold text-slate-800 tracking-tight">
                        Injury Severity Multiplier
                      </label>
                      <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full font-mono tracking-tight shadow-sm shadow-blue-600/20">
                        {multiplier.toFixed(1)}x
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 block leading-relaxed">
                      Used by adjusters to calculate non-economic General Damages (Pain & Suffering).
                    </span>
                    <input
                      type="range"
                      id="injurySeverity"
                      min={1.5}
                      max={5.0}
                      step={0.1}
                      value={multiplier}
                      onChange={(e) => setMult(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="bg-slate-50/80 backdrop-blur rounded-xl p-4 border border-slate-200/60 text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-900 font-semibold block mb-1">
                        {severity.label}
                      </strong>
                      {severity.detail}
                    </div>
                  </div>
                )}
              </div>

              {/* Nav */}
              <div className="flex items-center justify-between pt-8 mt-2 border-t border-slate-200/70">
                <button
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors tracking-tight"
                >
                  ← Back
                </button>
                {step < steps.length ? (
                  <button
                    onClick={() => setStep((s) => Math.min(steps.length, s + 1))}
                    className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-7 py-3 rounded-xl shadow-lg shadow-slate-900/20 transition-all text-sm tracking-tight hover:-translate-y-0.5"
                  >
                    Next Step →
                  </button>
                ) : (
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 font-semibold">
                    ✓ Ledger Complete
                  </span>
                )}
              </div>
            </div>

            {/* AdSense — Sidebar Square */}
            <div className="mt-8">
              <AdSlot className="border border-dashed border-slate-300 rounded-xl bg-slate-50/50" />
            </div>
          </section>

          {/* Ledger */}
          <section className="w-full lg:col-span-7">
            <div className="bg-slate-950 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl shadow-slate-900/30 ring-1 ring-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-blue-500/[0.04] pointer-events-none" />

              <div className="relative">
                <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-8">
                  <div>
                    <h2 className="text-[10px] font-bold text-slate-300 tracking-[0.25em] uppercase">
                      {region.cityName} Adjuster Estimation
                    </h2>
                    <p className="text-xs text-slate-500 mt-1.5 font-light">
                      Calculated in real-time under local framework
                    </p>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1.5 rounded-md tracking-wider uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Audit
                  </span>
                </div>

                <div className="space-y-5 font-mono text-sm">
                  <div className="flex justify-between items-start border-b border-white/5 pb-4">
                    <div className="space-y-1">
                      <span className="text-slate-200 block font-sans font-medium">
                        01 · Total Special Damages
                      </span>
                      <span className="text-xs text-slate-500 block font-sans">
                        Medical + Wages + Property (Economic)
                      </span>
                    </div>
                    <span className="text-white font-semibold text-base tabular-nums">
                      {fmt(totalSpecials)}
                    </span>
                  </div>

                  <div className="flex justify-between items-start border-b border-white/5 pb-4">
                    <div className="space-y-1">
                      <span className="text-slate-200 block font-sans font-medium">
                        02 · General Damages
                      </span>
                      <span className="text-xs text-slate-500 block font-sans">
                        {fmt(medExpenses)} × {multiplier.toFixed(1)} Multiplier (Non-Economic)
                      </span>
                    </div>
                    <span className="text-white font-semibold text-base tabular-nums">
                      {fmt(totalGenerals)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-400 font-sans">Combined Ledger Base</span>
                    <span className="text-slate-200 font-semibold tabular-nums">
                      {fmt(baseTotal)}
                    </span>
                  </div>
                </div>

                {/* Settlement valuation */}
                <div className="mt-8 sm:mt-10 bg-gradient-to-br from-blue-950/80 via-slate-900 to-slate-950 border border-blue-500/20 rounded-2xl p-5 sm:p-8 text-center shadow-inner ring-1 ring-white/5">
                  <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-blue-400 block mb-3">
                    Estimated {region.cityName} Settlement Valuation
                  </span>
                  <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-emerald-400 tracking-tighter my-3 tabular-nums break-words">
                    {fmt(low)}
                    <span className="text-slate-600 font-light mx-2">—</span>
                    {fmt(high)}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-3 leading-relaxed font-light">
                    A realistic settlement trajectory inclusive of normal regional carrier negotiation parameters.
                  </p>
                </div>

                {/* CTA */}
                <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-5">
                  <div className="text-center sm:text-left">
                    <h4 className="text-sm font-semibold text-white tracking-tight">
                      Want an expert in {region.cityName} to audit this ledger?
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 font-light">
                      Lock in your variables and request a free case certification.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      alert(
                        `Routing anonymized ledger parameters securely to verified personal injury representation structures serving ${region.cityName}, ${region.stateName}.`,
                      )
                    }
                    className="w-full sm:w-auto bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 text-slate-950 font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-sm tracking-tight shrink-0 cursor-pointer hover:-translate-y-0.5"
                  >
                    Verify with {region.cityName} Attorney →
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Local Compliance Footer Injections */}
        <footer className="mt-24 border-t border-slate-200 pt-8 text-xs text-slate-500 leading-relaxed max-w-4xl mx-auto text-center font-light">
          <p className="mb-4 bg-slate-50/80 p-4 border border-slate-200/60 rounded-xl text-slate-600 text-left">
            <strong className="text-slate-900 font-semibold block mb-1">Regional Jurisdictional Context ({region.stateName}):</strong> {region.lawNotice}
          </p>
          <p className="mb-3">
            <strong className="text-slate-700 font-semibold">Important Compliance Notice:</strong> This interactive web application generates data models based exclusively on generalized algorithmic insurance multiplier equations. It does not account for statutory local tort caps, comparative fault liabilities, or individual policy limits.
          </p>
          <p>
            Computations displayed on this dashboard do not constitute formal legal representation, binding litigation valuation, or official legal advice. Use of this application does not establish an attorney-client relationship.
          </p>
        </footer>
      </main>

      {/* Mobile sticky valuation bar — visible below lg only */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-white/10 px-4 py-3 shadow-2xl shadow-slate-900/40">
        <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
          <div className="min-w-0">
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-blue-400 block">
              Live {region.cityName} Valuation
            </span>
            <div className="text-base sm:text-lg font-black text-emerald-400 tracking-tight tabular-nums truncate">
              {fmt(low)} — {fmt(high)}
            </div>
          </div>
          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md tracking-wider uppercase flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>
      </div>
    </div>
  );
}