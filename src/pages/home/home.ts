import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AuthService } from '../../providers/auth/auth-service';
import { LoginTabPage } from '../login-tab/login-tab';
import { AngularFireAuth } from 'angularfire2/auth';
import { MyServicesProvider } from '../../providers/my-services/my-services';



@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  displayName: string;
  imgUrl: string;

  constructor(public navCtrl: NavController, 
    private authService: AuthService,
    private myServices: MyServicesProvider,
    private afAuth: AngularFireAuth) {

    const authObserver = afAuth.authState.subscribe(user => {
      this.displayName ='';
      this.imgUrl='';

      if (user){
        this.displayName = user.displayName;
        this.imgUrl = user.photoURL;

        authObserver.unsubscribe();
      }
    })
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
