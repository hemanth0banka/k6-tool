import { useState } from "react";
import { Plus, Trash2, Edit2, Save } from "lucide-react";

const EXECUTOR_TYPES = [
  { value: 'constant-vus', label: 'Constant VUs' },
  { value: 'ramping-vus', label: 'Ramping VUs' },
  { value: 'constant-arrival-rate', label: 'Constant Arrival Rate' },
  { value: 'ramping-arrival-rate', label: 'Ramping Arrival Rate' },
  { value: 'shared-iterations', label: 'Shared Iterations' },
  { value: 'per-vu-iterations', label: 'Per-VU Iterations' },
];

export default function ScenarioBuilder({ scenario, onSave, onCancel }) {
  const [name, setName] = useState(scenario?.name || '');
  const [executor, setExecutor] = useState(scenario?.executor || 'ramping-vus');
  const [stages, setStages] = useState(scenario?.stages || [
    { duration: 30, target: 10 },
    { duration: 60, target: 50 },
    { duration: 30, target: 0 }
  ]);
  const [vus, setVus] = useState(scenario?.vus || 10);
  const [duration, setDuration] = useState(scenario?.duration || 60);
  const [iterations, setIterations] = useState(scenario?.iterations || 100);
  const [rate, setRate] = useState(scenario?.rate || 100);
  const [timeUnit, setTimeUnit] = useState(scenario?.timeUnit || '1s');

  const addStage = () => {
    setStages([...stages, { duration: 30, target: 10 }]);
  };

  const updateStage = (index, field, value) => {
    const newStages = [...stages];
    newStages[index][field] = parseInt(value) || 0;
    setStages(newStages);
  };

  const removeStage = (index) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const scenarioData = {
      name,
      executor,
      stages: executor === 'ramping-vus' ? stages : undefined,
      vus: ['constant-vus', 'shared-iterations', 'per-vu-iterations'].includes(executor) ? vus : undefined,
      duration: !executor.includes('iterations') ? duration : undefined,
      iterations: executor.includes('iterations') ? iterations : undefined,
      rate: executor.includes('arrival-rate') ? rate : undefined,
      timeUnit: executor.includes('arrival-rate') ? timeUnit : undefined,
    };
    onSave(scenarioData);
  };

  const calculateTotalDuration = () => {
    if (executor === 'ramping-vus') {
      return stages.reduce((sum, stage) => sum + stage.duration, 0);
    }
    return duration;
  };

  const calculateMaxVUs = () => {
    if (executor === 'ramping-vus') {
      return Math.max(...stages.map(s => s.target));
    }
    return vus;
  };

  return (
    <div className="scenario-builder">
      <div className="card">
        <h2 className="card-title">
          <Edit2 size={20} />
          {scenario ? 'Edit Scenario' : 'Create Scenario'}
        </h2>

        {/* Scenario Name */}
        <div className="form-group">
          <label>Scenario Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Load Test Scenario"
            className="input-primary"
          />
        </div>

        {/* Executor Type */}
        <div className="form-group">
          <label>Executor Type</label>
          <select
            value={executor}
            onChange={(e) => setExecutor(e.target.value)}
            className="input-primary"
          >
            {EXECUTOR_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Executor Configuration */}
        <div className="executor-config">
          {/* Constant VUs */}
          {executor === 'constant-vus' && (
            <div className="form-row">
              <div className="form-group">
                <label>Virtual Users</label>
                <input
                  type="number"
                  value={vus}
                  onChange={(e) => setVus(e.target.value)}
                  className="input-primary"
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Duration (seconds)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="input-primary"
                  min="1"
                />
              </div>
            </div>
          )}

          {/* Ramping VUs */}
          {executor === 'ramping-vus' && (
            <div className="stages-editor">
              <h3>Stages Configuration</h3>
              <div className="stage-timeline">
                {stages.map((stage, index) => (
                  <div key={index} className="stage-block" style={{
                    width: `${(stage.duration / calculateTotalDuration()) * 100}%`,
                    background: `linear-gradient(to top, #2563eb${Math.floor((stage.target / calculateMaxVUs()) * 100)}%, transparent)`
                  }}>
                    <span className="stage-label">{stage.target} VUs</span>
                  </div>
                ))}
              </div>

              {stages.map((stage, index) => (
                <div key={index} className="form-row" style={{ alignItems: 'flex-end' }}>
                  <div className="form-group">
                    <label>Duration (s)</label>
                    <input
                      type="number"
                      value={stage.duration}
                      onChange={(e) => updateStage(index, 'duration', e.target.value)}
                      className="input-primary"
                      min="1"
                    />
                  </div>
                  <div className="form-group">
                    <label>Target VUs</label>
                    <input
                      type="number"
                      value={stage.target}
                      onChange={(e) => updateStage(index, 'target', e.target.value)}
                      className="input-primary"
                      min="0"
                    />
                  </div>
                  <button onClick={() => removeStage(index)} className="btn-icon btn-danger">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button onClick={addStage} className="btn-secondary">
                <Plus size={16} />
                Add Stage
              </button>
            </div>
          )}

          {/* Iterations-based */}
          {executor.includes('iterations') && (
            <div className="form-row">
              <div className="form-group">
                <label>Virtual Users</label>
                <input
                  type="number"
                  value={vus}
                  onChange={(e) => setVus(e.target.value)}
                  className="input-primary"
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Iterations</label>
                <input
                  type="number"
                  value={iterations}
                  onChange={(e) => setIterations(e.target.value)}
                  className="input-primary"
                  min="1"
                />
              </div>
            </div>
          )}

          {/* Arrival Rate */}
          {executor.includes('arrival-rate') && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Rate (iterations)</label>
                  <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="input-primary"
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Time Unit</label>
                  <select
                    value={timeUnit}
                    onChange={(e) => setTimeUnit(e.target.value)}
                    className="input-primary"
                  >
                    <option value="1s">per second</option>
                    <option value="1m">per minute</option>
                    <option value="1h">per hour</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Duration (seconds)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="input-primary"
                  min="1"
                />
              </div>
            </>
          )}
        </div>

        {/* Summary */}
        <div className="scenario-summary">
          <h3>Summary</h3>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Total Duration:</span>
              <span className="summary-value">{calculateTotalDuration()}s</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Max VUs:</span>
              <span className="summary-value">{calculateMaxVUs()}</span>
            </div>
            {executor.includes('arrival-rate') && (
              <div className="summary-item">
                <span className="summary-label">Target Rate:</span>
                <span className="summary-value">{rate}/{timeUnit}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button onClick={handleSave} className="btn-primary" style={{ flex: 1 }}>
            <Save size={16} />
            Save Scenario
          </button>
          {onCancel && (
            <button onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}