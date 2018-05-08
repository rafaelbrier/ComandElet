import { LoadingController } from "ionic-angular/components/loading/loading-controller";
import { Injectable } from "@angular/core";


@Injectable() 
export class MyServicesProvider {

  constructor(public loadingCtrl: LoadingController) {   
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
}
