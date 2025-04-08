import {Instruccion} from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo, {TipoDato} from "../ast/Tipo"
import Errores from "../excepciones/Errores"
import Contador from "../ast/Contador"

export default class Print extends Instruccion {
    private  expresion: Instruccion

    interpretar(arbol: Arbol, tabla: TablaSimbolos) {
        let valor = this.expresion.interpretar(arbol, tabla);
        if(valor instanceof Errores) return valor;
        arbol.Print(valor);
        return null;
    }

    constructor(expresion: Instruccion, linea: number, columna: number) {
        super(new Tipo(TipoDato.VOID), linea, columna)
        this.expresion = expresion
    }

    

    getAst(anterior: string): string {
        return ""
    }

}