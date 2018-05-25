import { Component, ViewChild } from '@angular/core';
import { DatabaseServiceProvider } from '../../providers/auth/database-service';
import { AngularFireStorage } from 'angularfire2/storage';
import { Camera } from '@ionic-native/camera';
import { NavParams, Events, NavController, AlertController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { MyServicesProvider } from '../../providers/my-services/my-services';
import { CameraService } from '../../core/camera-service/camera-service'
import { NgForm } from '@angular/forms';
import { InvokeFunctionExpr } from '@angular/compiler';
import { HomeAdminPage } from '../home-admin/home-admin';



@Component({
  selector: 'page-cadastrar-produto',
  templateUrl: 'cadastrar-produto.html',
})
export class CadastrarProdutoPage {
  @ViewChild('form') form: NgForm;
  //produto
  preco: string;
  idCount: number;
  userUid: string;
  prodPreview: any;
  prod: any;
  progress: Observable<number>;
  isImgUploaded: Boolean;
  progressIsLoading: Boolean;
  cameraImgService: CameraService;
  file: any;

  numberPattern = /^\d+(\.\d{1,2})?$/;


  constructor(private navParams: NavParams,
    private databaseService: DatabaseServiceProvider,
    private fireStorage: AngularFireStorage,
    private camera: Camera,
    private events: Events,
    private myServices: MyServicesProvider,
    private navCtrl: NavController,
    private alertCtrl: AlertController) {

    this.userUid = navParams.get("userUid");
    this.idCount = null;
    this.file = null;

    this.prodPreview = {
      nome: 'Nome',
      imgUrl: '../../assets/imgs/logo.png',
      descricao: 'Informações do produto',
      preco: 0
    }

    this.prod = {
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
        this.idCount = res.idCount;
        dataBaseObserver.unsubscribe();
      }, error => {
        let toast = this.myServices.criarToast('Não foi possível acessar o banco de dados.');
        toast.present();
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

    const dataBaseObserver = this.databaseService.writeDatabase(path, { idCount: newId })
      .then(() => {
        let toast = this.myServices.criarToast('Id trocado com sucesso.');
        toast.present();
        this.idCount = newId;
      }).catch(() => {
        let toast = this.myServices.criarToast('Erro ao trocar id.');
        toast.present();
      })
  }

  registerProduct() {
    if (this.notAllFilledForm()) {

      if (this.idCount != null) {

        this.progressIsLoading = false;
        this.isImgUploaded = false;

        this.cameraImgService = new CameraService(this.myServices,
          this.databaseService,
          this.fireStorage,
          this.camera,
          this.userUid,
          this.events,
          this.prod,
          this.idCount,
          this.navCtrl);

        this.events.subscribe('user:prodimg', (progressFromEvent, progressIsLoadingFromEvent: boolean, isImgUploadedFromEvent: boolean) => {
          this.progress = progressFromEvent;
          this.progressIsLoading = progressIsLoadingFromEvent;
          this.isImgUploaded = isImgUploadedFromEvent;
        });

        if (this.file != null && this.prod.imgUrl == "") {
          this.cameraImgService.createUploadTask(this.file);
          this.events.unsubscribe('user:newimage');

        } else if (this.prod.imgUrl != "") {
          this.databaseService.writeDatabase('/produtos/' + this.idCount.toString(), this.prod)
            .then(() => {
              let toast = this.myServices.criarToast('Produto cadastrado com sucesso.');
              toast.present();
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
    }
  }

  uploadImg() {
    this.cameraImgService = new CameraService(this.myServices,
      this.databaseService,
      this.fireStorage,
      this.camera,
      this.userUid,
      this.events,
      this.prod.imgUrl,
      this.idCount,
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
      let toast = this.myServices.criarToast('Preencha todos os campos vazios.');
      toast.present();
      return false;
    }

    return true;
  }

  filterInt(value) {
    if (/^\d+(\.\d{1,2})?$/.test(value))
      return true;
    return NaN;
  }
}
