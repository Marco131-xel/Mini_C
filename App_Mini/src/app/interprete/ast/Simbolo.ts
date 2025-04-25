import Tipo from "./Tipo";

export default class Simbolo {
    private tipo: Tipo
    private id: string
    private valor: any | undefined
    private linea: number
    private columna: number

    constructor(tipo: Tipo, id: string, valor: any, linea: number, columna: number) {
        this.tipo = tipo
        this.id = id.toLowerCase()
        this.valor = valor
        this.linea = linea
        this.columna = columna
    }

    public getTipo(): Tipo {
        return this.tipo
    }

    public setTipo(tipo: Tipo) {
        this.tipo = tipo
    }

    public getId(): string {
        return this.id
    }

    public setId(id: string) {
        this.id = id
    }

    public getValor(): any {
        return this.valor
    }

    public setValor(valor: any) {
        this.valor = valor
    }

    public getLinea(): number {
        return this.linea
    }

    public getColumna(): number {
        return this.columna
    }
}
