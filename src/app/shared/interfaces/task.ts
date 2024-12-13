
import { Contact } from "./contact";
import { Subtask } from "./subtask";
import { UserProfile } from "./user-profile";

export interface Task {
  title: string;
  description: string;
  dueDate: Date | string;
  subtasks: { title: string; completed: boolean }[];
  priority: 'urgent' | 'medium' | 'low';
  category: 'Technical Task' | 'User Story';
  assignedTo: UserProfile[];
  column: 'toDo' | 'awaitingFeedback' | 'inProgress' | 'done';
}
