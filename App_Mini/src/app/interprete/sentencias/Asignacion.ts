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
        if (variable.getTipo().getTipo() != this.exp.tipoDato.getTipo()) {
            return new Errores("SEMANTICO", this.exp.tipoDato.getTipo() + " tipo erroneo en asignacion", this.linea, this.columna);
        }
        variable.setValor(newValor)
        return null
    }

    getAst(anterior: string): string {
        return ""
    }

}