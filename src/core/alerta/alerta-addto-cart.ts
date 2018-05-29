import { AlertOptions } from "ionic-angular";

export class AlertaAddToCart {

  constructor() {
  }

  createAlertOptions(foodName: string, foodId: Number): AlertOptions {
    let alertOptions = {
      title: 'Adicionar ao carrinho:',
      subTitle: foodName + '  #' + foodId.toString(),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ],
    }
    return alertOptions;
  }

  inputAdd(): any {
    return {
      name: 'Obs',
      placeholder: 'Observações',
      type: 'text'
    };
  }
}

