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
        let opIzq, opDer , Unico = null
        if (this.operandoUnico != null) {
            Unico = this.operandoUnico.interpretar(arbol, tabla);
            if (Unico instanceof Errores) return Unico;
        } else {
            opIzq = this.operando1?.interpretar(arbol, tabla);
            if (opIzq instanceof Errores) return opIzq
            opDer = this.operando2?.interpretar(arbol, tabla);
            if (opDer instanceof Errores) return opDer
        }
        
        switch (this.operacion) {
            case Operadores.SUMA:
                return this.suma(opIzq, opDer);
            case Operadores.RESTA:
                return this.resta(opIzq, opDer);
            case Operadores.NEGACION:
                return this.negacion(Unico)
            case Operadores.MULTIPLICACION:
                return this.multiplicacion(opIzq, opDer);
            case Operadores.DIVISION:
                return this.division(opIzq, opDer);
            case Operadores.POTENCIA:
                return this.potencia(opIzq, opDer);
            default:
                return new Errores("SEMANTICO", "Operador Aritmetico Invalido", this.linea, this.columna)
        }
    }
    
    // Funcion para la suma
    suma(op1: any, op2: any) {
        let tipo1 = this.operando1?.tipoDato.getTipo()
        let tipo2 = this.operando2?.tipoDato.getTipo()

        switch (tipo1) {
            case TipoDato.INT:
                switch (tipo2) {
                    case TipoDato.INT:
                        this.tipoDato = new Tipo(TipoDato.INT)
                        return parseInt(op1) + parseInt(op2)
                    case TipoDato.FLOAT:
                        this.tipoDato = new Tipo(TipoDato.FLOAT)
                        return parseFloat(op1) + parseFloat(op2)
                    default:
                        return new Errores("SEMANTICO", "Suma Invalida", this.linea, this.columna)
                }
            case TipoDato.FLOAT:
                switch (tipo2) {
                    case TipoDato.INT:
                        this.tipoDato = new Tipo(TipoDato.FLOAT)
                        return parseFloat(op1) + parseFloat(op2)
                    case TipoDato.FLOAT:
                        this.tipoDato = new Tipo(TipoDato.FLOAT)
                        return parseFloat(op1) + parseFloat(op2)
                    default:
                        return new Errores("SEMANTICO", "Suma Invalida", this.linea, this.columna)
                }
            default:
                return new Errores("SEMANTICO", "Suma Invalida", this.linea, this.columna)
        }
    }
    
    // Funcion para la resta
    resta(op1: any, op2: any) {
        let tipo1 = this.operando1?.tipoDato.getTipo()
        let tipo2 = this.operando2?.tipoDato.getTipo()

        switch (tipo1) {
            case TipoDato.INT:
                switch (tipo2) {
                    case TipoDato.INT:
                        this.tipoDato = new Tipo(TipoDato.INT)
                        return parseInt(op1) - parseInt(op2)
                    case TipoDato.FLOAT:
                        this.tipoDato = new Tipo(TipoDato.FLOAT)
                        return parseFloat(op1) - parseFloat(op2)
                    default:
                        return new Errores("SEMANTICO", "Resta Invalida", this.linea, this.columna)
                }
            case TipoDato.FLOAT:
                switch (tipo2) {
                    case TipoDato.INT:
                        this.tipoDato = new Tipo(TipoDato.FLOAT)
                        return parseFloat(op1) - parseFloat(op2)
                    case TipoDato.FLOAT:
                        this.tipoDato = new Tipo(TipoDato.FLOAT)
                        return parseFloat(op1) - parseFloat(op2)
                    default:
                        return new Errores("SEMANTICO", "Resta Invalida", this.linea, this.columna)
                }
            default:
                return new Errores("SEMANTICO", "Resta Invalida", this.linea, this.columna)
        }
    }
    
    // Funcion para la multiplicacion
    multiplicacion(op1: any, op2: any) {
        let tipo1 = this.operando1?.tipoDato.getTipo()
        let tipo2 = this.operando2?.tipoDato.getTipo()

        switch (tipo1) {
            case TipoDato.INT:
                switch (tipo2) {
                    case TipoDato.INT:
                        this.tipoDato = new Tipo(TipoDato.INT)
                        return parseInt(op1) * parseInt(op2)
                    case TipoDato.FLOAT:
                        this.tipoDato = new Tipo(TipoDato.FLOAT)
                        return parseFloat(op1) * parseFloat(op2)
                    default:
                        return new Errores("SEMANTICO", "Multiplicacion Invalida", this.linea, this.columna)
                }
            case TipoDato.FLOAT:
                switch (tipo2) {
                    case TipoDato.INT:
                        this.tipoDato = new Tipo(TipoDato.FLOAT)
                        return parseFloat(op1) * parseFloat(op2)
                    case TipoDato.FLOAT:
                        this.tipoDato = new Tipo(TipoDato.FLOAT)
                        return parseFloat(op1) * parseFloat(op2)
                    default:
                        return new Errores("SEMANTICO", "Multiplicacion Invalida", this.linea, this.columna)
                }
            default:
                return new Errores("SEMANTICO", "Multiplicacion Invalida", this.linea, this.columna)
        }
    }

    // Funcion para la division
    division(op1: any, op2: any) {
        let tipo1 = this.operando1?.tipoDato.getTipo()
        let tipo2 = this.operando2?.tipoDato.getTipo()

        if ((tipo2 == TipoDato.INT && op2 === 0 ) || (tipo2 === TipoDato.FLOAT && op2 === 0.0)){
            return new Errores("SEMANTICO", "Division por cero no permitido", this.linea, this.columna)
        }

        switch (tipo1) {
            case TipoDato.INT:
                switch (tipo2) {
                    case TipoDato.INT:
                        this.tipoDato = new Tipo(TipoDato.INT)
                        return parseInt(op1) / parseInt(op2)
                    case TipoDato.FLOAT:
                        this.tipoDato = new Tipo(TipoDato.FLOAT)
                        return parseFloat(op1) / parseFloat(op2)
                    default:
                        return new Errores("SEMANTICO", "Division Invalida", this.linea, this.columna)
                }
            case TipoDato.FLOAT:
                switch (tipo2) {
                    case TipoDato.INT:
                        this.tipoDato = new Tipo(TipoDato.FLOAT)
                        return parseFloat(op1) / parseFloat(op2)
                    case TipoDato.FLOAT:
                        this.tipoDato = new Tipo(TipoDato.FLOAT)
                        return parseFloat(op1) / parseFloat(op2)
                    default:
                        return new Errores("SEMANTICO", "Division Invalida", this.linea, this.columna)
                }
            default:
                return new Errores("SEMANTICO", "Division Invalida", this.linea, this.columna)
        }
    }

    // Funcion para la potencia 
    potencia(op1: any, op2: any) {
        let tipo1 = this.operando1?.tipoDato.getTipo()
        let tipo2 = this.operando2?.tipoDato.getTipo()

        switch (tipo1) {
            case TipoDato.INT:
                switch (tipo2) {
                    case TipoDato.INT:
                        this.tipoDato = new Tipo(TipoDato.INT)
                        return Math.pow(parseInt(op1), parseInt(op2))
                    case TipoDato.FLOAT:
                        this.tipoDato = new Tipo(TipoDato.FLOAT)
                        return Math.pow(parseFloat(op1), parseFloat(op2))
                    default:
                        return new Errores("SEMANTICO", "Potencia Invalida", this.linea, this.columna)
                }
            case TipoDato.FLOAT:
                switch (tipo2) {
                    case TipoDato.INT:
                        this.tipoDato = new Tipo(TipoDato.FLOAT)
                        return Math.pow(parseFloat(op1), parseFloat(op2))
                    case TipoDato.FLOAT:
                        this.tipoDato = new Tipo(TipoDato.FLOAT)
                        return Math.pow(parseFloat(op1), parseFloat(op2))
                    default:
                        return new Errores("SEMANTICO", "Potencia Invalida", this.linea, this.columna)
                }
            default:
                return new Errores("SEMANTICO", "Potencia Invalida", this.linea, this.columna)
        }
    }

    // Funcion para la negacion
    negacion(op1: any) {
        let opU = this.operandoUnico?.tipoDato.getTipo()
        switch (opU) {
            case TipoDato.INT:
                this.tipoDato = new Tipo(TipoDato.INT)
                return parseInt(op1) * -1
            case TipoDato.FLOAT:
                this.tipoDato = new Tipo(TipoDato.FLOAT)
                return parseFloat(op1) * -1
            default:
                return new Errores("SEMANTICO", "Negacion Unaria Invalida", this.linea, this.columna)
        }
    }
    
    // Crear el AST
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