# Product Backlog · Club Reservas

Backlog priorizado con MoSCoW. Los puntos se confirman en el planning poker; esta tabla es el punto de partida.

| # | Historia | Rol | Prioridad | Puntos | Sprint |
|---|---|---|---|---|---|
| HU-1 | Ver los horarios libres de cada cancha | socio | Must | 3 | 1 |
| HU-2 | Reservar un horario libre | socio | Must | 5 | 1 |
| HU-3 | Ingresar con mi número de socio | socio | Must | 3 | 1 |
| HU-4 | Ver y cancelar mis reservas | socio | Should | 3 | 2 |
| HU-5 | Recibir la confirmación por WhatsApp | socio | Should | 2 | 2 |
| HU-6 | Bloquear una cancha por mantenimiento | encargado | Must | 3 | 3 |
| HU-7 | Ver las reservas del día en el panel | encargado | Must | 2 | 3 |
| HU-8 | Cobrar la reserva por adelantado | tesorero | Could | 8 | Backlog |
| HU-9 | Ver estadísticas de uso por cancha | comisión | Could | 5 | 3 |
| HU-10 | Lista de espera si se libera un turno | socio | Should | 5 | 2 |
| HU-11 | Reservar turnos fijos semanales | socio | Could | 5 | Backlog |
| HU-12 | Modo oscuro en la página | socio | Could | 1 | 3 |

**Total:** 45 puntos.

**Comprometidos:** Sprint 1 = 11 · Sprint 2 = 10 · Sprint 3 = 11.
**Backlog restante:** HU-8 (8) + HU-11 (5) = 13 puntos.

---

## HU-1 · Ver los horarios libres de cada cancha

- **Rol:** socio
- **Prioridad:** Must
- **Puntos:** 3
- **Sprint:** 1
- **Issue:** #1

**Como** socio del club, **quiero** ver los horarios libres de cada cancha, **para** elegir uno sin tener que preguntar.

### Criterios de aceptación

- [ ] Dado que entro a la página, cuando elijo un día y una cancha, entonces veo los horarios de 08:00 a 21:00 con su estado.
- [ ] Dado un horario sin reserva ni bloqueo, cuando lo miro, entonces aparece como **Libre**.
- [ ] Dado un horario reservado, cuando lo miro, entonces aparece como **Reservado** y no ofrece el botón “Reservar”.
- [ ] Dado un horario bloqueado, cuando lo miro, entonces aparece como **Bloqueado** con el motivo.
- [ ] Puedo cambiar de día con las flechas, el selector de fecha y el botón “Hoy”.
- [ ] Puedo cambiar de cancha con las tabs.
- [ ] La página se ve bien en celular y en compu.

### Notas

La grilla base ya existe en el Sprint 0. Revisar estados, responsive y accesibilidad.

---

## HU-2 · Reservar un horario libre

- **Rol:** socio
- **Prioridad:** Must
- **Puntos:** 5
- **Sprint:** 1
- **Issue:** #2

**Como** socio del club, **quiero** reservar un horario libre, **para** asegurar mi turno sin pisar el de otra persona.

### Criterios de aceptación

- [ ] Dado que estoy logueado y elijo un turno libre, cuando confirmo la reserva, entonces el turno pasa a **Reservado** y se guarda.
- [ ] Dado que otro socio ya reservó ese turno, cuando intento reservarlo, entonces veo “Ese horario ya está ocupado” y no se guarda.
- [ ] Dado que el turno está bloqueado, cuando intento reservarlo, entonces veo “Ese horario está bloqueado” y no se guarda.
- [ ] Dado que no estoy logueado, cuando intento reservar, entonces se me pide ingresar.
- [ ] Dado que ya tengo una reserva a esa fecha y hora, cuando intento reservar otra cancha, entonces veo “Ya tenés una reserva en ese horario”.
- [ ] La reserva persiste al recargar la página.
- [ ] La reserva aparece en “Mis reservas”.

### Notas

La validación vive en `store.js` (`reservar`). La UI solo muestra el resultado.

---

## HU-3 · Ingresar con mi número de socio

- **Rol:** socio
- **Prioridad:** Must
- **Puntos:** 3
- **Sprint:** 1
- **Issue:** #3

