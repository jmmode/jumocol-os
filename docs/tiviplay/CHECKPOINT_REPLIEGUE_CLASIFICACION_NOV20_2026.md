# JUMOCOL OS — Checkpoint de repliegue y clasificación de pagos confirmados

**Corte operacional:** movimientos hasta el 20 de noviembre de 2026 (último movimiento visible confirmado en las fuentes: 19/11).
**Fuente viva:** https://docs.google.com/spreadsheets/d/1bOgUMrHoAyAm-aoRhXgylWfbHph7tsvJYz1mIujdi-4/edit
**Área primaria:** 04 Plataforma y Equipo; dependencias: 00 Gobierno, 01 Cobranza, 02 Finanzas, 03 Comercial.
**Estado del gate:** PARCIAL — reporte de ejecución y auditoría, NO autorización de propagación indiscriminada.

## 1. Actuaciones implementadas

- `PAGOS NOVIEMBRE 2026`: fórmulas protegidas por autorización financiera e identidad para los registros de las semanas 1–3 y fechas 19–20 de semana 4. Se preservaron los 5 pilotos previos y se extendió la lógica a las demás filas con vínculo BASE.
- Identificación de fuente por columna L (`ZELLE`, `PAYPAL`, medios `TRANSF`), requerimiento de una única fila fuente, `CONFIRMADO JM`, estado de enlace, tarifa `VALIDADO`, importe USD compatible y fecha de movimiento no posterior al 20/11/2026.
- `ZELLE (NOV)!I80:AD81`: se propagaron las 22 fórmulas existentes para las operaciones de Omar Villalobos y Cristhian Salazar (19/11). Se conservaron movimientos y confirmaciones originales.
- `PAGOS NOVIEMBRE 2026!A125:V176`: cola de **52 movimientos únicos**, a partir de las tres fuentes; A:Q conserva semántica comercial; R columna única desplegable con las cuentas de BASE GENERAL; S fila destino por selección; T cuentas candidatas; U tipo de caso; V gate bloqueado hasta asesor.
- `BASE GENERAL`: NO se sobrescribieron fórmulas maestras durante este despliegue; se comprobó que las existentes ya reflejan correctamente movimientos con validaciones nativas completas.
- Las fechas y datos históricos se preservan cuando no existe evento inequívocamente autorizado; `BASE GENERAL!Q` (crédito técnico) sigue siendo independiente de último/próximo cobro.

## 2. Métricas conciliadas (denominadores distintos)

| Control | Cantidad | Interpretación |
|---|---:|---|
| Movimientos financieros `CONFIRMADO JM` al corte | 91 | ZELLE 78, PAYPAL 6, TRANSF 7 |
| Movimientos con gate nativo `VALIDADO` y coincidencia de fechas en BASE GENERAL | 38 | Maestro observado con mismo último/próximo pago |
| Excepción Harry con validación comercial especial | 1 | Adicional a esos 38; validada end-to-end |
| Movimientos en cola comercial | 52 | Sin aplicación automática hasta revisión |
| Clientes del segmento semanal auditado | 55 | PAGOS NOVIEMBRE filas 4–64, sin encabezados/subtotales |
| Clientes del segmento con `CONFIRMADO JM` replegado | 24 | Las dos fechas en PAGOS son iguales a BASE GENERAL en los 24 |
| Clientes del segmento sin `CONFIRMADO JM` replegado | 31 | No equivale automáticamente a 31 pagos faltantes |
| Casos de cola `HABILITADO` | 0 | Ningún asesor ha aprobado las nuevas excepciones |

**Cobertura demostrada conservadora:** 39/91 (~42,9 %) de movimientos con evidencia de coherencia financiera en maestro (38 automáticos + Harry especial). En la hoja mensual, 24/55 (~43,6 %) registros del segmento muestran repliegue autorizado. Estos porcentajes NO son comparables entre sí ni demuestran aún el objetivo 70–80 %.

## 3. Cola comercial clasificada por caso

### TARIFA / PLAN (24)

