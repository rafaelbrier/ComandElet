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
import { Camera } from '@ionic-native/camera';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { Observable } from 'rxjs/Observable';
import { AlertaExcluirContaService } from '../core/alerta/alerta-excluir-conta';
import { AlertaTrocarSenhaService } from '../core/alerta/alerta-trocar-senha';
import { AlertaTrocarNomeService } from '../core/alerta/alerta-trocar-nome';
import { AlertImagemPerfilService } from '../core/alerta/alerta-imagem-perfil';
import { MeusPedidosPage } from '../pages/meus-pedidos/meus-pedidos';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) navCtrl: Nav;

  gettingImgName: boolean;
  //para alterar imgPerfil
  taskUpload: AngularFireUploadTask;
  progress: Observable<number>;
  image: string;
  downloadURL: Observable<string>;
  isImgUploaded: Boolean;
  progressIsLoading: Boolean;
  profileImgService: AlertImagemPerfilService;

  rootPage: any;
  imgUrl: string;
  displayName: string;
  userUid: string;
  cardSaldo: number;
  userDataObserver: any;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
    private afAuth: AngularFireAuth, keyboard: Keyboard,
    private databaseService: DatabaseServiceProvider,
    private myServices: MyServicesProvider,
    private menuCtrl: MenuController,
    private events: Events,
    private authService: AuthService,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private camera: Camera,
    private fireStorage: AngularFireStorage) {

    this.gettingImgName=true;

    this.events.subscribe('user:logged', (Uid) => {
      this.userUid = Uid;
    });

    setTimeout(() => {
      this.events.unsubscribe('user:logged');
    }, 60000);

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
      this.myServices.showLoading();
    });
  }

  ionViewWillLeave(){   
    this.userDataObserver.unsubscribe();
  }

  menuClosed(){
    this.userDataObserver.unsubscribe();
  }

  menuOpened() {    
      if (this.userUid != null) {
         this.userDataObserver = this.databaseService.readDatabaseUser(this.userUid)
        .subscribe((resUser: any) => {
          this.displayName = resUser.name;
          this.imgUrl = resUser.imgUrl;
          this.gettingImgName = false;

          if(resUser.cardSaldo)
          this.cardSaldo = resUser.cardSaldo;
          else
          this.cardSaldo = 0;             
        }, error => {      
          console.log("aaaaa")   
          let toast = this.myServices.criarToast('Não foi possível acessar o banco de dados.');
          toast.present();
        });
    }
  }

  meusPedidosPage(){
    this.menuCtrl.close();
    this.navCtrl.push(MeusPedidosPage, {userUid: this.userUid});   
  }

  //TROCAR FOTO DE PERFIL ---------------------------------------------------------------------------------------------------------------------
  changeProfileImg() {
    this.progressIsLoading = false;
    this.isImgUploaded = false;

    this.profileImgService = new AlertImagemPerfilService(this.myServices,
      this.databaseService,
      this.fireStorage,
      this.camera,
      this.userUid,
      this.events,
      this.imgUrl);

    this.events.subscribe('user:newimage', (newImgUrl: string, progressFromEvent, progressIsLoadingFromEvent: boolean, isImgUploadedFromEvent: boolean) => {
      this.imgUrl = newImgUrl;
      this.progress = progressFromEvent;
      this.progressIsLoading = progressIsLoadingFromEvent;
      this.isImgUploaded = isImgUploadedFromEvent;
    });

    let actionSheet = this.actionSheetCtrl.create({
      title: 'Trocar imagem de perfil',
      buttons: [
        {
          text: 'Tirar foto',
          handler: () => {
            this.profileImgService.uploadHandler('picture');
            if (this.isImgUploaded == true) {
              this.events.unsubscribe('user:newimage');
            }
          }
        },
        {
          text: 'Selecionar imagem',
          handler: () => {
            this.profileImgService.uploadHandler('gallery');
            if (this.isImgUploaded == true) {
              this.events.unsubscribe('user:newimage');
            }
          }
        },
        {
          text: 'Remover imagem',
          handler: () => {
            let alert = this.alertCtrl.create(this.profileImgService.createRemoveImgAlertOptions());
            alert.present();
            alert.onDidDismiss(() => {
              this.events.unsubscribe('user:newimage');
            })
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.events.unsubscribe('user:newimage');
          }
        }
      ]
    });
    actionSheet.present();
  }

  taskImgUploadCancel() {
    this.profileImgService.taskCancel();
  }
  //TROCAR FOTO DE PERFIL ---------------------------------------------------------------------------------------------------------------------

  //TROCAR NOME ------------------------------------------------------------------------------------------------------------------------------------
  changeName() {
    this.events.subscribe('user:newname', (newName: string) => {
      this.displayName = newName;
    });

    let trocarNomeService = new AlertaTrocarNomeService(this.myServices,
      this.databaseService,
      this.userUid,
      this.displayName,
      this.events);
    let alert = this.alertCtrl.create(trocarNomeService.createAlertOptions());
    alert.present();
    alert.onDidDismiss((data) => {
      this.events.unsubscribe('user:newname');
    });
  }
  //TROCAR NOME ------------------------------------------------------------------------------------------------------------------------------------

  //TROCAR SENHA ------------------------------------------------------------------------------------------------------------------------------------
  changePassword() {
    let alertTrocarSenhaService = new AlertaTrocarSenhaService(this.myServices,
      this.afAuth);
    let alert = this.alertCtrl.create(alertTrocarSenhaService.createAlertOptions());
    alert.present();
  }
  //TROCAR SENHA ------------------------------------------------------------------------------------------------------------------------------------

  //REMOVER CONTA ------------------------------------------------------------------------------------------------------------------------------------
  removeAccount() {
    let alertExcluirContaService = new AlertaExcluirContaService(this.myServices,
      this.afAuth,
      this.databaseService,
      this.navCtrl,
      this.userUid,
      this.fireStorage)
    let alert = this.alertCtrl.create(alertExcluirContaService.createAlertOptions());
    alert.present();
  }
  //REMOVER CONTA ------------------------------------------------------------------------------------------------------------------------------------

  //DESLOGAR ------------------------------------------------------------------------------------------------------------------------------------
  signOut() {
    this.myServices.showLoading();
    this.authService.signOut()
      .then(() => {
        this.userDataObserver.unsubscribe();
        this.navCtrl.setRoot(LoginTabPage);
        this.myServices.dismissLoading();
        this.menuCtrl.close();
      })
      .catch((error) => {
        this.userDataObserver.unsubscribe();
        this.myServices.dismissLoading();
      });
  }
  //DESLOGAR ------------------------------------------------------------------------------------------------------------------------------------

}

