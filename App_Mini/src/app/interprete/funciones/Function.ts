import { Instruccion } from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo from "../ast/Tipo"
import Simbolo from "../ast/Simbolo"
import SimFuncion from "./SimFuncion"
import Errores from "../excepciones/Errores"

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
        return ""
    }

}