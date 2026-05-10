// ============================================================
// 23:47 — Temporal World Engine
// España 2000-2010 · Contexto histórico por año
// ============================================================

export interface YearContext {
  year: number;
  musicChart: string[];        // top canciones del año
  gameOfYear: string[];        // juegos estrella
  tvHit: string[];             // series/programas dominantes
  internetTrend: string[];     // lo que todos hacían online
  news: string[];              // 1-2 hechos culturales/sociales
  slang: string[];             // expresiones del momento
  technology: string[];        // tech dominante del año
  southSpain?: Partial<Omit<YearContext, "year" | "southSpain">>;
}

export const TEMPORAL_WORLD: Record<number, YearContext> = {
  2000: {
    year: 2000,
    musicChart: ["Alejandro Sanz - \"Corazón partío\"", "Ricky Martin - \"Livin' la vida loca\"", "Enrique Iglesias - \"Bailamos\""],
    gameOfYear: ["The Sims", "Diablo II", "Counter-Strike beta"],
    tvHit: ["Gran Hermano (primera edición)", "Los Simpson en Antena 3", "Médico de familia"],
    internetTrend: ["IRC", "Napster", "primeros foros españoles"],
    news: ["Primer Gran Hermano de España", "El Y2K no pasó nada"],
    slang: ["¡Tío!", "¿Qué pasa?", "molar"],
    technology: ["Módem 56k", "Walkman/CD portátil", "primeras cámaras digitales baratas"],
    southSpain: {
      musicChart: ["Ketama", "Camarón compilaciones", "Fondo Flamenco primeros pasos"],
    },
  },
  2001: {
    year: 2001,
    musicChart: ["El Canto del Loco - debut", "David Bisbal - \"Ave María\"", "Amaral - \"Moriría por vos\""],
    gameOfYear: ["GTA III (PS2)", "Pokémon Cristal", "Halo (Xbox)"],
    tvHit: ["Operación Triunfo (primera edición)", "Los Serrano inicio", "Shin Chan en Antena 3"],
    internetTrend: ["eMule lanzamiento", "primeros MP3 masivos", "Kazaa"],
    news: ["OT revoluciona España", "11-S cambia el mundo"],
    slang: ["¡Tronco!", "¿Qué rayos?", "guay del Paraguay"],
    technology: ["PlayStation 2 masiva", "primeros DVDs en casa", "Nokia 3310 por todas partes"],
  },
  2002: {
    year: 2002,
    musicChart: ["David Bisbal - \"Bulería\"", "Estopa - \"Tu calorro\"", "OT: Operación Triunfo soundtrack"],
    gameOfYear: ["GTA Vice City", "Kingdom Hearts", "Mortal Kombat: Deadly Alliance"],
    tvHit: ["OT segunda edición", "Aquí no hay quien viva inicio", "7 Vidas"],
    internetTrend: ["eMule dominante", "primeros blogs en español", "ICQ vs Messenger"],
    news: ["España en los octavos del Mundial Corea-Japón", "El euro llega a los bolsillos"],
    slang: ["¿Qué me estás contando?", "de la hostia", "flipar"],
    technology: ["MSN Messenger 4.7", "móvil con cámara empieza", "MP3 players baratos"],
  },
  2003: {
    year: 2003,
    musicChart: ["Fondo Flamenco - álbum debut", "Melendi - primer álbum", "Los Delinqüentes"],
    gameOfYear: ["GTA Vice City (PC)", "Prince of Persia: Sands of Time", "Call of Duty"],
    tvHit: ["Los Serrano", "Aquí no hay quien viva", "Shin Chan sigue fuerte"],
    internetTrend: ["Messenger Plus", "emoticonos animados MSN", "primeros Fotologs"],
    news: ["Guerra de Iraq, España apoya", "Huelga general en España"],
    slang: ["pasársela bomba", "¡Ostras!", "¿Tío, qué te pasa?"],
    technology: ["MSN Messenger 6", "primer iPhone no existe aún", "PS2 en su pico"],
    southSpain: {
      musicChart: ["Fondo Flamenco en cada terraza", "Estopa en los chiringuitos"],
    },
  },
  2004: {
    year: 2004,
    musicChart: ["El Canto del Loco - \"Bésame\"", "Pereza - primeros álbumes", "Melendi - \"Caminando por la vida\""],
    gameOfYear: ["GTA San Andreas", "Half-Life 2", "Need for Speed Underground 2"],
    tvHit: ["El internado empieza a gestarse", "Aquí no hay quien viva temporadas finales", "Lost llega a España"],
    internetTrend: ["Fotolog España boom", "Hi5 aparece", "eMule en cada PC familiar"],
    news: ["11-M en Madrid", "España gana la Eurocopa 2004 no (pierde)", "Zapatero gana las elecciones"],
    slang: ["¡Manda huevos!", "En serio tío", "pasármela pipa"],
    technology: ["Nokia 6600 con cámara de fotos", "PSP anuncia lanzamiento", "pen drives primeros"],
  },
  2005: {
    year: 2005,
    musicChart: ["El Canto del Loco - \"La da da da\"", "Estopa - veranos", "Fondo Flamenco sur"],
    gameOfYear: ["GTA San Andreas (PC)", "God of War", "PES 5", "Need for Speed Most Wanted"],
    tvHit: ["Los Serrano apogeo", "Perdidos (Lost) en España", "Hermano Mayor inicio"],
    internetTrend: ["YouTube lanzamiento", "MySpace llega a España", "Ares para música"],
    news: ["PSP llega a España", "boda del Príncipe Felipe", "primer iPod nano"],
    slang: ["¿Qué tal tronco?", "de pm", "petarlo"],
    technology: ["PSP en el recreo del colegio", "iPod mini masivo", "portátiles empiezan a bajar de precio"],
  },
  2006: {
    year: 2006,
    musicChart: ["Melendi - \"Un alumno más\"", "Pereza - \"Princesas\"", "Fondo Flamenco verano"],
    gameOfYear: ["PES 6", "Gears of War", "Guitar Hero II"],
    tvHit: ["El Internado primera temporada", "\"Sé lo que hicisteis\" en La Sexta", "Aquí no hay quien viva finale"],
    internetTrend: ["YouTube España boom", "Tuenti primeros pasos", "Fotolog vs MySpace"],
    news: ["Mundial Alemania 2006", "PSP pirateada con homebrew", "Pluto deja de ser planeta"],
    slang: ["¡Qué fuerte tío!", "petarlo", "estar de bajón"],
    technology: ["PSP pirateada masiva", "Wii y PS3 anuncio", "primeros smartphones caros"],
    southSpain: {
      musicChart: ["Fondo Flamenco verano inescapable", "Estopa en fiestas del pueblo"],
      news: ["Mundial en cada terraza andaluza"],
    },
  },
  2007: {
    year: 2007,
    musicChart: ["Melendi - hits continuos", "El Canto del Loco - últimos años", "Pereza ascenso"],
    gameOfYear: ["Halo 3", "PES 2008", "Call of Duty 4"],
    tvHit: ["El Internado segunda temporada", "Física o Química empieza", "Gran Hermano ediciones"],
    internetTrend: ["Tuenti boom España", "Facebook llega a España", "Twitter lanzamiento global"],
    news: ["iPhone primer lanzamiento (solo EEUU)", "Tuenti se convierte en fenómeno nacional"],
    slang: ["¿estás en el Tuenti?", "petarse", "de pm"],
    technology: ["Tuenti masivo", "iPhone existe pero no en España", "Wii en hogares españoles"],
  },
  2008: {
    year: 2008,
    musicChart: ["Estopa - álbumes nuevos", "Melendi consolidado", "nuevo pop español"],
    gameOfYear: ["GTA IV", "PES 2009", "FIFA 09", "Metal Gear Solid 4"],
    tvHit: ["El Internado tercera temporada", "Física o Química primera temporada", "Homeland no existe aún"],
    internetTrend: ["Tuenti dominante en España", "Facebook empieza a crecer", "Spotify lanzamiento (solo Suecia)"],
    news: ["Eurocopa 2008 — España campeona", "Crisis financiera global empieza"],
    slang: ["¡Campeones!", "estar en el Tuenti", "subir una foto al Tuenti"],
    technology: ["iPhone 3G llega a España", "primer Android", "netbooks baratos"],
    southSpain: {
      news: ["Eurocopa — celebraciones en cada pueblo del sur"],
    },
  },
  2009: {
    year: 2009,
    musicChart: ["Estopa - verano", "Melendi late years", "pop español consolidado"],
    gameOfYear: ["Uncharted 2", "Assassin's Creed II", "PES 2010", "Left 4 Dead"],
    tvHit: ["El Internado temporadas finales", "Física o Química segunda temporada", "Fringe España"],
    internetTrend: ["Tuenti en su apogeo", "Twitter empieza en España", "YouTube HD"],
    news: ["Michael Jackson muere", "Avatar en cines", "gripe A alarma"],
    slang: ["tuitear", "¿Estás en Twitter?", "petarlo"],
    technology: ["iPhone 3GS", "Android crece", "portátiles netbook en aulas"],
  },
  2010: {
    year: 2010,
    musicChart: ["Fondo Flamenco último verano clásico", "pop español nuevo", "Rihanna dominante global"],
    gameOfYear: ["Red Dead Redemption", "God of War III", "Call of Duty: Black Ops", "PES 2011"],
    tvHit: ["El Internado finale", "Física o Química temporadas intermedias", "Breaking Bad llega a España"],
    internetTrend: ["Instagram lanzamiento", "Tuenti empieza a declinar", "WhatsApp primeros pasos"],
    news: ["España Campeona del Mundo 🏆", "iPad primer lanzamiento", "crisis económica España"],
    slang: ["¡Iniesta!", "La roja", "subir foto al tuenti"],
    technology: ["iPad primer lanzamiento", "WhatsApp primeros usuarios", "iPhone 4"],
    southSpain: {
      news: ["Final del Mundial — toda Andalucía en la calle esa noche"],
    },
  },
};

