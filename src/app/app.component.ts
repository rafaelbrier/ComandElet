import { Component } from '@angular/core';
import { Platform, Keyboard } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginTabPage } from '../pages/login-tab/login-tab';
import { AngularFireAuth } from 'angularfire2/auth';
import { HomePage } from '../pages/home/home';
import { DatabaseServiceProvider } from '../providers/auth/database-service';
import { MyServicesProvider } from '../providers/my-services/my-services';
import { UserServiceProvider } from '../providers/auth/user-service';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage: any;  
  imgUrl: string;
  displayName: string;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, afAuth: AngularFireAuth, keyboard: Keyboard,
    private databaseService: DatabaseServiceProvider,
    private myServices: MyServicesProvider,
    private userServices: UserServiceProvider) {

    const authObserver = afAuth.authState.subscribe(user => {
      if (user) {
        this.rootPage = HomePage;

        const userDataObserver = this.databaseService.readDatabase(user.uid)
        .subscribe((resUser: any) => { 
          this.displayName = resUser.name;         
          this.imgUrl = resUser.imgUrl;

          authObserver.unsubscribe();
          userDataObserver.unsubscribe();
        }, error => {
          let toast = this.myServices.criarToast('Não foi possível acessar o banco de dados.');
          toast.present();
        });
      } else {
        this.rootPage = LoginTabPage;
        authObserver.unsubscribe();
      }
    });
   
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.      
      //statusBar.overlaysWebView(false);
      statusBar.backgroundColorByHexString("#d0a61c");      
      splashScreen.hide();
    });
  }

  
  changeProfileImg(){
    this.userServices.changeProfileImg();
  }
}

