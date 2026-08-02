import React from 'react';
import {
  computeExclusionBreakdown,
  computeHarmonyScore,
  computeResidentFriction,
  computeSmartUnlocker,
} from '../domain/analytics';
import type { DishVerdict } from '../domain/types';

interface AnalyticsPanelProps {
  verdicts: DishVerdict[];
  residents: string[];
  budget: number;
}

type TickKind = 'pass' | 'diet' | 'allergen' | 'budget';

/**
 * Allergen outranks diet outranks budget when a dish fails more than one
 * check — it's the one exclusion class residents cannot negotiate around.
 */
function dominantReason(verdict: DishVerdict): TickKind {
  if (verdict.compatible) return 'pass';
  if (verdict.reasons.some((r) => r.startsWith('ALLERGEN:'))) return 'allergen';
  if (verdict.reasons.some((r) => r.startsWith('DIET:'))) return 'diet';
  return 'budget';
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  verdicts,
  residents,
  budget,
}) => {
  const harmony = computeHarmonyScore(verdicts);
  const breakdown = computeExclusionBreakdown(verdicts);
  const frictionList = computeResidentFriction(verdicts, residents);
  const unlocker = computeSmartUnlocker(verdicts, budget);

  // Same three tokens the verdict matrix already uses for pass/block/over —
  // feast and high harmony both read as "pass" so status maps to a token
  // the rest of the board already carries meaning for.
  const statusToken = harmony.status === 'low' ? 'block' : harmony.status === 'moderate' ? 'over' : 'pass';

  const maxFriction = Math.max(1, ...frictionList.map((f) => f.rejectionCount));
  const bottleneck = frictionList[0] && frictionList[0].rejectionCount > 0 ? frictionList[0] : null;

  return (
    <div className="analytics-panel">
      {harmony.status === 'feast' && (
        <div className="feast-banner enter">
          <span className="feast-mark" aria-hidden="true">✓</span>
          <p>
            <strong>Universal Feast.</strong> All {harmony.totalCount} dishes clear every resident.
          </p>
        </div>
      )}

      {/* One tick per dish, in the same order as the verdict matrix below,
          so a glance here tells you where to look in the table. */}
      <div className="spectrum-block">
        <div className="card-head">
          <h3 className="analytics-card-title">Compatibility Spectrum</h3>
          <span className="analytics-subtext">
            {harmony.compatibleCount} of {harmony.totalCount} dishes compatible, in table order
          </span>
        </div>

        <div
          className="spectrum-strip"
          role="img"
          aria-label={`${harmony.compatibleCount} of ${harmony.totalCount} dishes compatible; order matches the verdict matrix below`}
        >
          {verdicts.map((v) => {
            const kind = dominantReason(v);
            return (
              <span
                key={v.dish.id}
                className={`spectrum-tick tick-${kind}`}
                title={`${v.dish.id} ${v.dish.name} — ${v.compatible ? 'compatible' : v.reasons.join(', ')}`}
              />
            );
          })}
        </div>

        <div className="legend spectrum-legend">
          <span className="legend-item">
            <span className="swatch" style={{ background: 'var(--pass)' }} /> passes
          </span>
          <span className="legend-item">
            <span className="swatch swatch-hatch" /> diet
          </span>
          <span className="legend-item">
            <span className="swatch" style={{ background: 'var(--block)' }} /> allergen
          </span>
          <span className="legend-item">
            <span className="swatch" style={{ background: 'var(--over)' }} /> over budget
          </span>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Group Harmony — a linear meter with the same 30 / 60 thresholds
            that decide the status label, so the label is never a black box. */}
        <div className="analytics-card">
          <div className="card-head">
            <h3 className="analytics-card-title">Group Harmony</h3>
            <span className={`chip chip-${statusToken}`}>{harmony.label}</span>
          </div>

          <div className="harmony-readout">
            <span className="harmony-number">{harmony.score}%</span>
            <span className="analytics-subtext">
              {harmony.compatibleCount} of {harmony.totalCount} dishes compatible
            </span>
          </div>

          <div className="meter">
            <div className="meter-track">
              <div
                className="meter-fill"
                style={{ width: `${harmony.score}%`, background: `var(--${statusToken})` }}
              />
              <span className="meter-tick" style={{ left: '30%' }} />
              <span className="meter-tick" style={{ left: '60%' }} />
            </div>
            <div className="meter-scale">
              <span style={{ left: '30%', transform: 'translateX(-50%)' }}>30</span>
              <span style={{ left: '60%', transform: 'translateX(-50%)' }}>60</span>
              <span style={{ left: '100%', transform: 'translateX(-100%)' }}>100</span>
            </div>
          </div>
        </div>

        {/* Exclusion root cause — one stacked bar instead of three separate
            ones, so the three causes read as parts of one whole at a glance.
            Diet gets a hazard stripe on the same red as allergen: same
            failure family (content mismatch), but allergen is the
            non-negotiable one. */}
        <div className="analytics-card">
          <div className="card-head">
            <h3 className="analytics-card-title">Exclusion Root Cause</h3>
            <span className="analytics-subtext">{breakdown.totalReasons} reasons</span>
          </div>

          {breakdown.totalReasons === 0 ? (
            <p className="analytics-empty">No exclusions — every dish clears every check.</p>
          ) : (
            <>
              <div
                className="stacked-bar"
                role="img"
                aria-label={`Diet ${breakdown.dietPct}%, allergen ${breakdown.allergenPct}%, over budget ${breakdown.budgetPct}% of exclusion reasons`}
              >
                {/* Widths use the exact share of totalReasons rather than the
                    independently-rounded display percentages, so three
                    segments can never overshoot or leave a gap inside the
                    fixed-width, overflow-hidden track. */}
                {breakdown.dietCount > 0 && (
                  <span
                    className="stack-seg seg-diet"
                    style={{ width: `${(breakdown.dietCount / breakdown.totalReasons) * 100}%` }}
                  />
                )}
                {breakdown.allergenCount > 0 && (
                  <span
                    className="stack-seg seg-allergen"
                    style={{ width: `${(breakdown.allergenCount / breakdown.totalReasons) * 100}%` }}
                  />
                )}
                {breakdown.budgetCount > 0 && (
                  <span
                    className="stack-seg seg-budget"
                    style={{ width: `${(breakdown.budgetCount / breakdown.totalReasons) * 100}%` }}
                  />
                )}
              </div>
              <div className="legend">
                <span className="legend-item">
                  <span className="swatch swatch-hatch" /> diet {breakdown.dietPct}% ({breakdown.dietCount})
                </span>
                <span className="legend-item">
                  <span className="swatch" style={{ background: 'var(--block)' }} /> allergen{' '}
                  {breakdown.allergenPct}% ({breakdown.allergenCount})
                </span>
                <span className="legend-item">
                  <span className="swatch" style={{ background: 'var(--over)' }} /> budget{' '}
                  {breakdown.budgetPct}% ({breakdown.budgetCount})
                </span>
              </div>
            </>
          )}
        </div>

        {/* Resident constraints — ranked bars, not badges, so magnitude and
            rank are both visible without reading numbers. */}
        <div className="analytics-card">
          <div className="card-head">
            <h3 className="analytics-card-title">Resident Constraints</h3>
          </div>

          {bottleneck && (
            <p className="analytics-insight">
              <strong>{bottleneck.resident}</strong> clears the fewest dishes —{' '}
              {bottleneck.rejectionCount} exclusion{bottleneck.rejectionCount === 1 ? '' : 's'}.
            </p>
          )}

          <div className="resident-bars">
            {frictionList.map((f) => (
              <div key={f.resident} className="resident-row">
                <div className="resident-row-head">
                  <span className="resident-name">{f.resident}</span>
                  <span className="resident-count">{f.rejectionCount === 0 ? '✓ clear' : f.rejectionCount}</span>
                </div>
                <div
                  className="stacked-bar resident-track"
                  role="img"
                  aria-label={
                    f.rejectionCount === 0
                      ? `${f.resident}: no exclusions`
                      : `${f.resident}: ${f.dietRejections} diet, ${f.allergenRejections} allergen exclusion${f.rejectionCount === 1 ? '' : 's'}`
                  }
                >
                  {f.dietRejections > 0 && (
                    <span
                      className="stack-seg seg-diet"
                      style={{ width: `${(f.dietRejections / maxFriction) * 100}%` }}
                    />
                  )}
                  {f.allergenRejections > 0 && (
                    <span
                      className="stack-seg seg-allergen"
                      style={{ width: `${(f.allergenRejections / maxFriction) * 100}%` }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next unlock — the smallest change that admits another dish. */}
        {unlocker && unlocker.type !== 'ALL_COMPATIBLE' && (
          <div className="analytics-card unlocker-card enter">
            <div className="card-head">
              <h3 className="analytics-card-title">Next Unlock</h3>
            </div>
            <p className="unlocker-msg">{unlocker.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};
