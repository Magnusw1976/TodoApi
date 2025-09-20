import { Component, input } from '@angular/core';
import { PageHeaderComponent } from "../page-header.component";

@Component({
  selector: 'app-page',
  imports: [PageHeaderComponent],
  template: `
    <div class="page">
      <app-page-header [title]="title()"/>
      <ng-content></ng-content>      
    </div>
  `,
  styles: ``
})
export class PageComponent {
  title = input.required<string>();
}
