import { Ref } from 'vue'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'

dayjs.extend(duration)
dayjs.extend(utc)

// ========================================== timer ==========================================

interface ITimeTaskParam {
  taskId: string
  startTimeBySecond: number
  shouldUpdate: boolean
}
interface ITimeTask extends ITimeTaskParam {
  timestr: ITimestr // 00:11:22
}
type ITimestr = Ref<string>

interface ITimeTasker {
  tasks: ITimeTask[]
  add(task: ITimeTask): ITimestr
  update(): void
  get(taskId: string): ITimestr | undefined
}

class TimeTasker implements ITimeTasker {
  tasks: ITimeTask[] = []

  public add(task: ITimeTaskParam): ITimestr {
    const foundTask = this.tasks.find((t) => (t.taskId = task.taskId))
    if (foundTask) {
      foundTask.startTimeBySecond = task.startTimeBySecond
      return foundTask.timestr
    }
    const timestr = ref<string>('')
    this.tasks.push({ ...task, timestr })
    return timestr
  }

  public get(taskId: string): ITimestr | undefined {
    const task = this.tasks.find((t) => t.taskId == taskId)
    return task?.timestr
  }

  public update() {
    this.tasks.forEach((task) => {
      if (task.shouldUpdate) {
        let s = Math.round(Date.now() / 1000 - task.startTimeBySecond)
        let d = dayjs.duration(s, 'seconds')
        task.timestr.value = d.format('HH:mm:ss')
      } else {
        task.timestr.value = task.startTimeBySecond
          ? dayjs.utc(task.startTimeBySecond * 1000).format('HH:mm:ss')
          : '--'
      }
    })
  }
}

export const useTimeStr = () => {
  const tasker = new TimeTasker()
  let timer: NodeJS.Timer

  onMounted(() => {
    timer = setInterval(() => {
      tasker.update()
    }, 1000)
  })

  onUnmounted(() => {
    clearInterval(timer)
  })

  return {
    tasker,
  }
}
