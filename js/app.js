import { initOperaciones }
from "./crud.js";
import { initDashboard } from "./dashboard.js";
import { initProyecciones } from "./proyecciones.js";
import { initSimulacion } from "./simulacion.js";

const content =
    document.getElementById("content");

let currentPage = null;

document.addEventListener(
    "click",
    handleNavigation
);

async function handleNavigation(e) {

    const button =
        e.target.closest(
            "[data-page]"
        );

    if (!button) return;

    const page =
        button.dataset.page;

    await loadPage(page);

}

async function loadPage(page) {

    if (page === currentPage)
        return;

    try {

        const response =
            await fetch(
                `pages/${page}.html`
            );

        if (!response.ok) {

            throw new Error(
                `No se pudo cargar ${page}.html`
            );

        }

        const html =
            await response.text();

        content.innerHTML = html;

        currentPage = page;

        await initializePage(page);

    }

    catch (error) {

        console.error(error);

        content.innerHTML = `
            <section class="error-page">

                <h2>Error</h2>

                <p>
                    No se pudo cargar la página.
                </p>

            </section>
        `;

    }

}

async function initializePage(page) {

    switch (page) {

        case "operaciones":

            await initOperaciones();

            break;

        case "dashboard":

            await initDashboard();

            break;

        case "proyecciones":

            await initProyecciones();

            break;

        case "simulacion":

            await initSimulacion();

            break;

    }

}

loadPage("dashboard");