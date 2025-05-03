import {Instruccion} from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo, {TipoDato} from "../ast/Tipo"
import Errores from "../excepciones/Errores"
import Contador from "../ast/Contador"

export default class Decremento extends Instruccion {
    private id: string
    
    constructor(id: string, linea: number, columna: number) {
        super(new Tipo(TipoDato.VOID), linea, columna)
        this.id = id
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos) {
        const variable = tabla.getVariable(this.id)
        if (variable == null) {
            return new Errores("SEMANTICO", "Variable "+this.id+" no existe", this.linea, this.columna)
        }
    
        const valorActual = variable.getValor()
        
        const valorNumerico = Number(valorActual)
        if (!isNaN(valorNumerico)) {
            const nuevoValor = valorNumerico - 1
            variable.setValor(nuevoValor)
            return nuevoValor
        } else {
            return new Errores("SEMANTICO", "Decremento solo aplicable a tipos numericos", this.linea, this.columna)
        }
    }

    getAst(anterior: string): string {
        const contador = Contador.getInstancia();
        const nodoDecremento = `n${contador.get()}`;
        const nodoId = `n${contador.get()}`;
        const nodoOperador = `n${contador.get()}`;
        const nodoPuntoComa = `n${contador.get()}`;
    
        let resultado = `${nodoDecremento}[label="DECREMENTO"];\n`;
        resultado += `${nodoId}[label="${this.id}"];\n`;
        resultado += `${nodoOperador}[label="--"];\n`;
        resultado += `${nodoPuntoComa}[label=";"];\n`;
    
        resultado += `${anterior} -> ${nodoDecremento};\n`;
        resultado += `${nodoDecremento} -> ${nodoId};\n`;
        resultado += `${nodoDecremento} -> ${nodoOperador};\n`;
        resultado += `${nodoDecremento} -> ${nodoPuntoComa};\n`;
    
        return resultado;
    }
    
}