| Fila comercial | Cliente / pagador | ID movimiento | Fuente | USD registrado |
|---:|---|---|---|---:|
| 125 | Guiomar Suarez | `ZELLE-NOV-7` | ZELLE (NOV) | 70 |
| 126 | Oscar Tovar | `ZELLE-NOV-9` | ZELLE (NOV) | 15 |
| 127 | Renzo Hurtado | `ZELLE-NOV-10` | ZELLE (NOV) | 15 |
| 128 | Karla Ruiz/Pedro | `ZELLE-NOV-12` | ZELLE (NOV) | 110 |
| 130 | Pedro Yepes | `ZELLE-NOV-16` | ZELLE (NOV) | 10 |
| 131 | Michael Puentes | `ZELLE-NOV-19` | ZELLE (NOV) | 70 |
| 134 | Yolanda Duran | `ZELLE-NOV-25` | ZELLE (NOV) | 70 |
| 135 | Pedro Pablo Sarmiento  | `ZELLE-NOV-27` | ZELLE (NOV) | 10 |
| 136 | Cristian Cano Agnello | `ZELLE-NOV-30` | ZELLE (NOV) | 6 |
| 137 | Leifer Torres | `ZELLE-NOV-31` | ZELLE (NOV) | 70 |
| 139 | Daniel Gamarra | `ZELLE-NOV-33` | ZELLE (NOV) | 70 |
| 141 | Maria Oliver | `ZELLE-NOV-36` | ZELLE (NOV) | 70 |
| 146 | Christian Flores | `ZELLE-NOV-44` | ZELLE (NOV) | 70 |
| 152 | Rosa Castillo  | `ZELLE-NOV-57` | ZELLE (NOV) | 10 |
| 156 | Olga Valencia | `ZELLE-NOV-61` | ZELLE (NOV) | 15 |
| 157 | Javier Bermudez  | `ZELLE-NOV-63` | ZELLE (NOV) | 70 |
| 158 | Gustavo Ramirez | `ZELLE-NOV-64` | ZELLE (NOV) | 10 |
| 161 | Jairo Richard Montoya | `ZELLE-NOV-69` | ZELLE (NOV) | 130 |
| 166 | Hernan Chaverra | `ZELLE-NOV-77` | ZELLE (NOV) | 70 |
| 168 | Giovanny Padilla | `ZELLE-NOV-79` | ZELLE (NOV) | 130 |
| 171 | Carlos Olivera | `PAYPAL-NOV-6` | PAYPAL (NOV) | 130 |
| 172 | Yamir Rojas | `PAYPAL-NOV-7` | PAYPAL (NOV) | 70 |
| 173 | Freiner Iturres | `PAYPAL-NOV-8` | PAYPAL (NOV) | 130 |
| 174 | Diego Guzman Solano | `TRANSF-NOV-3` | TRANSF (NOV) | 70 |

### VARIAS CUENTAS CANDIDATAS (11)

| Fila comercial | Cliente / pagador | ID movimiento | Fuente | USD registrado |
|---:|---|---|---|---:|
| 129 | Gerlys Herrera | `ZELLE-NOV-13` | ZELLE (NOV) | 15 |
| 133 | Mauricio Garcia | `ZELLE-NOV-24` | ZELLE (NOV) | 70 |
| 140 | Jessica Gonzalez | `ZELLE-NOV-34` | ZELLE (NOV) | 70 |
| 142 | Neiser Becerra | `ZELLE-NOV-37` | ZELLE (NOV) | 15 |
| 143 | Angel Johan Urdaneta | `ZELLE-NOV-39` | ZELLE (NOV) | 15 |
| 150 | Jorge Torres Gonzales | `ZELLE-NOV-52` | ZELLE (NOV) | 10 |
| 153 | Sergio Naranjo | `ZELLE-NOV-58` | ZELLE (NOV) | 10 |
| 155 | Jonathan Torres | `ZELLE-NOV-60` | ZELLE (NOV) | 35 |
| 163 | Donato Leidy Angélica | `ZELLE-NOV-72` | ZELLE (NOV) | 70 |
| 167 | Dionell Carrion | `ZELLE-NOV-78` | ZELLE (NOV) | 30 |
| 175 | Julio Caicedo | `TRANSF-NOV-5` | TRANSF (NOV) | 30 |

### SIN BASE / BENEFICIARIO (15)

