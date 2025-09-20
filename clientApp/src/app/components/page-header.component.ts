import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  imports: [],
  template: `
    <div class="page-header">
      <h1>{{title()}}</h1>
    </div>
  `,
  styles: ``
})
export class PageHeaderComponent {
  title = input.required<string>();
}
