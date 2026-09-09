/**
 * config.js
 * ------------------------------------------------------------------
 * Single source of truth for app-wide settings. Nothing outside this
 * file should hardcode a Supabase credential, a map default, an
 * intervention color, or an impact threshold.
 *
 * TO GO LIVE WITH REAL DATA:
 *   1. Create a Supabase project, enable PostGIS, run supabase/schema.sql
 *      then supabase/seed.sql (or load your team's real rows instead).
 *   2. Fill in SUPABASE_URL and SUPABASE_ANON_KEY below (anon/public
 *      key only — never the service_role key).
 *   3. Set USE_DEMO_DATA to false.
 * That's the entire migration. No other file needs to change.
 * ------------------------------------------------------------------
 */

const CONFIG = {
  APP_NAME: 'WaterShed Monitor',
  APP_TAGLINE: 'Smart Watershed Monitoring System',

  // --- Data source -------------------------------------------------
  USE_DEMO_DATA: true,               // false => read from Supabase instead

  // --- Supabase (anon/public key only — safe to expose client-side) -
  SUPABASE_URL: 'https://tknbijlujridmztkuulp.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_w9SZthdAa3avUbLchfxb7Q_FpVJ6GNu',

  // --- Map defaults --------------------------------------------------
  MAP_DEFAULT_CENTER: [11.42, 78.35],   // Kolli Hills (Kollimalai), Tamil Nadu
  MAP_DEFAULT_ZOOM: 12,
  MAP_MIN_ZOOM: 6,
  MAP_MAX_ZOOM: 18,

  MAP_TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  MAP_TILE_ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',

  MAP_SATELLITE_TILE_URL: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  MAP_SATELLITE_ATTRIBUTION: 'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics',

  // --- Intervention marker/legend styling -----------------------------
  // Keyed on interventions.intervention_type. "Other" is the fallback
  // used for any type not listed here, so new types never crash the map.
  INTERVENTION_TYPES: {
    'Check Dam':         { color: '#1E8F5F' },
    'Pond':              { color: '#2E7EB0' },
    'Percolation Tank':  { color: '#C98A3B' },
    'Contour Bund':      { color: '#7B5EA7' },
    'Other':             { color: '#5B6B77' }
  },

  // --- Prototype rule-based impact assessment thresholds --------------
  // See js/impact.js for the algorithm. These are the ONLY numbers that
  // control it — retune here, not in impact.js.
  IMPACT_THRESHOLDS: {
    NDVI_NOCHANGE_BAND: 0.03,   // |ndvi_change| below this => "flat"
    NDWI_NOCHANGE_BAND: 0.03,   // |ndwi_change| below this => "flat"
    NDVI_STRONG: 0.10,          // |ndvi_change| at/above this wins a disagreement
    NDWI_STRONG: 0.10,          // |ndwi_change| at/above this wins a disagreement
    LULC_SUPPORT_BAND: 3        // combined veg+water % point change used as tie-break
  }
};