| Fila comercial | Cliente / pagador | ID movimiento | Fuente | USD registrado |
|---:|---|---|---|---:|
| 132 | Kevin Figueredo | `ZELLE-NOV-23` | ZELLE (NOV) | 70 |
| 138 | Kwae  Htoo | `ZELLE-NOV-32` | ZELLE (NOV) | 25 |
| 144 | Carmenza Gonzalez | `ZELLE-NOV-42` | ZELLE (NOV) | 10 |
| 145 | Luigy Rayo  | `ZELLE-NOV-43` | ZELLE (NOV) | 15 |
| 147 | Alvaro Saenz | `ZELLE-NOV-47` | ZELLE (NOV) | 150 |
| 148 | Jennier Estela | `ZELLE-NOV-49` | ZELLE (NOV) | 15 |
| 149 | Jorge Artica | `ZELLE-NOV-50` | ZELLE (NOV) | 15 |
| 154 | Miguel Larain | `ZELLE-NOV-59` | ZELLE (NOV) | 10 |
| 159 | Dora Cristina | `ZELLE-NOV-66` | ZELLE (NOV) | 25 |
| 160 | Yovany carranza / Cecilio Carranza | `ZELLE-NOV-67` | ZELLE (NOV) | 82 |
| 162 | Juan Alberto | `ZELLE-NOV-70` | ZELLE (NOV) | 40 |
| 164 | Juan Garces | `ZELLE-NOV-74` | ZELLE (NOV) | 70 |
| 165 | Yenny Montañez | `ZELLE-NOV-75` | ZELLE (NOV) | 15 |
| 169 | Omar Villalobos | `ZELLE-NOV-80` | ZELLE (NOV) | 180 |
| 170 | Cristhian Salazar | `ZELLE-NOV-81` | ZELLE (NOV) | 180 |

### ENLACE AMBIGUO (1)

| Fila comercial | Cliente / pagador | ID movimiento | Fuente | USD registrado |
|---:|---|---|---|---:|
| 151 | Julio Charria/Claudia Medina         | `ZELLE-NOV-56` | ZELLE (NOV) | 10 |

### MONEDA / CONVERSIÓN (1)

| Fila comercial | Cliente / pagador | ID movimiento | Fuente | USD registrado |
|---:|---|---|---|---:|
| 176 | Gustavo Sepulveda | `TRANSF-NOV-9` | TRANSF (NOV) | 32900 |

**Interpretación especial:** `VARIAS CUENTAS CANDIDATAS` denota más de un registro de nombre relacionado, que puede significar cuentas familiares o duplicación de datos. No decidir sin revisar ID de servicio y titular.
**Gerlys (ZELLE-NOV-13, fila comercial 129):** los candidatos detectados son «Gerlys Herrera | Cuenta principal» y «Gerlys Herrera | Cuenta Doris Maria Duque». El movimiento confirmado es de USD 15 y NO se puede acreditar a ambas cuentas simultáneamente.
**Moneda:** Gustavo Sepulveda tiene valor de origen en COP. No equiparar COP a USD ni asignar tarifa sin conversión evidenciada.

## 4. Registros mensuales con repliegue financiero confirmado

