import { LoadingController } from "ionic-angular/components/loading/loading-controller";
import { Injectable } from "@angular/core";
import { ToastController, AlertController } from "ionic-angular";


@Injectable() 
export class MyServicesProvider {  

  constructor(public loadingCtrl: LoadingController,
    public toastCtrl: ToastController, 
    public alertCtrl: AlertController) {   
   }
   loading;

showLoading() {
    if(!this.loading){
        this.loading = this.loadingCtrl.create({
            content: 'Aguarde...'
        });
        this.loading.present();
    }
}

dismissLoading(){
    if(this.loading){
        this.loading.dismiss();
        this.loading = null;
    }    
}

criarToast(mensagem: string) {
    let toast = this.toastCtrl.create({ duration: 3000, position: 'bottom' });
    toast.setMessage(mensagem);
    return toast;
}
}




