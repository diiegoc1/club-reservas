// Render y eventos de Club Reservas.
// La lógica de negocio vive en store.js; acá solo mostramos y conectamos la UI.

import { CANCHAS } from "./data.js";
import {
  cargarEstado,
  formatearFecha,
  hoyISO,
  login,
  logout,
  reservar,
  reservasDeSocio,
  resetEstado,
  sumarDias,
  turnosDelDia,
} from "./store.js";

const refs = {
  fecha: document.querySelector("#fecha"),
  fechaLegible: document.querySelector("#fecha-legible"),
  canchas: document.querySelector("#canchas"),
  grilla: document.querySelector("#grilla"),
  btnAnterior: document.querySelector("#dia-anterior"),
  btnSiguiente: document.querySelector("#dia-siguiente"),
  btnHoy: document.querySelector("#btn-hoy"),
  btnLogin: document.querySelector("#btn-login"),
  btnMisReservas: document.querySelector("#btn-mis-reservas"),
  btnReset: document.querySelector("#btn-reset"),
  aviso: document.querySelector("#aviso"),
  modalReserva: document.querySelector("#modal-reserva"),
  formReserva: document.querySelector("#form-reserva"),
  mrCancha: document.querySelector("#mr-cancha"),
  mrFecha: document.querySelector("#mr-fecha"),
  mrHora: document.querySelector("#mr-hora"),
  mrSocio: document.querySelector("#mr-socio"),
  mrError: document.querySelector("#mr-error"),
  modalLogin: document.querySelector("#modal-login"),
  formLogin: document.querySelector("#form-login"),
  mlNumero: document.querySelector("#ml-numero"),
  mlPin: document.querySelector("#ml-pin"),
  mlError: document.querySelector("#ml-error"),
  modalMisReservas: document.querySelector("#modal-mis-reservas"),
  mmLista: document.querySelector("#mm-lista"),
};

let estado = cargarEstado();
let fecha = hoyISO();
let canchaId = CANCHAS[0]?.id ?? "";
let turnoPendiente = null; // Turno elegido sin sesión: se retoma después del login.
let turnoConfirmado = null; // Turno que muestra el modal de confirmación.

const ERRORES_RESERVA = {
  ocupado: "Ese horario ya está ocupado",
  bloqueado: "Ese horario está bloqueado",
  duplicado: "Ya tenés una reserva en ese horario",
  cancha_invalida: "No se pudo reservar ese turno. Probá de nuevo.",
  hora_invalida: "No se pudo reservar ese turno. Probá de nuevo.",
};

const escapar = (valor) =>
  String(valor).replace(/[&<>"']/g, (caracter) => {
    const mapa = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return mapa[caracter];
  });

const ETIQUETAS = {
  libre: "Libre",
  reservado: "Reservado",
  bloqueado: "Bloqueado",
};

function renderFecha() {
  refs.fechaLegible.textContent = formatearFecha(fecha);
  refs.fecha.value = fecha;
}

/** Cambia de cancha y, si viene del teclado, deja el foco en el tab elegido. */
function activarCancha(id, enfocar = false) {
  canchaId = id;
  renderCanchas();
  renderGrilla();
  if (enfocar) {
    refs.canchas.querySelector(`[data-cancha="${id}"]`)?.focus();
  }
}

function renderCanchas() {
  refs.canchas.innerHTML = CANCHAS.map(
    (cancha) => `
      <button
        type="button"
        id="tab-${cancha.id}"
        class="cancha ${cancha.id === canchaId ? "cancha--activa" : ""}"
        role="tab"
        aria-selected="${cancha.id === canchaId}"
        aria-controls="grilla"
        tabindex="${cancha.id === canchaId ? "0" : "-1"}"
        data-cancha="${cancha.id}"
      >
        <span class="cancha__dot" style="--c:${cancha.color}"></span>
        <span>${escapar(cancha.nombre)}</span>
        <small>${escapar(cancha.deporte)}</small>
      </button>
    `
  ).join("");

  // Un solo tab entra en el orden de tabulación (patrón roving tabindex).
  refs.grilla.setAttribute("aria-labelledby", `tab-${canchaId}`);

  refs.canchas.querySelectorAll("[data-cancha]").forEach((boton) => {
    boton.addEventListener("click", () =>
      activarCancha(boton.dataset.cancha, true)
    );
    boton.addEventListener("keydown", (evento) => {
      const actual = CANCHAS.findIndex((c) => c.id === boton.dataset.cancha);
      if (actual === -1) return;

      let destino = actual;
      if (evento.key === "ArrowRight") {
        destino = (actual + 1) % CANCHAS.length;
      } else if (evento.key === "ArrowLeft") {
        destino = (actual - 1 + CANCHAS.length) % CANCHAS.length;
      } else if (evento.key === "Home") {
        destino = 0;
      } else if (evento.key === "End") {
        destino = CANCHAS.length - 1;
      } else {
        return;
      }

      evento.preventDefault();
      activarCancha(CANCHAS[destino].id, true);
    });
  });
}

