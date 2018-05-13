import { Component } from '@angular/core';
import { Platform, Keyboard } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginTabPage } from '../pages/login-tab/login-tab';
import { AngularFireAuth } from 'angularfire2/auth';
import { HomePage } from '../pages/home/home';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage: any;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, afAuth: AngularFireAuth, keyboard: Keyboard) {
    const authObserver = afAuth.authState.subscribe(user => {
      if (user) {
        this.rootPage = HomePage;
        authObserver.unsubscribe();
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
}

