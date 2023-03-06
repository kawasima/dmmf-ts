import z from "zod"
import { match } from "ts-pattern"

namespace withZod {
const TaskId = z.string().uuid()
type TaskId = z.infer<typeof TaskId>

const PostponableUndoneTask = z.object({
    id: TaskId,
    type: z.literal("PostponableUndoneTask"),
    name: z.string().min(1),
    dueDate: z.date(),
    postponeCount: z.number().int().positive()
})
type PostponableUndoneTask = z.infer<typeof PostponableUndoneTask>

const UndoneTaskWithDeadLine = z.object({
    id: TaskId,
    type: z.literal("UndoneTaskWithDeadLine"),
    name: z.string().min(1),
    dueDate: z.date(),
})
type UndoneTaskWithDeadLine = z.infer<typeof UndoneTaskWithDeadLine>

const DoneTask = z.object({
    id: TaskId,
    type: z.literal("DoneTask"),
    name: z.string().min(1),
})
type DoneTask = z.infer<typeof DoneTask>

//
const UndoneTask = z.union([PostponableUndoneTask, UndoneTaskWithDeadLine])
type UndoneTask = z.infer<typeof UndoneTask>
const Task = z.discriminatedUnion("type", [
    PostponableUndoneTask,
    UndoneTaskWithDeadLine,
    DoneTask
])
type Task = z.infer<typeof Task>

// Function
type Postpone = (task: PostponableUndoneTask) => UndoneTask
type Done = (task: UndoneTask) => DoneTask

//--- UseCase ---
const PostponeTaskCommand = z.object({
    taskId: z.string()
})

const PostponedTaskEvent = z.object({
    taskId: z.string(),
    dueDate: z.date(),
})
interface TaskRepository {
    findById: (taskId: TaskId) => Task
    save: (task: Task) => Task
}

// User Interfaces
type PostponeTaskUsecase = (taskRepository: TaskRepository) =>
    (command: PostponeTaskCommand) => PostponedTaskEvent

// Implementation
const postpone:Postpone = task => task.postponeCount < 3 ?
    PostponableUndoneTask.parse({...task,
        dueDate: new Date(task.dueDate.getTime() + 24*60*60*1000),
        postponeCount: task.postponeCount + 1,
    })
    :
    UndoneTaskWithDeadLine.parse({
        id: task.id,
        name: task.name,
        dueDate: task.dueDate
    })

const done:Done = task => DoneTask.parse({id: task.id, name: task.name})

const postponeTaskUsecase: PostponeTaskUsecase = (taskRepository) =>
    command => {
        const taskId = TaskId.parse(command.taskId)
        const task = taskRepository.findById(taskId)
        const postponedTask = match(task)
            .with({type: "PostponableUndoneTask"}, t => postpone(t))
            .otherwise(_ => { throw new Error("延期できません") })
        taskRepository.save(postponedTask)
        return PostponedTaskEvent.parse({taskId, dueDate: postponedTask.dueDate})
    }
}