| Fila mensual | Cliente | Método original | Movimiento | Último pago | Próximo pago |
|---:|---|---|---|---|---|
| 4 | Ricardo Rodriguez | PAYPAL | PAYPAL (NOV)!3 | 01-11-26 | 01-05-27 |
| 5 | Harry Quintero | ZELLE | ZELLE (NOV)!14 | 04-11-26 | 04-02-28 |
| 6 | Patricia Franco | ZELLE | ZELLE (NOV)!5 | 02-11-26 | 02-12-26 |
| 8 | Sofia Aparicio | ZELLE | ZELLE (NOV)!11 | 03-11-26 | 03-12-26 |
| 10 | John Rodriguez | ZELLE | ZELLE (NOV)!51 | 13-11-26 | 13-01-27 |
| 16 | Luz Loaiza | ZELLE | ZELLE (NOV)!20 | 05-11-26 | 05-12-26 |
| 22 | George Solarte | ZELLE | ZELLE (NOV)!40 | 10-11-26 | 10-03-27 |
| 25 | Marco Campos /Javier | PAYPAL | PAYPAL (NOV)!4 | 05-11-26 | 05-12-26 |
| 28 | Pablo Morales | ZELLE | ZELLE (NOV)!35 | 08-11-26 | 08-11-27 |
| 30 | Anubis Montes | ZELLE | ZELLE (NOV)!26 | 06-11-26 | 06-12-26 |
| 31 | Hugo Garavito | ZELLE | ZELLE (NOV)!8 | 02-11-26 | 02-03-27 |
| 32 | Sergio Guillen | ZELLE | ZELLE (NOV)!45 | 11-11-26 | 11-01-28 |
| 35 | Sammy Wolcovinsky | PAYPAL | PAYPAL (NOV)!5 | 09-11-26 | 09-01-27 |
| 37 | Beatriz Velez /Carlos Castaño | ZELLE | ZELLE (NOV)!22 | 05-11-26 | 05-02-27 |
| 41 | John Diesel Torres | ZELLE | ZELLE (NOV)!46 | 11-11-26 | 11-08-27 |
| 42 | Alejandra Marin /Sandra mamá | ZELLE | ZELLE (NOV)!55 | 13-11-26 | 13-12-26 |
| 43 | Elena Acosta (Cuenta Roberto Muñoz) | ZELLE | ZELLE (NOV)!38 | 10-11-26 | 10-12-26 |
| 44 | Allison Torres / Victor Torres | ZELLE | ZELLE (NOV)!29 | 07-11-26 | 07-12-26 |
| 45 | Manuel Tovar | ZELLE | ZELLE (NOV)!65 | 14-11-26 | 14-02-27 |
| 47 | Victoria Ramirez | ZELLE | ZELLE (NOV)!41 | 10-11-26 | 10-02-27 |
| 50 | Diego Guzman | ZELLE | ZELLE (NOV)!68 | 16-11-26 | 16-05-27 |
| 51 | Claudia Ortiz | ZELLE | ZELLE (NOV)!48 | 12-11-26 | 12-02-27 |
| 56 | Genoveva Cobian | ZELLE | ZELLE (NOV)!76 | 18-11-26 | 18-12-26 |
| 57 | Luis Melgar | ZELLE | ZELLE (NOV)!73 | 17-11-26 | 17-12-26 |

## 5. Registros mensuales todavía no replegados

| Fila mensual | Cliente | Método declarado L | Enlace X existente |
|---:|---|---|---|
| 7 | Gerlys Herrera | ZELLE | BASE GENERAL!731 |
| 9 | Miguel Larrain | ZELLE | BASE GENERAL!793 |
| 11 | Hernando Ortega | PAYPAL | BASE GENERAL!774 |
| 14 | Camila Moncada | BANCOLOMBIA | BASE GENERAL!792 |
| 15 | Neiser Becerra | ZELLE | BASE GENERAL!739 |
| 17 | William Giraldo | ZELLE | BASE GENERAL!776 |
| 18 | Sergio Naranjo | ZELLE | BASE GENERAL!740 |
| 19 | Emily Ramirez | ZELLE | BASE GENERAL!741 |
| 20 | Angel Johan Urdaneta | ZELLE | BASE GENERAL!745 |
| 21 | Bryan Arandia | ZELLE | BASE GENERAL!18 |
| 23 | Jorge  Benitez | ZELLE | BASE GENERAL!779 |
| 24 | Mario Arriola | ZELLE | BASE GENERAL!780 |
| 26 | Edwin Altez | ZELLE | BASE GENERAL!782 |
| 27 | Derling Obregon | ZELLE | BASE GENERAL!783 |
| 29 | Fernando Castillo | BANCOLOMBIA | BASE GENERAL!785 |
| 33 | Armando/Juan Carlos Morales | DAVIVIENDA | BASE GENERAL!10 |
| 34 | Julio Caicedo | NEQUI | BASE GENERAL!11 |
| 36 | Paola Escobar | ZELLE | BASE GENERAL!13 |
| 38 | Maria Claudia Fernandez | ZELLE | BASE GENERAL!15 |
| 46 | Donato Leidy Angélica | ZELLE | BASE GENERAL!21 |
| 48 | Raul Herrera | ZELLE | BASE GENERAL!23 |
| 49 | Wilson Fernandez | NEQUI | BASE GENERAL!752 |
| 52 | Ruddy Santamaria | ZELLE | BASE GENERAL!26 |
| 53 | Dionell Carrion | ZELLE | BASE GENERAL!760 |
| 54 | Gamarier Bonilla | ZELLE | BASE GENERAL!27 |
| 55 | Jairo Richard Montoya | ZELLE | BASE GENERAL!50 |
| 58 | Amir Franco / Hilda | BANCOLOMBIA | BASE GENERAL!31 |
| 59 | Aracelly del Valle | ZELLE | BASE GENERAL!32 |
| 60 | Giovanny Padilla | ZELLE | BASE GENERAL!33 |
| 63 | Dora Cristina Angel | ZELLE | BASE GENERAL!34 |
| 64 | Loiseth Colmenares | ZELLE | BASE GENERAL!35 |

