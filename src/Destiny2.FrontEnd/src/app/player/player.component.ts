import { Component, OnInit } from '@angular/core';
import { DestinyApiService } from '../shared/destinyApi.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {
  private playerName = "sharpirox";
  private currentPlayer: Player;
  private currentPlatformKVP = MembershipType.XBOX;
  private temp = MembershipType;
  private platformDropDown = [
    { key: MembershipType[MembershipType.PS], value: MembershipType.PS },
    { key: MembershipType[MembershipType.XBOX], value: MembershipType.XBOX },
    { key: MembershipType[MembershipType.PC], value: MembershipType.PC }
  ];

  constructor(private destinyApiService: DestinyApiService) { }

  async ngOnInit() {

  }

  public async searchPlayer(playerName: string) {
    if (!playerName) return;
    console.log(`searching player '${playerName}...`);
    let response = await this.destinyApiService.searchPlayer(playerName, 1);
    var body = response.json();
    if (body.Response.length === 0) throw new Error("player not found");
    var playerData = body.Response[0];
    this.currentPlayer = new Player({
      displayName: playerName,
      membershipId: playerData.membershipId,
      membershipType: playerData.MembershipType
    });
    console.log(this.currentPlayer);
  }

  public onPlatformChange(currentPlatform) {
    console.log(currentPlatform);
  }
}

class Player {
  public membershipType: MembershipType;
  public membershipId: string;
  public displayName: string;

  public constructor(init?: Partial<Player>) {
    Object.assign(this, init);
  }
}

enum MembershipType { PS, XBOX, PC }