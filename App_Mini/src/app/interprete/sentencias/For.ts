import { Instruccion } from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import Contador from "../ast/Contador"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo, { TipoDato } from "../ast/Tipo"
import Errores from "../excepciones/Errores"
import Break from "./Break"
import Return from "./Return"

export default class For extends Instruccion {

    private asignacion: Instruccion
    private condicion: Instruccion
    private actualizar: Instruccion
    private instrucciones: Instruccion[]

    constructor(asignar: Instruccion, condicion: Instruccion, actualizar: Instruccion, 
        instrucciones: Instruccion[], linea: number, columna: number) {
        super(new Tipo(TipoDato.VOID), linea, columna)
        this.asignacion = asignar
        this.condicion = condicion
        this.actualizar = actualizar
        this.instrucciones = instrucciones
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos) {
        // crear un nuevo entorno
        const newTabla = new TablaSimbolos(tabla)
        // ejecutar la asignacion e inicialiar
        const res1 = this.asignacion.interpretar(arbol, newTabla)
        if (res1 instanceof Errores) {
            return res1
        }

        while(true) {
            const cond = this.condicion.interpretar(arbol, newTabla)
            if (cond instanceof Errores) {
                return cond
            }

            if (this.condicion.tipoDato.getTipo() != TipoDato.BOOL) {
                return new Errores("SEMANTICO", "La condicion debe ser booleana", this.linea, this.columna)
            }

            // salir del ciclo si la condicion es falsa
            if (!(cond as boolean)) {
                break
            }
            
            // crear un nuevo ambito
            const newTabla2 = new TablaSimbolos(newTabla)

            for (const i of this.instrucciones) {
                const resIns = i.interpretar(arbol, newTabla2)

                if (resIns instanceof Break) {
                    return null
                }
                if (resIns instanceof Return) {
                    return resIns
                }
            }
            // ejecutar la actualizacion
            const act = this.actualizar.interpretar(arbol, newTabla)
            if (act instanceof Errores) {
                return act
            }
        }
        return null
    }

    getAst(anterior: string): string {
        const contador = Contador.getInstancia();
        const nodoFor = `n${contador.get()}`;
        const nodoForLabel = `n${contador.get()}`;
        const nodoAsignacion = `n${contador.get()}`;
        const nodoCondicion = `n${contador.get()}`;
        const nodoActualizar = `n${contador.get()}`;
        const nodoBloque = `n${contador.get()}`;
    
        let resultado = `${nodoFor}[label="FOR"];\n`;
        resultado += `${nodoForLabel}[label="for"];\n`;
        resultado += `${nodoAsignacion}[label="ASIGNACION_INICIAL"];\n`;
        resultado += `${nodoCondicion}[label="CONDICION"];\n`;
        resultado += `${nodoActualizar}[label="ACTUALIZACION"];\n`;
        resultado += `${nodoBloque}[label="BLOQUE_INSTRUCCIONES"];\n`;
    
        resultado += `${anterior} -> ${nodoFor};\n`;
        resultado += `${nodoFor} -> ${nodoForLabel};\n`;
        resultado += `${nodoFor} -> ${nodoAsignacion};\n`;
        resultado += `${nodoFor} -> ${nodoCondicion};\n`;
        resultado += `${nodoFor} -> ${nodoActualizar};\n`;
        resultado += `${nodoFor} -> ${nodoBloque};\n`;
    
        resultado += this.asignacion.getAst(nodoAsignacion);
        resultado += this.condicion.getAst(nodoCondicion);
        resultado += this.actualizar.getAst(nodoActualizar);
        
        for (const instr of this.instrucciones) {
            resultado += instr.getAst(nodoBloque);
        }
    
        return resultado;
    }

}