/**
 * K6 Script Generator Utility
 * Converts internal script format to k6 JavaScript code
 */

export function generateK6Script(script, config = {}) {
  const { 
    vus = 10, 
    duration = 30, 
    executor = 'constant-vus',
    stages = [],
    thresholds = {},
    tags = {},
    setupTimeout = 10,
    teardownTimeout = 10,
    gracefulStop = '30s',
    noConnectionReuse = false,
    userAgent = 'k6-clone/1.0'
  } = config;

  // Build options object
  const options = buildOptions({
    vus,
    duration,
    executor,
    stages,
    thresholds,
    tags,
    setupTimeout,
    teardownTimeout,
    gracefulStop,
    noConnectionReuse,
    userAgent
  });

  // Build test script
  const scriptCode = buildScriptCode(script);

  return `import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = ${JSON.stringify(options, null, 2)};

export default function() {
${scriptCode}
}`;
}

function buildOptions(config) {
  const options = {};

  // Executor configuration
  if (config.executor === 'constant-vus') {
    options.vus = config.vus;
    options.duration = `${config.duration}s`;
  } else if (config.executor === 'ramping-vus' && config.stages?.length > 0) {
    options.scenarios = {
      main: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: config.stages.map(stage => ({
          duration: `${stage.duration}s`,
          target: stage.target
        })),
        gracefulRampDown: config.gracefulStop
      }
    };
  } else if (config.executor === 'constant-arrival-rate') {
    options.scenarios = {
      main: {
        executor: 'constant-arrival-rate',
        rate: config.rate || 100,
        timeUnit: config.timeUnit || '1s',
        duration: `${config.duration}s`,
        preAllocatedVUs: config.preAllocatedVUs || 50,
        maxVUs: config.maxVUs || 100
      }
    };
  }

  // Thresholds
  if (Object.keys(config.thresholds).length > 0) {
    options.thresholds = config.thresholds;
  } else {
    options.thresholds = {
      'http_req_duration': ['p(95)<500'],
      'http_req_failed': ['rate<0.1']
    };
  }

  // Tags
  if (Object.keys(config.tags).length > 0) {
    options.tags = config.tags;
  }

  // Other options
  if (config.setupTimeout) {
    options.setupTimeout = `${config.setupTimeout}s`;
  }
  if (config.teardownTimeout) {
    options.teardownTimeout = `${config.teardownTimeout}s`;
  }
  if (config.noConnectionReuse) {
    options.noConnectionReuse = true;
  }
  if (config.userAgent) {
    options.userAgent = config.userAgent;
  }

  return options;
}

function buildScriptCode(script) {
  if (!script || !script.steps || script.steps.length === 0) {
    return '  // No steps defined\n  sleep(1);';
  }

  let code = '';
  
  script.steps.forEach((step, index) => {
    // Add comment
    code += `  // Step ${index + 1}: ${step.method} ${step.url}\n`;

    // Build request parameters
    const params = buildRequestParams(step);
    const paramsStr = params ? `, ${JSON.stringify(params)}` : '';

    // Build request
    const method = step.method.toLowerCase();
    const varName = `res${index + 1}`;
    
    if (step.body && (step.method === 'POST' || step.method === 'PUT' || step.method === 'PATCH')) {
      code += `  const ${varName} = http.${method}('${step.url}', ${step.body}${paramsStr});\n`;
    } else {
      code += `  const ${varName} = http.${method}('${step.url}'${paramsStr});\n`;
    }

    // Add checks if defined
    if (step.checks && step.checks.length > 0) {
      code += `  check(${varName}, {\n`;
      step.checks.forEach(check => {
        code += `    '${check.description}': (r) => ${check.expression},\n`;
      });
      code += `  });\n`;
    } else {
      // Default check
      code += `  check(${varName}, {\n`;
      code += `    'status is 2xx': (r) => r.status >= 200 && r.status < 300,\n`;
      code += `  });\n`;
    }

    // Add think time
    if (step.thinkTime && step.thinkTime > 0) {
      code += `  sleep(${step.thinkTime});\n`;
    } else {
      code += `  sleep(1);\n`;
    }

    code += '\n';
  });

  return code;
}

function buildRequestParams(step) {
  const params = {};

  // Headers
  if (step.headers && step.headers.length > 0) {
    params.headers = {};
    step.headers.forEach(header => {
      if (header.key && header.value) {
        params.headers[header.key] = header.value;
      }
    });
  }

  // Authentication
  if (step.auth && step.auth.type !== 'none') {
    if (step.auth.type === 'basic') {
      params.auth = 'basic';
      params.username = step.auth.username;
      params.password = step.auth.password;
    } else if (step.auth.type === 'bearer' && step.auth.token) {
      if (!params.headers) params.headers = {};
      params.headers['Authorization'] = `Bearer ${step.auth.token}`;
    }
  }

  return Object.keys(params).length > 0 ? params : null;
}

export function validateScript(script) {
  const errors = [];

  if (!script) {
    errors.push('Script is required');
    return errors;
  }

  if (!script.steps || script.steps.length === 0) {
    errors.push('Script must have at least one step');
  }

  script.steps?.forEach((step, index) => {
    if (!step.url) {
      errors.push(`Step ${index + 1}: URL is required`);
    }
    if (!step.method) {
      errors.push(`Step ${index + 1}: HTTP method is required`);
    }
  });

  return errors;
}

export function formatScriptForDisplay(script) {
  if (!script || !script.steps) return 'No script data';

  return script.steps.map((step, i) => 
    `${i + 1}. ${step.method} ${step.url}`
  ).join('\n');
}