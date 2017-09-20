import { Component, OnInit } from '@angular/core';
import { DestinyApiService } from '../shared/destinyApi.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MembershipType, Player } from '../shared/models/player';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {
  private playerName = "sharpirox";
  private currentPlayer: Player;
  private currentPlatformKVP = MembershipType.XBOX;
  private characters: any[];
  private platforms = [
    { value: MembershipType[MembershipType.PS], key: MembershipType.PS },
    { value: MembershipType[MembershipType.XBOX], key: MembershipType.XBOX },
    { value: MembershipType[MembershipType.PC], key: MembershipType.PC }
  ];

  constructor(private destinyApiService: DestinyApiService, private router: Router, private route: ActivatedRoute) { }

  async ngOnInit() {
    console.log("initializing player component");

    this.route.params.subscribe(async params => {
      var platformString = params["membershipType"].toUpperCase();
      var platform = +MembershipType[platformString];
      if (platform < 0) {
        await this.router.navigate([`player/XBOX`]);
        return;
      }
      this.currentPlatformKVP = platform;
      let playerName = params["displayName"];
      if (playerName) {
        this.playerName = playerName;
        this.finishSearchPlayer(playerName);
      }
    });
  }

  public async beginSearchPlayer(playerName: string) {
    if (!playerName) return;
    console.log(`beginning searching player '${playerName}...`);
    this.characters = null;
    var platformString = MembershipType[this.currentPlatformKVP];
    let navigateResponse = await this.router.navigate([`player/${platformString}/${playerName}`]);
    if (navigateResponse) return;
    console.log("searching player w/o navigation");
    this.finishSearchPlayer(playerName);
  }

  private async finishSearchPlayer(playerName: string) {
    console.log(`finishing searching player '${playerName}...`);
    this.currentPlayer = await this.destinyApiService.searchPlayer(playerName, this.currentPlatformKVP);
    this.characters = await this.destinyApiService.getAccountDetails(this.currentPlayer.membershipType, this.currentPlayer.membershipId);
    console.log(this.characters);
  }
}