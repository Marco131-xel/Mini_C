import {Request, Response} from 'express'
import Arbol from "./ast/Arbol"
import TablaSimbolos from "./ast/TablaSimbolos"
import Contador from "./ast/Contador"
import Errores from "./excepciones/Errores"
import { SintaxError } from './excepciones/SintaxError'
import * as parser from "./analizador/parser.js"

var AstDot: string

export class Interpretar {
    
    public ejecutar(entrada: string): { salida: string, errores: Errores[], tablaSimbolos: TablaSimbolos } {
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

            for (let i of ast.getInstrucciones()) {
                if (i instanceof Errores) {
                    continue
                }
            }
            errores = ast.getErrores()
            salida = ast.getConsola()
        } catch (err: any) {
            console.log(err)
            salida = "Error: " + err.message
            if (lexicos.length > 0 || sintacticos.length > 0) {
                errores = [...lexicos, ...sintacticos]
            }
        }
        return {salida, errores, tablaSimbolos: tabla}
    }

    public ast(req: Request, res: Response) {
        res.json({ AST: AstDot})
    }
}
