import { Component, ViewChild, ElementRef, OnInit, Injectable, forwardRef } from '@angular/core';
import { PayPalProcessor, OnApprove, OrderRequest, OnApproveData, OnApproveActions } from '@wizdm/paypal';
import axios from "axios";
import { Router } from '@angular/router';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { ContractsService } from 'src/app/services/contracts.service';
const JWT = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJkYzVlMjc0OS1iM2RjLTQ3NTctYTJkZS00ZTg4YTUyMGVmOGUiLCJlbWFpbCI6ImtyaXNoYS5yYXlhbm5lMTA4QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIxODZhNjA5MjdhYWYzOTkzOGNiZiIsInNjb3BlZEtleVNlY3JldCI6ImIzMDc1MzZjNDVjYjAzZWFiOTkzMWM2NjY1YTExMWRlNzdlMDI5ODlmOTIwODg0MmRmYWZiZjJiOGJlYTk3YzkiLCJpYXQiOjE2Nzc1OTQ3MjR9.pL5jM3QZ5dVFPiHtrr_cOnb-2LqsskqOsvVeGb-gncs`

@Component({
  selector: 'app-list-asset',
  templateUrl: './list-asset.component.html',
  styleUrls: ['./list-asset.component.css'],
  providers: [ { provide: PayPalProcessor, useExisting: forwardRef(() => ListAssetComponent) }]
})
export class ListAssetComponent implements OnInit, OnApprove {
  selectedFile:any;
  assetImageFiles:any;
  assetCategory:any = "";
  assetName:any = "";
  assetDescription:any = "";
  tokenQuantity:any;
  tokenPriceInUSD:any;
  estimatedGasFeeInMATIC:any;
  estimatedGasFeeInUSD:any;
  MATICPriceInUSD:any;
  platformFeeInUSD:any;
  mintingFeeInUSD:any;
  assetValueInUSD:any;
  individualID:any;
  assetTypeUint8Version:any;
  assetType = null;
  assetMetadataCIDHash:any = "";
  ipfsStorageInBytes:any = 0;
  ipfsStorageFeeInUSD:any;
  ipfsStorageFeePerBytePerMonth:any = 0.0000000004;
  assetTokenizationFeeInUSD:any;
  order: OrderRequest;
  showPayPalButton:boolean;
  companyWalletAddress:any;
  companyWalletMATICBalance:any;
  listAssetReceipt:any;
  message:any;
  transactionHash:any;
  assetTypeArray = ['Tangible', 'Intangible'];

  // start paypal payment stuff

  // Implements the onApprove hook
  async onApprove(data: OnApproveData, actions: OnApproveActions) {
    
    console.log('Transaction Approved:', data);

    try { // start try statement
      
    // Captures the transaction
    let details = await actions.order.capture();
      // if res.status 200, i.e. payment successful
      if(details) {
      console.log('Transaction completed by', details);
      
      // check if company wallet has estimated gas fee * 2 to call addAsset function in smart contract
      this.companyWalletAddress = this.contractsService.getCompanyWalletAddress();
      this.companyWalletMATICBalance = await this.contractsService.getWalletMATICBalance(this.companyWalletAddress);

      // upload asset image file to IPFS via Pinata (Authorization: JWT, API Key, Client Secret)
      let assetImagesIPFSHash = [];
      for(let arrayIndex = 0; arrayIndex < this.files.length; arrayIndex++) { // start for loop
      console.log("Attempting to upload: " + this.files[arrayIndex].name + " to Pinata!");
      // the file name is a concatenation of the user's ID and the file arrayIndex or number, the separating token is a semicolon
      let tempFileName = this.assetName + ";" + arrayIndex.toString();
      let pinataFileUploadInfo = await this.uploadFileToPinata(this.files[arrayIndex], tempFileName);
      if(pinataFileUploadInfo) {
        console.log("pinataFileUploadInfo for " + tempFileName + ": " + pinataFileUploadInfo);
        assetImagesIPFSHash.push(pinataFileUploadInfo.IpfsHash);

        // if on final iteration of loop, execute the remaining steps
        if(arrayIndex == this.files.length-1){ // start check if final loop iteration
        // write asset image CID hash, asset name, asset description to asset metadata (json file)
        let assetMetadata = {
          assetImages: assetImagesIPFSHash.toString(),
          assetName: this.assetName.toString(),
          assetDescription: this.assetDescription.toString(),
        };

        let tempMetadataFileName = this.assetName + ";" + "Metadata";
        // upload asset metadata (json file) to IPFS via Pinata (Authorization: JWT, API Key, Client Secret)
        let pinataMetadataFileUploadInfo = await this.uploadJSONToPinata(assetMetadata.assetImages, assetMetadata.assetName, assetMetadata.assetDescription, tempMetadataFileName);
        if(pinataMetadataFileUploadInfo) {
          console.log("pinataMetadataFileUploadInfo for " + this.assetName + ": " + pinataMetadataFileUploadInfo);
          this.assetMetadataCIDHash = pinataMetadataFileUploadInfo.IpfsHash;
          console.log("assetMetadataCIDHash: " + this.assetMetadataCIDHash);
        }

        // call addAsset function in smart contract and pass in asset metadata CID hash
        this.listAssetReceipt = await this.contractsService.listAsset(this.individualID, this.assetTypeUint8Version, this.assetCategory, this.assetMetadataCIDHash,
          parseInt(this.tokenQuantity), parseInt(this.tokenPriceInUSD));

          if (window.confirm('Click ok to view your minted asset tokens on the blockchain!')) {
          window.open("https://mumbai.polygonscan.com/tx/" + this.listAssetReceipt.transactionHash.toString());
          }

        // display transaction hash
        this.setMessageAndTransactionHash(this.listAssetReceipt);
        

      } // end check if final loop iteration

      }
      } // end for loop

      

      }

    } // end try statement
    catch(error) { // start catch statement

      console.log("Error in completing PayPal transaction: " + error);

    } // end catch statement

    // return actions.order.capture().then(details => {
    //   // Call your server to handle the transaction
    //   return Promise.reject('Transaction aborted by the server');
    // });

  }
  // end paypal payment stuff

  constructor(private tokenStorageService: TokenStorageService, private router: Router, 
    private contractsService: ContractsService) {
  }

  ngOnInit() {
    this.showPayPalButton = false;
    this.individualID = this.tokenStorageService.getUser();
    if(parseInt(this.individualID) > 0) {
      console.log("User is logged in");
    }
    else {
      console.log("User must login first");
      this.router.navigate(['Login']);
    }

  }

  setMessageAndTransactionHash(tempReceipt:any) {
    this.message = "Click on the link below to view your minted asset tokens on the blockchain!";
    this.transactionHash = "https://mumbai.polygonscan.com/tx/" + tempReceipt.transactionHash.toString();
  }

changeHandler(event:any) {
  this.selectedFile = event.target.files[0];
}

async handleSubmission() {
  const formData = new FormData();
    
    formData.append('file', this.selectedFile);

    const metadata = JSON.stringify({
      name: 'File name',
    });
    formData.append('pinataMetadata', metadata);
    
    const options = JSON.stringify({
      cidVersion: 0,
    })
    formData.append('pinataOptions', options);

    try{
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: 1000000000000000,
        headers: {
          // 'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: JWT
        }
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.log(error);
    }
}

async uploadFileToPinata(fileObject:any, fileName:any) {
  const formData = new FormData();
    
    formData.append('file', fileObject);

    const metadata = JSON.stringify({
      name: fileName,
    });
    formData.append('pinataMetadata', metadata);
    
    const options = JSON.stringify({
      cidVersion: 0,
    })
    formData.append('pinataOptions', options);

    try{
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: 1000000000000000,
        headers: {
          // 'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: JWT
        }
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.log(error);
    }
}

async uploadJSONToPinata(assetImages:any, assetName:any, assetDescription:any, fileName:any) {
var data = JSON.stringify({
  "pinataOptions": {
    "cidVersion": 1
  },
  "pinataMetadata": {
    "name": fileName,
    "keyvalues": {
      "customKey": "customValue",
      "customKey2": "customValue2"
    }
  },
  "pinataContent": {
    "assetImages": assetImages,
    "assetName": assetName,
    "assetDescription": assetDescription,
  }
});

var config = {
  method: 'post',
  url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
  headers: { 
    'Content-Type': 'application/json', 
    'Authorization': JWT
  },
  data : data
};

const res = await axios(config);

console.log(res.data);
return res.data;
}

@ViewChild("fileDropRef", { static: false }) fileDropEl: ElementRef;
files: any[] = [];

/**
 * on file drop handler
 */
onFileDropped(event:any) {
  this.prepareFilesList(event); 
  console.log("onFileDropped test: ");
  this.assetImageFiles = event.files;
}

/**
 * handle file from browsing
 */
fileBrowseHandler(event:any) {
  this.prepareFilesList(event.target.files);
  console.log("fileBrowseHandler test: ");
  this.assetImageFiles = event.target.files;
}

/**
 * Delete file from files list
 * @param index (File index)
 */
deleteFile(index: number) {
  if (this.files[index].progress < 100) {
    console.log("Upload in progress.");
    return;
  }
  this.files.splice(index, 1);
}

/**
 * Simulate the upload process
 */
uploadFilesSimulator(index: number) {
  setTimeout(() => {
    if (index === this.files.length) {
      return;
    } else {
      const progressInterval = setInterval(() => {
        if (this.files[index].progress === 100) {
          clearInterval(progressInterval);
          this.uploadFilesSimulator(index + 1);
        } else {
          this.files[index].progress += 5;
        }
      }, 200);
    }
  }, 1000);
}

/**
 * Convert Files list to normal array list
 * @param files (Files List)
 */
prepareFilesList(files: Array<any>) {
  for (const item of files) {
    item.progress = 0;
    this.files.push(item);
  }
  for(let arrayIndex = 0; arrayIndex < this.files.length; arrayIndex++) {
    console.log("this.files: " + this.files[arrayIndex].name);
  }
  
  this.fileDropEl.nativeElement.value = "";
  this.uploadFilesSimulator(0);
}

/**
 * format bytes
 * @param bytes (File size in bytes)
 * @param decimals (Decimals point)
 */
formatBytes(bytes:any, decimals = 2) {
  if (bytes === 0) {
    return "0 Bytes";
  }
  const k = 1024;
  const dm = decimals <= 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

async listAsset() {
// estimate gas fee to mint tokens (addAsset function)
if(this.assetType == "Tangible") {
  this.assetTypeUint8Version = 0;
}
else if(this.assetType == "Intangible") {
  this.assetTypeUint8Version = 1;
}
console.log("this.individualID: " + this.individualID);
console.log("this.assetTypeUint8Version: " +  this.assetTypeUint8Version);
console.log("this.assetCategory: " + this.assetCategory);
console.log("this.assetMetadataCIDHash: " + this.assetMetadataCIDHash);
console.log("this.tokenQuantity: " + parseInt(this.tokenQuantity));
console.log("this.tokenPrice: " + parseInt(this.tokenPriceInUSD));
this.estimatedGasFeeInMATIC = await this.contractsService.estimateGasFeeForListAsset(this.individualID, this.assetTypeUint8Version,
  this.assetCategory, this.assetMetadataCIDHash, parseInt(this.tokenQuantity), parseInt(this.tokenPriceInUSD));
  console.log("Estimated Gas Fee in MATIC: " + this.estimatedGasFeeInMATIC);

// use Oracle to convert estimated gas fee from matic token to usd
this.MATICPriceInUSD = await this.contractsService.getMATICPrice();
console.log("MATIC Price in USD: " + this.MATICPriceInUSD);
this.estimatedGasFeeInUSD = this.estimatedGasFeeInMATIC * this.MATICPriceInUSD;

// calculate platform fee = 1% * assetValue (tokenPrice * tokenQuantity) in $USD
this.assetValueInUSD = this.tokenPriceInUSD * this.tokenQuantity;
this.platformFeeInUSD = (1/100) * this.assetValueInUSD;
console.log("Platform Fee: " + this.platformFeeInUSD);

// calculate minting fee = estimated gas fee in $USD
this.mintingFeeInUSD = this.estimatedGasFeeInUSD;
console.log("Minting Fee: " + this.mintingFeeInUSD);

// calculate IPFS storage fee = Pinata price for asset images & asset metadata files storage in $USD
// 1 byte cost 4 * 10 ^ -10 per month

for(let i = 0; i < this.files.length; i++) {
  this.ipfsStorageInBytes += this.files[i].size;
}
console.log("IPFS Storage in Bytes: " + this.ipfsStorageInBytes);
this.ipfsStorageFeeInUSD = this.ipfsStorageInBytes * this.ipfsStorageFeePerBytePerMonth * 12;
console.log("IPFS Storage Fee in USD: " + this.ipfsStorageFeeInUSD);

// asset tokenization fee = platform fee + minting fee + IPFS storage fee ($USD)
this.assetTokenizationFeeInUSD = parseFloat(this.platformFeeInUSD.toFixed(2)) + 
parseFloat(this.mintingFeeInUSD.toFixed(2)) + parseFloat(this.ipfsStorageFeeInUSD.toFixed(2));
console.log("Asset Tokenization Fee in USD: " + this.assetTokenizationFeeInUSD);

// checkout Paypal API, charge asset tokenization fee in USD
this.order = {
  intent: 'CAPTURE', 
  purchase_units: [{
    description: 'Asset Tokenization Fee',
    items: [
      // {
      // name:'Platform Fee',
      // unit_amount:{
      //   currency_code: 'USD',
      //   value: parseFloat(this.platformFeeInUSD.toFixed(2)).toString(),
      // },
      // quantity: '1',
      // },
      // {
      //   name:'Minting Fee',
      //   unit_amount:{
      //     currency_code: 'USD',
      //     value: parseFloat(this.mintingFeeInUSD.toFixed(2)).toString(),
      //   },
      //   quantity: '1',
      //   },
      // {
      //   name:'IPFS Storage Fee',
      //   unit_amount:{
      //     currency_code: 'USD',
      //     value: parseFloat(this.ipfsStorageFeeInUSD.toFixed(2)).toString(),
      //   },
      //   quantity: '1',
      // },
  ],
    amount: {
      currency_code: 'USD',
      value: this.assetTokenizationFeeInUSD,
    }
  }]
};

this.showPayPalButton = true;
}





}
