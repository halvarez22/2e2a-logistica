 "use client";
 
 import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
 import {
   actualizarUnidadActivo,
   crearUnidad,
   eliminarUnidad,
   fetchUnidades,
 } from "@/lib/unidades";
 import { useState } from "react";
 import { motion } from "framer-motion";
 
 export default function UnidadesPage() {
   const qc = useQueryClient();
   const { data = [], isLoading } = useQuery({
     queryKey: ["unidades"],
     queryFn: fetchUnidades,
   });
 
   const [codigo, setCodigo] = useState("");
 
   const createMut = useMutation({
     mutationFn: crearUnidad,
     onSuccess: () => qc.invalidateQueries({ queryKey: ["unidades"] }),
   });
   const toggleMut = useMutation({
     mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
       actualizarUnidadActivo(id, activo),
     onSuccess: () => qc.invalidateQueries({ queryKey: ["unidades"] }),
   });
   const deleteMut = useMutation({
     mutationFn: eliminarUnidad,
     onSuccess: () => qc.invalidateQueries({ queryKey: ["unidades"] }),
   });
 
   return (
     <div className="min-h-screen w-full bg-black text-zinc-50">
       <div className="mx-auto max-w-4xl p-8">
         <h1 className="text-3xl font-semibold">Unidades</h1>
         <p className="mt-2 text-zinc-400">Administra el catálogo de unidades (MA‑0066xx).</p>
 
         <motion.form
           className="mt-6 flex gap-2 rounded-2xl bg-zinc-950 p-4"
           initial={{ opacity: 0, y: 6 }}
           animate={{ opacity: 1, y: 0 }}
           onSubmit={async (e) => {
             e.preventDefault();
             if (!codigo.trim()) return;
             await createMut.mutateAsync(codigo.trim());
             setCodigo("");
           }}
         >
           <input
             value={codigo}
             onChange={(e) => setCodigo(e.target.value)}
             placeholder="Código unidad (MA-006668)"
             className="flex-1 rounded-xl bg-zinc-900 p-3 outline-none"
           />
           <button
             className="rounded-xl bg-zinc-50 px-4 py-3 font-medium text-black transition hover:bg-white disabled:opacity-50"
             disabled={createMut.isPending}
             type="submit"
           >
             {createMut.isPending ? "Agregando..." : "Agregar"}
           </button>
         </motion.form>
 
         <div className="mt-8 rounded-2xl bg-zinc-950 p-4">
           <h2 className="text-xl font-semibold">Listado</h2>
           {isLoading ? (
             <div className="mt-4 h-24 animate-pulse rounded bg-zinc-900" />
           ) : (
             <div className="mt-4 overflow-x-auto">
               <table className="min-w-full text-left text-sm">
                 <thead className="text-zinc-400">
                   <tr>
                     <th className="p-2">Código</th>
                     <th className="p-2">Activo</th>
                     <th className="p-2">Acciones</th>
                   </tr>
                 </thead>
                 <tbody>
                   {data.map((u) => (
                     <tr key={u.id} className="border-t border-zinc-800">
                       <td className="p-2">{u.codigo || u.id}</td>
                       <td className="p-2">
                         <button
                           onClick={() =>
                             toggleMut.mutate({ id: u.id, activo: !(u.activo !== false) })
                           }
                           className={`rounded-full px-3 py-1 text-sm ${
                             u.activo !== false
                               ? "bg-emerald-600/30 text-emerald-300"
                               : "bg-zinc-700 text-zinc-300"
                           }`}
                         >
                           {u.activo !== false ? "Activo" : "Inactivo"}
                         </button>
                       </td>
                       <td className="p-2">
                         <button
                           onClick={() => deleteMut.mutate(u.id)}
                           className="rounded-full bg-red-900/40 px-3 py-1 text-sm text-red-300"
                         >
                           Eliminar
                         </button>
                       </td>
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
