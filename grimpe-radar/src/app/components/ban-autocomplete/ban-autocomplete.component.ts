import {
  Component,
  input,
  Input,
  model,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';

interface Ban {
  features: BanFeature[];
}

export interface BanFeature {
  label: string;
  wktPoint?: string;
  properties?: {
    label: string;
    city: string;
    citycode: string;
    id: string;
    type: string;
    population: number;
    context: string;
    municipality: string;
    postcode: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

@Component({
  selector: 'ban-autocomplete',
  imports: [AutocompleteLibModule, TranslateModule],
  template: `
    <div class="ng-autocomplete">
      <ng-autocomplete
        [data]="data"
        [placeholder]="
          placeHolderLabel() ? placeHolderLabel : ('placeHolder' | translate)
        "
        (inputChanged)="onChangeSearch($event, false)"
        [minQueryLength]="minCharacters()"
        [searchKeyword]="'label'"
        [itemTemplate]="itemTemplate() ? itemTemplate()! : defaultItemTemplate"
        [notFoundTemplate]="
          notFoundTemplate() ? notFoundTemplate()! : defaultNotFoundTemplate
        "
        [customFilter]="customFilter"
        (selected)="selected($event)"
      >
        >
      </ng-autocomplete>
      <ng-template #defaultItemTemplate let-item>
        <a>{{ item.properties.label }}</a>
      </ng-template>

      <ng-template #defaultNotFoundTemplate let-notFound>
        <div>
          {{ notFoundLabel() ? notFoundLabel : ('notFound' | translate) }}
        </div>
      </ng-template>
    </div>
  `,
})
export class BanAutocompleteComponent {
  data: BanFeature[] = [];
  minCharacters = input<number>(3);
  maxResults?: number;
  notFoundTemplate = input<TemplateRef<any>>();
  itemTemplate = input<TemplateRef<BanFeature>>();
  placeHolderLabel = input<string>();
  notFoundLabel = input<string>();
  selection = model<BanFeature>();

  selected(event: BanFeature) {
    this.selection.update((oldValue) => event);
  }

  customFilter(items: BanFeature[], query: string) {
    return items;
  }

  onChangeSearch(query: string, updateModel: boolean) {
    this.data = [];
    if (!query) {
      return;
    }
    const banRequest = new Request(
      'http://api-adresse.data.gouv.fr/search/?q=' +
        query +
        '&limit=' +
        (this.maxResults || 7)
    );
    fetch(banRequest)
      .then((response) => {
        return response.json();
      })
      .then((json: Ban) => {
        if (json.features.length === 0) {
          this.data = [];
          return;
        }
        const data = json.features;
        data.forEach((feature) => {
          feature.label = feature.properties!.label;
          feature.wktPoint =
            'POINT(' +
            feature.geometry!.coordinates[0] +
            ' ' +
            feature.geometry!.coordinates[1] +
            ')';
        });
        this.data = data;
      });
  }
}
