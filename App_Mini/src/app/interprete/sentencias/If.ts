import { Instruccion } from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo, { TipoDato } from "../ast/Tipo"
import Errores from "../excepciones/Errores"
import Break from "./Break"
import Return from "./Return"

export default class If extends Instruccion {

    private condicion: Instruccion
    private instruccionesIf: Instruccion[]
    private elseIf: If | null
    private instruccionesElse: Instruccion[]

    constructor(condicion: Instruccion, instruccionesIf: Instruccion[] | null, elseIf: If | null, 
                instruccionesElse: Instruccion[] | null, linea: number, columna: number) {
        super(new Tipo(TipoDato.VOID), linea, columna)
        this.condicion = condicion
        this.instruccionesIf = instruccionesIf ?? []
        this.elseIf = elseIf
        this.instruccionesElse = instruccionesElse ?? []
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const cond = this.condicion.interpretar(arbol, tabla)

        if (cond instanceof Errores) {
            return cond
        }

        if (cond === null || cond === undefined) {
            return new Errores("SEMANTICO", "La condicion del If no se pudo evaluar correctamente", this.linea, this.columna)
        }

        if (this.condicion.tipoDato.getTipo() !== TipoDato.BOOL) {
            return new Errores( "SEMANTICO", "La condicion del If debe ser de tipo booleano", this.linea, this.columna)
        }

        const nuevaTabla = new TablaSimbolos(tabla)

        try {
            if (cond === true) {
                return this.ejecutarBloque(arbol, nuevaTabla, this.instruccionesIf)
            } else if (this.elseIf != null) {
                return this.elseIf.interpretar(arbol, tabla)
            } else {
                return this.ejecutarBloque(arbol, nuevaTabla, this.instruccionesElse)
            }
        } catch (e: any) {
            return new Errores( "RUNTIME", `Error inesperado en la ejecucion del If-ElseIf-Else: ${e.message}`, this.linea, this.columna)
        }
    }

    private ejecutarBloque(arbol: Arbol, tabla: TablaSimbolos, instrucciones: Instruccion[]): any {
        for (const instr of instrucciones) {
            if (instr instanceof Break) {
                return new Errores("SEMANTICO", "Break fuera de un ciclo", this.linea, this.columna)
            }

            const resultado = instr.interpretar(arbol, tabla)

            if (resultado instanceof Errores) {
                return resultado
            }

            if (resultado instanceof Return) {
                return resultado
            }
        }

        return null
    }

    getAst(anterior: string): string {
        return ""
    }
}
