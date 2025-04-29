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
}