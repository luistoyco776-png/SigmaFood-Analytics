import {
    initStorage,

    getProductos,
    getInsumos,
    getVentas,

    addProducto,
    updateProducto,

    addInsumo,
    updateInsumo,

    addVenta,
    updateVenta,

    deleteProducto,
    deleteInsumo,
    deleteVenta,

    reloadStorage

} from "./storage.js";

let currentEntity = "productos";

let selectedId = null;

let currentMode = null;

let editingId = null;



// =====================================================
// INIT
// =====================================================

export async function initOperaciones() {

    await initStorage();

    bindTabs();

    bindToolbar();

    renderTable();

    document
        .getElementById("crudForm")
        ?.addEventListener(
            "submit",
            handleSave
        );
}

function bindTabs() {

    document
        .querySelectorAll(".tab")
        .forEach(tab => {

            tab.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(".tab")
                        .forEach(t =>
                            t.classList.remove("active")
                        );

                    tab.classList.add("active");

                    currentEntity =
                        tab.dataset.entity;

                    const panel =
                        document.getElementById("crudPanel");

                    if (
                        !panel.classList.contains("hidden")
                    ) {

                        document
                            .getElementById("panelTitle")
                            .textContent =
                            currentMode === "edit"
                                ? `Editar ${currentEntity}`
                                : `Nuevo ${currentEntity}`;

                        generateForm();

                    }

                    selectedId = null;

                    renderTable();

                }
            );

        });

}

function bindToolbar() {

    document
        .getElementById("btnNuevo")
        ?.addEventListener(
            "click",
            handleNuevo
        );

    document
        .getElementById("btnEditar")
        ?.addEventListener(
            "click",
            handleEditar
        );

    document
        .getElementById("btnEliminar")
        ?.addEventListener(
            "click",
            handleEliminar
        );

    document
        .getElementById("btnRecargar")
        ?.addEventListener(
            "click",
            handleRecargar
        );

    document
        .getElementById("btnCerrarPanel")
        ?.addEventListener(
            "click",
            closePanel
        );
}

function generateForm() {

    const container =
        document.getElementById("formFields");

    switch (currentEntity) {

        case "productos":

            container.innerHTML = `

                <label>Nombre</label>
                <input class="inputsform"
                    id="nombre"
                    type="text"
                    required>

                <label>Categoría</label>
                <input class="inputsform"
                    id="categoria"
                    type="text"
                    required>

                <label>Precio de Venta</label>
                <input class="inputsform"
                    id="precioVenta"
                    type="number"
                    step="0.01"
                    required>

            `;

            break;

        case "insumos":

            container.innerHTML = `

                <label>Nombre</label>
                <input class="inputsform"
                    id="nombre"
                    type="text"
                    required>

                <label>Stock Actual</label>
                <input class="inputsform"
                    id="stockActual"
                    type="number"
                    required>

                <label>Unidad</label>
                <input class="inputsform"
                    id="unidad"
                    type="text"
                    required>

                <label>Costo Unitario</label>
                <input class="inputsform"
                    id="costoUnitario"
                    type="number"
                    step="0.01"
                    required>

            `;

            break;

        case "ventas":

            container.innerHTML = `

                <label>Producto ID</label>
                <input class="inputsform"
                    id="productoId"
                    type="number"
                    required>

                <label>Cantidad</label>
                <input class="inputsform"
                    id="cantidad"
                    type="number"
                    required>

                <label>Precio</label>
                <input class="inputsform"
                    id="precioUnitario"
                    type="number"
                    step="0.01"
                    required>

            `;

            break;

    }

    if (currentMode === "edit") {

        loadFormData();

    }

}

