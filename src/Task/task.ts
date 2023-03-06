type TaskId = string
type PostponableUndoneTask = {
    id: TaskId;
    name: string;
    dueDate: Date;
}
type UndoneTaskWithDeadLine = {
    id: TaskId;
    name: string;
    dueDate: Date;
}
type DoneTask = {
    id: TaskId;
    name: string;
}

//
type UndoneTask = PostponableUndoneTask | UndoneTaskWithDeadLine
type Task = UndoneTask | DoneTask

// Function
type postpone = (task: PostponableUndoneTask) => UndoneTask
type done = (task: UndoneTask) => DoneTask


//--- UseCase ---
type PostponeTaskCommand = {
    taskId: string
}

type PostponedTaskEvent = {
    taskId: string
    dueDate: Date
}

interface TaskRepository {
    findById: (id: TaskId) => Task,
    save: (task: Task) => void,
}
type parseTaskId = (ts: string) => TaskId
type postponeTaskUsecase = (taskRepository: TaskRepository) =>
    (command: PostponeTaskCommand) => PostponedTaskEvent

