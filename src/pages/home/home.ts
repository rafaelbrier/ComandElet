import { Component } from '@angular/core';
import { NavController, MenuController, Events } from 'ionic-angular';
import { AuthService } from '../../providers/auth/auth-service';
import { LoginTabPage } from '../login-tab/login-tab';
import { MyServicesProvider } from '../../providers/my-services/my-services';
import { AngularFireDatabase } from 'angularfire2/database';
import { DatabaseServiceProvider } from '../../providers/auth/database-service';
import { HomeAdminPage } from '../home-admin/home-admin';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  isAdmin: boolean;

  constructor(public navCtrl: NavController,
    private authService: AuthService,
    private myServices: MyServicesProvider,
    private dataService: DatabaseServiceProvider,
    private fireDatabase: AngularFireDatabase,
    public menuCtrl: MenuController,
    public events: Events) {

    const authObserver = this.authService.loggedUserInfo().subscribe(user => {
       this.isAdmin = false;

      if (user != null && user.displayName != null) {       
        this.events.publish('user:logged', user.uid);

        authObserver.unsubscribe();
      } else {
        const userDataObserver = this.fireDatabase.object('users/' + user.uid).valueChanges()
          .subscribe((resUser: any) => {            
            this.isAdmin = resUser.isAdmin;
            this.events.publish('user:logged', user.uid);

            authObserver.unsubscribe();
            userDataObserver.unsubscribe();
          }, error => {
            let toast = this.myServices.criarToast('Não foi possível acessar o banco de dados.');
            toast.present();
          });
      }
    })
  }

  adminPage() { 
    const authObserver = this.authService.loggedUserInfo()
      .subscribe((res) => {
        const userDataObserver = this.dataService.readDatabase(res.uid)
          .subscribe((userInfo: any) => {
            authObserver.unsubscribe();
            userDataObserver.unsubscribe();

            if (userInfo.isAdmin == true) {
              let toast = this.myServices.criarToast('Acesso liberado.');
              toast.present();
              this.navCtrl.push(HomeAdminPage, {
                userUid: userInfo.uid               
              });
            }
            else {
              let toast = this.myServices.criarToast('Você não tem permissão.');
              toast.present();
            }
          }, error => {
            let toast = this.myServices.criarToast('Não foi possível acessar o banco de dados.');
            toast.present();
          });
      }, error => {
        let toast = this.myServices.criarToast('Erro inesperado.');
        toast.present();
      });
  }

}
