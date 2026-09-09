/**
 * interventions.js
 * ------------------------------------------------------------------
 * Client-side search + type filtering over the currently loaded
 * intervention list. Does not re-fetch from the database — it
 * filters the in-memory array already pulled for the selected
 * watershed, and needs the impact status per intervention (computed
 * from satellite/lulc data) to support the Status column/filter.
 * ------------------------------------------------------------------
 */

const Interventions = (() => {

  /**
   * @param {Array} interventions - raw intervention rows for the watershed
   * @param {Object} statusById - map of intervention_id -> impact status string
   * @param {string} searchTerm
   * @param {string} typeFilter - 'All Types' or a specific intervention_type
   * @returns {Array} filtered interventions (each augmented with .status)
   */
  function filter(interventions, statusById, searchTerm, typeFilter) {
    const term = (searchTerm || '').trim().toLowerCase();

    return interventions
      .map(iv => ({ ...iv, status: statusById[iv.intervention_id] || null }))
      .filter(iv => {
        const matchesType = !typeFilter || typeFilter === 'All Types' || iv.intervention_type === typeFilter;
        const matchesSearch = !term ||
          iv.intervention_id.toLowerCase().includes(term) ||
          iv.name.toLowerCase().includes(term) ||
          iv.intervention_type.toLowerCase().includes(term);
        return matchesType && matchesSearch;
      });
  }

  function distinctTypes(interventions) {
    return [...new Set(interventions.map(i => i.intervention_type))].sort();
  }

  function summarize(statusList) {
    const summary = { total: statusList.length, IMPROVED: 0, UNCHANGED: 0, 'NEEDS ATTENTION': 0 };
    statusList.forEach(s => { if (summary[s] !== undefined) summary[s]++; });
    return summary;
  }

  return { filter, distinctTypes, summarize };
})();
