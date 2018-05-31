import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DatabaseServiceProvider } from '../../providers/auth/database-service';
import { MyServicesProvider } from '../../providers/my-services/my-services';

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
  registroComprasInDebt: any[];
  registroComprasKeys: any[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private databaseService: DatabaseServiceProvider,
    private myServices: MyServicesProvider) {
    this.pedidosEfetuados = 'inDebt';
    this.userUid = this.navParams.get("userUid");
  }

  ionViewWillEnter() {
    var path = 'users/' + this.userUid + '/Lista de Compras/' + '/Pedidos em Debito/';
    this.databaseService.readDatabase(path)
    .subscribe((listCompras) => {       
      this.registroComprasKeys = Object.keys(listCompras);
      this.registroComprasInDebt =  this.registroComprasKeys.map(key => listCompras[key]); 
      this.registroComprasInDebt.reverse();       
      this.registroComprasKeys.reverse();  
      
      var i = 0;
      this.registroComprasInDebt.map(t => t["nome"] =  this.registroComprasKeys[i++]);    
    }, error => {
      let toast = this.myServices.criarToast('Não foi possível acessar o registro de compras.');
      toast.present();
    });     
  }

}
