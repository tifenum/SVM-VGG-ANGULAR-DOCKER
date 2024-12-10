import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent implements OnInit {
  @Output() filesDropped = new EventEmitter<File[]>(); // Émet les fichiers sélectionnés
  isDragging = false; // Indique si l'utilisateur est en train de glisser un fichier

  constructor() {}

  ngOnInit(): void {}

  onDragOver(event: DragEvent): void {
    event.preventDefault(); // Empêche l'ouverture du fichier par défaut
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer && event.dataTransfer.files) {
      const files = Array.from(event.dataTransfer.files); // Convertit les fichiers en tableau
      this.filesDropped.emit(files); // Émet les fichiers à l'extérieur
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.filesDropped.emit(files);
    }
  }
}