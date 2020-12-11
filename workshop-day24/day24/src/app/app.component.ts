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
  uploadImgArrUrls = [];

  constructor(private http: HttpClient){
  }

  ngOnInit(){

  }

  upload(){
    const formData = new FormData();
    const numberOfFiles = this.imageFile.nativeElement.files.length;
    console.log(numberOfFiles);
    formData.set('uploader', this.form.get('uploader').value);
    formData.set('note', this.form.get('note').value);
    formData.set('uploadcount', numberOfFiles);
    for(let i =0; i < numberOfFiles; i++){
      formData.append('uploads', this.imageFile.nativeElement.files[i]);
    }
    
    if(numberOfFiles > 0 || numberOfFiles <= 10){
      this.http.post(`${this.apiUrl}/upload`, formData)
      .toPromise()
      .then((result)=>{
        console.log(result['s3_file_key']);
        this.uploadImg = result['s3_file_key'];
        this.uploadImg.forEach((element)=>{
          console.log(element);
          this.uploadImgArrUrls.push(element);
        });
      }).catch((error)=>{
        console.log(error);
      });
    }else{
      console.log('Only allow to upload more than 1 file');
      console.log('Only allow to upload max 10 files');
    }
    
  }
}
