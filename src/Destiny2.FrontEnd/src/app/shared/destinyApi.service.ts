import { Injectable } from '@angular/core';
import { Http, ResponseContentType, Headers } from "@angular/http"
import 'rxjs/Rx';
import { MembershipType, Player } from './models/player';
import { StaticDataService } from './static-data.service';
import { MemoryService } from './memory.service';
import { DestinyHttpService } from './destiny-http.service';

@Injectable()
export class DestinyApiService {

  constructor(private destinyHttpService: DestinyHttpService,
    private memoryService: MemoryService, private staticDataService: StaticDataService) { }

  public async searchPlayer(playerName: string, platform = 1) {
    var playerData = await this.destinyHttpService.searchPlayer(playerName, platform);
    return new Player({
      displayName: playerName,
      membershipId: playerData.membershipId,
      membershipType: playerData.membershipType
    });
  }

  public async getAccountDetails(membershipType: MembershipType, membershipId: string) {
    let resJson = await this.destinyHttpService.getAccountDetails(membershipType, membershipId);
    let charactersJson = resJson.characters.data;
    let charactersEquipmentJson = resJson.characterEquipment.data;
    var characterIds = Object.getOwnPropertyNames(resJson.characters.data);
    var charactersInfo = await Promise.all(characterIds.map(i => this.getCharacterData(charactersJson, charactersEquipmentJson, i)));
    return charactersInfo;
  }

  private async getCharacterData(charactersJson, charactersEquipmentJson, characterId: string) {
    let characterJson = charactersJson[characterId];
    let characterEquipmentJson = charactersEquipmentJson[characterId];
    var characterInfo = {
      characterId: characterJson.characterId,
      classHash: characterJson.classHash,
      classType: characterJson.classType,
      className: this.staticDataService.getClassByType(characterJson.classType),
      emblemPath: characterJson.emblemPath,
      emblemBackgroundPath: characterJson.emblemBackgroundPath,
      emblemHash: characterJson.emblemHash,
      genderHash: characterJson.genderHash,
      genderType: characterJson.genderType,
      genderName: this.staticDataService.getGenderByType(characterJson.genderType),
      light: characterJson.light,
      raceHash: characterJson.raceHash,
      raceType: characterJson.raceType,
      raceName: this.staticDataService.getRaceByType(characterJson.raceType),
      items: await Promise.all((<any[]>characterEquipmentJson.items).map(async i => {
        var item = await this.memoryService.getHash(i.itemHash, "DestinyInventoryItemDefinition");
        item.itemInstanceId = i.itemInstanceId;
        return item;
      }))
    };
    return characterInfo;
  }
}