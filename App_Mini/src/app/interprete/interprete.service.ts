import { Injectable } from '@angular/core';
import { Interpretar } from './Interpretar';

@Injectable({
  providedIn: 'root'
})
export class InterpreteService {
  
  private interpretar = new Interpretar();

  ejecutarCodigo(codigo: string): string {
    return this.interpretar.ejecutar(codigo);
  }
}
