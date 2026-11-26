// Estado, persistencia y reglas de negocio de Club Reservas.
// Este módulo no toca el DOM: recibe datos y devuelve resultados.

import {
  CANCHAS,
  CLUB_WHATSAPP,
  HORARIOS,
  SOCIOS,
  STORAGE_KEY,
} from "./data.js";

const VERSION = 1;

/* ------------------------------------------------------------------ */
/* Fechas                                                              */
/* ------------------------------------------------------------------ */

/** Devuelve la fecha local de hoy como "YYYY-MM-DD". */
export function hoyISO() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

/** Suma (o resta) días a una fecha "YYYY-MM-DD" sin pasar por UTC. */
export function sumarDias(fechaISO, dias) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const fecha = new Date(y, m - 1, d);
  fecha.setDate(fecha.getDate() + Number(dias));
  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, "0"),
    String(fecha.getDate()).padStart(2, "0"),
  ].join("-");
}

/** Formatea una fecha "YYYY-MM-DD" para mostrar en pantalla. */
export function formatearFecha(fechaISO) {
  const [y, m, d] = String(fechaISO).split("-").map(Number);
  if (!y || !m || !d) return String(fechaISO);
  const fecha = new Date(y, m - 1, d);
  const texto = fecha.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/* ------------------------------------------------------------------ */
/* Estado                                                              */
/* ------------------------------------------------------------------ */

function estadoInicial() {
  return {
    version: VERSION,
    reservas: [],
    bloqueos: [],
    sesion: null,
    tema: "claro",
  };
}

function nuevoId(prefijo) {
  const random =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefijo}-${random}`;
}

function sembrarDemo(estado) {
  const hoy = hoyISO();
  const manana = sumarDias(hoy, 1);
  const ahora = new Date().toISOString();

  estado.reservas = [
    {
      id: "demo-1",
      canchaId: "padel-1",
      fecha: hoy,
      hora: "18:00",
      socioNumero: "1001",
      socioNombre: "Lucía Gómez",
      estado: "confirmada",
      creadaEn: ahora,
    },
    {
      id: "demo-2",
      canchaId: "padel-2",
      fecha: hoy,
      hora: "19:00",
      socioNumero: "1002",
      socioNombre: "Tomás Pérez",
      estado: "confirmada",
      creadaEn: ahora,
    },
    {
      id: "demo-3",
      canchaId: "futbol-1",
      fecha: manana,
      hora: "20:00",
      socioNumero: "1003",
      socioNombre: "Abril Díaz",
      estado: "confirmada",
      creadaEn: ahora,
    },
  ];

  estado.bloqueos = [
    {
      id: "demo-b1",
      canchaId: "tenis-1",
      fecha: hoy,
      hora: "10:00",
      motivo: "Mantenimiento del césped",
      creadoEn: ahora,
    },
  ];
}

/** Carga el estado desde localStorage. Si no existe, siembra datos demo. */
export function cargarEstado() {
  const base = estadoInicial();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const estado = estadoInicial();
      sembrarDemo(estado);
      guardarEstado(estado);
      return estado;
    }

    const guardado = JSON.parse(raw);
    return {
      ...base,
      ...guardado,
      version: VERSION,
      reservas: Array.isArray(guardado.reservas) ? guardado.reservas : [],
      bloqueos: Array.isArray(guardado.bloqueos) ? guardado.bloqueos : [],
      sesion: guardado.sesion ?? null,
      tema: guardado.tema === "oscuro" ? "oscuro" : "claro",
    };
  } catch (error) {
    console.warn("No se pudo leer el estado guardado. Se reinicia.", error);
    return base;
  }
}

/** Guarda el estado completo. */
export function guardarEstado(estado) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  } catch (error) {
    console.warn("No se pudo guardar el estado en localStorage.", error);
  }
}

/** Borra los datos locales y recarga la página. */
export function resetEstado() {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

/* ------------------------------------------------------------------ */
/* Consultas                                                           */
/* ------------------------------------------------------------------ */

export function getSocio(numero) {
  return SOCIOS.find((s) => s.numero === String(numero)) ?? null;
}

/** Devuelve los 14 turnos de una cancha para una fecha. */
export function turnosDelDia(estado, fecha, canchaId) {
  return HORARIOS.map((hora) => {
    const reserva = estado.reservas.find(
      (r) =>
        r.canchaId === canchaId &&
        r.fecha === fecha &&
        r.hora === hora &&
        r.estado !== "cancelada"
    );

    if (reserva) return { hora, estado: "reservado", reserva };

    const bloqueo = estado.bloqueos.find(
      (b) =>
        b.canchaId === canchaId && b.fecha === fecha && b.hora === hora
    );

    if (bloqueo) return { hora, estado: "bloqueado", bloqueo };

    return { hora, estado: "libre" };
  });
}

export function reservasDeSocio(estado, numero) {
  return estado.reservas
    .filter((r) => r.socioNumero === numero && r.estado !== "cancelada")
    .sort((a, b) =>
      `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`)
    );
}

export function estadisticasPorCancha(estado) {
  return CANCHAS.map((cancha) => ({
    canchaId: cancha.id,
    nombre: cancha.nombre,
    total: estado.reservas.filter(
      (r) => r.canchaId === cancha.id && r.estado !== "cancelada"
    ).length,
  })).sort((a, b) => b.total - a.total);
}

/** Se puede cancelar hasta 2 horas antes del turno. */
export function puedeCancelar(reserva) {
  const [y, m, d] = String(reserva.fecha).split("-").map(Number);
  const [hh, mm] = String(reserva.hora).split(":").map(Number);
  const inicio = new Date(y, m - 1, d, hh, mm, 0, 0);
  if (Number.isNaN(inicio.getTime())) return false;
  return inicio.getTime() - Date.now() >= 2 * 60 * 60 * 1000;
}

/* ------------------------------------------------------------------ */
/* Acciones                                                            */
/* ------------------------------------------------------------------ */

export function reservar(estado, { canchaId, fecha, hora, socio }) {
  if (!socio) return { ok: false, error: "sin_sesion" };

  const cancha = CANCHAS.find((c) => c.id === canchaId);
  if (!cancha) return { ok: false, error: "cancha_invalida" };
  if (!HORARIOS.includes(hora)) return { ok: false, error: "hora_invalida" };

  const turno = turnosDelDia(estado, fecha, canchaId).find(
    (t) => t.hora === hora
  );
  if (!turno) return { ok: false, error: "hora_invalida" };
  if (turno.estado === "reservado") return { ok: false, error: "ocupado" };
  if (turno.estado === "bloqueado") return { ok: false, error: "bloqueado" };

  const duplicada = estado.reservas.some(
    (r) =>
      r.fecha === fecha &&
      r.hora === hora &&
      r.socioNumero === socio.numero &&
      r.estado !== "cancelada"
  );
  if (duplicada) return { ok: false, error: "duplicado" };

  const nueva = {
    id: nuevoId("res"),
    canchaId,
    fecha,
    hora,
    socioNumero: socio.numero,
    socioNombre: socio.nombre,
    estado: "confirmada",
    creadaEn: new Date().toISOString(),
  };

  estado.reservas.push(nueva);
  guardarEstado(estado);
  return { ok: true, reserva: nueva };
}

export function cancelarReserva(estado, id, socioNumero) {
  const reserva = estado.reservas.find(
    (r) => r.id === id && r.estado !== "cancelada"
  );
  if (!reserva) return { ok: false, error: "no_encontrada" };

  const socio = getSocio(socioNumero);
  const esAdmin =
    socio && (socio.rol === "encargado" || socio.rol === "admin");

  if (!esAdmin && reserva.socioNumero !== socioNumero) {
    return { ok: false, error: "sin_permiso" };
  }
  if (!esAdmin && !puedeCancelar(reserva)) {
    return { ok: false, error: "muy_cerca" };
  }

  reserva.estado = "cancelada";
  reserva.canceladaEn = new Date().toISOString();
  guardarEstado(estado);
  return { ok: true };
}

export function bloquearTurno(estado, { canchaId, fecha, hora, motivo }) {
  const turno = turnosDelDia(estado, fecha, canchaId).find(
    (t) => t.hora === hora
  );
  if (!turno) return { ok: false, error: "hora_invalida" };
  if (turno.estado === "reservado") return { ok: false, error: "ocupado" };
  if (turno.estado === "bloqueado") return { ok: false, error: "duplicado" };

  const bloqueo = {
    id: nuevoId("blq"),
    canchaId,
    fecha,
    hora,
    motivo: String(motivo ?? "").trim() || "Sin motivo",
    creadoEn: new Date().toISOString(),
  };

  estado.bloqueos.push(bloqueo);
  guardarEstado(estado);
  return { ok: true, bloqueo };
}

export function desbloquearTurno(estado, id) {
  const antes = estado.bloqueos.length;
  estado.bloqueos = estado.bloqueos.filter((b) => b.id !== id);
  if (estado.bloqueos.length === antes) {
    return { ok: false, error: "no_encontrada" };
  }
  guardarEstado(estado);
  return { ok: true };
}

export function login(estado, numero, pin) {
  const socio = SOCIOS.find(
    (s) =>
      s.numero === String(numero).trim() &&
      s.pin === String(pin).trim()
  );

  if (!socio) return { ok: false, error: "socio_invalido" };

  estado.sesion = {
    numero: socio.numero,
    nombre: socio.nombre,
    rol: socio.rol,
  };
  guardarEstado(estado);
  return { ok: true, socio };
}

export function logout(estado) {
  estado.sesion = null;
  guardarEstado(estado);
}

export function crearLinkWhatsApp(reserva) {
  const cancha = CANCHAS.find((c) => c.id === reserva.canchaId);
  const texto = [
    `Hola, confirmo mi reserva en ${cancha?.nombre ?? "el club"}.`,
    `Fecha: ${formatearFecha(reserva.fecha)} a las ${reserva.hora}.`,
    `Socio: ${reserva.socioNumero} (${reserva.socioNombre}).`,
  ].join(" ");

  const base = CLUB_WHATSAPP ? `https://wa.me/${CLUB_WHATSAPP}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(texto)}`;
}