**Como** socio del club, **quiero** ingresar con mi número de socio, **para** reservar a mi nombre y ver mis reservas.

### Criterios de aceptación

- [ ] Dado que ingreso un número de socio y PIN válidos, cuando confirmo, entonces veo mi nombre en el header y puedo reservar.
- [ ] Dado un número o PIN incorrecto, cuando confirmo, entonces veo “Número o PIN incorrecto” y no se inicia sesión.
- [ ] Dado que cierro sesión, entonces vuelvo al estado público y el header muestra “Ingresar”.
- [ ] La sesión persiste al recargar la página.
- [ ] El PIN no se muestra en pantalla ni se guarda en texto plano en la sesión.

### Notas

Datos de prueba: `1001` / `1234` (socio), `1004` / `1234` (encargado).

---

## HU-4 · Ver y cancelar mis reservas

- **Rol:** socio
- **Prioridad:** Should
- **Puntos:** 3
- **Sprint:** 2
- **Issue:** #4

**Como** socio del club, **quiero** ver y cancelar mis reservas, **para** liberar el turno si no puedo ir.

### Criterios de aceptación

- [ ] Dado que estoy logueado, cuando entro a “Mis reservas”, entonces veo mis reservas activas ordenadas por fecha y hora.
- [ ] Cada reserva muestra cancha, fecha, hora y estado.
- [ ] Dado que cancelo una reserva con al menos 2 horas de anticipación, entonces se libera el turno y deja de aparecer en la lista.
- [ ] Dado que intento cancelar con menos de 2 horas, entonces veo “Solo podés cancelar hasta 2 horas antes” y la reserva sigue activa.
- [ ] La cancelación persiste al recargar.
- [ ] Si no tengo reservas, veo un mensaje claro.

---

## HU-5 · Recibir la confirmación por WhatsApp

- **Rol:** socio
- **Prioridad:** Should
- **Puntos:** 2
- **Sprint:** 2
- **Issue:** #5

**Como** socio del club, **quiero** recibir la confirmación de mi reserva por WhatsApp, **para** tener el comprobante a mano.

### Criterios de aceptación

- [ ] Dado que confirmo una reserva, entonces veo un botón “Confirmar por WhatsApp”.
- [ ] El botón abre `wa.me` con un mensaje que incluye cancha, fecha, hora y número de socio.
- [ ] El mensaje está codificado correctamente (sin caracteres roto).
- [ ] Si no hay número de WhatsApp configurado, el enlace abre WhatsApp sin destinatario y el mensaje se mantiene.
- [ ] La confirmación no bloquea la reserva si el socio no la envía.

### Notas

Es una confirmación simulada con enlace, no una integración real con la API de WhatsApp.

---

## HU-6 · Bloquear una cancha por mantenimiento

- **Rol:** encargado
- **Prioridad:** Must
- **Puntos:** 3
- **Sprint:** 3
- **Issue:** #6

**Como** encargado del club, **quiero** bloquear una cancha por mantenimiento, **para** que nadie reserve un turno que no va a estar disponible.

### Criterios de aceptación

- [ ] Dado que estoy en el panel del encargado, cuando elijo una cancha, fecha y hora, entonces puedo bloquear el turno con un motivo.
- [ ] El turno bloqueado se muestra como **Bloqueado** y no se puede reservar.
- [ ] Dado que intento bloquear un turno ya reservado, entonces veo un error y no se bloquea.
- [ ] Dado que desbloqueo un turno, entonces vuelve a **Libre** si no tiene reserva.
- [ ] El bloqueo persiste al recargar.
- [ ] Solo el encargado o admin puede bloquear.

---

## HU-7 · Ver las reservas del día en el panel

- **Rol:** encargado
- **Prioridad:** Must
- **Puntos:** 2
- **Sprint:** 3
- **Issue:** #7

**Como** encargado del club, **quiero** ver las reservas del día en un panel, **para** saber quién viene y a qué hora.

### Criterios de aceptación

- [ ] Dado que entro al panel, cuando elijo una fecha, entonces veo todas las reservas del día agrupadas por cancha y hora.
- [ ] Cada reserva muestra socio, número, cancha, hora y estado.
- [ ] Veo el total de reservas del día.
- [ ] Si no hay reservas, veo un mensaje claro.
- [ ] Puedo cambiar de fecha sin recargar la página.
- [ ] El panel solo es visible para encargado/admin.

