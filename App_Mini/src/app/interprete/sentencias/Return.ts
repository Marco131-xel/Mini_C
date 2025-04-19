import {Instruccion} from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo, {TipoDato} from "../ast/Tipo"
import Errores from "../excepciones/Errores"
import Contador from "../ast/Contador"

export default class Return extends Instruccion {
    
    private expresion: Instruccion

    constructor(expresion: Instruccion, linea: number, columna: number) {
        super(new Tipo(TipoDato.VOID), linea, columna)
        this.expresion = expresion
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos) {
        if(this.expresion != null) {
            const resultado = this.expresion.interpretar(arbol, tabla)

            if (resultado instanceof Errores) {
                return resultado
            }
            return resultado
        }
        return this
    }

     getAst(anterior: string): string {
        return ""
    }
}