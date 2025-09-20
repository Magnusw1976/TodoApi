import { computed, Injectable, resource, signal } from '@angular/core';
import { TodoItemDTO } from '../models/data-contracts';

@Injectable({
  providedIn: 'root'
})
export class TodosService {
  
  selectedTodoId = signal<number | undefined>(undefined);

  todos = resource<TodoItemDTO[], string>({
    params: () => '',
    loader: async () => {
      console.log('Loading todos from API...');
      const response = await fetch('/api/TodoItems');
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      const json = await response.json();
      console.log('Fetched todos:', json);
      return json;
    }
  });
  
  todo = resource<TodoItemDTO | undefined, number | undefined>({
    params: this.selectedTodoId,
    loader: async (id) => {
      if (id === undefined) {
        return undefined;
      }
      const response = await fetch(`/api/TodoItems/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch todo');
      }
      const json = await response.json();
      console.log('Fetched todo:', json);
      return json;
    }
  });

  async saveNewTodo(todo:TodoItemDTO): Promise<TodoItemDTO> {
    const response = await fetch('/api/TodoItems', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(todo)
    });
    if (!response.ok) {
      throw new Error('Failed to save new todo');
    }
    const json:TodoItemDTO = await response.json();
    this.selectedTodoId.set(json.id);
    console.log('Saved new todo:', json);
    this.todos.reload();
    this.todo.reload();
    return json;
  }

  async saveTodo(todo:TodoItemDTO): Promise<TodoItemDTO> {
    const response = await fetch(`/api/TodoItems/${todo.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(todo)
    });
    if (!response.ok) {
      throw new Error('Failed to save todo');
    }
    const json:TodoItemDTO = await response.json();
    this.selectedTodoId.set(json.id);
    console.log('Saved todo:', json);
    this.todos.reload();
    this.todo.reload();
    return json;
  }

  async deleteTodo(id:number): Promise<void> {
    const response = await fetch(`/api/TodoItems/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('Failed to delete todo');
    }
    console.log('Deleted todo:', id);
    this.selectedTodoId.set(undefined);
    this.todos.reload();
    this.todo.reload();
  }
}
