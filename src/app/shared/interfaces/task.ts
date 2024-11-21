
import { Contact } from "./contact";
import { Subtask } from "./subtask";

export interface Task {
  title: string;
  description: string;
  dueDate: Date;
  subtasks: Subtask[];
  priority: 'urgent' | 'medium' | 'low';
  category: 'technical-task' | 'user-story';
  contacts: Contact[];
  column: 'toDo' | 'awaitingFeedback' | 'inProgress' | 'done';
}
