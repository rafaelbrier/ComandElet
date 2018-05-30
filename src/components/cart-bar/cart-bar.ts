import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'cart-bar',
  templateUrl: 'cart-bar.html'
})
export class CartBarComponent {
 
 
  basePrice: number;
  newPrice: number;

  @Input()
  prodCart: any;  

  @Output() 
  onQuantidadeChange = new EventEmitter();

  @Output()
  removeItem = new EventEmitter();
 
  constructor() {   
    this.basePrice = null;  
  }

 addQuantityClick(){
  this.basePrice = this.basePrice == null ? this.prodCart.precobase : this.basePrice;  
  // this.qtMultiplier = this.prodCart.preco/this.basePrice;

   if(this.prodCart.quantidade == 10){
     this.prodCart.quantidade = 10;
   } else {
     this.prodCart.quantidade = this.prodCart.quantidade + 1;
     this.newPrice= this.prodCart.quantidade*this.basePrice;
   }  
    this.onQuantidadeChange.emit({id: this.prodCart.id, newPrice: this.newPrice, qtMultiplier: this.prodCart.quantidade});    
  }

  removeQuantityClick(){  
    this.basePrice = this.basePrice == null ? this.prodCart.precobase : this.basePrice;
    // this.qtMultiplier = this.prodCart.preco/this.basePrice;

    if(this.prodCart.quantidade == 1){
      this.prodCart.quantidade = 1;
    } else {
      this.prodCart.quantidade = this.prodCart.quantidade - 1;
      this.newPrice = this.prodCart.quantidade*this.basePrice;
    } 
    this.onQuantidadeChange.emit({id: this.prodCart.id, newPrice: this.newPrice, qtMultiplier: this.prodCart.quantidade}); 
 }
    
 removeItemClick(){
  this.removeItem.emit(this.prodCart.id);
}

}
