# AGENTS.md — Contexto para agentes de código

> **Leé este archivo completo antes de tocar el repositorio.** Si sos un agente de código (Hy4 u otro), acá está el contexto del producto, las reglas de trabajo y lo que tenés que implementar.

## 1. Qué es este proyecto

Club Reservas es una página web para que los socios del Club Unión vean los horarios libres de las canchas y reserven en dos clics. Reemplaza la coordinación por WhatsApp y evita que dos personas reserven el mismo turno.

Es el Trabajo real 2 de Prácticas Profesionalizantes II: tres sprints con Scrum. El producto es una app estática (HTML/CSS/JS vanilla) con datos en `localStorage`. **No hay backend.**

## 2. Estado actual

- **Sprint 0 completado:** repo, README, backlog, plantilla de issues, tablero, `scrum/` y esqueleto de `src/`.
- **Issues creados:** #1 a #12, con labels (`historia`, `must`/`should`/`could`, `sprint-1..3` o `backlog`) y cargados en el tablero con **Puntos** y **Sprint**.
- **Página publicada:** https://diiegoc1.github.io/club-reservas/ (GitHub Pages, workflow `deploy.yml`).
- **Sprint 1 completo:** login por número de socio, grilla accesible, reserva con confirmación y "Mis reservas" (PRs #13, #14 y #15).
- La grilla de `src/app.js` renderiza horarios y estados (libre, reservado, bloqueado) con datos demo.
- Los modales de login y reserva están conectados a `src/store.js`; "Mis reservas" solo lista (la cancelación es del Sprint 2).
- `src/store.js` ya tiene la lógica de estado y las reglas de negocio. Revisala antes de cambiarla.

## 3. Reglas de trabajo

- Trabajá en una rama por historia: `hu-<n>-<slug>` (ej. `hu-2-reservar-turno`).
- Abrí un PR a `main` con título `HU-<n>: <título>` y en el cuerpo `Closes #<n>`.
- **No mergees tu propio PR.** Lo revisan Diiego y OpenCode.
- No agregues dependencias, frameworks ni build tools sin aprobación. Es vanilla a propósito.
- No toques `scrum/` ni `README.md` salvo que el Scrum Master lo pida.
- UI en español rioplatense; código claro y comentado en español.
- Mantené `src/` autocontenido: se publica tal cual en GitHub Pages.
- No inventes datos reales de socios; usá los de `src/data.js`.
- Si encontrás un bug de otra historia, no lo arregles en tu rama: anotalo y avisá.

## 4. Estructura y propiedad

| Archivo | Dueño | Notas |
|---|---|---|
| `src/data.js` | Sprint 0 / PO | Datos semilla. Cambios de socios/canchas: avisar. |
| `src/store.js` | Sprint 0 / Dev | Lógica de estado y reglas de negocio. Revisar antes de cambiar. |
| `src/app.js` | Dev | Render y eventos. Acá va la mayor parte del Sprint 1. |
| `src/styles.css` | Dev | Mobile-first, variables CSS. |
| `src/index.html` | Dev | Estructura semántica. |
| `scrum/*` | Scrum Master | No editar sin pedido. |
| `README.md` | PO / SM | No editar sin pedido. |
| `docs/*` | OpenCode | Specs. Si algo no coincide, avisar. |

## 5. Modelo de datos

### Canchas

```js
{ id: "padel-1", nombre: "Pádel 1", deporte: "Pádel", color: "#2563eb" }
```

Canchas actuales: `padel-1`, `padel-2`, `tenis-1`, `futbol-1`.

### Horarios

`08:00` a `21:00`, turnos de 1 hora. Array `HORARIOS` en `data.js`.

### Socios

```js
{ numero: "1001", nombre: "Lucía Gómez", pin: "1234", rol: "socio" }
```

Roles: `socio`, `encargado`, `admin`. Para probar el panel del encargado, usá `1004` / PIN `1234`.

### Reserva

```js
{
  id: "res-...",
  canchaId: "padel-1",
  fecha: "2026-11-26",       // YYYY-MM-DD, hora local
  hora: "18:00",
  socioNumero: "1001",
  socioNombre: "Lucía Gómez",
  estado: "confirmada",      // "confirmada" | "cancelada"
  creadaEn: "2026-11-26T12:00:00.000Z"
}
```

### Bloqueo

```js
{
  id: "blq-...",
  canchaId: "tenis-1",
  fecha: "2026-11-26",
  hora: "10:00",
  motivo: "Mantenimiento",
  creadoEn: "2026-11-26T12:00:00.000Z"
}
```

### Estado persistido

Clave: `club-reservas:v1`.

```js
{
  version: 1,
  reservas: [],
  bloqueos: [],
  sesion: null,          // { numero, nombre, rol } o null
  tema: "claro"          // "claro" | "oscuro"
}
```

## 6. Contratos de `src/store.js`

Ya están implementados. No cambies las firmas sin actualizar este documento.

| Función | Entrada | Salida |
|---|---|---|
| `cargarEstado()` | — | Estado desde `localStorage` (o inicial con demo) |
| `guardarEstado(estado)` | estado | — |
| `resetEstado()` | — | Borra la clave y recarga |
| `hoyISO()` | — | `"YYYY-MM-DD"` local |
| `sumarDias(fechaISO, dias)` | fecha, entero | `"YYYY-MM-DD"` |
| `formatearFecha(fechaISO)` | fecha | `"Lunes, 26 de noviembre"` |
| `turnosDelDia(estado, fecha, canchaId)` | estado, fecha, cancha | `[{ hora, estado, reserva?, bloqueo? }]` |
| `reservar(estado, datos)` | `{ canchaId, fecha, hora, socio }` | `{ ok, reserva }` o `{ ok: false, error }` |
| `cancelarReserva(estado, id, socioNumero)` | id, número | `{ ok }` o `{ ok: false, error }` |
| `bloquearTurno(estado, datos)` | `{ canchaId, fecha, hora, motivo }` | `{ ok, bloqueo }` o error |
| `desbloquearTurno(estado, id)` | id | `{ ok }` |
| `login(estado, numero, pin)` | número, PIN | `{ ok, socio }` o error |
| `logout(estado)` | estado | — |
| `reservasDeSocio(estado, numero)` | número | reservas activas ordenadas |
| `estadisticasPorCancha(estado)` | estado | `[{ canchaId, nombre, total }]` |
| `crearLinkWhatsApp(reserva)` | reserva | URL `wa.me` con mensaje |
| `puedeCancelar(reserva)` | reserva | booleano (2 horas de anticipación) |

Códigos de error esperados: `ocupado`, `bloqueado`, `sin_sesion`, `socio_invalido`, `muy_cerca`, `no_encontrada`, `sin_permiso`, `duplicado`, `cancha_invalida`, `hora_invalida`.

## 7. Reglas de negocio

1. Un turno no puede tener dos reservas activas.
2. Un turno bloqueado no se puede reservar.
3. Un socio no puede tener dos reservas a la misma fecha y hora (aunque sea en canchas distintas).
4. Solo se puede cancelar con al menos 2 horas de anticipación.
5. Un socio solo cancela sus propias reservas; el encargado/admin puede cancelar cualquiera.
6. El panel del encargado solo se muestra a `rol: "encargado"` o `"admin"`.
7. Las fechas se manejan como `YYYY-MM-DD` local, nunca con `toISOString()` para el día.
8. El estado se guarda después de cada cambio.

## 8. Sprint 1: tareas concretas

**Objetivo:** un socio puede ingresar, ver los horarios libres y reservar un turno.

Historias: HU-1 (3), HU-2 (5), HU-3 (3).

### HU-3 · Login

- Conectar el botón “Ingresar” a un `<dialog>` con número de socio y PIN.
- Validar contra `SOCIOS` con `login()`.
- Mostrar el nombre en el header y permitir cerrar sesión.
- Persistir la sesión en `localStorage`.
- Mostrar errores claros: “Número o PIN incorrecto”.

### HU-1 · Grilla

- La grilla ya renderiza; revisar que:
  - Se pueda cambiar de día con las flechas, el input y “Hoy”.
  - Se pueda cambiar de cancha con las tabs.
  - Los estados libre/reservado/bloqueado se vean claros.
  - En celular se lea bien (una columna o scroll horizontal).
- Agregar `aria-live="polite"` al contenedor de la grilla.

### HU-2 · Reserva

- Al hacer clic en “Reservar” en un turno libre:
  - Si no hay sesión, abrir login y volver al turno.
  - Si hay sesión, abrir un modal de confirmación con cancha, fecha, hora y socio.
  - Al confirmar, llamar a `reservar()`.
  - Si devuelve `ocupado` o `bloqueado`, mostrar el error y refrescar la grilla.
  - Si ok, cerrar el modal, refrescar y mostrar un aviso de éxito.
- Agregar un botón “Mis reservas” en el header (aunque la lista completa sea Sprint 2): puede mostrar un modal simple con `reservasDeSocio()`.

### Criterios de aceptación

Están en `docs/backlog.md` y en cada issue. No cierres el PR si no se cumplen.

## 9. Cómo correr y probar

```bash
npx serve src
node scrum/metricas.js
```

Checklist manual:

- [ ] Cambiar de día y de cancha.
- [ ] Ver un turno reservado y uno bloqueado.
- [ ] Login con `1001` / `1234`.
- [ ] Login con PIN incorrecto.
- [ ] Reservar un turno libre.
- [ ] Intentar reservar el mismo turno desde otra pestaña o después de recargar.
- [ ] Recargar y verificar que la reserva persiste.
- [ ] Probar en 375 px de ancho.
- [ ] Consola sin errores.

## 10. Definition of Done

Una historia está terminada cuando:

- [ ] Cumple todos sus criterios de aceptación.
- [ ] El código está en `main` a través de un PR revisado por otra persona.
- [ ] Anda en celular y en compu.
- [ ] No tiene errores en la consola del navegador.
- [ ] Está publicada en la página de prueba.
- [ ] El Product Owner la vio funcionando.

## 11. Handoff

- **PO:** Diiego.
- **Revisores:** Diiego y OpenCode.
- **Tablero:** https://github.com/users/diiegoc1/projects/3
- **Repo:** https://github.com/diiegoc1/club-reservas
- Si algo no está claro, dejá la duda en el issue antes de codificar.
