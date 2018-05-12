
import { Injectable } from '@angular/core';
import { User } from './users';
import { AngularFireDatabase } from 'angularfire2/database';


@Injectable()
export class DatabaseServiceProvider {

  constructor(private fireDatabase: AngularFireDatabase) {

  }

  regNewAuth(user: User, res: any) {
    var userInfo = {
      name: user ? user.name : res.displayName,
      email: user ? user.email : res.email,
      imgUrl: user ? "https://realtimesubcount.com/assets/images/default-avatar.png"
      : res.imageUrl       
    };

    this.fireDatabase.object('users/' + res.uid).update(userInfo);     
  }

  readDatabase(userUid: string) {
    return this.fireDatabase.object('users/' + userUid).valueChanges();
  }
}
