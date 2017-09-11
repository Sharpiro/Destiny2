import { Component, OnInit } from '@angular/core';
import { DatabaseService } from "./database.service";
import * as idbKeyval from 'idb-keyval';

@Component({
  selector: 'app-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.css']
})
export class DatabaseComponent implements OnInit {

  constructor(private databaseService: DatabaseService) { }

  ngOnInit() {
    // const url = "https://sharpirotestfunctions.azurewebsites.net/api/FacebookCallback";
    // const url = "https://www.bungie.net/Platform/Destiny2/Manifest/";
    const url = "https://www.bungie.net/common/destiny2_content/sqlite/en/world_sql_content_281de46e3cd73e5747595936fd2dffa9.content";

    // var temp = [1, 2, 3];
    // const typedArray = new Uint8Array(temp);
    // const typedArrayString = typedArray.toString();
    // console.log(typedArrayString);

    // var base64 = btoa(typedArrayString);
    // var backToNormal = atob(base64);
    // console.log(base64);
    // console.log(backToNormal);

    // localStorage.setItem("test", "test");

    this.databaseService.getData(url).subscribe(res => {
      // console.log(res);
      var blob = res.arrayBuffer();
      var fileReader = new FileReader();
      // fileReader.readAsArrayBuffer(blob);
      // var temp = fileReader.result;
      // console.log(temp);


      const typedArray = new Uint8Array(blob);
      idbKeyval.get("test").then(val => console.log(val));
      // idbKeyval.set("test", typedArray).then(resX => {
      //   console.log("added to storage?");
      // });
      // const base64 = btoa(typedArray.toString())
      // localStorage.setItem("test", base64);
      // console.log(base64);
    });
  }
}