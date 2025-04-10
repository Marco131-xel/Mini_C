import { Component, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Errores } from '../errores';
import { Router } from '@angular/router';
import { InterpreteService } from '../interprete/interprete.service';

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
        this.respuesta = this.interpreteService.ejecutarCodigo(this.codeContent);
        this.errores = [];
        console.log("Salida del Interprete: ", this.respuesta);
      } catch (e) {
          this.respuesta = "Error al ejecutar el codigo";
          console.error(e);
      } 
    } else {
      this.respuesta = "No hay codigo para ejecutar";
      console.error(this.respuesta);
    }
  }

  listCaptchas() {
    console.log('Mostrar lista de captchas');
    this.router.navigate(['/lista-captchas']);
  }
}
