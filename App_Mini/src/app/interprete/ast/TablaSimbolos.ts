import Tipo, { TipoDato } from "./Tipo";
import Simbolo from "./Simbolo";

export default class TablaSimbolos {
    private tablaAnterior: TablaSimbolos | null;
    private tablaActual: Map<string, Simbolo>;
    private nombre: string;

    constructor(anterior?: TablaSimbolos) {
        this.tablaAnterior = anterior ?? null;
        this.tablaActual = new Map<string, Simbolo>();
        this.nombre = "";
    }

    public getAnterior(): TablaSimbolos | null {
        return this.tablaAnterior;
    }

    public setAnterior(anterior: TablaSimbolos): void {
        this.tablaAnterior = anterior;
    }

    public getTabla(): Map<string, Simbolo> {
        return this.tablaActual;
    }

    public setTabla(tabla: Map<string, Simbolo>): void {
        this.tablaActual = tabla;
    }

    public getNombre(): string {
        return this.nombre;
    }

    public setNombre(nombre: string): void {
        this.nombre = nombre;
    }

    public setVariable(simbolo: Simbolo): boolean {
        const id = simbolo.getId().toLowerCase();
        if (!this.tablaActual.has(id)) {
            this.tablaActual.set(id, simbolo);
            return true;
        }
        return false;
    }

    public getVariable(id: string): Simbolo | null {
        let tabla: TablaSimbolos | null = this;
        const lowerId = id.toLowerCase();
        while (tabla !== null) {
            if (tabla.tablaActual.has(lowerId)) {
                return tabla.tablaActual.get(lowerId)!;
            }
            tabla = tabla.getAnterior();
        }
        return null;
    }
}