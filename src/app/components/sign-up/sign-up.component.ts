import { Component, OnInit } from '@angular/core';
import { ContractsService } from 'src/app/services/contracts.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  name: string;
  username: string;
  password: string;
  passwordHash: any;
  emailAddress: string;
  contactNumber: string;
  walletAddress: any;
  message:any;
  transactionHash:any;
  receipt:any;

  constructor(private contractsService:ContractsService) {
    this.name = "";
    this.username = "";
    this.password = "";
    this.emailAddress = "";
    this.contactNumber = "";
  }

  ngOnInit() {

  }

  async addUser() {
    if(this.name.trim() != "" && this.username.trim() != "" && this.password.trim() != "" && this.emailAddress.trim() && this.contactNumber.trim()) {
    this.message = "Adding your profile to the blockchain! Please wait for transaction hash!"
    // hash password 
    this.passwordHash = await this.contractsService.hashMessage(this.password.trim());

    // generate wallet
    this.walletAddress = await this.contractsService.generateWallet();

    // add User
   this.receipt = await this.contractsService.signUp(this.name.trim(), this.username.trim(), this.passwordHash, this.emailAddress.trim(),
    this.contactNumber.trim(), this.walletAddress);
    this.transactionHash = "https://mumbai.polygonscan.com/tx/" + this.receipt.transactionHash.toString();
   }
   else {
    this.message = "Please fill in the blanks!";
   }
  }



}
