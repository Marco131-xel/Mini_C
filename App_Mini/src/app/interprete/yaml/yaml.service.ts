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
        const items: any[] = [];
  
        for (const item of nodo.parametros || []) {
          items.push({ [item.id]: item.valor });
        }
  
        result[nodo.id] = items;
      }
    }
  
    return result;
  }
  
  convertirObjetoAYaml(obj: any): string {
    let yaml = '';
    
    for (const key in obj) {
      const value = obj[key];
      
      if (typeof value === 'string') {
        yaml += `${key}: "${value}"\n`;
      } 
      else if (Array.isArray(value)) {
        yaml += `${key}:\n`;
        value.forEach(item => {
          const itemKey = Object.keys(item)[0];
          yaml += `  - ${itemKey}: "${item[itemKey]}"\n`;
        });
      }
    }
    
    return yaml.trim();
  }
}