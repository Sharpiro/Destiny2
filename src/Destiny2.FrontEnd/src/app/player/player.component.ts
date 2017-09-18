import { Component, OnInit } from '@angular/core';
import { DestinyApiService } from '../shared/destinyApi.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {
  private playerName = "sharpirox";
  private currentPlayer: Player;
  private currentPlatformKVP = MembershipType.XBOX;
  // private platforms = MembershipType;
  private platforms = [
    { value: MembershipType[MembershipType.PS], key: MembershipType.PS },
    { value: MembershipType[MembershipType.XBOX], key: MembershipType.XBOX },
    { value: MembershipType[MembershipType.PC], key: MembershipType.PC }
  ];

  constructor(private destinyApiService: DestinyApiService, private router: Router, private route: ActivatedRoute) { }

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      var platformString = params["membershipType"].toUpperCase();
      var platform = +MembershipType[platformString];

      if (!platform) {
        var navigateResponse = await this.router.navigate([`player`]);
        return;
      }
      this.currentPlatformKVP = platform;
    });
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

  public onPlatformChange() {
    console.log(this.currentPlatformKVP);
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