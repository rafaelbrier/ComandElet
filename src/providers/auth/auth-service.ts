import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';



@Injectable()
export class AuthService {

  constructor(public http: HttpClient) {
    console.log('Hello AuthServiceProvider Provider');
  }

}
