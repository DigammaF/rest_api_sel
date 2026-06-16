
import crypto from 'node:crypto';
import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'expect';
import pool from '../../src/config/db.js';

const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000/api';

const CODE_COLUMNS = ['code_membre', 'code', 'id'];
const PASSWORD_COLUMNS = ['password', 'mot_de_passe', 'mdp'];
const PROFIL_COLUMNS = ['profil', 'role'];

var lastResponse: Response;
var lastResponseBody: unknown;
var sessionCookie: string | null = null;

function pickColumn(columns: string[], candidates: string[]): string | null {
  return candidates.find((candidate) => columns.includes(candidate)) ?? null;
}

async function getColumns(table: string): Promise<string[]> {
  const [rows] = (await pool.query(`SHOW COLUMNS FROM \`${table}\``)) as [Array<{ Field: string }>, unknown[]];
  return rows.map((row) => row.Field);
}

async function ensureMemberExists(code: string, password: string): Promise<void> {
  const columns = await getColumns('membres');
  const codeColumn = pickColumn(columns, CODE_COLUMNS);
  const passwordColumn = pickColumn(columns, PASSWORD_COLUMNS);
  const profilColumn = pickColumn(columns, PROFIL_COLUMNS);

  if (!codeColumn || !passwordColumn || !profilColumn) {
    throw new Error('Unable to seed member: membres table is missing expected auth columns.');
  }

  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  const profile = 'utilisateur';

  await pool.query(`DELETE FROM \`membres\` WHERE \`${codeColumn}\` = ?`, [code]);
  await pool.query(
    `INSERT INTO \`membres\` (\`${codeColumn}\`, \`${passwordColumn}\`, \`${profilColumn}\`) VALUES (?, ?, ?)`,
    [code, hashedPassword, profile],
  );
}

function getRequestBodyFromDataTable(dataTable: DataTable): Record<string, unknown> {
  const rows = dataTable.rows();
  const body: Record<string, unknown> = {};

  for (const [key, value] of rows) {
    body[key] = value === 'true' ? true : value === 'false' ? false : value;
  }

  return body;
}

async function sendPost(path: string, body?: Record<string, unknown>, useSession = true): Promise<void> {
  const url = path.startsWith('/') ? `${BASE_URL}${path}` : `${BASE_URL}/${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (useSession && sessionCookie) {
    headers.Cookie = sessionCookie;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  lastResponse = response;

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    lastResponseBody = await response.json();
  } else {
    lastResponseBody = await response.text();
  }

  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    sessionCookie = setCookie;
  }
}

Given('a member exists with code {string} and password {string}', async function (code: string, password: string) {
  await ensureMemberExists(code, password);
});

When('the client sends a POST request to {string} with:', async function (path: string, dataTable: DataTable) {
  const body = getRequestBodyFromDataTable(dataTable);
  await sendPost(path, body, false);
});

Then('the response status should be {int}', function (status: number) {
  expect(lastResponse).toBeDefined();
  expect(lastResponse?.status).toBe(status);
});

Then('the response should contain:', function (dataTable: DataTable) {
  expect(this.lastResponseBody).toBeDefined();
  const responseBody = this.lastResponseBody as Record<string, unknown>;
  const keys = dataTable.raw().flat().filter(Boolean) as string[];

  for (const key of keys) {
    expect(responseBody).toHaveProperty(key);
  }
});

Then('a session cookie should be returned', function () {
  expect(this.lastResponse).toBeDefined();
  const setCookie = this.lastResponse?.headers.get('set-cookie');
  expect(setCookie).toBeTruthy();
  expect(setCookie).toContain('connect.sid');
});

When('the client sends a POST request to {string} with invalid credentials', async function (path: string) {
  const body = {
    code_membre: 'invalid-user',
    password: 'invalid-password',
    isAdmin: false,
  };
  await sendPost(path, body, false);
});

Given('an authenticated member session', async function () {
  const code = '422324';
  const password = 'monMotDePasse!';

  await ensureMemberExists(code, password);
  await sendPost('/auth/login', {
    code_membre: code,
    password,
    isAdmin: false,
  }, false);

  if (this.lastResponse?.status !== 200) {
    throw new Error('Unable to create authenticated session');
  }
});

When('the client sends a POST request to {string}', async function (path: string) {
  await sendPost(path, undefined, true);
});

When('the client sends a POST request to {string} without a session cookie', async function (path: string) {
  await sendPost(path, undefined, false);
});

