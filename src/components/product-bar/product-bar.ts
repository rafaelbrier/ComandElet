import { Component, Input, Output, EventEmitter } from '@angular/core';

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
  
  @Input()
  produto: any;
  
  @Input()
  isPreview: boolean;

  @Output() listButton = new EventEmitter();

  constructor() {  
    this.isPreview = false;
  }

  listButtonClick(){
    let emitVars = {id: this.produto.id, nome: this.produto.nome, preco: this.produto.preco, imgUrl: this.produto.imgUrl};
    this.listButton.emit(emitVars);    
  }
}
