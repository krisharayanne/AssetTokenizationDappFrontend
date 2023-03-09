import { Injectable } from '@angular/core';
import Web3 from 'web3';

declare let require: any;
declare let window: any;

let tokenAbi = require('./tokenContract.json');

@Injectable({
  providedIn: 'root'
})
export class ContractsService {
  private _account: any;
  private _web3: any;

  private _tokenContract: any;
  _tokenContractAddress = '0xB8BD96d0C328dD4422444Fe29649e9Cf0B4f5099';

  constructor() { 
    this._web3 = new Web3("https://rpc-mumbai.maticvigil.com");
    this._tokenContract = new this._web3.eth.Contract(tokenAbi, this._tokenContractAddress);
    this._account = this._web3.eth.accounts.privateKeyToAccount('3386b9cbe2249e40d1d0614c820b804207a930bba1fb2e6ae56a7f239d684af4');
    this._web3.eth.defaultAccount = this._account.address;
    console.log(this._account);
  }

  async getMATICPrice() {
    let latestPriceObject = await this._tokenContract.methods.getLatestPrice().call();
    console.log("Latest Price Object Entries: " + Object.entries(latestPriceObject));
    let values:any;
    values = Object.values(latestPriceObject);
    let MATICPriceInUSD = Number(values[0] / Math.pow(10, values[1])).toFixed(2);
    console.log("MATIC Price in USD: " + MATICPriceInUSD);
    return MATICPriceInUSD;
}

  async hashMessage(message:any) {
     // hash password
     let hashedMessage = await this._web3.eth.accounts.hashMessage(message);
     return hashedMessage;
  }

  async generateWallet() {
    // generate account
    let account = await this._web3.eth.accounts.create();

    // add account to wallet 
    let wallet = await this._web3.eth.accounts.wallet.add(account);  
    console.log("walletAddress: " + wallet.address);
    return wallet.address; 
  }

  
 async getUserDetails(userID:any){
  let user = await this._tokenContract.methods.userIDToUser(userID).call();
  console.log(user);
  return user;
   }

    
 async getUserCredentials(userID:any){
  let userCredentials = await this._tokenContract.methods.userIDToUserCredentials(userID).call();
  console.log(userCredentials);
  return userCredentials;
   }

  async signUp(name:any, username:any, passwordHash:any, email:any, contactNumber:any, walletAddress:any){
    let nonce = await this._web3.eth.getTransactionCount(this._web3.eth.defaultAccount, 'pending');
    let gasPrice = await this._web3.eth.getGasPrice();
    let gasLimit = 6000000;
     
    const tx = this._tokenContract.methods.addUser(name, username, passwordHash, email, contactNumber, walletAddress);
    const gas = await tx.estimateGas({from: this._web3.eth.defaultAccount});
    const data = tx.encodeABI();
    let rawTx = {
      nonce: nonce,
      gas: gas,
      gasPrice: gasPrice,
      gasLimit: gasLimit,
      to: this._tokenContractAddress, 
      from: this._web3.eth.defaultAccount,
      data: data,
  };
  
  let signedTx = await this._web3.eth.accounts.signTransaction(rawTx, '3386b9cbe2249e40d1d0614c820b804207a930bba1fb2e6ae56a7f239d684af4'); // Issue 2
  let receipt = await this._web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  
  console.log(receipt);
  return receipt;
   }

   async estimateGasFeeForListAsset(userID:any, assetType:any, assetCategory:any, assetMetadata:any, tokenQuantity:any,
    tokenPrice:any){
    let nonce = await this._web3.eth.getTransactionCount(this._web3.eth.defaultAccount, 'pending');
    let gasPrice = await this._web3.eth.getGasPrice();
    let gasLimit = 6000000;
     
    const tx = this._tokenContract.methods.addAsset(userID, assetType, assetCategory, assetMetadata, tokenQuantity,
               tokenPrice);
    const gas = await tx.estimateGas({from: this._web3.eth.defaultAccount});
    const data = tx.encodeABI();
    let rawTx = {
      nonce: nonce,
      gas: gas,
      gasPrice: gasPrice,
      gasLimit: gasLimit,
      to: this._tokenContractAddress, 
      from: this._web3.eth.defaultAccount,
      data: data,
  };
  
  
  let gasFeeInWei = gas*gasPrice;
  let gasFeeInMatic = await this._web3.utils.fromWei(gasFeeInWei.toString(), "ether");
  // console.log("Gas fee: " + gasFeeInAvax + " AVAX");
  return gasFeeInMatic;
   }

   async login(loginRequestID:any, username:any, passwordHash:any){
    let nonce = await this._web3.eth.getTransactionCount(this._web3.eth.defaultAccount, 'pending');
    let gasPrice = await this._web3.eth.getGasPrice();
    let gasLimit = 6000000;
     
    const tx = this._tokenContract.methods.verifyUser(loginRequestID, username, passwordHash);
    const gas = await tx.estimateGas({from: this._web3.eth.defaultAccount});
    const data = tx.encodeABI();
    let rawTx = {
      nonce: nonce,
      gas: gas,
      gasPrice: gasPrice,
      gasLimit: gasLimit,
      to: this._tokenContractAddress, 
      from: this._web3.eth.defaultAccount,
      data: data,
  };
  
  let signedTx = await this._web3.eth.accounts.signTransaction(rawTx, '3386b9cbe2249e40d1d0614c820b804207a930bba1fb2e6ae56a7f239d684af4'); // Issue 2
  let receipt = await this._web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  let individualID = await this._tokenContract.methods.loginRequestIDToUserID(loginRequestID).call();
  console.log(individualID);
  return individualID;
   }

}
