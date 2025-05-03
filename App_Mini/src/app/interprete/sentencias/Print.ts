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
            // convertir map a string para structs
            let structStr = "{ ";
            for (const [key, val] of valor.entries()) {
                structStr += `${key}: ${val.getValor?.() ?? val}, `;
            }
            structStr = structStr.trim().replace(/,$/, "") + " }";
            arbol.Print(structStr);
        } else {
            arbol.Print(valor?.toString() ?? "[Valor no convertible]");
        }
    
        return null;
    }
    
    getAst(anterior: string): string {
        const contador = Contador.getInstancia();
        const nodoPrint = `n${contador.get()}`;
        const nodoImprimir = `n${contador.get()}`;
        const nodoParA = `n${contador.get()}`;
        const nodoExp = `n${contador.get()}`;
        const nodoParC = `n${contador.get()}`;
        const nodoPuntoComa = `n${contador.get()}`;
    
        let resultado = `${nodoPrint}[label="PRINT"];\n`;
        resultado += `${nodoImprimir}[label="print"];\n`;
        resultado += `${nodoParA}[label="("];\n`;
        resultado += `${nodoExp}[label="EXPRESION"];\n`;
        resultado += `${nodoParC}[label=")"];\n`;
        resultado += `${nodoPuntoComa}[label=";"];\n`;
    
        resultado += `${anterior} -> ${nodoPrint};\n`;
        resultado += `${nodoPrint} -> ${nodoImprimir};\n`;
        resultado += `${nodoPrint} -> ${nodoParA};\n`;
        resultado += `${nodoPrint} -> ${nodoExp};\n`;
        resultado += `${nodoPrint} -> ${nodoParC};\n`;
        resultado += `${nodoPrint} -> ${nodoPuntoComa};\n`;
    
        resultado += this.expresion.getAst(nodoExp);
    
        return resultado;
    }    
}

function procesarVariables(contenido: string, tabla: TablaSimbolos): string {
    const regex = /\$\{([^}]+)\}/g;

    return contenido.replace(regex, (_, expresion) => {
        if (expresion.includes('.')) {
            const [variable, propiedad] = expresion.split('.');
            const simbolo = tabla.getVariable(variable.trim());
            
            if (!simbolo) return `[Variable ${variable} no definida]`;
            
            const valor = simbolo.getValor();
            if (!(valor instanceof Map)) return `[${variable} no es un struct]`;
            
            const propValor = valor.get(propiedad.trim());
            return propValor?.getValor?.()?.toString() ?? `[Propiedad ${propiedad} no existe]`;
        }
        
        const simbolo = tabla.getVariable(expresion.trim());
        const valor = simbolo?.getValor?.() ?? "[Variable no definida]";
        
        if (valor instanceof Map) {
            let structStr = "{ ";
            for (const [key, val] of valor.entries()) {
                structStr += `${key}: ${val.getValor?.() ?? val}, `;
            }
            return structStr.trim().replace(/,$/, "") + " }";
        }
        
        return valor?.toString?.() ?? valor;
    });
}

