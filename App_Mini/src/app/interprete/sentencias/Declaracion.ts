import {Instruccion} from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo, {TipoDato} from "../ast/Tipo"
import Errores from "../excepciones/Errores"
import Contador from "../ast/Contador"
import Simbolo from "../ast/Simbolo"
import LLamada from "../funciones/Llamada"

export default class Declaracion extends Instruccion {
    
    public identificador: string
    public valor?: Instruccion

    constructor(tipo: Tipo, linea: number, columna: number, identificador: string, valor?: Instruccion){
        super(tipo, linea, columna)
        this.identificador = identificador
        this.valor = valor
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos) {
        // interpretado la expresion
        let valorInterpretado;
        if (this.valor == null) {
            valorInterpretado = this.valoresDefault();
        } else {
            valorInterpretado = this.valor.interpretar(arbol, tabla);
            if (valorInterpretado instanceof LLamada) {
                // si llamada funcion interpretar
                valorInterpretado = valorInterpretado.interpretar(arbol, tabla);
            }
        }
        
        if (valorInterpretado instanceof Errores) {
            return valorInterpretado;
        }

        if (this.valor != null) {
            const tipoValor = this.valor.tipoDato.getTipo();
            const tipoDeclaracion = this.tipoDato.getTipo();
            
            if (tipoValor !== tipoDeclaracion) {
                if (!(tipoValor === TipoDato.INT && tipoDeclaracion === TipoDato.FLOAT)) {
                    return new Errores("SEMANTICO", 
                        `Tipo ${TipoDato[tipoValor]} no compatible con ${TipoDato[tipoDeclaracion]}`,
                        this.linea, this.columna);
                }
            }
        }
        
        // crear la variable
        const s = new Simbolo(this.tipoDato, this.identificador, valorInterpretado, this.linea, this.columna)
        
        const creacion: Boolean = tabla.setVariable(s)

        if (!creacion) {
            return new Errores("SEMANTICO", "Variable " + this.identificador + " ya existe", this.linea, this.columna);
        }
        return null;
    }

    valoresDefault(): boolean | string | number | null {
        switch (this.tipoDato.getTipo()) {
            case TipoDato.BOOL:
                return true;
            case TipoDato.STRING:
                return '';
            case TipoDato.CHAR:
                return '\u0000';
            case TipoDato.INT:
                return 0;
            case TipoDato.FLOAT:
                return 0.0;
            default:
                return null;
        }
    }

    getAst(anterior: string): string {
        const contador = Contador.getInstancia();
        const nodoDeclaracion = `n${contador.get()}`;
        const nodoTipo = `n${contador.get()}`;
        const nodoId = `n${contador.get()}`;
        const nodoIgual = `n${contador.get()}`;
        const nodoExpresion = `n${contador.get()}`;
        const nodoPuntoComa = `n${contador.get()}`;
    
        let resultado = `${nodoDeclaracion}[label="DECLARACION"];\n`;
        resultado += `${nodoTipo}[label="${TipoDato[this.tipoDato.getTipo()]}"];\n`;
        resultado += `${nodoId}[label="${this.identificador}"];\n`;
        
        resultado += `${anterior} -> ${nodoDeclaracion};\n`;
        resultado += `${nodoDeclaracion} -> ${nodoTipo};\n`;
        resultado += `${nodoDeclaracion} -> ${nodoId};\n`;
    
        if (this.valor) {
            resultado += `${nodoIgual}[label="="];\n`;
            resultado += `${nodoExpresion}[label="EXPRESION"];\n`;
            
            resultado += `${nodoDeclaracion} -> ${nodoIgual};\n`;
            resultado += `${nodoDeclaracion} -> ${nodoExpresion};\n`;
            
            resultado += this.valor.getAst(nodoExpresion);
        }
    
        resultado += `${nodoPuntoComa}[label=";"];\n`;
        resultado += `${nodoDeclaracion} -> ${nodoPuntoComa};\n`;
    
        return resultado;
    }

}