import { Component, ViewChild } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { ResetpasswordPage } from '../resetpassword/resetpassword';
import { AuthService } from '../../providers/auth/auth-service';
import { NgForm } from '@angular/forms';
import { User } from '../../providers/auth/users';
import { App } from 'ionic-angular/components/app/app';
import { MyServicesProvider } from '../../providers/my-services/my-services';
import { DatabaseServiceProvider } from '../../providers/auth/database-service';


@Component({
  selector: 'login-page',
  templateUrl: 'login.html'
})
export class LoginPage {

  user: User = new User();
  valueforngif = true;

  @ViewChild('form') form: NgForm;

  constructor(public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private authService: AuthService,
    public app: App,
    public myServices: MyServicesProvider,
    private firebaseSave: DatabaseServiceProvider) {   }

  notAllFilledForm() {
    var email = this.form.value["email"];
    var password = this.form.value["password"];

    if (email == null || email == "" || password == null || password == "") {
      let toast = this.myServices.criarToast('Preencha todos os campos vazios.');
      toast.present();
      return false;
    } 
    return true;
  }

  resetPasswordPage() {
    this.navCtrl.push(ResetpasswordPage);
  }

  loginViaEmail() {
    let toast = this.toastCtrl.create({ duration: 3000, position: 'bottom' });

    if (this.form.untouched) { //formulário intocado
      toast.setMessage('Os campos estão vazios.');
      toast.present();
      return;
    }
    if (!this.notAllFilledForm()) { return; } //formulário não foi completamente preenchido

    this.myServices.showLoading();

    if (this.form.form.valid) {
      this.authService.login(this.user)
        .then(() => {
          this.myServices.dismissLoading();
          this.app.getRootNav().setRoot(HomePage);          
        })
        .catch((error) => {
          let toast = this.toastCtrl.create({ duration: 3000, position: 'bottom' });
          if (error.code == 'auth/invalid-email') {
            toast.setMessage('O e-mail digitado não é válido.');
          } else if (error.code == 'auth/user-disabled') {
            toast.setMessage('O usuário está desativado.');
          } else if (error.code == 'auth/user-not-found') {
            toast.setMessage('O usuário não foi encontrado.');
          } else if (error.code == 'auth/wrong-password') {
            toast.setMessage('A senha digitada está incorreta.');
          }
          this.myServices.dismissLoading();
          toast.present();
        });
    }
  }

  loginWithGoogle() {

    this.myServices.showLoading();  

    this.authService.loginWithGoogle()
      .then((res: any) => {         
        this.firebaseSave.regNewAuth(null, res);
        this.app.getRootNav().setRoot(HomePage);
        this.myServices.dismissLoading();
      })
    .catch((error) => {
      this.toastCtrl.create({ duration: 3000, position: 'bottom', message: 'Erro ao efetuar o login.' })
        .present();
      this.myServices.dismissLoading();
    });
  }

  loginWithFacebook() {

    this.myServices.showLoading();

    this.authService.loginWithFacebook()
      .then((res) => {
        this.firebaseSave.regNewAuth(null, res);
        this.app.getRootNav().setRoot(HomePage);
        this.myServices.dismissLoading();
      })
    .catch((error) => {
      this.toastCtrl.create({ duration: 3000, position: 'bottom', message: 'Erro ao efetuar o login.' })
        .present();
      this.myServices.dismissLoading();
    });
  }
}