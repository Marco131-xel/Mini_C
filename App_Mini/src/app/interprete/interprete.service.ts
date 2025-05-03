import { Injectable } from '@angular/core';
import { Interpretar } from './Interpretar';
import Errores from './excepciones/Errores';
import TablaSimbolos from './ast/TablaSimbolos';

@Injectable({
  providedIn: 'root'
})
export class InterpreteService {
  
  private interpretar = new Interpretar();

  ejecutarCodigo(codigo: string): { salida: string; errores: Errores[]; tablaSimbolos: TablaSimbolos; astDot: string } {
    return this.interpretar.ejecutar(codigo);
  }  
}
