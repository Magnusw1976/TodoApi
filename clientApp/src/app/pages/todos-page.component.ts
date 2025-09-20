import { Component, computed, inject, input } from '@angular/core';
import { PageHeaderComponent } from '../components/page-header.component';
import { PageComponent } from "../components/ui/page.component";
import { TodosService } from '../services/todos.service';
import { TodoListComponent } from '../components/todo-list.component';

@Component({
  selector: 'app-todos-page',
  imports: [PageComponent, TodoListComponent],
  template: `
    <app-page title="Att göra sidan">
      <app-todo-list/>
    </app-page>
  `,
  styles: ``
})
export class TodosPageComponent {
  todosService = inject(TodosService);

  numTodos = computed(() => this.todosService.todos.value()?.length ?? 0);
}
