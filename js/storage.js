const KEYS = {

    PRODUCTOS: "sigmafood_productos",

    INSUMOS: "sigmafood_insumos",

    VENTAS: "sigmafood_ventas"

};



// =====================================================
// INICIALIZACIÓN
// =====================================================

export async function initStorage() {

    await initProductos();

    await initInsumos();

    await initVentas();

}

async function initProductos() {

    if (localStorage.getItem(KEYS.PRODUCTOS))
        return;

    const productos =
        await fetch("data/productos.json")
            .then(r => r.json());

    saveCollection(
        KEYS.PRODUCTOS,
        productos
    );

}

async function initInsumos() {

    if (localStorage.getItem(KEYS.INSUMOS))
        return;

    const insumos =
        await fetch("data/insumos.json")
            .then(r => r.json());

    saveCollection(
        KEYS.INSUMOS,
        insumos
    );

}

async function initVentas() {

    if (localStorage.getItem(KEYS.VENTAS))
        return;

    const ventas =
        await fetch("data/ventas.json")
            .then(r => r.json());

    saveCollection(
        KEYS.VENTAS,
        ventas
    );

}



// =====================================================
// HELPERS
// =====================================================

function getCollection(key) {

    return JSON.parse(
        localStorage.getItem(key)
    ) || [];

}

function saveCollection(key, data) {

    localStorage.setItem(
        key,
        JSON.stringify(data)
    );

}

function nextId(collection) {

    if (collection.length === 0)
        return 1;

    return Math.max(
        ...collection.map(item => item.id)
    ) + 1;

}



// =====================================================
// PRODUCTOS
// =====================================================

export function getProductos() {

    return getCollection(
        KEYS.PRODUCTOS
    );

}

export function getProducto(id) {

    return getProductos()
        .find(
            p => p.id === Number(id)
        );

}

export function addProducto(producto) {

    const productos =
        getProductos();

    producto.id =
        nextId(productos);

    producto.activo = true;

    productos.push(producto);

    saveCollection(
        KEYS.PRODUCTOS,
        productos
    );

    return producto;

}

export function updateProducto(id, data) {

    const productos =
        getProductos();

    const index =
        productos.findIndex(
            p => p.id === Number(id)
        );

    if (index === -1)
        return false;

    productos[index] = {

        ...productos[index],

        ...data

    };

    saveCollection(
        KEYS.PRODUCTOS,
        productos
    );

    return true;

}

/*
Eliminación lógica
*/

export function deleteProducto(id) {

    const productos =
        getProductos();

    const producto =
        productos.find(
            p => p.id === Number(id)
        );

    if (!producto)
        return false;

    producto.activo = false;

    saveCollection(
        KEYS.PRODUCTOS,
        productos
    );

    return true;

}



// =====================================================
// INSUMOS
// =====================================================

export function getInsumos() {

    return getCollection(
        KEYS.INSUMOS
    );

}

export function getInsumo(id) {

    return getInsumos()
        .find(
            i => i.id === Number(id)
        );

}

export function addInsumo(insumo) {

    const insumos =
        getInsumos();

    insumo.id =
        nextId(insumos);

    insumos.push(insumo);

    saveCollection(
        KEYS.INSUMOS,
        insumos
    );

    return insumo;

}

export function updateInsumo(id, data) {

    const insumos =
        getInsumos();

    const index =
        insumos.findIndex(
            i => i.id === Number(id)
        );

    if (index === -1)
        return false;

    insumos[index] = {

        ...insumos[index],

        ...data

    };

    saveCollection(
        KEYS.INSUMOS,
        insumos
    );

    return true;

}

export function deleteInsumo(id) {

    const productos =
        getProductos();

    const usado =
        productos.some(producto =>
            producto.ingredientes.some(
                ingrediente =>
                    ingrediente.insumoId === Number(id)
            )
        );

    if (usado) {

        return {

            success: false,

            message:
                "El insumo está siendo utilizado por uno o más productos."

        };

    }

    const insumos =
        getInsumos()
            .filter(
                i => i.id !== Number(id)
            );

    saveCollection(
        KEYS.INSUMOS,
        insumos
    );

    return {

        success: true

    };

}



// =====================================================
// VENTAS
// =====================================================

export function getVentas() {

    return getCollection(
        KEYS.VENTAS
    );

}

export function getVenta(id) {

    return getVentas()
        .find(
            v => v.id === Number(id)
        );

}

export function addVenta(venta) {

    const ventas =
        getVentas();

    venta.id =
        nextId(ventas);

    ventas.push(venta);

    saveCollection(
        KEYS.VENTAS,
        ventas
    );

    return venta;

}

export function updateVenta(id, data) {

    const ventas =
        getVentas();

    const index =
        ventas.findIndex(
            v => v.id === Number(id)
        );

    if (index === -1)
        return false;

    ventas[index] = {

        ...ventas[index],

        ...data

    };

    saveCollection(
        KEYS.VENTAS,
        ventas
    );

    return true;

}

export function deleteVenta(id) {

    const ventas =
        getVentas()
            .filter(
                v => v.id !== Number(id)
            );

    saveCollection(
        KEYS.VENTAS,
        ventas
    );

    return true;

}



// =====================================================
// UTILIDADES
// =====================================================

export function resetStorage() {

    localStorage.removeItem(
        KEYS.PRODUCTOS
    );

    localStorage.removeItem(
        KEYS.INSUMOS
    );

    localStorage.removeItem(
        KEYS.VENTAS
    );

}

export async function reloadStorage() {

    resetStorage();

    await initStorage();

}

export function getStats() {

    return {

        productos:
            getProductos().length,

        insumos:
            getInsumos().length,

        ventas:
            getVentas().length

    };

}