import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { SummaryComponent } from './summary/summary.component';
import { AddtaskComponent } from './addtask/addtask.component';
import { ContactsComponent } from './contacts/contacts.component';
import { BoardComponent } from './board/board.component';
import { UserHelpComponent } from './user-help/user-help.component';
import { LegalNoticeComponent } from './legal-notice/legal-notice.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';


export  const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'summary', component: SummaryComponent},
  {path: 'addtask', component: AddtaskComponent},
  {path: 'contacts', component: ContactsComponent},
  {path: 'board', component: BoardComponent},
  {path: 'help', component: UserHelpComponent},
  {path: 'legal-notice', component: LegalNoticeComponent},
  {path: 'privacy-policy', component: PrivacyPolicyComponent},

];
