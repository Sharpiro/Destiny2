import { Injectable } from '@angular/core';
import { Http, ResponseContentType, Headers } from "@angular/http"
import 'rxjs/Rx';
import { MembershipType, Player } from './models/player';
import { DatabaseService } from './database.service';
import { MemoryService } from "./memory.service";

@Injectable()
export class DestinyApiService {
  private baseApiUrl = "https://www.bungie.net/Platform/Destiny2";
  private baseContentUrl = "https://www.bungie.net";
  private testField = 1;

  constructor(private http: Http, private databaseService: DatabaseService, private memoryService: MemoryService) { }

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
    return this.http.get(url, { headers: this.getDestinyHeaders() })
      .map(res => {
        let body = res.json();
        if (body.Response.length === 0) throw new Error("player not found");
        let playerData = body.Response[0];
        return new Player({
          displayName: playerName,
          membershipId: playerData.membershipId,
          membershipType: playerData.membershipType
        });
      }).toPromise();
  }

  public getAccountDetails(membershipType: MembershipType, membershipId: string) {
    const url = `${this.baseApiUrl}/${membershipType}/Profile/${membershipId}/?components=Characters,CharacterEquipment`;
    return this.http.get(url, { headers: this.getDestinyHeaders() })
      .map(async res => {
        var json = res.json();
        let charactersJson = json.Response.characters.data;
        let charactersEquipmentJson = json.Response.characterEquipment.data;
        var characterIds = Object.getOwnPropertyNames(json.Response.characters.data);
        var charactersInfo = await Promise.all(characterIds.map(i => this.getCharacterData(charactersJson, charactersEquipmentJson, i)));
        return charactersInfo;
      }).toPromise();
  }

  private async getCharacterData(charactersJson, charactersEquipmentJson, characterId: string) {
    let characterJson = charactersJson[characterId];
    let characterEquipmentJson = charactersEquipmentJson[characterId];
    var characterInfo = {
      characterId: characterJson.characterId,
      classHash: characterJson.classHash,
      classType: characterJson.classType,
      className: this.memoryService.getClassByType(characterJson.classType),
      emblemPath: characterJson.emblemPath,
      emblemBackgroundPath: characterJson.emblemBackgroundPath,
      emblemHash: characterJson.emblemHash,
      genderHash: characterJson.genderHash,
      genderType: characterJson.genderType,
      genderName: this.memoryService.getGenderByType(characterJson.genderType),
      light: characterJson.light,
      raceHash: characterJson.raceHash,
      raceType: characterJson.raceType,
      raceName: this.memoryService.getRaceByType(characterJson.raceType),
      items: await Promise.all((<any[]>characterEquipmentJson.items).map(async i => {
        var item = await this.memoryService.getHash(i.itemHash, "DestinyInventoryItemDefinition");
        item.itemInstanceId = i.itemInstanceId;
        return item;
      }))
    };
    return characterInfo;
  }

  private getDestinyHeaders(): Headers {
    let headers = new Headers();
    headers.append("X-API-Key", "106c3e8ee80248b5bd0514c7f966dc47");
    return headers;
  }
}