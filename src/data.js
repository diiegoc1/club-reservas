// Datos semilla del Club Unión.
// No hay backend: estos datos viven en el navegador y se pueden editar acá.

export const STORAGE_KEY = "club-reservas:v1";

export const NOMBRE_CLUB = "Club Unión";

export const CANCHAS = [
  { id: "padel-1", nombre: "Pádel 1", deporte: "Pádel", color: "#2563eb" },
  { id: "padel-2", nombre: "Pádel 2", deporte: "Pádel", color: "#2563eb" },
  { id: "tenis-1", nombre: "Tenis 1", deporte: "Tenis", color: "#16a34a" },
  { id: "futbol-1", nombre: "Fútbol 5", deporte: "Fútbol", color: "#d97706" },
];

// Turnos de una hora, de 08:00 a 21:00 (el último turno empieza a las 21:00).
export const HORARIOS = Array.from({ length: 14 }, (_, i) =>
  `${String(8 + i).padStart(2, "0")}:00`
);

// Socios de práctica. El PIN es solo para la demo: no hay autenticación real.
export const SOCIOS = [
  { numero: "1001", nombre: "Lucía Gómez", pin: "1234", rol: "socio" },
  { numero: "1002", nombre: "Tomás Pérez", pin: "1234", rol: "socio" },
  { numero: "1003", nombre: "Abril Díaz", pin: "1234", rol: "socio" },
  { numero: "1004", nombre: "Joaquín Ruiz", pin: "1234", rol: "encargado" },
  { numero: "1005", nombre: "Sr. Ramírez", pin: "1234", rol: "admin" },
];

// Número de WhatsApp del club con código de país, sin "+" ni espacios.
// Si queda vacío, el enlace abre WhatsApp sin destinatario.
export const CLUB_WHATSAPP = "";
