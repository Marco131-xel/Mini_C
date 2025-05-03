import { Instruccion } from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import Simbolo from "../ast/Simbolo"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo, { TipoDato } from "../ast/Tipo"
import Errores from "../excepciones/Errores"
import Nativo from "./Nativo"

export default class Structs extends Instruccion {

    private nombre: string
    private atributos: {tipo: Tipo, id: string}[]

    constructor(nombre: string, atributos: {tipo: Tipo, id: string}[], linea: number, columna: number) {
        super(new Tipo(TipoDato.VOID), linea, columna)
        this.nombre = nombre
        this.atributos = atributos
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const struct = new DefStruct(this.nombre)
        for (const atributo of this.atributos) {
            struct.setAtributo(atributo.id, atributo.tipo)
        }
        arbol.setStruct(this.nombre, struct)
        return null
    }

    getAst(anterior: string): string {
        return ""
    }
}

export class DefStruct {
    nombre: string
    atributos: Map<string, Tipo>

    constructor(nombre: string) {
        this.nombre = nombre
        this.atributos = new Map()
    }
    
    setAtributo(nombre: string, tipo: Tipo) {
        this.atributos.set(nombre, tipo)
    }

    getAtributo(nombre: string): Tipo | undefined {
        return this.atributos.get(nombre)
    }
}

// crear instancia
export class instaStruct extends Instruccion {
    nombreStruct: string
    id: string
    valores?: Instruccion[]

    constructor(nombreStruct: string, id: string, valores: Instruccion[] | undefined, linea: number, columna: number) {
        super(new Tipo(TipoDato.STRUCT), linea, columna)
        this.nombreStruct = nombreStruct
        this.id = id
        this.valores = valores
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const def = arbol.getStruct(this.nombreStruct)
        if(!def) {
            return new Errores("SEMANTICO", `Struct ${this.nombreStruct} no definido`, this.linea, this.columna);
        }

        const atributos = Array.from(def.atributos.entries())
        if (this.valores && this.valores.length !== atributos.length) {
            return new Errores("SEMANTICO", "Cantidad de valores no coincide con los atributos del struct", this.linea, this.columna);
        }

        const instancia = new Map<string, any>()
        for (let i = 0; i < atributos.length; i++) {
            const [nombreAttr, tipoAtrr] = atributos[i]
            let valor = null
        
            if (this.valores) {
                valor = this.valores[i].interpretar(arbol, tabla)
                if (valor instanceof Errores) {
                    return valor
                }
                if (valor === null || valor.tipoDato === undefined) {
                    return new Errores("SEMANTICO", `Valor inválido en atributo ${nombreAttr}`, this.linea, this.columna)
                }
                if (tipoAtrr.getTipo() !== valor.tipoDato.getTipo()) {
                    return new Errores("SEMANTICO", `Tipo incompatible en ${nombreAttr}`, this.linea, this.columna)
                }
                instancia.set(nombreAttr, new Nativo(tipoAtrr, valor.getValor ? valor.getValor() : valor, this.linea, this.columna))
            } else {
                instancia.set(nombreAttr, new Nativo(tipoAtrr, null, this.linea, this.columna))
            }
        }
        const simbolo = new Simbolo(new Tipo(TipoDato.STRUCT), this.id, instancia, this.linea, this.columna)
        const creacion = tabla.setVariable(simbolo)
        if (!creacion) {
            return new Errores("SEMANTICO", `Variable ${this.id} ya existe`, this.linea, this.columna)
        }
        return null
    }
    getAst(anterior: string): string {
        return ""
    }
}

// acceso a atributos
export class acceStruct extends Instruccion {
    idStruct: string
    atributo: string

    constructor(idStruct: string, atributo: string, linea: number, columna: number) {
        super(new Tipo(TipoDato.VOID), linea, columna)
        this.idStruct = idStruct
        this.atributo = atributo
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const simbolo = tabla.getVariable(this.idStruct)
        if (!simbolo) {
            return new Errores("SEMANTICO", `Variable ${this.idStruct} no existe`, this.linea, this.columna)
        }

        const valor = simbolo.getValor()
        if (!(valor instanceof Map)) {
            return new Errores("SEMANTICO", `${this.idStruct} no es un struct`, this.linea, this.columna)
        }

        const atributo = valor.get(this.atributo)
        if (atributo == undefined) {
            return new Errores("SEMANTICO", `El atributo ${this.atributo} no existe en el struct ${this.idStruct}`, this.linea, this.columna)
        }

        this.tipoDato = simbolo.getTipo()
        return atributo
    }

    getAst(anterior: string): string {
        return ""
    }

}

export class AsigStruct extends Instruccion {
    idStruct: string
    atributp: string
    expresion: Instruccion
    
    constructor(idStruct: string, atributp: string, expresion: Instruccion, linea: number, columna: number) {
        super(new Tipo(TipoDato.VOID), linea, columna)
        this.idStruct = idStruct
        this.atributp = atributp
        this.expresion = expresion
    }
    
    interpretar(arbol: Arbol, tabla: TablaSimbolos) {
        const simbolo = tabla.getVariable(this.idStruct)
        if (!simbolo) {
            return new Errores("SEMANTICO", `Variable ${this.idStruct} no existe`, this.linea, this.columna)
        }

        const valor = simbolo.getValor()
        if (!(valor instanceof Map)) {
            return new Errores("SEMANTICO", `${this.idStruct} no es un struct`, this.linea, this.columna)
        }

        const nuevoValor = this.expresion.interpretar(arbol, tabla)
        if (nuevoValor instanceof Errores) {
            return nuevoValor
        }

        if (!valor.has(this.atributp)) {
            return new Errores("SEMANTICO", `El atributo ${this.atributp} no existe en el struct ${this.idStruct}`, this.linea, this.columna)
        }

        valor.set(this.atributp, nuevoValor)
        return null
    }

    getAst(anterior: string): string {
        return ""
    }
    
}