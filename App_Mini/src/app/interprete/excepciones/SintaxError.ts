import * as parser from "../analizador/parser"
import Errores from "./Errores";

export class SintaxError {
    // mis tokens
    private static palabrasReservadas: Set<string> = new Set([
        "main", "void", "int", "float", "string", "char", "bool", "struct",
        "print", "if", "else", "for", "import"
    ])

    private static operadores: Set<string> = new Set([
        "+", "-", "*", "/", "&&", "||", "==", "!=", "<=", ">=", "<", ">", "^", ";"
        , "\"", "\'", "="
    ])

    private static tokenValido = /[0-9+\-*/().\sA-Za-z#\$]/

    // funcion para generar errores lexicos
    public static erroresLexicos(entrada: string): Errores[] {
        const errores: Errores[] = [];
        const tokens = /[a-zA-Z_][a-zA-Z0-9_]*/g;

        // caracteres no validos
        for (let i = 0; i < entrada.length; i++) {
            const char = entrada[i];
            if (!SintaxError.tokenValido.test(char) && !SintaxError.operadores.has(char)) {
                const linea = entrada.substring(0, i).split('\n').length;
                const columna = i - entrada.lastIndexOf('\n', i - 1);
                errores.push(new Errores("LEXICO", `Caracter no valido: '${char}'`, linea, columna));
            }
        }

        return errores;
    }

    // funcion para generar errores sintacticos
    public static erroresSintacticos(entrada: string): Errores[] {
        const errores: Errores[] = []
        try {
            parser.parse(entrada)
        } catch (e: unknown) {
            if (e instanceof Error) {
                const mensaje = this.crearMensajes(e.message)
                const linea = (e as any).location?.start?.line || -1
                const columna = (e as any).location?.start?.column || -1
    
                errores.push(new Errores("SINTACTICO", mensaje, linea, columna))
            } else {
                errores.push(new Errores("SINTACTICO", "Error desconocido", -1, -1))
            }
        }
        return errores
    }

    public static crearMensajes(msg: string): string {
        const traducir = {
            "Expected": "Se esperaba",
            "but": "pero se encontró",
            "whitespace": "espacio en blanco",
            "end of input": "fin de entrada",
            "or": "o",
            "found": ""
        }

        for (const [ingles, esp] of Object.entries(traducir)) {
            msg = msg.replace(new RegExp(`\\b${ingles}\\b`, 'g'), esp);
        }
        return msg
    }
}