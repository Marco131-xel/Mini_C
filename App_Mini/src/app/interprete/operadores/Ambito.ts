import { Instruccion } from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import Simbolo from "../ast/Simbolo"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo, { TipoDato } from "../ast/Tipo"
import Errores from "../excepciones/Errores"

export default class Ambito {
    constructor(public instrucciones: any[], public linea: number, public columna: number) {}
  
    interpretar(arbol: any, tabla: any) {
      let nuevaTabla = new TablaSimbolos(tabla);
  
      for (let inst of this.instrucciones) {
        let resultado = inst.interpretar(arbol, nuevaTabla);
      }
      return null;
    }
  }
  