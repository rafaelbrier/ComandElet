import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { SignupPage } from '../signup/signup';

/**
 * Generated class for the LoginTabPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-login-tab',
  templateUrl: 'login-tab.html',
})
export class LoginTabPage {

  logintab = LoginPage;
  signuptab = SignupPage;

  constructor(public navCtrl: NavController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginTabPage');
  }

}
