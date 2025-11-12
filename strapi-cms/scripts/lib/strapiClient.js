const fs = require('fs');
const path = require('path');
const fetch = global.fetch || require('node-fetch');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';

function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (STRAPI_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  return headers;
}

async function getJSON(url) {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}

async function postJSON(url, body) {
  const res = await fetch(url, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`POST ${url} -> ${res.status} ${await res.text()}`);
  return res.json();
}

async function putJSON(url, body) {
  const res = await fetch(url, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`PUT ${url} -> ${res.status} ${await res.text()}`);
  return res.json();
}

async function deleteJSON(url) {
  const res = await fetch(url, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error(`DELETE ${url} -> ${res.status} ${await res.text()}`);
  return res.json();
}

async function uploadFile(filePath) {
  const { default: FormData } = await import('form-data');
  const form = new FormData();
  const filename = path.basename(filePath);
  form.append('files', fs.createReadStream(filePath), filename);
  const headers = form.getHeaders();
  if (STRAPI_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  const res = await fetch(`${STRAPI_URL}/api/upload`, { method: 'POST', headers, body: form });
  if (!res.ok) throw new Error(`UPLOAD ${filename} -> ${res.status} ${await res.text()}`);
  return res.json();
}

module.exports = { STRAPI_URL, STRAPI_TOKEN, getJSON, postJSON, putJSON, deleteJSON, uploadFile };


