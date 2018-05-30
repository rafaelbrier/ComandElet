import { Component, ViewChild } from '@angular/core';
import { NavParams, MenuController } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { MyServicesProvider } from '../../providers/my-services/my-services';


@Component({
  selector: 'page-carrinho',
  templateUrl: 'carrinho.html',
})
export class CarrinhoPage {

  @ViewChild('form') form: NgForm;
  
  userCart: any[];
  userUid: string;
  entregar: boolean;

  entregarInfo: {
    nome: string,
    telefone: string,
    endereco: string,
    obs: string
  }

  telPattern ='^[\(]\d{2}[\)]\d{4}[\-]\d{4}$';

  constructor(public navParams: NavParams,
    private menuCtrl: MenuController,
    private myServices: MyServicesProvider) {

      this.userCart = navParams.get("userCart");
      this.userUid = navParams.get("userUid");   

    this.menuCtrl.enable(true, 'myMenu');
    
    this.entregarInfo =  {
      nome: '',
      telefone: '',
      endereco: '',
      obs: ''
    }
    }

  ionViewDidLoad() {    
  }

  finalizarCompra(){
    if(this.entregar)
    this.finalizarCompraEntrega();
    else
    this.finalizarCompraSemEntrega();   
  }

  finalizarCompraEntrega(){
    if(this.AllFilledForm()){
    } else {
      let toast = this.myServices.criarToast('Preencha as informações necessárias.');
      toast.present();
    }
  }

  finalizarCompraSemEntrega(){
  }

  quantityChange(quantidade: any){
    console.log(quantidade)
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
