import Tipo, {TipoDato} from "./Tipo";
import Simbolo from "./Simbolo"

export default class TablaSimbolos {
    private tablaAnterior: TablaSimbolos | any
    private tablaActual: Map<string, Simbolo>
    private nombre: string

    constructor(anterior?: TablaSimbolos) {
        this.tablaAnterior = anterior
        this.tablaActual = new Map<string, Simbolo>()
        this.nombre = ""
    }

    public getAnterior(): TablaSimbolos {
        return this.tablaAnterior
    }

    public setAnterior(anterior: TablaSimbolos): void {
        this.tablaAnterior = anterior
    }

    public getTabla(): Map<string, Simbolo> {
        return this.tablaActual
    }

    public setTabla(tabla: Map<string, Simbolo>) {
        this.tablaActual = tabla
    }

    public getVariable(id: string) {
        return ""
    }

    public setVariable(simbolo: Simbolo) {

    }

    public getNombre(): string {
        return this.nombre
    }

    public setNombre(nombre: string): void {
        this.nombre = nombre
    }
}