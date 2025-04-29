import * as parser from "./parser"

export class Yaml {

    public ejecutar(entrada: string) {
        try {
            const resultado = parser.parse(entrada)
            return resultado
        } catch (err: any) {
            console.log(err)
            throw new Error("Error en Yaml: " + err.message)
        }
    }
}