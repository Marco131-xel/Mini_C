import {Instruccion} from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo, {TipoDato} from "../ast/Tipo"
import Errores from "../excepciones/Errores"
import Contador from "../ast/Contador"
import Nativo from "../operadores/Nativo"

export default class Print extends Instruccion {
    private  expresion: Instruccion

    constructor(expresion: Instruccion, linea: number, columna: number) {
        super(new Tipo(TipoDato.VOID), linea, columna)
        this.expresion = expresion
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos) {
        let valor = this.expresion.interpretar(arbol, tabla);
        if (valor instanceof Errores) return valor;
    
        if (valor instanceof Nativo) {
            const val = valor.getValor();
            if (typeof val === 'string' && val.includes("${")) {
                const procesado = procesarVariables(val, tabla);
                arbol.Print(procesado);
            } else {
                arbol.Print(val.toString());
            }
        } else if (valor instanceof Map) {
            let structStr = "{ ";
            for (const [key, val] of valor.entries()) {
                if (val instanceof Nativo) {
                    structStr += `${key}: ${val.getValor()}, `;
                } else {
                    structStr += `${key}: ${val}, `;
                }
            }
            structStr = structStr.trim().replace(/,$/, "") + " }";
            arbol.Print(structStr);
        } else {
            arbol.Print(valor.toString());
        }
    
        return null;
    }
    
    getAst(anterior: string): string {
        return ""
    }

}

function procesarVariables(contenido: string, tabla: TablaSimbolos): string {
    const regex = /\$\{([^}]+)\}/g;

    return contenido.replace(regex, (_, variableNombre) => {
        const simbolo = tabla.getVariable(variableNombre.trim());
        const valor = simbolo?.getValor?.() ?? "[Variable no definida]";
        return valor?.toString?.() ?? valor;
    });
}

