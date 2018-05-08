import { Component, ViewChild } from '@angular/core';
import { NavController, ToastController, App, LoadingController } from 'ionic-angular';
import { AuthService } from '../../providers/auth/auth-service';
import { NgForm } from '@angular/forms';
import { MyServicesProvider } from '../../providers/my-services/my-services';

@Component({
  selector: 'page-resetpassword',
  templateUrl: 'resetpassword.html',
})
export class ResetpasswordPage {

  userEmail: string = '';
  

  @ViewChild('form') form: NgForm;

  constructor(public navCtrl: NavController,
    private toastCtrl: ToastController,
    private authService: AuthService,
    public app: App,
    public loadingCtrl: LoadingController,
    public myServices: MyServicesProvider) {      
  }


resetPassword()
{
  let toast = this.toastCtrl.create({ duration: 3000, position: 'bottom' });

  if (this.form.untouched) { //formulário intocado
    toast.setMessage('Os campos estão vazios.');
    toast.present();
    return;
  }

  this.myServices.showLoading();

  if(this.form.form.valid){
    this.authService.resetPassword(this.userEmail)
    .then(() => {
      toast.setMessage('A solicitação foi enviada para o seu e-mail.');
      toast.present();
      this.myServices.dismissLoading();
      this.app.getRootNav().getActiveChildNav().select(0); //volta pagina de login
    })
    .catch((error: any) => {
      if(error.code == 'auth/invalid email'){
        toast.setMessage('O e-mail digitado não é válido.');
       } else if (error.code == 'auth/user-not-found') {
        toast.setMessage('O usuário não foi encontrado');
       }
       this.myServices.dismissLoading();
       toast.present();       
    });
  }
  
}


}
