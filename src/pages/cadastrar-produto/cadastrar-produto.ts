import { Component, ViewChild } from '@angular/core';
import { DatabaseServiceProvider } from '../../providers/auth/database-service';
import { AngularFireStorage } from 'angularfire2/storage';
import { Camera } from '@ionic-native/camera';
import { NavParams, Events, NavController, AlertController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { MyServicesProvider } from '../../providers/my-services/my-services';
import { CameraService } from '../../core/camera-service/camera-service'
import { NgForm } from '@angular/forms';


@Component({
  selector: 'page-cadastrar-produto',
  templateUrl: 'cadastrar-produto.html',
})
export class CadastrarProdutoPage {
  @ViewChild('form') form: NgForm;
  //produto
  preco: string;
  userUid: string;
  prodPreview: any;
  prod: any;
  progress: Observable<number>;
  isImgUploaded: Boolean;
  progressIsLoading: Boolean;
  cameraImgService: CameraService;
  file: any;  

  numberPattern = /^\d+(\.\d{1,2})?$/;


  constructor(navParams: NavParams,
    private databaseService: DatabaseServiceProvider,
    private fireStorage: AngularFireStorage,
    private camera: Camera,
    private events: Events,
    private myServices: MyServicesProvider,
    private navCtrl: NavController,
    private alertCtrl: AlertController) {

    this.userUid = navParams.get("userUid");
    this.file = null;

    this.prodPreview = {
      id: null,
      nome: 'Nome',
      imgUrl: 'https://firebasestorage.googleapis.com/v0/b/comanda-eletroni-1525119433359.appspot.com/o/productsIcons%2FiconEx.png?alt=media&token=464cf19c-0efc-4e8f-9c3c-1c08967af677',
      descricao: 'Informações do produto',
      preco: 0
    }

    this.prod = {
      id: null,
      nome: '',
      imgUrl: '',
      descricao: '',
      preco: null
    }
  }

  ionViewWillEnter() {
    const path = '/produtos';

    const dataBaseObserver = this.databaseService.readDatabase(path)
      .subscribe((res: any) => {
        this.prod.id = res.idCount;   
        this.prodPreview.id = res.idCount;     
        dataBaseObserver.unsubscribe();
      }, error => {
        let toast = this.myServices.criarToast('Não foi possível acessar o banco de dados.');
        toast.present();
        dataBaseObserver.unsubscribe();
      });
  }

  changeIdAlert() {
    let alert = this.alertCtrl.create({
      title: 'Trocar ID',
      message: 'Digite o ID do item que deseja criar/modificar.',
      inputs: [{
        name: 'id',
        placeholder: 'ID'
      },],
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        handler: () => { }
      }, {
        text: 'Confirmar',
        handler: data => {
          if (this.filterInt(data.id)) {
            if (Number.isInteger(Number(data.id))) {
              this.changeId(Number(data.id));
            } else {
              let toast = this.myServices.criarToast('O ID deve ser um número inteiro.');
              toast.present();
            }
          } else {
            let toast = this.myServices.criarToast('O ID deve ser um número.');
            toast.present();
          }
        }
      }]
    });
    alert.present();
  }

  changeId(newId: number) {
    const path = '/produtos';

    this.databaseService.writeDatabase(path, { idCount: newId })
      .then(() => {
        let toast = this.myServices.criarToast('Id trocado com sucesso.');
        toast.present();
        this.prod.id = newId;
        this.prodPreview.id = newId;     
      }).catch(() => {
        let toast = this.myServices.criarToast('Erro ao trocar id.');
        toast.present();
      })
  }

  registerTypeConfirm(){
      let alert = this.alertCtrl.create({
        title: 'Confirmar cadastro de produto.',
        message: 'O produto a ser cadastrado é uma Bebida ou Comida?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {}
          },
          {
            text: 'Comida',
            handler: () => {
              this.registerProduct('comida');
            }
            },
            {
              text: 'Bebida',
              handler: () => {
                this.registerProduct('bebida');
              }                       
          }
        ]
      });
      alert.present();
    }

  

  registerProduct(productType: string) {
    if (this.notAllFilledForm() && this.filterInt(this.preco)) {

      if (this.prod.id != null) {

        this.progressIsLoading = false;
        this.isImgUploaded = false;

        this.cameraImgService = new CameraService(this.myServices,
          this.databaseService,
          this.fireStorage,
          this.camera,
          this.events,
          this.prod,
          this.navCtrl);

        this.events.subscribe('user:prodimg', (progressFromEvent, progressIsLoadingFromEvent: boolean, isImgUploadedFromEvent: boolean) => {
          this.progress = progressFromEvent;
          this.progressIsLoading = progressIsLoadingFromEvent;
          this.isImgUploaded = isImgUploadedFromEvent;
        });

        if (this.file != null && this.prod.imgUrl == "") {
          this.cameraImgService.createUploadTask(this.file, productType);          
          this.events.unsubscribe('user:newimage');

        } else if (this.prod.imgUrl != "") {
          this.databaseService.writeDatabase('/produtos/' + productType +  '/' + this.prod.id.toString(), this.prod)
            .then(() => {
              let toast = this.myServices.criarToast('Produto cadastrado com sucesso.');
              toast.present();
              this.cameraImgService.incrementId();
              setTimeout(() => { this.navCtrl.pop(); }, 1000)
            }).catch(() => {
              let toast = this.myServices.criarToast('Erro ao cadastrar usuário');
              toast.present();
            })
          this.events.unsubscribe('user:newimage');
        } else {
          let toast = this.myServices.criarToast('Nenhuma imagem selecionada.');
          toast.present();
        }
      }
      else {
        let toast = this.myServices.criarToast('Erro ao verificar o número de iDs disponíveis no banco de dados, tente novamente mais tarde.');
        toast.present();
      }
    } else if (!this.notAllFilledForm()) {
      let toast = this.myServices.criarToast('Preencha todos os campos vazios.');
      toast.present();
    }
    else if (!this.filterInt(this.preco)) {
      let toast = this.myServices.criarToast('Preço inválido.');
      toast.present();
    }
    else {
      let toast = this.myServices.criarToast('Erro inesperado.');
      toast.present();
    }
  }

  uploadImg() {
    this.cameraImgService = new CameraService(this.myServices,
      this.databaseService,
      this.fireStorage,
      this.camera,
      this.events,
      this.prod,
      this.navCtrl);

    this.cameraImgService.getPhoto('gallery')
      .then((base64) => {
        this.prodPreview.imgUrl = 'data:image/jpg;base64,' + base64;
        this.file = 'data:image/jpg;base64,' + base64;
      });
  }

  testUrl() {
    this.prodPreview.imgUrl = this.prod.imgUrl;
  }

  onNameInput() {
    this.prodPreview.nome = this.prod.nome;
  }
  onDescInput() {
    this.prodPreview.descricao = this.prod.descricao;
  }
  onPriceInput() {
    if (this.filterInt(this.preco)) {
      this.prodPreview.preco = Number(this.preco);
      this.prod.preco = Number(this.preco);
    }
  }

  notAllFilledForm() {
    var name = this.form.value["nome"];
    var desc = this.form.value["descricao"];
    var preco = this.form.value["preco"];

    if (name == null || name == "" || desc == null || desc == "" || preco == null || preco == "") {
      return false;
    }
    return true;
  }

  filterInt(value) {
    if (/^\d+(\.\d{1,2})?$/.test(value)) {
      return true;
    }
    else { return NaN; }
  }
}
