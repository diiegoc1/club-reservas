// Render y eventos de Club Reservas.
// La lógica de negocio vive en store.js; acá solo mostramos y conectamos la UI.

import { CANCHAS } from "./data.js";
import {
  cargarEstado,
  formatearFecha,
  hoyISO,
  login,
  logout,
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
  btnReset: document.querySelector("#btn-reset"),
  modalReserva: document.querySelector("#modal-reserva"),
  modalLogin: document.querySelector("#modal-login"),
  formLogin: document.querySelector("#form-login"),
  mlNumero: document.querySelector("#ml-numero"),
  mlPin: document.querySelector("#ml-pin"),
  mlError: document.querySelector("#ml-error"),
  mrTitulo: document.querySelector("#mr-titulo"),
  mrTexto: document.querySelector("#mr-texto"),
};

let estado = cargarEstado();
let fecha = hoyISO();
let canchaId = CANCHAS[0]?.id ?? "";

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

function abrirReserva(hora) {
  const cancha = CANCHAS.find((c) => c.id === canchaId);

  refs.mrTitulo.textContent = `${cancha?.nombre ?? "Cancha"} · ${hora}`;
  refs.mrTexto.textContent = `${formatearFecha(fecha)}. En el Sprint 1 vas a poder confirmar la reserva con tu número de socio.`;
  refs.modalReserva.showModal();
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
    "Club Reservas · Sprint 1. Login disponible. Datos demo en localStorage. Usá el botón del pie para reiniciar."
  );
}

init();
