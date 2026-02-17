# Casos de Uso del POS — Revisión de Diseño

Este documento recoge los casos de uso generales y de borde del Fever POS que necesitan una solución visual definitiva. Cada sección describe el contexto funcional y las preguntas abiertas para que el diseñador pueda definir el enfoque final.

---

## 1. Carrito: multi-evento y multi-timeslot

### Caso general
Un cajero vende entradas de un evento (ej. Taylor Swift, sábado 21:30) y luego cambia el event selector a otro evento (ej. Van Gogh) y vende más entradas. El carrito muestra dos grupos de evento, cada uno con su cabecera colapsable (thumbnail, nombre, ubicación, chevron, botón eliminar).

### Caso multi-timeslot del mismo evento
El cajero vende 2× Zone A para Taylor Swift el sábado 21:30, luego cambia el timeslot al miércoles 19:00 y vende 3× Zone B. Ambos grupos aparecen bajo el mismo nombre de evento pero con cabeceras de timeslot distintas.

### Modo single-event (carrito plano)
Cuando solo hay un grupo en el carrito y coincide con el evento activo, se suprimen las cabeceras de evento y se muestran los items directamente con solo la cabecera de timeslot.

### Transición single → multi
Hay que definir cómo se anima o transiciona el layout cuando el cajero pasa de tener un solo grupo (layout plano) a tener dos o más grupos (layout con tarjetas de evento colapsables), y viceversa.

### Preguntas para diseño
- ¿Cómo se diferencia visualmente que dos grupos son del mismo evento pero distinto timeslot vs. dos eventos distintos?
- ¿Cuántos grupos son razonables antes de que el scroll se vuelva problemático?
- Badge "Different timeslot": cuando el timeslot activo no coincide con un grupo existente, aparece un badge ámbar informativo. ¿Es suficientemente claro o necesita más contexto visual?
- ¿Cómo se ve el carrito cuando hay, por ejemplo, 3 eventos × 2 timeslots cada uno = 6 grupos? ¿Hay que colapsar todos menos el activo por defecto?

---

## 2. Productos con variantes

### Tile con variantes
Los tiles de productos con variantes muestran un prefijo "from" antes del precio base (ej. "from €18,00"). Al hacer tap no se añade al carrito directamente, sino que se abre el **Variant Picker**.

### Variant Picker (modal de selección)
- Modal centrado con nombre del producto y etiqueta del eje (ej. "Seleccionar talla").
- Botones pill para cada variante (S, M, L, XL), cada uno con su precio específico del warehouse de referencia.
- Variantes sin stock: desactivadas y en gris.
- Seleccionar una pill añade al carrito y cierra el picker.

### Variantes con precio de miembro
Cuando hay un miembro identificado:
- El tile muestra un badge corona si al menos una variante tiene precio de miembro, pero el precio sigue como "from €X,XX" (sin tachado en el tile).
- Dentro del picker, las pills con precio de miembro muestran precio original tachado + precio de miembro. Las que no tienen pricing especial muestran solo el precio normal.

### Variantes en el carrito
Cada variante se muestra como **línea separada** (ej. Navy T-Shirt talla M y Navy T-Shirt talla L son dos filas distintas). La variante seleccionada aparece en un pill gris debajo del nombre del producto.

### Impacto en Catalog Integration
Las variantes también afectan la vista de Products en Catalog Integration:
- Columna "Variants" en la tabla de productos con badge clickeable (ej. "4 sizes").
- Sub-filas expandibles con label, SKU, stock total y rango de precios por warehouse.
- Panel lateral de warehouse con desglose por variante (pill de label, stock, precio).

### Preguntas para diseño
- ¿Cómo escala el Variant Picker cuando hay muchas variantes (ej. 10+ tallas o combinaciones de talla + color)?
- ¿Se necesita un eje secundario (ej. talla + color)? Si sí, ¿cómo se presenta la selección de dos dimensiones?
- ¿Es clara la relación entre la pill gris de variante en el carrito y el producto padre?

---

## 3. Tiles con y sin imagen

### Con imagen
El tile muestra un thumbnail de 40×40px con bordes redondeados en la esquina superior izquierda, junto al nombre del producto. El nombre se ajusta al espacio restante.

