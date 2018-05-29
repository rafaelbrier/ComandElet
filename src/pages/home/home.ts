import { Component } from '@angular/core';
import { NavController, MenuController, Events, AlertController } from 'ionic-angular';
import { AuthService } from '../../providers/auth/auth-service';
import { MyServicesProvider } from '../../providers/my-services/my-services';
import { DatabaseServiceProvider } from '../../providers/auth/database-service';
import { HomeAdminPage } from '../home-admin/home-admin';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  isAdmin: boolean;
  userUid: string;
  prodComidas: any[];
  prodBebidas: any[];
  productId: number;

  constructor(public navCtrl: NavController,
    private authService: AuthService,
    private myServices: MyServicesProvider,
    private dataService: DatabaseServiceProvider,    
    public menuCtrl: MenuController,
    public events: Events,
    private alertCtrl: AlertController) {

    this.menuCtrl.enable(true, 'myMenu');

    const authObserver = this.authService.loggedUserInfo().subscribe(user => {
      this.isAdmin = false;
      this.userUid = user.uid;

      if (user != null && user.displayName != null) {
        this.events.publish('user:logged', user.uid);

        authObserver.unsubscribe();
      } else {
        const userDataObserver = this.dataService.readDatabaseUser(user.uid)
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

  ionViewWillEnter() {
    let pathComidas = '/produtos/' + 'comida/';
    let pathBebidas = '/produtos/' + 'bebida/';
    this.dataService.readDatabase(pathComidas)
      .subscribe((listComidas) => {
        this.prodComidas = Object.keys(listComidas).map(key => listComidas[key]);
      }, error => {
        let toast = this.myServices.criarToast('Não foi possível acessar o banco de dados das comidas.');
        toast.present();
      });
    this.dataService.readDatabase(pathBebidas)
      .subscribe((listBebidas) => {
        this.prodBebidas = Object.keys(listBebidas).map(key => listBebidas[key]);
      }, error => {
        let toast = this.myServices.criarToast('Não foi possível acessar o banco de dados das bebidas.');
        toast.present();
      });
  }

  adminPage() {
    const authObserver = this.authService.loggedUserInfo()
      .subscribe((res) => {
        const userDataObserver = this.dataService.readDatabaseUser(res.uid)
          .subscribe((userInfo: any) => {
            authObserver.unsubscribe();
            userDataObserver.unsubscribe();

            if (userInfo.isAdmin == true) {
              let toast = this.myServices.criarToast('Acesso liberado.');
              toast.present();
              this.navCtrl.push(HomeAdminPage, {
                userUid: this.userUid
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

 addToCart(emitVars: any){
   
 }
}
