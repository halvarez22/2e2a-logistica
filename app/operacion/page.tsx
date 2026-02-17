 "use client";
 
 import { useMutation } from "@tanstack/react-query";
 import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
 import type { MovementTurno, MovementType, MovementStatus, DayOfWeek } from "@/lib/domain";
 import { useState } from "react";
 import { motion } from "framer-motion";
 
 async function crearMovimiento(input: {
   unidadId: string;
   jornadaId: string;
   dia: DayOfWeek;
   tipo: MovementType;
   turno: MovementTurno;
   estado: MovementStatus;
   codigoE?: string;
   observaciones?: string;
 }) {
  if (!db) throw new Error("Firebase no está configurado");
  const ref = collection(db, "movimientos");
   const doc = await addDoc(ref, {
     ...input,
     planificado: true,
     realizado: false,
     tsPlan: Date.now(),
     createdAt: serverTimestamp(),
   });
   return doc.id;
 }
 
 export default function OperacionPage() {
   const [unidadId, setUnidad] = useState("");
   const [jornadaId, setJornada] = useState("");
   const [dia, setDia] = useState<DayOfWeek>("LUNES");
   const [tipo, setTipo] = useState<MovementType>("SUBIDA");
   const [turno, setTurno] = useState<MovementTurno>(1);
   const [estado, setEstado] = useState<MovementStatus>("NORMAL");
   const [codigoE, setCodigoE] = useState("");
   const [observaciones, setObs] = useState("");
 
   const { mutateAsync, isPending } = useMutation({
     mutationFn: crearMovimiento,
   });
 
   return (
     <div className="min-h-screen w-full bg-black text-zinc-50">
       <div className="mx-auto max-w-2xl p-8">
         <h1 className="text-3xl font-semibold">Captura de Movimiento</h1>
         <p className="mt-2 text-zinc-400">Registra SUBIDA/BAJADA por turno.</p>
 
         <motion.form
           className="mt-8 grid grid-cols-1 gap-4 rounded-2xl bg-zinc-950 p-6"
           initial={{ opacity: 0, y: 8 }}
           animate={{ opacity: 1, y: 0 }}
           onSubmit={async (e) => {
             e.preventDefault();
             const id = await mutateAsync({
               unidadId,
               jornadaId,
               dia,
               tipo,
               turno,
               estado,
               codigoE: codigoE || undefined,
               observaciones: observaciones || undefined,
             });
             setUnidad("");
             setJornada("");
             setCodigoE("");
             setObs("");
             alert("Movimiento creado: " + id);
           }}
         >
           <input
             className="rounded-xl bg-zinc-900 p-3 outline-none"
             placeholder="Unidad (MA-0066xx)"
             value={unidadId}
             onChange={(e) => setUnidad(e.target.value)}
             required
           />
           <input
             className="rounded-xl bg-zinc-900 p-3 outline-none"
             placeholder="Jornada ID"
             value={jornadaId}
             onChange={(e) => setJornada(e.target.value)}
             required
           />
           <select
             className="rounded-xl bg-zinc-900 p-3 outline-none"
             value={dia}
             onChange={(e) => setDia(e.target.value as DayOfWeek)}
           >
             <option value="LUNES">LUNES</option>
             <option value="MARTES">MARTES</option>
             <option value="MIÉRCOLES">MIÉRCOLES</option>
             <option value="JUEVES">JUEVES</option>
             <option value="VIERNES">VIERNES</option>
             <option value="SÁBADO">SÁBADO</option>
           </select>
           <select
             className="rounded-xl bg-zinc-900 p-3 outline-none"
             value={tipo}
             onChange={(e) => setTipo(e.target.value as MovementType)}
           >
             <option value="SUBIDA">SUBIDA</option>
             <option value="BAJADA">BAJADA</option>
           </select>
           <select
             className="rounded-xl bg-zinc-900 p-3 outline-none"
             value={turno}
             onChange={(e) => setTurno(Number(e.target.value) as MovementTurno)}
           >
             <option value={1}>Turno 1</option>
             <option value={2}>Turno 2</option>
             <option value={3}>Turno 3</option>
           </select>
           <select
             className="rounded-xl bg-zinc-900 p-3 outline-none"
             value={estado}
             onChange={(e) => setEstado(e.target.value as MovementStatus)}
           >
             <option value="NORMAL">Normal</option>
             <option value="BAJO EN TIEMPO">BAJO EN TIEMPO</option>
             <option value="EXCEPCIÓN">Excepción</option>
           </select>
           <input
             className="rounded-xl bg-zinc-900 p-3 outline-none"
             placeholder="Código E (opcional)"
             value={codigoE}
             onChange={(e) => setCodigoE(e.target.value)}
           />
           <textarea
             className="rounded-xl bg-zinc-900 p-3 outline-none"
             placeholder="Observaciones"
             value={observaciones}
             onChange={(e) => setObs(e.target.value)}
           />
           <button
             className="rounded-full bg-zinc-50 px-5 py-3 font-medium text-black transition hover:bg-white disabled:opacity-50"
             disabled={isPending}
             type="submit"
           >
             {isPending ? "Guardando..." : "Guardar movimiento"}
           </button>
         </motion.form>
       </div>
     </div>
   );
 }
