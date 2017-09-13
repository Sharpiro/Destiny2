import { Injectable } from '@angular/core';
import { Http, ResponseContentType, Headers } from "@angular/http"
import 'rxjs/Rx';

@Injectable()
export class DestinyApiService {
  private baseApiUrl = "https://www.bungie.net/Platform/Destiny2";
  private baseContentUrl = "https://www.bungie.net";

  constructor(private http: Http) { }

  public getManifest() {
    const url = `${this.baseApiUrl}/Manifest/`;
    return this.http.get(url, { headers: this.getDestinyHeaders() }).toPromise();
  }

  public getDatabase(dbPath: string) {
    const url = `${this.baseContentUrl}${dbPath}`;
    // const url = "http://localhost:4200/assets/test.zip";
    return this.http.get(url, { responseType: ResponseContentType.Blob }).toPromise();
  }

  public searchPlayer(playerName: string, platform = 1) {
    const url = `${this.baseApiUrl}/SearchDestinyPlayer/${platform}/${playerName}/`;
    // const url = "http://localhost:4200/assets/test.zip";
    return this.http.get(url, { headers: this.getDestinyHeaders() }).toPromise();
  }

  private getDestinyHeaders(): Headers {
    let headers = new Headers();
    headers.append("X-API-Key", "106c3e8ee80248b5bd0514c7f966dc47");
    return headers;
  }
}