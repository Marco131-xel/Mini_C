export default class Errores {
    private tipo: string
    private descripcion: string
    private fila: number
    private columna: number

    constructor(tipo: string, descripcion: string, fila: number, columna: number) {
        this.tipo = tipo
        this.descripcion = descripcion
        this.fila = fila
        this.columna = columna
    }
}