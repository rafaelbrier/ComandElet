import { Component, ViewChild } from '@angular/core';
import { Platform, Keyboard, MenuController, Events, Nav, ActionSheetController, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginTabPage } from '../pages/login-tab/login-tab';
import { AngularFireAuth } from 'angularfire2/auth';
import { HomePage } from '../pages/home/home';
import { DatabaseServiceProvider } from '../providers/auth/database-service';
import { MyServicesProvider } from '../providers/my-services/my-services';
import { AuthService } from '../providers/auth/auth-service';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) navCtrl: Nav;

  rootPage: any;
  imgUrl: string;
  displayName: string;
  userUid: string;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, afAuth: AngularFireAuth, keyboard: Keyboard,
    private databaseService: DatabaseServiceProvider,
    private myServices: MyServicesProvider,  
    public menuCtrl: MenuController,
    public events: Events,
    public authService: AuthService,
    public actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController) {

    this.events.subscribe('user:logged', (Uid) => {
      this.userUid = Uid;
      this.displayName = '';
      this.imgUrl = '';
    });

    const authObserver = afAuth.authState.subscribe(user => {
      if (user) {
        this.rootPage = HomePage;
        authObserver.unsubscribe();
      } else {
        this.rootPage = LoginTabPage;
        authObserver.unsubscribe();
      }
    });

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.      
      //statusBar.overlaysWebView(false);
      statusBar.backgroundColorByHexString("#d0a61c");
      splashScreen.hide();
    });
  }

  menuOpened() {
    if(this.userUid != null)
    {
    const userDataObserver = this.databaseService.readDatabase(this.userUid)
      .subscribe((resUser: any) => {
        this.displayName = resUser.name;
        this.imgUrl = resUser.imgUrl + '?width=500&height=500';

        userDataObserver.unsubscribe();
      }, error => {
        let toast = this.myServices.criarToast('Não foi possível acessar o banco de dados.');
        toast.present();
      });
    }
  }

  changeProfileImg() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Trocar imagem de perfil',
      buttons: [
        {
          text: 'Selecionar imagem',         
          handler: () => {
           }
        },{
          text: 'Remover imagem',
          handler: () => {
           
          }
        },{
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
           
          }
        }
      ]
    });
    actionSheet.present();
  }

  changeName() {
    let alert = this.alertCtrl.create({
      title: 'Trocar Nome',
      inputs: [
        {
          name: 'name',
          placeholder: 'Novo nome'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'          
        },
        {
          text: 'Trocar nome',
          handler: data => {
            this.myServices.showLoading();
            if (data) {               
              this.databaseService.writeDatabase(this.userUid, data);  
              this.myServices.dismissLoading();   
              this.menuCtrl.close();   
            } else {
              let toast = this.myServices.criarToast('Não foi possível trocar o nome.');
              toast.present();
              this.myServices.dismissLoading(); 
              return false;
            }
          }
        }
      ]
    });
    alert.present();
    
  }
  
  signOut() {
    this.myServices.showLoading();
    this.authService.signOut()
      .then(() => {    
        this.navCtrl.setRoot(LoginTabPage);   
        this.myServices.dismissLoading();
        this.menuCtrl.close();
      })
      .catch((error) => {
        console.error(error);
        this.myServices.dismissLoading();
      });
  }
}

