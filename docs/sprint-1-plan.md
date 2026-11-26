# Sprint 1 · Planificación

## Objetivo del sprint

**Un socio puede ingresar con su número, ver los horarios libres y reservar un turno sin pisar el de otra persona.**

## Fechas

- **Inicio:** [completar]
- **Fin:** [completar]
- **Duración:** 3 jornadas (sprint comprimido por el tiempo de la cursada).
- **Dailies:** al inicio de cada jornada, 15 minutos.
- **Review + Retro:** al final de la jornada 3.

## Capacidad del equipo

| Integrante | Rol en el sprint | Disponibilidad |
|---|---|---|
| Diiego | Product Owner + Scrum Master + Dev | [completar] |
| Hy4 | Developer | [completar] |
| OpenCode | QA / documentación / code review | [completar] |

## Historias comprometidas

| HU | Historia | Puntos | Responsable principal |
|---|---|---|---|
| HU-3 | Ingresar con mi número de socio | 3 | Hy4 |
| HU-1 | Ver los horarios libres de cada cancha | 3 | Hy4 |
| HU-2 | Reservar un horario libre | 5 | Hy4 |
| **Total** | | **11** | |

## Desglose de tareas

### HU-3 · Login

- [ ] Reemplazar el modal stub por un formulario con número de socio y PIN.
- [ ] Validar con `login()` de `store.js`.
- [ ] Mostrar el nombre en el header y permitir cerrar sesión.
- [ ] Persistir la sesión y restaurarla al recargar.
- [ ] Mostrar “Número o PIN incorrecto” sin cerrar el modal.
- [ ] Probar `1001` / `1234` y un PIN incorrecto.

### HU-1 · Grilla

- [ ] Revisar navegación de días: flechas, input y “Hoy”.
- [ ] Revisar tabs de canchas y `aria-selected`.
- [ ] Verificar estados libre/reservado/bloqueado con datos demo.
- [ ] Revisar responsive a 375 px, 768 px y 1280 px.
- [ ] Confirmar que la grilla tiene `aria-live="polite"`.

### HU-2 · Reserva

- [ ] Al hacer clic en “Reservar” sin sesión, abrir login y recordar el turno elegido.
- [ ] Con sesión, abrir un modal de confirmación con cancha, fecha, hora y socio.
- [ ] Llamar a `reservar()` y manejar `ocupado`, `bloqueado`, `duplicado` y `sin_sesion`.
- [ ] Refrescar la grilla y mostrar un aviso de éxito.
- [ ] Verificar que la reserva persiste al recargar.
- [ ] Verificar que el turno reservado ya no ofrece “Reservar”.

## Fuera de alcance

- “Mis reservas” completo y cancelación → Sprint 2.
- Confirmación por WhatsApp → Sprint 2.
- Lista de espera → Sprint 2.
- Panel del encargado, bloqueos y estadísticas → Sprint 3.
- Modo oscuro manual → Sprint 3.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Poco tiempo | Priorizar HU-2 y HU-3; HU-1 ya tiene base. |
| Choque de ediciones en `app.js` | Una rama por historia y PRs pequeños. |
| Doble reserva entre pestañas | Revalidar contra el estado actual antes de guardar. |
| Fechas con UTC | Usar `hoyISO()` y `sumarDias()` de `store.js`. |
| No llegar con el deploy | Publicar el esqueleto en GitHub Pages desde el día 1. |

## Criterio de cierre

- [ ] La página está publicada.
- [ ] Se puede iniciar sesión con `1001` / `1234`.
- [ ] Se puede reservar un turno libre y se ve ocupado al instante.
- [ ] No se puede reservar un turno ya ocupado.
- [ ] La reserva persiste al recargar.
- [ ] No hay errores en la consola.
- [ ] El PO vio la demo funcionando.

## Eventos

| Evento | Cuándo | Salida |
|---|---|---|
| Sprint Planning | Día 1, inicio | Este documento + issues en “Para hacer” |
| Daily | Día 1, 2 y 3 | `scrum/daily.md` actualizado |
| Sprint Review | Día 3, cierre | Demo con el PO |
| Sprint Retro | Día 3, después de la review | `scrum/retro.md` + 2 acciones |
| Actualización de métricas | Día 3, cierre | `scrum/sprints.json` + `node scrum/metricas.js` |
