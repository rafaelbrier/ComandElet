import { Component, ViewChild } from '@angular/core';
import { NavParams, MenuController, Events, AlertController, NavController } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { MyServicesProvider } from '../../providers/my-services/my-services';
import { DatabaseServiceProvider } from '../../providers/auth/database-service';


var pedidosCont: any;
@Component({
  selector: 'page-carrinho',
  templateUrl: 'carrinho.html',
})
export class CarrinhoPage {

  @ViewChild('form') form: NgForm;

  userCartProd: any[];
  userUid: string;
  entregar: boolean;
  IDtoRemove: number[];
  precoTotal: number;
  prodObs: any;

  entregarInfo: {
    nome: string,
    telefone: string,
    endereco: string,
    obs: string
  }

  telPattern = /^[\(]\d{2}[\)]\d{4,5}[\-]\d{4}$/;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private menuCtrl: MenuController,
    private myServices: MyServicesProvider,
    private events: Events,
    private databaseService: DatabaseServiceProvider,
    private alertCtrl: AlertController) {

    this.precoTotal = 0;
    this.userCartProd = navParams.get("userCart");
    this.userUid = navParams.get("userUid");
    this.menuCtrl.enable(true, 'myMenu');
    this.entregarInfo = {
      nome: '',
      telefone: '',
      endereco: '',
      obs: ''
    }

    if (this.userCartProd) {
      this.userCartProd.map((o) => {
        if (!o["quantidade"]) {
          o["quantidade"] = 1;
        }
        if (!o["precobase"]) {
          o["precobase"] = o.preco;
        }
        if (this.myServices.filterInt(o.preco)) {
          this.precoTotal = this.precoTotal + Number.parseInt(o.preco);
        }
      })
    } else { this.precoTotal = 0; }
  }


  ionViewWillEnter() {
    var pathRead = 'users/' + this.userUid + '/pedidosCont';
    this.prodObs = this.databaseService.readDatabase(pathRead)
      .subscribe((res) => {
        if (res == null) {
          pedidosCont = 1;
        } else {
          pedidosCont = res;
        }
      }, error => {
        let toast = this.myServices.criarToast('Não foi possível ler o ID dos produtos.');
        toast.present();
      })
  }

  ionViewDidLeave(){
    this.prodObs.unsubscribe();
  }

  finalizarCompra() {
    if (this.entregar)
      this.finalizarCompraConfirm(true);
    else
      this.finalizarCompraConfirm(false);
  }

  finalizarCompraConfirm(eParaEntregar: boolean) {
    let confirm = this.alertCtrl.create({
      title: 'Deseja mesmo finalizar a compra?',
      message: 'Após finalizar a compra o pagamento deve ser efetuado para a devida baixa no sistema.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Confirmar',
          handler: () => {
            if (eParaEntregar) {
              if (this.AllFilledForm()) {
                this.CompraConfirmada(true);
              } else {
                let toast = this.myServices.criarToast('Preencha as informações de entrega necessárias.');
                toast.present();
              }
            } else {
              this.CompraConfirmada(false);
            }
          }
        }]
    });
    confirm.present();
  }

  CompraConfirmada(eParaEntregar: boolean) {
    var dataToSend;
    if (this.userCartProd && this.userCartProd.length >= 1) {
      var dateNow = new Date();
      var options = { weekday: 'long', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' };
      if (eParaEntregar && this.entregarInfo) {
        dataToSend = { consumo: this.userCartProd, entrega: this.entregarInfo, horaCompra: dateNow.toLocaleString('pt-BR', options), precoTotal: this.precoTotal };
      }
      else {
        dataToSend = { consumo: this.userCartProd, horaCompra: dateNow.toLocaleString('pt-BR', options), precoTotal: this.precoTotal };
      }
      this.myServices.showLoading();
      var pathWrite = 'users/' + this.userUid + '/Lista de Compras/' + '/Pedidos em Debito/' + pedidosCont + ' - ' + dateNow.toLocaleDateString('pt-BR',
        { year: 'numeric', month: 'long', day: 'numeric' });
      this.databaseService.writeDatabase(pathWrite, dataToSend)
        .then(() => {
          let alert = this.alertCtrl.create({
            title: 'Compra efetuada, aguardando pagamento!',
            subTitle: 'A compra estará disponível no menu na seção "meus pedidos - em débito". Após o pagamento a mesma será movida para seção "meus pedidos - pagos"!',
            buttons: ['OK']
          });
          this.myServices.dismissLoading();
          alert.present();
          this.IDtoRemove = this.userCartProd.map((obj) => obj.id);
          this.events.publish('id:toRemove', this.IDtoRemove);
          delete this.userCartProd["dataCompra"];
          this.incrementId();
          this.navCtrl.pop();
        }).catch((error) => {
          let toast = this.myServices.criarToast('Erro ao finalizar compra.');
          toast.present();
          this.myServices.dismissLoading();
        })
    } else {
      let toast = this.myServices.criarToast('O carrinho está vazio.');
      toast.present();
      this.myServices.dismissLoading();
    }
  }

  incrementId() {
    if (this.myServices.filterInt(pedidosCont)) {
      pedidosCont = Number.parseInt(pedidosCont) + 1;

      const path = 'users/' + this.userUid;
      this.databaseService.writeDatabase(path, { pedidosCont: pedidosCont })
        .then(() => { }).catch(() => {
          let toast = this.myServices.criarToast('Erro ao incrementar id.');
          toast.present();
        })
    } else {
      let toast = this.myServices.criarToast('Erro ao incrementar id.');
      toast.present();
    }
  }

  quantityChange(prodQtChange: any) {
    let prodToChange = this.userCartProd.find((o) => o.id == prodQtChange.id);
    this.precoTotal = this.precoTotal - Number.parseInt(prodToChange.preco) + prodQtChange.newPrice;
    prodToChange.preco = prodQtChange.newPrice;
    prodToChange.quantidade = prodQtChange.qtMultiplier;    
    console.log(this.userCartProd)
  }

  removeItem(ID: any) {
    if (this.IDtoRemove) {
      this.IDtoRemove.push(ID);
    } else {
      this.IDtoRemove = [0];
      this.IDtoRemove["0"] = ID;
    }
    this.events.publish('id:toRemove', this.IDtoRemove);

    this.precoTotal = 0;
    this.userCartProd = this.userCartProd.filter(obj => obj.id !== ID);
    this.userCartProd.map((o) => {
      if (this.myServices.filterInt(o.preco)) {
        this.precoTotal = this.precoTotal + Number.parseInt(o.preco);
      }
    });
  }


  AllFilledForm() {
    var check1 = this.form.value["nome"];
    var check2 = this.form.value["telefone"];
    var check3 = this.form.value["endereco"];

    if (check1 == null || check1 == "" || check2 == null || check2 == "" || check3 == null || check3 == "") {
      return false;
    }
    return true;
  }

}
