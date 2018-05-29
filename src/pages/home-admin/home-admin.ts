import { Component } from '@angular/core';
import { NavController, NavParams, MenuController, AlertController, ActionSheetController } from 'ionic-angular';
import { MyServicesProvider } from '../../providers/my-services/my-services';
import { AuthService } from '../../providers/auth/auth-service';
import { CadastrarProdutoPage } from '../cadastrar-produto/cadastrar-produto';
import { AlertaExcluirProduto } from '../../core/alerta/alerta-excluir-produto';
import { DatabaseServiceProvider } from '../../providers/auth/database-service';


@Component({
  selector: 'page-home-admin',
  templateUrl: 'home-admin.html',
})
export class HomeAdminPage {

  userUid: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public myServices: MyServicesProvider,
    public authService: AuthService,
    public menuCtrl: MenuController, 
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private dataService: DatabaseServiceProvider) {
    this.menuCtrl.enable(true, 'myMenu');

    this.userUid = navParams.get("userUid");   
  }

  removeProduct(){
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Remover produto',
      buttons: [
        {
          text: 'Remover bebida',
          handler: () => {
            let removerProdutoService = new AlertaExcluirProduto(this.myServices, this.dataService)
            let alert = this.alertCtrl.create(removerProdutoService.createAlertOptions('bebida'));
            alert.present();
          }
        },
        {
          text: 'Remover comida',
          handler: () => {
            let removerProdutoService = new AlertaExcluirProduto(this.myServices, this.dataService)
            let alert = this.alertCtrl.create(removerProdutoService.createAlertOptions('comida'));
            alert.present();            
          }
        },        
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {          
          }
        }
      ]
    });
    actionSheet.present();
  }

  registProducPage(){
    this.navCtrl.push(CadastrarProdutoPage, {
      userUid: this.userUid               
    });       
  }

}