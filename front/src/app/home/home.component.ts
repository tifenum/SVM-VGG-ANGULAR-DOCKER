import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { fromEvent, merge, interval } from 'rxjs';
import { map, withLatestFrom, scan } from 'rxjs/operators';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { SharedService } from '../shared.service';
import { HttpClientModule } from '@angular/common/http';
// import { MusicserviceService } from '../musicservice.service';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,FormsModule ,FileUploadComponent,HttpClientModule],
  providers:[SharedService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  loaded = false;
  currentTheme: string = 'light-theme'; // Default theme
  albumArtist: string = 'Grouper';
  albumName: string = 'Grid of Points';
  songTitle: string = 'The Races';
  currentTrack: number = 1;
  totalTracks: number = 7;
  isPlaying: boolean = true;
  currentTime: number = 0;
  songDuration: number = 50; 

  predictionResult: any = null;

  isDropped: boolean =false;

  uploadedFile: File | null = null; 
  audioURL: string | null = null; 
  albumDetails = {
    dark: {
      album: 'Grouper - Grid of Points',
      song: 'The Races',
      art: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/36124/grouper-grid-of-points.jpg',
      position: '01 of 07',
      start: '0:27',
      end: '0:50',
      highlight: '#fdfdfd',
      accent: '#f70040',
      background: '#1d1d1d'
    },
    light: {
      album: 'Frontierer - Orange Mathematics',
      song: 'The Collapse',
      art: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/36124/frontierer-orange-mathematics.jpg',
      accent: '#f78900',
      highlight: '#1d1d1d',
      background: '#fdfdfd',
      position: '03 of 16',
      start: '1:00',
      end: '2:08'
    }
  };

  selectedAlbum = this.albumDetails.dark;

  constructor(private musicservice: SharedService) {}

  ngOnInit() {
    this.loaded = true;
    this.toggleThemes('dark')
    setTimeout(() => {
      document.querySelector('.album')?.classList.add('album--parallax');
    }, 1200);
    this.smoothParallax();
  }

  toggleThemes(theme: 'dark' | 'light') {
    this.selectedAlbum = this.albumDetails[theme];
    document.documentElement.style.setProperty('--highlight', this.selectedAlbum.highlight);
    document.documentElement.style.setProperty('--background', this.selectedAlbum.background);
    document.documentElement.style.setProperty('--accent', this.selectedAlbum.accent);
  }

  smoothParallax() {
    const bodyDims = {
      w: document.body.getBoundingClientRect().width,
      h: document.body.getBoundingClientRect().height
    };

    const limit = { x: 25, y: 25 };

    const lerp = (start: any, end: any) => ({
      x: start.x + (end.x - start.x) * 0.1,
      y: start.y + (end.y - start.y) * 0.1
    });

    const mouseMove$ = fromEvent<MouseEvent>(document.documentElement, 'mousemove').pipe(
      map(event => ({ x: event.clientX, y: event.clientY }))
    );

    const touchMove$ = fromEvent<TouchEvent>(document.documentElement, 'touchmove').pipe(
      map(event => ({
        x: event.touches[0]?.clientX || 0,
        y: event.touches[0]?.clientY || 0
      }))
    );

    const move$ = merge(mouseMove$, touchMove$);

    const animationFrame$ = interval(10);

    const smoothMove$ = animationFrame$.pipe(
      withLatestFrom(move$, (_, move) => move),
      scan(lerp)
    );

    smoothMove$.subscribe(pos => {
      const clamped = {
        x: (pos.x / bodyDims.w) * limit.x - limit.x / 2,
        y: (pos.y / bodyDims.h) * limit.y - limit.y / 2 
      };

      document.documentElement.style.setProperty('--move-y', `${clamped.y}deg`);
      document.documentElement.style.setProperty('--move-x', `${clamped.x}deg`);
    });
  }
  toggleTheme(theme: string): void {
    this.currentTheme = theme === 'dark' ? 'dark-theme' : 'light-theme';
  }
  prevTrack(): void {
    this.currentTrack = this.currentTrack > 1 ? this.currentTrack - 1 : this.totalTracks;
  }
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  seekTrack(): void {
    console.log(`Track position: ${this.currentTime} seconds`);
  }
  nextTrack(): void {
    this.currentTrack = this.currentTrack < this.totalTracks ? this.currentTrack + 1 : 1;
  }
  togglePlay(): void {
    this.isPlaying = !this.isPlaying;
  }




  onFilesDropped(files: File[]): void {
    console.log('Fichiers reçus :', files);
    // this.songTitle=files[0].name;
    this.isDropped=true;
    console.log(this.songTitle);
    this.uploadedFile = files[0];
    this.audioURL = URL.createObjectURL(files[0]);
    // alert(`Vous avez téléchargé ${files.length} fichier(s) :\n` + files.map(f => f.name).join('\n'));
  }

  playAudio(audioPlayer: HTMLAudioElement): void {
    if (audioPlayer.paused) {
      audioPlayer.play(); // Lecture de l'audio si en pause
    } else {
      audioPlayer.pause(); // Met en pause l'audio si en lecture
    }
  }
  

  uploadAndPredict(): void {
    if (this.uploadedFile) {
      this.musicservice.uploadFile(this.uploadedFile).subscribe(
        (response) => {
          this.predictionResult = response; // Stocke le résultat de la requête
          console.log( this.predictionResult);
          this.songTitle=this.predictionResult.predicted_genre;
        },
        (error) => {
          console.error('Erreur lors de l’envoi du fichier :', error);
          alert('Erreur lors de l’envoi du fichier.');
        }
      );
    } else {
      alert('Aucun fichier sélectionné.');
    }
  }
  uploadAndPredict2(): void {
    if (this.uploadedFile) {
      this.musicservice.uploadFile2(this.uploadedFile).subscribe(
        (response) => {
          this.predictionResult = response; // Stocke le résultat de la requête
          console.log( this.predictionResult);
          this.songTitle=this.predictionResult.genre;
        },
        (error) => {
          console.error('Erreur lors de l’envoi du fichier :', error);
          alert('Erreur lors de l’envoi du fichier.');
        }
      );
    } else {
      alert('Aucun fichier sélectionné.');
    }
  }
}