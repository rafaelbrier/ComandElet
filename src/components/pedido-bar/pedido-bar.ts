import { Component, Input, Output, EventEmitter } from '@angular/core';

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

  @Input()
  userName: string;

  @Input()
  userEmail: string;

  @Input()
  userUid: string;

  @Input()
  toPaidButtonEnab: boolean;

  @Input()
  nameEmailEnable: boolean;

  @Input()
  isPaid: boolean;

  @Output()
  paymentConfirmer = new EventEmitter;

  constructor() {
    this.showBar = false;
    this.isPaid = false;
    this.toPaidButtonEnab = false;
    this.nameEmailEnable = false;
    setTimeout(() => {
      this.checkEntrega();
    }, 100);
  }

  checkEntrega() {   
    if (this.pedidosData) {
      if(this.pedidosData.entrega) {
      this.entrega = true;
      this.entregaStringPri = this.pedidosData.entrega.nome + ', ' + this.pedidosData.entrega.telefone;
      this.entregaStringSec = 'Obs: ' + this.pedidosData.entrega.obs;
      }     
    } else {
      this.entrega = false;
    }
  }

  confirmPayment(){
    this.paymentConfirmer.emit({nomePedido: this.pedidosData.nome, email: this.userEmail, userUid: this.userUid});
  }
}
