 import type { Movimiento } from "./domain";
 
 export function computeKPIs(data: Movimiento[]) {
   const total = data.length;
   const subidas = data.filter((m) => m.tipo === "SUBIDA").length;
   const bajadas = data.filter((m) => m.tipo === "BAJADA").length;
   const excepciones = data.filter((m) => m.estado !== "NORMAL").length;
   const porTurno = [1, 2, 3].map((t) => data.filter((m) => m.turno === t).length);
   return { total, subidas, bajadas, excepciones, porTurno };
 }
 
 export function detectAnomalies(data: Movimiento[]) {
   const alerts: string[] = [];
   const { total, excepciones, porTurno } = computeKPIs(data);
   if (total > 0) {
     const rate = excepciones / total;
     if (rate >= 0.2) alerts.push("Alta tasa de excepciones en la jornada");
   }
   porTurno.forEach((n, i) => {
     if (n === 0) alerts.push(`Sin actividad en turno ${i + 1}`);
   });
   const porUnidadDia = new Map<string, { subidas: number; bajadas: number }>();
   data.forEach((m) => {
     const key = `${m.unidadId}|${m.dia}`;
     const curr = porUnidadDia.get(key) || { subidas: 0, bajadas: 0 };
     if (m.tipo === "SUBIDA") curr.subidas++;
     else curr.bajadas++;
     porUnidadDia.set(key, curr);
   });
   for (const [k, v] of porUnidadDia.entries()) {
     if (v.subidas > 0 && v.bajadas === 0) alerts.push(`Unidad sin bajadas registradas: ${k}`);
     if (v.bajadas > 0 && v.subidas === 0) alerts.push(`Unidad sin subidas registradas: ${k}`);
   }
   return alerts;
 }
