import { Component, computed, inject, input } from '@angular/core';
import { PageHeaderComponent } from '../components/page-header.component';
import { PageComponent } from "../components/ui/page.component";
import { TodosService } from '../services/todos.service';

@Component({
  selector: 'app-todos-page',
  imports: [PageComponent],
  template: `
    <app-page title="Dina Todo's">
      Du har {{numTodos()}} todo(s).
    </app-page>
  `,
  styles: ``
})
export class TodosPageComponent {
  todosService = inject(TodosService);

  numTodos = computed(() => this.todosService.todos.value()?.length ?? 0);
}
