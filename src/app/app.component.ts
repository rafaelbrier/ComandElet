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
import { finalize } from 'rxjs/operators';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) navCtrl: Nav;

  //para alterar imgPerfil
  taskUpload: AngularFireUploadTask;
  progress: Observable<number>;
  image: string;
  downloadURL: Observable<string>;

  rootPage: any;
  imgUrl: string;
  displayName: string;
  userUid: string;
  userEmail: string;
  currentImg: any;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
    public afAuth: AngularFireAuth, keyboard: Keyboard,
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
                      { imgUrl: 'https://firebasestorage.googleapis.com/v0/b/comanda-eletroni-1525119433359.appspot.com/o/ProfileImages%2FdefaultImg%2Fdefault-avatar.png?alt=media&token=3a02ff5a-0a07-4a16-99e8-be90c8542cf5' })
                      .then(() => {
                        this.removeImg();
                        this.imgUrl = 'https://firebasestorage.googleapis.com/v0/b/comanda-eletroni-1525119433359.appspot.com/o/ProfileImages%2FdefaultImg%2Fdefault-avatar.png?alt=media&token=3a02ff5a-0a07-4a16-99e8-be90c8542cf5';
                      })
                      .catch(() => {
                        let toast = this.myServices.criarToast('Erro ao remover imagem de perfil.');
                        toast.present();
                      });
                    this.myServices.dismissLoading();
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
              this.databaseService.writeDatabase(this.userUid, data)
                .then(() => {
                  this.displayName = data.name;
                  let toast = this.myServices.criarToast('Nome trocado com sucesso.');
                  toast.present();
                })
                .catch(() => {
                  let toast = this.myServices.criarToast('Erro ao trocar nome.');
                  toast.present();
                });
              this.myServices.dismissLoading();
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

    this.taskUpload = fileRef.putString(this.image, 'data_url');
    this.progressIsLoading = true;
    this.progress = this.taskUpload.percentageChanges();

    this.taskUpload.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURL = fileRef.getDownloadURL();
        this.downloadURL.subscribe((URL) => {
          this.databaseService.writeDatabase(this.userUid, { imgUrl: URL })
            .then(() => {
              this.imgUrl = URL;
              let toast = this.myServices.criarToast('Imagem de perfil atualizada com sucesso.');
              toast.present();
              this.progressIsLoading = false;
            })
            .catch(() => {
              let toast = this.myServices.criarToast('Erro ao trocar foto de perfil.');
              toast.present();
              this.progressIsLoading = false;
            });
          this.progressIsLoading = false;
        }, error => {
        })
      })
    ).subscribe(() => {

    }, error => {
      if (error.code == 'storage/canceled') {
        let toast = this.myServices.criarToast('Envio de imagem cancelado.');
        toast.present();
        this.progressIsLoading = false;
      } else {
        let toast = this.myServices.criarToast('Erro ao enviar imagem.');
        toast.present();
        this.progressIsLoading = false;
      }
    });
  }

  uploadHandler(type: string) {
    this.getPhoto(type)
      .then(base64 => {
        this.createUploadTask(base64);
      })
      .catch(() => {
      })
  }

  removeImg() {
    const filePath = '/' + this.userUid + `/profileImg.jpg`;

    const fileRef = this.fireStorage.ref(filePath);
    fileRef.delete()
      .subscribe(() => {
        let toast = this.myServices.criarToast('Imagem de perfil removida com sucesso.');
        toast.present();
      }, error => {
        if (error.code == 'storage/object-not-found') {
          let toast = this.myServices.criarToast('A imagem de perfil já foi removida.');
          toast.present();
        } else {
          let toast = this.myServices.criarToast('Erro ao remover imagem de perfil.');
          toast.present();
        }

      });
  }

  removeFilesUid(file: string) {
    //Deve deletar todos arquivos um por um
    const filePath = '/' + this.userUid + file;

    return this.fireStorage.ref(filePath).delete();
  }


  changePassword() {
    let alert = this.alertCtrl.create({
      title: 'Deseja mesmo trocar sua senha?',
      subTitle: 'Escolha uma senha forte, de preferência com números e letras.',
      message: 'Observação: usuários logados com Facebook ou Google não podem trocar a senha.',
      inputs: [
        {
          name: 'passwordOld',
          placeholder: 'Senha Antiga',
          type: 'password'
        },
        {
          name: 'password',
          placeholder: 'Nova Senha',
          type: 'password'
        },
        {
          name: 'passwordConfirm',
          placeholder: 'Confirmar Nova Senha',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: (data) => {
            this.myServices.showLoading();
            var user = this.afAuth.auth.currentUser;
            this.afAuth.auth.signInWithEmailAndPassword(user.email, data.passwordOld)
              .then(() => {
                let isPasswordValid = this.myServices.validatePassword(data.password, data.passwordConfirm);
                if (isPasswordValid) {
                  user.updatePassword(data.password)
                    .then(() => {
                      this.myServices.dismissLoading();
                      let toast = this.myServices.criarToast('Senha trocada com sucesso.');
                      toast.present();
                    })
                    .catch((error) => {
                      if (error.code == 'auth/requires-recent-login') {
                        this.myServices.dismissLoading();
                        let toast = this.myServices.criarToast('Esta operação requer que o usuário relogue.');
                        toast.present();
                      } else {
                        this.myServices.dismissLoading();
                        let toast = this.myServices.criarToast('Erro ao trocar senha.');
                        toast.present();
                      }
                    });
                } else if (isPasswordValid == false) {
                  this.myServices.dismissLoading();
                  let toast = this.myServices.criarToast('A senha deve ter mais que 6 caracteres.');
                  toast.present();
                } else {
                  this.myServices.dismissLoading();
                  let toast = this.myServices.criarToast('Senhas digitadas diferentes.');
                  toast.present();
                }
              })
              .catch((error) => {
                if (error.code == "auth/wrong-password") {
                  this.myServices.dismissLoading();
                  let toast = this.myServices.criarToast('Senha antiga inválida ou usuário logado com Google ou Facebook.');
                  toast.present();
                } else {
                  this.myServices.dismissLoading();
                  let toast = this.myServices.criarToast('Erro. Não foi possível trocar a senha.');
                  toast.present();
                }
              })
          }
        }
      ]
    });
    alert.present();
  }

  removeAccount() {
    let alert = this.alertCtrl.create({
      title: 'Deseja mesmo excluir sua conta?',
      subTitle: 'Todos os dados e arquivos serão perdidos. Se está de acordo, digite sua senha e aperte Confirmar.',
      message: 'Observação: usuários logados com Facebook ou Google não podem remover a conta.',
      inputs: [
        {
          name: 'password',
          placeholder: 'Password',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: (data) => {
            this.myServices.showLoading();
            var user = this.afAuth.auth.currentUser;
            this.afAuth.auth.signInWithEmailAndPassword(user.email, data.password)
              .then(() => {
                //Deletar dados no Storage, deve-se deletar um por um
                this.removeFilesUid(`/profileImg.jpg`)
                  .subscribe(() => {
                    this.myServices.dismissLoading();
                    let toast = this.myServices.criarToast('Arquivos do usuário removidos com sucesso.');
                    toast.present();
                  }, error => {
                    if (error.code == 'storage/object-not-found') {
                      this.myServices.dismissLoading();
                      let toast = this.myServices.criarToast('Arquivos do usuário removidos com sucesso.');
                      toast.present();
                    } else {
                      this.myServices.dismissLoading();
                      let toast = this.myServices.criarToast('Erro ao remover arquivos do usuário.');
                      toast.present();
                    }
                  });
                //-----------

                //Excluir dados no Database
                this.databaseService.removeDatabase(this.userUid)
                  .then(() => {
                    this.myServices.dismissLoading();
                    let toast = this.myServices.criarToast('Dados do usuário removidos com sucesso.');
                    toast.present();
                  })
                  .catch((error) => {
                    if (error.code == 'auth/requires-recent-login') {
                      this.myServices.dismissLoading();
                      let toast = this.myServices.criarToast('Esta operação requer que o usuário relogue.');
                      toast.present();
                    } else {
                      this.myServices.dismissLoading();
                      let toast = this.myServices.criarToast('Erro ao remover dados do usuário.');
                      toast.present();
                    }
                  });
                //-----------------------

                //Excluir Usuário
                user.delete()
                  .then(() => {
                    this.myServices.dismissLoading();
                    this.navCtrl.setRoot(LoginTabPage);
                    let toast = this.myServices.criarToast('Usuário excluido com sucesso.');
                    toast.present();
                  })
                  .catch((error) => {
                    this.myServices.dismissLoading();
                    let toast = this.myServices.criarToast('Erro ao excluir usuário.');
                    toast.present();
                  });
              })
              .catch((error) => {
                if (error.code == "auth/wrong-password") {
                  this.myServices.dismissLoading();
                  let toast = this.myServices.criarToast('Senha incorreta ou usuário logado com Google ou Facebook.');
                  toast.present();
                } else {
                  this.myServices.dismissLoading();
                  let toast = this.myServices.criarToast('Erro. Não foi possível excluir o usuário.');
                  toast.present();
                }
              })
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
        this.myServices.dismissLoading();
      });
  }
}

