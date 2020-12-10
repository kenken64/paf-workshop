import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'day24';
  @ViewChild('imageFile') imageFile: ElementRef;
  apiUrl = "http://localhost:3000";

  form = new FormGroup({
    'image-file': new FormControl("", Validators.required),
    note: new FormControl("", Validators.required),
    uploader: new FormControl("", Validators.required),
  });

  uploadImg:any;

  constructor(private http: HttpClient){
  }

  ngOnInit(){

  }

  upload(){
    const formData = new FormData();
    formData.set('uploader', this.form.get('uploader').value);
    formData.set('note', this.form.get('note').value);
    formData.set('upload', this.imageFile.nativeElement.files[0]);
    this.http.post(`${this.apiUrl}/upload`, formData)
      .toPromise()
      .then((result)=>{
        this.uploadImg = result['s3_file_key'];
      }).catch((error)=>{
        console.log(error);
      });
  }
}
