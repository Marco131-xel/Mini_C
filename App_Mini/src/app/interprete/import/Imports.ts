import {Instruccion} from "../abstracto/Instruccion"
import Arbol from "../ast/Arbol"
import TablaSimbolos from "../ast/TablaSimbolos"
import Tipo, {TipoDato} from "../ast/Tipo"
import Errores from "../excepciones/Errores"
import Function from "../funciones/Function"
import LLamada from "../funciones/Llamada"
import { YamlService } from '../yaml/yaml.service'

export default class Imports extends Instruccion {

    interpretar(arbol: Arbol, tabla: TablaSimbolos) {
        return 0
    }

    getAst(anterior: string): string {
        return ""
    }
    
}