### Brechas de identidad detectadas

- Registros mensuales con `X` apuntando a nombre distinto en BASE GENERAL: filas 7 (Gerlys → Renzo), 15 (Neiser → Martin Perez), 18 (Sergio Naranjo → Alex de la Cruz), 19 (Emily Ramirez → Steven Barbosa), 20 (Angel Johan → Antonio Arreaga), 21 (Bryan → Elena Acosta), 49 (Wilson → Sara Canon), 55 (Jairo Richard → Samuel Mejia). Los índices pueden haber cambiado tras eliminación de duplicados.
- Miguel Larrain, fila 9: existe movimiento confirmado a nombre «Miguel Larain» en ZELLE 59; nombre y tarifa requieren revisión. No corregir por similitud únicamente.
- Hernando Ortega, fila 11: PAYPAL figura como medio habitual, pero en los movimientos consultados hasta el corte no hay una operación confirmada asociada por identidad. No generar pago.
- Fila 48 Raul Herrera: movimiento registrado en TRANSF pese a método mensual ZELLE; requiere determinar fuente efectiva y conciliar.
- Algunas filas mensuales declaran importe distinto al movimiento real (p. ej. Armando / Amir con precio mensual 0 frente a TRANSF). Se bloquean por incompatibilidad de importe hasta verificar origen.
- Validación de tarifas y promociones en el catálogo pendiente de ampliación para casos de oferta especial y cambio de plan genuino.

## 6. Contrato de operación para asesor

1. Abrir la sección existente `VALIDACION COMERCIAL · NOVIEMBRE 2026` y ordenar por tipo U; no crear hojas adicionales ni desplegables particulares.
2. Revisar la columna T con las cuentas candidatas. En R, seleccionar una cuenta del único desplegable alimentado desde BASE GENERAL. S determina su fila real.
3. Elegir en H una tarifa del catálogo; completar M/N/O con cero o el beneficio comprobado; revisar I/J/P, validar responsable L y estado K.
4. Confirmar Q solo tras comprobar beneficiario, tarifa, monto, validez de promoción, y la unicidad de la aplicación. La confirmación financiera original JM no debe ser modificada.
5. V=`HABILITADO` significa elegible para contrato de propagación, no que haya sido replegado. Antes de conectar V a BASE/PAGOS ejecutar prueba negativa y regresión para evitar doble acreditación.

## 7. Definition of Done y decisiones

- **VALIDADO:** 24/24 fechas último y próximo pago coherentes en mensual y BASE GENERAL; 38/38 fuentes nativamente validadas coherentes en BASE GENERAL; 52 ID de cola únicos y todas sus filas V bloqueadas; `ZELLE!80:81` con 22 fórmulas sin error.
- **PARCIAL:** 52 casos requieren selección comercial, conciliación o identidad. 31 filas mensuales sin repliegue que deben cruzarse con la cola y los movimientos externos.
- **NO IMPLEMENTADO:** alimentación futura automática de nuevos movimientos en A125:V176 (cola actual es snapshot de movimientos confirmados al corte) y repliegue desde V `HABILITADO` hacia ambas hojas después de decisión del asesor.
- **NEXT ACTION:** priorizar Gerlys (129), luego Miguel Larrain/Larain y Hernando Ortega; probar un caso de cada tipo; validar con evidencia que un movimiento nunca acredita dos cuentas. No declarar autonomía ni despliegue general de casos excepcionales.

**Evidencia:** lectura posterior a edición de fórmulas reales de ZELLE, de PAGOS NOVIEMBRE y auditoría de fechas en BASE GENERAL. Ninguna confirmación financiera fue escrita por este despliegue.
