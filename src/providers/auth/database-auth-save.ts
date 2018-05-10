
import { Injectable } from '@angular/core';
import { User } from './users';
import { AngularFireDatabase } from 'angularfire2/database';


@Injectable()
export class DatabaseAuthSaveProvider {

  constructor(private fireDatabase: AngularFireDatabase) {

  }

  regNewAuth(user: User, res: any) {
    var userInfo = {
      name: user ? user.name : res.displayName,
      email: user ? user.email : res.email       
    };

    this.fireDatabase.object('users/' + res.uid).update(userInfo);     
  }

}
