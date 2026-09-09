/**
 * impact.js
 * ------------------------------------------------------------------
 * PROTOTYPE RULE-BASED IMPACT ASSESSMENT.
 * This is a simple, explainable, deterministic heuristic — NOT a
 * scientifically validated model. All thresholds live in
 * CONFIG.IMPACT_THRESHOLDS (js/config.js) so they can be retuned in
 * one place without touching this logic.
 *
 * Algorithm (in plain terms):
 *  1. Classify the NDVI change as "up" / "flat" / "down" using
 *     NDVI_NOCHANGE_BAND.
 *  2. Classify the NDWI change the same way using NDWI_NOCHANGE_BAND.
 *  3. If NDVI and NDWI agree (both up, both down, or both flat) ->
 *     that's the result.
 *  4. If they disagree, whichever one moved by a "strong" amount
 *     (NDVI_STRONG / NDWI_STRONG) wins the tie-break.
 *  5. If neither is strong, fall back to LULC as supporting evidence:
 *     a Vegetation+Water area gain/loss beyond LULC_SUPPORT_BAND tips
 *     the result toward IMPROVED / NEEDS_ATTENTION; otherwise UNCHANGED.
 * ------------------------------------------------------------------
 */

const IMPACT = (() => {

  const STATUS = {
    IMPROVED: 'IMPROVED',
    UNCHANGED: 'UNCHANGED',
    NEEDS_ATTENTION: 'NEEDS ATTENTION'
  };

  function directionOf(change, band) {
    if (change === null || change === undefined || Number.isNaN(change)) return null;
    if (change > band) return 'up';
    if (change < -band) return 'down';
    return 'flat';
  }

  /**
   * @param {object} satellite - row from satellite_analysis (may be null)
   * @param {object} lulc - row from lulc_analysis (may be null)
   * @returns {{status: string, explanation: string, hasData: boolean}}
   */
  function assess(satellite, lulc) {
    const T = CONFIG.IMPACT_THRESHOLDS;

    if (!satellite || satellite.ndvi_change === undefined) {
      return {
        status: null,
        hasData: false,
        explanation: 'No satellite analysis data available yet for this intervention.'
      };
    }

    const ndviDir = directionOf(satellite.ndvi_change, T.NDVI_NOCHANGE_BAND);
    const ndwiDir = directionOf(satellite.ndwi_change, T.NDWI_NOCHANGE_BAND);

    let status;
    let reason;

    if (ndviDir === ndwiDir) {
      // Both indicators agree
      status = ndviDir === 'up' ? STATUS.IMPROVED : ndviDir === 'down' ? STATUS.NEEDS_ATTENTION : STATUS.UNCHANGED;
      reason = `NDVI (${formatSigned(satellite.ndvi_change)}) and NDWI (${formatSigned(satellite.ndwi_change)}) both indicate ${describeDir(ndviDir)}.`;
    } else {
      // Indicators disagree — use whichever moved strongly
      const ndviStrong = Math.abs(satellite.ndvi_change) >= T.NDVI_STRONG;
      const ndwiStrong = Math.abs(satellite.ndwi_change) >= T.NDWI_STRONG;

      if (ndviStrong && !ndwiStrong) {
        status = ndviDir === 'up' ? STATUS.IMPROVED : STATUS.NEEDS_ATTENTION;
        reason = `NDVI showed a strong change (${formatSigned(satellite.ndvi_change)}), outweighing a smaller NDWI change (${formatSigned(satellite.ndwi_change)}).`;
      } else if (ndwiStrong && !ndviStrong) {
        status = ndwiDir === 'up' ? STATUS.IMPROVED : STATUS.NEEDS_ATTENTION;
        reason = `NDWI showed a strong change (${formatSigned(satellite.ndwi_change)}), outweighing a smaller NDVI change (${formatSigned(satellite.ndvi_change)}).`;
      } else {
        // Neither strong (or both strong but conflicting) — fall back to LULC
        const lulcSignal = lulcSupportSignal(lulc, T.LULC_SUPPORT_BAND);
        if (lulcSignal === 'up') {
          status = STATUS.IMPROVED;
          reason = `NDVI and NDWI changes were mixed and modest, but LULC shows a supporting gain in vegetation/water cover.`;
        } else if (lulcSignal === 'down') {
          status = STATUS.NEEDS_ATTENTION;
          reason = `NDVI and NDWI changes were mixed and modest, and LULC shows a supporting loss in vegetation/water cover.`;
        } else {
          status = STATUS.UNCHANGED;
          reason = `NDVI (${formatSigned(satellite.ndvi_change)}) and NDWI (${formatSigned(satellite.ndwi_change)}) changes were mixed and inconclusive.`;
        }
      }
    }

    return { status, hasData: true, explanation: reason };
  }

  function lulcSupportSignal(lulc, band) {
    if (!lulc) return 'flat';
    const vegChange = (lulc.after_vegetation ?? 0) - (lulc.before_vegetation ?? 0);
    const waterChange = (lulc.after_water ?? 0) - (lulc.before_water ?? 0);
    const combined = vegChange + waterChange;
    if (combined >= band) return 'up';
    if (combined <= -band) return 'down';
    return 'flat';
  }

  function describeDir(dir) {
    return dir === 'up' ? 'positive change' : dir === 'down' ? 'negative change' : 'no meaningful change';
  }

  function formatSigned(n) {
    if (n === null || n === undefined) return '—';
    return (n >= 0 ? '+' : '') + n.toFixed(2);
  }

  function badgeMeta(status) {
    switch (status) {
      case STATUS.IMPROVED:
        return { label: 'IMPROVED', className: 'badge-improved', symbol: '\u2713' };
      case STATUS.NEEDS_ATTENTION:
        return { label: 'NEEDS ATTENTION', className: 'badge-attention', symbol: '\u26A0' };
      case STATUS.UNCHANGED:
        return { label: 'UNCHANGED', className: 'badge-unchanged', symbol: '\u2192' };
      default:
        return { label: 'NO DATA', className: 'badge-nodata', symbol: '?' };
    }
  }

  return { STATUS, assess, badgeMeta, formatSigned };
})();
