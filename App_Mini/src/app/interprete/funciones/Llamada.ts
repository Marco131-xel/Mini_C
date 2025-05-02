import { Instruccion } from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol";
import TablaSimbolos from "../ast/TablaSimbolos"
import Errores from "../excepciones/Errores"
import Return from "../sentencias/Return"
import Tipo, { TipoDato } from "../ast/Tipo"
import Simbolo from "../ast/Simbolo";
import SimFuncion from "./SimFuncion";

export default class LLamada extends Instruccion {
    
    private id: string
    private argumentos: Instruccion[]

    constructor(id: string, argumentos: Instruccion[], linea: number, columna: number) {
        super(new Tipo(TipoDato.VOID), linea, columna)
        this.id = id
        this.argumentos = argumentos
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos) {
        const simbolo = tabla.getVariable(this.id);
        if (!simbolo || !(simbolo instanceof SimFuncion)) {
            return new Errores("SEMANTICO", `Función ${this.id} no definida`, this.linea, this.columna)
        }
    
        const funcion = simbolo as SimFuncion
        this.tipoDato = funcion.getTipo()

        // validar numero de parametros
        if (funcion.getParametros().length !== this.argumentos.length) {
            return new Errores("SEMANTICO", `numero incorrecto de argumentos para ${this.id}, 
                esperados: ${funcion.getParametros().length}, recibidos: ${this.argumentos.length}`
                , this.linea, this.columna)
        }
        
        // crear nuevo ambito
        const nuevaTabla = new TablaSimbolos(tabla)
        nuevaTabla.setNombre(`Llamada-${this.id}`)
    
        // evaluar argumentos
        for (let i = 0; i < this.argumentos.length; i++) {
            const valorArg = this.argumentos[i].interpretar(arbol, tabla)
            if (valorArg instanceof Errores) return valorArg
        
            const param = funcion.getParametros()[i]
            const tipoEsperado = param.tipo.getTipo()
            const tipoArgumento = this.argumentos[i].tipoDato.getTipo()
        
            // validar int a float
            if (tipoEsperado !== tipoArgumento) {
                if (!(tipoArgumento === TipoDato.INT && tipoEsperado === TipoDato.FLOAT)) {
                    return new Errores("SEMANTICO", `el parametro '${param.id}' esperaba tipo ${param.tipo.toString()}
                                        , pero recibio ${this.argumentos[i].tipoDato.toString()}`,
                        this.argumentos[i].linea,
                        this.argumentos[i].columna)
                }
            }
        
            const simboloParam = new Simbolo(
                param.tipo,
                param.id,
                valorArg,
                this.linea,
                this.columna
            )
        
            if (!nuevaTabla.setVariable(simboloParam)) {
                return new Errores("SEMANTICO", `Error al declarar parametro ${param.id}`, this.linea, this.columna)
            }
        }        
    
        // ejecutar instrucciones
        let ultimoResultado: any = null
        for (const instr of funcion.getInstrucciones()) {
            const resultado = instr.interpretar(arbol, nuevaTabla)
            
            if (resultado instanceof Return) {
                return resultado.getValor()
            }
            
            if (resultado instanceof Errores) {
                return resultado
            }
            
            ultimoResultado = resultado
        }
    
        // funcion sin return
        if (funcion.getTipo().getTipo() !== TipoDato.VOID) {
            return new Errores("SEMANTICO", `la funcion ${this.id} debe retornar un valor`, this.linea, this.columna)
        }
    
        return ultimoResultado
    }

    getAst(anterior: string): string {
        return ""
    }
    
}