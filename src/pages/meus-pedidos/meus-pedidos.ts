import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DatabaseServiceProvider } from '../../providers/auth/database-service';
import { MyServicesProvider } from '../../providers/my-services/my-services';


let searchNumber = '';

@Component({
  selector: 'page-meus-pedidos',
  templateUrl: 'meus-pedidos.html',
})
export class MeusPedidosPage {

  gettingPaid: boolean;
  gettingInDebt: boolean;

  pedidosEfetuados: string
  userUid: string
  registroComprasInDebt: any[];
  registroComprasPaid: any[];
  backupPaid: any[];
  backupInDebt: any[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private databaseService: DatabaseServiceProvider,
    private myServices: MyServicesProvider) {
    this.pedidosEfetuados = 'inDebt';
    this.userUid = this.navParams.get("userUid");
  }

  ionViewWillEnter() {
    this.loadInDebt();
    this.loadPaid();
  }

  backupItems() {
    this.backupPaid = this.registroComprasPaid;
    this.backupInDebt = this.registroComprasInDebt;
  }

  restoreItems() {
    this.registroComprasPaid = this.backupPaid;
    this.registroComprasInDebt = this.backupInDebt;
  }

  getItem(ev: any) {
    this.restoreItems();
    console.log(this.registroComprasPaid)
    if (ev)
      searchNumber = ev.target.value;
    else {
      searchNumber = searchNumber;
    }

    if (searchNumber && searchNumber.trim() != '') {
      if (this.registroComprasInDebt) {
        this.registroComprasInDebt = this.registroComprasInDebt.filter((item) => {
          return (item["nome"].match(/\d+/g)[0].toString().toLowerCase().indexOf(searchNumber.toLowerCase()) > -1);
        });
      }
      if (this.registroComprasPaid) {
        this.registroComprasPaid = this.registroComprasPaid.filter((item) => {
          return (item["nome"].match(/\d+/g)[0].toString().toLowerCase().indexOf(searchNumber.toLowerCase()) > -1);
        });
      }
    }
  }

  loadPaid() {
    this.gettingPaid = true;
    var path = 'users/' + this.userUid + '/Lista de Compras/' + '/Pedidos Pagos/';
    this.databaseService.readDatabase(path)
      .subscribe((listCompras) => {
        let registroComprasKeys = Object.keys(listCompras);
        this.registroComprasPaid = registroComprasKeys.map(key => listCompras[key]);
        this.registroComprasPaid.reverse();
        registroComprasKeys.reverse();

        var i = 0;
        this.registroComprasPaid.map(t => t["nome"] = registroComprasKeys[i++]);
        this.backupItems();
        this.gettingPaid = false;
      }, error => {
        let toast = this.myServices.criarToast('Não foi possível acessar o registro de compras.');
        toast.present();
        this.gettingPaid = false;
      });
  }

  loadInDebt() {
    this.gettingInDebt = true;
    var path = 'users/' + this.userUid + '/Lista de Compras/' + '/Pedidos em Debito/';
    this.databaseService.readDatabase(path)
      .subscribe((listCompras) => {
        let registroComprasKeys = Object.keys(listCompras);
        this.registroComprasInDebt = registroComprasKeys.map(key => listCompras[key]);
        this.registroComprasInDebt.reverse();
        registroComprasKeys.reverse();

        var i = 0;
        this.registroComprasInDebt.map(t => t["nome"] = registroComprasKeys[i++]);
        this.backupItems();
        this.gettingInDebt = false;
      }, error => {
        let toast = this.myServices.criarToast('Não foi possível acessar o registro de compras.');
        toast.present();
        this.gettingInDebt = false;
      });
  }
}
