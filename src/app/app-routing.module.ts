import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CloudinaryComponent } from './components/cloudinary/cloudinary.component';
import { ListAssetComponent } from './components/list-asset/list-asset.component';
import { MycomponentComponent } from './components/mycomponent/mycomponent.component';

const routes: Routes = [
  { path: '', redirectTo: 'Home', pathMatch: 'full' },
  { path: 'Home', component: HomeComponent},
  { path: 'SignUp', component: SignUpComponent},
  { path: 'Login', component: LogInComponent},
  { path: 'Dashboard', component: DashboardComponent},
  { path: 'Cloudinary', component: CloudinaryComponent},
  { path: 'ListAsset', component: ListAssetComponent},
  { path: 'PaypalButtonTest', component: MycomponentComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
