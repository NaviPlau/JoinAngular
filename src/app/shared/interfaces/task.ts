
import { Contact } from "./contact";
import { Subtask } from "./subtask";

export interface Task {
  title: string;
  description: string;
  dueDate: Date | string;
  subtasks: { title: string; completed: boolean }[];
  priority: 'urgent' | 'medium' | 'low';
  category: 'Technical Task' | 'User Story';
  assignedTo: Contact[];
  column: 'toDo' | 'awaitingFeedback' | 'inProgress' | 'done';
}
