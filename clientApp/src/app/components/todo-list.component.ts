import { Component, computed, inject, input } from '@angular/core';
import { TodosService } from '../services/todos.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TodoItemDTO } from '../models/data-contracts';
import { TodoComponent } from './todo.component';

@Component({
  selector: 'app-todo-list',
  imports: [ReactiveFormsModule, CommonModule, TodoComponent],
  template: `
    
    <form [formGroup]="form" (ngSubmit)="AddNewTodo(); form.reset()">
      @if(showCreateForm()){
      <div class="form-row">
        <input formControlName="name" placeholder="Todo name" />
        <button type="submit" [disabled]="form.invalid">Add Todo</button>
      </div>
      }
      <h2>{{listTitle()}} ({{todos().length}})</h2>      
      @if(this.todos().length === 0){
        <div>Inget att göra för tillfället...</div>
      } 
      @else 
      {
        <ul class="todo-list">
        @for(todo of todos(); track todo.id){
          <app-todo [todo]="todo" />
        }
      </ul>  
      }
          
    </form>
  `,
  styles: ``
})
export class TodoListComponent {
  todoService = inject(TodosService);
  fb = inject(FormBuilder);

  todoItems = input.required<TodoItemDTO[]>();
  listTitle = input.required<string>();
  showCreateForm = input<boolean>(false);

  form = this.fb.group({
    id: [0],
    name: ['', [Validators.required]],
    isComplete: [false]
  });
  todos = computed(() => {
    const list = this.todoItems() ?? [];
    return list.sort((a, b) => 
      a.id === this.todoService.selectedTodoId() && b.id !== this.todoService.selectedTodoId() ? -1 
      : a.id !== this.todoService.selectedTodoId() && b.id === this.todoService.selectedTodoId() ? 1 
      : a.isComplete && !b.isComplete ? 1
      : !a.isComplete && b.isComplete ? -1      
      : 0
      || 
      (b.id ?? 0) - (a.id ??
      0
    )
  );
  });

  async AddNewTodo() {
    if (this.form.valid) {
      const todo = await this.todoService.saveNewTodo(this.form.value as TodoItemDTO);
      this.form.controls.id.setValue(0);
      this.form.controls.name.setValue('');
      this.form.controls.isComplete.setValue(false);
      console.log('Har nollställt formuläret', this.form.value);
    }
  }
}
