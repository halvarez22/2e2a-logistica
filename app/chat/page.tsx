 "use client";
 
 import { useState } from "react";
 import { motion } from "framer-motion";
 
 type ChatMsg = { role: "user" | "assistant"; content: string; warnings?: string[] };
 
 export default function ChatPage() {
   const [msgs, setMsgs] = useState<ChatMsg[]>([]);
   const [q, setQ] = useState("");
   const [loading, setLoading] = useState(false);
 
  async function askWithText(text: string) {
    if (!text.trim()) return;
    const userMsg: ChatMsg = { role: "user", content: text };
     setMsgs((m) => [...m, userMsg]);
     setLoading(true);
     try {
       const res = await fetch("/api/chat", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text }),
       });
       const json = await res.json();
       const a: ChatMsg = {
         role: "assistant",
         content: json.error ? `Error: ${json.error}` : json.answer,
         warnings: json.warnings,
       };
       setMsgs((m) => [...m, a]);
    } catch {
       setMsgs((m) => [...m, { role: "assistant", content: "Error de conexión" }]);
     } finally {
       setLoading(false);
       setQ("");
     }
   }
  async function ask() {
    await askWithText(q);
  }
 
   return (
     <div className="min-h-screen w-full bg-black text-zinc-50">
       <div className="mx-auto max-w-3xl p-6">
         <h1 className="text-3xl font-semibold">Chat Operativo</h1>
         <p className="mt-2 text-zinc-400">Consulta estado de unidades, subidas/bajadas y alertas.</p>
        <div className="mt-6 rounded-2xl bg-zinc-950 p-4">
          <div className="mb-4 flex flex-wrap gap-2">
            {[
              "Actividad por turno",
              "Actividad por día",
              "Unidades con excepciones",
              "Unidades inactivas",
              "Subidas vs bajadas",
              "Top unidades más activas",
              "Estado de MA-006668",
              "Estado de MA-006628 hoy",
            ].map((s) => (
              <button
                key={s}
                onClick={() => askWithText(s)}
                className="rounded-full bg-zinc-800 px-3 py-1 text-sm transition hover:bg-zinc-700"
                disabled={loading}
              >
                {s}
              </button>
            ))}
          </div>
           <div className="space-y-3">
             {msgs.map((m, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, y: 4 }}
                 animate={{ opacity: 1, y: 0 }}
                 className={`rounded-xl p-3 ${m.role === "user" ? "bg-zinc-900" : "bg-zinc-800"}`}
               >
                 <div className="text-sm">{m.role === "user" ? "Tú" : "Asistente"}</div>
                 <div className="mt-1 text-base">{m.content}</div>
                 {m.warnings && m.warnings.length > 0 && (
                   <div className="mt-2 space-y-1">
                     {m.warnings.map((w: string, j: number) => (
                       <div key={j} className="rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-300">
                         {w}
                       </div>
                     ))}
                   </div>
                 )}
               </motion.div>
             ))}
           </div>
           <div className="mt-4 flex gap-2">
             <input
               value={q}
               onChange={(e) => setQ(e.target.value)}
               placeholder="Ej: estado de MA-006668 hoy"
               className="flex-1 rounded-xl bg-zinc-900 p-3 outline-none"
               onKeyDown={(e) => {
                 if (e.key === "Enter") ask();
               }}
             />
             <button
               className="rounded-xl bg-zinc-50 px-4 py-3 font-medium text-black transition hover:bg-white disabled:opacity-50"
               onClick={ask}
               disabled={loading}
             >
               {loading ? "Consultando..." : "Enviar"}
             </button>
           </div>
         </div>
       </div>
     </div>
   );
 }
