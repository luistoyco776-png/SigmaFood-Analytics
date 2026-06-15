export class Insumo {

    constructor(
        id,
        nombre,
        unidad,
        stockActual,
        stockMinimo,
        costoUnitario
    ) {

        this.id = id;
        this.nombre = nombre;
        this.unidad = unidad;
        this.stockActual = stockActual;
        this.stockMinimo = stockMinimo;
        this.costoUnitario = costoUnitario;

    }

}