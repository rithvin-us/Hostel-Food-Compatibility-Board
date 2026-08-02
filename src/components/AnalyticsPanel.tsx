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

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  verdicts,
  residents,
  budget,
}) => {
  const harmony = computeHarmonyScore(verdicts);
  const breakdown = computeExclusionBreakdown(verdicts);
  const frictionList = computeResidentFriction(verdicts, residents);
  const unlocker = computeSmartUnlocker(verdicts, budget);

  // SVG Gauge calculations
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (harmony.score / 100) * circumference;

  let gaugeColor = 'var(--pass)';
  if (harmony.status === 'low') gaugeColor = 'var(--block)';
  else if (harmony.status === 'moderate') gaugeColor = 'var(--over)';

  return (
    <div className="analytics-panel">
      {/* Universal Feast Banner */}
      {harmony.status === 'feast' && (
        <div className="feast-banner enter">
          <span className="feast-icon">🎉</span>
          <div className="feast-text">
            <h3>Universal Feast Unlocked!</h3>
            <p>100% of menu dishes are compatible for every resident in your group.</p>
          </div>
        </div>
      )}

      <div className="analytics-grid">
        {/* Harmony Score Card */}
        <div className="analytics-card harmony-card">
          <div className="card-head">
            <h3 className="analytics-card-title">Group Harmony Index</h3>
            <span className={`harmony-status-chip status-${harmony.status}`}>
              {harmony.label}
            </span>
          </div>

          <div className="harmony-body">
            <div className="gauge-container">
              <svg className="gauge-svg" viewBox="0 0 100 100">
                <circle
                  className="gauge-bg"
                  cx="50"
                  cy="50"
                  r={radius}
                  strokeWidth="8"
                />
                <circle
                  className="gauge-fill"
                  cx="50"
                  cy="50"
                  r={radius}
                  strokeWidth="8"
                  stroke={gaugeColor}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="gauge-value">
                <span className="gauge-number">{harmony.score}%</span>
                <span className="gauge-sub">compatible</span>
              </div>
            </div>

            <div className="harmony-stats">
              <div className="stat-pill">
                <span className="stat-num">{harmony.compatibleCount}</span>
                <span className="stat-lbl">Compatible</span>
              </div>
              <div className="stat-divider">/</div>
              <div className="stat-pill">
                <span className="stat-num">{harmony.totalCount}</span>
                <span className="stat-lbl">Total Dishes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exclusion Cause Breakdown Card */}
        <div className="analytics-card breakdown-card">
          <div className="card-head">
            <h3 className="analytics-card-title">Exclusion Root-Cause Breakdown</h3>
            <span className="analytics-subtext">{breakdown.totalReasons} Total Rejection Reasons</span>
          </div>

          {breakdown.totalReasons === 0 ? (
            <div className="analytics-empty">Zero exclusions detected! All dishes pass cleanly.</div>
          ) : (
            <div className="bars-container">
              {/* Diet Bar */}
              <div className="bar-group">
                <div className="bar-label">
                  <span className="bar-name">Dietary Restrictions</span>
                  <span className="bar-val">{breakdown.dietPct}% ({breakdown.dietCount})</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill fill-diet"
                    style={{ width: `${breakdown.dietPct}%` }}
                  />
                </div>
              </div>

              {/* Allergen Bar */}
              <div className="bar-group">
                <div className="bar-label">
                  <span className="bar-name">Allergen Collisions</span>
                  <span className="bar-val">{breakdown.allergenPct}% ({breakdown.allergenCount})</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill fill-allergen"
                    style={{ width: `${breakdown.allergenPct}%` }}
                  />
                </div>
              </div>

              {/* Budget Bar */}
              <div className="bar-group">
                <div className="bar-label">
                  <span className="bar-name">Over Budget Limits</span>
                  <span className="bar-val">{breakdown.budgetPct}% ({breakdown.budgetCount})</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill fill-budget"
                    style={{ width: `${breakdown.budgetPct}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resident Friction Index Card */}
        <div className="analytics-card friction-card">
          <div className="card-head">
            <h3 className="analytics-card-title">Resident Constraints</h3>
            <span className="analytics-subtext">Individual Rejection Contributions</span>
          </div>

          <div className="friction-list">
            {frictionList.map((f) => (
              <div key={f.resident} className="friction-row">
                <span className="friction-name">{f.resident}</span>
                <div className="friction-badges">
                  {f.dietRejections > 0 && (
                    <span className="friction-badge badge-diet" title="Diet Rejections">
                      Diet: {f.dietRejections}
                    </span>
                  )}
                  {f.allergenRejections > 0 && (
                    <span className="friction-badge badge-allergen" title="Allergen Rejections">
                      Allergen: {f.allergenRejections}
                    </span>
                  )}
                  {f.rejectionCount === 0 && (
                    <span className="friction-badge badge-clean">Zero Restrictions</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Unlocker Card */}
        {unlocker && unlocker.type !== 'ALL_COMPATIBLE' && (
          <div className="analytics-card unlocker-card enter">
            <div className="card-head">
              <h3 className="analytics-card-title">💡 Smart Recommendation</h3>
            </div>
            <div className="unlocker-body">
              <p className="unlocker-msg">{unlocker.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