### Sin imagen
El tile no muestra thumbnail; el nombre del producto ocupa todo el ancho disponible en la parte superior. El icono de categoría (gift, cart-plus, etc.) aparece en la esquina inferior derecha.

### Categorías (tiles de navegación)
Las category tiles nunca tienen imagen; muestran un icono de cajas apiladas (boxes-stacked) en la esquina inferior derecha y no muestran precio.

### Preguntas para diseño
- ¿Se necesita un placeholder visual para productos sin imagen (icono genérico, color de fondo) para mantener consistencia en la grid cuando conviven tiles con y sin imagen?
- ¿La mezcla de tiles con y sin imagen en la misma vista crea ruido visual? ¿Sería mejor un tratamiento uniforme?

---

## 4. Precios de miembro

### Identificación de miembro
El cajero pulsa el botón de "Identify member" en el header del carrito, escanea un QR o introduce un ID manualmente. Al confirmar, aparece un pill en el header con el nombre del miembro y su tier (Gold/Silver/Basic) con icono de rol (star para primary, user-plus para beneficiary).

### Impacto en los tiles
- **Product tiles** con precio de miembro: badge triangular en esquina superior derecha (fondo amarillo claro `#FFF3D6`, corona naranja).
- **Category tiles**: mismo badge corona si la categoría o alguno de sus descendientes tiene productos con precio de miembro.
- **Explode pipe chips**: icono corona naranja inline después del nombre de la categoría.

### Impacto en el carrito
- Precio original tachado + precio de miembro + icono corona naranja.
- Cuando se identifica un miembro **a mitad de la transacción**, los items existentes se actualizan retroactivamente (el precio original se almacena y el precio visible cambia al de miembro).
- Al limpiar el miembro (× en el pill), todos los precios se revierten.

### Preguntas para diseño
- ¿Es suficientemente visible el badge corona en tiles pequeños (especialmente en la resolución del iMin)?
- ¿Cómo se ve el carrito cuando la mayoría de los items tienen precio de miembro? ¿Mucho tachado genera ruido visual?
- ¿Hace falta un indicador global en el carrito de que "hay descuento de miembro activo" además del pill en el header?

---

## 5. Navegación por categorías: explode pipes y category tiles

### Explode pipes (primer nivel)
- En la pestaña **Tickets**: chips como "General Admission", "VIP Experience", "Premium". Dependen del evento: algunos eventos tienen chips, otros no.
- En la pestaña **Merch**: chips como "Apparel", "Books", "Home & Living". Siempre presentes en el nivel raíz.
- El chip activo tiene borde azul (`#0079CA`).

### Category tiles (segundo nivel en adelante, solo Merch)
- Tiles con stripe morado (`#AE92ED`) e icono de cajas apiladas.
- Al hacer tap se navega al siguiente nivel; los explode pipes se reemplazan por breadcrumbs.

### Breadcrumbs
- Aparecen al navegar dentro de la jerarquía de categorías (Merch).
- Cada ancestro es clickeable para volver a ese nivel.
- El botón Home se activa al estar en un nivel profundo.

### Preguntas para diseño
- ¿Cómo se ve la transición visual entre explode pipes y breadcrumbs? ¿Es abrupta o se necesita una animación?
- ¿Qué pasa cuando hay muchos chips de primer nivel que no caben en una línea? ¿Scroll horizontal, wrap, o truncar?
- ¿Las categorías profundas (3+ niveles) siguen siendo usables con breadcrumbs largos?

---

## 6. Calendario y selección de timeslot

### Diseño del modal
- Horizontal date pill strip (solo fechas con sesiones disponibles).
- Tarjetas de timeslot agrupadas por hora del día (Morning / Afternoon / Evening).
- Indicadores de disponibilidad: Available (verde), Filling up (ámbar + conteo), Almost gone (rojo + conteo), Sold out (gris, desactivado).

### Selección en dos pasos
Tap en un timeslot lo resalta (borde azul) → botón "Confirm selection" aplica la selección. Esto previene selecciones accidentales.

