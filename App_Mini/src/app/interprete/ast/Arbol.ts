import TablaSimbolos from "./TablaSimbolos"
import {Instruccion} from "../abstracto/Instruccion"
import Errores from "../excepciones/Errores"

export default class Arbol {
    private instrucciones: Array<Instruccion>
    private consola: string
    private tablaGlobal: TablaSimbolos
    private errores: Array<Errores>

    constructor(instrucciones: Array<Instruccion>) {
        this.instrucciones = instrucciones
        this.consola = ""
        this.tablaGlobal = new TablaSimbolos()
        this.errores = new Array<Errores>
    }

    public Print(contenido: any) {
        this.consola = `${this.consola}${contenido}\n`
    }

    public getConsola(): string {
        return this.consola
    }

    public setConsola(console: string): void {
        this.consola = console
    }

    public getInstrucciones(): Array<Instruccion> {
        return this.instrucciones
    }

    public setInstrucciones(instrucciones: Array<Instruccion>): void {
        this.instrucciones = instrucciones
    }

    public getTablaGlobal(): TablaSimbolos {
        return this.tablaGlobal
    }

    public setTablaGlobal(tabla: TablaSimbolos) {
        this.tablaGlobal = tabla
    }

    public getErrores(): any {
        return this.errores
    }
}