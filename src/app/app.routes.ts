import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { BrowseComponent } from './browse/browse.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'browse/:label/:address', component: BrowseComponent },
  { path: '**', redirectTo: '' }
];
