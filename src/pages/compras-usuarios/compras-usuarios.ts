import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DatabaseServiceProvider } from '../../providers/auth/database-service';
import { MyServicesProvider } from '../../providers/my-services/my-services';

/**
 * Generated class for the ComprasUsuariosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


let searchEmail = '';
let searchNumber = '';

@Component({
  selector: 'page-compras-usuarios',
  templateUrl: 'compras-usuarios.html',
})

export class ComprasUsuariosPage {

  userUid: string;
  findNumberRegex = /\d+/g;
  compras: string;
  nowDay: string
  todayListDebt: any[];
  notTodayListDebt: any[];
  todayListPaid: any[];
  notTodayListPaid: any[];
  isDeleting: boolean;
  isSearching: boolean;

  backupTodayDebt: any[];
  backupNotTodayDebt: any[];
  backupTodayPaid: any[];
  backupNotTodayPaid: any[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private dataService: DatabaseServiceProvider,
    private myServices: MyServicesProvider) {
    this.isSearching = false;
    this.compras = 'EmDebito';
    this.userUid = navParams.get("userUid");
    this.isDeleting = false;
  }

  ionViewWillEnter() {
    this.GetDebtList();
    this.GetPaidList();
  }

  backupItems() {
    this.backupTodayDebt = this.todayListDebt;
    this.backupNotTodayDebt = this.notTodayListDebt;
    this.backupTodayPaid = this.todayListPaid;
    this.backupNotTodayPaid = this.notTodayListPaid;
  }

  restoreItems() {
    this.todayListDebt = this.backupTodayDebt;
    this.notTodayListDebt = this.backupNotTodayDebt;
    this.todayListPaid = this.backupTodayPaid;
    this.notTodayListPaid = this.backupNotTodayPaid;
  }

  getItem(ev: any, number: boolean) {
    this.restoreItems();

    if (ev && !number)
      searchEmail = ev.target.value;
    else if (ev && number)
      searchNumber = ev.target.value;
    else {
      searchNumber = searchNumber;
      searchEmail = searchEmail;
    }

    if (searchEmail && searchEmail.trim() != '') {
      this.isSearching = true;
      if (this.todayListDebt) {
        this.todayListDebt = this.todayListDebt.filter((item) => {
          return ((item.email.toLowerCase().indexOf(searchEmail.toLowerCase()) > -1)
            && (item["comprasHoje"]["nome"].match(this.findNumberRegex)[0].toString().toLowerCase().indexOf(searchNumber.toLowerCase()) > -1))
        });
      }
      if (this.notTodayListDebt) {
        this.notTodayListDebt = this.notTodayListDebt.filter((item) => {
          return ((item.email.toLowerCase().indexOf(searchEmail.toLowerCase()) > -1)
            && (item["comprasHoje"]["nome"].match(this.findNumberRegex)[0].toString().toLowerCase().indexOf(searchNumber.toLowerCase()) > -1));
        });
      }
      if (this.todayListPaid) {
        this.todayListPaid = this.todayListPaid.filter((item) => {
          return ((item.email.toLowerCase().indexOf(searchEmail.toLowerCase()) > -1)
            && (item["comprasHoje"]["nome"].match(this.findNumberRegex)[0].toString().toLowerCase().indexOf(searchNumber.toLowerCase()) > -1));
        });
      }
      if (this.notTodayListPaid) {
        this.notTodayListPaid = this.notTodayListPaid.filter((item) => {
          return ((item.email.toLowerCase().indexOf(searchEmail.toLowerCase()) > -1)
            && (item["comprasHoje"]["nome"].match(this.findNumberRegex)[0].toString().toLowerCase().indexOf(searchNumber.toLowerCase()) > -1));
        });
      }
    } else {
      this.isSearching = false;
    }
  }

  payConfirmed(confirmedUserInfo: any) {
    this.isDeleting = true;
    let pathRead = 'users/' + confirmedUserInfo.userUid + '/Lista de Compras/' + 'Pedidos em Debito/' + confirmedUserInfo.nomePedido;
    let pathWrite = 'users/' + confirmedUserInfo.userUid + '/Lista de Compras/' + 'Pedidos Pagos/' + confirmedUserInfo.nomePedido;

    this.dataService.readDatabase(pathRead)
      .subscribe((res) => {
        if (res) {
          this.dataService.writeDatabase(pathWrite, res)
            .then(() => {
              this.dataService.removeDatabase(pathRead)
                .then(() => {
                  if (this.todayListDebt)
                    this.todayListDebt = this.todayListDebt.filter(obj => obj["comprasHoje"]["nome"] != confirmedUserInfo.nomePedido);
                  if (this.notTodayListDebt)
                    this.notTodayListDebt = this.notTodayListDebt.filter(obj => obj["comprasHoje"]["nome"] != confirmedUserInfo.nomePedido);

                  let toast = this.myServices.criarToast('Pedido #' + confirmedUserInfo.nomePedido + ' movido para a seção "Pago".');
                  toast.present();

                  this.isDeleting = false;
                }).catch((error) => {
                  let toast = this.myServices.criarToast('Não foi possível acessar o banco de dados para remoção.');
                  toast.present();
                });
            }).catch(() => {
              let toast = this.myServices.criarToast('Não foi possível acessar o banco de dados para gravação.');
              toast.present();
            });
        }
      }, error => {
        let toast = this.myServices.criarToast('Não foi possível acessar o banco de dados para leitura.');
        toast.present();
      });
  }


  GetDebtList() {
    this.myServices.showLoading()
    var dataConstruct = new Date;
    this.nowDay = dataConstruct.getDate().toString();

    this.dataService.readDatabase('users/')
      .subscribe((usersList) => {
        if (!this.isDeleting) {
          var i = 0;
          var auxToday = 0;
          var auxNotToday = 0;
          let uidArray = Object.keys(usersList);
          let usersListArray = uidArray.map(key => usersList[key]);
          let listKeyValues = Object.keys(usersListArray).filter(keys => usersListArray[keys]["Lista de Compras"] != undefined &&
            usersListArray[keys]["Lista de Compras"]["Pedidos em Debito"] != undefined);
          let inDebtList = listKeyValues.map(keys => usersListArray[keys]["Lista de Compras"]["Pedidos em Debito"]);
          inDebtList.forEach(inDebtListElement => {
            let inDebtElementKeys = Object.keys(inDebtListElement);
            inDebtElementKeys.forEach(element => {
              if (element.match(this.findNumberRegex)[1].toString() == this.nowDay) {
                if (!this.todayListDebt) {
                  this.todayListDebt = [{
                    userUid: uidArray[listKeyValues[i]],
                    nome: usersListArray[listKeyValues[i]]["name"],
                    email: usersListArray[listKeyValues[i]]["email"],
                    comprasHoje: inDebtListElement[element]
                  }]
                } else this.todayListDebt.push({
                  userUid: uidArray[listKeyValues[i]],
                  nome: usersListArray[listKeyValues[i]]["name"],
                  email: usersListArray[listKeyValues[i]]["email"],
                  comprasHoje: inDebtListElement[element]
                });
                this.todayListDebt[auxToday++]["comprasHoje"]["nome"] = element;
              }
              else {
                if (!this.notTodayListDebt) {
                  this.notTodayListDebt = [{
                    userUid: uidArray[listKeyValues[i]],
                    nome: usersListArray[listKeyValues[i]]["name"],
                    email: usersListArray[listKeyValues[i]]["email"],
                    comprasHoje: inDebtListElement[element]
                  }]
                } else this.notTodayListDebt.push({
                  userUid: uidArray[listKeyValues[i]],
                  nome: usersListArray[listKeyValues[i]]["name"],
                  email: usersListArray[listKeyValues[i]]["email"],
                  comprasHoje: inDebtListElement[element]
                });
                this.notTodayListDebt[auxNotToday++]["comprasHoje"]["nome"] = element;
              }
            });
            i++;
          });
          this.backupItems();
          this.myServices.dismissLoading();
        }
      }, error => {
        this.myServices.dismissLoading();
        let toast = this.myServices.criarToast('Não foi possível acessar o banco de dados.');
        toast.present();
      });
  }

  GetPaidList() {
    this.myServices.showLoading()
    var dataConstruct = new Date;
    this.nowDay = dataConstruct.getDate().toString();
    this.dataService.readDatabase('users/')
      .subscribe((usersList) => {
        if (!this.isDeleting) {
          var i = 0;
          var auxToday = 0;
          var auxNotToday = 0;
          let uidArray = Object.keys(usersList);
          let usersListArray = uidArray.map(key => usersList[key]);
          let listKeyValues = Object.keys(usersListArray).filter(keys => usersListArray[keys]["Lista de Compras"] != undefined &&
            usersListArray[keys]["Lista de Compras"]["Pedidos Pagos"] != undefined);
          let inPaidList = listKeyValues.map(keys => usersListArray[keys]["Lista de Compras"]["Pedidos Pagos"]);
          inPaidList.forEach(inPaidListElement => {
            let inPaidElementKeys = Object.keys(inPaidListElement);
            inPaidElementKeys.forEach(element => {
              if (element.match(this.findNumberRegex)[1].toString() == this.nowDay) {
                if (!this.todayListPaid) {
                  this.todayListPaid = [{
                    userUid: uidArray[listKeyValues[i]],
                    nome: usersListArray[listKeyValues[i]]["name"],
                    email: usersListArray[listKeyValues[i]]["email"],
                    comprasHoje: inPaidListElement[element]
                  }]
                } else this.todayListPaid.push({
                  userUid: uidArray[listKeyValues[i]],
                  nome: usersListArray[listKeyValues[i]]["name"],
                  email: usersListArray[listKeyValues[i]]["email"],
                  comprasHoje: inPaidListElement[element]
                });
                this.todayListPaid[auxToday++]["comprasHoje"]["nome"] = element;
              }
              else {
                if (!this.notTodayListPaid) {
                  this.notTodayListPaid = [{
                    userUid: uidArray[listKeyValues[i]],
                    nome: usersListArray[listKeyValues[i]]["name"],
                    email: usersListArray[listKeyValues[i]]["email"],
                    comprasHoje: inPaidListElement[element]
                  }]
                } else this.notTodayListPaid.push({
                  userUid: uidArray[listKeyValues[i]],
                  nome: usersListArray[listKeyValues[i]]["name"],
                  email: usersListArray[listKeyValues[i]]["email"],
                  comprasHoje: inPaidListElement[element]
                });
                this.notTodayListPaid[auxNotToday++]["comprasHoje"]["nome"] = element;
              }
            });
            i++;
          });
          this.backupItems();
          this.myServices.dismissLoading();
        }
      }, error => {
        this.myServices.dismissLoading();
        let toast = this.myServices.criarToast('Não foi possível acessar o banco de dados.');
        toast.present();
      });
  }

}
