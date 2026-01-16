import { useState } from "react";
import { Activity, Plus } from "lucide-react";

const SCENARIO_TEMPLATES = [
  {
    id: "ramping-vus",
    name: "Ramping VUs",
    description: "Gradually increase load to find breaking point",
    executor: "ramping-vus",
    stages: [
      { duration: "2m", target: 10 },
      { duration: "5m", target: 50 },
      { duration: "2m", target: 100 },
      { duration: "1m", target: 0 },
    ],
  },
  {
    id: "constant-vus",
    name: "Constant VUs",
    description: "Maintain steady load throughout test",
    executor: "constant-vus",
    vus: 50,
    duration: "5m",
  },
  {
    id: "per-vu-iterations",
    name: "Per VU Iterations",
    description: "Run specific number of iterations per VU",
    executor: "per-vu-iterations",
    vus: 10,
    iterations: 100,
  },
  {
    id: "shared-iterations",
    name: "Shared Iterations",
    description: "Share iterations across all VUs",
    executor: "shared-iterations",
    vus: 50,
    iterations: 1000,
  },
];

export default function ScenarioManager() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [scenarios, setScenarios] = useState([]);

  const createFromTemplate = (template) => {
    const newScenario = {
      ...template,
      id: `scenario-${Date.now()}`,
      createdAt: new Date(),
    };
    setScenarios([...scenarios, newScenario]);
    setSelectedTemplate(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Test Scenarios</h1>
        <button className="btn-primary">
          <Plus size={16} />
          New Scenario
        </button>
      </div>

      {/* Scenario Templates */}
      <div className="section">
        <h2>Scenario Templates</h2>
        <div className="scenario-grid">
          {SCENARIO_TEMPLATES.map((template) => (
            <div key={template.id} className="scenario-card">
              <div className="scenario-icon">
                <Activity />
              </div>
              
              <h3>{template.name}</h3>
              <p className="text-muted">{template.description}</p>

              <div className="scenario-executor">
                <span className="badge">{template.executor}</span>
              </div>

              <button
                onClick={() => setSelectedTemplate(template)}
                className="btn-secondary btn-block"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Scenarios */}
      {scenarios.length > 0 && (
        <div className="section">
          <h2>Your Scenarios</h2>
          <div className="card-list">
            {scenarios.map((scenario) => (
              <div key={scenario.id} className="card">
                <div className="card-header">
                  <h3>{scenario.name}</h3>
                  <span className="badge">{scenario.executor}</span>
                </div>
                <p>{scenario.description}</p>
                <div className="card-actions">
                  <button className="btn-primary">Run</button>
                  <button className="btn-secondary">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template Modal */}
      {selectedTemplate && (
        <div className="modal-overlay" onClick={() => setSelectedTemplate(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedTemplate.name}</h2>
            <p>{selectedTemplate.description}</p>
            
            <div className="scenario-details">
              <pre>{JSON.stringify(selectedTemplate, null, 2)}</pre>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => createFromTemplate(selectedTemplate)}
                className="btn-primary"
              >
                Create Scenario
              </button>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}