import { Instruccion } from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import Simbolo from "../ast/Simbolo"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo, { TipoDato } from "../ast/Tipo"
import Errores from "../excepciones/Errores"

export default class Ambito extends Instruccion {
  
  private instrucciones: Instruccion[]

  constructor(instrucciones: Instruccion[], linea: number, columna: number) {
    super(new Tipo(TipoDato.VOID), linea, columna)
    this.instrucciones = instrucciones
  }

  interpretar(arbol: Arbol, tabla: TablaSimbolos) {
    const nuevaTabla = new TablaSimbolos(tabla)

    for (const inst of this.instrucciones) {
      const resultado = inst.interpretar(arbol, nuevaTabla)
    }
    return null
  }

  getAst(anterior: string): string {
    return ""
  }

}