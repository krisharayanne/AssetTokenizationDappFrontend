import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { ContractsService } from 'src/app/services/contracts.service';
import { FileUploadService } from 'src/app/services/file-upload.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  individualID:any;
  user:any;
  name:any;
  email:any;
  contactNumber:any;
  walletAddress:any;
  userStatus:any;
  username:any;
  userCredentials:any;
 

  constructor(private tokenStorageService: TokenStorageService, private router: Router, 
    private contractsService: ContractsService, private fileUploadService: FileUploadService) {
      
  }

  async ngOnInit() {
    this.individualID = this.tokenStorageService.getUser();
    if(parseInt(this.individualID) > 0) {
      console.log("User is logged in");
      this.user = await this.contractsService.getUserDetails(this.individualID);
      this.name = this.user.name;
      this.email = this.user.email;
      this.contactNumber = this.user.contactNumber;
      this.walletAddress = this.user.walletAddress;
      if(parseInt(this.user.userStatus) == 0) {
        this.userStatus = "Unverified";
      }
      else if(parseInt(this.user.userStatus) == 1) {
        this.userStatus = "Verified";
      }
      
      this.userCredentials = await this.contractsService.getUserCredentials(this.individualID);
      this.username = this.userCredentials.username;
    }
    else {
      console.log("User must login first");
      this.router.navigate(['Login']);
    }

  }

  



}
