import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'cart-bar',
  templateUrl: 'cart-bar.html'
})
export class CartBarComponent {
 
  qtMultiplier: number;

  @Input()
  produto: any;  

  @Output() 
  onQuantidadeChange = new EventEmitter();
 
  constructor() {   
    this.qtMultiplier = 1;
  }

 addQuantityClick(){
   this.qtMultiplier = (this.qtMultiplier == 10) ? 10 : this.qtMultiplier + 1;   
    this.onQuantidadeChange.emit({
      novaQuantidade: this.qtMultiplier,
      produtoEditado: this.produto
    });    
  }

  removeQuantityClick(){
    this.qtMultiplier = (this.qtMultiplier == 1) ? 1 : this.qtMultiplier - 1;
    this.onQuantidadeChange.emit({
      novaQuantidade: this.qtMultiplier,
      produtoEditado: this.produto
    });   
 }

}
