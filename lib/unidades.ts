 import { db } from "./firebase";
 import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
 import type { Unidad } from "./domain";
 
 export async function fetchUnidades(): Promise<Unidad[]> {
   if (!db) return [];
   const snap = await getDocs(collection(db, "unidades"));
  return snap.docs.map((d) => {
    const data = d.data() as { codigo?: string; activo?: boolean };
    return { id: d.id, codigo: data.codigo ?? d.id, activo: data.activo ?? true };
  });
 }
 
 export async function crearUnidad(codigo: string) {
   if (!db) throw new Error("Firebase no está configurado");
   const ref = collection(db, "unidades");
   const docRef = await addDoc(ref, { codigo, activo: true });
   return docRef.id;
 }
 
 export async function actualizarUnidadActivo(id: string, activo: boolean) {
   if (!db) throw new Error("Firebase no está configurado");
   const ref = doc(db, "unidades", id);
   await updateDoc(ref, { activo });
 }
 
 export async function eliminarUnidad(id: string) {
   if (!db) throw new Error("Firebase no está configurado");
   const ref = doc(db, "unidades", id);
   await deleteDoc(ref);
 }
