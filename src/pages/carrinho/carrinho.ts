import { Component } from '@angular/core';
import { NavParams, MenuController } from 'ionic-angular';

/**
 * Generated class for the CarrinhoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-carrinho',
  templateUrl: 'carrinho.html',
})
export class CarrinhoPage {

  userCart: any[];

  constructor(public navParams: NavParams,
    private menuCtrl: MenuController) {
      this.userCart = navParams.get("userCart");   

    this.menuCtrl.enable(true, 'myMenu');
  }

  ionViewDidLoad() {
    console.log(this.userCart)
  }

}
