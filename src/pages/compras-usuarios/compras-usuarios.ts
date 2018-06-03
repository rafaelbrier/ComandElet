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

@Component({
  selector: 'page-compras-usuarios',
  templateUrl: 'compras-usuarios.html',
})
export class ComprasUsuariosPage {

  userUid: string;
  findNumberRegex = /\d+/g;
  compras: string;
  nowDay: string
  todayList: any[];
  notTodayList: any[];
  isDeleting: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private dataService: DatabaseServiceProvider,
    private myServices: MyServicesProvider) {
    this.compras = 'EmDebito';
    this.userUid = navParams.get("userUid");
    this.isDeleting = false;
  }

  ionViewWillEnter() {
    this.GetDebtList();
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
                  if (this.todayList)
                    this.todayList = this.todayList.filter(obj => obj["comprasHoje"]["nome"] != confirmedUserInfo.nomePedido);
                  if (this.notTodayList)
                    this.notTodayList = this.notTodayList.filter(obj => obj["comprasHoje"]["nome"] != confirmedUserInfo.nomePedido);

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
          var aux = 0;
          let uidArray = Object.keys(usersList);
          let usersListArray = uidArray.map(key => usersList[key]);
          let listaDeComprasKeys = Object.keys(usersListArray).filter(keys => usersListArray[keys]["Lista de Compras"] != undefined &&
            usersListArray[keys]["Lista de Compras"]["Pedidos em Debito"] != undefined);
          let inDebtList = listaDeComprasKeys.map(keys => usersListArray[keys]["Lista de Compras"]["Pedidos em Debito"]);
          inDebtList.forEach(inDebtListElement => {
            let inDebtElementKeys = Object.keys(inDebtListElement);
            inDebtElementKeys.forEach(element => {
              if (element.match(this.findNumberRegex)[1].toString() == this.nowDay) {
                if (!this.todayList) {
                  this.todayList = [{
                    userUid: uidArray[listaDeComprasKeys[i]],
                    nome: usersListArray[listaDeComprasKeys[i]]["name"],
                    email: usersListArray[listaDeComprasKeys[i]]["email"],
                    comprasHoje: inDebtListElement[element]
                  }]
                } else this.todayList.push({
                  userUid: uidArray[listaDeComprasKeys[i]],
                  nome: usersListArray[listaDeComprasKeys[i]]["name"],
                  email: usersListArray[listaDeComprasKeys[i]]["email"],
                  comprasHoje: inDebtListElement[element]
                });
                this.todayList[aux++]["comprasHoje"]["nome"] = element;
              }
              else {
                if (!this.notTodayList) {
                  this.notTodayList = [{
                    userUid: uidArray[listaDeComprasKeys[i]],
                    nome: usersListArray[listaDeComprasKeys[i]]["name"],
                    email: usersListArray[listaDeComprasKeys[i]]["email"],
                    comprasHoje: inDebtListElement[element]
                  }]
                } else this.notTodayList.push({
                  userUid: uidArray[listaDeComprasKeys[i]],
                  nome: usersListArray[listaDeComprasKeys[i]]["name"],
                  email: usersListArray[listaDeComprasKeys[i]]["email"],
                  comprasHoje: inDebtListElement[element]
                });
                this.notTodayList[aux++]["comprasHoje"]["nome"] = element;
              }
            });
            i++;
          });
          this.myServices.dismissLoading();
        }
      }, error => {
        this.myServices.dismissLoading();
        let toast = this.myServices.criarToast('Não foi possível acessar o banco de dados.');
        toast.present();
      });
  }


}
