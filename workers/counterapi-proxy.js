const COUNTER_PATH = /^\/counter\/([^/]+)(?:\/(increment))?\/?$/;

export default {
  async fetch(request, env) {
    const corsHeaders = buildCorsHeaders(env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const match = url.pathname.match(COUNTER_PATH);

    if (!match) {
      return jsonResponse({ error: 'Not Found' }, 404, corsHeaders);
    }

    const key = decodeURIComponent(match[1]);
    const action = match[2] || 'get';

    if (!isAllowedKey(env, key)) {
      return jsonResponse({ error: 'Forbidden counter key' }, 403, corsHeaders);
    }

    try {
      if (request.method === 'GET' && action === 'get') {
        const value = await fetchCounter(env, key);
        return jsonResponse({ count: value }, 200, corsHeaders);
      }

      if (request.method === 'POST' && action === 'increment') {
        const amount = await readAmount(request);
        const value = await incrementCounter(env, key, amount);
        return jsonResponse({ count: value }, 200, corsHeaders);
      }

      return jsonResponse({ error: 'Unsupported method' }, 405, corsHeaders);
    } catch (error) {
      console.error('CounterAPI proxy error', error);
      return jsonResponse({ error: 'CounterAPI proxy failure' }, 502, corsHeaders);
    }
  }
};

function buildCorsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Max-Age': '86400'
  };
}

async function fetchCounter(env, key) {
  const response = await fetch(buildCounterUrl(env, key), {
    method: 'GET',
    headers: buildHeaders(env)
  });

  if (response.status === 404) {
    return 0;
  }

  if (!response.ok) {
    throw new Error(`CounterAPI GET failed (${response.status})`);
  }

  return extractValue(await response.json());
}

async function incrementCounter(env, key, amount) {
  const response = await fetch(buildCounterUrl(env, key) + '/increment', {
    method: 'POST',
    headers: buildHeaders(env, true),
    body: JSON.stringify({ amount })
  });

  if (response.status === 404) {
    return amount;
  }

  if (!response.ok) {
    throw new Error(`CounterAPI increment failed (${response.status})`);
  }

  return extractValue(await response.json());
}

function buildCounterUrl(env, key) {
  const baseUrl = (env.COUNTERAPI_BASE_URL || 'https://counterapi.dev').replace(/\/+$/, '');
  const namespace = encodeURIComponent(env.COUNTERAPI_NAMESPACE || 'utegraphium');
  const counterKey = encodeURIComponent(key);
  return `${baseUrl}/api/v1/counter/${namespace}/${counterKey}`;
}

function buildHeaders(env, includeContentType) {
  const headers = new Headers();

  if (includeContentType) {
    headers.set('Content-Type', 'application/json');
  }

  const token = env.COUNTERAPI_TOKEN;
  if (!token) {
    throw new Error('Missing COUNTERAPI_TOKEN secret in Worker environment');
  }

  headers.set(env.COUNTERAPI_AUTH_HEADER || 'Authorization', token);

  return headers;
}

async function readAmount(request) {
  try {
    const body = await request.json();
    const value = typeof body.amount === 'number' ? body.amount : 1;
    return Number.isFinite(value) && value > 0 ? value : 1;
  } catch (error) {
    return 1;
  }
}

function extractValue(payload) {
  if (!payload) {
    return 0;
  }

  if (typeof payload.count === 'number') {
    return payload.count;
  }

  if (typeof payload.value === 'number') {
    return payload.value;
  }

  if (payload.data && typeof payload.data.count === 'number') {
    return payload.data.count;
  }

  return 0;
}

function isAllowedKey(env, key) {
  const allowed = new Set([
    env.COUNTERAPI_TOTAL_KEY || 'total-visits',
    env.COUNTERAPI_UNIQUE_KEY || 'unique-visitors'
  ]);

  return allowed.has(key);
}

function jsonResponse(data, status, corsHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
