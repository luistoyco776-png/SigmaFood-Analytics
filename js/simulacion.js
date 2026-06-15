import {
    getVentas,
    getProductos,
    getInsumos
} from "./storage.js";

export function initSimulacion() {

    bindScenarioButtons();

}


function bindScenarioButtons() {

    document.querySelectorAll("[data-scenario]")
        .forEach(btn => {

            btn.addEventListener("click", () => {

                const percent =
                    Number(btn.dataset.scenario);

                runScenario(percent);

            });

        });

}

function runScenario(percentIncrease) {

    const baseDemand =
        getBaseDemand();

    const projected =
        simulateDemand(baseDemand, percentIncrease);

    const inventory =
        simulateInventory(projected);

    const recommendations =
        generateRecommendations(percentIncrease, projected);

    renderScenario(projected, inventory, recommendations);

}

function getBaseDemand() {

    const ventas =
        getVentas()
            .map(v => v.cantidad);

    return ventas.reduce((a, b) => a + b, 0) /
           (ventas.length || 1);

}

function simulateDemand(base, percent) {

    const multiplier =
        1 + percent / 100;

    return Math.round(base * 30 * multiplier);

}

function simulateInventory(projectedDemand) {

    const productos =
        getProductos();

    const insumos =
        getInsumos();

    const result = {};

    productos.forEach(p => {

        (p.ingredientes || []).forEach(i => {

            const insumo =
                insumos.find(x => x.id === i.insumoId);

            if (!insumo)
                return;

            const total =
                i.cantidad * projectedDemand;

            if (!result[insumo.nombre]) {
                result[insumo.nombre] = 0;
            }

            result[insumo.nombre] += total;

        });

    });

    return result;

}

function generateRecommendations(percent, demand) {

    const rec = [];

    if (percent >= 20) {
        rec.push(
            "Alta demanda proyectada: aumentar producción"
        );
    }

    if (percent >= 10 && percent < 20) {
        rec.push(
            "Crecimiento moderado: ajustar inventario progresivamente"
        );
    }

    if (percent < 10) {
        rec.push(
            "Demanda estable: mantener stock actual"
        );
    }

    const insumos = getInsumos();

    const lowStock =
        insumos.filter(i =>
            i.stockActual <= i.stockMinimo
        ).length;

    if (lowStock > 0) {
        rec.push(
            "Advertencia: riesgo de quiebre de stock en insumos críticos"
        );
    }

    return rec;

}

function renderScenario(projected, inventory, recommendations) {

    const output =
        document.getElementById("scenarioOutput");

    const steps = [

        "Analizando demanda futura...",
        "Evaluando comportamiento histórico...",
        "Calculando presión sobre inventario...",
        "Detectando riesgos operativos...",
        "Generando recomendación estratégica..."

    ];

    output.innerHTML = `

        <div class="scenario-loading">

            <div class="scenario-spinner"></div>

            <div class="scenario-message">
                ${steps[0]}
            </div>

        </div>

    `;

    let stepIndex = 0;

    const interval = setInterval(() => {

        stepIndex++;

        if (stepIndex < steps.length) {

            const message =
                output.querySelector(
                    ".scenario-message"
                );

            if (message) {

                message.textContent =
                    steps[stepIndex];

                message.style.animation = "none";

                void message.offsetWidth;

                message.style.animation =
                    "fadeText .3s ease";

            }

        }

    }, 450);

    setTimeout(() => {

        clearInterval(interval);

        const mainDecision =
            recommendations.length > 0
                ? recommendations[0]
                : "Sin cambios relevantes en el negocio";

        let riskText = "";
        let riskClass = "";

        if (projected > 1500) {

            riskText =
                "🚨 Riesgo alto de quiebre de stock";

            riskClass =
                "scenario-risk-high";

        } else if (projected > 800) {

            riskText =
                "⚠ Riesgo moderado";

            riskClass =
                "scenario-risk-medium";

        } else {

            riskText =
                "✅ Operación estable";

            riskClass =
                "scenario-risk-low";

        }

        output.innerHTML = `

            <div class="scenario-result">

                <div class="scenario-badge">

                    Simulación completada

                </div>

                <h3>Decisión del sistema</h3>

                <p>

                    <strong>

                        ${mainDecision}

                    </strong>

                </p>

                <h3>Estado del escenario</h3>

                <p class="${riskClass}">

                    ${riskText}

                </p>

                <h3>Interpretación</h3>

                <p>

                    ${
                        projected > 1000

                        ? "Se recomienda aumentar inventario antes del periodo simulado."

                        : "No se requieren cambios inmediatos."
                    }

                </p>

            </div>

        `;

    }, 2300);

}