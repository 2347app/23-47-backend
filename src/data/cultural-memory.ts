// ============================================================
// 23:47 — Cultural Memory Knowledge Base
// España 2000–2010 · Generación digital española
// ============================================================

export type MemoryCategory =
  | "music" | "tv" | "anime" | "games" | "internet"
  | "school" | "ads" | "tech" | "sports" | "life";

export type Region =
  | "universal" | "south_spain" | "madrid" | "catalonia" | "north_spain";

export type TimeOfDay =
  | "morning" | "afternoon" | "evening" | "night" | "late_night" | "any";

export type Season = "spring" | "summer" | "autumn" | "winter" | "any";

export interface CulturalMemory {
  id: string;
  yearRange: [number, number];
  category: MemoryCategory;
  title: string;
  ambient: string;               // text shown floating in UI
  icon: string;                  // emoji prefix
  region: Region;
  timeOfDay: TimeOfDay;
  season: Season;
  emotionalTags: string[];       // nostalgia, warm, melancholy, energy, comfort...
  intensity: number;             // 1-10 emotional weight
}

export const CULTURAL_MEMORIES: CulturalMemory[] = [

  // ── MÚSICA ───────────────────────────────────────────────────────
  {
    id: "m001", yearRange: [2001, 2006], category: "music",
    title: "El Canto del Loco",
    ambient: "El Canto del Loco sonando en la radio a toda hora.",
    icon: "💿", region: "universal", timeOfDay: "afternoon", season: "any",
    emotionalTags: ["teenage", "radio", "universal", "energy"], intensity: 8,
  },
  {
    id: "m002", yearRange: [2003, 2007], category: "music",
    title: "Fondo Flamenco",
    ambient: "Fondo Flamenco sonaba en todas las terrazas ese verano.",
    icon: "💿", region: "south_spain", timeOfDay: "evening", season: "summer",
    emotionalTags: ["summer", "south_spain", "warm", "night", "nostalgia"], intensity: 10,
  },
  {
    id: "m003", yearRange: [2002, 2004], category: "music",
    title: "Operación Triunfo",
    ambient: "La primera OT lo cambió todo. Todo el mundo cantaba las mismas canciones.",
    icon: "💿", region: "universal", timeOfDay: "evening", season: "any",
    emotionalTags: ["universal", "energy", "shared", "teenage"], intensity: 9,
  },
  {
    id: "m004", yearRange: [2001, 2003], category: "music",
    title: "David Bisbal",
    ambient: "\"Ave María\" sonaba en todas partes. Inevitable.",
    icon: "💿", region: "universal", timeOfDay: "any", season: "any",
    emotionalTags: ["universal", "warm", "south_spain"], intensity: 7,
  },
  {
    id: "m005", yearRange: [2003, 2008], category: "music",
    title: "Estopa",
    ambient: "Estopa ponía la banda sonora a los veranos en el sur.",
    icon: "💿", region: "south_spain", timeOfDay: "evening", season: "summer",
    emotionalTags: ["summer", "south_spain", "warm", "authentic"], intensity: 9,
  },
  {
    id: "m006", yearRange: [2001, 2004], category: "music",
    title: "Shakira — Laundry Service",
    ambient: "El disco de Shakira estaba en cada casa.",
    icon: "💿", region: "universal", timeOfDay: "afternoon", season: "any",
    emotionalTags: ["universal", "energy", "teenage"], intensity: 7,
  },
  {
    id: "m007", yearRange: [2005, 2009], category: "music",
    title: "Melendi",
    ambient: "Melendi era el artista que ponían en todas las fiestas.",
    icon: "💿", region: "universal", timeOfDay: "night", season: "summer",
    emotionalTags: ["summer", "night", "parties", "universal"], intensity: 8,
  },
  {
    id: "m008", yearRange: [2003, 2007], category: "music",
    title: "Ketama",
    ambient: "El flamenco-fusión de Ketama sonaba de fondo en verano.",
    icon: "💿", region: "south_spain", timeOfDay: "evening", season: "summer",
    emotionalTags: ["summer", "south_spain", "warm", "melancholy"], intensity: 7,
  },
  {
    id: "m009", yearRange: [2006, 2010], category: "music",
    title: "Pereza",
    ambient: "\"El roce de tu cuerpo\" lo tarareaba todo el mundo.",
    icon: "💿", region: "madrid", timeOfDay: "night", season: "any",
    emotionalTags: ["madrid", "night", "teenage", "nostalgia"], intensity: 8,
  },
  {
    id: "m010", yearRange: [2004, 2008], category: "music",
    title: "Raimundo Amador",
    ambient: "El blues andaluz de Raimundo Amador en casa de los mayores.",
    icon: "💿", region: "south_spain", timeOfDay: "evening", season: "summer",
    emotionalTags: ["south_spain", "warm", "family", "summer"], intensity: 6,
  },

  // ── TELEVISIÓN ────────────────────────────────────────────────────
  {
    id: "tv001", yearRange: [2001, 2008], category: "tv",
    title: "Shin Chan — Antena 3",
    ambient: "Shin Chan en Antena 3 mientras merendabas.",
    icon: "📺", region: "universal", timeOfDay: "afternoon", season: "any",
    emotionalTags: ["afternoon", "school", "humor", "comfort"], intensity: 9,
  },
  {
    id: "tv002", yearRange: [2000, 2010], category: "tv",
    title: "Los Simpson — Antena 3",
    ambient: "Los Simpson de fondo a las 6 de la tarde. Todos los días.",
    icon: "📺", region: "universal", timeOfDay: "afternoon", season: "any",
    emotionalTags: ["afternoon", "universal", "comfort", "routine"], intensity: 10,
  },
  {
    id: "tv003", yearRange: [2003, 2008], category: "tv",
    title: "Los Serrano — Telecinco",
    ambient: "Los Serrano los miércoles por la noche, con toda la familia.",
    icon: "📺", region: "universal", timeOfDay: "evening", season: "any",
    emotionalTags: ["family", "evening", "universal", "comfort"], intensity: 8,
  },
  {
    id: "tv004", yearRange: [2003, 2006], category: "tv",
    title: "Aquí No Hay Quien Viva",
    ambient: "Las risas de Aquí No Hay Quien Viva llenaban el piso.",
    icon: "📺", region: "universal", timeOfDay: "evening", season: "any",
    emotionalTags: ["humor", "family", "evening", "universal"], intensity: 8,
  },
  {
    id: "tv005", yearRange: [2006, 2009], category: "tv",
    title: "Lo que sé lo que hicisteis — La Sexta",
    ambient: "\"Sé lo que hicisteis\" lo veían los más noctámbulos.",
    icon: "📺", region: "universal", timeOfDay: "night", season: "any",
    emotionalTags: ["night", "humor", "teenage", "late"], intensity: 7,
  },
  {
    id: "tv006", yearRange: [2007, 2010], category: "tv",
    title: "El Internado — Antena 3",
    ambient: "El Internado te enganchó durante semanas. Los viernes no salías.",
    icon: "📺", region: "universal", timeOfDay: "night", season: "any",
    emotionalTags: ["night", "teenage", "suspense", "hooked"], intensity: 9,
  },
  {
    id: "tv007", yearRange: [2000, 2008], category: "tv",
    title: "Dragon Ball Z — repeticiones",
    ambient: "Dragon Ball Z en repetición. Te lo sabías de memoria y lo veías igual.",
    icon: "📺", region: "universal", timeOfDay: "afternoon", season: "summer",
    emotionalTags: ["afternoon", "summer", "childhood", "energy"], intensity: 10,
  },
  {
    id: "tv008", yearRange: [2001, 2005], category: "tv",
    title: "Digimon — TVE",
    ambient: "Los Digimon antes del colegio, cuando aún quedaba tiempo.",
    icon: "📺", region: "universal", timeOfDay: "morning", season: "any",
    emotionalTags: ["morning", "school", "childhood", "energy"], intensity: 8,
  },
  {
    id: "tv009", yearRange: [2000, 2006], category: "tv",
    title: "Pokémon — Antena 3",
    ambient: "Pokémon en Antena 3 los sábados por la mañana. Sin falta.",
    icon: "📺", region: "universal", timeOfDay: "morning", season: "any",
    emotionalTags: ["morning", "saturday", "childhood", "ritual"], intensity: 10,
  },
  {
    id: "tv010", yearRange: [2004, 2008], category: "tv",
    title: "Compañeros — Antena 3",
    ambient: "Compañeros era el drama adolescente del momento.",
    icon: "📺", region: "universal", timeOfDay: "evening", season: "any",
    emotionalTags: ["teenage", "drama", "evening", "universal"], intensity: 7,
  },

  // ── VIDEOJUEGOS ──────────────────────────────────────────────────
  {
    id: "g001", yearRange: [2003, 2007], category: "games",
    title: "PES — Pro Evolution Soccer",
    ambient: "El PES con los colegas. Había peleas de verdad por el mando.",
    icon: "🎮", region: "universal", timeOfDay: "afternoon", season: "any",
    emotionalTags: ["friends", "afternoon", "competitive", "energy"], intensity: 10,
  },
  {
    id: "g002", yearRange: [2004, 2006], category: "games",
    title: "GTA San Andreas — PS2",
    ambient: "GTA San Andreas. Lo tenía todo el mundo aunque no debía.",
    icon: "🎮", region: "universal", timeOfDay: "night", season: "any",
    emotionalTags: ["night", "teenage", "underground", "freedom"], intensity: 10,
  },
  {
    id: "g003", yearRange: [2003, 2005], category: "games",
    title: "GTA Vice City — PS2",
    ambient: "Vice City y su música ochentera. La radio del coche.",
    icon: "🎮", region: "universal", timeOfDay: "night", season: "any",
    emotionalTags: ["night", "teenage", "nostalgia_within_nostalgia", "freedom"], intensity: 9,
  },
  {
    id: "g004", yearRange: [2003, 2009], category: "games",
    title: "Counter-Strike — cyber café",
    ambient: "Counter-Strike en el cyber del barrio. Cafés con leche y tarde.",
    icon: "🎮", region: "universal", timeOfDay: "afternoon", season: "any",
    emotionalTags: ["friends", "afternoon", "competitive", "place"], intensity: 9,
  },
  {
    id: "g005", yearRange: [2005, 2008], category: "games",
    title: "Need for Speed — Most Wanted",
    ambient: "Need for Speed Most Wanted. Las carreras de noche.",
    icon: "🎮", region: "universal", timeOfDay: "night", season: "any",
    emotionalTags: ["night", "solitary", "speed", "teenage"], intensity: 8,
  },
  {
    id: "g006", yearRange: [2006, 2009], category: "games",
    title: "God of War — PS2",
    ambient: "God of War era para los que se quedaban solos por la noche.",
    icon: "🎮", region: "universal", timeOfDay: "late_night", season: "any",
    emotionalTags: ["night", "solitary", "intense", "late_night"], intensity: 7,
  },
  {
    id: "g007", yearRange: [2004, 2008], category: "games",
    title: "Football Manager — PC",
    ambient: "Football Manager te robaba las noches. Siempre una temporada más.",
    icon: "🎮", region: "universal", timeOfDay: "late_night", season: "any",
    emotionalTags: ["late_night", "solitary", "obsession", "routine"], intensity: 9,
  },
  {
    id: "g008", yearRange: [2000, 2004], category: "games",
    title: "Crash Bandicoot — PS1",
    ambient: "Crash Bandicoot en la PS1. Las tardes de sábado.",
    icon: "🎮", region: "universal", timeOfDay: "afternoon", season: "any",
    emotionalTags: ["afternoon", "childhood", "saturday", "comfort"], intensity: 8,
  },
  {
    id: "g009", yearRange: [2005, 2008], category: "games",
    title: "PSP en el colegio",
    ambient: "La PSP estaba prohibida pero todo el mundo la llevaba al recreo.",
    icon: "🎮", region: "universal", timeOfDay: "morning", season: "any",
    emotionalTags: ["school", "forbidden", "friends", "energy"], intensity: 9,
  },
  {
    id: "g010", yearRange: [2002, 2006], category: "games",
    title: "Championship Manager",
    ambient: "Championship Manager. El precursor de todo.",
    icon: "🎮", region: "universal", timeOfDay: "night", season: "any",
    emotionalTags: ["night", "obsession", "solitary", "late_night"], intensity: 7,
  },

  // ── INTERNET / TECNOLOGÍA ────────────────────────────────────────
  {
    id: "i001", yearRange: [2001, 2009], category: "internet",
    title: "MSN Messenger",
    ambient: "MSN Messenger. Esperabas que apareciera su nombre en verde.",
    icon: "🌐", region: "universal", timeOfDay: "night", season: "any",
    emotionalTags: ["night", "social", "waiting", "teenage", "intimate"], intensity: 10,
  },
  {
    id: "i002", yearRange: [2004, 2008], category: "internet",
    title: "Messenger Plus",
    ambient: "Messenger Plus con sus fondos animados y emoticonos de autor.",
    icon: "🌐", region: "universal", timeOfDay: "night", season: "any",
    emotionalTags: ["night", "social", "creative", "teenage"], intensity: 8,
  },
  {
    id: "i003", yearRange: [2002, 2008], category: "internet",
    title: "eMule",
    ambient: "eMule descargando toda la noche. Al día siguiente comprobabas si había terminado.",
    icon: "🌐", region: "universal", timeOfDay: "late_night", season: "any",
    emotionalTags: ["late_night", "patience", "underground", "solitary"], intensity: 9,
  },
  {
    id: "i004", yearRange: [2004, 2007], category: "internet",
    title: "Fotolog",
    ambient: "Fotolog. Una foto al día. Los comentarios eran lo que importaba.",
    icon: "🌐", region: "universal", timeOfDay: "afternoon", season: "any",
    emotionalTags: ["social", "teenage", "identity", "afternoon"], intensity: 9,
  },
  {
    id: "i005", yearRange: [2007, 2012], category: "internet",
    title: "Tuenti",
    ambient: "Tuenti era solo para españoles. Eso lo hacía especial.",
    icon: "🌐", region: "universal", timeOfDay: "night", season: "any",
    emotionalTags: ["social", "teenage", "identity", "night", "spain_only"], intensity: 10,
  },
  {
    id: "i006", yearRange: [2003, 2008], category: "internet",
    title: "Ares — descargas",
    ambient: "Ares para descargar música gratis. Las canciones tardaban horas.",
    icon: "🌐", region: "universal", timeOfDay: "night", season: "any",
    emotionalTags: ["night", "underground", "patience", "music"], intensity: 8,
  },
  {
    id: "i007", yearRange: [2000, 2005], category: "tech",
    title: "Módem 56k",
    ambient: "El pitido del 56k conectando. Esa sinfonía de madrugada.",
    icon: "📡", region: "universal", timeOfDay: "late_night", season: "any",
    emotionalTags: ["late_night", "ritual", "sound", "nostalgia"], intensity: 10,
  },
  {
    id: "i008", yearRange: [2002, 2006], category: "internet",
    title: "Foros del mediodía",
    ambient: "Los foros de la tarde. El subforo de música, el de fútbol.",
    icon: "🌐", region: "universal", timeOfDay: "afternoon", season: "any",
    emotionalTags: ["community", "afternoon", "identity", "teenage"], intensity: 7,
  },
  {
    id: "i009", yearRange: [2005, 2009], category: "internet",
    title: "YouTube primeros vídeos",
    ambient: "Los primeros vídeos de YouTube. Tardaban en cargar pero merecía la pena.",
    icon: "🌐", region: "universal", timeOfDay: "afternoon", season: "any",
    emotionalTags: ["discovery", "afternoon", "teenage", "energy"], intensity: 8,
  },
  {
    id: "i010", yearRange: [2004, 2007], category: "tech",
    title: "Nokia 3310 / 6600",
    ambient: "El Snake en el Nokia durante el recreo. Con el sonido en alto.",
    icon: "📱", region: "universal", timeOfDay: "morning", season: "any",
    emotionalTags: ["school", "friends", "morning", "simple"], intensity: 9,
  },
  {
    id: "i011", yearRange: [2001, 2006], category: "tech",
    title: "Politonos",
    ambient: "Los politonos por Bluetooth. Parabas a alguien en la calle para pedírselo.",
    icon: "📱", region: "universal", timeOfDay: "any", season: "any",
    emotionalTags: ["social", "music", "sharing", "teenage"], intensity: 8,
  },
  {
    id: "i012", yearRange: [2003, 2007], category: "internet",
    title: "Fotolog frases",
    ambient: "Frases de canciones como estado del Messenger. La vida entera en 200 caracteres.",
    icon: "🌐", region: "universal", timeOfDay: "night", season: "any",
    emotionalTags: ["night", "identity", "teenage", "emotional"], intensity: 9,
  },

  // ── ESCUELA / VIDA ───────────────────────────────────────────────
  {
    id: "s001", yearRange: [2000, 2010], category: "school",
    title: "El recreo",
    ambient: "El recreo con el bocadillo de jamón en papel de aluminio.",
    icon: "🏫", region: "universal", timeOfDay: "morning", season: "any",
    emotionalTags: ["school", "friends", "morning", "simple", "childhood"], intensity: 8,
  },
  {
    id: "s002", yearRange: [2000, 2008], category: "school",
    title: "El chándal del cole",
    ambient: "El chándal del colegio. Los miércoles de deportes.",
    icon: "🏫", region: "universal", timeOfDay: "morning", season: "any",
    emotionalTags: ["school", "uniform", "childhood", "routine"], intensity: 7,
  },
  {
    id: "s003", yearRange: [2000, 2008], category: "life",
    title: "Tarde de verano sin planes",
    ambient: "Las tardes de agosto sin nada que hacer. El ventilador de techo girando.",
    icon: "☀️", region: "south_spain", timeOfDay: "afternoon", season: "summer",
    emotionalTags: ["summer", "boredom", "intimate", "south_spain", "warm"], intensity: 10,
  },
  {
    id: "s004", yearRange: [2000, 2010], category: "life",
    title: "Verano y persiana",
    ambient: "La persiana a medio bajar. El calor y la penumbra del cuarto en verano.",
    icon: "☀️", region: "south_spain", timeOfDay: "afternoon", season: "summer",
    emotionalTags: ["summer", "south_spain", "intimate", "sensory", "warm"], intensity: 10,
  },
  {
    id: "s005", yearRange: [2003, 2008], category: "life",
    title: "CDs grabados",
    ambient: "CDs grabados con nombre en rotulador. La biblioteca de música pirata.",
    icon: "💿", region: "universal", timeOfDay: "any", season: "any",
    emotionalTags: ["music", "sharing", "physical", "nostalgia"], intensity: 8,
  },
  {
    id: "s006", yearRange: [2000, 2008], category: "life",
    title: "Revista SuperJuegos / Hobby Consolas",
    ambient: "La SuperJuegos en el quiosco. Los pósters de los juegos en la pared.",
    icon: "🏫", region: "universal", timeOfDay: "afternoon", season: "any",
    emotionalTags: ["games", "physical", "childhood", "afternoon"], intensity: 8,
  },
  {
    id: "s007", yearRange: [2000, 2010], category: "life",
    title: "Bocadillo de mortadela",
    ambient: "Merienda. Bocadillo de mortadela y los deberes encima de la mesa.",
    icon: "🏫", region: "universal", timeOfDay: "afternoon", season: "any",
    emotionalTags: ["routine", "afternoon", "school", "comfort"], intensity: 7,
  },
  {
    id: "s008", yearRange: [2001, 2007], category: "life",
    title: "Cyber café del barrio",
    ambient: "El cyber del barrio. Una hora por 1 euro. CS y sillas giratorias.",
    icon: "🌐", region: "universal", timeOfDay: "afternoon", season: "any",
    emotionalTags: ["place", "friends", "games", "afternoon", "community"], intensity: 9,
  },

  // ── DEPORTES ─────────────────────────────────────────────────────
  {
    id: "sp001", yearRange: [2006, 2006], category: "sports",
    title: "Mundial 2006 — Alemania",
    ambient: "El Mundial de Alemania 2006. España llegó lejos y todo el mundo lo siguió.",
    icon: "⚽", region: "universal", timeOfDay: "evening", season: "summer",
    emotionalTags: ["summer", "collective", "energy", "hope"], intensity: 9,
  },
  {
    id: "sp002", yearRange: [2010, 2010], category: "sports",
    title: "España campeón del Mundo",
    ambient: "El gol de Iniesta. Esa noche toda España salió a la calle.",
    icon: "⚽", region: "universal", timeOfDay: "night", season: "summer",
    emotionalTags: ["collective", "joy", "night", "historic", "summer"], intensity: 10,
  },
  {
    id: "sp003", yearRange: [2003, 2009], category: "sports",
    title: "El Barça de Ronaldinho",
    ambient: "El Barça de Ronaldinho. Ese waka-waka antes del waka-waka.",
    icon: "⚽", region: "catalonia", timeOfDay: "evening", season: "any",
    emotionalTags: ["joy", "skill", "collective", "evening"], intensity: 9,
  },

  // ── ANUNCIOS ─────────────────────────────────────────────────────
  {
    id: "a001", yearRange: [2000, 2008], category: "ads",
    title: "Cola Cao",
    ambient: "El anuncio de Cola Cao. Te lo sabes de memoria.",
    icon: "📺", region: "universal", timeOfDay: "morning", season: "any",
    emotionalTags: ["morning", "ritual", "comfort", "childhood"], intensity: 7,
  },
  {
    id: "a002", yearRange: [2003, 2007], category: "ads",
    title: "Sunny Delight",
    ambient: "Sunny Delight en el anuncio. Todo el mundo lo quería ese verano.",
    icon: "📺", region: "universal", timeOfDay: "afternoon", season: "summer",
    emotionalTags: ["summer", "childhood", "advertising", "nostalgia"], intensity: 7,
  },
  {
    id: "a003", yearRange: [2004, 2008], category: "ads",
    title: "Anuncio de Axe",
    ambient: "Los anuncios de Axe en Telecinco. Demasiado tarde para tu edad.",
    icon: "📺", region: "universal", timeOfDay: "night", season: "any",
    emotionalTags: ["humor", "teenage", "night", "tv"], intensity: 6,
  },
];

