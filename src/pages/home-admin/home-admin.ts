import { Component } from '@angular/core';
import { NavController, NavParams, MenuController } from 'ionic-angular';
import { MyServicesProvider } from '../../providers/my-services/my-services';
import { AuthService } from '../../providers/auth/auth-service';


@Component({
  selector: 'page-home-admin',
  templateUrl: 'home-admin.html',
})
export class HomeAdminPage {

  userUid: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public myServices: MyServicesProvider,
    public authService: AuthService,
    public menuCtrl: MenuController) {

    this.menuCtrl.enable(true, 'myMenu');

    this.userUid = navParams.get("userUid");

  }
}