import { Instruccion } from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo, { TipoDato } from "../ast/Tipo"
import Simbolo from "../ast/Simbolo"
import SimFuncion from "./SimFuncion"
import Errores from "../excepciones/Errores"
import Contador from "../ast/Contador"

export default class Function extends Instruccion {
    
    private id: string
    private parametros: Array<{tipo: Tipo, id: string}>
    private instrucciones: Instruccion[]

    constructor(tipo: Tipo, id: string, parametros: Array<{tipo: Tipo, id: string}>, 
                instrucciones: Instruccion[], linea: number, columna: number){
        super(tipo, linea, columna)
        this.id = id
        this.parametros = parametros
        this.instrucciones = instrucciones
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos) {
        const simbolo = new SimFuncion(
            this.tipoDato,
            this.id,
            this.parametros,
            this.instrucciones,
            this.linea,
            this.columna
        )

        if (!arbol.getTablaGlobal().setVariable(simbolo)) {
            return new Errores("SEMANTICO", `La funcion ${this.id} ya existe`, this.linea, this.columna)
        }
        
        return null
    }

    getAst(anterior: string): string {
        const contador = Contador.getInstancia();
        const nodoFunc = `n${contador.get()}`;
        const nodoTipo = `n${contador.get()}`;
        const nodoId = `n${contador.get()}`;
        const nodoParams = `n${contador.get()}`;
        const nodoApertura = `n${contador.get()}`;
        const nodoInstrucciones = `n${contador.get()}`;
        const nodoCierre = `n${contador.get()}`;
    
        let resultado = `${nodoFunc}[label="FUNCION"];\n`;
        resultado += `${nodoTipo}[label="${TipoDato[this.tipoDato.getTipo()]}"];\n`;
        resultado += `${nodoId}[label="${this.id}"];\n`;
        resultado += `${nodoParams}[label="PARAMETROS"];\n`;
        resultado += `${nodoApertura}[label="{"];\n`;
        resultado += `${nodoInstrucciones}[label="INSTRUCCIONES"];\n`;
        resultado += `${nodoCierre}[label="}"];\n`;
    
        resultado += `${anterior} -> ${nodoFunc};\n`;
        resultado += `${nodoFunc} -> ${nodoTipo};\n`;
        resultado += `${nodoFunc} -> ${nodoId};\n`;
        resultado += `${nodoFunc} -> ${nodoParams};\n`;
        resultado += `${nodoFunc} -> ${nodoApertura};\n`;
        resultado += `${nodoFunc} -> ${nodoInstrucciones};\n`;
        resultado += `${nodoFunc} -> ${nodoCierre};\n`;
    
        // agregar parametros
        for (const param of this.parametros) {
            const nodoParam = `n${contador.get()}`;
            const nodoParamTipo = `n${contador.get()}`;
            const nodoParamId = `n${contador.get()}`;
    
            resultado += `${nodoParam}[label="PARAMETRO"];\n`;
            resultado += `${nodoParamTipo}[label="${TipoDato[param.tipo.getTipo()]}"];\n`;
            resultado += `${nodoParamId}[label="${param.id}"];\n`;
    
            resultado += `${nodoParams} -> ${nodoParam};\n`;
            resultado += `${nodoParam} -> ${nodoParamTipo};\n`;
            resultado += `${nodoParam} -> ${nodoParamId};\n`;
        }
    
        // agregar instrucciones
        for (const instr of this.instrucciones) {
            resultado += instr.getAst(nodoInstrucciones);
        }
    
        return resultado;
    }

}