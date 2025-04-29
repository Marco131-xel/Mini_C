import TablaSimbolos from "./TablaSimbolos"
import {Instruccion} from "../abstracto/Instruccion"
import Errores from "../excepciones/Errores"
import {DefStruct} from "../operadores/Structs"

export default class Arbol {
    private instrucciones: Array<Instruccion>
    private consola: string
    private tablaGlobal: TablaSimbolos
    private errores: Array<Errores>
    private structs: Map<string, DefStruct> = new Map()

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

    public setErrores(errores: Array<Errores>): void {
        this.errores = errores;
    }

    public addError(error: Errores): void {
        this.errores.push(error);
    }

    public setStruct(nombre: string, def: DefStruct) {
        this.structs.set(nombre, def)
    }

    public getStruct(nombre: string): DefStruct | undefined {
        return this.structs.get(nombre)
    }
}