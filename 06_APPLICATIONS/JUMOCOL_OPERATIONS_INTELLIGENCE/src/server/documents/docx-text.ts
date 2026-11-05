// Read-only DOCX → Markdown for the document viewer. No dependencies: ZIP central directory + raw inflate.
// The original file is only read; nothing is written or cached on disk.
import { inflateRawSync } from "node:zlib";

const MAX_XML_BYTES = 8 * 1024 * 1024; // zip-bomb guard for word/document.xml

function readEntry(zip: Buffer, wanted: string): Buffer | null {
  // End Of Central Directory: signature 0x06054b50 within the last 64 KiB.
  let eocd = -1;
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 65_557); i--) {
    if (zip.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("DOCX inválido: sin directorio central.");
  const entries = zip.readUInt16LE(eocd + 10);
  let offset = zip.readUInt32LE(eocd + 16);
  for (let n = 0; n < entries && offset + 46 <= zip.length; n++) {
    if (zip.readUInt32LE(offset) !== 0x02014b50) break;
    const method = zip.readUInt16LE(offset + 10);
    const compressed = zip.readUInt32LE(offset + 20);
    const size = zip.readUInt32LE(offset + 24);
    const nameLength = zip.readUInt16LE(offset + 28);
    const extraLength = zip.readUInt16LE(offset + 30);
    const commentLength = zip.readUInt16LE(offset + 32);
    const local = zip.readUInt32LE(offset + 42);
    const name = zip.toString("utf8", offset + 46, offset + 46 + nameLength);
    offset += 46 + nameLength + extraLength + commentLength;
    if (name !== wanted) continue;
    if (size > MAX_XML_BYTES) throw new Error("DOCX demasiado grande para el visor.");
    if (zip.readUInt32LE(local) !== 0x04034b50) throw new Error("DOCX inválido: cabecera local.");
    const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
    const data = zip.subarray(start, start + compressed);
    if (method === 0) return Buffer.from(data);
    if (method === 8) return inflateRawSync(data, { maxOutputLength: MAX_XML_BYTES });
    throw new Error("DOCX con compresión no soportada.");
  }
  return null;
}

const decode = (value: string) => value
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
  .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&amp;/g, "&");

function paragraphText(xml: string) {
  let text = "";
  for (const part of xml.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:(?:tab|br|cr)\/>/g)) text += part[1] !== undefined ? decode(part[1]) : " ";
  return text.replace(/\s+/g, " ").trim();
}

function paragraphToMarkdown(xml: string) {
  const text = paragraphText(xml);
  if (!text) return "";
  const style = xml.match(/<w:pStyle w:val="([^"]+)"/)?.[1] ?? "";
  const heading = style.match(/^(?:Heading|Ttulo|Titulo|T[ií]tulo)(\d)$/i)?.[1];
  if (/^(Title|Ttulo|Titulo)$/i.test(style)) return `# ${text}`;
  if (heading) return `${"#".repeat(Math.min(Number(heading) + 1, 3))} ${text}`;
  if (/<w:numPr>/.test(xml) || /^List/i.test(style)) return `- ${text}`;
  return text;
}

function tableToMarkdown(xml: string) {
  const rows = [...xml.matchAll(/<w:tr[\s>][\s\S]*?<\/w:tr>/g)].map(row =>
    [...row[0].matchAll(/<w:tc[\s>][\s\S]*?<\/w:tc>/g)].map(cell =>
      [...cell[0].matchAll(/<w:p[\s>][\s\S]*?<\/w:p>/g)].map(p => paragraphText(p[0])).filter(Boolean).join(" ").replace(/\|/g, "/")));
  const width = Math.max(0, ...rows.map(r => r.length));
  if (!width) return "";
  const pad = (r: string[]) => `| ${Array.from({ length: width }, (_, i) => r[i] || " ").join(" | ")} |`;
  return [pad(rows[0]), `| ${Array(width).fill("---").join(" | ")} |`, ...rows.slice(1).map(pad)].join("\n");
}

/** Returns Markdown for word/document.xml: headings, paragraphs, list items and tables, in document order. */
export function docxToMarkdown(file: Buffer): string {
  const xml = readEntry(file, "word/document.xml")?.toString("utf8");
  if (!xml) throw new Error("DOCX sin contenido principal.");
  const body = xml.match(/<w:body>([\s\S]*)<\/w:body>/)?.[1] ?? xml;
  const blocks: string[] = [];
  for (const match of body.matchAll(/<w:tbl>[\s\S]*?<\/w:tbl>|<w:p[\s>][\s\S]*?<\/w:p>/g)) {
    const block = match[0].startsWith("<w:tbl>") ? tableToMarkdown(match[0]) : paragraphToMarkdown(match[0]);
    if (block) blocks.push(block);
  }
  return blocks.join("\n\n");
}
