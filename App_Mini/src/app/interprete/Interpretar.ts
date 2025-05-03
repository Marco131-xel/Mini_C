import {Request, Response} from 'express'
import Arbol from "./ast/Arbol"
import TablaSimbolos from "./ast/TablaSimbolos"
import Contador from "./ast/Contador"
import Errores from "./excepciones/Errores"
import { SintaxError } from './excepciones/SintaxError'
import * as parser from "./analizador/parser.js"

var AstDot: string

export class Interpretar {
    
    public ejecutar(entrada: string): { salida: string, errores: Errores[], tablaSimbolos: TablaSimbolos, astDot: string } {
        let salida = "";
        let tabla = new TablaSimbolos()
        let errores: Errores[] = [];
        const lexicos = SintaxError.erroresLexicos(entrada)
        const sintacticos = SintaxError.erroresSintacticos(entrada)
        try {
            AstDot = ""
            let ast = new Arbol(parser.parse(entrada))
            tabla.setNombre("Global")
            ast.setTablaGlobal(tabla)
            ast.setConsola("")

            for (let i of ast.getInstrucciones()) {
                console.log(i)
                var resultado = i.interpretar(ast, tabla)
                console.log(resultado)
                if (resultado instanceof Errores) {
                    ast.addError(resultado)
                }
            }

            const contador = Contador.getInstancia()
            AstDot = ""
            let dot = "digraph ast {\n"
            dot += "bgcolor=\"#1e1e1e\"\n"
            dot += "node [fontname=\"Arial\", fontsize=12]\n"
            dot += "edge [color=\"#444\", arrowhead=vee]\n\n"
            dot += "nINICIO [label=\"INICIO\", style=\"filled\", fillcolor=\"#1e1e1e\", fontcolor=\"#2e86c1\", shape=box]\n"
            dot += "nINSTRUCCIONES [label=\"INSTRUCCIONES\", style=\"filled\", fillcolor=\"#1e1e1e\", fontcolor=\"#2e86c1\"]\n"
            dot += "nINICIO->nINSTRUCCIONES [color=\"#2e86c1\"]\n\n"

            for (let i of ast.getInstrucciones()) {
                if (i instanceof Errores) {
                    continue
                }
                const nodoInstr = `n${contador.get()}`
                dot += `${nodoInstr} [label=\"INSTRUCCION\", style=\"filled\", fillcolor=\"#252526\", fontcolor=\"#d4d4d4\", shape=box]\n`
                dot += `nINSTRUCCIONES->${nodoInstr} [color=\"#569cd6\"]\n\n`
                dot += i.getAst(nodoInstr).replace(/\[label="/g, '[style="filled", fillcolor="#252526", fontcolor="#d4d4d4", color="#569cd6", label="')
            }
            dot += "}"
            AstDot = dot
            errores = ast.getErrores()
            salida = ast.getConsola()
        } catch (err: any) {
            console.log(err)
            salida = "Error: " + err.message
            if (lexicos.length > 0 || sintacticos.length > 0) {
                errores = [...lexicos, ...sintacticos]
            }
        }
        return { salida, errores, tablaSimbolos: tabla, astDot: AstDot }
    }

    public ast(req: Request, res: Response) {
        res.json({ AST: AstDot})
    }
}
