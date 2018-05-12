
import { Injectable } from '@angular/core';
import { User } from './users';
import { AngularFireDatabase } from 'angularfire2/database';


@Injectable()
export class UserServiceProvider {

  constructor(private fireDatabase: AngularFireDatabase) {

  }
}
