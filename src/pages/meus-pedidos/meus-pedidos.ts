import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the MeusPedidosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-meus-pedidos',
  templateUrl: 'meus-pedidos.html',
})
export class MeusPedidosPage {

  pedidosEfetuados: string
  userUid: string

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.pedidosEfetuados = 'inDebt';
    this.userUid = this.navParams.get("userUid");
  }

  ionViewDidLoad() {  
    console.log(this.userUid) 
  }

}
