# Club Reservas

Sistema de reservas de canchas para el **Club Unión**. Proyecto de **Prácticas Profesionalizantes II — Trabajo real 2: tres sprints con Scrum**.

> Para los socios del Club Unión, que hoy reservan las canchas por WhatsApp y se pisan los horarios, **Club Reservas** es una página donde ven los turnos libres y reservan en dos clics. A diferencia de una planilla compartida, avisa al encargado y no deja reservar un horario ocupado.

- **Página publicada:** https://diiegoc1.github.io/club-reservas/
- **Repositorio:** https://github.com/diiegoc1/club-reservas
- **Tablero:** https://github.com/users/diiegoc1/projects/3
- **Historias:** [#1 a #12](https://github.com/diiegoc1/club-reservas/issues)

## Estado del proyecto

| Sprint | Objetivo | Puntos | Estado |
|---|---|---|---|
| 0 | Equipo, repositorio, backlog y tablero | — | ✅ Completado |
| 1 | Login, ver horarios y reservar | 11 | 🚧 En curso |
| 2 | Mis reservas, cancelación y confirmación | 10 | ⏳ Pendiente |
| 3 | Panel del encargado y estadísticas | 11 | ⏳ Pendiente |

**Backlog restante:** HU-8 (cobro anticipado, 8 pts) y HU-11 (turnos fijos, 5 pts).

## Equipo y roles

Equipo de práctica de tres integrantes: un humano y dos agentes de IA, con roles rotativos.

| Rol | Persona | Responsabilidad |
|---|---|---|
| Product Owner | Diiego | Prioriza el backlog, valida la demo y aprueba merges |
| Scrum Master · Sprint 1 | Diiego | Planning, daily, review, retro y `sprints.json` |
| Scrum Master · Sprint 2 | OpenCode | Planning, daily, review, retro y `sprints.json` |
| Scrum Master · Sprint 3 | Hy4 | Planning, daily, review, retro y `sprints.json` |
| Developers | Hy4 y Diiego | Implementación en ramas y PRs |
| QA / Documentación | OpenCode | Specs, revisión de código y métricas |

Regla: **nadie mergea su propio PR**. Hy4 abre el PR, lo revisan Diiego y OpenCode contra la Definition of Done, y Diiego aprueba.

## Tablero

[GitHub Project #3](https://github.com/users/diiegoc1/projects/3)

Columnas: **Todo · In Progress · Done**.

Campos: **Puntos** (número) y **Sprint** (Sprint 1, Sprint 2, Sprint 3, Backlog).

Las 12 historias ya están cargadas con sus puntos y su sprint:

| Sprint | Historias | Puntos |
|---|---|---|
| Sprint 1 | [#1](https://github.com/diiegoc1/club-reservas/issues/1) · [#2](https://github.com/diiegoc1/club-reservas/issues/2) · [#3](https://github.com/diiegoc1/club-reservas/issues/3) | 11 |
| Sprint 2 | [#4](https://github.com/diiegoc1/club-reservas/issues/4) · [#5](https://github.com/diiegoc1/club-reservas/issues/5) · [#10](https://github.com/diiegoc1/club-reservas/issues/10) | 10 |
| Sprint 3 | [#6](https://github.com/diiegoc1/club-reservas/issues/6) · [#7](https://github.com/diiegoc1/club-reservas/issues/7) · [#9](https://github.com/diiegoc1/club-reservas/issues/9) · [#12](https://github.com/diiegoc1/club-reservas/issues/12) | 11 |
| Backlog | [#8](https://github.com/diiegoc1/club-reservas/issues/8) · [#11](https://github.com/diiegoc1/club-reservas/issues/11) | 13 |

## Stack

- HTML, CSS y JavaScript vanilla (ES modules), sin build step.
- Datos en `localStorage` (no hay backend en esta etapa).
- Node.js solo para el script de métricas.
- Publicación: GitHub Pages (workflow incluido) o Vercel/Netlify.

## Estructura

```text
club-reservas/
├── README.md
├── AGENTS.md                  Contexto para agentes de código
├── package.json
├── .github/
│   ├── ISSUE_TEMPLATE/historia.md
│   └── workflows/deploy.yml
├── docs/
│   ├── arquitectura.md
│   └── backlog.md
├── scrum/
│   ├── daily.md
│   ├── retro.md
│   ├── sprints.json
│   └── metricas.js
└── src/
    ├── index.html
    ├── styles.css
    ├── data.js
    ├── store.js
    └── app.js
```

## Cómo correr

La página usa ES modules, así que necesita un servidor local (no abras `index.html` con doble clic):

```bash
npx serve src
# o
python -m http.server 8000 --directory src
```

Luego abrí `http://localhost:3000` (o el puerto que indique).

### Métricas

```bash
node scrum/metricas.js
```

`package.json` tiene `"type": "module"` para que funcione el `import` de `metricas.js`.

## Definition of Done

Una historia está terminada cuando:

- [ ] Cumple todos sus criterios de aceptación.
- [ ] El código está en `main` a través de un PR revisado por otra persona.
- [ ] Anda en celular y en compu.
- [ ] No tiene errores en la consola del navegador.
- [ ] Está publicada en la página de prueba.
- [ ] El Product Owner la vio funcionando.

## Métricas

Se completan al cerrar cada sprint:

| Sprint | Comprometidos | Completados | Velocidad |
|---|---|---|---|
| 1 | 11 | — | — |
| 2 | 10 | — | — |
| 3 | 11 | — | — |

Salida de `node scrum/metricas.js`:

```text
(pegar acá la salida al cerrar cada sprint)
```

## Informe de cierre

Se completa al final del Sprint 3:

- **Velocidad:** ...
- **Historias terminadas:** ...
- **Página:** ...
- **Pronóstico para el resto del backlog:** ...
- **Lo que aprendimos:** ...

## Limitaciones conocidas

- Los datos viven en el `localStorage` de cada navegador; no se comparten entre dispositivos.
- El login es simulado con número de socio y PIN de práctica.
- La confirmación por WhatsApp es un enlace `wa.me` con el mensaje prearmado, no una integración real.
- No hay backend ni base de datos en esta etapa.
