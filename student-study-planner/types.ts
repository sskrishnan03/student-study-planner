export enum SubjectType {
  Theory = 'Theory',
  Practical = 'Practical',
}

export interface Subject {
  id: string;
  title: string;
  type: SubjectType;
  instructor?: string;
  semester?: string;
  progress: number; // 0-100
  color: string;
}

export enum TaskStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Submitted = 'Submitted',
}

export enum Priority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High'
}

export interface Task {
  id: string;
  subjectId: string;
  title: string;
  deadline: string;
  priority: Priority;
  status: TaskStatus;
}

export interface Exam {
    id: string;
    subjectId: string;
    title: string;
    date: string;
    type: SubjectType;
}

export interface Note {
    id: string;
    subjectId: string;
    title: string;
    content: string;
    createdAt: string;
    lastModified: string;
}

export enum GoalStatus {
    NotStarted = 'Not Started',
    InProgress = 'In Progress',
    Completed = 'Completed',
}

export interface Goal {
    id:string;
    title: string;
    description: string;
    targetDate: string;
    status: GoalStatus;
}

export interface TimetableEvent {
    id: string;
    subjectId?: string;
    title: string;
    day: number; // 0 for Sunday, 1 for Monday, etc.
    startTime: string; // "HH:mm"
    endTime: string; // "HH:mm"
    color: string;
}