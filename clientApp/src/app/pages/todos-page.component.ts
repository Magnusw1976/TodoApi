import { Component, computed, inject, input, signal } from '@angular/core';
import { PageHeaderComponent } from '../components/page-header.component';
import { PageComponent } from "../components/ui/page.component";
import { TodosService } from '../services/todos.service';
import { TodoListComponent } from '../components/todo-list.component';

@Component({
  selector: 'app-todos-page',
  imports: [PageComponent, TodoListComponent],
  template: `
    <app-page title="Att göra sidan">
      <div>
      <app-todo-list [todoItems]="activeTodos()" listTitle="Aktiva todo's" />
      <div style="margin: 20px 0;">
        <button (click)="showCompletedList.set(!showCompletedList())">{{showCompletedList() ? 'Dölj slutförda' : 'Visa slutförda'}} ({{completedTodos().length}})</button>
      </div>
      @if(showCompletedList()){
        <app-todo-list [todoItems]="completedTodos()" listTitle="Slutförda todo's" />
      }
      </div>
    </app-page>
  `,
  styles: ``
})
export class TodosPageComponent {
  todosService = inject(TodosService);
  showCompletedList = signal<boolean>(false);

  activeTodos = computed(() => {
    return (this.todosService.todos.value() ?? []).filter(t => !t.isComplete);
  });
  
  completedTodos = computed(() => {
    return (this.todosService.todos.value() ?? []).filter(t => t.isComplete) ?? [];
  });
}