### Timeslot requerido
No se pueden añadir entradas sin timeslot seleccionado. Si el cajero intenta añadir un producto sin timeslot, se abre automáticamente el modal del calendario.

### Auto-apertura en eventos con asientos
Al entrar en la pestaña de seating sin timeslot seleccionado, el modal se abre automáticamente.

### Preguntas para diseño
- ¿Cómo se ve el modal para un evento con muchas fechas (ej. 60+ fechas)? ¿El scroll horizontal de pills es suficiente?
- ¿Y cuando un día tiene muchos timeslots (ej. 15+ sesiones)?
- Indicator de "Selected" en un timeslot previo + checkmark en el date pill: ¿es claro que esto es la selección actual vs. la que se está a punto de confirmar?

---

## 7. Selector de Box Office Setup y Payment Device (header)

### Dropdown combinado
Widget compacto en el header que muestra:
- **Label flotante**: nombre del venue (ej. "Portsmouth Historic Dockyard")
- **Valor compacto**: `{Setup Name} • {Device ID}` (ej. "Explosion Museum • S1F2-…9174")
- Icono de engranaje.

### Panel desplegable con dos secciones
1. **Box Office Setup**: lista accordion de venues con sus setups. Solo un venue expandido a la vez. Setup seleccionado con checkmark.
2. **Payment Device**: lista filtrada por los devices vinculados al setup seleccionado. Selección con checkmark.

### Selección en cascada
- Al cambiar de setup, la lista de devices se filtra automáticamente.
- Si el device actual ya no es válido para el nuevo setup, se auto-selecciona el primero disponible o se limpia la selección.

### Estado vacío de devices
Cuando ningún device está vinculado al setup: texto en cursiva "No payment devices linked to this setup".

### Preguntas para diseño
- El dropdown se queda abierto al hacer selecciones (para permitir cambiar setup + device en una interacción). ¿Es intuitivo o confuso?
- ¿Cómo se ve con muchos venues (ej. 10+) y muchos setups por venue?
- ¿El truncado de Device ID es legible? ¿El formato "PREFIX-…SUFFIX" es suficiente para diferenciar terminales?

---

## 8. Eventos con asientos asignados (Seated Events)

### Diferencia de tabs
- Evento sin asientos: tabs "Tickets & Add-Ons" + "Merch"
- Evento con asientos: tabs "Seating" (nombre del evento) + "Add-Ons" + "Merch"

### Mapa interactivo de asientos
- Sidebar izquierda: filtro por tier de precio (checkboxes con indicador de color), contador de asientos seleccionados, "Clear selection".
- Área principal: mapa SVG con vista general (secciones) → vista de sección (asientos individuales).
- Hover tooltip con detalles de sección/asiento y precios.

### Modal de selección de asiento
Al hacer click en un asiento: muestra sección, fila, número + opciones de ticket type (Adult / Child) con precio + fee.

### Asientos en el carrito
- Cada asiento es una línea separada (cantidad siempre = 1, no se puede incrementar).
- Bloque de info de asiento (sección, fila, número) en un recuadro azul debajo del nombre del ticket.

### Preguntas para diseño
- ¿Cómo se ve el carrito con muchos asientos seleccionados (ej. un grupo de 20 personas)? ¿Es manejable tener 20 líneas individuales?
- ¿Cómo se diferencia visualmente un asiento Adult vs. Child en el carrito?
- ¿El filtro por tier en la sidebar es suficiente o se necesita búsqueda por sección/fila?
- ¿La transición overview → section view del mapa es clara?

---

## 9. Shift management (gestión de turnos)

### Sin turno activo
- Widget en el header: icono de reloj + fecha/hora actual + botón "Start shift" (pill con icono play).

### Modal de inicio de turno
- Dropdown de caja registradora (lista con búsqueda).
- Input de cantidad inicial de efectivo con formateo automático de moneda (€).
- Botón "Start shift" desactivado hasta que se selecciona una caja.

### Con turno activo
- Widget muestra hora de inicio del turno + link "See shift details" (azul) + botón "End shift" (rojo con icono stop).

### Preguntas para diseño
- ¿Qué pasa visualmente si el cajero intenta procesar una venta sin haber iniciado turno? ¿Se bloquea la UI? ¿Se muestra un aviso?
- ¿El botón "End shift" necesita confirmación (ej. modal de cierre de caja con resumen de ventas)?

