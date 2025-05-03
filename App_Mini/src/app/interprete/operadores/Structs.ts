import { Instruccion } from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import Contador from "../ast/Contador"
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
        const contador = Contador.getInstancia();
        const nodoStruct = `n${contador.get()}`;
        const nodoStructKw = `n${contador.get()}`;
        const nodoId = `n${contador.get()}`;
        const nodoApertura = `n${contador.get()}`;
        const nodoAtributos = `n${contador.get()}`;
        const nodoCierre = `n${contador.get()}`;
    
        let resultado = `${nodoStruct}[label="DEF_STRUCT"];\n`;
        resultado += `${nodoStructKw}[label="struct"];\n`;
        resultado += `${nodoId}[label="${this.nombre}"];\n`;
        resultado += `${nodoApertura}[label="{"];\n`;
        resultado += `${nodoAtributos}[label="ATRIBUTOS"];\n`;
        resultado += `${nodoCierre}[label="}"];\n`;
    
        resultado += `${anterior} -> ${nodoStruct};\n`;
        resultado += `${nodoStruct} -> ${nodoStructKw};\n`;
        resultado += `${nodoStruct} -> ${nodoId};\n`;
        resultado += `${nodoStruct} -> ${nodoApertura};\n`;
        resultado += `${nodoStruct} -> ${nodoAtributos};\n`;
        resultado += `${nodoStruct} -> ${nodoCierre};\n`;
    
        // agregar atributos
        for (const attr of this.atributos) {
            const nodoAttr = `n${contador.get()}`;
            const nodoTipo = `n${contador.get()}`;
            const nodoAttrId = `n${contador.get()}`;
            const nodoPuntoComa = `n${contador.get()}`;
    
            resultado += `${nodoAttr}[label="ATRIBUTO"];\n`;
            resultado += `${nodoTipo}[label="${TipoDato[attr.tipo.getTipo()]}"];\n`;
            resultado += `${nodoAttrId}[label="${attr.id}"];\n`;
            resultado += `${nodoPuntoComa}[label=";"];\n`;
    
            resultado += `${nodoAtributos} -> ${nodoAttr};\n`;
            resultado += `${nodoAttr} -> ${nodoTipo};\n`;
            resultado += `${nodoAttr} -> ${nodoAttrId};\n`;
            resultado += `${nodoAttr} -> ${nodoPuntoComa};\n`;
        }
    
        return resultado;
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
        const contador = Contador.getInstancia();
        const nodoInst = `n${contador.get()}`;
        const nodoStructKw = `n${contador.get()}`;
        const nodoTipo = `n${contador.get()}`;
        const nodoId = `n${contador.get()}`;
        const nodoPuntoComa = `n${contador.get()}`;
    
        let resultado = `${nodoInst}[label="INST_STRUCT"];\n`;
        resultado += `${nodoStructKw}[label="struct"];\n`;
        resultado += `${nodoTipo}[label="${this.nombreStruct}"];\n`;
        resultado += `${nodoId}[label="${this.id}"];\n`;
        resultado += `${nodoPuntoComa}[label=";"];\n`;
    
        resultado += `${anterior} -> ${nodoInst};\n`;
        resultado += `${nodoInst} -> ${nodoStructKw};\n`;
        resultado += `${nodoInst} -> ${nodoTipo};\n`;
        resultado += `${nodoInst} -> ${nodoId};\n`;
    
        if (this.valores && this.valores.length > 0) {
            const nodoIgual = `n${contador.get()}`;
            const nodoApertura = `n${contador.get()}`;
            const nodoValores = `n${contador.get()}`;
            const nodoCierre = `n${contador.get()}`;
    
            resultado += `${nodoIgual}[label="="];\n`;
            resultado += `${nodoApertura}[label="{"];\n`;
            resultado += `${nodoValores}[label="VALORES"];\n`;
            resultado += `${nodoCierre}[label="}"];\n`;
    
            resultado += `${nodoInst} -> ${nodoIgual};\n`;
            resultado += `${nodoInst} -> ${nodoApertura};\n`;
            resultado += `${nodoInst} -> ${nodoValores};\n`;
            resultado += `${nodoInst} -> ${nodoCierre};\n`;
    
            // agregar valores
            for (const valor of this.valores) {
                resultado += valor.getAst(nodoValores);
            }
        }
    
        resultado += `${nodoInst} -> ${nodoPuntoComa};\n`;
    
        return resultado;
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
        const contador = Contador.getInstancia();
        const nodoAcceso = `n${contador.get()}`;
        const nodoVar = `n${contador.get()}`;
        const nodoPunto = `n${contador.get()}`;
        const nodoAttr = `n${contador.get()}`;
        const nodoPuntoComa = `n${contador.get()}`;
    
        let resultado = `${nodoAcceso}[label="ACCESO_STRUCT"];\n`;
        resultado += `${nodoVar}[label="${this.idStruct}"];\n`;
        resultado += `${nodoPunto}[label="."];\n`;
        resultado += `${nodoAttr}[label="${this.atributo}"];\n`;
        resultado += `${nodoPuntoComa}[label=";"];\n`;
    
        resultado += `${anterior} -> ${nodoAcceso};\n`;
        resultado += `${nodoAcceso} -> ${nodoVar};\n`;
        resultado += `${nodoAcceso} -> ${nodoPunto};\n`;
        resultado += `${nodoAcceso} -> ${nodoAttr};\n`;
        resultado += `${nodoAcceso} -> ${nodoPuntoComa};\n`;
    
        return resultado;
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
        const contador = Contador.getInstancia();
        const nodoAsig = `n${contador.get()}`;
        const nodoVar = `n${contador.get()}`;
        const nodoPunto = `n${contador.get()}`;
        const nodoAttr = `n${contador.get()}`;
        const nodoIgual = `n${contador.get()}`;
        const nodoExpr = `n${contador.get()}`;
        const nodoPuntoComa = `n${contador.get()}`;
    
        let resultado = `${nodoAsig}[label="ASIGNACION_STRUCT"];\n`;
        resultado += `${nodoVar}[label="${this.idStruct}"];\n`;
        resultado += `${nodoPunto}[label="."];\n`;
        resultado += `${nodoAttr}[label="${this.atributp}"];\n`;
        resultado += `${nodoIgual}[label="="];\n`;
        resultado += `${nodoExpr}[label="EXPRESION"];\n`;
        resultado += `${nodoPuntoComa}[label=";"];\n`;
    
        resultado += `${anterior} -> ${nodoAsig};\n`;
        resultado += `${nodoAsig} -> ${nodoVar};\n`;
        resultado += `${nodoAsig} -> ${nodoPunto};\n`;
        resultado += `${nodoAsig} -> ${nodoAttr};\n`;
        resultado += `${nodoAsig} -> ${nodoIgual};\n`;
        resultado += `${nodoAsig} -> ${nodoExpr};\n`;
        resultado += `${nodoAsig} -> ${nodoPuntoComa};\n`;
    
        resultado += this.expresion.getAst(nodoExpr);
    
        return resultado;
    }
    
}