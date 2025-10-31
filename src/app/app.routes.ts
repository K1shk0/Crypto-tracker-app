import { Routes } from '@angular/router';

// 1. IMPORTER dine nye komponenter
import { MarketComponent } from './components/market/market';
import { LoginComponent } from './login/login';
import { RegisterComponent as Register} from './register/register';
import { ProfileComponent as Profile} from './profile/profile';
// Du har måske andre imports her, f.eks. MarketComponent

export const routes: Routes = [
  // 1. NÅR BRUGEREN ÅBNER SIDEN (''), SEND THEM TIL '/login'
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  // 2. TILFØJ de nye ruter
  { path: 'market', component: MarketComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: Register },
  { path: 'profile', component: Profile }
  // Sørg for at 'wildcard'-ruten (hvis du har en) er til sidst
  // { path: '**', redirectTo: '' }
];
