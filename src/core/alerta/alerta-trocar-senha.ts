import { AlertOptions } from "ionic-angular";
import { MyServicesProvider } from "../../providers/my-services/my-services";
import { AngularFireAuth } from "angularfire2/auth";

export class AlertaTrocarSenhaService {

  constructor(private myServices: MyServicesProvider,
    private afAuth: AngularFireAuth) {

  }

  createAlertOptions(): AlertOptions {
    let alertOptions = {
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
          let toast = this.myServices.criarToast('A senha deve ter entre 6 a 20 caracteres.');
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