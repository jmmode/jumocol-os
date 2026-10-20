import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export type Role = "ADMIN" | "OPERADOR";
export type Identity = { id: string; name: string; role: Role };
type User = Identity & { password: string | null; active: number };
export const COOKIE = "jumocol_session";
const SESSION_MS = 8 * 60 * 60 * 1000;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
let connection: DatabaseSync | undefined;

export function db() {
  if (connection) return connection;
  const filename = process.env.JUMOCOL_AUTH_DB ?? path.resolve(process.cwd(), "data/private/identity.sqlite");
  mkdirSync(path.dirname(filename), { recursive: true, mode: 0o700 });
  connection = new DatabaseSync(filename, { timeout: 5000 });
  connection.exec(`
    PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('ADMIN','OPERADOR')), password TEXT, active INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS resets(token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS attempts(key TEXT PRIMARY KEY, count INTEGER NOT NULL, until_ms INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY, at TEXT NOT NULL, user_id TEXT, entity TEXT NOT NULL, action TEXT NOT NULL, result TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS publications(document_id TEXT PRIMARY KEY, sha256 TEXT NOT NULL, approved_by TEXT NOT NULL, approved_at TEXT NOT NULL, evidence TEXT NOT NULL);
    CREATE TRIGGER IF NOT EXISTS audit_no_update BEFORE UPDATE ON audit BEGIN SELECT RAISE(ABORT,'Audit is append-only'); END;
    CREATE TRIGGER IF NOT EXISTS audit_no_delete BEFORE DELETE ON audit BEGIN SELECT RAISE(ABORT,'Audit is append-only'); END;
  `);
  const insert = connection.prepare("INSERT OR IGNORE INTO users(id,name,role) VALUES(?,?,?)");
  insert.run("julian", "Julián · Dirección", "ADMIN");
  insert.run("jorge", "Jorge", "OPERADOR");
  insert.run("heidi", "Heidi", "OPERADOR");
  return connection;
}

export function audit(user: string | null, entity: string, action: string, result: string) {
  db().prepare("INSERT INTO audit(at,user_id,entity,action,result) VALUES(?,?,?,?,?)")
    .run(new Date().toISOString(), user, entity, action, result);
}

function transaction<T>(fn: () => T): T {
  const database = db();
  database.exec("BEGIN IMMEDIATE");
  try { const result = fn(); database.exec("COMMIT"); return result; }
  catch (error) { database.exec("ROLLBACK"); throw error; }
}

function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => scrypt(password, salt, 64,
    { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 },
    (error, result) => error ? reject(error) : resolve(result)));
}

export async function hashPassword(password: string) {
  if (password.length < 14 || password.length > 128) throw new Error("Use entre 14 y 128 caracteres.");
  const salt = randomBytes(16).toString("hex");
  return `scrypt$32768$8$3$${salt}$${(await derive(password, salt)).toString("hex")}`;
}

async function verify(password: string, encoded: string | null) {
  const parts = encoded?.split("$");
  const salt = parts?.[4] ?? "00000000000000000000000000000000";
  const expected = Buffer.from(parts?.[5] ?? "00".repeat(64), "hex");
  const actual = await derive(password, salt);
  return !!encoded && expected.length === actual.length && timingSafeEqual(expected, actual);
}

// Persistent account + global budgets: no reliance on spoofable forwarding headers.
function consumeBudget(key: string, maximum: number) {
  return transaction(() => {
    const now = Date.now();
    db().prepare("DELETE FROM attempts WHERE until_ms <= ?").run(now);
    const row = db().prepare("SELECT count FROM attempts WHERE key=?").get(key) as { count: number } | undefined;
    if (row && row.count >= maximum) return false;
    db().prepare("INSERT INTO attempts VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1").run(key, now + 15 * 60_000);
    return true;
  });
}

export async function login(id: string, password: string) {
  id = id.trim().toLowerCase();
  const user = db().prepare("SELECT * FROM users WHERE id=?").get(id) as User | undefined;
  if (!consumeBudget("login:global", 60) || (user && !consumeBudget(`login:${user.id}`, 5))) {
    audit(user?.id ?? null, "authentication", "login", "RATE_LIMITED");
    return null;
  }
  if (password.length > 128 || !await verify(password, user?.password ?? null) || !user?.active) {
    audit(user?.id ?? null, "authentication", "login", "DENIED");
    return null;
  }
  return transaction(() => {
    // Recheck after the asynchronous KDF: reset/deactivation must win.
    const current = db().prepare("SELECT * FROM users WHERE id=?").get(id) as User;
    if (!current.active || current.password !== user.password) return null;
    db().prepare("DELETE FROM attempts WHERE key=?").run(`login:${id}`);
    db().prepare("DELETE FROM sessions WHERE expires<=?").run(Date.now());
    const token = randomBytes(32).toString("hex");
    db().prepare("INSERT INTO sessions VALUES(?,?,?)").run(hash(token), id, Date.now() + SESSION_MS);
    audit(id, "authentication", "login", "SUCCESS");
    return { token, user: { id, name: user.name, role: user.role } };
  });
}

export function session(token?: string): Identity | null {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return (db().prepare(`SELECT u.id,u.name,u.role FROM sessions s JOIN users u ON u.id=s.user_id
    WHERE s.token_hash=? AND s.expires>? AND u.active=1`).get(hash(token), Date.now()) as Identity | undefined) ?? null;
}

