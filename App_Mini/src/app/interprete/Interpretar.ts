import {Request, Response} from 'express'
import Arbol from "./ast/Arbol"
import TablaSimbolos from "./ast/TablaSimbolos"
import Contador from "./ast/Contador"
import Errores from "./excepciones/Errores"
import * as parser from "./analizador/parser.js"

var AstDot: string

export class Interpretar {
    
    public ejecutar(entrada: string): string {
        let salida = "";
        try {
            AstDot = ""
            let ast = new Arbol(parser.parse(entrada))
            let tabla = new TablaSimbolos()
            tabla.setNombre("Global")
            ast.setTablaGlobal(tabla)
            ast.setConsola("")

            for (let i of ast.getInstrucciones()) {
                console.log(i)
                var resultado = i.interpretar(ast, tabla)
                console.log(resultado)
            }

            for (let i of ast.getInstrucciones()) {
                if (i instanceof Errores) {
                    continue
                }
            }
            salida = ast.getConsola()
        } catch (err: any) {
            console.log(err)
            salida = "Error: " + err.message
        }
        return salida
    }

    public ast(req: Request, res: Response) {
        res.json({ AST: AstDot})
    }
}
