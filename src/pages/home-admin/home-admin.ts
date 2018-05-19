import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
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
      public authService: AuthService) {

    this.userUid = navParams.get("userUid");
    
  }
}