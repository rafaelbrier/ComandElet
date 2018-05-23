import { AlertOptions, Events } from "ionic-angular";
import { MyServicesProvider } from "../../providers/my-services/my-services";
import { DatabaseServiceProvider } from "../../providers/auth/database-service";

export class AlertaTrocarNomeService {

  newName: string;  

  constructor(private myServices: MyServicesProvider,
    private databaseService: DatabaseServiceProvider,    
    private userUid: string,
    private userName: string,
    private events: Events) {

      this.newName = userName;
      
  }

  createAlertOptions(): AlertOptions {
    let alertOptions = {
      title: 'Trocar Nome',
      inputs: [
        {
          name: 'name',
          placeholder: 'Novo nome'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Trocar nome',
          handler: (data) => {
            this.confirmarHandler(data);
          }
        }
      ]
    }
    return alertOptions;
  }

  confirmarHandler(data) {
    this.myServices.showLoading();
    if (this.isNameValid(data.name)) {
      this.databaseService.writeDatabase(this.userUid, data)
        .then(() => {         
          let toast = this.myServices.criarToast('Nome trocado com sucesso.');
          toast.present(); 
          this.events.publish('user:newname', data.name);
        })
        .catch(() => {
          let toast = this.myServices.criarToast('Erro ao salvar novo nome.');
          toast.present();         
        });
      this.myServices.dismissLoading();
    } else {
      let toast = this.myServices.criarToast('Nome inválido.');
      toast.present();
      this.myServices.dismissLoading();      
    }
  }

  isNameValid(name: string): boolean {

    if(name.length >= 2 && name.length <= 20){
      return true;
    } else {
      return false;
    }
  }
}