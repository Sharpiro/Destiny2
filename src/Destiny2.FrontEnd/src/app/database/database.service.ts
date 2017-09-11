import { Injectable } from '@angular/core';
import { Http } from "@angular/http"
import 'rxjs/Rx';

@Injectable()
export class DatabaseService {

  constructor(private http: Http) { }

  public getData(url: string) {
    return this.http.get(url);
  }
}