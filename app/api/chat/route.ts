import { NextResponse } from "next/server";
import { z } from "zod";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { computeKPIs, detectAnomalies } from "@/lib/anomaly";
import type { Movimiento, Unidad } from "@/lib/domain";
 
 const bodySchema = z.object({ q: z.string().min(1) });
 
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parse = bodySchema.safeParse(json);
  if (!parse.success) return NextResponse.json({ error: "Entrada inválida" }, { status: 400 });
  if (!db) return NextResponse.json({ error: "Firebase no configurado" }, { status: 503 });
 
   const qText = parse.data.q.toLowerCase();
  const ref = collection(db, "movimientos");
  const snap = await getDocs(ref);
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Movimiento[];
 
   let answer = "No tengo datos suficientes.";
   let subset: Movimiento[] = data;
 
   const unidadMatch = qText.match(/ma-\d{6,}|ma-\d+/i);
   if (unidadMatch) {
     const codigo = unidadMatch[0].toUpperCase();
     subset = data.filter((m) => m.unidadId.toUpperCase().includes(codigo));
   }
 
  const kpis = computeKPIs(subset);
  const warnings = detectAnomalies(subset);
 
  if (qText.includes("estado") || unidadMatch) {
    answer = `Total: ${kpis.total}, Subidas: ${kpis.subidas}, Bajadas: ${kpis.bajadas}, Excepciones: ${kpis.excepciones}.`;
  } else if (qText.includes("subida") || qText.includes("bajada")) {
    answer = `Subidas: ${kpis.subidas}, Bajadas: ${kpis.bajadas}.`;
  } else if (qText.includes("turno")) {
    answer = `Turno 1: ${kpis.porTurno[0]}, Turno 2: ${kpis.porTurno[1]}, Turno 3: ${kpis.porTurno[2]}.`;
  } else if (qText.includes("excepcion") || qText.includes("tiempo")) {
    answer = `Excepciones: ${kpis.excepciones}.`;
  } else if (qText.includes("top") || qText.includes("activas")) {
    const counts = new Map<string, number>();
    subset.forEach((m) => {
      counts.set(m.unidadId, (counts.get(m.unidadId) || 0) + 1);
    });
    const ranking = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([u, n], i) => `${i + 1}. ${u} (${n})`)
      .join(", ");
    answer = ranking ? `Top unidades: ${ranking}` : "No hay datos para ranking.";
  } else if (qText.includes("dia") || qText.includes("día")) {
    const byDay = new Map<string, number>();
    subset.forEach((m) => byDay.set(m.dia, (byDay.get(m.dia) || 0) + 1));
    const s = [...byDay.entries()]
      .map(([d, n]) => `${d}: ${n}`)
      .join(", ");
    answer = s ? `Actividad por día: ${s}` : "Sin actividad registrada por día.";
  } else if (qText.includes("cumplimiento")) {
    const planned = subset.filter((m) => m.planificado).length;
    const done = subset.filter((m) => m.realizado).length;
    const rate = planned ? Math.round((done / planned) * 100) : 0;
    answer = `Cumplimiento: ${rate}% (${done}/${planned}).`;
  } else if (qText.includes("inactiva") || qText.includes("inactivas")) {
    const unitsSnap = await getDocs(collection(db, "unidades"));
    const units = unitsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Unidad[];
    if (!units.length) {
      answer = "No hay catálogo de unidades.";
    } else {
      const days = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
      const now = new Date();
      const mapDay = days[now.getDay() === 0 ? 6 : now.getDay() - 1];
      const explicitDay =
        qText.includes("lunes")
          ? "LUNES"
          : qText.includes("martes")
          ? "MARTES"
          : qText.includes("miércoles")
          ? "MIÉRCOLES"
          : qText.includes("miercoles")
          ? "MIÉRCOLES"
          : qText.includes("jueves")
          ? "JUEVES"
          : qText.includes("viernes")
          ? "VIERNES"
          : qText.includes("sábado")
          ? "SÁBADO"
          : qText.includes("sabado")
          ? "SÁBADO"
          : mapDay;
      const activeSet = new Set(
        data.filter((m) => m.dia === explicitDay).map((m) => m.unidadId.toUpperCase())
      );
      const inactives = units
        .filter((u) => u.activo !== false)
        .filter((u) => !activeSet.has((u.codigo || u.id).toUpperCase()))
        .map((u) => u.codigo || u.id);
      answer =
        inactives.length > 0
          ? `Unidades inactivas (${explicitDay}): ${inactives.slice(0, 20).join(", ")}`
          : `Sin unidades inactivas en ${explicitDay}.`;
    }
  } else {
    answer = `Total movimientos: ${kpis.total}.`;
  }
 
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "llama-3.1-70b-versatile";
  if (apiKey) {
    const sample = subset.slice(0, 15).map((m) => ({
      unidadId: m.unidadId,
      dia: m.dia,
      tipo: m.tipo,
      turno: m.turno,
      estado: m.estado,
      codigoE: m.codigoE || null,
    }));
    const sys = `Eres un asistente de operaciones. Responde con precisión sobre subidas, bajadas, turnos y estados, usando los datos.`;
    const user = `Pregunta: "${parse.data.q}". KPIs: total=${kpis.total}, subidas=${kpis.subidas}, bajadas=${kpis.bajadas}, excepciones=${kpis.excepciones}, turnos=${kpis.porTurno.join(",")}. Muestras: ${JSON.stringify(
      sample
    )}.`
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: sys },
            { role: "user", content: user },
          ],
          temperature: 0.2,
        }),
      });
      const json = await res.json();
      const text =
        json?.choices?.[0]?.message?.content ||
        json?.choices?.[0]?.text ||
        answer;
      answer = text;
    } catch {
    }
  }
 
   return NextResponse.json({ answer, warnings, count: subset.length });
 }
