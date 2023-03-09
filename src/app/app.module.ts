import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CloudinaryComponent } from './components/cloudinary/cloudinary.component';
import { ImageUploaderDirective } from './directives/image-uploader.directive';
import { ListAssetComponent } from './components/list-asset/list-asset.component';
import { DndDirective } from './directives/dnd.directive';
import { ProgressComponent } from './components/progress/progress.component';
import { NgxPayPalModule } from 'ngx-paypal';
import { PayPalModule } from '@wizdm/paypal';
import { MycomponentComponent } from './components/mycomponent/mycomponent.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SignUpComponent,
    LogInComponent,
    DashboardComponent,
    CloudinaryComponent,
    ImageUploaderDirective,
    ListAssetComponent,
    DndDirective,
    ProgressComponent,
    MycomponentComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgxPayPalModule,
    PayPalModule.init({ 
      clientId: 'AZOp0sjwRgn309yYDRS_GP1sOKsK9BGpuSjZUQfhEkWfxKqXkLiywzqX0YDKHGT0GfgSemVhgkFrHpm1',
      currency: 'USD',
   }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