---

## 10. Teclados en pantalla (iMin device preview)

### Teclado numérico (edición de cantidad)
- Estilo Gboard: grid 3×4, teclas 64px.
- Teclas de función: checkmark (confirmar) abajo-izquierda, backspace abajo-derecha.
- "Cancel" en la barra espaciadora para descartar sin guardar.

### Teclado alfanumérico (input de Member ID)
- QWERTY completo tipo tablet, ancho completo del device.
- Fila de números en la parte superior.
- Shift toggle para mayúsculas (se desactiva automáticamente después de un carácter).
- Botones: Cancel (descarta), Space, Done (azul, envía).
- El modal se reposiciona para centrarse en el espacio disponible encima del teclado.

### Preguntas para diseño
- ¿Los teclados se ven bien en la resolución efectiva del iMin (1397×786 dp)? ¿Las teclas son suficientemente grandes para touch?
- ¿Se necesita feedback háptico visual (animación de press) en las teclas?
- ¿El reposicionamiento del modal al abrir el teclado es suave o abrupto?

---

## 11. Quick Picks (tabs configurables por el partner)

### Concepto
Los partners configuran tabs personalizados (ej. "Retail", "F&B", "Meal Deals") con un editor visual de drag-and-drop. Cada tab tiene su grid de tiles con colores y textos personalizados.

### Vinculación
- Cada config de Quick Picks se asocia a un warehouse.
- Se despliegan a dispositivos POS vinculándolos a Box Office Setups.

### Preguntas para diseño
- ¿Cómo se ven los tiles con colores de stripe personalizados (fuera de los estándar azul/naranja/verde/morado)?
- ¿Cuántos tabs personalizados son razonables en la barra de navegación antes de que sea necesario scroll horizontal o un menú overflow?
- ¿El editor de Quick Picks necesita una vista de preview para ver cómo quedará el tab en el POS real?
- ¿Cómo manejar nombres de tabs largos (ej. "Comidas y Bebidas Temporada Alta")?

---

## 12. Estados vacíos y de carga

### Carrito vacío
- Icono de recibo centrado + texto "The cart is empty". Header del carrito oculto.

### Grid de productos vacía
- Mensaje "No products in this category" cuando una categoría no tiene productos.

### Sin sesiones disponibles (timeslot modal)
- Icono de calendario + texto "No sessions available".

### Sin devices vinculados
- Texto en cursiva "No payment devices linked to this setup" en la sección de Payment Device del dropdown.

### Carga del device preview
- Spinner + "Loading device…" mientras se carga la imagen del marco del iMin.

### Preguntas para diseño
- ¿Los estados vacíos necesitan CTAs accionables? Ej. "No products in this category" → botón para volver al nivel raíz.
- ¿El estado vacío del carrito es visualmente atractivo o solo funcional?
- ¿Se necesitan skeleton loaders para la carga de productos?

---

## 13. Pagos: Cash vs. Card

### Botones de pago
- **Cash**: fondo blanco, borde gris, icono wallet, texto azul.
- **Card**: fondo azul (`#0079CA`), texto blanco, icono tarjeta de crédito.

### Preguntas para diseño
- ¿Qué flujo sigue después de pulsar "Cash"? ¿Se abre un modal de cambio (monto recibido → cambio a devolver)?
- ¿Qué flujo sigue después de pulsar "Card"? ¿Se muestra un estado de "esperando terminal Adyen"?
- ¿Qué pasa si no hay Payment Device vinculado y se pulsa "Card"?
- ¿Se necesita un split payment (parte cash, parte card)?
- ¿Cómo se ve el estado post-pago? ¿Confirmación en pantalla, impresión de recibo, reset del carrito?

---

## 14. Descuentos

### Estado actual
- Link "Select discount type" en el footer del carrito (texto azul, debajo del total).

### Preguntas para diseño
- ¿Qué tipos de descuento se soportan? ¿Porcentaje, monto fijo, código promocional?
- ¿Se aplican a nivel de carrito o a nivel de item individual?
- ¿Se necesitan permisos para aplicar descuentos? ¿Cómo se refleja visualmente si el cajero no tiene permiso?
- ¿Cómo se muestra el descuento aplicado en el resumen (línea separada con el monto descontado)?

