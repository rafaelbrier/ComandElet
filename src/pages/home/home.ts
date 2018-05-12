import { Component } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';
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

  displayName: string;
  imgUrl: string;

  constructor(public navCtrl: NavController,
    private authService: AuthService,
    private myServices: MyServicesProvider,    
    private dataService: DatabaseServiceProvider,
    private fireDatabase: AngularFireDatabase,
    public menuCtrl: MenuController ) {

    const authObserver = this.authService.loggedUserInfo().subscribe(user => {
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
            this.imgUrl = resUser.imgUrl;

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

  adminPage() {       
    const authObserver = this.authService.loggedUserInfo()
    .subscribe((res) => {
     const userDataObserver = this.dataService.readDatabase(res.uid)
      .subscribe((userInfo: any) => {  
        authObserver.unsubscribe();
        userDataObserver.unsubscribe();  

         if (userInfo.isAdmin == true)
         {
          let toast = this.myServices.criarToast('Acesso liberado.');
          toast.present();
          this.navCtrl.push(HomeAdminPage, {
            name: userInfo.name,
            imgUrl: ''
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
