import {Instruccion} from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo, {TipoDato} from "../ast/Tipo"
import Errores from "../excepciones/Errores"
import Contador from "../ast/Contador"

export default class Aritmeticas extends Instruccion {

    private operando1: Instruccion | undefined
    private operando2: Instruccion | undefined
    private operacion: Operadores
    private operandoUnico: Instruccion | undefined

    constructor(operador: Operadores, fila: number, columna: number, op1: Instruccion, op2?: Instruccion) {
        super(new Tipo(TipoDato.INT), fila, columna)
        this.operacion = operador
        if (!op2) {
            this.operandoUnico = op1
        } else {
            this.operando1 = op1
            this.operando2 = op2
        }
    }

    
    interpretar(arbol: Arbol, tabla: TablaSimbolos) {
        throw new Error("Method not implemented.")
    }
    getAst(anterior: string): string {
        return ""
    }
    
}

export enum Operadores {
    SUMA,
    RESTA,
    MULTIPLICACION,
    DIVISION,
    POTENCIA,
    NEGACION
}