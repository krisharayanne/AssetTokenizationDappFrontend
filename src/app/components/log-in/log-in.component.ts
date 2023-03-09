import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { ContractsService } from 'src/app/services/contracts.service';
const UniqueStringGenerator = require('unique-string-generator');

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css']
})
export class LogInComponent {

  username:string;
  password:string;
  message:any;
  loginRequestID: any;
  passwordHash:any;
  userID:number;

  constructor(private contractsService:ContractsService, private router:Router, private tokenStorageService:TokenStorageService) {
    this.username = "";
    this.password = "";
    this.userID = -1;
  }

  async verifyUser() {
    if(this.username.trim() != "" && this.password.trim() != ""){
    this.message = "Verifying Username and Password!"
    // generate loginRequestID
    this.loginRequestID = UniqueStringGenerator.UniqueStringId();

    // hash password 
    this.passwordHash = await this.contractsService.hashMessage(this.password.trim());

    this.userID = await this.contractsService.login(this.loginRequestID, this.username.trim(), this.passwordHash);   
    if(this.userID > 0) {
      this.message = "Logging into Dashboard!"
      console.log("Valid User");
      this.tokenStorageService.saveUser(this.userID);
      this.router.navigate(['Dashboard']);
    } 
    else {
      this.message = "Incorrect Credentials! Please try again!";
      console.log("Invalid User");
    }
  }
  else {
    this.message = "Please fill in the blanks!"
  
  }
  }

}
