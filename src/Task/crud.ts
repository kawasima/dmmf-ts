namespace CRUDApplication {
    type TaskId = string

    type Task = {
        taskId: TaskId
        name: string
        dueDate: Date
    }

    type UpdateTaskCommand = {
        taskId: string
        name: string
        dueDate: string
    }

    type UpdatedTaskEvent = {
        taskId: string        
    }
    // ValidationしてTask型にマッピング
    type parseTask = (command: UpdateTaskCommand) => Task
    type saveTask = (db:any) => (task: Task) => void
    type UpdateTaskUsecase = (command: UpdateTaskCommand) => UpdatedTaskEvent
}