function renderGrilla() {
  const turnos = turnosDelDia(estado, fecha, canchaId);

  refs.grilla.innerHTML = turnos
    .map((turno) => {
      const detalle =
        turno.estado === "reservado"
          ? `Socio ${escapar(turno.reserva.socioNumero)}`
          : turno.estado === "bloqueado"
            ? escapar(turno.bloqueo.motivo)
            : "Disponible para reservar";

      const boton =
        turno.estado === "libre"
          ? `<button type="button" class="btn btn--small btn--full" data-reservar="${turno.hora}">Reservar</button>`
          : "";

      return `
        <article class="slot slot--${turno.estado}">
          <div class="slot__top">
            <span class="slot__hora">${turno.hora}</span>
            <span class="slot__estado">${ETIQUETAS[turno.estado]}</span>
          </div>
          <p class="slot__detalle">${detalle}</p>
          ${boton}
        </article>
      `;
    })
    .join("");

  refs.grilla.querySelectorAll("[data-reservar]").forEach((boton) => {
    boton.addEventListener("click", () => abrirReserva(boton.dataset.reservar));
  });
}

/** Abre el diálogo de login limpio y enfoca el número de socio. */
function abrirLogin() {
  refs.mlError.hidden = true;
  refs.mlError.textContent = "";
  refs.modalLogin.showModal();
  refs.mlNumero.focus();
}

function renderSesion() {
  refs.btnMisReservas.hidden = !estado.sesion;

  if (estado.sesion) {
    refs.btnLogin.textContent = `${estado.sesion.nombre} · Salir`;
    refs.btnLogin.setAttribute(
      "aria-label",
      `Cerrar sesión de ${estado.sesion.nombre}`
    );
    refs.btnLogin.classList.add("btn--user");
    refs.btnLogin.onclick = () => {
      logout(estado);
      renderSesion();
      renderGrilla();
    };
    return;
  }

  refs.btnLogin.textContent = "Ingresar";
  refs.btnLogin.setAttribute("aria-label", "Ingresar con mi número de socio");
  refs.btnLogin.classList.remove("btn--user");
  refs.btnLogin.onclick = abrirLogin;
}

/** Envía número y PIN a store.js. El PIN nunca se guarda en la sesión. */
function enviarLogin(evento) {
  evento.preventDefault();

  const resultado = login(
    estado,
    refs.mlNumero.value.trim(),
    refs.mlPin.value
  );

  if (!resultado.ok) {
    refs.mlError.textContent = "Número o PIN incorrecto";
    refs.mlError.hidden = false;
    refs.mlPin.focus();
    refs.mlPin.select();
    return;
  }

  refs.mlError.hidden = true;
  refs.mlError.textContent = "";
  refs.formLogin.reset();
  refs.modalLogin.close();
  renderSesion();

  // Retomamos el turno que eligió antes de pedirle el login.
  if (turnoPendiente) {
    const turno = turnoPendiente;
    turnoPendiente = null;
    mostrarConfirmacion(turno);
  }
}

function renderTodo() {
  renderFecha();
  renderCanchas();
  renderGrilla();
  renderSesion();
}

function cambiarDia(delta) {
  fecha = sumarDias(fecha, delta);
  renderFecha();
  renderGrilla();
}

function renderAviso(texto) {
  refs.aviso.textContent = texto;
  refs.aviso.hidden = false;
}

/** Guarda el turno elegido y pide login, o muestra directamente la confirmación. */
function abrirReserva(hora) {
  const turno = { canchaId, fecha, hora };

  if (!estado.sesion) {
    turnoPendiente = turno;
    abrirLogin();
    return;
  }

  refs.aviso.hidden = true;
  mostrarConfirmacion(turno);
}

