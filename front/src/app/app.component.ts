import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FileUploadComponent } from './file-upload/file-upload.component'; 
import { HomeComponent } from './home/home.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,FileUploadComponent,HomeComponent,FormsModule,HttpClientModule,
      CommonModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'front';

  onFilesDropped(files: File[]): void {
    console.log('Fichiers reçus :', files);
    alert(`Vous avez téléchargé ${files.length} fichier(s) :\n` + files.map(f => f.name).join('\n'));
  }
}