// ── Nostalgia Packs ───────────────────────────────────────────────
export interface NostalgiaPack {
  id: string;
  name: string;
  description: string;
  yearRange: [number, number];
  region: Region;
  season: Season;
  timeOfDay: TimeOfDay;
  coreMemoryIds: string[];
  ambientDimensions: Record<string, string>;
}

export const NOSTALGIA_PACKS: NostalgiaPack[] = [
  {
    id: "spanish_summer_2004",
    name: "Verano Español 2004",
    description: "Calor, persiana bajada, merienda con Dragon Ball de fondo.",
    yearRange: [2003, 2005], region: "south_spain", season: "summer", timeOfDay: "afternoon",
    coreMemoryIds: ["tv007", "s003", "s004", "m005", "g001"],
    ambientDimensions: { lighting: "warm_lamp_glow", weather: "hot_sun", internet: "dial_up" },
  },
  {
    id: "msn_teenager_2007",
    name: "MSN Teenager 2007",
    description: "Madrugada, Messenger abierto, frases de canciones como estado.",
    yearRange: [2006, 2008], region: "universal", season: "any", timeOfDay: "late_night",
    coreMemoryIds: ["i001", "i002", "i012", "m001", "tv006"],
    ambientDimensions: { lighting: "cold_blue_monitor", weather: "indoor_night", internet: "broadband" },
  },
  {
    id: "cyber_cafe_2003",
    name: "Cyber Café 2003",
    description: "CS en el cyber del barrio. Sillas giratorias, sudor y gritos.",
    yearRange: [2002, 2004], region: "universal", season: "any", timeOfDay: "afternoon",
    coreMemoryIds: ["g004", "i007", "s008", "i006"],
    ambientDimensions: { lighting: "fluorescent", weather: "indoor", internet: "early_broadband" },
  },
  {
    id: "tuenti_era_2009",
    name: "Era Tuenti 2009",
    description: "Tuenti, iPhone imposible, Fútbol Manager y El Internado.",
    yearRange: [2008, 2010], region: "universal", season: "any", timeOfDay: "night",
    coreMemoryIds: ["i005", "tv006", "g007", "m007"],
    ambientDimensions: { lighting: "mixed_ambient", weather: "indoor_night", internet: "broadband" },
  },
  {
    id: "ps2_football_nights",
    name: "Noches de PS2",
    description: "PES, GTA y los colegas. Las noches de fútbol virtual.",
    yearRange: [2003, 2007], region: "universal", season: "any", timeOfDay: "night",
    coreMemoryIds: ["g001", "g002", "g003", "i001"],
    ambientDimensions: { lighting: "crt_amber", weather: "indoor_night", internet: "dial_up" },
  },
  {
    id: "emo_bedroom_2006",
    name: "Habitación Emo 2006",
    description: "Linkin Park, Fotolog, fondo negro y sentimientos a flor de piel.",
    yearRange: [2005, 2007], region: "universal", season: "any", timeOfDay: "late_night",
    coreMemoryIds: ["i004", "i012", "i003", "m001"],
    ambientDimensions: { lighting: "darkness_screen", weather: "indoor_night", internet: "broadband" },
  },
  {
    id: "latin_messenger_nights",
    name: "Noches de Messenger Latino",
    description: "Reggaeton, emoticonos de MSN y conversaciones sin fin.",
    yearRange: [2005, 2009], region: "south_spain", season: "summer", timeOfDay: "late_night",
    coreMemoryIds: ["i001", "i002", "i011", "m002"],
    ambientDimensions: { lighting: "cold_blue_monitor", weather: "hot_summer_night", internet: "broadband" },
  },
];