function loadFormData() {

    let item;

    switch (currentEntity) {

        case "productos":

            item = getProductos()
                .find(
                    p => p.id === editingId
                );

            if (!item)
                return;

            document.getElementById("nombre").value =
                item.nombre;

            document.getElementById("categoria").value =
                item.categoria;

            document.getElementById("precioVenta").value =
                item.precioVenta;

            break;

        case "insumos":

            item = getInsumos()
                .find(
                    i => i.id === editingId
                );

            if (!item)
                return;

            document.getElementById("nombre").value =
                item.nombre;

            document.getElementById("stockActual").value =
                item.stockActual;

            document.getElementById("unidad").value =
                item.unidad;

            document.getElementById("costoUnitario").value =
                item.costoUnitario;

            break;

        case "ventas":

            item = getVentas()
                .find(
                    v => v.id === editingId
                );

            if (!item)
                return;

            document.getElementById("productoId").value =
                item.productoId;

            document.getElementById("cantidad").value =
                item.cantidad;

            document.getElementById("precioUnitario").value =
                item.precioUnitario;

            break;

    }

}

async function handleRecargar() {

    await reloadStorage();

    selectedId = null;

    renderTable();

    alert("Datos restaurados");

}

function handleNuevo() {

    currentMode = "create";
    editingId = null;

    openPanel();

}

function handleEditar() {

    if (!selectedId) {

        alert("Seleccione un registro");
        return;

    }

    currentMode = "edit";
    editingId = selectedId;

    openPanel();

}

function handleEliminar() {

    if (!selectedId) {

        alert(
            "Seleccione un registro."
        );

        return;

    }

    const confirmado =
        confirm(
            "¿Desea eliminar el registro?"
        );

    if (!confirmado)
        return;

    switch (currentEntity) {

        case "productos":

            deleteProducto(selectedId);

            break;

        case "insumos":

            const result =
                deleteInsumo(selectedId);

            if (!result.success) {

                alert(result.message);

                return;

            }

            break;

        case "ventas":

            deleteVenta(selectedId);

            break;

    }

    selectedId = null;

    renderTable();

}

function openPanel() {

    document
        .getElementById("panelTitle")
        .textContent =
        currentMode === "edit"
            ? `Editar ${currentEntity}`
            : `Nuevo ${currentEntity}`;

    document
        .getElementById("crudPanel")
        .classList.remove("hidden");

    generateForm();

}

function closePanel() {

    document
        .getElementById("crudPanel")
        .classList.add("hidden");

}

function handleSave(e) {

    e.preventDefault();

    switch (currentEntity) {

        case "productos":

            saveProducto();

            break;

        case "insumos":

            saveInsumo();

            break;

        case "ventas":

            saveVenta();

            break;

    }

    closePanel

    renderTable();

}

function renderTable() {

    switch (currentEntity) {

        case "productos":

            renderProductos();

            break;

        case "insumos":

            renderInsumos();

            break;

        case "ventas":

            renderVentas();

            break;

    }

}

function renderProductos() {

    const productos =
        getProductos();

    renderGenericTable(

        [
            "ID",
            "Nombre",
            "Categoría",
            "Precio",
            "Estado"
        ],

        productos.map(p => [

            p.id,

            p.nombre,

            p.categoria,

            `S/ ${p.precioVenta}`,

            p.activo
                ? "Activo"
                : "Inactivo"

        ]),

        productos.map(
            p => p.id
        )

    );

}

function renderInsumos() {

    const insumos =
        getInsumos();

    renderGenericTable(

        [
            "ID",
            "Nombre",
            "Stock",
            "Unidad",
            "Costo"
        ],

        insumos.map(i => [

            i.id,

            i.nombre,

            i.stockActual,

            i.unidad,

            `S/ ${i.costoUnitario}`

        ]),

        insumos.map(
            i => i.id
        )

    );

}

function renderVentas() {

    const ventas =
        getVentas();

    renderGenericTable(

        [
            "ID",
            "Fecha",
            "Producto",
            "Cantidad",
            "Precio"
        ],

        ventas.map(v => [

            v.id,

            v.fecha,

            v.productoId,

            v.cantidad,

            `S/ ${v.precioUnitario}`

        ]),

        ventas.map(
            v => v.id
        )

    );

}

