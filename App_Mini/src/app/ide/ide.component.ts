import { Component, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import  Errores from '../interprete/excepciones/Errores';
import { Router } from '@angular/router';
import { InterpreteService } from '../interprete/interprete.service';
import { YamlService } from '../interprete/yaml/yaml.service';
import TablaSimbolos from '../interprete/ast/TablaSimbolos';

declare global {
  interface Window {
    showDirectoryPicker: () => Promise<any>;
  }
}

export interface NodoArchivo {
  nombre: string;
  tipo: 'archivo' | 'carpeta';
  handle: FileSystemFileHandle | FileSystemDirectoryHandle;
  children?: NodoArchivo[];
}

@Component({
  selector: 'app-ide',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './ide.component.html',
  styleUrl: './ide.component.css'
})
export class IdeComponent {
  @ViewChild('codeEditor', { static: true }) codeEditor!: ElementRef;
  @ViewChild('lineCounter', { static: true }) lineCounter!: ElementRef;

  codeContent: string = '';
  selectedFile: File | null = null;
  respuesta: string = '';
  errores: Errores[] = [];
  currentLine: number = 1; 
  currentColumn: number = 1; 
  simbolos: any[] = [];

  showingTerminal: boolean = true;
  terminalOutput: string = '';
  currentTab:string = "salida"
  estructuraProyecto: NodoArchivo | null = null;
  nodoSeleccionado: any = null;

  seleccionarNodo(nodo: any) {
    this.nodoSeleccionado = nodo;
  }
  archivoSeleccionado: any = null;
  proyectoHandle: FileSystemDirectoryHandle | null = null;


  constructor(private cdr: ChangeDetectorRef, private router: Router, private interpreteService: InterpreteService, private yamlService: YamlService) {}

  ngOnInit(): void {
    this.updateLineCounter();
    if (typeof document !== 'undefined') {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.codeContent = e.target.result;
        this.cdr.detectChanges();
        this.updateLineCounter();
      };
      reader.readAsText(file);
    }
  }
  
  // funcion para guardar archivos
  saveCode(): void {
    if(this.selectedFile){
      this.downloadFile(this.selectedFile.name, this.codeContent);
    } else {
      console.log('No hay archivo cargado,"use Guarda como" en su lugar')
    }
  }
  
  // funcion para descargar el archivo
  saveCodeAs(): void {
    const filename = prompt('Por favor, ingrese un nombre para el archivo:',"codigo.cmm");
    if(filename){
      this.downloadFile(filename, this.codeContent);
    }
  }

  private downloadFile(fileName: string, content: string): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  ngAfterViewInit() {
    this.updateLineCounter();
    this.codeEditor.nativeElement.addEventListener('scroll', () => {
        this.lineCounter.nativeElement.scrollTop = this.codeEditor.nativeElement.scrollTop;
    });
    this.codeEditor.nativeElement.addEventListener('input', () => {
        this.updateLineCounter();
        this.updateCursorPosition();
    });
    this.codeEditor.nativeElement.addEventListener('click', () => {
        this.updateCursorPosition();
    });
    this.codeEditor.nativeElement.addEventListener('keydown', () => {
        this.updateCursorPosition();
    });
    this.codeEditor.nativeElement.addEventListener('keyup', () => {
        this.updateCursorPosition();
    });
  }
  
  // actualizar la posicion del cursor
  updateCursorPosition() {
    const cursorPosition = this.codeEditor.nativeElement.selectionStart;
    const lines = this.codeContent.substr(0, cursorPosition).split('\n');
    this.currentLine = lines.length;
    this.currentColumn = lines[lines.length - 1].length + 1; 
  }
  
  // funcion para actualizar el contador de lineas
  updateLineCounter() {
    const lineCount = this.codeContent.split('\n').length;
    const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('<br>');
    this.lineCounter.nativeElement.innerHTML = lineNumbers;
  }
  
  // funcion para compilar codigo
  compileCode() {
    if (this.codeContent.trim()) {
      try {
        const resultado = this.interpreteService.ejecutarCodigo(this.codeContent);
        this.terminalOutput = resultado.salida;
        this.errores = resultado.errores;
  
        console.log("Salida:", resultado.salida);
        console.log("Errores:", resultado.errores);

        this.showingTerminal = true;
        this.actualizarTablaSimbolos(resultado.tablaSimbolos)

        if (this.errores && this.errores.length > 0) {
          this.showTab('errores');
        } else {
          this.showTab('salida');
        }
      } catch (e) {
        this.terminalOutput = "Error al ejecutar el código";
        this.showingTerminal = true;
        this.showTab('salida');
        console.error(e);
      }
    } else {
      this.terminalOutput = "No hay código para ejecutar";
      this.showingTerminal = true;
      this.showTab('salida');
    }
  }

  // funcion para crear proyecto
  async createProyect() {
    const nombreProyecto = prompt('¿Cómo quieres llamar tu proyecto?');
    if (!nombreProyecto) return;
  
    try {
      // carpeta destino
      const dirHandle = await window.showDirectoryPicker();
  
      // crear la carpeta del proyecto
      const projectHandle = await dirHandle.getDirectoryHandle(nombreProyecto, { create: true });
      this.proyectoHandle = projectHandle
      // crear archivos.cmm y agregar contenido
      const mainFileHandle = await projectHandle.getFileHandle('main.cmm', { create: true });
      const mainWritable = await mainFileHandle.createWritable();
      const codigoInicial = '// Código inicial del archivo main.cmm';
      await mainWritable.write(codigoInicial);
      await mainWritable.close();
      // crear config.yml y agregar contenido
      const configFileHandle = await projectHandle.getFileHandle('config.yml', { create: true });
      const configWritable = await configFileHandle.createWritable();
      const yamlContent = `proyecto: "${nombreProyecto}"\nmain: "main.cmm"`;
      await configWritable.write(yamlContent);
      await configWritable.close();

      const mainFile = await mainFileHandle.getFile();
      const contenidoMain = await mainFile.text();
      this.codeContent = contenidoMain;
      this.updateLineCounter();
      this.updateCursorPosition();
      this.estructuraProyecto = await this.cargarEstructura(projectHandle);
      console.log('Proyecto creado exitosamente.');
  
    } catch (err) {
      console.error('Error al crear el proyecto:', err);
      alert('No se pudo crear el proyecto.');
    }
  }  
  // funcion para ver la estructura del arbol archivos
  async cargarEstructura(handle: FileSystemDirectoryHandle): Promise<NodoArchivo> {
    const nodo: NodoArchivo = {
      nombre: handle.name,
      tipo: 'carpeta',
      handle,
      children: [],
    };
  
    for await (const [name, childHandle] of (handle as any).entries()) {
      if (childHandle.kind === 'file') {
        nodo.children?.push({
          nombre: name,
          tipo: 'archivo',
          handle: childHandle,
        });
      } else if (childHandle.kind === 'directory') {
        const childNode = await this.cargarEstructura(childHandle);
        nodo.children?.push(childNode);
      }
    }
  
    return nodo;
  }
  // funcion para abrir proyecto y ver en el editor
  async abrirArchivo(nodo: NodoArchivo) {
    const fileHandle = nodo.handle as FileSystemFileHandle;
    const file = await fileHandle.getFile();
    const content = await file.text();
    this.codeContent = content;
    this.updateLineCounter();
    this.updateCursorPosition();
  }

  // para abrir proyecto
  async abrirProyecto() {
    try {
      const dirHandle = await window.showDirectoryPicker();
      this.proyectoHandle = dirHandle
      this.estructuraProyecto = await this.cargarEstructura(dirHandle);
      const mainFileHandle = await this.buscarArchivo(this.estructuraProyecto, 'main.cmm');
  
      if (mainFileHandle) {
        const file = await mainFileHandle.getFile();
        const content = await file.text();
        this.codeContent = content;
        this.updateLineCounter();
        this.updateCursorPosition();
        console.log('Proyecto abierto exitosamente.');
      } else {
        console.warn('No se encontro el archivo main.cmm en el proyecto');
        this.codeContent = '';
        this.updateLineCounter();
        this.updateCursorPosition();
      }
    } catch (err) {
      console.error('Error al abrir el proyecto:', err);
      alert('No se pudo abrir el proyecto');
    }
  }
  // buscar archivos
  private async buscarArchivo(nodo: NodoArchivo, nombreArchivo: string): Promise<FileSystemFileHandle | null> {
    if (nodo.tipo === 'archivo' && nodo.nombre === nombreArchivo) {
      return nodo.handle as FileSystemFileHandle;
    }
  
    if (nodo.tipo === 'carpeta' && nodo.children) {
      for (const child of nodo.children) {
        const result = await this.buscarArchivo(child, nombreArchivo);
        if (result) {
          return result;
        }
      }
    }
  
    return null;
  }
  // crear carpetas o archivos
  async crearElemento() {
    if (!this.proyectoHandle) {
      alert('No hay proyecto abierto');
      return;
    }
  
    const tipo = prompt("¿Que deseas crear? Escribe 'carpeta' o 'archivo':")?.toLowerCase();
    if (tipo !== 'carpeta' && tipo !== 'archivo') return;
  
    const entrada = prompt("Ingresa la ruta jerarquica (ej: modulo, archivo):");
    if (!entrada) return;
  
    const partes = entrada.split(',').map(p => p.trim());
    if (partes.length === 0) return;
  
    try {
      let handle = this.proyectoHandle;
      const rutaPadre = partes.slice(0, -1);
  
      if (rutaPadre.length > 0) {
        const existe = await this.validarRutaExiste(rutaPadre.join(','));
        if (!existe) {
          alert(`La ruta padre "${rutaPadre.join(',')}" no existe en config.yml.`);
          return;
        }

        for (const parte of rutaPadre) {
          handle = await handle.getDirectoryHandle(parte, { create: true });
        }
      }
  
      const nombreFinal = partes[partes.length - 1];
  
      if (tipo === 'carpeta') {
        await handle.getDirectoryHandle(nombreFinal, { create: true });
        await this.carpetaYml(partes);
      } else {
        const fileHandle = await handle.getFileHandle(`${nombreFinal}.cmm`, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(`// Archivo ${nombreFinal}.cmm`);
        await writable.close();
        await this.archivoYml(partes);
      }
  
      this.estructuraProyecto = await this.cargarEstructura(this.proyectoHandle);
      console.log(`${tipo} creada exitosamente`);
    } catch (err) {
      console.error(`Error al crear ${tipo}:`, err);
      alert(`No se pudo crear el ${tipo}`);
    }
  }
  
  async validarRutaExiste(rutaJerarquica: string): Promise<boolean> {
    if (!this.proyectoHandle) {
      console.error("No hay proyecto abierto.");
      return false;
    }
  
    try {
      const configHandle = await this.proyectoHandle.getFileHandle('config.yml');
      const file = await configHandle.getFile();
      const contenido = await file.text();
  
      const ast = this.yamlService.ejecutar(contenido);
      const estructura = this.yamlService.convertirASTaObjeto(ast);
  
      const partes = rutaJerarquica.split(',').map(p => p.trim());
  
      let actual: any = estructura;
      for (const parte of partes) {
        if (typeof actual === 'object' && actual !== null) {
          if (Array.isArray(actual)) {
            const encontrado = actual.find((item: any) => item && parte in item);
            if (encontrado) {
              actual = encontrado[parte];
            } else {
              return false;
            }
          } else if (parte in actual) {
            actual = actual[parte];
          } else {
            return false;
          }
        } else {
          return false;
        }
      }
  
      return true;
    } catch (e) {
      console.error("Error al validar existencia de ruta:", e);
      return false;
    }
  }
  
  async carpetaYml(partes: string[]) {
    if (!this.proyectoHandle) return;
  
    try {
      const configHandle = await this.proyectoHandle.getFileHandle('config.yml');
      const file = await configHandle.getFile();
      const contenido = await file.text();
      const estructura = this.yamlService.ejecutar(contenido);
  
      const configObj: any = {};
      for (const item of estructura) {
        if (item.tipo === 'llave') {
          configObj[item.id] = item.valor;
        } else if (item.tipo === 'lista') {
          configObj[item.id] = item.parametros || [];
        }
      }
  
      for (const parte of partes) {
        if (!(parte in configObj)) {
          configObj[parte] = [];
        }
      }

      const nuevoYaml = this.generarYamlDesdeObjeto(configObj);
  
      const writable = await configHandle.createWritable();
      await writable.write(nuevoYaml);
      await writable.close();
      console.log("config.yml actualizado con nuevos modulos");
    } catch (err) {
      console.error("Error al agregar modulos a config.yml", err);
    }
  }

  async archivoYml(partes: string[]) {
    if (!this.proyectoHandle) return;
    if (partes.length < 2) return;
  
    const modulo = partes[0];
    const archivo = partes[1];
    const archivoNombre = `${archivo}.cmm`;
  
    try {
      const configHandle = await this.proyectoHandle.getFileHandle('config.yml');
      const file = await configHandle.getFile();
      const contenido = await file.text();
      const estructura = this.yamlService.ejecutar(contenido);
  
      const configObj: any = {};
      for (const item of estructura) {
        if (item.tipo === 'llave') {
          configObj[item.id] = item.valor;
        } else if (item.tipo === 'lista') {
          configObj[item.id] = item.parametros || [];
        }
      }
  
      if (!(modulo in configObj)) {
        configObj[modulo] = [];
      }

      const yaExiste = configObj[modulo].some((entry: any) => typeof entry === 'object' && archivo in entry);
      if (!yaExiste) {
        configObj[modulo].push({ [archivo]: archivoNombre });
      }
  
      const nuevoYaml = this.generarYamlDesdeObjeto(configObj);
      const writable = await configHandle.createWritable();
      await writable.write(nuevoYaml);
      await writable.close();
      console.log("Archivo agregado a config.yml");
    } catch (err) {
      console.error("Error al actualizar config.yml con archivo", err);
    }
  }
  
  generarYamlDesdeObjeto(obj: any): string {
    let yaml = '';
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'string') {
        yaml += `${key}: "${value}"\n`;
      } else if (Array.isArray(value)) {
        yaml += `${key}:\n`;
        for (const item of value) {
          if (typeof item === 'object') {
            const subKey = Object.keys(item)[0];
            const subValue = item[subKey];
            yaml += `  - ${subKey}: "${subValue}"\n`;
          } else {
            yaml += `  - ${item}\n`;
          }
        }
      } else {
        yaml += `${key}: ${JSON.stringify(value)}\n`;
      }
    }
    return yaml.trim();
  }
  
  listCaptchas() {
    console.log('Mostrar lista de captchas');
    this.router.navigate(['/lista-captchas']);
  }

  toggleTerminal() {
    this.showingTerminal = !this.showingTerminal;
  }
  
  showYaml() {
    this.terminalOutput = 'Mostrando YAML...';
  }
  
  showReports() {
    this.terminalOutput = 'Mostrando reportes...';
  }
  
  showHelp() {
    this.terminalOutput = 'Ayuda del sistema...';
  }

  showTab(tab: string) {
    this.currentTab = tab;
  
  }
  
  actualizarTablaSimbolos(tabla: TablaSimbolos) {
    this.simbolos = tabla.getSimbolos().map(s => {
      let valor = s.getValor();
      if (valor instanceof Map) {
        valor = this.formatMap(valor);
      }
      return {
        id: s.getId(),
        tipo: s.getTipo().toString(),
        valor: valor,
        linea: s.getLinea(),
        columna: s.getColumna()
      };
    });
  }
  
  private formatMap(map: Map<any, any>): string {
    let result = "{ "
    for (let [key, value] of map.entries()) {
      result += `${key}: ${value}, `
    }
    result = result.slice(0, -2)
    result += " }"
    return result
  }
  
}
