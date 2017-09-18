import { Injectable } from '@angular/core';
import { Http, ResponseContentType, Headers } from "@angular/http"
import 'rxjs/Rx';
import { MembershipType } from './models/player';
import { DatabaseService } from './database.service';

@Injectable()
export class DestinyApiService {
  private baseApiUrl = "https://www.bungie.net/Platform/Destiny2";
  private baseContentUrl = "https://www.bungie.net";
  private testField = 1;

  constructor(private http: Http, private databaseService: DatabaseService) { }

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
    return this.http.get(url, { headers: this.getDestinyHeaders() }).toPromise();
  }

  public getAccountDetails(membershipType: MembershipType, membershipId: string) {
    const url = `https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=Characters,CharacterEquipment`;
    return this.http.get(url, { headers: this.getDestinyHeaders() })
      .map(res => {
        var json = res.json();
        let charactersJson = json.Response.characters.data;
        let charactersEquipmentJson = json.Response.characterEquipment.data;
        var characterIds = Object.getOwnPropertyNames(json.Response.characters.data);
        var charactersInfo = characterIds.map(getCharacterData);
        return charactersInfo;

        function getCharacterData(characterId: string) {
          let characterJson = charactersJson[characterId];
          let characterEquipmentJson = charactersEquipmentJson[characterId];
          // console.log(characterEquipmentJson);
          return {
            characterId: characterJson.characterId,
            classHash: characterJson.classHash,
            classType: characterJson.classType,
            emblemPath: characterJson.emblemPath,
            emblemBackgroundPath: characterJson.emblemBackgroundPath,
            emblemHash: characterJson.emblemHash,
            genderHash: characterJson.genderHash,
            genderType: characterJson.genderType,
            light: characterJson.light,
            raceHash: characterJson.raceHash,
            raceType: characterJson.raceType,
            items: characterEquipmentJson.items
          };
        }
      }).toPromise();
  }

  private getDestinyHeaders(): Headers {
    let headers = new Headers();
    headers.append("X-API-Key", "106c3e8ee80248b5bd0514c7f966dc47");
    return headers;
  }
}