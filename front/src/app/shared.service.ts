import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(private http: HttpClient) { }


    uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file); // Ajoute le fichier au FormData

    return this.http.post('http://127.0.0.1:5000/predict', formData); // Requête POST
  }
  uploadFile2(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file); // Ajoute le fichier au FormData

    return this.http.post('http://127.0.0.1:5001/predict', formData); // Requête POST
  }
}
