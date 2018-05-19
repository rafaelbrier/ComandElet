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
import { Camera, CameraOptions } from '@ionic-native/camera';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { Observable } from 'rxjs/Observable';
import { finalize, catchError, map } from 'rxjs/operators';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) navCtrl: Nav;

  //para alterar imgPerfil
  task: AngularFireUploadTask;
  progress: Observable<number>;
  image: string;
  downloadURL: Observable<string>;

  rootPage: any;
  imgUrl: string;
  displayName: string;
  userUid: string;
  currentImg: any;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, afAuth: AngularFireAuth, keyboard: Keyboard,
    private databaseService: DatabaseServiceProvider,
    private myServices: MyServicesProvider,
    public menuCtrl: MenuController,
    public events: Events,
    public authService: AuthService,
    public actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    public camera: Camera,
    public fireStorage: AngularFireStorage) {

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
    if (this.userUid != null) {
      const userDataObserver = this.databaseService.readDatabase(this.userUid)
        .subscribe((resUser: any) => {
          this.displayName = resUser.name;
          this.imgUrl = resUser.imgUrl;

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
          text: 'Tirar foto',
          handler: () => {
            this.uploadHandler('picture');
          }
        },
        {
          text: 'Selecionar imagem',
          handler: () => {
            this.uploadHandler('gallery');
          }
        },
        {
          text: 'Remover imagem',
          handler: () => {
            let alert = this.alertCtrl.create({
              title: 'Remover imagem',
              message: 'Deseja mesmo remover a imagem de perfil?',
              buttons: [
                {
                  text: 'Não',
                  role: 'cancel'
                },
                {
                  text: 'Sim',
                  handler: () => {
                    this.myServices.showLoading();
                    this.databaseService.writeDatabase(this.userUid,
                      { imgUrl: 'https://firebasestorage.googleapis.com/v0/b/comanda-eletroni-1525119433359.appspot.com/o/ProfileImages%2FdefaultImg%2Fdefault-avatar.png?alt=media&token=3a02ff5a-0a07-4a16-99e8-be90c8542cf5' });
                    this.myServices.dismissLoading();
                    this.menuCtrl.close();
                    let toast = this.myServices.criarToast('Imagem de perfil removida.');
                    toast.present();
                  }
                }
              ]
            });
            alert.present();
          }
        }, {
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

  getPhoto(type) {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: type == "picture" ? this.camera.PictureSourceType.CAMERA : this.camera.PictureSourceType.PHOTOLIBRARY,
      correctOrientation: true,
      allowEdit: true
    }
    return this.camera.getPicture(options);
  }


  progressIsLoading = false;
  createUploadTask(file: string): void {

    this.image = 'data:image/jpg;base64,' + file;
    const filePath = '/' + this.userUid + `/profileImg.jpg`;

    const fileRef = this.fireStorage.ref(filePath);

    this.task = fileRef.putString(this.image, 'data_url');
    this.progressIsLoading = true;
    this.progress = this.task.percentageChanges();
    this.task.catch(() => {
      let toast = this.myServices.criarToast('Erro ao enviar imagem.');
      toast.present();
      this.progressIsLoading = false;
    }
    );

    this.task.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURL = fileRef.getDownloadURL();

        this.downloadURL.subscribe((URL) => {
          this.databaseService.writeDatabase(this.userUid, { imgUrl: URL });
          this.progressIsLoading = false;
          this.menuCtrl.close();
        }, error => {
          let toast = this.myServices.criarToast('Erro ao enviar imagem.');
          toast.present();
          this.progressIsLoading = false;
        })
      }),
      catchError((err, caught) => {
        let toast = this.myServices.criarToast('Erro ao enviar imagem.');
        toast.present();
        this.progressIsLoading = false;
        return null
      })
    )
    .subscribe(() => {

    }, error => {
      let toast = this.myServices.criarToast('Erro ao enviar imagem.');
      toast.present();
      this.progressIsLoading = false;
    });
  }

  uploadHandler(type: string) {
    this.getPhoto(type)
      .then(base64 => {
        this.createUploadTask(base64);
      })
      .catch(erro => {
        let toast = this.myServices.criarToast('Erro ao enviar imagem.');
        toast.present();
      })
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
        this.myServices.dismissLoading();
      });
  }
}

