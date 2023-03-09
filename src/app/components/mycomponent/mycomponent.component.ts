import { Component, Injectable, forwardRef } from '@angular/core';
import { PayPalProcessor, OnApprove, OrderRequest, OnApproveData, OnApproveActions } from '@wizdm/paypal';

@Component({
  selector: 'app-mycomponent',
  templateUrl: './mycomponent.component.html',
  styleUrls: ['./mycomponent.component.css'],
  providers: [ { provide: PayPalProcessor, useExisting: forwardRef(() => MycomponentComponent) }]
})
export class MycomponentComponent implements OnApprove {

  public order: OrderRequest = {
    intent: 'CAPTURE', 
    purchase_units: [{
      description: 'Asset Tokenization Fee',
      items: [],
      amount: {
        currency_code: 'USD',
        value: '9.99'
      }
    }]
  };

  // Implements the onApprove hook
  onApprove(data: OnApproveData, actions: OnApproveActions) {
    
    console.log('Transaction Approved:', data);

    // Captures the trasnaction
    return actions.order.capture().then(details => {

      console.log('Transaction completed by', details);

      // Call your server to handle the transaction
      return Promise.reject('Transaction aborted by the server');
    });
  }
}
