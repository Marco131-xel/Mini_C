import {Instruccion} from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo, {TipoDato} from "../ast/Tipo"
import Contador from "../ast/Contador"
import Errores from "../excepciones/Errores"

export default class Variable extends Instruccion {

    private id: string;

    constructor(id: string, linea: number, columna: number) {
        super(new Tipo(TipoDato.VOID), linea, columna)
        this.id = id;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos) {
        let valor = tabla.getVariable(this.id);
        if (valor == null) {
            return new Errores("SEMANTICO", "La Variable "+this.id+" no existe", this.linea, this.columna);
        }
        this.tipoDato.setTipo(valor.getTipo().getTipo());
        return valor.getValor();
    }

    getAst(anterior: string): string {
        const contador = Contador.getInstancia();
        const nombreNodo = `n${contador.get()}`;
        return `${nombreNodo}[label="Variable: ${this.id}"];\n` +
               `${anterior} -> ${nombreNodo};\n`;
    }  
    
}