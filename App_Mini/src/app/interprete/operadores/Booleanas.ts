import {Instruccion} from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo, {TipoDato} from "../ast/Tipo"
import Errores from "../excepciones/Errores"
import Contador from "../ast/Contador"

export default class Booleanas extends Instruccion {
    
    private log1: Instruccion | undefined
    private log2: Instruccion | undefined
    private operacion: Operadores
    private log: Instruccion | undefined

    constructor(operacion: Operadores, fila: number, columna: number, op1: Instruccion, op2?: Instruccion) { 
        super(new Tipo(TipoDato.BOOL), fila, columna)
        this.operacion = operacion
        if (!op2) {
            this.log = op1
        } else {
            this.log1 = op1
            this.log2 = op2
        }
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos) {
        let opIzq, opDer, Unico = null
        if (this.log != null) {
            Unico = this.log.interpretar(arbol, tabla)
            if (Unico instanceof Errores) return Unico
        } else {
            opIzq = this.log1?.interpretar(arbol, tabla)
            if (opIzq instanceof Errores) return opIzq
            opDer = this.log2?.interpretar(arbol, tabla)
            if (opDer instanceof Errores) return opDer
        }

        switch (this.operacion) {
            case Operadores.OR:
                return this.or(opIzq, opDer)
            case Operadores.AND:
                return this.and(opIzq, opDer)
            case Operadores.NOT:
                return this.not(Unico)
            default:
                return new Errores("SEMANTICO", "Operador Booleano Invalido", this.linea, this.columna)
        }
    }
    
    // funcion or
    or(op1: any, op2: any) {
        if (typeof op1 === "boolean" && typeof op2 === "boolean") {
             return op1 || op2
        }
        return new Errores("SEMANTICO", "Tipos incompatibles para el operador OR", this.linea, this.columna);
    }
    
    // funcion and
    and(op1: any, op2: any) {
        if (typeof op1 === "boolean" && typeof op2 === "boolean") {
            return op1 && op2
       }
       return new Errores("SEMANTICO", "Tipos incompatibles para el operador AND", this.linea, this.columna);
    }
    
    // funcion not
    not(op: any) {
        if (typeof op === "boolean") {
            return !op
        }
        return new Errores("SEMANTICO", "Tipos incompatibles para el operador NOT", this.linea, this.columna);
    }

    getAst(anterior: string): string {
        return ""
    }

}

export enum Operadores {
    OR,
    AND,
    NOT
}