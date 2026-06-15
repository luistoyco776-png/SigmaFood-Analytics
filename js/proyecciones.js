import {
    getVentas,
    getProductos,
    getInsumos
} from "./storage.js";

export function initProyecciones() {

    const days = 30;

    renderProjection(days);

    bindSlider();
}

function bindSlider() {

    const slider =
        document.getElementById("projectionRange");

    const label =
        document.getElementById("projectionDays");

    slider.addEventListener("input", () => {

        const days =
            Number(slider.value);

        label.textContent =
            `${days} días`;

        renderProjection(days);

    });

}

function projectDemand(days) {

    const ventas =
        getVentas()
            .map(v => v.cantidad);

    const avg =
        ventas.reduce((a, b) => a + b, 0) /
        (ventas.length || 1);

    return Math.round(avg * days);

}

function calculateInventoryImpact(projectedDemand) {

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

function renderProjection(days) {

    const demand =
        projectDemand(days);

    document.getElementById("projectedDemand")
        .textContent = demand;

    const inventory =
        calculateInventoryImpact(demand);

    renderInventory(inventory);

    document.getElementById("integralFormula").innerHTML = `
        ∫<sub>0</sub><sup>${days}</sup> D(t) dt = ${demand}
    `;

    renderProjectionDecision(days, demand, inventory);

}

function renderProjectionDecision(days, demand, inventory) {

    const container =
        document.getElementById("decisionText");

    const avgPerDay =
        demand / days;

    let message = "";

    // 1. NIVEL DE DEMANDA
    if (avgPerDay > 50) {
        message += "📈 Alta demanda proyectada en el periodo.\n";
    } else if (avgPerDay > 20) {
        message += "📊 Demanda moderada y estable.\n";
    } else {
        message += "📉 Baja demanda proyectada.\n";
    }

    // 2. INTERPRETACIÓN DEL RIESGO
    const highItems =
        Object.values(inventory)
            .filter(v => v > demand * 0.8).length;

    if (highItems > 0) {
        message += "⚠ Riesgo de sobreconsumo de insumos críticos.\n";
    } else {
        message += "✅ Inventario dentro de rangos seguros.\n";
    }

    // 3. ACCIÓN DIRECTA (LO MÁS IMPORTANTE)
    if (avgPerDay > 50 || highItems > 0) {
        message += "\n👉 Recomendación: incrementar compras de insumos.";
    } else {
        message += "\n👉 Recomendación: mantener niveles actuales de stock.";
    }

    container.innerText = message;

}

function renderInventory(inventory) {

    const container =
        document.getElementById("inventoryProjection");

    container.innerHTML =
        Object.entries(inventory)
            .map(([name, value]) => {

                return `
                    <div class="inventory-item">
                        <strong>${name}</strong>
                        <span>${value}</span>
                    </div>
                `;

            })
            .join("");

}

