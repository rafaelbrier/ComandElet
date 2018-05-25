import { AlertOptions, Events } from "ionic-angular";
import { MyServicesProvider } from "../../providers/my-services/my-services";
import { DatabaseServiceProvider } from "../../providers/auth/database-service";
import { AngularFireStorage, AngularFireUploadTask } from "angularfire2/storage";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { Observable } from "rxjs/Observable";
import { finalize } from 'rxjs/operators';



export class AlertImagemPerfilService  {

  newImgUrl: string;  
  isImageUploaded: boolean;
  progressIsLoading: boolean;

  taskUpload: AngularFireUploadTask;
  progress: Observable<number>;
  image: string;
  downloadURL: Observable<string>;

  constructor(private myServices: MyServicesProvider,
    private databaseService: DatabaseServiceProvider,
    private fireStorage: AngularFireStorage,
    private camera: Camera,
    private userUid: string,
    private events: Events,
    imgUrl: string) {

      this.newImgUrl = imgUrl;   
      this.isImageUploaded = false;
      this.progressIsLoading = false;  
    }

  createRemoveImgAlertOptions(): AlertOptions {
    let alertOptions = {
      title: 'Remover imagem',
      message: 'Deseja mesmo remover a imagem de perfil?',
      buttons: [
        {
          text: 'Não',
          role: 'cancel'
        },
        {
          text: 'Sim',
          handler: () => {
            this.removeImgHandler();           
          }
        }
      ]
    }
    return alertOptions;
  }  

  //REMOVER IMAGEM --------------------------------------------------------------------------------------------------------------------
  removeImgHandler() {
    this.myServices.showLoading();
    this.databaseService.writeDatabaseUser(this.userUid,
      { imgUrl: 'https://firebasestorage.googleapis.com/v0/b/comanda-eletroni-1525119433359.appspot.com/o/ProfileImages%2FdefaultImg%2Fdefault-avatar.png?alt=media&token=3a02ff5a-0a07-4a16-99e8-be90c8542cf5' })
      .then(() => {
        this.removeImg();
        this.newImgUrl = 'https://firebasestorage.googleapis.com/v0/b/comanda-eletroni-1525119433359.appspot.com/o/ProfileImages%2FdefaultImg%2Fdefault-avatar.png?alt=media&token=3a02ff5a-0a07-4a16-99e8-be90c8542cf5';
        this.events.publish('user:newimage', this.newImgUrl, null, false, false);        
      })
      .catch(() => {
        let toast = this.myServices.criarToast('Erro ao remover imagem de perfil.');
        toast.present();
      });
    this.myServices.dismissLoading();     
  }

  removeImg() {
    const filePath = '/' + this.userUid + `/profileImg.jpg`;

    const fileRef = this.fireStorage.ref(filePath);
    fileRef.delete()
      .subscribe(() => {
        let toast = this.myServices.criarToast('Imagem de perfil removida com sucesso.');
        toast.present();
      }, error => {
        if (error.code == 'storage/object-not-found') {
          let toast = this.myServices.criarToast('A imagem de perfil já foi removida.');
          toast.present();
        } else {
          let toast = this.myServices.criarToast('Erro ao remover imagem de perfil.');
          toast.present();
        }

      });
  }  
  //REMOVER IMAGEM --------------------------------------------------------------------------------------------------------------------


  //TROCAR IMAGEM ---------------------------------------------------------------------------------------------------------------------
  getPhoto(type) {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: type == "picture" ? this.camera.PictureSourceType.CAMERA : this.camera.PictureSourceType.PHOTOLIBRARY,
      correctOrientation: true,
      allowEdit: true
    }
    return this.camera.getPicture(options);
  }


 
  createUploadTask(file: string): void {   

    this.image = 'data:image/jpg;base64,' + file;
    const filePath = '/' + this.userUid + `/profileImg.jpg`;

    const fileRef = this.fireStorage.ref(filePath);

    this.taskUpload = fileRef.putString(this.image, 'data_url');
    this.progressIsLoading = true;
    this.progress = this.taskUpload.percentageChanges();

    this.events.publish('user:newimage', this.newImgUrl, this.progress, this.progressIsLoading, this.isImageUploaded);  

    this.taskUpload.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURL = fileRef.getDownloadURL();
        this.downloadURL.subscribe((URL) => {
          this.databaseService.writeDatabaseUser(this.userUid, { imgUrl: URL })
            .then(() => {
              this.newImgUrl = URL;                  
              this.isImageUploaded = true;
              this.progressIsLoading = false;  
              this.events.publish('user:newimage', this.newImgUrl, this.progress, this.progressIsLoading, this.isImageUploaded);              
              let toast = this.myServices.criarToast('Imagem de perfil atualizada com sucesso.');              
              toast.present();            
            })
            .catch(() => {
              let toast = this.myServices.criarToast('Erro ao trocar foto de perfil.');
              toast.present();
              this.progressIsLoading = false;
            });
          this.progressIsLoading = false;
        }, error => {
        })
      })
    ).subscribe(() => {

    }, error => {
      if (error.code == 'storage/canceled') {
        let toast = this.myServices.criarToast('Envio de imagem cancelado.');
        toast.present();
        this.progressIsLoading = false;
      } else {
        let toast = this.myServices.criarToast('Erro ao enviar imagem.');
        toast.present();
        this.progressIsLoading = false;
      }
    });
  }

  uploadHandler(type: string) {
    this.getPhoto(type)
      .then(base64 => {
        this.createUploadTask(base64);
      })
      .catch(() => {
      })
  }

  taskCancel(){
    this.taskUpload.cancel();
    this.isImageUploaded = false;
    this.progressIsLoading = false;
    this.events.publish('user:newimage', this.newImgUrl, null, false, false);     
  }
   //TROCAR IMAGEM ---------------------------------------------------------------------------------------------------------------------
}
