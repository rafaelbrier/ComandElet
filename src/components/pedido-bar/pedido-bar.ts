import { Component, Input } from '@angular/core';

/**
 * Generated class for the PedidoBarComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'pedido-bar',
  templateUrl: 'pedido-bar.html'
})
export class PedidoBarComponent {

  showBar: boolean;
  listShow: boolean; 
  entregaStringPri: string;
  entregaStringSec: string;

  @Input()
  entrega: boolean;

  @Input()
  pedidosData: any;

  constructor() { 
    this.showBar = false;  
    setTimeout(() => {
      this.checkEntrega();  
    }, 500);    
  }
  
  checkEntrega(){
  if(this.pedidosData.entrega){
    this.entrega = true;
    this.entregaStringPri = this.pedidosData.entrega.nome + ', ' +this.pedidosData.entrega.telefone;
    this.entregaStringSec = 'Obs: ' + this.pedidosData.entrega.obs;

  } else {
    this.entrega = false;
  }  
}

}
