"use strict";

var childProcess = require("child_process");

if (!process.env.ANTIGUEDAD_CASO) {
  var zonas = ["UTC", "America/Argentina/Buenos_Aires", "America/New_York", "Pacific/Auckland"];
  var fallo = 0;
  var i;
  for (i = 0; i < zonas.length; i++) {
    var env = {};
    var clave;
    for (clave in process.env) env[clave] = process.env[clave];
    env.TZ = zonas[i];
    env.ANTIGUEDAD_CASO = "1";
    var resultado = childProcess.spawnSync(process.execPath, [__filename], { env: env, stdio: "inherit" });
    if (resultado.status !== 0) fallo = resultado.status || 1;
  }
  process.exit(fallo);
}

var assert = require("assert");
var api = require("../script.js");

function fecha(anio, mes, dia, hora, minuto) {
  return new Date(anio, mes - 1, dia, hora, minuto, 0, 0);
}

function igual(desde, hasta, esperado) {
  var obtenido = api.formatearAntiguedad(desde, hasta);
  assert.strictEqual(
    obtenido,
    esperado,
    process.env.TZ + " :: " + obtenido + " != " + esperado
  );
}

igual(fecha(2022, 7, 4, 0, 0), fecha(2022, 7, 4, 0, 0), "0 minutos");
igual(fecha(2022, 7, 4, 0, 0), fecha(2022, 7, 3, 23, 59), "0 minutos");
igual(fecha(2022, 7, 4, 0, 0), fecha(2022, 7, 4, 0, 1), "1 minuto");
igual(fecha(2022, 7, 4, 0, 0), fecha(2022, 7, 4, 0, 2), "2 minutos");
igual(fecha(2022, 7, 4, 10, 0), fecha(2022, 7, 4, 11, 1), "1 hora y 1 minuto");
igual(fecha(2022, 7, 4, 10, 0), fecha(2022, 7, 4, 12, 0), "2 horas y 0 minutos");
igual(fecha(2022, 8, 1, 23, 50), fecha(2022, 8, 2, 0, 10), "20 minutos");
igual(fecha(2022, 7, 4, 15, 0), fecha(2022, 7, 6, 10, 0), "1 día, 19 horas y 0 minutos");
igual(fecha(2022, 12, 31, 23, 0), fecha(2023, 1, 1, 1, 30), "2 horas y 30 minutos");

igual(fecha(2020, 1, 1, 0, 0), fecha(2021, 2, 2, 1, 1), "1 año, 1 mes, 1 día, 1 hora y 1 minuto");
igual(fecha(2020, 1, 1, 0, 0), fecha(2022, 3, 3, 2, 2), "2 años, 2 meses, 2 días, 2 horas y 2 minutos");

igual(fecha(2022, 7, 4, 0, 0), fecha(2022, 8, 4, 0, 0), "1 mes y 0 minutos");
igual(fecha(2022, 7, 4, 0, 0), fecha(2023, 7, 4, 0, 0), "1 año y 0 minutos");
igual(fecha(2022, 7, 4, 0, 0), fecha(2026, 7, 4, 0, 0), "4 años y 0 minutos");
igual(
  fecha(2022, 7, 4, 0, 0),
  fecha(2026, 7, 3, 23, 59),
  "3 años, 11 meses, 29 días, 23 horas y 59 minutos"
);

igual(fecha(2024, 1, 31, 0, 0), fecha(2024, 3, 1, 0, 0), "1 mes, 1 día y 0 minutos");
igual(fecha(2023, 1, 31, 0, 0), fecha(2023, 3, 1, 0, 0), "1 mes, 1 día y 0 minutos");
igual(fecha(2022, 1, 31, 0, 0), fecha(2022, 2, 28, 0, 0), "1 mes y 0 minutos");
igual(fecha(2022, 5, 31, 0, 0), fecha(2022, 6, 30, 0, 0), "1 mes y 0 minutos");
igual(fecha(2022, 1, 31, 15, 45), fecha(2022, 3, 1, 15, 44), "1 mes, 23 horas y 59 minutos");

igual(fecha(2024, 2, 29, 0, 0), fecha(2025, 2, 28, 0, 0), "1 año y 0 minutos");
igual(fecha(2024, 2, 29, 0, 0), fecha(2025, 3, 1, 0, 0), "1 año, 1 día y 0 minutos");
igual(fecha(2024, 2, 29, 12, 0), fecha(2028, 2, 29, 12, 0), "4 años y 0 minutos");
igual(
  fecha(2024, 2, 29, 12, 0),
  fecha(2025, 2, 28, 11, 59),
  "11 meses, 29 días, 23 horas y 59 minutos"
);

igual(api.parseFechaLocal("2022-07-04"), fecha(2022, 8, 4, 0, 0), "1 mes y 0 minutos");
assert.ok(isNaN(api.parseFechaLocal("").getTime()));
assert.ok(isNaN(api.parseFechaLocal("2022-7").getTime()));

if (process.env.TZ === "America/New_York") {
  var primaveraDesde = fecha(2026, 3, 8, 0, 30);
  var primaveraHasta = fecha(2026, 3, 8, 4, 30);
  igual(primaveraDesde, primaveraHasta, "4 horas y 0 minutos");
  assert.strictEqual((primaveraHasta.getTime() - primaveraDesde.getTime()) / 3600000, 3);

  var otonoDesde = fecha(2026, 11, 1, 0, 30);
  var otonoHasta = fecha(2026, 11, 1, 3, 30);
  igual(otonoDesde, otonoHasta, "3 horas y 0 minutos");
  assert.strictEqual((otonoHasta.getTime() - otonoDesde.getTime()) / 3600000, 4);
}

console.log("ok " + process.env.TZ);
