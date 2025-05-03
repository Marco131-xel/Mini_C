import { Instruccion } from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import Contador from "../ast/Contador"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo, { TipoDato } from "../ast/Tipo"

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
    const contador = Contador.getInstancia();
    const nodoAmbito = `n${contador.get()}`;
    const nodoInicio = `n${contador.get()}`;
    const nodoInstrucciones = `n${contador.get()}`;
    const nodoFin = `n${contador.get()}`;

    let resultado = `${nodoAmbito}[label="AMBITO"];\n`;
    resultado += `${nodoInicio}[label="{"];\n`;
    resultado += `${nodoInstrucciones}[label="INSTRUCCIONES"];\n`;
    resultado += `${nodoFin}[label="}"];\n`;
    
    resultado += `${anterior} -> ${nodoAmbito};\n`;
    resultado += `${nodoAmbito} -> ${nodoInicio};\n`;
    resultado += `${nodoAmbito} -> ${nodoInstrucciones};\n`;
    resultado += `${nodoAmbito} -> ${nodoFin};\n`;
    
    for (const instruccion of this.instrucciones) {
        resultado += instruccion.getAst(nodoInstrucciones);
    }

    return resultado;
  }

}