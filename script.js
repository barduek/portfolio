/* Antigüedad en PagoTIC. La fecha vive en data-desde (2022-07-04).
   El texto del HTML queda como respaldo si este archivo no corre. */
(function () {
  "use strict";

  function parseFechaLocal(iso) {
    var partes = String(iso || "").replace(/^\s+|\s+$/g, "").split("-");
    if (partes.length !== 3) return new Date(NaN);
    var anio = parseInt(partes[0], 10);
    var mes = parseInt(partes[1], 10);
    var dia = parseInt(partes[2], 10);
    if (!anio || !mes || !dia) return new Date(NaN);
    return new Date(anio, mes - 1, dia);
  }

  function formatearAntiguedad(desde, hasta) {
    var anios = hasta.getFullYear() - desde.getFullYear();
    var meses = hasta.getMonth() - desde.getMonth();

    if (hasta.getDate() < desde.getDate()) meses -= 1;
    if (meses < 0) {
      anios -= 1;
      meses += 12;
    }
    if (anios < 0) return "menos de un mes";

    var partes = [];
    if (anios === 1) partes.push("1 año");
    else if (anios > 1) partes.push(anios + " años");
    if (meses === 1) partes.push("1 mes");
    else if (meses > 1) partes.push(meses + " meses");
    if (!partes.length) return "menos de un mes";
    return partes.join(" y ");
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
    if (nodo) {
      var desde = parseFechaLocal(nodo.getAttribute("data-desde") || "");
      if (!isNaN(desde.getTime())) {
        nodo.textContent = formatearAntiguedad(desde, new Date());
      }
    }

    var motion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    var reduce = motion ? motion.matches : false;
    var linea = document.getElementById("linea-comentario");
    var textoLinea = linea ? String(linea.textContent || "").replace(/^\s+|\s+$/g, "") : "";
    var timer = null;

    function completarLinea() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      if (linea && textoLinea) linea.textContent = textoLinea;
    }

    function arrancarEscritura() {
      if (!linea || !textoLinea || reduce || timer) return;
      var i = 0;
      linea.textContent = "";
      timer = window.setInterval(function () {
        i += 1;
        linea.textContent = textoLinea.slice(0, i);
        if (i >= textoLinea.length) {
          window.clearInterval(timer);
          timer = null;
        }
      }, 42);
    }

    if (motion && motion.addEventListener) {
      motion.addEventListener("change", function (ev) {
        if (ev.matches) {
          reduce = true;
          completarLinea();
          document.documentElement.classList.remove("js");
        }
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
      formatearAntiguedad: formatearAntiguedad
    };
  }
})();
