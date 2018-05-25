
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
      imgUrl: user ? "https://firebasestorage.googleapis.com/v0/b/comanda-eletroni-1525119433359.appspot.com/o/ProfileImages%2FdefaultImg%2Fdefault-avatar.png?alt=media&token=3a02ff5a-0a07-4a16-99e8-be90c8542cf5"
        : res.photoURL
    };

    this.fireDatabase.object('users/' + res.uid).update(userInfo);
  }

  writeDatabaseUser(userUid: string, userInfo: any) {
    return this.fireDatabase.object('users/' + userUid).update(userInfo);    
  }

  readDatabaseUser(userUid: string) {
    return this.fireDatabase.object('users/' + userUid).valueChanges();
  }
  
  readDatabase(path: string) {
    return this.fireDatabase.object(path).valueChanges();
  }

  writeDatabase(path: string, userInfo: any) {
    return this.fireDatabase.object(path).update(userInfo);    
  }

  removeDatabaseUser(userUid: string) {
    return this.fireDatabase.object('users/' + userUid).remove();
  }


}
