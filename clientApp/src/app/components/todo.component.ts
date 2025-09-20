import { Component, computed, inject, input, OnInit } from '@angular/core';
import { TodoItemDTO } from '../models/data-contracts';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TodosService } from '../services/todos.service';
import { CommonModule } from '@angular/common';
import { DeleteButtonComponent } from './ui/buttons/delete-button.component';

@Component({
  selector: 'app-todo',
  imports: [ReactiveFormsModule, CommonModule, DeleteButtonComponent],
  template: `
    <li [ngClass]="{'todo': true,
      'todo-active': isNewestTodo() && !todo().isComplete,
      'todo-completed': todo().isComplete}">
      <div>{{ todo().name }}</div>  
      <input type="checkbox" [formControl]="this.formGroup.controls.isComplete" (change)="saveTodo();"/>
      <app-delete-button (onDelete)="deleteTodo()"></app-delete-button>
    </li>
  `,
  styles: ``
})
export class TodoComponent implements OnInit {
  
  todoService = inject(TodosService);
  fb = inject(FormBuilder);

  todo = input.required<TodoItemDTO>();

  isNewestTodo = computed(() => {
    return this.todo().id === (this.todoService.todo.value()?.id ?? -1);
  });
  formGroup = this.fb.group({
    id: [0],
    name: [''],
    isComplete: [false]
  });

  ngOnInit(): void {
    this.formGroup.controls.id.setValue(this.todo().id ?? null);
    this.formGroup.controls.name.setValue(this.todo().name ?? null);
    this.formGroup.controls.isComplete.setValue(this.todo().isComplete ?? false);
  }

  async saveTodo() {
    console.log('Spara todo', this.formGroup.value);
    await this.todoService.saveTodo(this.formGroup.value as TodoItemDTO);
  } 
  async deleteTodo() {
    if(this.todo().id){
      await this.todoService.deleteTodo(this.todo().id as number);
    }    
  }
}
