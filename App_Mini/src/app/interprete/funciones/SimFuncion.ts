import Tipo, { TipoDato } from "../ast/Tipo"
import Simbolo from "../ast/Simbolo"
import { Instruccion } from "../abstracto/Instruccion"

export default class SimFuncion extends Simbolo {
    private parametros: Array<{tipo: Tipo, id: string}>
    private instrucciones: Instruccion[]

    constructor(tipo: Tipo, id: string, parametros: Array<{tipo: Tipo, id: string}>, 
                instrucciones: Instruccion[], linea: number, columna: number) {
        super(tipo, id, null, linea, columna)
        this.parametros = parametros
        this.instrucciones = instrucciones
    }

    getParametros(): Array<{tipo: Tipo, id: string}> {
        return this.parametros
    }

    getInstrucciones(): Instruccion[] {
        return this.instrucciones
    }
}