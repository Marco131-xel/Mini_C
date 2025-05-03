import {Instruccion} from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo, {TipoDato} from "../ast/Tipo"
import Errores from "../excepciones/Errores"
import Contador from "../ast/Contador"

export default class Break extends Instruccion {

    constructor(linea: number, columna: number) {
        super(new Tipo(TipoDato.VOID), linea, columna)
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos) {
        return null
    }

    getAst(anterior: string): string {
        const contador = Contador.getInstancia();
        const nodoBreak = `n${contador.get()}`;
        const nodoBreakLabel = `n${contador.get()}`;
        const nodoPuntoComa = `n${contador.get()}`;
    
        let resultado = `${nodoBreak}[label="BREAK"];\n`;
        resultado += `${nodoBreakLabel}[label="break"];\n`;
        resultado += `${nodoPuntoComa}[label=";"];\n`;
    
        resultado += `${anterior} -> ${nodoBreak};\n`;
        resultado += `${nodoBreak} -> ${nodoBreakLabel};\n`;
        resultado += `${nodoBreak} -> ${nodoPuntoComa};\n`;
    
        return resultado;
    }
}