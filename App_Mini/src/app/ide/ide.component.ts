import { Component, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import  Errores from '../interprete/excepciones/Errores';
import { Router } from '@angular/router';
import { InterpreteService } from '../interprete/interprete.service';
import { YamlService } from '../interprete/yaml/yaml.service';
import TablaSimbolos from '../interprete/ast/TablaSimbolos';
import * as Viz from '@viz-js/viz';

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
  imagePreview: string | null = null;
  showImagePreview: boolean = false;


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
      this.archivoSeleccionado = null;
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
  async saveCode() {
    try {
      if (!this.archivoSeleccionado && !this.selectedFile) {
        alert('No hay un archivo seleccionado para guardar');
        return;
      }
      let fileHandle: FileSystemFileHandle | null = null;
      if (this.archivoSeleccionado) {
        fileHandle = this.archivoSeleccionado.handle as FileSystemFileHandle;
      }
      else if (this.selectedFile) {
        alert('Para guardar cambios, por favor usa la función de "Guardar como" o trabaja dentro de un proyecto');
        return;
      }
  
      if (fileHandle) {
        // Crear un FileSystemWritableFileStream para escribir
        const writable = await fileHandle.createWritable();
        await writable.write(this.codeContent);
        await writable.close();
        
        console.log('Archivo guardado exitosamente');
        alert('Cambios guardados exitosamente');
      }
    } catch (err) {
      console.error('Error al guardar el archivo:', err);
      alert('Error al guardar el archivo: ' + err);
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
  async compileCode() {
    if (this.codeContent.trim()) {
      try {
        const resultado = this.interpreteService.ejecutarCodigo(this.codeContent);
        this.terminalOutput = resultado.salida;
        this.errores = resultado.errores;
  
        console.log("Salida:", resultado.salida);
        console.log("Errores:", resultado.errores);
        //console.log("DOT del AST:\n", resultado.astDot);
        await this.saveDotFile(resultado.astDot);
        this.showingTerminal = true;
        this.actualizarTablaSimbolos(resultado.tablaSimbolos)

        if (this.errores && this.errores.length > 0) {
          this.showTab('errores');
        } else {
          this.showTab('salida');
        }
      } catch (e) {
        this.terminalOutput = "Error al ejecutar el codigo";
        this.showingTerminal = true;
        this.showTab('salida');
        console.error(e);
      }
    } else {
      this.terminalOutput = "No hay codigo para ejecutar";
      this.showingTerminal = true;
      this.showTab('salida');
    }
  }

  async saveDotFile(dotContent: string): Promise<void> {
    let baseName = 'ast'; // por defecto

    if (this.selectedFile) {
        baseName = this.selectedFile.name.replace('.cmm', '');
    } 
    else if (this.nodoSeleccionado && this.nodoSeleccionado.nombre.endsWith('.cmm')) {
        baseName = this.nodoSeleccionado.nombre.replace('.cmm', '');
    }
    else if (this.archivoSeleccionado && this.archivoSeleccionado.nombre.endsWith('.cmm')) {
        baseName = this.archivoSeleccionado.nombre.replace('.cmm', '');
    }

    try {
        // guardar archivo DOT
        const dotFilename = `${baseName}.dot`;
        if (this.proyectoHandle) {
            const dotHandle = await this.proyectoHandle.getFileHandle(dotFilename, { create: true });
            const writable = await dotHandle.createWritable();
            await writable.write(dotContent);
            await writable.close();
        } else {
            this.downloadFile(dotFilename, dotContent);
        }
        // convertir y guardar PNG
        const pngBlob = await this.dotToPng(dotContent);
        const pngFilename = `${baseName}.png`;
        
        if (this.proyectoHandle) {
            const pngHandle = await this.proyectoHandle.getFileHandle(pngFilename, { create: true });
            const writable = await pngHandle.createWritable();
            await writable.write(pngBlob);
            await writable.close();
            await this.actualizarEstructuraProyecto();
        } else {
            const pngUrl = URL.createObjectURL(pngBlob);
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = pngFilename;
            a.click();
            URL.revokeObjectURL(pngUrl);
        }
        
    } catch (error) {
        console.error('Error al guardar archivos:', error);
    }
  }
  // funcion para convetir dot a png
  async dotToPng(dotContent: string): Promise<Blob> {
    try {
      const viz = await Viz.instance();
      const svg = viz.renderSVGElement(dotContent);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      const img = new Image();
      const svgStr = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgStr], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
  
      return new Promise((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("No se pudo generar PNG"));
          }, 'image/png');
          
          URL.revokeObjectURL(url);
        };
  
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Error al cargar SVG"));
        };
  
        img.src = url;
      });
    } catch (error) {
      console.error("Error al convertir DOT a PNG:", error);
      throw error;
    }
  }

  async actualizarEstructuraProyecto(): Promise<void> {
    if (this.proyectoHandle) {
        this.estructuraProyecto = await this.cargarEstructura(this.proyectoHandle);
        this.cdr.detectChanges();
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
    this.archivoSeleccionado = nodo;
    const fileHandle = nodo.handle as FileSystemFileHandle;
    const file = await fileHandle.getFile();
    
    if (nodo.nombre.endsWith('.png')) {
        // Es una imagen PNG
        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.imagePreview = e.target.result;
            this.showImagePreview = true;
            this.codeContent = ''; // Limpiar el editor de texto
        };
        reader.readAsDataURL(file);
    } else {
        // Es un archivo de texto
        this.showImagePreview = false;
        const content = await file.text();
        this.codeContent = content;
    }
    
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
    if (!this.proyectoHandle) return false;
  
    try {
      const configHandle = await this.proyectoHandle.getFileHandle('config.yml');
      const file = await configHandle.getFile();
      const contenido = await file.text();
      const ast = this.yamlService.ejecutar(contenido);
      const estructura = this.yamlService.convertirASTaObjeto(ast);
  
      const partes = rutaJerarquica.split(',').map(p => p.trim());
      // carpeta
      if (partes.length === 1) {
        return estructura[partes[0]] !== undefined;
      }
      // archivo
      if (partes.length === 2) {
        const [modulo, archivo] = partes;
        return estructura[modulo]?.some((item: any) => item[archivo] !== undefined) ?? false;
      }
      return false;
    } catch (e) {
      console.error("Error al validar ruta:", e);
      return false;
    }
  }
  
  async actualizarConfigYml(modificacion: (configObj: any) => void) {
    if (!this.proyectoHandle) return;
  
    try {
      const configHandle = await this.proyectoHandle.getFileHandle('config.yml');
      const file = await configHandle.getFile();
      const contenido = await file.text();
      const ast = this.yamlService.ejecutar(contenido);
      const configObj = this.yamlService.convertirASTaObjeto(ast);
      modificacion(configObj);
      const nuevoYaml = this.yamlService.convertirObjetoAYaml(configObj);
      const writable = await configHandle.createWritable();
      await writable.write(nuevoYaml);
      await writable.close();
    } catch (err) {
      console.error("Error al actualizar config.yml", err);
    }
  }
  // funciona agregar carpeta a yml
  async carpetaYml(partes: string[]) {
    await this.actualizarConfigYml((configObj) => {
      for (const parte of partes) {
        if (!configObj[parte]) {
          configObj[parte] = [];
        }
      }
    });
  }
  
  // funcion para agregar archivo a yml
  async archivoYml(partes: string[]) {
    if (partes.length < 2) return;
    const [modulo, archivo] = [partes[0], partes[partes.length - 1]];
  
    await this.actualizarConfigYml((configObj) => {
      if (!configObj[modulo]) {
        configObj[modulo] = [];
      }
      if (!configObj[modulo].some((item: any) => item[archivo])) {
        configObj[modulo].push({ [archivo]: `${archivo}.cmm` });
      }
    });
  }
  
  // funcion para eliminar
  async eliminarElemento() {
    if (!this.proyectoHandle) {
      alert('No hay proyecto abierto');
      return;
    }
  
    const tipo = prompt("¿Que deseas eliminar? Escribe 'carpeta' o 'archivo':")?.toLowerCase();
    if (tipo !== 'carpeta' && tipo !== 'archivo') return;
  
    const entrada = prompt("Ingresa la ruta jerarquica (ej: modulo, archivo):");
    if (!entrada) return;
  
    const partes = entrada.split(',').map(p => p.trim());
    if (partes.length === 0) return;
  
    try {
      const existe = await this.validarRutaExiste(entrada);
      if (!existe) {
        alert(`La ruta "${entrada}" no existe en el proyecto.`);
        return;
      }
      await this.eliminarDelSistema(partes, tipo);
      await this.eliminarDeConfigYml(partes, tipo);
  
      this.estructuraProyecto = await this.cargarEstructura(this.proyectoHandle);
      console.log(`${tipo} eliminado exitosamente`);
    } catch (err) {
      console.error(`Error al eliminar ${tipo}:`, err);
      alert(`No se pudo eliminar el ${tipo}`);
    }
  }

  async eliminarDelSistema(partes: string[], tipo: 'carpeta' | 'archivo') {
    let handle = this.proyectoHandle!;
    const nombreFinal = partes[partes.length - 1];
  
    for (let i = 0; i < partes.length - 1; i++) {
      handle = await handle.getDirectoryHandle(partes[i]);
    }
  
    if (tipo === 'carpeta') {
      await handle.removeEntry(nombreFinal, { recursive: true });
    } else {
      await handle.removeEntry(`${nombreFinal}.cmm`);
    }
  }

  async eliminarDeConfigYml(partes: string[], tipo: 'carpeta' | 'archivo') {
    await this.actualizarConfigYml((configObj) => {
      if (tipo === 'carpeta') {
        delete configObj[partes[0]];
      } else {
        const [modulo, archivo] = partes;
        if (configObj[modulo]) {
          configObj[modulo] = configObj[modulo].filter(
            (item: any) => !item[archivo]
          );
        }
      }
    });
  }

  toggleTerminal() {
    this.showingTerminal = !this.showingTerminal;
  }

  showHelp() {
    this.currentTab = 'salida';
    this.terminalOutput = `
  ==== AYUDA DEL SISTEMA ====
  
  🎯 Funciones principales:
  - 📂 Abrir: Carga un proyecto desde tu sistema de archivos.
  - 📁 Crear: Crea un nuevo proyecto con estructura de carpetas y archivos.
  - 💾 Guardar: Guarda el contenido actual del editor.
  - 🧪 Compilar: Ejecuta el compilador e interpreta el codigo Mini C.
  - 🖥️ Terminal: Muestra la salida del compilador, errores y tabla de simbolos.
  - 🛠️ Yaml: Visualiza el archivo config.yml del proyecto.
  - 📊 Reportes: Muestra reportes generados (como AST en formato PNG).
  - ❓ Ayuda: Muestra esta guía.
  
  📝 Editor:
  - Escribe tu codigo en el area central.
  - La linea y columna del cursor se muestran arriba a la derecha.
  
  📈 Imágenes PNG:
  - Al hacer clic sobre un archivo .png se abre una vista ampliada.
  - Puedes hacer zoom con la rueda del mouse.
  - Puedes arrastrar la imagen manteniendo clic izquierdo.
  
  ¡Gracias por usar Mini C!
  `;
  }
  

  cerrarImagen() {
    this.showImagePreview = false;
  }

  zoom = 1;
  translateX = 0;
  translateY = 0;
  dragging = false;
  lastX = 0;
  lastY = 0;
  
  onZoom(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    this.zoom = Math.min(Math.max(this.zoom + delta, 0.1), 5);
  }
  
  startDragging(event: MouseEvent) {
    this.dragging = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }
  
  onDragging(event: MouseEvent) {
    if (!this.dragging) return;
    this.translateX += event.clientX - this.lastX;
    this.translateY += event.clientY - this.lastY;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }
  
  stopDragging() {
    this.dragging = false;
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
