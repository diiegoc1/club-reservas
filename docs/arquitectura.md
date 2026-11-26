# Arquitectura · Club Reservas

Documento técnico de referencia para el equipo. Si algo no coincide con el código, el código y este documento deben actualizarse juntos.

## 1. Objetivo y alcance

**Objetivo:** que un socio del Club Unión pueda ver los horarios libres de las canchas y reservar un turno sin pisar el de otra persona.

**Alcance de esta etapa:**

- App estática, sin backend.
- Datos persistidos en `localStorage`.
- Login simulado con número de socio y PIN.
- Panel del encargado y estadísticas simples.
- Confirmación por WhatsApp mediante un enlace `wa.me`.

**Fuera de alcance:**

- Pagos reales.
- Envío real de WhatsApp o email.
- Multiusuario concurrente entre dispositivos.
- Autenticación segura.
- Base de datos remota.

## 2. Stack y restricciones

| Decisión | Motivo |
|---|---|
| HTML + CSS + JS vanilla | Menos configuración, más foco en Scrum y en el producto |
| ES modules (`type="module"`) | Separar datos, estado y UI sin bundler |
| `localStorage` | Persistencia simple para la práctica |
| Sin dependencias | La página se publica tal cual en GitHub Pages |
| GitHub Pages / Vercel | Publicación gratuita y reproducible |

La página **no se abre con doble clic** porque los ES modules requieren un servidor. Usar `npx serve src` o Live Server.

## 3. Estructura de archivos

```text
src/
├── index.html     Estructura semántica y diálogos
├── styles.css     Variables, layout, componentes y responsive
├── data.js        Datos semilla: canchas, horarios, socios
├── store.js       Estado, persistencia y reglas de negocio
└── app.js         Render, eventos y navegación
```

### Responsabilidades

- `data.js` no conoce el DOM ni el estado. Solo exporta constantes.
- `store.js` no conoce el DOM. Recibe y devuelve datos; persiste en `localStorage`.
- `app.js` no implementa reglas de negocio. Llama a `store.js` y renderiza.
- `styles.css` no depende del JS. Los estados visuales se activan con clases.

## 4. Modelo de datos

### Cancha

```js
{
  id: "padel-1",
  nombre: "Pádel 1",
  deporte: "Pádel",
  color: "#2563eb"
}
```

### Horario

String `"HH:MM"` en formato de 24 horas. Turnos de 1 hora, de `08:00` a `21:00`.

### Socio

```js
{
  numero: "1001",
  nombre: "Lucía Gómez",
  pin: "1234",
  rol: "socio" // "socio" | "encargado" | "admin"
}
```

### Reserva

```js
{
  id: "res-...",
  canchaId: "padel-1",
  fecha: "2026-11-26",
  hora: "18:00",
  socioNumero: "1001",
  socioNombre: "Lucía Gómez",
  estado: "confirmada", // "confirmada" | "cancelada"
  creadaEn: "2026-11-26T12:00:00.000Z",
  canceladaEn: null
}
```

### Bloqueo

```js
{
  id: "blq-...",
  canchaId: "tenis-1",
  fecha: "2026-11-26",
  hora: "10:00",
  motivo: "Mantenimiento del césped",
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
  sesion: null,   // { numero, nombre, rol } | null
  tema: "claro"   // "claro" | "oscuro"
}
```

`cargarEstado()` tolera datos viejos o corruptos: si el JSON falla, devuelve el estado inicial. Si faltan claves, las completa con los valores por defecto.

## 5. Flujo de estado

```text
[data.js] ──> [store.js] ──> [app.js] ──> DOM
                  │
                  └──> localStorage (club-reservas:v1)
```

1. `app.js` llama a `cargarEstado()` al iniciar.
2. Guarda el estado en una variable de módulo.
3. Cada acción (reservar, cancelar, bloquear, login) llama a una función de `store.js`.
4. `store.js` valida, muta el estado y llama a `guardarEstado()`.
5. `app.js` vuelve a renderizar la parte afectada.

No hay reactividad automática: después de cada cambio hay que llamar a `renderGrilla()` y/o `renderSesion()`.

## 6. Contratos de `store.js`

### Fechas

```js
hoyISO(): string
sumarDias(fechaISO: string, dias: number): string
formatearFecha(fechaISO: string): string
```

Regla: las fechas de negocio son strings `YYYY-MM-DD` en hora local. **No usar `toISOString().slice(0, 10)`** para obtener el día, porque convierte a UTC y puede devolver el día anterior.

### Turnos

```js
turnosDelDia(estado, fecha, canchaId): Array<{
  hora: string,
  estado: "libre" | "reservado" | "bloqueado",
  reserva?: Reserva,
  bloqueo?: Bloqueo
}>
```

Prioridad de estados: reservado > bloqueado > libre. Una reserva cancelada no ocupa el turno.

### Reservar

```js
reservar(estado, { canchaId, fecha, hora, socio })
  : { ok: true, reserva } | { ok: false, error }
```

Validaciones, en orden:

1. Hay socio logueado → `sin_sesion`.
2. La cancha existe → `cancha_invalida`.
3. La hora existe → `hora_invalida`.
4. El turno está libre → `ocupado` o `bloqueado`.
5. El socio no tiene otra reserva a la misma fecha y hora → `duplicado`.

### Cancelar

```js
cancelarReserva(estado, id, socioNumero)
  : { ok: true } | { ok: false, error }
```

