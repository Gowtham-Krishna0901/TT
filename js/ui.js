/**
 * ui.js
 * ------------------------------------------------------------------
 * DOM rendering helpers. Keeps app.js focused on orchestration/state
 * and keeps markup generation in one place.
 * ------------------------------------------------------------------
 */

const UI = (() => {

  function el(id) { return document.getElementById(id); }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // ---------------------------------------------------------------
  // Generic async-state rendering: LOADING / ERROR / EMPTY / content
  // ---------------------------------------------------------------
  function showLoading(containerId, message = 'Loading…') {
    const c = el(containerId);
    if (!c) return;
    c.innerHTML = `
      <div class="state-block state-loading">
        <div class="spinner" aria-hidden="true"></div>
        <p>${escapeHtml(message)}</p>
      </div>`;
  }

  function showError(containerId, message = 'Something went wrong.') {
    const c = el(containerId);
    if (!c) return;
    c.innerHTML = `
      <div class="state-block state-error">
        <p class="state-title">Unable to load data</p>
        <p>${escapeHtml(message)}</p>
      </div>`;
  }

  function showEmpty(containerId, message = 'No records found.') {
    const c = el(containerId);
    if (!c) return;
    c.innerHTML = `
      <div class="state-block state-empty">
        <p>${escapeHtml(message)}</p>
      </div>`;
  }

  // ---------------------------------------------------------------
  // Watershed status summary cards
  // ---------------------------------------------------------------
  function renderSummaryCards(summary) {
    const c = el('summaryCards');
    if (!c) return;
    c.innerHTML = `
      <div class="summary-card card-improved">
        <span class="summary-label">Improved</span>
        <span class="summary-value">${summary.IMPROVED}</span>
      </div>
      <div class="summary-card card-unchanged">
        <span class="summary-label">Unchanged</span>
        <span class="summary-value">${summary.UNCHANGED}</span>
      </div>
      <div class="summary-card card-attention">
        <span class="summary-label">Needs Attention</span>
        <span class="summary-value">${summary['NEEDS ATTENTION']}</span>
      </div>
      <div class="summary-card card-total">
        <span class="summary-label">Total Interventions</span>
        <span class="summary-value">${summary.total}</span>
      </div>`;
  }

  // ---------------------------------------------------------------
  // Intervention list table
  // ---------------------------------------------------------------
  function renderInterventionList(interventions, selectedId) {
    const tbody = el('interventionListBody');
    if (!tbody) return;

    if (interventions.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="table-empty">No interventions match your search/filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = interventions.map(iv => {
      const meta = iv.status ? IMPACT.badgeMeta(iv.status) : { label: 'PENDING', className: 'badge-nodata' };
      const rowClass = iv.intervention_id === selectedId ? 'row-selected' : '';
      return `
        <tr class="${rowClass}" data-id="${escapeHtml(iv.intervention_id)}">
          <td>${escapeHtml(iv.intervention_id)}</td>
          <td>${escapeHtml(iv.intervention_type)}</td>
          <td><span class="badge ${meta.className}">${meta.label}</span></td>
          <td><button class="btn-view" data-id="${escapeHtml(iv.intervention_id)}">View</button></td>
        </tr>`;
    }).join('');
  }

  function renderTypeFilterOptions(types) {
    const sel = el('typeFilter');
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = `<option value="All Types">All Types</option>` +
      types.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
    if (types.includes(current)) sel.value = current;
  }

  function renderWatershedOptions(watersheds, selectedId) {
    const sel = el('watershedSelect');
    if (!sel) return;
    sel.innerHTML = watersheds.map(w =>
      `<option value="${escapeHtml(w.watershed_id)}" ${w.watershed_id === selectedId ? 'selected' : ''}>${escapeHtml(w.watershed_name)}</option>`
    ).join('');
  }

  // ---------------------------------------------------------------
  // Intervention details panel
  // ---------------------------------------------------------------
  function renderDetailsPlaceholder() {
    const c = el('detailsPanelBody');
    if (!c) return;
    c.innerHTML = `
      <div class="state-block state-empty details-placeholder">
        <p>Select an intervention on the map or in the list to view its full monitoring details.</p>
      </div>`;
    el('detailsPanelTitle').textContent = 'Intervention Details';
  }

  function renderDetails({ intervention, satellite, lulc, evidence }, impactResult) {
    el('detailsPanelTitle').textContent = `${intervention.intervention_type} (${intervention.intervention_id})`;

    const meta = impactResult.status ? IMPACT.badgeMeta(impactResult.status) : IMPACT.badgeMeta(null);

    const satelliteBlock = satellite ? `
      <div class="satellite-grid">
        <div class="sat-col">
          <p class="sat-label">Before &middot; ${formatDate(satellite.before_date)}</p>
          <img class="sat-img" src="${escapeHtml(satellite.before_image_url)}" alt="Before satellite image" loading="lazy">
        </div>
        <div class="sat-col">
          <p class="sat-label">After &middot; ${formatDate(satellite.after_date)}</p>
          <img class="sat-img" src="${escapeHtml(satellite.after_image_url)}" alt="After satellite image" loading="lazy">
        </div>
        <div class="sat-col sat-changes">
          <p class="sat-label">Change Detection</p>
          <table class="change-table">
            <tr><td>NDVI (Vegetation)</td><td class="${changeClass(satellite.ndvi_change)}">${IMPACT.formatSigned(satellite.ndvi_change)}</td></tr>
            <tr><td>NDWI (Water)</td><td class="${changeClass(satellite.ndwi_change)}">${IMPACT.formatSigned(satellite.ndwi_change)}</td></tr>
          </table>
        </div>
      </div>` : `<p class="muted">No satellite analysis available for this intervention yet.</p>`;

    const evidenceBlock = evidence && evidence.length ? `
      <div class="evidence-grid">
        ${evidence.map(ev => `
          <figure class="evidence-item">
            <img src="${escapeHtml(ev.photo_url)}" alt="Field evidence photo" loading="lazy">
            <figcaption>
              <span>${formatDate(ev.photo_date)}</span>
              <span class="muted-small">${ev.latitude != null ? ev.latitude.toFixed(4) + ', ' + ev.longitude.toFixed(4) : ''}</span>
              ${ev.description ? `<p>${escapeHtml(ev.description)}</p>` : ''}
            </figcaption>
          </figure>`).join('')}
      </div>` : `<p class="muted">No field evidence photos uploaded yet.</p>`;

    el('detailsPanelBody').innerHTML = `
      <section class="details-section">
        <h4>Intervention Details</h4>
        <dl class="detail-list">
          <div><dt>ID</dt><dd>${escapeHtml(intervention.intervention_id)}</dd></div>
          <div><dt>Type</dt><dd>${escapeHtml(intervention.intervention_type)}</dd></div>
          <div><dt>Name</dt><dd>${escapeHtml(intervention.name)}</dd></div>
          <div><dt>Location</dt><dd>${intervention.latitude.toFixed(5)}, ${intervention.longitude.toFixed(5)}</dd></div>
        </dl>
      </section>

      <section class="details-section">
        <h4>Satellite Analysis (Sentinel-2 L2A)</h4>
        ${satelliteBlock}
      </section>

      <section class="details-section">
        <h4>Indicator Graphs</h4>
        <div class="chart-grid">
          <div class="chart-box"><canvas id="chartNdvi"></canvas></div>
          <div class="chart-box"><canvas id="chartNdwi"></canvas></div>
          <div class="chart-box chart-box-wide"><canvas id="chartLulc"></canvas></div>
        </div>
      </section>

      <section class="details-section">
        <h4>Field Evidence</h4>
        ${evidenceBlock}
      </section>

      <section class="details-section impact-section">
        <h4>Overall Impact</h4>
        <div class="impact-row">
          <span class="badge badge-large ${meta.className}">${meta.symbol} ${meta.label}</span>
          <p class="impact-explanation">${escapeHtml(impactResult.explanation)}</p>
        </div>
        <p class="disclaimer">Prototype rule-based assessment — not a scientifically validated model. See js/impact.js.</p>
      </section>
    `;

    // Charts must be rendered after the canvases above exist in the DOM.
    Charts.renderNdvi('chartNdvi', satellite);
    Charts.renderNdwi('chartNdwi', satellite);
    Charts.renderLulc('chartLulc', lulc);
  }

  function changeClass(v) {
    if (v === null || v === undefined) return '';
    return v > 0 ? 'change-positive' : v < 0 ? 'change-negative' : 'change-neutral';
  }

  function setDemoBanner(isDemo) {
    const b = el('dataModeBanner');
    if (!b) return;
    b.style.display = isDemo ? 'flex' : 'none';
  }

  function closeDetailsPanel() {
    el('detailsPanel').classList.remove('open');
  }

  function openDetailsPanel() {
    el('detailsPanel').classList.add('open');
  }

  function toggleSidebar() {
    document.querySelector('.app-shell').classList.toggle('sidebar-collapsed');
  }

  return {
    el, escapeHtml, formatDate,
    showLoading, showError, showEmpty,
    renderSummaryCards, renderInterventionList, renderTypeFilterOptions, renderWatershedOptions,
    renderDetailsPlaceholder, renderDetails,
    setDemoBanner, closeDetailsPanel, openDetailsPanel, toggleSidebar
  };
})();
