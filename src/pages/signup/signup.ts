import { Component, ViewChild } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { User } from '../../providers/auth/users';
import { AuthService } from '../../providers/auth/auth-service';
import { HomePage } from '../home/home';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';

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
    private toastCtrl: ToastController) {

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

  createAccount() {
    if (!this.isSenhasIguais()) { return; }


  }

}