---

## HU-8 · Cobrar la reserva por adelantado

- **Rol:** tesorero
- **Prioridad:** Could
- **Puntos:** 8
- **Sprint:** Backlog
- **Issue:** #8

**Como** tesorero del club, **quiero** registrar el pago anticipado de una reserva, **para** saber quién ya pagó.

### Criterios de aceptación

- [ ] Dado que el tesorero registra el pago de una reserva, entonces la reserva queda como **Pagada**.
- [ ] El panel muestra el estado de pago.
- [ ] No se puede cobrar dos veces la misma reserva.
- [ ] Se puede filtrar por pagadas y pendientes.
- [ ] El cambio persiste al recargar.

### Notas

Queda en el backlog para el pronóstico. No entra en los tres sprints.

---

## HU-9 · Ver estadísticas de uso por cancha

- **Rol:** comisión directiva
- **Prioridad:** Could
- **Puntos:** 5
- **Sprint:** 3
- **Issue:** #9

**Como** miembro de la comisión directiva, **quiero** ver estadísticas de uso por cancha, **para** decidir dónde invertir en mantenimiento.

### Criterios de aceptación

- [ ] Dado que entro a estadísticas, entonces veo la cantidad de reservas por cancha y el total.
- [ ] Veo cuál es la cancha más usada.
- [ ] Puedo filtrar por últimos 7 o 30 días.
- [ ] Los números se actualizan al cambiar reservas.
- [ ] La vista es responsive.

---

## HU-10 · Lista de espera si se libera un turno

- **Rol:** socio
- **Prioridad:** Should
- **Puntos:** 5
- **Sprint:** 2
- **Issue:** #10

**Como** socio del club, **quiero** anotarme en una lista de espera, **para** que me avisen si se libera un turno.

### Criterios de aceptación

- [ ] Dado que un turno está ocupado, cuando me anoto, entonces quedo en la lista de espera.
- [ ] Veo mi posición en la lista.
- [ ] Dado que se cancela la reserva, entonces el primero de la lista ve el turno disponible en la página.
- [ ] No puedo anotarme dos veces al mismo turno.
- [ ] La lista persiste al recargar.

### Notas

No hay notificaciones push ni email; el aviso es dentro de la página.

---

## HU-11 · Reservar turnos fijos semanales

- **Rol:** socio
- **Prioridad:** Could
- **Puntos:** 5
- **Sprint:** Backlog
- **Issue:** #11

**Como** socio del club, **quiero** reservar un turno fijo semanal, **para** no tener que reservar todas las semanas.

### Criterios de aceptación

- [ ] Dado que elijo cancha, día y hora, entonces se crean reservas para las próximas 4 semanas.
- [ ] Si una fecha ya está ocupada, se informa y no se crea esa reserva.
- [ ] Puedo cancelar la serie completa.
- [ ] Las reservas creadas aparecen en “Mis reservas”.
- [ ] La serie persiste al recargar.

### Notas

Queda en el backlog para el pronóstico.

---

## HU-12 · Modo oscuro en la página

- **Rol:** socio
- **Prioridad:** Could
- **Puntos:** 1
- **Sprint:** 3
- **Issue:** #12

**Como** socio del club, **quiero** activar el modo oscuro, **para** usar la página cómodamente de noche.

### Criterios de aceptación

- [ ] Dado que activo el modo oscuro, entonces toda la página cambia de tema.
- [ ] La preferencia persiste al recargar.
- [ ] Por defecto se respeta `prefers-color-scheme`.
- [ ] El contraste es suficiente para leer sin esfuerzo.
- [ ] El cambio no rompe la grilla ni los diálogos.

---

## Definition of Done

Una historia está terminada cuando:

- [ ] Cumple todos sus criterios de aceptación.
- [ ] El código está en `main` a través de un PR revisado por otra persona.
- [ ] Anda en celular y en compu.
- [ ] No tiene errores en la consola del navegador.
- [ ] Está publicada en la página de prueba.
- [ ] El Product Owner la vio funcionando.
