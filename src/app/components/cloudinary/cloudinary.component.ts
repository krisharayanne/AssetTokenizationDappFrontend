import { Component } from '@angular/core';
import { empty, Observable } from 'rxjs';
import { CloudinaryAsset } from 'src/app/model/cloudinary-asset';
import { ImageFile } from 'src/app/model/image-file';
import { ImageUploaderService } from 'src/app/services/image-uploader.service';

@Component({
  selector: 'app-cloudinary',
  templateUrl: './cloudinary.component.html',
  styleUrls: ['./cloudinary.component.css']
})
export class CloudinaryComponent {
  imageFiles$: Observable<CloudinaryAsset[]>;

  constructor(private imageUploaderService: ImageUploaderService) {
    
  }

  onDropFiles(imageFiles: ImageFile[]): void {
    this.imageFiles$ = this.imageUploaderService.uploadImages(imageFiles);
    
  }
}
