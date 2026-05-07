// =====================================================
// Catálogo de momentos emocionales — 23:47
// Cada entrada representa un momento en que internet se sentía especial.
// =====================================================

export interface EraDefinition {
  id: string;
  label: string;
  emoji: string;
  year: number;
  season: string;
  palette: {
    bg: string;
    surface: string;
    accent: string;
    glow: string;
    text: string;
  };
  particles: "none" | "rain" | "embers" | "snow" | "stars" | "leaves" | "fireflies";
  ambient: "rain" | "crt" | "warm" | "neon" | "calm" | "wind";
  musicSeed: string[];
  description: string;
  references: string[];
  newsHeadlines: string[];
}

export const ERAS: EraDefinition[] = [
  {
    id: "madrugada-2003",
    label: "Madrugada 2003",
    emoji: "🌙",
    year: 2003,
    season: "night",
    palette: {
      bg: "#06070d",
      surface: "#0e1224",
      accent: "#7dd3fc",
      glow: "#bae6fd",
      text: "#dbeafe",
    },
    particles: "stars",
    ambient: "crt",
    musicSeed: ["Moby - Lift Me Up", "Air - La Femme d'Argent", "Massive Attack - Teardrop"],
    description: "Son las 23:47. El módem sigue encendido. MSN parpadea y alguien que importa acaba de conectarse.",
    references: ["Winamp", "MSN Plus!", "Encarta", "Foros nocturnos"],
    newsHeadlines: ["Skype acaba de nacer", "Matrix Reloaded en cines", "MySpace empieza"],
  },
  {
    id: "tarde-2003",
    label: "Tarde de verano 2003",
    emoji: "☀️",
    year: 2003,
    season: "summer",
    palette: {
      bg: "#120a00",
      surface: "#271500",
      accent: "#f97316",
      glow: "#fdba74",
      text: "#fff7ed",
    },
    particles: "embers",
    ambient: "warm",
    musicSeed: ["Outkast - Hey Ya", "Justin Timberlake - Cry Me A River", "Beyoncé - Crazy in Love"],
    description: "Las 18:30, meriendas, Messenger abierto y Winamp en bucle. El verano que internet era aún tuyo.",
    references: ["MSN Messenger 6", "Winamp skins", "Emule", "Kazaa"],
    newsHeadlines: ["Emule reina en las descargas", "Pop 2000 en MTV", "El boom de los foros"],
  },
  {
    id: "sabado-2002",
    label: "Sábado mañana 2002",
    emoji: "🎮",
    year: 2002,
    season: "morning",
    palette: {
      bg: "#050d1a",
      surface: "#0a1a33",
      accent: "#38bdf8",
      glow: "#7dd3fc",
      text: "#e0f2fe",
    },
    particles: "none",
    ambient: "neon",
    musicSeed: ["Eminem - Lose Yourself", "Nelly - Hot in Herre", "Avril Lavigne - Complicated"],
    description: "Sábado temprano, televisión de dibujos, PS2 encendida y la semana más larga por delante.",
    references: ["PlayStation 2", "GBA", "Dragon Ball Z", "Pokémon anime"],
    newsHeadlines: ["GTA Vice City arrasa", "Lord of the Rings en cines", "Habbo Hotel llega"],
  },
  {
    id: "verano-2000",
    label: "Verano 2000",
    emoji: "🌴",
    year: 2000,
    season: "summer",
    palette: {
      bg: "#0a1f2b",
      surface: "#0f3a4d",
      accent: "#ffb46b",
      glow: "#ffd29a",
      text: "#fef6e8",
    },
    particles: "fireflies",
    ambient: "warm",
    musicSeed: ["Eiffel 65 - Blue", "Britney Spears - Oops!", "Modjo - Lady"],
    description: "Atardeceres infinitos, módems chillones y Napster cargando una canción a 30 KB/s. El inicio de todo.",
    references: ["Pokémon Oro y Plata", "MSN Messenger 1.0", "Walkman", "Cybercafés"],
    newsHeadlines: ["El módem 56k es el rey", "Y2K sin apocalipsis", "Napster revoluciona la música"],
  },
  {
    id: "otono-2004",
    label: "Otoño 2004",
    emoji: "🌧️",
    year: 2004,
    season: "autumn",
    palette: {
      bg: "#0a0f1c",
      surface: "#121b30",
      accent: "#7aa7ff",
      glow: "#a8c1ff",
      text: "#e7ecf7",
    },
    particles: "rain",
    ambient: "rain",
    musicSeed: ["Snow Patrol - Run", "Green Day - Boulevard of Broken Dreams", "Linkin Park - Numb"],
    description: "Lluvia en la ventana. Conversaciones que duran horas. Un nick con corazoncitos en MSN 6.2.",
    references: ["Fotolog", "MSN 6.2", "iPod mini", "MySpace"],
    newsHeadlines: ["Facebook abre solo a universitarios", "Half-Life 2 lo cambia todo", "Auge de los blogs"],
  },
  {
    id: "verano-2005",
    label: "Verano 2005",
    emoji: "🌊",
    year: 2005,
    season: "summer",
    palette: {
      bg: "#0a0a1a",
      surface: "#14143a",
      accent: "#a78bfa",
      glow: "#c4b5fd",
      text: "#ede9fe",
    },
    particles: "leaves",
    ambient: "calm",
    musicSeed: ["My Chemical Romance - Helena", "Fall Out Boy - Sugar We're Goin Down", "The Killers - Mr. Brightside"],
    description: "Calor, piscina, Fotolog diario y emo music a todo volumen. El momento en que internet empezó a ser social.",
    references: ["Fotolog", "MySpace perfiles", "MSN nudges", "Punk-o-rama"],
    newsHeadlines: ["YouTube nace este año", "Blogs en su pico máximo", "Emo y pop punk dominan"],
  },
  {
    id: "navidad-2007",
    label: "Navidad 2007",
    emoji: "🎄",
    year: 2007,
    season: "winter",
    palette: {
      bg: "#0c0a1c",
      surface: "#1a1430",
      accent: "#c4b5fd",
      glow: "#e9d5ff",
      text: "#f3eaff",
    },
    particles: "snow",
    ambient: "calm",
    musicSeed: ["Justice - D.A.N.C.E.", "Daft Punk - Digital Love", "Avril Lavigne - Innocence"],
    description: "Nieve fuera, Wii dentro. Tuenti recién llegado y la primera generación con móvil con cámara.",
    references: ["Tuenti", "Nintendo Wii", "iPhone original", "Windows Vista"],
    newsHeadlines: ["Apple presenta el iPhone", "YouTube en su esplendor", "Wii vende millones"],
  },
  {
    id: "primavera-2009",
    label: "Primavera 2009",
    emoji: "🌸",
    year: 2009,
    season: "spring",
    palette: {
      bg: "#0c1a14",
      surface: "#0f2a1f",
      accent: "#8be8a8",
      glow: "#bdf6cf",
      text: "#eafff0",
    },
    particles: "leaves",
    ambient: "wind",
    musicSeed: ["Phoenix - 1901", "MGMT - Kids", "Empire of the Sun - Walking on a Dream"],
    description: "Tardes de sol entre exámenes. Tuenti hirviendo y los primeros vídeos virales que todo el mundo compartía.",
    references: ["Tuenti", "Spotify europeo", "Megaupload", "Twitter naciente"],
    newsHeadlines: ["Spotify cruza Europa", "Twitter explota", "Bitcoin nace en silencio"],
  },
];

export function findEra(id: string): EraDefinition | undefined {
  return ERAS.find((e) => e.id === id);
}
