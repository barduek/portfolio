/* Antigüedad en PagoTIC a partir de data-desde. Esa fecha no se muestra.
   El texto del HTML es el respaldo si este archivo no corre.
   Con la página abierta, el valor se refresca cada 10 segundos. */
(function () {
  "use strict";

  var INTERVALO_RELOJ_MS = 10000;

  function parseFechaLocal(iso) {
    var partes = String(iso || "").replace(/^\s+|\s+$/g, "").split("-");
    if (partes.length !== 3) return new Date(NaN);
    var anio = parseInt(partes[0], 10);
    var mes = parseInt(partes[1], 10);
    var dia = parseInt(partes[2], 10);
    if (!anio || !mes || !dia) return new Date(NaN);
    return new Date(anio, mes - 1, dia);
  }

  function sumarMeses(fecha, cantidad) {
    var mesIndex = fecha.getMonth() + cantidad;
    var ultimo = new Date(fecha.getFullYear(), mesIndex + 1, 0).getDate();
    var dia = fecha.getDate();
    if (dia > ultimo) dia = ultimo;
    return new Date(
      fecha.getFullYear(),
      mesIndex,
      dia,
      fecha.getHours(),
      fecha.getMinutes(),
      fecha.getSeconds(),
      fecha.getMilliseconds()
    );
  }

  function sumarDias(fecha, cantidad) {
    return new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate() + cantidad,
      fecha.getHours(),
      fecha.getMinutes(),
      fecha.getSeconds(),
      fecha.getMilliseconds()
    );
  }

  function diferencia(desde, hasta) {
    var vacio = { anios: 0, meses: 0, dias: 0, horas: 0, minutos: 0 };
    if (!desde || !hasta || isNaN(desde.getTime()) || isNaN(hasta.getTime())) return vacio;
    if (hasta.getTime() < desde.getTime()) return vacio;

    var anios = hasta.getFullYear() - desde.getFullYear();
    var cursor = sumarMeses(desde, anios * 12);
    if (cursor.getTime() > hasta.getTime()) {
      anios -= 1;
      cursor = anios < 0 ? desde : sumarMeses(desde, anios * 12);
      if (anios < 0) anios = 0;
    }

    var meses = (hasta.getFullYear() - cursor.getFullYear()) * 12 + (hasta.getMonth() - cursor.getMonth());
    if (meses < 0) meses = 0;
    var ancla = sumarMeses(cursor, meses);
    if (ancla.getTime() > hasta.getTime()) {
      meses -= 1;
      ancla = meses < 0 ? cursor : sumarMeses(cursor, meses);
      if (meses < 0) meses = 0;
    }

    var dias = 0;
    while (dias < 32) {
      var siguiente = sumarDias(ancla, 1);
      if (siguiente.getTime() > hasta.getTime()) break;
      dias += 1;
      ancla = siguiente;
    }

    var horas = hasta.getHours() - ancla.getHours();
    var minutos = hasta.getMinutes() - ancla.getMinutes();
    if (minutos < 0) {
      horas -= 1;
      minutos += 60;
    }
    if (horas < 0) horas += 24;

    return { anios: anios, meses: meses, dias: dias, horas: horas, minutos: minutos };
  }

  function etiqueta(cantidad, singular, plural) {
    if (cantidad === 1) return "1 " + singular;
    return cantidad + " " + plural;
  }

  function formatearAntiguedad(desde, hasta) {
    var diff = diferencia(desde, hasta);
    var partes = [];
    if (diff.anios > 0) partes.push(etiqueta(diff.anios, "año", "años"));
    if (diff.meses > 0) partes.push(etiqueta(diff.meses, "mes", "meses"));
    if (diff.dias > 0) partes.push(etiqueta(diff.dias, "día", "días"));
    if (diff.horas > 0) partes.push(etiqueta(diff.horas, "hora", "horas"));
    partes.push(etiqueta(diff.minutos, "minuto", "minutos"));
    if (partes.length === 1) return partes[0];
    return partes.slice(0, -1).join(", ") + " y " + partes[partes.length - 1];
  }

  function parteVisible(el, umbral) {
    var rect = el.getBoundingClientRect();
    var alto = rect.bottom - rect.top;
    if (alto <= 0) return false;
    var visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
    return visible / alto >= umbral;
  }

  function iniciar() {
    var nodo = document.getElementById("antiguedad");
    var desde = nodo ? parseFechaLocal(nodo.getAttribute("data-desde") || "") : new Date(NaN);
    var motion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    var reduce = motion ? motion.matches : false;
    var reloj = null;

    function pintarAntiguedad() {
      if (!nodo || isNaN(desde.getTime())) return;
      nodo.textContent = formatearAntiguedad(desde, new Date());
    }

    function frenarReloj() {
      if (!reloj) return;
      window.clearInterval(reloj);
      reloj = null;
    }

    function arrancarReloj() {
      if (reloj) return;
      if (motion && motion.matches) return;
      if (typeof document.hidden === "boolean" && document.hidden) return;
      reloj = window.setInterval(pintarAntiguedad, INTERVALO_RELOJ_MS);
    }

    if (nodo && !isNaN(desde.getTime())) {
      pintarAntiguedad();
      arrancarReloj();
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          frenarReloj();
          return;
        }
        pintarAntiguedad();
        arrancarReloj();
      });
    }

    var linea = document.getElementById("linea-comentario");
    var textoLinea = linea ? String(linea.textContent || "").replace(/^\s+|\s+$/g, "") : "";
    var escritura = null;

    function completarLinea() {
      if (escritura) {
        window.clearInterval(escritura);
        escritura = null;
      }
      if (linea && textoLinea) linea.textContent = textoLinea;
    }

    function arrancarEscritura() {
      if (!linea || !textoLinea || reduce || escritura) return;
      var i = 0;
      linea.textContent = "";
      escritura = window.setInterval(function () {
        i += 1;
        linea.textContent = textoLinea.slice(0, i);
        if (i >= textoLinea.length) {
          window.clearInterval(escritura);
          escritura = null;
        }
      }, 42);
    }

    if (motion && motion.addEventListener) {
      motion.addEventListener("change", function (ev) {
        reduce = ev.matches;
        if (reduce) {
          frenarReloj();
          completarLinea();
          document.documentElement.classList.remove("js");
          return;
        }
        pintarAntiguedad();
        arrancarReloj();
      });
    }

    if (reduce || !("IntersectionObserver" in window)) return;

    var secciones = document.querySelectorAll(".reveal");
    var i;
    for (i = 0; i < secciones.length; i++) {
      if (parteVisible(secciones[i], 0.12)) secciones[i].classList.add("visible");
    }
    document.documentElement.classList.add("js");

    var obs = new IntersectionObserver(function (entries) {
      var e;
      for (e = 0; e < entries.length; e++) {
        if (!entries[e].isIntersecting) continue;
        entries[e].target.classList.add("visible");
        obs.unobserve(entries[e].target);
      }
    }, { threshold: 0.12 });

    for (i = 0; i < secciones.length; i++) {
      if (!secciones[i].classList.contains("visible")) obs.observe(secciones[i]);
    }

    if (!linea || !textoLinea) return;
    if (parteVisible(linea, 0.6)) {
      arrancarEscritura();
      return;
    }

    var obsLinea = new IntersectionObserver(function (entries) {
      if (entries[0] && entries[0].isIntersecting) {
        arrancarEscritura();
        obsLinea.disconnect();
      }
    }, { threshold: 0.6 });
    obsLinea.observe(linea);
  }

  if (typeof document !== "undefined") iniciar();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      parseFechaLocal: parseFechaLocal,
      diferencia: diferencia,
      formatearAntiguedad: formatearAntiguedad
    };
  }
})();
