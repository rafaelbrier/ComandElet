import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { DatabaseServiceProvider } from './database-service';
import { ActionSheetController } from 'ionic-angular';


@Injectable()
export class UserServiceProvider {

  constructor(private fireDatabase: AngularFireDatabase,
    private databaseService: DatabaseServiceProvider,
    private actionSheetCtrl: ActionSheetController) {
  }

  changeProfileImg(){
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Trocar imagem de perfil',
      buttons: [
        {
          text: 'Selecionar imagem',         
          handler: () => {
            console.log('Destructive clicked');
          }
        },{
          text: 'Remover imagem',
          handler: () => {
            console.log('Archive clicked');
          }
        },{
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
    }

}
