import {Instruccion} from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo, {TipoDato} from "../ast/Tipo"
import Errores from "../excepciones/Errores"
import Contador from "../ast/Contador"

export default class Return extends Instruccion {
    
    private expresion?: Instruccion
    private valor: any

    constructor(expresion: Instruccion, linea: number, columna: number) {
        super(expresion?.tipoDato || new Tipo(TipoDato.VOID), linea, columna);
        this.expresion = expresion;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos) {
        if (this.expresion != null) {
            const resultado = this.expresion.interpretar(arbol, tabla)
            
            if (resultado instanceof Errores) {
                return resultado;
            }
            this.valor = resultado
        }
        return this
    }

    getExpresion(): Instruccion | undefined {
        return this.expresion
    }

    getValor(): any {
        return this.valor
    }

    getAst(anterior: string): string {
        const contador = Contador.getInstancia();
        const nodoReturn = `n${contador.get()}`;
        const nodoKw = `n${contador.get()}`;
        const nodoExp = `n${contador.get()}`;
        const nodoPuntoComa = `n${contador.get()}`;
    
        let resultado = `${nodoReturn}[label="RETURN"];\n`;
        resultado += `${nodoKw}[label="return"];\n`;
        
        if (this.expresion) {
            resultado += `${nodoExp}[label="EXPRESION"];\n`;
            resultado += this.expresion.getAst(nodoExp);
        } else {
            resultado += `${nodoExp}[label=""];\n`;
        }
        
        resultado += `${nodoPuntoComa}[label=";"];\n`;
    
        resultado += `${anterior} -> ${nodoReturn};\n`;
        resultado += `${nodoReturn} -> ${nodoKw};\n`;
        resultado += `${nodoReturn} -> ${nodoExp};\n`;
        resultado += `${nodoReturn} -> ${nodoPuntoComa};\n`;
    
        return resultado;
    }
}