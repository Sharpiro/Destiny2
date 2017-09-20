import { Injectable } from '@angular/core';

@Injectable()
export class StaticDataService {

  constructor() { }
  
  public getGenderByType(type: number) {
    return type === 0 ? "Male" : "Female";
  }

  public getClassByType(type: number) {
    switch (type) {
      case 0: return "Titan";
      case 1: return "Hunter";
      case 2: return "Warlock";
    }
  }

  public getRaceByType(type: number) {
    switch (type) {
      case 0: return "Human";
      case 1: return "Awoken";
      case 2: return "Exo";
    }
  }
}