import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { LoginTabPage } from '../pages/login-tab/login-tab';
import { HomePage } from '../pages/home/home';

import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database'
import { firebaseConfig } from '../config';
import { AuthService } from '../providers/auth/auth-service';
import { ResetpasswordPage } from '../pages/resetpassword/resetpassword';
import { MyServicesProvider } from '../providers/my-services/my-services';

import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook } from '@ionic-native/facebook';
import { DatabaseAuthSaveProvider } from '../providers/auth/database-auth-save';


@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    SignupPage,
    LoginTabPage,
    HomePage,
    ResetpasswordPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      scrollPadding: true,
      scrollAssist: true, 
      autoFocusAssist: false
    }),
    AngularFireModule.initializeApp(firebaseConfig.fire),
    AngularFireDatabaseModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    SignupPage,
    LoginTabPage,
    HomePage,
    ResetpasswordPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AngularFireAuth,
    AuthService,
    MyServicesProvider,
    GooglePlus, 
    Facebook,
    DatabaseAuthSaveProvider      
  ]
})
export class AppModule {}
