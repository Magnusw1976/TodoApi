import { Routes } from '@angular/router';
import { TodosPageComponent } from './pages/todos-page.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: TodosPageComponent
    }
];
