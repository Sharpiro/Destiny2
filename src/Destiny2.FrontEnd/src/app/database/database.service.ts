import { Injectable } from '@angular/core';
import { Http, ResponseContentType } from "@angular/http"
import 'rxjs/Rx';

@Injectable()
export class DatabaseService {

  constructor(private http: Http) { }

  public getData(url: string, responseType = ResponseContentType.Json) {
    return this.http.get(url, {
      responseType: responseType
    }).toPromise();
  }
}