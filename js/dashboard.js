import {
    getVentas,
    getInsumos
} from "./storage.js";

import { initStorage } from "./storage.js";

let chartInstance = null;



// =====================================================
// INIT
// =====================================================



export async function initDashboard() {

    await initStorage();

    renderKPIs();

    renderChart();

    generateDecisionView();
}

function generateDecisionView() {

    const growth = getGrowthRate();
    const accel = getAcceleration();
    const risk = getStockRisk();

    let message = "";

    // CRECIMIENTO
    if (growth > 15) {
        message += "📈 El negocio está en crecimiento fuerte.\n";
    } else if (growth > 5) {
        message += "📊 Crecimiento estable.\n";
    } else {
        message += "⚠ Crecimiento débil o estancado.\n";
    }

    // ACELERACIÓN
    if (accel > 0) {
        message += "🚀 La demanda se está acelerando.\n";
    } else {
        message += "📉 La demanda está perdiendo impulso.\n";
    }

    // RIESGO
    if (risk === "Alto") {
        message += "🚨 Riesgo crítico de stock.\n";
    } else if (risk === "Moderado") {
        message += "⚠ Riesgo moderado de abastecimiento.\n";
    } else {
        message += "✅ Stock bajo control.\n";
    }

    // ACCIÓN FINAL (CLAVE)
    if (risk === "Alto" || growth > 15) {
        message += "\n👉 Recomendación: aumentar inventario de insumos críticos.";
    } else {
        message += "\n👉 Recomendación: mantener nivel actual de stock.";
    }

    document.getElementById("decisionText")
        .innerText = message;

}

function getTotalDemand() {

    return getVentas()
        .reduce(
            (sum, v) => sum + v.cantidad,
            0
        );

}

function getGrowthRate() {

    const ventas = getVentas();

    if (ventas.length < 2)
        return 0;

    const mid =
        Math.floor(ventas.length / 2);

    const first =
        ventas.slice(0, mid);

    const second =
        ventas.slice(mid);

    const a =
        first.reduce((s, v) => s + v.cantidad, 0);

    const b =
        second.reduce((s, v) => s + v.cantidad, 0);

    return ((b - a) / (a || 1)) * 100;

}

function getAcceleration() {

    const ventas =
        getVentas()
            .map(v => v.cantidad);

    if (ventas.length < 3)
        return 0;

    const diffs = [];

    for (let i = 1; i < ventas.length; i++) {
        diffs.push(ventas[i] - ventas[i - 1]);
    }

    const accel = [];

    for (let i = 1; i < diffs.length; i++) {
        accel.push(diffs[i] - diffs[i - 1]);
    }

    return accel.reduce((a, b) => a + b, 0) /
        (accel.length || 1);

}

function getStockRisk() {

    const insumos = getInsumos();

    const low = insumos.filter(i =>
        i.stockActual <= i.stockMinimo
    ).length;

    if (low === 0)
        return "Bajo";

    if (low < 3)
        return "Moderado";

    return "Alto";

}

function renderKPIs() {

    document.getElementById("kpiGrowth")
        .textContent =
            `${getGrowthRate().toFixed(1)}%`;

    document.getElementById("kpiDemand")
        .textContent =
            getTotalDemand();

    document.getElementById("kpiAcceleration")
        .textContent =
            getAcceleration().toFixed(2);

    document.getElementById("kpiRisk")
        .textContent =
            getStockRisk();

}

function renderChart() {

    const ctx =
        document.getElementById("dashboardChart");

    const ventas =
        getVentas();

    const labels =
        ventas.map((v, i) => `Día ${i + 1}`);

    const data =
        ventas.map(v => v.cantidad);

    if (chartInstance)
        chartInstance.destroy();

    chartInstance =
        new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Ventas",
                    data,
                    fill: false,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        });

}