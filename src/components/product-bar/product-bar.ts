import { Component, Input } from '@angular/core';

/**
 * Generated class for the ProductsBarComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'product-bar',
  templateUrl: 'product-bar.html'
})
export class ProductBarComponent {

  text: string;  

  @Input()
  produto: any;
  
  @Input()
  isPreview: boolean;

  constructor() {  
    this.isPreview = false;
  }

  openProductConfirm(){
    console.log('botao')
  }

}
