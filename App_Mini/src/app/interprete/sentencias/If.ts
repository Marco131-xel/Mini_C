import { Instruccion } from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import Contador from "../ast/Contador"
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
        const contador = Contador.getInstancia();
        const nodoIf = `n${contador.get()}`;
        const nodoIfLabel = `n${contador.get()}`;
        const nodoCondicion = `n${contador.get()}`;
        const nodoBloqueIf = `n${contador.get()}`;
        const nodoElse = `n${contador.get()}`;
        const nodoBloqueElse = `n${contador.get()}`;
    
        let resultado = `${nodoIf}[label="IF"];\n`;
        resultado += `${nodoIfLabel}[label="if"];\n`;
        resultado += `${nodoCondicion}[label="CONDICION"];\n`;
        resultado += `${nodoBloqueIf}[label="BLOQUE_IF"];\n`;
        
        resultado += `${anterior} -> ${nodoIf};\n`;
        resultado += `${nodoIf} -> ${nodoIfLabel};\n`;
        resultado += `${nodoIf} -> ${nodoCondicion};\n`;
        resultado += `${nodoIf} -> ${nodoBloqueIf};\n`;
    
        // AST de la condición
        resultado += this.condicion.getAst(nodoCondicion);
    
        // AST de las instrucciones del if
        for (const instr of this.instruccionesIf) {
            resultado += instr.getAst(nodoBloqueIf);
        }
    
        // Manejo de else if y else
        if (this.elseIf) {
            const nodoElseIf = `n${contador.get()}`;
            resultado += `${nodoElseIf}[label="ELSE_IF"];\n`;
            resultado += `${nodoIf} -> ${nodoElseIf};\n`;
            resultado += this.elseIf.getAst(nodoElseIf);
        } else if (this.instruccionesElse.length > 0) {
            resultado += `${nodoElse}[label="else"];\n`;
            resultado += `${nodoBloqueElse}[label="BLOQUE_ELSE"];\n`;
            resultado += `${nodoIf} -> ${nodoElse};\n`;
            resultado += `${nodoIf} -> ${nodoBloqueElse};\n`;
    
            // AST de las instrucciones del else
            for (const instr of this.instruccionesElse) {
                resultado += instr.getAst(nodoBloqueElse);
            }
        }
    
        return resultado;
    }
}
