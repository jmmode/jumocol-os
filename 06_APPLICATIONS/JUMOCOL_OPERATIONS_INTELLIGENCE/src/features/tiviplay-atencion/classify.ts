// Clasificación inicial del mensaje del cliente → ficha. Puro y trazable: cada sugerencia dice qué regla la produjo.
// No sustituye el criterio del operador: si hay más de una ficha posible, se muestran todas como alternativas.
import { searchFichas, type Ficha } from "@/features/tiviplay-atencion/fichas";

export type ClassificationRule = { id: string; ficha: string; label: string; pattern: RegExp };

const fold = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Reglas explícitas por síntoma. El orden define la prioridad cuando varias coinciden. */
export const CLASSIFICATION_RULES: readonly ClassificationRule[] = [
  { id: "ATT", ficha: "C5", label: "AT&T / ActiveArmor bloquea la conexión", pattern: /\bat ?& ?t\b|\batt\b|active ?armor/ },
  { id: "APP_ELIMINADA", ficha: "C1", label: "La aplicación se eliminó o no está instalada", pattern: /(elimin|borr|desinstal)\w* (la )?(app|aplicacion)|(app|aplicacion) (se )?(elimin|borr)|no (me )?aparece la (app|aplicacion)|reinstal|instalar de nuevo/ },
  { id: "CREDENCIALES", ficha: "C5", label: "Usuario, contraseña o inicio de sesión", pattern: /usuario|contrasena|clave|login|inicio de sesion|iniciar sesion|no (me )?deja entrar|datos de acceso|olvide/ },
  { id: "BLOQUEO", ficha: "C5", label: "Bloqueo de acceso", pattern: /bloque(o|ad)/ },
  { id: "VENCIMIENTO", ficha: "C6", label: "Servicio expirado o vencido en pantalla", pattern: /expir|vencid|suscripcion vencida|cuenta vencida|sin credito|subscription|account expired/ },
  { id: "CONECTIVIDAD", ficha: "C2", label: "Conexión, wifi, pausas o lentitud", pattern: /sin (conexion|internet)|no tiene (conexion|internet)|wifi|internet|se congela|pausa|lento|buffer|intermiten|se corta/ },
  { id: "NO_ABRE", ficha: "C3", label: "La aplicación no abre", pattern: /no (abre|entra|carga)|se cierra sola|se queda en el logo|pantalla negra|se traba/ },
  { id: "CANAL_UNO", ficha: "C7", label: "Un canal específico falla", pattern: /(un|el|ese|este) canal|canal (no funciona|sin senal|caido)|sin audio|no suena/ },
  { id: "CANALES_TODOS", ficha: "C8", label: "Falla general de canales", pattern: /todos los canales|ningun canal|falla general|nada funciona|no sirve nada|se cayo (todo|el servicio)/ },
  { id: "PANEL", ficha: "C9", label: "Cambio de servidor o de panel", pattern: /cambio de (servidor|panel)|servidor caido|panel ?[123]\b|cambiar (la )?url|migrar/ },
  { id: "COMPROBANTE", ficha: "A2", label: "Envía comprobante o dice que pagó", pattern: /comprobante|ya (pague|realice el pago|hice el pago|transferi)|captura (del|de) pago|te envie el pago|zelle|paypal|nequi|daviplata/ },
  { id: "CONFIRMACION", ficha: "A3", label: "Pregunta si su pago quedó confirmado", pattern: /(ya )?(quedo|esta) (confirmado|registrado)|confirma(r|ron)? (mi )?pago|recibieron (mi|el) pago/ },
  { id: "COMPROMISO", ficha: "A4", label: "Promete pagar en una fecha", pattern: /pago (manana|el lunes|el viernes|la otra semana)|le pago|quincena|esperame|dame (unos )?dias|prorroga/ },
  { id: "FACTURA", ficha: "A5", label: "Pide factura o recibo", pattern: /factura|recibo|cuenta de cobro/ },
  { id: "RENOVAR", ficha: "B2", label: "Quiere renovar", pattern: /renov|otro mes|seguir con el servicio|pagar (el )?mes/ },
  { id: "PRECIO", ficha: "B1", label: "Pregunta precio o planes", pattern: /precio|cuanto (vale|cuesta)|planes|informacion|prueba gratis/ },
  { id: "CAMBIO_PLAN", ficha: "B5", label: "Cambio de plan o pantallas", pattern: /cambi\w* (de )?plan|mas pantallas|otra pantalla|menos pantallas/ },
  { id: "REFERIDO", ficha: "B6", label: "Referido", pattern: /referid|recomende|refiere/ },
  { id: "CONTENIDO", ficha: "B7", label: "Pide contenido", pattern: /pelicula|serie|partido|agregar canal|canal nuevo/ },
];

export type Suggestion = { ficha: Ficha; rules: string[] };
export type Classification = { suggestions: Suggestion[]; ambiguous: boolean; category: "A" | "B" | "C" | null };

/** Reglas explícitas primero; si ninguna aplica, búsqueda por palabras clave de las propias fichas. */
export function classifyMessage(fichas: readonly Ficha[], message: string): Classification {
  const text = fold(message).slice(0, 600);
  const byId = new Map(fichas.map((f) => [f.id, f]));
  const hits = new Map<string, string[]>();
  for (const rule of CLASSIFICATION_RULES) {
    if (!rule.pattern.test(text) || !byId.has(rule.ficha)) continue;
    hits.set(rule.ficha, [...(hits.get(rule.ficha) ?? []), rule.label]);
  }
  let suggestions: Suggestion[] = [...hits.entries()].map(([id, rules]) => ({ ficha: byId.get(id)!, rules }));
  if (!suggestions.length && text.trim()) {
    suggestions = searchFichas(fichas, message).slice(0, 4).map((ficha) => ({ ficha, rules: ["Coincide con palabras clave de la ficha"] }));
  }
  const categories = new Set(suggestions.map((s) => s.ficha.category));
  return { suggestions, ambiguous: suggestions.length > 1, category: categories.size === 1 ? [...categories][0] : null };
}

/** Primer bloque ```mensaje de la ficha (la respuesta copiable). */
export function scriptOf(ficha: Ficha) {
  const m = ficha.body.match(/```mensaje\s*\n([\s\S]*?)```/);
  return m ? m[1].trim() : null;
}
