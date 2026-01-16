import { useState } from "react";
import { Plus, Trash2, CheckCircle, XCircle } from "lucide-react";

const METRIC_TYPES = [
  { value: 'http_req_duration', label: 'HTTP Request Duration', unit: 'ms' },
  { value: 'http_req_failed', label: 'HTTP Request Failed', unit: 'rate' },
  { value: 'http_reqs', label: 'HTTP Requests', unit: 'count' },
  { value: 'iterations', label: 'Iterations', unit: 'count' },
  { value: 'vus', label: 'Virtual Users', unit: 'count' },
  { value: 'data_received', label: 'Data Received', unit: 'bytes' },
  { value: 'data_sent', label: 'Data Sent', unit: 'bytes' },
];

const CONDITION_TEMPLATES = {
  'http_req_duration': [
    { label: 'p95 < 500ms', value: 'p(95)<500' },
    { label: 'p99 < 1000ms', value: 'p(99)<1000' },
    { label: 'avg < 300ms', value: 'avg<300' },
    { label: 'max < 2000ms', value: 'max<2000' },
  ],
  'http_req_failed': [
    { label: 'rate < 1%', value: 'rate<0.01' },
    { label: 'rate < 5%', value: 'rate<0.05' },
    { label: 'rate < 10%', value: 'rate<0.1' },
  ],
  'http_reqs': [
    { label: 'count > 1000', value: 'count>1000' },
    { label: 'rate > 50/s', value: 'rate>50' },
  ],
};

export default function ThresholdEditor({ thresholds = [], onChange }) {
  const [localThresholds, setLocalThresholds] = useState(thresholds.length > 0 ? thresholds : [
    { metric: 'http_req_duration', condition: 'p(95)<500', enabled: true },
    { metric: 'http_req_failed', condition: 'rate<0.1', enabled: true },
  ]);

  const updateThreshold = (index, field, value) => {
    const newThresholds = [...localThresholds];
    newThresholds[index][field] = value;
    
    // If metric changes, suggest a default condition
    if (field === 'metric' && CONDITION_TEMPLATES[value]) {
      newThresholds[index].condition = CONDITION_TEMPLATES[value][0].value;
    }
    
    setLocalThresholds(newThresholds);
    onChange?.(newThresholds);
  };

  const addThreshold = () => {
    const newThresholds = [
      ...localThresholds,
      { metric: 'http_req_duration', condition: 'p(95)<500', enabled: true }
    ];
    setLocalThresholds(newThresholds);
    onChange?.(newThresholds);
  };

  const removeThreshold = (index) => {
    const newThresholds = localThresholds.filter((_, i) => i !== index);
    setLocalThresholds(newThresholds);
    onChange?.(newThresholds);
  };

  const toggleThreshold = (index) => {
    updateThreshold(index, 'enabled', !localThresholds[index].enabled);
  };

  const getMetricLabel = (metricValue) => {
    return METRIC_TYPES.find(m => m.value === metricValue)?.label || metricValue;
  };

  const validateCondition = (condition) => {
    // Basic validation - should contain a comparison operator
    return /[<>=]/.test(condition);
  };

  return (
    <div className="threshold-editor">
      <div className="card">
        <h2 className="card-title">Performance Thresholds</h2>
        <p className="text-muted" style={{ marginBottom: '16px', fontSize: '14px' }}>
          Define performance criteria that must be met for the test to pass
        </p>

        {localThresholds.map((threshold, index) => (
          <div key={index} className="threshold-item-card">
            <div className="threshold-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <input
                  type="checkbox"
                  checked={threshold.enabled}
                  onChange={() => toggleThreshold(index)}
                  style={{ width: 'auto', margin: 0 }}
                />
                {threshold.enabled ? (
                  <CheckCircle size={20} className="text-success" />
                ) : (
                  <XCircle size={20} className="text-muted" />
                )}
                <span style={{ opacity: threshold.enabled ? 1 : 0.5 }}>
                  {getMetricLabel(threshold.metric)}
                </span>
              </div>
              <button
                onClick={() => removeThreshold(index)}
                className="btn-icon btn-danger"
                style={{ padding: '4px' }}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="form-row" style={{ marginTop: '12px' }}>
              <div className="form-group">
                <label>Metric</label>
                <select
                  value={threshold.metric}
                  onChange={(e) => updateThreshold(index, 'metric', e.target.value)}
                  className="input-primary"
                  disabled={!threshold.enabled}
                >
                  {METRIC_TYPES.map(metric => (
                    <option key={metric.value} value={metric.value}>
                      {metric.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: 2 }}>
                <label>Condition</label>
                <input
                  type="text"
                  value={threshold.condition}
                  onChange={(e) => updateThreshold(index, 'condition', e.target.value)}
                  placeholder="p(95)<500"
                  className="input-primary"
                  disabled={!threshold.enabled}
                  style={{
                    borderColor: validateCondition(threshold.condition) ? '#334155' : '#ef4444'
                  }}
                />
              </div>
            </div>

            {/* Quick Templates */}
            {threshold.enabled && CONDITION_TEMPLATES[threshold.metric] && (
              <div style={{ marginTop: '8px' }}>
                <span className="text-muted" style={{ fontSize: '12px', marginRight: '8px' }}>
                  Quick select:
                </span>
                {CONDITION_TEMPLATES[threshold.metric].map((template, i) => (
                  <button
                    key={i}
                    onClick={() => updateThreshold(index, 'condition', template.value)}
                    className="btn-secondary"
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      marginRight: '8px',
                      background: threshold.condition === template.value ? '#2563eb' : '#334155'
                    }}
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            )}

            {/* Condition Help */}
            <div className="threshold-help" style={{ marginTop: '12px' }}>
              <span className="text-muted" style={{ fontSize: '12px' }}>
                Examples: p(95)&lt;500, avg&lt;300, rate&lt;0.1, count&gt;1000
              </span>
            </div>
          </div>
        ))}

        <button onClick={addThreshold} className="btn-secondary" style={{ marginTop: '16px' }}>
          <Plus size={16} />
          Add Threshold
        </button>

        {/* Summary */}
        <div className="threshold-summary" style={{ marginTop: '24px', padding: '16px', background: '#0f172a', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '8px' }}>Summary</h4>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div>
              <span className="text-muted">Total: </span>
              <span className="text-success" style={{ fontWeight: 'bold' }}>
                {localThresholds.length}
              </span>
            </div>
            <div>
              <span className="text-muted">Enabled: </span>
              <span className="text-success" style={{ fontWeight: 'bold' }}>
                {localThresholds.filter(t => t.enabled).length}
              </span>
            </div>
            <div>
              <span className="text-muted">Disabled: </span>
              <span style={{ fontWeight: 'bold', color: '#64748b' }}>
                {localThresholds.filter(t => !t.enabled).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}