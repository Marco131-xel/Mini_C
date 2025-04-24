import {Instruccion} from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo, {TipoDato} from "../ast/Tipo"
import Contador from "../ast/Contador"

export default class Nativo extends Instruccion {

    valor: any

    constructor(tipo: Tipo, valor:any, fila: number, columna: number) {
        super(tipo, fila, columna)
        this.valor = valor
    }
    interpretar(arbol: Arbol, tabla: TablaSimbolos) {
        return this
    }
    getValor():any {
        return this.valor
    }
    getTipo():Tipo {
        return this.tipoDato
    }
    getAst(anterior: string): string {
        return ""
    }
    
    override toString(): string {
        if (this.valor instanceof Map) {
            const entries = Array.from(this.valor.entries())
                .map(([key, val]) => `${key}: ${val instanceof Nativo ? val.toString() : val}`)
                .join(", ");
            return `{ ${entries} }`;
        }
        return String(this.valor);
    }
    
}