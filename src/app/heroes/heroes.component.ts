import { Component, OnInit } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { Hero } from '../hero';
import { HeroService } from '../hero.service';

@Component({
  selector: 'my-heroes',
  // imports: [NgbModule],
  providers: [HeroService],
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css']
})
export class HeroesComponent implements OnInit {
  title = 'Tour of Heroes';
  heroes: Hero[];

  selectedHero: Hero;

  constructor(private heroService: HeroService) { }

  onSelect(hero: Hero): void {
    this.selectedHero = hero;
  }
  getHeroes(): void {
    // this.heroService.getHeroes().then(heroes => this.heroes = heroes);
    this.heroService.getHeroes().subscribe(heroes => this.heroes = heroes);
  }

  add(name: string): void {
    name = name.trim();
    if (!name) { return; }
    this.heroService.addHero({ name } as Hero)
      .subscribe(hero => {
        this.heroes.push(hero);
      });
  }

  delete(hero: Hero): void {
    this.heroes = this.heroes.filter(h => h !== hero);
    this.heroService.deleteHero(hero).subscribe();
  }
  ngOnInit(): void {
    this.getHeroes();
  }
}