export function logout(token?: string) {
  const user = session(token);
  if (!user || !token) return;
  transaction(() => {
    db().prepare("DELETE FROM sessions WHERE token_hash=?").run(hash(token));
    audit(user.id, "authentication", "logout", "SUCCESS");
  });
}

function assertAdmin(actor: Identity) {
  const current = db().prepare("SELECT role,active FROM users WHERE id=?").get(actor.id) as User | undefined;
  if (!current?.active || current.role !== "ADMIN") throw new Error("Acceso denegado.");
}

export function listUsers(actor: Identity) {
  assertAdmin(actor);
  return db().prepare("SELECT id,name,role,active,password IS NOT NULL AS hasPassword FROM users ORDER BY id").all() as unknown as Array<Identity & { active: number; hasPassword: number }>;
}

export function manageUser(actor: Identity, id: string, action: "activate" | "deactivate" | "reset") {
  return transaction(() => {
    assertAdmin(actor);
    const user = db().prepare("SELECT * FROM users WHERE id=?").get(id) as User | undefined;
    if (!user) throw new Error("Usuario no disponible.");
    if (action !== "activate" && user.role === "ADMIN" && user.active) {
      const { n } = db().prepare("SELECT count(*) AS n FROM users WHERE role='ADMIN' AND active=1").get() as { n: number };
      if (n <= 1) throw new Error("No se puede desactivar ni restablecer al último administrador activo. Use recuperación local.");
    }
    if (action === "activate" && !user.password) throw new Error("Emita una activación de credenciales primero.");
    db().prepare("DELETE FROM sessions WHERE user_id=?").run(id);
    db().prepare("DELETE FROM resets WHERE user_id=?").run(id);
    db().prepare("UPDATE users SET active=? WHERE id=?").run(action === "activate" ? 1 : 0, id);
    let token: string | undefined;
    if (action === "reset") {
      token = randomBytes(32).toString("hex");
      db().prepare("UPDATE users SET password=NULL WHERE id=?").run(id);
      db().prepare("INSERT INTO resets VALUES(?,?,?)").run(hash(token), id, Date.now() + 30 * 60_000);
    }
    audit(actor.id, `user:${id}`, action, "SUCCESS");
    return token;
  });
}

export const USER_ID_PATTERN = /^[a-z][a-z0-9._-]{2,31}$/;
/** ADMIN creates an individual OPERADOR account: no password, inactive, one-time activation code (30 min). */
export function createOperator(actor: Identity, rawId: string, rawName: string) {
  const id = String(rawId ?? "").trim().toLowerCase();
  const name = String(rawName ?? "").trim().replace(/\s+/g, " ");
  if (!USER_ID_PATTERN.test(id)) throw new Error("Usuario inválido: 3–32 caracteres, minúsculas, números, punto, guion o guion bajo; debe iniciar con letra.");
  if (name.length < 2 || name.length > 60 || /[\u0000-\u001f\u007f<>]/.test(name)) throw new Error("Nombre inválido (2–60 caracteres).");
  return transaction(() => {
    assertAdmin(actor);
    if (db().prepare("SELECT 1 FROM users WHERE id=?").get(id)) throw new Error("El usuario ya existe. Las cuentas existentes no se modifican desde este formulario.");
    db().prepare("INSERT INTO users(id,name,role,password,active) VALUES(?,?,'OPERADOR',NULL,0)").run(id, name);
    const token = randomBytes(32).toString("hex");
    db().prepare("INSERT INTO resets VALUES(?,?,?)").run(hash(token), id, Date.now() + 30 * 60_000);
    audit(actor.id, `user:${id}`, "create-operator", "SUCCESS");
    return token;
  });
}

export async function activate(token: string, password: string) {
  if (!consumeBudget("activation:global", 30)) return false;
  if (!/^[a-f0-9]{64}$/.test(token)) { audit(null, "authentication", "activate", "DENIED"); return false; }
  const reset = db().prepare("SELECT user_id FROM resets WHERE token_hash=? AND expires>?").get(hash(token), Date.now()) as { user_id: string } | undefined;
  if (!reset) { audit(null, "authentication", "activate", "DENIED"); return false; }
  const passwordHash = await hashPassword(password);
  return transaction(() => {
    const consumed = db().prepare("DELETE FROM resets WHERE token_hash=? AND expires>?").run(hash(token), Date.now());
    if (!consumed.changes) return false;
    db().prepare("UPDATE users SET password=?,active=1 WHERE id=?").run(passwordHash, reset.user_id);
    db().prepare("DELETE FROM sessions WHERE user_id=?").run(reset.user_id);
    audit(reset.user_id, "authentication", "activate", "SUCCESS");
    return true;
  });
}

// Local trusted terminal only; never imported by an HTTP handler.
export async function bootstrapAdmin(password: string, recover = false) {
  const encoded = await hashPassword(password);
  transaction(() => {
    const user = db().prepare("SELECT * FROM users WHERE id='julian'").get() as User;
    if (user.password && !recover) throw new Error("Administrador ya inicializado. Use recuperación explícita.");
    db().prepare("UPDATE users SET password=?,active=1 WHERE id='julian'").run(encoded);
    db().prepare("DELETE FROM sessions WHERE user_id='julian'").run();
    db().prepare("DELETE FROM resets WHERE user_id='julian'").run();
    audit("julian", "authentication", recover ? "local_recovery" : "local_bootstrap", "SUCCESS");
  });
}

export function auditRows(actor: Identity) {
  assertAdmin(actor);
  return db().prepare("SELECT id,at,user_id,entity,action,result FROM audit ORDER BY id DESC LIMIT 250").all();
}
