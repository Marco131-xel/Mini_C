import {Instruccion} from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo, {TipoDato} from "../ast/Tipo"
import Errores from "../excepciones/Errores"
import Contador from "../ast/Contador"

export default class Relacionales extends Instruccion {

    private cond1: Instruccion | undefined
    private cond2: Instruccion | undefined
    private operacion: Operadores

    constructor(operador: Operadores, fila: number, columna: number, op1: Instruccion, op2: Instruccion) {
        super(new Tipo(TipoDato.BOOL), fila, columna)
        this.operacion = operador
        this.cond1 = op1
        this.cond2 = op2
    }
    interpretar(arbol: Arbol, tabla: TablaSimbolos) {
        let opIzq, opDer

        opIzq = this.cond1?.interpretar(arbol, tabla)
        if (opIzq instanceof Errores) return opIzq
        opDer = this.cond2?.interpretar(arbol, tabla)
        if (opDer instanceof Errores) return opDer

        switch(this.operacion) {
            case Operadores.EQUALS:
                return this.equals(opIzq, opDer)
            case Operadores.NOTEQUALS:
                return this.notEquals(opIzq, opDer)
            case Operadores.MENORIGUAL:
                return this.menorIgual(opIzq, opDer)
            case Operadores.MAYORIGUAL:
                return this.mayorIgual(opIzq, opDer)
            case Operadores.MENORQUE:
                return this.menorQue(opIzq, opDer)
            case Operadores.MAYORQUE:
                return this.mayorQue(opIzq, opDer)
        }
    }
    
    // funcion equals
    equals(op1: any, op2: any) {
        let tipo1 = this.cond1?.tipoDato.getTipo()
        let tipo2 = this.cond2?.tipoDato.getTipo()

        switch (tipo1) {
            case TipoDato.INT:
                switch (tipo2) {
                    case TipoDato.INT:
                        return parseInt(op1) == parseInt(op2)
                    case TipoDato.FLOAT:
                        return parseFloat(op1) == parseFloat(op2)
                    default:
                        return new Errores("SEMANTICO", "EQUALS Invalido", this.linea, this.columna)
                }
            case TipoDato.FLOAT:
                switch (tipo2) {
                    case TipoDato.INT:
                        return parseFloat(op1) == parseFloat(op2)
                    case TipoDato.FLOAT:
                        return parseFloat(op1) == parseFloat(op2)
                    default:
                        return new Errores("SEMANTICO", "EQUALS Invalido", this.linea, this.columna)
                }
            case TipoDato.STRING:
                switch (tipo2) {
                    case TipoDato.STRING:
                        return op1.toString().toLowerCase() === op2.toString().toLowerCase();
                    default:
                        return new Errores("SEMANTICO", "EQUALS Invalido", this.linea, this.columna)
                }
            default:
                return new Errores("SEMANTICO", "EQUALS Erroneo", this.linea, this.columna)
        }
    }

    // funcion notequals
    notEquals(op1: any, op2: any) {
        let tipo1 = this.cond1?.tipoDato.getTipo()
        let tipo2 = this.cond2?.tipoDato.getTipo()

        switch (tipo1) {
            case TipoDato.INT:
                switch (tipo2) {
                    case TipoDato.INT:
                        return parseInt(op1) != parseInt(op2)
                    case TipoDato.FLOAT:
                        return parseFloat(op1) != parseFloat(op2)
                    default:
                        return new Errores("SEMANTICO", "NOTEQUALS Invalido", this.linea, this.columna)
                }
            case TipoDato.FLOAT:
                switch (tipo2) {
                    case TipoDato.INT:
                        return parseFloat(op1) != parseFloat(op2)
                    case TipoDato.FLOAT:
                        return parseFloat(op1) != parseFloat(op2)
                    default:
                        return new Errores("SEMANTICO", "NOTEQUALS Invalido", this.linea, this.columna)
                }
            case TipoDato.STRING:
                switch (tipo2) {
                    case TipoDato.STRING:
                        return op1.toString().toLowerCase() === op2.toString().toLowerCase();
                    default:
                        return new Errores("SEMANTICO", "NOTEQUALS Invalido", this.linea, this.columna)
                }
            default:
                return new Errores("SEMANTICO", "NOTEQUALS Erroneo", this.linea, this.columna)
        }
    }

    // funcion menorigual
    menorIgual(op1: any, op2: any) {
        let tipo1 = this.cond1?.tipoDato.getTipo()
        let tipo2 = this.cond2?.tipoDato.getTipo()

        switch (tipo1) {
            case TipoDato.INT:
                switch (tipo2) {
                    case TipoDato.INT:
                        return parseInt(op1) <= parseInt(op2)
                    case TipoDato.FLOAT:
                        return parseFloat(op1) <= parseFloat(op2)
                    default:
                        return new Errores("SEMANTICO", "MENOR IGUAL Invalido", this.linea, this.columna)
                }
            case TipoDato.FLOAT:
                switch (tipo2) {
                    case TipoDato.INT:
                        return parseFloat(op1) <= parseFloat(op2)
                    case TipoDato.FLOAT:
                        return parseFloat(op1) <= parseFloat(op2)
                    default:
                        return new Errores("SEMANTICO", "MENOR IGUAL Invalido", this.linea, this.columna)
                }
            case TipoDato.STRING:
                switch (tipo2) {
                    case TipoDato.STRING:
                        return op1.toString().toLowerCase() === op2.toString().toLowerCase();
                    default:
                        return new Errores("SEMANTICO", "MENOR IGUAL Invalido", this.linea, this.columna)
                }
            default:
                return new Errores("SEMANTICO", "MENOR IGUAL Erroneo", this.linea, this.columna)
        }
    }

