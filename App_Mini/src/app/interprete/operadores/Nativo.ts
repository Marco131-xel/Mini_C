import {Instruccion} from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo, {TipoDato} from "../ast/Tipo"
import Contador from "../ast/Contador"

export default class Nativo extends Instruccion {

    valor: any

    constructor(tipo: Tipo, valor:any, fila: number, columna: number) {
        super(tipo, fila, columna)
        this.valor = valor
    }
    interpretar(arbol: Arbol, tabla: TablaSimbolos) {
        return this
    }
    getValor():any {
        return this.valor
    }
    getTipo():Tipo {
        return this.tipoDato
    }
    getAst(anterior: string): string {
        const contador = Contador.getInstancia();
        const nodoNativo = `n${contador.get()}`;
        const nodoValor = `n${contador.get()}`;
        
        let valorStr = "";
    
        if (this.valor instanceof Map) {
            valorStr = "STRUCT";
        } else if (typeof this.valor === "string") {
            valorStr = `"${this.valor}"`;
        } else {
            valorStr = String(this.valor);
        }
    
        let resultado = `${nodoNativo}[label="NATIVO"];\n`;
        resultado += `${nodoValor}[label=${valorStr}];\n`;
        resultado += `${nodoNativo} -> ${nodoValor};\n`;
        resultado += `${anterior} -> ${nodoNativo};\n`;
        
        return resultado;
    }    
    
    override toString(): string {
        if (this.valor instanceof Map) {
            const entries = Array.from(this.valor.entries())
                .map(([key, val]) => `${key}: ${val instanceof Nativo ? val.toString() : val}`)
                .join(", ");
            return `{ ${entries} }`;
        }
        return String(this.valor);
    }
    
}