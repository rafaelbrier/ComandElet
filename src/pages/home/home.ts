import { Component } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';
import { AuthService } from '../../providers/auth/auth-service';
import { LoginTabPage } from '../login-tab/login-tab';
import { AngularFireAuth } from 'angularfire2/auth';
import { MyServicesProvider } from '../../providers/my-services/my-services';
import { AngularFireDatabase } from 'angularfire2/database';
import { DatabaseServiceProvider } from '../../providers/auth/database-service';



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
    private afAuth: AngularFireAuth,
    private dataService: DatabaseServiceProvider,
    private fireDatabase: AngularFireDatabase,
    public menuCtrl: MenuController) {

    const authObserver = this.afAuth.authState.subscribe(user => {
      this.displayName = '';
      this.imgUrl = '';

      if (user != null && user.displayName != null) {
        this.displayName = user.displayName;
        this.imgUrl = user.photoURL;

        authObserver.unsubscribe();
      } else {
        const userDataObserver = this.fireDatabase.object('users/' + user.uid).valueChanges()
          .subscribe((resUser: any) => {
            this.displayName = resUser.name;
            this.imgUrl = '';

            authObserver.unsubscribe();
            userDataObserver.unsubscribe();
          }, error => {
            let toast = this.myServices.criarToast('Não foi possível acessar o banco de dados.');
            toast.present();
          });
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

  openMenu() {
    this.menuCtrl.open();
  }

  closeMenu() {
    this.menuCtrl.close();
  }
 
  toggleMenu() {
    this.menuCtrl.toggle();
  }
}
