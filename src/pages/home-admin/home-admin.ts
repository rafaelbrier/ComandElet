import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { MyServicesProvider } from '../../providers/my-services/my-services';
import { AuthService } from '../../providers/auth/auth-service';
import { LoginTabPage } from '../login-tab/login-tab';


@Component({
  selector: 'page-home-admin',
  templateUrl: 'home-admin.html',
})
export class HomeAdminPage {

  displayName: string;
  imgUrl: string;  

  constructor(public navCtrl: NavController,
      public navParams: NavParams,
      public myServices: MyServicesProvider,
      public authService: AuthService) {
      
    this.displayName = navParams.get("name");
    this.imgUrl = navParams.get("imgUrl");
  }


signOut() {
  this.myServices.showLoading();
  this.authService.signOut()
    .then(() => {
      this.navCtrl.setRoot(LoginTabPage);
      this.myServices.dismissLoading()
    })
    .catch((error) => {
      console.error(error);
      this.myServices.dismissLoading()
    });
}
}