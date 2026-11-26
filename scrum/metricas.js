// Métricas de Scrum: velocidad, promedio, desvío, burndown y pronóstico.
// Uso: node scrum/metricas.js
//
// El Scrum Master actualiza scrum/sprints.json al cerrar cada jornada:
// - "restante" guarda cuántos puntos faltan al terminar cada día.
// - "completados" se completa al cerrar el sprint.

import { readFile } from "node:fs/promises";

const datos = JSON.parse(
  await readFile(new URL("./sprints.json", import.meta.url), "utf8")
);

const sprints = Array.isArray(datos.sprints) ? datos.sprints : [];
const dias = Number(datos.diasPorSprint) || 10;
const redondo = (x) => Math.round(x * 10) / 10;

console.log(`Equipo: ${datos.equipo}`);
console.log(`Días por sprint: ${dias}`);
console.log(`Puntos en el backlog inicial: ${datos.puntosEnBacklog}`);
console.log("");

const cerrados = sprints.filter((s) => Number(s.completados) > 0);
const velocidades = cerrados.map((s) => Number(s.completados));

if (velocidades.length === 0) {
  console.log("Todavía no hay sprints cerrados. Completá 'completados' en scrum/sprints.json.");
} else {
  const promedio = velocidades.reduce((a, b) => a + b, 0) / velocidades.length;
  const desvio = Math.sqrt(
    velocidades.reduce((s, v) => s + (v - promedio) ** 2, 0) / velocidades.length
  );

  console.log("Velocidad por sprint:", velocidades.join(" · "));
  console.log(`Promedio: ${redondo(promedio)} puntos · desvío: ${redondo(desvio)}`);
  console.log("");
}

for (const s of sprints) {
  const comprometidos = Number(s.comprometidos) || 0;
  const completados = Number(s.completados) || 0;
  const cumplido =
    comprometidos > 0 ? Math.round((completados / comprometidos) * 100) : 0;

  console.log(
    `Sprint ${s.numero}: ${completados} de ${comprometidos} puntos (${cumplido}%) · ${s.objetivo}`
  );
}

for (const s of sprints) {
  const comprometidos = Number(s.comprometidos) || 0;
  const restante = Array.isArray(s.restante) ? s.restante.map(Number) : [];

  if (restante.length === 0 || comprometidos === 0) continue;

  console.log(`\nBurndown del sprint ${s.numero} (█ lo que falta · | ideal)`);

  restante.forEach((falta, i) => {
    const ideal =
      dias > 1 ? Math.round(comprometidos * (1 - i / (dias - 1))) : 0;
    const fila = Array.from({ length: comprometidos + 1 }, (_, x) =>
      x < falta ? "█" : "·"
    );

    if (ideal >= 0 && ideal < fila.length) fila[ideal] = "|";

    console.log(
      `día ${String(i + 1).padStart(2)} ${String(falta).padStart(3)} ${fila.join("")}`
    );
  });
}

if (velocidades.length > 0) {
  const promedio = velocidades.reduce((a, b) => a + b, 0) / velocidades.length;
  const desvio = Math.sqrt(
    velocidades.reduce((s, v) => s + (v - promedio) ** 2, 0) / velocidades.length
  );
  const hechos = velocidades.reduce((a, b) => a + b, 0);
  const faltan = Math.max(0, Number(datos.puntosEnBacklog) - hechos);

  console.log(`\nFaltan ${faltan} puntos del backlog.`);

  if (faltan === 0) {
    console.log("Pronóstico: el backlog está terminado. 🎉");
  } else if (promedio <= 0) {
    console.log("Pronóstico: todavía no hay velocidad suficiente para calcularlo.");
  } else {
    const esperado = Math.ceil(faltan / promedio);
    const pesimista = Math.ceil(faltan / Math.max(1, promedio - desvio));
    const rango =
      esperado === pesimista ? `${esperado}` : `entre ${esperado} y ${pesimista}`;

    console.log(
      `Pronóstico: ${rango} sprints más (unas ${pesimista * dias} jornadas como mucho).`
    );
  }
}
