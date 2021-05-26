/* global tema2018 */

var pote = pote || {};
pote.ui = pote.ui || {};

pote.ui.planes = (function () {
    function init(planesAMostrar, idWebcontent, urlGetPlanes) {
        obtenerPlanes(planesAMostrar, idWebcontent, urlGetPlanes);
        $(".pnt-js-" + idWebcontent).on("click", ".pnt-js-boton-codificada", function (event) {
            var codificadaInfo = $(this).data("codificada-info");
            $(".pnt-js-modal-codificada-" + idWebcontent + " .pnt-js-codificada-info").html(decodeURI(codificadaInfo));
            $(".pnt-js-modal-codificada-" + idWebcontent).modal();
            $(".pnt-js-modal-codificada-" + idWebcontent).modal("open");
        });

        $(".pnt-js-" + idWebcontent).on("click", ".pnt-js-boton-beneficio", function (event) {
            var beneficioInfo = $(this).data("beneficio-info");
            $(".pnt-js-modal-beneficio-" + idWebcontent + " .pnt-js-beneficio-info").html(decodeURI(beneficioInfo));
            $(".pnt-js-modal-beneficio-" + idWebcontent).modal();
            $(".pnt-js-modal-beneficio-" + idWebcontent).modal("open");
        });
    }

    function obtenerPlanes(planesAMostrar, idWebcontent, urlGetPlanes) {
        var requestPlanes = function () {
            var requests = [];
            planesAMostrar.forEach(function (planAMostrar) {
                if (planAMostrar.codigo) {
                    var uriPlan = urlGetPlanes + planAMostrar.codigo;
                    requests.push($.get(uriPlan, function (data) {
                        completarPlan(data, planAMostrar);
                    }).then(function () {}, function () {
                        console.log("No se encontr\u00F3 el plan con c\u00F3digo: " + planAMostrar.codigo);
                        // Se devuelve una nueva promise resuelta para que el $.when.apply no termine prematuramente.
                        return $.Deferred().resolve();
                    }));
                } else {
                    completarPlanManual(planAMostrar);
                }
            });
            return requests;
        };

        $.when.apply($, requestPlanes()).always(function () {
            renderizarPlanes(planesAMostrar, idWebcontent);
        });
    }

    function completarPlanManual(planAMostrar) {
        if (!planAMostrar.precio.sinImpuesto) {
            planAMostrar.precio.sinImpuesto = calcularPrecioSinImpuestoDesdeMultiplicador(planAMostrar);
        }
    }

    function completarPlan(plan, planAMostrar) {
        planAMostrar.esPlanMovil = esPlanMovil(plan);
        completarPrecio(planAMostrar, plan);
        planAMostrar.excedentes = completarExcedentes(plan);
        planAMostrar.infos.forEach(function (info) {
            info.valorInfo = plan.atributos[info.keyInfo];
        });
    }

    function completarPrecio(planAMostrar, plan) {
        if (esPlanMovil(plan)) {
            if (!planAMostrar.precio.conImpuesto) {
                planAMostrar.precio.conImpuesto = plan.atributos["Precio del plan"].replace("$", "");
            }
            if (!planAMostrar.precio.sinImpuesto) {
                planAMostrar.precio.sinImpuesto = calcularPrecioSinImpuestoDesdeMultiplicador(planAMostrar);
            }
        } else {
            planAMostrar.precio = plan.atributos["Cu\u00e1nto cuesta?"];
        }
    }

    function calcularPrecioSinImpuestoDesdeMultiplicador(planAMostrar) {
        var precioConImpuesto = planAMostrar.precio.conImpuesto;
        var multiplicadorImpuesto = planAMostrar.precio.multiplicadorImpuesto.replace(",", ".");
        var precioSinRedondeo = precioConImpuesto / multiplicadorImpuesto;
        var precioConRedondeo = Math.round(precioSinRedondeo * 100) / 100;
        return precioConRedondeo.toString().replace(".", ",");
    }

    function completarExcedentes(plan) {
        var excedentes;
        if (esPlanMovil(plan)) {
            excedentes = {
                primeros30Segundos: plan.atributos["F37_1ROS_30_SEG"],
                segundoExcedente: plan.atributos["F39_SEG_EXCEDENTE"],
                smsExcedente: plan.atributos["F42_SMS_EXCEDENTE"]
            };
        }
        return excedentes;
    }

    function esPlanMovil(plan) {
        return !!plan.atributos["Precio del plan"];
    }

    function renderizarPlanes(planes, idWebcontent) {
        planes.forEach(function (plan) {
            plan.descripcionPlan = decodeURI(plan.descripcionPlan);
        });
        $(".pnt-js-" + idWebcontent + ".pnt-js-plan-list").append($("#plan-template").render(planes));

        tema2018.utils.carousel.activarSlider(".pnt-js-" + idWebcontent + ".pnt-js-slider");
        tema2018.utils.accordion.activarAccordion(".pnt-js-" + idWebcontent + ".pnt-js-accordion");

        $(".tabs .tab a").on("click", function () {
            setTimeout(function () {
                $(".pnt-js-" + idWebcontent + ".pnt-js-accordion").slick("setPosition");
            }, 1);
        });
    }

    return {
        init: init
    };
})();
