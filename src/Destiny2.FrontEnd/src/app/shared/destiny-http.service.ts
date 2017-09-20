import { Injectable } from '@angular/core';
import { Http, ResponseContentType, Headers } from "@angular/http"
import 'rxjs/Rx';
import { MembershipType } from './models/player';

@Injectable()
export class DestinyHttpService {

  private baseApiUrl = "https://www.bungie.net/Platform/Destiny2";
  private baseContentUrl = "https://www.bungie.net";
  private testField = 1;

  constructor(private http: Http) { }

  public getManifest() {
    const url = `${this.baseApiUrl}/Manifest/`;
    return this.http.get(url, { headers: this.getDestinyHeaders() })
      .map(res => res.json().Response)
      .toPromise();
  }

  public getDatabase(dbPath: string) {
    const url = `${this.baseContentUrl}${dbPath}`;
    // const url = "http://localhost:4200/assets/test.zip";
    return this.http.get(url, { responseType: ResponseContentType.Blob })
      .map(res => res.blob())
      .toPromise();
  }

  public searchPlayer(playerName: string, platform = 1) {
    const url = `${this.baseApiUrl}/SearchDestinyPlayer/${platform}/${playerName}/`;
    return this.http.get(url, { headers: this.getDestinyHeaders() })
      .map(res => {
        let body = res.json();
        if (body.Response.length === 0) throw new Error("player not found");
        return body.Response[0];
      }).toPromise();
  }

  public getAccountDetails(membershipType: MembershipType, membershipId: string) {
    const url = `${this.baseApiUrl}/${membershipType}/Profile/${membershipId}/?components=Characters,CharacterEquipment`;
    return this.http.get(url, { headers: this.getDestinyHeaders() })
      .map(res => res.json().Response).toPromise();
  }

  private getDestinyHeaders(): Headers {
    let headers = new Headers();
    headers.append("X-API-Key", "106c3e8ee80248b5bd0514c7f966dc47");
    return headers;
  }
}