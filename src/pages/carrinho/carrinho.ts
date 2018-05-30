import { Component, ViewChild } from '@angular/core';
import { NavParams, MenuController, Events } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { MyServicesProvider } from '../../providers/my-services/my-services';


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

  entregarInfo: {
    nome: string,
    telefone: string,
    endereco: string,
    obs: string
  }

  telPattern = '^[\(]\d{2}[\)]\d{4}[\-]\d{4}$';

  constructor(public navParams: NavParams,
    private menuCtrl: MenuController,
    private myServices: MyServicesProvider,
    private events: Events) {

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
          o["quantidade"] = 1
        }
        if (!o["precobase"]) {
          o["precobase"] = o.preco;
        }
      })
    }
  }

  finalizarCompra() {
    if (this.entregar)
      this.finalizarCompraEntrega();
    else
      this.finalizarCompraSemEntrega();
  }

  finalizarCompraEntrega() {
    if (this.AllFilledForm()) {
    } else {
      let toast = this.myServices.criarToast('Preencha as informações necessárias.');
      toast.present();
    }
  }

  finalizarCompraSemEntrega() {
  }

  quantityChange(prodQtChange: any) {
    let prodToChange = this.userCartProd.find((o) => o.id == prodQtChange.id);
    prodToChange.preco = prodQtChange.newPrice;
    prodToChange.quantidade = prodQtChange.qtMultiplier;
  }

  removeItem(ID: any) {
    if (this.IDtoRemove) {
      this.IDtoRemove.push(ID);
    } else {
      this.IDtoRemove = [0];
      this.IDtoRemove["0"] = ID;
    }
    this.events.publish('id:toRemove', this.IDtoRemove);

    this.userCartProd = this.userCartProd.filter(obj => obj.id !== ID);
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
