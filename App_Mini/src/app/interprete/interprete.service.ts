import { Injectable } from '@angular/core';
import { Interpretar } from './Interpretar';
import Errores from './excepciones/Errores';

@Injectable({
  providedIn: 'root'
})
export class InterpreteService {
  
  private interpretar = new Interpretar();

  ejecutarCodigo(codigo: string): {salida: string, errores: Errores[]} {
    return this.interpretar.ejecutar(codigo);
  }
}