    // funcion mayorigual
    mayorIgual(op1: any, op2: any) {
        let tipo1 = this.cond1?.tipoDato.getTipo()
        let tipo2 = this.cond2?.tipoDato.getTipo()

        switch (tipo1) {
            case TipoDato.INT:
                switch (tipo2) {
                    case TipoDato.INT:
                        return parseInt(op1) >= parseInt(op2)
                    case TipoDato.FLOAT:
                        return parseFloat(op1) >= parseFloat(op2)
                    default:
                        return new Errores("SEMANTICO", "MAYOR IGUAL Invalido", this.linea, this.columna)
                }
            case TipoDato.FLOAT:
                switch (tipo2) {
                    case TipoDato.INT:
                        return parseFloat(op1) >= parseFloat(op2)
                    case TipoDato.FLOAT:
                        return parseFloat(op1) >= parseFloat(op2)
                    default:
                        return new Errores("SEMANTICO", "MAYOR Invalido", this.linea, this.columna)
                }
            case TipoDato.STRING:
                switch (tipo2) {
                    case TipoDato.STRING:
                        return op1.toString().toLowerCase() === op2.toString().toLowerCase();
                    default:
                        return new Errores("SEMANTICO", "MAYOR IGUAL Invalido", this.linea, this.columna)
                }
            default:
                return new Errores("SEMANTICO", "MAYOR IGUAL Erroneo", this.linea, this.columna)
        }
    }

    // funcion menorque
    menorQue(op1: any, op2: any) {
        let tipo1 = this.cond1?.tipoDato.getTipo()
        let tipo2 = this.cond2?.tipoDato.getTipo()

        switch (tipo1) {
            case TipoDato.INT:
                switch (tipo2) {
                    case TipoDato.INT:
                        return parseInt(op1) < parseInt(op2)
                    case TipoDato.FLOAT:
                        return parseFloat(op1) < parseFloat(op2)
                    default:
                        return new Errores("SEMANTICO", "MENOR Invalido", this.linea, this.columna)
                }
            case TipoDato.FLOAT:
                switch (tipo2) {
                    case TipoDato.INT:
                        return parseFloat(op1) < parseFloat(op2)
                    case TipoDato.FLOAT:
                        return parseFloat(op1) < parseFloat(op2)
                    default:
                        return new Errores("SEMANTICO", "MENOR Invalido", this.linea, this.columna)
                }
            case TipoDato.STRING:
                switch (tipo2) {
                    case TipoDato.STRING:
                        return op1.toString().toLowerCase() === op2.toString().toLowerCase();
                    default:
                        return new Errores("SEMANTICO", "MENOR Invalido", this.linea, this.columna)
                }
            default:
                return new Errores("SEMANTICO", "MENOR Erroneo", this.linea, this.columna)
        }
    }

    // funcion mayorque
    mayorQue(op1: any, op2: any) {
        let tipo1 = this.cond1?.tipoDato.getTipo()
        let tipo2 = this.cond2?.tipoDato.getTipo()

        switch (tipo1) {
            case TipoDato.INT:
                switch (tipo2) {
                    case TipoDato.INT:
                        return parseInt(op1) > parseInt(op2)
                    case TipoDato.FLOAT:
                        return parseFloat(op1) > parseFloat(op2)
                    default:
                        return new Errores("SEMANTICO", "MAYOR Invalido", this.linea, this.columna)
                }
            case TipoDato.FLOAT:
                switch (tipo2) {
                    case TipoDato.INT:
                        return parseFloat(op1) > parseFloat(op2)
                    case TipoDato.FLOAT:
                        return parseFloat(op1) > parseFloat(op2)
                    default:
                        return new Errores("SEMANTICO", "MAYOR Invalido", this.linea, this.columna)
                }
            case TipoDato.STRING:
                switch (tipo2) {
                    case TipoDato.STRING:
                        return op1.toString().toLowerCase() === op2.toString().toLowerCase();
                    default:
                        return new Errores("SEMANTICO", "MAYOR Invalido", this.linea, this.columna)
                }
            default:
                return new Errores("SEMANTICO", "MAYOR Erroneo", this.linea, this.columna)
        }
    }

    getAst(anterior: string): string {
        return ""
    }
    
}

export enum Operadores {
    EQUALS,
    NOTEQUALS,
    MENORIGUAL,
    MAYORIGUAL,
    MENORQUE,
    MAYORQUE
}