---

## 15. Interacción táctil y simulación del iMin

### Cursor de touch simulado
- Círculo semitransparente azul de 44px con skew para matching la perspectiva 3D del device.
- Estado pressed: escala al 85% con más opacidad.
- Se desactiva automáticamente al detectar touch real (ej. Surface Pro, iPad).

### Hover states desactivados
- En modo simulación, todos los hover effects se anulan (`data-touch-mode="true"`).
- Solo `:active` states se mantienen para feedback visual en tap.

### Preguntas para diseño
- ¿Todos los elementos interactivos tienen un `:active` state suficientemente visible cuando hover está desactivado?
- ¿El ripple effect de los tiles es suficiente como feedback de tap?

---

## 16. Producto escaneado (barcode/SKU)

### Caso de uso
El cajero escanea un producto con el lector de barcode del iMin. El producto se identifica por SKU/GTIN y se añade al carrito.

### Preguntas para diseño
- ¿Qué pasa si se escanea un producto con variantes? ¿Se abre el Variant Picker automáticamente?
- ¿Se muestra algún feedback visual de "producto escaneado" (ej. flash en el tile correspondiente, toast notification)?
- ¿Qué pasa si el SKU no se reconoce? ¿Mensaje de error? ¿Sonido?
- ¿Y si el producto escaneado está fuera de stock?

---

## 17. Marquee del nombre de evento

### Comportamiento
- Si el nombre del evento desborda el ancho del tab, se auto-scrollea horizontalmente (ida y vuelta) una vez al abrir el POS.
- Al hacer tap en el nombre, se reproduce el scroll una vez más.
- Después queda truncado con ellipsis.

### Preguntas para diseño
- ¿La velocidad del scroll es adecuada para nombres largos vs. nombres apenas más largos que el espacio?
- ¿Se necesita un tooltip como alternativa al marquee para ver el nombre completo?

---

## 18. Customer Facing Display (pantalla secundaria)

### Estado futuro
El iMin Swan 1 Pro tiene doble pantalla. La segunda pantalla (customer-facing) mostrará el carrito, precios, y potencialmente preguntas de booking y donaciones.

### Preguntas para diseño
- ¿Qué información se muestra en la pantalla del cliente?
- ¿Se replica el carrito completo o un resumen simplificado?
- ¿Hay interactividad en la pantalla del cliente (ej. aceptar donación, responder preguntas de booking)?
- ¿El diseño del carrito en la pantalla del cliente es diferente al del cajero?

---

## 19. Refunds y exchanges

### Estado futuro
Flujo de devolución/cambio para todos los tipos de producto.

### Preguntas para diseño
- ¿Cómo se inicia un refund? ¿Desde el historial de transacciones? ¿Escaneando un recibo?
- ¿Se puede hacer un refund parcial (solo algunos items de una transacción)?
- ¿Cómo se ve un exchange (devolver talla M, dar talla L)?
- ¿Qué permisos se requieren y cómo se refleja visualmente?

---

## 20. Búsqueda de productos

### Estado actual
Botón circular de búsqueda (lupa) en la esquina superior derecha de la zona de tabs.

### Preguntas para diseño
- ¿Cómo se despliega la búsqueda? ¿Barra inline, modal, overlay?
- ¿Se busca solo en la tab activa o en todo el catálogo?
- ¿Los resultados se muestran como tiles o como lista?
- ¿Se puede buscar por SKU además de por nombre?
- ¿Qué pasa con el empty state de "sin resultados"?

---

## 21. Contactos (libreta de direcciones)

### Estado actual
Botón circular de contactos (icono de libreta) junto al botón de búsqueda.

### Preguntas para diseño
- ¿Para qué se usa esta funcionalidad? ¿Buscar clientes recurrentes? ¿Asignar una venta a un contacto?
- ¿Cómo se relaciona con la identificación de miembro?
- ¿Se necesita crear contactos nuevos desde el POS?

---

*Última actualización: Febrero 2026*
