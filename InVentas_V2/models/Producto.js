export class Producto {

    constructor(
        id,
        nombre,
        categoria,
        precioVenta,
        ingredientes = [],
        activo = true
    ) {

        this.id = id;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precioVenta = precioVenta;
        this.ingredientes = ingredientes;
        this.activo = activo;

    }

}