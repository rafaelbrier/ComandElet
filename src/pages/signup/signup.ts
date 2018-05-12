import { Component, ViewChild } from '@angular/core';
import { NavController, ToastController, App } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { User } from '../../providers/auth/users';
import { AuthService } from '../../providers/auth/auth-service';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { MyServicesProvider } from '../../providers/my-services/my-services';
import { DatabaseServiceProvider } from '../../providers/auth/database-service';



@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  patternEmail = '^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,3}$';

  user: User = new User();
  @ViewChild('form') form: NgForm;

  confirmSenha: string;

  constructor(public navCtrl: NavController,
    private toastCtrl: ToastController,
    private authService: AuthService,
    public app: App,
    public loadingCtrl: LoadingController,
    public myServices: MyServicesProvider,    
    private firebaseSave: DatabaseServiceProvider) {
      
  }

  ionViewWillEnter() {
    this.form.reset();
  }

  criarToast(mensagem: string) {
    let toast = this.toastCtrl.create({ duration: 3000, position: 'bottom' });
    toast.setMessage(mensagem);
    return toast;
  }

  isSenhasIguais() {
    if (this.user.password != this.confirmSenha) {
      let toast = this.criarToast('Senhas diferentes');
      toast.present();
      return false
    }
    return true;
  }


  notAllFilledForm() {
    var name = this.form.value["nome"];
    var email = this.form.value["email"];
    var password = this.form.value["password"];
    var confirmpassword = this.form.value["confirmpassword"];

    if (name == null || name == "" || email == null || email == "" || password == null || password == ""
      || confirmpassword == null || confirmpassword == "") {
      let toast = this.criarToast('Preencha todos os campos vazios.');
      toast.present();
      return false;
    }

    return true;
  }

  createAccount() {
    let toast = this.toastCtrl.create({ duration: 3000, position: 'bottom' });

    if (this.form.untouched) { //formulário intocado
      toast.setMessage('Os campos estão vazios.');
      toast.present();
      return;
    }
    if (!this.notAllFilledForm()) { return; } //formulário não foi completamente preenchido
    if (!this.isSenhasIguais()) { return; } //senhas diferentes    

    this.myServices.showLoading();

    if (this.form.form.valid) {
      this.authService.createUser(this.user)
        .then((res: any) => {
         
          this.firebaseSave.regNewAuth(this.user, res);         

          res.sendEmailVerification();

          this.myServices.dismissLoading();
          toast.setMessage('Usuário criado com sucesso.');
          toast.present();

          this.app.getRootNav().getActiveChildNav().select(0); //volta pagina de login
        })
        .catch((error: any) => {
          if (error.code == 'auth/email-already-in-use') {
            toast.setMessage('O e-mail digitado já está em uso.');
          } else if (error.code == 'auth/invalid-email') {
            toast.setMessage('O e-mail digitado não é válido.');
          } else if (error.code == 'auth/operation-not-allowed') {
            toast.setMessage('Não está habilitado criar usuários.');
          } else if (error.code == 'auth/weak-password') {
            toast.setMessage('A senha digitada é muito fraca.');
          }
          this.myServices.dismissLoading();
          toast.present();
        });
    }
  }
}
