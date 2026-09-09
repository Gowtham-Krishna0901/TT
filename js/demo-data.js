/**
 * demo-data.js
 * ------------------------------------------------------------------
 * CLEARLY LABELLED DEMONSTRATION DATA — not real Sentinel-2 imagery,
 * not real NDVI/NDWI/LULC measurements, not real field photos.
 *
 * Every row here mirrors the exact shape of the Supabase tables in
 * supabase/schema.sql (same column names, same types). database.js
 * reads from this object when CONFIG.USE_DEMO_DATA is true, and from
 * Supabase when it's false — the rest of the app cannot tell the
 * difference. That's the whole point: this file can be deleted
 * outright once real team data is loaded into Supabase.
 *
 * Satellite/field images below point at placehold.co placeholder
 * images, clearly labelled "(DEMO)", NOT real Sentinel-2 tiles or
 * real field photos.
 * ------------------------------------------------------------------
 */

const DEMO_DATA = (() => {

  const placeholderSat = (label, before) =>
    `https://placehold.co/640x480/${before ? '3a2c17/f3e4c8' : '13341f/d6f0df'}?text=${encodeURIComponent(label)}`;

  const placeholderPhoto = (label) =>
    `https://placehold.co/640x480/2e4a3d/ffffff?text=${encodeURIComponent(label)}`;

  const watersheds = [
    {
      watershed_id: 'W001',
      watershed_name: 'Kollimalai Watershed',
      state: 'Tamil Nadu',
      district: 'Namakkal',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [78.28, 11.38], [78.34, 11.35], [78.42, 11.37], [78.44, 11.44],
          [78.40, 11.49], [78.32, 11.48], [78.27, 11.44], [78.28, 11.38]
        ]]
      },
      created_at: '2024-01-10T00:00:00Z'
    },
    {
      watershed_id: 'W002',
      watershed_name: 'Vellar Sub-Basin',
      state: 'Tamil Nadu',
      district: 'Villupuram',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [79.14, 11.56], [79.22, 11.54], [79.28, 11.58], [79.29, 11.65],
          [79.24, 11.69], [79.16, 11.67], [79.12, 11.62], [79.14, 11.56]
        ]]
      },
      created_at: '2024-02-02T00:00:00Z'
    }
  ];

  const interventions = [
    { intervention_id: 'CD001', watershed_id: 'W001', name: 'Melur Check Dam',        intervention_type: 'Check Dam',        latitude: 11.4205, longitude: 78.3480, created_at: '2022-06-01T00:00:00Z' },
    { intervention_id: 'CD002', watershed_id: 'W001', name: 'Semmedu Check Dam',      intervention_type: 'Check Dam',        latitude: 11.4420, longitude: 78.3610, created_at: '2022-08-14T00:00:00Z' },
    { intervention_id: 'PT001', watershed_id: 'W001', name: 'Alathur Percolation Tank', intervention_type: 'Percolation Tank', latitude: 11.4030, longitude: 78.3305, created_at: '2020-11-20T00:00:00Z' },
    { intervention_id: 'CB001', watershed_id: 'W001', name: 'Kolli Ridge Contour Bund', intervention_type: 'Contour Bund',    latitude: 11.4610, longitude: 78.3720, created_at: '2021-03-05T00:00:00Z' },
    { intervention_id: 'PD001', watershed_id: 'W001', name: 'Thoni Pond',             intervention_type: 'Pond',             latitude: 11.4350, longitude: 78.3210, created_at: '2023-09-18T00:00:00Z' },
    { intervention_id: 'CD003', watershed_id: 'W002', name: 'Kiliyanur Check Dam',    intervention_type: 'Check Dam',        latitude: 11.6120, longitude: 79.1850, created_at: '2022-01-22T00:00:00Z' },
    { intervention_id: 'PT002', watershed_id: 'W002', name: 'Sankarapuram Percolation Tank', intervention_type: 'Percolation Tank', latitude: 11.6480, longitude: 79.2210, created_at: '2021-07-09T00:00:00Z' }
  ];

  // Every value below is a fabricated DEMO figure for prototype display only.
  const satellite_analysis = [
    {
      intervention_id: 'CD001',
      before_date: '2021-03-15', after_date: '2024-04-20',
      before_image_url: placeholderSat('Sentinel-2 L2A Before (DEMO)', true),
      after_image_url: placeholderSat('Sentinel-2 L2A After (DEMO)', false),
      before_ndvi: 0.32, after_ndvi: 0.55, ndvi_change: 0.23,
      before_ndwi: 0.10, after_ndwi: 0.35, ndwi_change: 0.25
    },
    {
      intervention_id: 'CD002',
      before_date: '2021-04-02', after_date: '2024-04-20',
      before_image_url: placeholderSat('Sentinel-2 L2A Before (DEMO)', true),
      after_image_url: placeholderSat('Sentinel-2 L2A After (DEMO)', false),
      before_ndvi: 0.41, after_ndvi: 0.40, ndvi_change: -0.01,
      before_ndwi: 0.18, after_ndwi: 0.20, ndwi_change: 0.02
    },
    {
      intervention_id: 'PT001',
      before_date: '2020-12-01', after_date: '2024-04-18',
      before_image_url: placeholderSat('Sentinel-2 L2A Before (DEMO)', true),
      after_image_url: placeholderSat('Sentinel-2 L2A After (DEMO)', false),
      before_ndvi: 0.47, after_ndvi: 0.29, ndvi_change: -0.18,
      before_ndwi: 0.31, after_ndwi: 0.16, ndwi_change: -0.15
    },
    {
      intervention_id: 'CB001',
      before_date: '2021-03-20', after_date: '2024-04-22',
      before_image_url: placeholderSat('Sentinel-2 L2A Before (DEMO)', true),
      after_image_url: placeholderSat('Sentinel-2 L2A After (DEMO)', false),
      before_ndvi: 0.36, after_ndvi: 0.51, ndvi_change: 0.15,
      before_ndwi: 0.09, after_ndwi: 0.07, ndwi_change: -0.02
    },
    // PD001 intentionally has NO satellite_analysis row — exercises the
    // "no data yet" empty state in impact.js / ui.js.
    {
      intervention_id: 'CD003',
      before_date: '2022-02-10', after_date: '2024-03-30',
      before_image_url: placeholderSat('Sentinel-2 L2A Before (DEMO)', true),
      after_image_url: placeholderSat('Sentinel-2 L2A After (DEMO)', false),
      before_ndvi: 0.38, after_ndvi: 0.43, ndvi_change: 0.05,
      before_ndwi: 0.14, after_ndwi: 0.20, ndwi_change: 0.06
    },
    {
      intervention_id: 'PT002',
      before_date: '2021-08-05', after_date: '2024-03-30',
      before_image_url: placeholderSat('Sentinel-2 L2A Before (DEMO)', true),
      after_image_url: placeholderSat('Sentinel-2 L2A After (DEMO)', false),
      before_ndvi: 0.44, after_ndvi: 0.40, ndvi_change: -0.04,
      before_ndwi: 0.12, after_ndwi: 0.21, ndwi_change: 0.09
    }
  ];

  const lulc_analysis = [
    { intervention_id: 'CD001', before_vegetation: 28, after_vegetation: 39, before_water: 4,  after_water: 9,  before_agriculture: 42, after_agriculture: 38, before_builtup: 6,  after_builtup: 7,  before_bare_land: 20, after_bare_land: 7  },
    { intervention_id: 'CD002', before_vegetation: 34, after_vegetation: 33, before_water: 6,  after_water: 7,  before_agriculture: 40, after_agriculture: 41, before_builtup: 8,  after_builtup: 8,  before_bare_land: 12, after_bare_land: 11 },
    { intervention_id: 'PT001', before_vegetation: 37, after_vegetation: 26, before_water: 8,  after_water: 4,  before_agriculture: 35, after_agriculture: 34, before_builtup: 7,  after_builtup: 9,  before_bare_land: 13, after_bare_land: 27 },
    { intervention_id: 'CB001', before_vegetation: 30, after_vegetation: 41, before_water: 3,  after_water: 3,  before_agriculture: 44, after_agriculture: 40, before_builtup: 6,  after_builtup: 6,  before_bare_land: 17, after_bare_land: 10 },
    { intervention_id: 'CD003', before_vegetation: 31, after_vegetation: 33, before_water: 5,  after_water: 7,  before_agriculture: 41, after_agriculture: 40, before_builtup: 9,  after_builtup: 9,  before_bare_land: 14, after_bare_land: 11 },
    { intervention_id: 'PT002', before_vegetation: 33, after_vegetation: 31, before_water: 6,  after_water: 5,  before_agriculture: 38, after_agriculture: 37, before_builtup: 10, after_builtup: 12, before_bare_land: 13, after_bare_land: 15 }
    // PD001 intentionally has no lulc_analysis row either.
  ];

  const field_evidence = [
    { intervention_id: 'CD001', photo_url: placeholderPhoto('Field Photo (DEMO)'), photo_date: '2023-08-18', latitude: 11.4206, longitude: 78.3481, description: 'Check dam holding water well after monsoon; new growth on both banks.' },
    { intervention_id: 'CD001', photo_url: placeholderPhoto('Field Photo (DEMO)'), photo_date: '2024-01-05', latitude: 11.4204, longitude: 78.3479, description: 'Downstream field showing improved soil moisture.' },
    { intervention_id: 'PT001', photo_url: placeholderPhoto('Field Photo (DEMO)'), photo_date: '2023-11-02', latitude: 11.4031, longitude: 78.3306, description: 'Percolation tank silted up on the inlet side; recommend desilting before next monsoon.' },
    { intervention_id: 'CB001', photo_url: placeholderPhoto('Field Photo (DEMO)'), photo_date: '2023-07-22', latitude: 11.4611, longitude: 78.3721, description: 'Bund line intact; vegetation cover visibly denser than adjacent untreated slope.' },
    { intervention_id: 'CD003', photo_url: placeholderPhoto('Field Photo (DEMO)'), photo_date: '2023-10-11', latitude: 11.6121, longitude: 79.1851, description: 'Minor cracking on the spillway wing wall, otherwise stable.' }
    // CD002, PD001, PT002 intentionally have no field evidence yet —
    // exercises the "no field evidence photos uploaded yet" empty state.
  ];

  return { watersheds, interventions, satellite_analysis, lulc_analysis, field_evidence };
})();
