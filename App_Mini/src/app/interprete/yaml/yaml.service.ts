import { Injectable } from '@angular/core';
import { Yaml } from './Yaml';
@Injectable({
    providedIn: 'root'
})
export class YamlService {
    private yaml: Yaml

    constructor() {
        this.yaml = new Yaml()
    }

    ejecutar(entrada: string) {
        return this.yaml.ejecutar(entrada)
    }

    convertirASTaObjeto(ast: any[]): any {
        const result: any = {};
      
        for (const nodo of ast) {
          if (nodo.tipo === 'llave') {
            result[nodo.id] = nodo.valor;
          } else if (nodo.tipo === 'lista') {
            result[nodo.id] = nodo.parametros || [];
          }
        }
      
        return result;
      }      
}