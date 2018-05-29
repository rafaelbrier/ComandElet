import { AlertOptions } from "ionic-angular";
import { MyServicesProvider } from "../../providers/my-services/my-services";
import { DatabaseServiceProvider } from "../../providers/auth/database-service";

export class AlertaExcluirProduto {

  constructor(private myServices: MyServicesProvider,
    private dataService: DatabaseServiceProvider) {

  }

  createAlertOptions(foodtype: string): AlertOptions {
    let alertOptions = {
      title: 'Remover ' + foodtype,
      subTitle: 'Todos os dados do produto serão perdidos. Se está de acordo, digite o ID do produto e aperte Confirmar.',
      inputs: [
        {
          name: 'ID',
          placeholder: 'ID do produto',
          type: 'text'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: (product) => {
            if (this.myServices.filterInt(product.ID))
              this.confirmarHandler(product.ID, foodtype);
            else {
              let toast = this.myServices.criarToast('O ID deve ser um número.');
              toast.present();
            }
          }
        }
      ]
    }
    return alertOptions;
  }

  confirmarHandler(productId: string, foodtype: string) {
    let pathDatabase = '/produtos/' + foodtype + '/' + productId;
    let pathStorage = '/productsIcons/' + foodtype + '/' + productId + '.jpg';
    //Deletar dados do storage ------------------------------------------------------------------
    this.dataService.removeFireStorageFile(pathStorage)
      .subscribe(() => {
        this.myServices.dismissLoading();
        let toast = this.myServices.criarToast('Arquivos do produto removidos com sucesso.');
        toast.present();
      }, error => {
        if (error.code == 'storage/object-not-found') {
          this.myServices.dismissLoading();
          let toast = this.myServices.criarToast('Arquivos do produto já removidos ou não existem.');
          toast.present();
        } else {
          this.myServices.dismissLoading();
          let toast = this.myServices.criarToast('Erro ao remover arquivos do produto.');
          toast.present();
        }
      });
    //Deletar dados do storage ------------------------------------------------------------------  

    //Deletar dados no database -----------------------------------------------------------
    this.dataService.removeDatabase(pathDatabase)
      .then(() => {
        this.myServices.dismissLoading();
        let toast = this.myServices.criarToast('Dados do produto removidos com sucesso.');
        toast.present();
        
      })
      .catch((error) => {
        if (error.code == 'auth/requires-recent-login') {
          this.myServices.dismissLoading();
          let toast = this.myServices.criarToast('Esta operação requer que o usuário relogue.');
          toast.present();
        } else {
          this.myServices.dismissLoading();
          let toast = this.myServices.criarToast('Erro ao remover dados do produto.');
          toast.present();
        }
      });
  }
}




