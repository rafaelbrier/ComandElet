import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { ResetpasswordPage } from '../resetpassword/resetpassword';

@Component({
  selector: 'login-page',
  templateUrl: 'login.html'  
})
export class LoginPage {

  constructor(public navCtrl: NavController, public loadingCtrl: LoadingController) {
    
  }

  resetPasswordPage()
  {
    this.navCtrl.push(ResetpasswordPage);
  }

  loginViaEmail() {
    console.log('OI');

    let loading = this.loadingCtrl.create({
      content: 'Aguarde...'
    });
    loading.present();

    setTimeout(() => { loading.dismiss() }, 5000);
    
    this.navCtrl.push(HomePage);
  }

}