function mostrarConfirmacion(turno) {
  const cancha = CANCHAS.find((c) => c.id === turno.canchaId);
  turnoConfirmado = turno;

  refs.mrCancha.textContent = cancha?.nombre ?? "Cancha";
  refs.mrFecha.textContent = formatearFecha(turno.fecha);
  refs.mrHora.textContent = turno.hora;
  refs.mrSocio.textContent = `${estado.sesion.nombre} (${estado.sesion.numero})`;
  refs.mrError.hidden = true;
  refs.mrError.textContent = "";
  refs.modalReserva.showModal();
}

/** Confirma con store.js; la UI solo muestra el resultado. */
function enviarReserva(evento) {
  evento.preventDefault();
  if (!turnoConfirmado) return;
  const { hora } = turnoConfirmado;

  // Otra pestaña pudo cambiar el estado mientras el modal estaba abierto.
  estado = cargarEstado();

  const resultado = reservar(estado, {
    ...turnoConfirmado,
    socio: estado.sesion,
  });

  if (!resultado.ok) {
    if (resultado.error === "sin_sesion") {
      refs.modalReserva.close();
      turnoPendiente = turnoConfirmado;
      turnoConfirmado = null;
      renderSesion();
      abrirLogin();
      return;
    }

    refs.mrError.textContent =
      ERRORES_RESERVA[resultado.error] ??
      "No se pudo reservar ese turno. Probá de nuevo.";
    refs.mrError.hidden = false;
    renderGrilla();
    return;
  }

  refs.modalReserva.close();
  turnoConfirmado = null;
  renderGrilla();
  renderAviso(
    `Reserva confirmada: ${refs.mrCancha.textContent}, ${refs.mrFecha.textContent} a las ${hora}.`
  );
}

function renderMisReservas() {
  if (!estado.sesion) return;

  const reservas = reservasDeSocio(estado, estado.sesion.numero);
  refs.mmLista.innerHTML = reservas.length
    ? reservas
        .map((reserva) => {
          const cancha = CANCHAS.find((c) => c.id === reserva.canchaId);
          return `
            <li>
              <strong>${escapar(cancha?.nombre ?? reserva.canchaId)}</strong>
              <span>${escapar(formatearFecha(reserva.fecha))} · ${escapar(reserva.hora)}</span>
            </li>
          `;
        })
        .join("")
    : "<li>Todavía no tenés reservas.</li>";

  refs.modalMisReservas.showModal();
}

function init() {
  if (!refs.fecha || !refs.grilla) {
    console.warn("No se encontraron los elementos principales de la página.");
    return;
  }

  renderTodo();

  refs.btnAnterior.addEventListener("click", () => cambiarDia(-1));
  refs.btnSiguiente.addEventListener("click", () => cambiarDia(1));

  refs.btnHoy.addEventListener("click", () => {
    fecha = hoyISO();
    renderFecha();
    renderGrilla();
  });

  refs.formLogin.addEventListener("submit", enviarLogin);
  document.querySelectorAll("[data-cerrar-login]").forEach((boton) => {
    boton.addEventListener("click", () => refs.modalLogin.close());
  });
  refs.modalLogin.addEventListener("close", () => {
    // Cancelar o Escape descarta el turno que estaba esperando login.
    if (!estado.sesion) turnoPendiente = null;
  });

  refs.formReserva.addEventListener("submit", enviarReserva);
  document.querySelectorAll("[data-cerrar-reserva]").forEach((boton) => {
    boton.addEventListener("click", () => refs.modalReserva.close());
  });
  refs.modalReserva.addEventListener("close", () => {
    turnoConfirmado = null;
  });

  refs.btnMisReservas.addEventListener("click", renderMisReservas);

  refs.fecha.addEventListener("change", () => {
    if (!refs.fecha.value) return;
    fecha = refs.fecha.value;
    renderFecha();
    renderGrilla();
  });

  refs.btnReset.addEventListener("click", () => {
    const seguro = confirm(
      "¿Reiniciar los datos demo? Se borran las reservas guardadas en este navegador."
    );
    if (seguro) resetEstado();
  });

  console.info(
    "Club Reservas · Sprint 1. Login, grilla y reservas disponibles. Datos demo en localStorage. Usá el botón del pie para reiniciar."
  );
}

init();
