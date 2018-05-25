import { AlertOptions, NavController } from "ionic-angular";
import { MyServicesProvider } from "../../providers/my-services/my-services";
import { AngularFireAuth } from "angularfire2/auth";
import { DatabaseServiceProvider } from "../../providers/auth/database-service";
import { LoginTabPage } from "../../pages/login-tab/login-tab";
import { AngularFireStorage } from "angularfire2/storage";


export class AlertaExcluirContaService {

  constructor(private myServices: MyServicesProvider,
    private afAuth: AngularFireAuth,
    private databaseService: DatabaseServiceProvider,
    private navCtrl: NavController,
    private userUid: string,
    private fireStorage: AngularFireStorage) {

  }

  createAlertOptions(): AlertOptions {
    let alertOptions = {
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
            this.confirmarHandler(data);
          }
        }
      ]
    }
    return alertOptions;
  }

  confirmarHandler(data) {
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
        this.databaseService.removeDatabaseUser(this.userUid)
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

  removeFilesUid(file: string) {
    //Deve deletar todos arquivos um por um
    const filePath = '/' + this.userUid + file;

    return this.fireStorage.ref(filePath).delete();
  }
}