import { Component } from '@angular/core';
import { NavParams, MenuController } from 'ionic-angular';


@Component({
  selector: 'page-carrinho',
  templateUrl: 'carrinho.html',
})
export class CarrinhoPage {

  userCart: any[];
  userUid: string;

  constructor(public navParams: NavParams,
    private menuCtrl: MenuController) {

      this.userCart = navParams.get("userCart");
      this.userUid = navParams.get("userUid");   

    this.menuCtrl.enable(true, 'myMenu');
  }

  ionViewDidLoad() {
    console.log(this.userCart, this.userUid)
  }

}
