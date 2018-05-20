import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from './users';
import * as firebase from 'firebase/app';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';



@Injectable()
export class AuthService {
  user: Observable<firebase.User>;

  constructor(private angularFireAuth: AngularFireAuth,
    private googlePlus: GooglePlus,
    private facebook: Facebook) {

    this.user = angularFireAuth.authState;

  }
  createUser(user: User) {
    return this.angularFireAuth.auth.createUserWithEmailAndPassword(user.email, user.password);
  }

  login(user: User) {
    return this.angularFireAuth.auth.signInWithEmailAndPassword(user.email, user.password);
  }


  loginWithGoogle() {

    // if (true) {
    //   return this.angularFireAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    //     .then((user: any) => {
    //       return user.user;
    //     });

    // } else {

    return this.googlePlus.login({
      'webClientId:': '682769687823-rsfht79lpfefnta01j2q00e9c8ru4ueu.apps.googleusercontent.com',
      'offline': true
    })
      .then(res => {
        let credentials = firebase.auth.GoogleAuthProvider.credential(null, res.accessToken);
        return this.angularFireAuth.auth.signInWithCredential(credentials)
          .then((user: firebase.User) => {
            user.updateProfile({ displayName: res.displayName, photoURL: res.imageUrl })
              .then((u) => { return u });
            return user;
          });
      });
  }


  loginWithFacebook() {

    // if (this.isRunningOnBrowser()) {
    //   return this.angularFireAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider())
    //     .then((user: any) => {         
    //       return user.user;
    //     });
    // } else {

    return this.facebook.login(['public_profile', 'email'])
      .then((res: FacebookLoginResponse) => {
        let credentials = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
        return this.angularFireAuth.auth.signInWithCredential(credentials)
          .then((user) => {
            return user;
          });
      })
  }

  // private isRunningOnBrowser() {
  //   return !this.platform.is('cordova');
  // }

  signOut() {
    if (this.angularFireAuth.auth.currentUser.providerData.length /* && !this.isRunningOnBrowser() */) {
      for (var i = 0; i < this.angularFireAuth.auth.currentUser.providerData.length; i++) {
        var provider = this.angularFireAuth.auth.currentUser.providerData[i];


        if (provider.providerId == firebase.auth.GoogleAuthProvider.PROVIDER_ID) {
          this.googlePlus.trySilentLogin()
            .then(res => {
              return this.googlePlus.disconnect()
                .then(() => {
                  return this.signOutFirebase();
                });
            }).catch(err => {
              return this.googlePlus.disconnect()
                .then(() => {
                  return this.signOutFirebase();
                });
            })
        } else if (provider.providerId == firebase.auth.FacebookAuthProvider.PROVIDER_ID) {
          return this.facebook.logout()
            .then(() => {
              return this.signOutFirebase();
            });
        }
      }
    }

    return this.signOutFirebase();
  }

  signOutFirebase() {
    return this.angularFireAuth.auth.signOut();
  }

  resetPassword(email: string) {
    return this.angularFireAuth.auth.sendPasswordResetEmail(email);
  }

  loggedUserInfo() {
    return this.angularFireAuth.authState;
  }

  removeUser() {
    return this.angularFireAuth.auth.currentUser.delete();
  }
}

