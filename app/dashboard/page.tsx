 "use client";
 
 import { useQuery } from "@tanstack/react-query";
 import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
 import type { Movimiento } from "@/lib/domain";
 import { motion } from "framer-motion";
 
async function fetchMovimientos() {
  if (!db) return [];
  const snap = await getDocs(collection(db, "movimientos"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Movimiento[];
 }
 
 function kpiCards(data: Movimiento[]) {
   const total = data.length;
   const subidas = data.filter((m) => m.tipo === "SUBIDA").length;
   const bajadas = data.filter((m) => m.tipo === "BAJADA").length;
   const excepciones = data.filter((m) => m.estado !== "NORMAL").length;
   return [
     { title: "Total movimientos", value: total },
     { title: "Subidas", value: subidas },
     { title: "Bajadas", value: bajadas },
     { title: "Excepciones", value: excepciones },
   ];
 }
 
 export default function DashboardPage() {
   const { data = [], isLoading } = useQuery({
     queryKey: ["movimientos"],
     queryFn: fetchMovimientos,
   });
   const cards = kpiCards(data);
 
   return (
     <div className="min-h-screen w-full bg-black text-zinc-50">
       <div className="mx-auto max-w-6xl p-8">
         <h1 className="text-3xl font-semibold">Dashboard Operativo</h1>
         <p className="mt-2 text-zinc-400">
           Vista gerencial con KPIs y detalle filtrable.
         </p>
 
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? [0, 1, 2, 3].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 shadow-lg"
                >
                  <div className="h-6 w-32 animate-pulse rounded bg-zinc-800" />
                </motion.div>
              ))
            : cards.map((c, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 8 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.3, delay: i * 0.05 }}
               className="rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 shadow-lg"
             >
                 <>
                   <div className="text-sm text-zinc-400">{c.title}</div>
                   <div className="mt-2 text-2xl font-bold">{c.value}</div>
                 </>
             </motion.div>
            ))}
         </div>
 
         <div className="mt-10 rounded-2xl bg-zinc-950 p-6">
           <h2 className="text-xl font-semibold">Detalle</h2>
           {isLoading ? (
             <div className="mt-4 h-24 animate-pulse rounded bg-zinc-900" />
           ) : (
             <div className="mt-4 overflow-x-auto">
               <table className="min-w-full text-left text-sm">
                 <thead className="text-zinc-400">
                   <tr>
                     <th className="p-2">Unidad</th>
                     <th className="p-2">Día</th>
                     <th className="p-2">Tipo</th>
                     <th className="p-2">Turno</th>
                     <th className="p-2">Estado</th>
                   </tr>
                 </thead>
                 <tbody>
                   {data.map((m) => (
                     <tr key={m.id} className="border-t border-zinc-800">
                       <td className="p-2">{m.unidadId}</td>
                       <td className="p-2">{m.dia}</td>
                       <td className="p-2">{m.tipo}</td>
                       <td className="p-2">{m.turno}</td>
                       <td className="p-2">{m.estado}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
         </div>
       </div>
     </div>
   );
 }
