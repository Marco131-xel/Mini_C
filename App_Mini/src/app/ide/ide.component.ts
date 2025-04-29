import { Component, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import  Errores from '../interprete/excepciones/Errores';
import { Router } from '@angular/router';
import { InterpreteService } from '../interprete/interprete.service';
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

  constructor(private cdr: ChangeDetectorRef, private router: Router, private interpreteService: InterpreteService) {}

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
      // 1. Elige la carpeta destino
      const dirHandle = await window.showDirectoryPicker();
  
      // 2. Crea la carpeta del proyecto
      const projectHandle = await dirHandle.getDirectoryHandle(nombreProyecto, { create: true });
  
      // 3. Crea carpeta src
      const srcHandle = await projectHandle.getDirectoryHandle('src', { create: true });
  
      // 4. Crea main.cmm
      const mainFileHandle = await srcHandle.getFileHandle('main.cmm', { create: true });
      const mainWritable = await mainFileHandle.createWritable();
      const codigoInicial = '// Código inicial del archivo main.cmm';
      await mainWritable.write(codigoInicial);
      await mainWritable.close();
  
      // 5. Crea config.yml
      const configFileHandle = await projectHandle.getFileHandle('config.yml', { create: true });
      const configWritable = await configFileHandle.createWritable();
      const yamlContent = '# Configuración del proyecto';
      await configWritable.write(yamlContent);
      await configWritable.close();
  
      // 6. Carga main.cmm en el editor
      const mainFile = await mainFileHandle.getFile();
      const contenidoMain = await mainFile.text();
      this.codeContent = contenidoMain;
  
      // 7. Actualiza línea/columna
      this.updateLineCounter();
      this.updateCursorPosition();
      this.estructuraProyecto = await this.cargarEstructura(projectHandle);
      console.log('Proyecto creado exitosamente.');
  
    } catch (err) {
      console.error('Error al crear el proyecto:', err);
      alert('No se pudo crear el proyecto.');
    }
  }

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

  async abrirArchivo(nodo: NodoArchivo) {
    const fileHandle = nodo.handle as FileSystemFileHandle;
    const file = await fileHandle.getFile();
    const content = await file.text();
    this.codeContent = content;
    this.updateLineCounter();
    this.updateCursorPosition();
  }
  
  async abrirProyecto() {
    try {
      // 1. Pide al usuario que seleccione una carpeta de proyecto
      const dirHandle = await window.showDirectoryPicker();
  
      // 2. Carga la estructura de carpetas y archivos
      this.estructuraProyecto = await this.cargarEstructura(dirHandle);
  
      // 3. Busca automáticamente el archivo 'main.cmm' y lo abre
      const mainFileHandle = await this.buscarArchivo(this.estructuraProyecto, 'main.cmm');
  
      if (mainFileHandle) {
        const file = await mainFileHandle.getFile();
        const content = await file.text();
        this.codeContent = content;
        this.updateLineCounter();
        this.updateCursorPosition();
        console.log('Proyecto abierto exitosamente.');
      } else {
        console.warn('No se encontró el archivo main.cmm en el proyecto.');
        this.codeContent = '';
        this.updateLineCounter();
        this.updateCursorPosition();
      }
    } catch (err) {
      console.error('Error al abrir el proyecto:', err);
      alert('No se pudo abrir el proyecto.');
    }
  }

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
