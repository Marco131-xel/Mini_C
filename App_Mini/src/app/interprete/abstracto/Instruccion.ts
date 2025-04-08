import Arbol from "../ast/Arbol"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo from "../ast/Tipo"

export abstract class Instruccion {
    public tipoDato: Tipo
    public linea: number
    public columna: number

    constructor(tipo: Tipo, linea: number, columna: number) {
        this.tipoDato = tipo
        this.linea = linea
        this.columna = columna
    }

    abstract interpretar(arbol: Arbol, tabla: TablaSimbolos): any
    abstract getAst(anterior: string): string
}