export function getYearContext(year: number, region?: string): YearContext {
  const clampedYear = Math.max(2000, Math.min(2010, year));
  const ctx = TEMPORAL_WORLD[clampedYear] ?? TEMPORAL_WORLD[2005];
  if (region === "south_spain" && ctx.southSpain) {
    return {
      ...ctx,
      musicChart: ctx.southSpain.musicChart ?? ctx.musicChart,
      news: ctx.southSpain.news ?? ctx.news,
    };
  }
  return ctx;
}

export function buildTemporalContextString(year: number, region?: string): string {
  const ctx = getYearContext(year, region);
  const parts: string[] = [
    `España ${ctx.year}.`,
    `Música del momento: ${ctx.musicChart.slice(0, 2).join(", ")}.`,
    `Juegos: ${ctx.gameOfYear.slice(0, 2).join(", ")}.`,
    `En la tele: ${ctx.tvHit.slice(0, 2).join(", ")}.`,
    `Internet: ${ctx.internetTrend.slice(0, 2).join(", ")}.`,
    ctx.news.length > 0 ? `Contexto: ${ctx.news[0]}.` : "",
    `Tecnología cotidiana: ${ctx.technology.slice(0, 2).join(", ")}.`,
  ];
  return parts.filter(Boolean).join(" ");
}
