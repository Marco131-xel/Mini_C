import {Instruccion} from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo, {TipoDato} from "../ast/Tipo"
import Errores from "../excepciones/Errores"
import Contador from "../ast/Contador"
import Simbolo from "../ast/Simbolo"

export default class Asignacion extends Instruccion {
    
    private id: string
    private exp: Instruccion

    constructor(id: string, linea: number, columna: number, exp: Instruccion){
        super(new Tipo(TipoDato.VOID), linea, columna)
        this.id = id
        this.exp = exp
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos) {
        const variable = tabla.getVariable(this.id)
        if (variable == null) {
            return new Errores("SEMANTICO", "Variable "+this.id+" no existe", this.linea, this.columna);
        }

        // interpretar el nuevo valor a asignar
        const newValor = this.exp.interpretar(arbol, tabla)
        if (newValor instanceof Errores) {
            return newValor
        }

        // validar tipos
        const tipoVariable = variable.getTipo().getTipo();
        const tipoExpresion = this.exp.tipoDato.getTipo();
        
        if (tipoVariable !== tipoExpresion) {
            if (!(tipoExpresion === TipoDato.INT && tipoVariable === TipoDato.FLOAT)) {
                return new Errores(
                    "SEMANTICO",
                    `tipo ${TipoDato[tipoExpresion]} no compatible con ${TipoDato[tipoVariable]} en asignacion`,
                    this.linea,
                    this.columna
                );
            }
        }
        variable.setValor(newValor)
        return null
    }

    getAst(anterior: string): string {
        const contador = Contador.getInstancia();
        const nodoAsignacion = `n${contador.get()}`;
        const nodoId = `n${contador.get()}`;
        const nodoIgual = `n${contador.get()}`;
        const nodoExpresion = `n${contador.get()}`;
        const nodoPuntoComa = `n${contador.get()}`;
    
        let resultado = `${nodoAsignacion}[label="ASIGNACION"];\n`;
        resultado += `${nodoId}[label="${this.id}"];\n`;
        resultado += `${nodoIgual}[label="="];\n`;
        resultado += `${nodoExpresion}[label="EXPRESION"];\n`;
        resultado += `${nodoPuntoComa}[label=";"];\n`;
    
        resultado += `${anterior} -> ${nodoAsignacion};\n`;
        resultado += `${nodoAsignacion} -> ${nodoId};\n`;
        resultado += `${nodoAsignacion} -> ${nodoIgual};\n`;
        resultado += `${nodoAsignacion} -> ${nodoExpresion};\n`;
        resultado += `${nodoAsignacion} -> ${nodoPuntoComa};\n`;
        resultado += this.exp.getAst(nodoExpresion);
    
        return resultado;
    }

}