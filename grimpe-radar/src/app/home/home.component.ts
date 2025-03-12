import {
  Component,
  input,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { BanAutocompleteNgComponent, BanFeature } from 'ban-autocomplete-ng';

import { InfiniteScrollDirective } from 'ngx-infinite-scroll';

interface SalleEscalade {
  inst_nom: string;
  inst_adresse: string;
  inst_cp: string;
  inst_actif: string;
  new_name: string;
  coordonnees: {
    lat: number;
    lon: number;
  };
}
interface DataESResult {
  results: SalleEscalade[];
  total_count: number;
}
const pageSize = 5;

@Component({
  selector: 'app-root',
  imports: [BanAutocompleteNgComponent, InfiniteScrollDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class HomeComponent {
  title = 'grimpe-radar';
  searchAddress = signal<BanFeature | undefined>(undefined);
  currentAddress: BanFeature | undefined;
  currentDistance = 0;
  salles: SalleEscalade[] = [];
  distance = 10;
  index = 0;
  maxIndex = 0;
  state:
    | 'inactive'
    | 'searching'
    | 'searching-more'
    | 'found'
    | 'empty'
    | 'done' = 'inactive';

  onScroll() {
    console.log('Scrolled');
    if (this.index >= this.maxIndex) {
      return;
    }
    this.state = 'searching-more';
    this.find();
  }

  onChangeDistance(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.distance = parseInt(target.value);
  }
  onSubmit(event: Event): boolean {
    event.preventDefault();
    if (this.searchAddress()) {
      this.currentAddress = this.searchAddress();
      this.currentDistance = this.distance;
      this.index = 0;
      this.state = 'searching';
      this.find();
      this.salles = [];
    }
    return false;
  }

  private find() {
    const url = new URL(
      'https://equipements.sports.gouv.fr/api/explore/v2.1/catalog/datasets/data-es/records'
    );
    url.searchParams.append(
      'where',
      `search(equip_type_famille,"Structure Artificielle d'Escalade") and within_distance(coordonnees, geom'${this
        .currentAddress?.wktPoint!}', ${this.currentDistance}km)`
    );
    url.searchParams.append('limit', pageSize.toString());
    url.searchParams.append(
      'order_by',
      `distance(coordonnees, geom'${this.currentAddress?.wktPoint!}')`
    );
    if (this.index > 0) {
      url.searchParams.append('offset', this.index.toString());
    }
    const banRequest = new Request(url);
    fetch(banRequest)
      .then((response) => {
        return response.json();
      })
      .then((json: DataESResult) => {
        this.maxIndex = json.total_count;
        this.index += json.results.length;
        this.salles = this.salles.concat(json.results);
        if (this.index == 0) {
          this.state = 'empty';
        } else if (this.index >= this.maxIndex) {
          this.state = 'done';
        } else {
          this.state = 'found';
        }
      });
  }
}
