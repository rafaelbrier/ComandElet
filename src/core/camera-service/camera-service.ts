import { AlertOptions, Events, NavController } from "ionic-angular";
import { MyServicesProvider } from "../../providers/my-services/my-services";
import { DatabaseServiceProvider } from "../../providers/auth/database-service";
import { AngularFireStorage, AngularFireUploadTask } from "angularfire2/storage";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { Observable } from "rxjs/Observable";
import { finalize } from 'rxjs/operators';



export class CameraService  {

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
    private prod: any,
    private idCount: number,
    private navCtrl: NavController) {
     
      this.isImageUploaded = false;
      this.progressIsLoading = false; 
    }

  
  //TROCAR IMAGEM ---------------------------------------------------------------------------------------------------------------------
  getPhoto(type) {
    const options: CameraOptions = {
      quality: 40,
      targetHeight: 100,
      targetWidth: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      correctOrientation: true,
      allowEdit: true
    }
    return this.camera.getPicture(options);
  }

 
  createUploadTask(file: string): void {     

    this.image = file;
    const filePath = '/productsIcons/' + this.idCount.toString() + `.jpg`;

    const fileRef = this.fireStorage.ref(filePath);

    this.taskUpload = fileRef.putString(this.image, 'data_url');    
    this.progressIsLoading = true;
    this.progress = this.taskUpload.percentageChanges();

    this.events.publish('user:prodimg', this.progress, this.progressIsLoading, this.isImageUploaded);  

    this.taskUpload.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURL = fileRef.getDownloadURL();
        this.downloadURL.subscribe((URL) => {
          this.prod.imgUrl = URL;
          this.databaseService.writeDatabase('/produtos/' + this.idCount.toString(), this.prod)
            .then(() => {                            
              this.isImageUploaded = true;
              this.progressIsLoading = false;  
              this.events.publish('user:prodimg', this.progress, this.progressIsLoading, this.isImageUploaded);              
              let toast = this.myServices.criarToast('Produto cadastrado com sucesso.');              
              toast.present();          
              setTimeout(()=>{this.navCtrl.pop();}, 1000);       
            })
            .catch(() => {
              let toast = this.myServices.criarToast('Erro ao cadastrar produto');
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
}
