/**
 * app.js
 * ------------------------------------------------------------------
 * Orchestration layer. Holds the app's current state, wires up event
 * listeners, and calls into DB / Map / UI / Charts / Impact. No
 * Supabase- or Leaflet-specific code should live here directly.
 * ------------------------------------------------------------------
 */

(function () {

  const state = {
    watersheds: [],
    selectedWatershedId: null,
    interventions: [],       // raw list for selected watershed
    statusById: {},          // intervention_id -> impact status (computed once per watershed load)
    selectedInterventionId: null,
    searchTerm: '',
    typeFilter: 'All Types'
  };

  async function init() {
    UI.setDemoBanner(CONFIG.USE_DEMO_DATA);
    document.getElementById('appName').textContent = CONFIG.APP_NAME;
    document.getElementById('appTagline').textContent = CONFIG.APP_TAGLINE;

    WSMap.init('map', onMarkerClicked);
    bindGlobalControls();

    await loadWatersheds();
  }

  function bindGlobalControls() {
    document.getElementById('sidebarToggle').addEventListener('click', UI.toggleSidebar);
    document.getElementById('detailsCloseBtn').addEventListener('click', UI.closeDetailsPanel);

    document.getElementById('watershedSelect').addEventListener('change', (e) => {
      selectWatershed(e.target.value);
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
      state.searchTerm = e.target.value;
      renderList();
    });

    document.getElementById('typeFilter').addEventListener('change', (e) => {
      state.typeFilter = e.target.value;
      renderList();
    });

    document.getElementById('interventionListBody').addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-view');
      const row = e.target.closest('tr[data-id]');
      const id = (btn && btn.dataset.id) || (row && row.dataset.id);
      if (id) selectIntervention(id);
    });
  }

  async function loadWatersheds() {
    const listEl = 'mapPanel';
    const { data, error } = await DB.getWatersheds();
    if (error) { UI.showError(listEl, error); return; }
    if (!data || data.length === 0) { UI.showEmpty(listEl, 'No watersheds configured yet.'); return; }

    state.watersheds = data;
    UI.renderWatershedOptions(data, data[0].watershed_id);
    await selectWatershed(data[0].watershed_id);
  }

  async function selectWatershed(watershedId) {
    state.selectedWatershedId = watershedId;
    state.selectedInterventionId = null;
    state.searchTerm = '';
    document.getElementById('searchInput').value = '';
    UI.renderDetailsPlaceholder();
    UI.closeDetailsPanel();

    document.getElementById('interventionListBody').innerHTML =
      `<tr><td colspan="4" class="table-empty">Loading interventions…</td></tr>`;

    const [watershedRes, interventionsRes] = await Promise.all([
      DB.getWatershedById(watershedId),
      DB.getInterventionsByWatershed(watershedId)
    ]);

    // Bail out if the user has since switched to a different watershed —
    // otherwise these stale results would overwrite the newer selection.
    if (state.selectedWatershedId !== watershedId) return;

    if (watershedRes.error) { console.error(watershedRes.error); }
    if (watershedRes.data) {
      WSMap.setBoundary(watershedRes.data.geometry, watershedRes.data.watershed_name);
    }

    if (interventionsRes.error) {
      document.getElementById('interventionListBody').innerHTML =
        `<tr><td colspan="4" class="table-empty">Unable to load interventions: ${UI.escapeHtml(interventionsRes.error)}</td></tr>`;
      return;
    }

    state.interventions = interventionsRes.data || [];
    UI.renderTypeFilterOptions(Interventions.distinctTypes(state.interventions));
    state.typeFilter = 'All Types';
    document.getElementById('typeFilter').value = 'All Types';

    // Compute impact status for every intervention up front so the list
    // and summary cards can show it without a click.
    await computeAllStatuses(watershedId);
    if (state.selectedWatershedId !== watershedId) return; // stale by now, ignore

    WSMap.setInterventions(state.interventions, null);
    renderList();
    renderSummary();
  }

  async function computeAllStatuses(watershedId) {
    const statusById = {};
    await Promise.all(state.interventions.map(async (iv) => {
      const [sat, lulc] = await Promise.all([
        DB.getSatelliteAnalysis(iv.intervention_id),
        DB.getLulcAnalysis(iv.intervention_id)
      ]);
      const result = IMPACT.assess(sat.data, lulc.data);
      statusById[iv.intervention_id] = result.status;
    }));
    // Only commit if this is still the currently-selected watershed.
    if (state.selectedWatershedId === watershedId) {
      state.statusById = statusById;
    }
  }

  function renderList() {
    const filtered = Interventions.filter(state.interventions, state.statusById, state.searchTerm, state.typeFilter);
    UI.renderInterventionList(filtered, state.selectedInterventionId);
  }

  function renderSummary() {
    const statusList = state.interventions.map(iv => state.statusById[iv.intervention_id]).filter(Boolean);
    const summary = Interventions.summarize(statusList);
    // "total" should reflect all interventions in the watershed, not only those with a resolvable status.
    summary.total = state.interventions.length;
    UI.renderSummaryCards(summary);
  }

  function onMarkerClicked(interventionId) {
    selectIntervention(interventionId);
  }

  async function selectIntervention(interventionId) {
    state.selectedInterventionId = interventionId;
    renderList();
    WSMap.highlightSelected(interventionId, state.interventions);
    UI.openDetailsPanel();

    UI.showLoading('detailsPanelBody', 'Loading intervention details…');
    const { data, error } = await DB.getImpactData(interventionId);

    // Bail out if the user has since selected a different intervention —
    // otherwise these stale results would overwrite the newer selection.
    if (state.selectedInterventionId !== interventionId) return;

    if (error) {
      UI.showError('detailsPanelBody', error);
      return;
    }
    if (!data || !data.intervention) {
      UI.showEmpty('detailsPanelBody', 'No details found for this intervention.');
      return;
    }

    const impactResult = IMPACT.assess(data.satellite, data.lulc);
    UI.renderDetails(data, impactResult);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
