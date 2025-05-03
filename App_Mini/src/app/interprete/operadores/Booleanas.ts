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
        const contador = Contador.getInstancia();
        const nodoBooleana = `n${contador.get()}`;
        
        let resultado = `${nodoBooleana}[label="EXPRESION_BOOLEANA"];\n`;
        resultado += `${anterior} -> ${nodoBooleana};\n`;
    
        // Para operadores binarios (AND, OR)
        if (this.operacion === Operadores.AND || this.operacion === Operadores.OR) {
            const nodoOp = `n${contador.get()}`;
            const nodoExpr1 = `n${contador.get()}`;
            const nodoExpr2 = `n${contador.get()}`;
            
            resultado += `${nodoOp}[label="${this.getOperadorSimbolo()}"];\n`;
            resultado += `${nodoExpr1}[label="EXPRESION"];\n`;
            resultado += `${nodoExpr2}[label="EXPRESION"];\n`;
            
            resultado += `${nodoBooleana} -> ${nodoOp};\n`;
            resultado += `${nodoBooleana} -> ${nodoExpr1};\n`;
            resultado += `${nodoBooleana} -> ${nodoExpr2};\n`;
    
            if (this.log1) resultado += this.log1.getAst(nodoExpr1);
            if (this.log2) resultado += this.log2.getAst(nodoExpr2);
        } 
        // Para operador unario (NOT)
        else if (this.operacion === Operadores.NOT && this.log) {
            const nodoOp = `n${contador.get()}`;
            const nodoExpr = `n${contador.get()}`;
            
            resultado += `${nodoOp}[label="${this.getOperadorSimbolo()}"];\n`;
            resultado += `${nodoExpr}[label="EXPRESION"];\n`;
            
            resultado += `${nodoBooleana} -> ${nodoOp};\n`;
            resultado += `${nodoBooleana} -> ${nodoExpr};\n`;
            
            resultado += this.log.getAst(nodoExpr);
        }
    
        return resultado;
    }
    
    private getOperadorSimbolo(): string {
        switch (this.operacion) {
            case Operadores.AND: return "&&";
            case Operadores.OR: return "||";
            case Operadores.NOT: return "!";
            default: return "?";
        }
    }

}

export enum Operadores {
    OR,
    AND,
    NOT
}