function renderGenericTable(
    headers,
    rows,
    ids
) {

    const thead =
        document.querySelector(
            "#crudTable thead"
        );

    const tbody =
        document.querySelector(
            "#crudTable tbody"
        );



    thead.innerHTML =

        `<tr>

            ${headers
            .map(
                h =>
                    `<th>${h}</th>`
            )
            .join("")
        }

        </tr>`;



    tbody.innerHTML =

        rows
            .map(
                (row, index) =>

                    `<tr
                    class="${ids[index] === selectedId
                        ? "selected"
                        : ""
                    }"
                    data-id="${ids[index]}">

                    ${row
                        .map(
                            value =>
                                `<td>${value}</td>`
                        )
                        .join("")
                    }

                </tr>`
            )
            .join("");



    bindRows();

}

function bindRows() {

    document
        .querySelectorAll(
            "#crudTable tbody tr"
        )
        .forEach(row => {

            row.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            "#crudTable tbody tr"
                        )
                        .forEach(
                            r =>
                                r.classList.remove(
                                    "selected"
                                )
                        );

                    row.classList.add(
                        "selected"
                    );

                    selectedId =
                        Number(
                            row.dataset.id
                        );
                    renderDetail();

                }
            );

        });

}

function renderDetail() {

    switch (currentEntity) {

        case "productos":
            renderProductoDetail();
            break;

        case "ventas":
            renderVentaDetail();
            break;

    }

}

function renderProductoDetail() {

    const producto =
        getProductos()
            .find(p => p.id === selectedId);

    if (!producto) return;

    const insumos =
        getInsumos();

    document.getElementById("detailTitle")
        .textContent = producto.nombre;

    const ingredientesHTML =
        (producto.ingredientes || [])
            .map(i => {

                const insumo =
                    insumos.find(x =>
                        x.id === i.insumoId
                    );

                return `
                    <div class="ingredient-item">
                        ${insumo?.nombre || "?"}
                        x${i.cantidad}
                    </div>
                `;

            })
            .join("");

    document.getElementById("detailContent")
        .innerHTML = `
            <h4>Ingredientes</h4>
            <div class="ingredient-list">
                ${ingredientesHTML}
            </div>
        `;

}

function renderVentaDetail() {

    const venta =
        getVentas()
            .find(v => v.id === selectedId);

    if (!venta) return;

    const producto =
        getProductos()
            .find(p => p.id === venta.productoId);

    document.getElementById("detailTitle")
        .textContent = `Venta #${venta.id}`;

    document.getElementById("detailContent")
        .innerHTML = `
            <h4>Producto vendido</h4>

            <div class="sale-item">
                ${producto?.nombre || "Producto eliminado"}
                x${venta.cantidad}
            </div>
        `;

}

function saveProducto() {

    const data = {

        nombre:
            document.getElementById("nombre").value,

        categoria:
            document.getElementById("categoria").value,

        precioVenta:
            Number(
                document.getElementById("precioVenta").value
            )

    };

    if (currentMode === "create") {

        addProducto(data);

    } else {

        updateProducto(
            editingId,
            data
        );

    }

}

function saveInsumo() {

    const data = {

        nombre:
            document.getElementById("nombre").value,

        stockActual:
            Number(
                document.getElementById("stockActual").value
            ),

        unidad:
            document.getElementById("unidad").value,

        costoUnitario:
            Number(
                document.getElementById("costoUnitario").value
            )

    };

    if (currentMode === "create") {

        addInsumo(data);

    } else {

        updateInsumo(
            editingId,
            data
        );

    }

}

function saveVenta() {

    const data = {

        productoId:
            Number(
                document.getElementById("productoId").value
            ),

        cantidad:
            Number(
                document.getElementById("cantidad").value
            ),

        precioUnitario:
            Number(
                document.getElementById("precioUnitario").value
            ),

        fecha:
            new Date()
                .toISOString()
                .split("T")[0]

    };

    if (currentMode === "create") {

        addVenta(data);

    } else {

        updateVenta(
            editingId,
            data
        );

    }

}