- La reserva existe y está activa → `no_encontrada`.
- El socio es dueño o tiene rol `encargado`/`admin` → `sin_permiso`.
- Faltan al menos 2 horas para el turno → `muy_cerca`.
- Se marca `estado: "cancelada"` y se guarda.

### Bloquear

```js
bloquearTurno(estado, { canchaId, fecha, hora, motivo })
  : { ok: true, bloqueo } | { ok: false, error }
```

No se puede bloquear un turno reservado. No se puede bloquear dos veces el mismo turno.

### Login

```js
login(estado, numero, pin): { ok: true, socio } | { ok: false, error: "socio_invalido" }
logout(estado): void
```

La sesión se guarda en el estado para sobrevivir a una recarga.

### Consultas

```js
reservasDeSocio(estado, numero): Reserva[]
estadisticasPorCancha(estado): Array<{ canchaId, nombre, total }>
crearLinkWhatsApp(reserva): string
puedeCancelar(reserva): boolean
```

## 7. Reglas de negocio

1. **No hay doble reserva:** un turno (cancha + fecha + hora) solo puede tener una reserva activa.
2. **No se reserva un bloqueo:** el encargado puede bloquear un turno por mantenimiento.
3. **Un socio, un turno:** el mismo socio no puede reservar dos canchas a la misma fecha y hora.
4. **Cancelación con anticipación:** mínimo 2 horas antes del turno.
5. **Permisos:** cada socio cancela lo suyo; encargado/admin cancela cualquier reserva.
6. **Panel:** solo visible para `encargado` y `admin`.
7. **Persistencia:** cada cambio se guarda en `localStorage`.
8. **Fechas locales:** nunca usar UTC para el día de la reserva.

## 8. Render y eventos

### Estado de la vista

```js
let estado = cargarEstado();
let fecha = hoyISO();
let canchaId = CANCHAS[0].id;
```

### Funciones de render

| Función | Qué actualiza |
|---|---|
| `renderFecha()` | Texto legible de la fecha y valor del input |
| `renderCanchas()` | Tabs de canchas y `aria-selected` |
| `renderGrilla()` | Tarjetas de horarios y estados |
| `renderSesion()` | Botón de login/logout y nombre del socio |
| `renderAviso(texto, tipo)` | Mensaje de éxito o error |

### Eventos

- Cambio de fecha: input, flechas y botón “Hoy”.
- Cambio de cancha: tabs.
- Clic en “Reservar”: abre login o confirmación.
- Confirmar reserva: llama a `reservar()` y refresca.
- Login/logout.
- Reset de datos demo.

### Accesibilidad

- Un solo `<h1>`.
- Tabs con `role="tablist"`, `role="tab"` y `aria-selected`.
- Grilla con `aria-live="polite"`.
- Diálogos con `<dialog>` y botón de cierre.
- Foco visible en todos los controles.
- Contraste suficiente en modo claro y oscuro.
- No depender solo del color: cada estado tiene texto.

## 9. Estilos

- Variables CSS en `:root` para colores, radios y sombras.
- Modo oscuro automático con `@media (prefers-color-scheme: dark)`.
- Mobile-first: una columna en pantallas chicas, grilla de tarjetas en pantallas grandes.
- Clases de estado: `.slot--libre`, `.slot--reservado`, `.slot--bloqueado`.
- Respetar `prefers-reduced-motion`.

## 10. Pruebas manuales

Antes de cada PR:

- [ ] La página carga sin errores en consola.
- [ ] Cambiar de día y de cancha actualiza la grilla.
- [ ] Un turno reservado se ve ocupado y no ofrece “Reservar”.
- [ ] Un turno bloqueado muestra el motivo.
- [ ] Login correcto e incorrecto.
- [ ] Reserva exitosa y reserva duplicada.
- [ ] Recargar conserva reservas y sesión.
- [ ] Cancelar libera el turno.
- [ ] Bloquear impide reservar.
- [ ] Vista a 375 px, 768 px y 1280 px.
- [ ] Teclado: se puede navegar y cerrar diálogos con Escape.

## 11. Publicación

### GitHub Pages

El workflow `.github/workflows/deploy.yml` publica `src/` en cada push a `main`.

Requisito único: **Settings → Pages → Source: GitHub Actions**.

URL esperada: `https://diiegoc1.github.io/club-reservas/`.

### Alternativa Vercel / Netlify

- Vercel: importar el repo, framework “Other”, root directory `src`, sin build command.
- Netlify: arrastrar la carpeta `src` o configurar publish directory `src`.

## 12. Roadmap por sprint

| Sprint | Foco | Archivos principales |
|---|---|---|
| 1 | Login, grilla y reserva | `app.js`, `store.js`, `styles.css` |
| 2 | Mis reservas, cancelación, WhatsApp y lista de espera | `app.js`, `store.js` |
| 3 | Panel del encargado, bloqueos, estadísticas y modo oscuro | `app.js`, `store.js`, `styles.css` |

## 13. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Datos solo en un navegador | Documentarlo como limitación; evaluar Supabase si el profe lo exige |
| Fechas con UTC | Usar siempre `hoyISO()` y `sumarDias()` |
| Doble reserva entre pestañas | Revalidar contra el estado actual antes de guardar; a futuro, backend |
| Cambios de alcance | Todo cambio entra como issue nuevo, no se cuela en un PR |
| Falta de tiempo | Priorizar Must; los Could quedan en el backlog para el pronóstico |
