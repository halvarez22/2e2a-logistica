 export type DayOfWeek =
   | "LUNES"
   | "MARTES"
   | "MIÉRCOLES"
   | "JUEVES"
   | "VIERNES"
   | "SÁBADO";
 
 export type MovementType = "SUBIDA" | "BAJADA";
 export type MovementTurno = 1 | 2 | 3;
 
 export type MovementStatus =
   | "NORMAL"
   | "BAJO EN TIEMPO"
   | "EXCEPCIÓN";
 
 export type Unidad = {
   id: string;
   codigo: string;
   activo: boolean;
 };
 
 export type Jornada = {
   id: string;
   fecha: string;
   dia: DayOfWeek;
   notas?: string;
   estado: "ABIERTA" | "CERRADA";
 };
 
 export type Movimiento = {
   id: string;
   jornadaId: string;
   unidadId: string;
  dia: DayOfWeek;
   tipo: MovementType;
   turno: MovementTurno;
   estado: MovementStatus;
   codigoE?: string;
   planificado: boolean;
   realizado: boolean;
   tsPlan?: number;
   tsReal?: number;
   observaciones?: string;
 };
