'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import TaskModel from '../models/TaskModel'
import { TaskData } from '../schemas/Task'
import { errorHandler, makeColdSignal, observableError } from './utils'
import Dirty from '../utils/Dirty'
import {
  default as TaskFetch,
  CreateTaskOptions,
  MoveTaskOptions,
  UpdateTaskOptions,
  ForkTaskOptions,
  GetStageTasksOptions,
  ArchiveTaskResponse,
  UpdateNoteResponse,
  UpdateTagsResponse,
  UpdateStatusResponse,
  UpdateContentResponse,
  UpdateDueDateResponse,
  UpdateExecutorResponse
} from '../fetchs/TaskFetch'
import { OrganizationData } from '../schemas/Organization'

export type detailType = 'complete'

export class TaskAPI {

  getTasklistUndone(_tasklistId: string): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(observer => {
      const get = TaskModel.getTasklistTasksUndone(_tasklistId)
      if (get) {
        return get
      }
      return Observable.fromPromise(TaskFetch.getByTasklist(_tasklistId, {
        isDone: false
      }))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasks => TaskModel.addTasklistTasksUndone(_tasklistId, tasks))
    })
  }

  getMyDueTasks(_userId: string): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(observer => {
      const get = TaskModel.getMyDueTasks()
      if (get) {
        return get
      }
      return Observable.fromPromise(TaskFetch.getTasksMe({
        count: 500,
        page: 1,
        hasDueDate: true,
        isDone: false
      }))
        .catch(err => errorHandler(observer, err))
        .map(Dirty.handlerMytasksApi)
        .concatMap(tasks => TaskModel.addMyDueTasks(_userId, tasks))
    })
  }

  getMyTasks(_userId: string): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(observer => {
      const get = TaskModel.getMyTasks()
      if (get) {
        return get
      }
      return Observable.fromPromise(TaskFetch.getTasksMe({
        count: 500,
        page: 1,
        hasDueDate: false,
        isDone: false
      }))
        .catch(err => errorHandler(observer, err))
        .map(Dirty.handlerMytasksApi)
        .concatMap(tasks => TaskModel.addMyTasks(_userId, tasks))
    })
  }

  getTasklistDone(_tasklistId: string, page = 1): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(observer => {
      const get = TaskModel.getTasklistTasksDone(_tasklistId, page)
      if (get) {
        return get
      }
      return Observable.fromPromise(TaskFetch.getByTasklist(_tasklistId, {
        isDone: true,
        page: page,
        limit: 30
      }))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasks => TaskModel.addTasklistTasksDone(_tasklistId, tasks, page))
    })
  }

  getOrgMyDueTasks(userId: string, organization: OrganizationData, page = 1): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(observer => {
      const get = TaskModel.getOrganizationMyDueTasks(organization._id, page)
      if (get) {
        return get
      }
      return Observable.fromPromise(TaskFetch.getOrgsTasksMe(organization._id, {
        page: page,
        isDone: false,
        hasDuedate: true
      }))
        .catch(err => errorHandler(observer, err))
        .map(Dirty.handlerMytasksApi)
        .concatMap(tasks => TaskModel.addOrganizationMyDueTasks(userId, organization, tasks, page))
    })
  }

  getOrgMyTasks(userId: string, organization: OrganizationData, page = 1): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(observer => {
      const get = TaskModel.getOrganizationMyTasks(organization._id, page)
      if (get) {
        return get
      }
      return Observable.fromPromise(TaskFetch.getOrgsTasksMe(organization._id, {
        page: page,
        isDone: false,
        hasDuedate: false
      }))
        .catch(err => errorHandler(observer, err))
        .map(Dirty.handlerMytasksApi)
        .concatMap(tasks => TaskModel.addOrganizationMyTasks(userId, organization, tasks, page))
    })
  }

  getOrgMyDoneTasks(userId: string, organization: OrganizationData, page = 1): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(observer => {
      const get = TaskModel.getOrganizationMyDoneTasks(organization._id, page)
      if (get) {
        return get
      }
      return Observable.fromPromise(TaskFetch.getOrgsTasksMe(organization._id, {
        page: page,
        isDone: true
      }))
        .catch(err => errorHandler(observer, err))
        .map(Dirty.handlerMytasksApi)
        .concatMap(tasks => TaskModel.addOrganizationMyDoneTasks(userId, organization, tasks, page))
    })
  }

  getOrgMyCreatedTasks(userId: string, organization: OrganizationData, page = 1): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(observer => {
      const get = TaskModel.getOrganizationMyCreatedTasks(organization._id, page)
      if (get) {
        return get
      }
      const maxId = TaskModel.getOrgMyCreatedMaxId(organization._id)
      return Observable.fromPromise(TaskFetch.getOrgsTasksCreated(organization._id, page, maxId))
        .catch(err => errorHandler(observer, err))
        .map(Dirty.handlerMytasksApi)
        .concatMap(tasks => TaskModel.addOrganizationMyCreatedTasks(userId, organization, tasks, page))
    })
  }

  getOrgMyInvolvesTasks(userId: string, organization: OrganizationData, page = 1): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(observer => {
      const get = TaskModel.getOrgInvolvesTasks(organization._id, page)
      if (get) {
        return get
      }
      const maxId = TaskModel.getOrgMyInvolvesMaxId(organization._id)
      return Observable.fromPromise(TaskFetch.getOrgsTasksInvolves(organization._id, page, maxId))
        .catch(err => errorHandler(observer, err))
        .map(Dirty.handlerMytasksApi)
        .concatMap(tasks => TaskModel.addOrgMyInvolvesTasks(userId, organization, tasks, page))
    })
  }

  getProjectTasks(_projectId: string, query?: {
    page?: number
    count?: number
    fileds?: string
  }): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(observer => {
      const page = query && query.page ? query.page : 1
      const get = TaskModel.getProjectTasks(_projectId, page)
      if (get) {
        return get
      }
      return Observable.fromPromise(TaskFetch.getProjectTasks(_projectId, query))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasks => TaskModel.addProjectTasks(_projectId, tasks, page))
    })
  }

  getProjectDoneTasks(_projectId: string, query?: {
    page?: number
    count?: number
    fileds?: string
  }): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(observer => {
      const page = query && query.page ? query.page : 1
      const get = TaskModel.getProjectDoneTasks(_projectId, page)
      if (get) {
        return get
      }
      return Observable.fromPromise(TaskFetch.getProjectDoneTasks(_projectId, query))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasks => TaskModel.addProjectDoneTasks(_projectId, tasks, page))
    })
  }

  getStageTasks(stageId: string, query?: GetStageTasksOptions): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(observer => {
      const get = TaskModel.getStageTasks(stageId)
      if (get) {
        return get
      }
      return Observable.fromPromise(TaskFetch.getStageTasks(stageId, query))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasks => TaskModel.addStageTasks(stageId, tasks))
    })
  }

  getStageDoneTasks(stageId: string, query?: GetStageTasksOptions): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(observer => {
      const page = query && query.page || 1
      const get = TaskModel.getStageDoneTasks(stageId, page)
      if (get) {
        return get
      }
      return Observable.fromPromise(TaskFetch.getStageDoneTasks(stageId, query))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasks => TaskModel.addStageDoneTasks(stageId, tasks, page))
    })
  }

  get(_id: string, detailType?: detailType): Observable<TaskData> {
    return makeColdSignal<TaskData>(observer => {
      const get = TaskModel.getOne(_id)
      if (get && TaskModel.checkSchema(_id)) {
        return get
      }
      return Observable.fromPromise(TaskFetch.get(_id, detailType))
        .catch(err => errorHandler(observer, err))
        .concatMap(task => TaskModel.addOne(task))
    })
  }

  create(taskInfo: CreateTaskOptions): Observable<TaskData> {
    return Observable.create((observer: Observer<TaskData>) => {
      Observable.fromPromise(TaskFetch.create(taskInfo))
        .catch(err => observableError(observer, err))
        .concatMap(task => TaskModel.addOne(task).take(1))
        .forEach(task => observer.next(task))
        .then(() => observer.complete())
    })
  }

  fork(_taskId: string, options: ForkTaskOptions): Observable<TaskData> {
    return Observable.create((observer: Observer<TaskData>) => {
      Observable.fromPromise(TaskFetch.fork(_taskId, options))
        .catch(err => observableError(observer, err))
        .concatMap(task => TaskModel.addOne(task).take(1))
        .forEach(task => observer.next(task))
        .then(() => observer.complete())
    })
  }

  delete(_taskId: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(TaskFetch.delete(_taskId))
        .catch(err => observableError(observer, err))
        .concatMap(x => TaskModel.delete(_taskId))
        .forEach(x => observer.next(null))
        .then(() => observer.complete())
    })
  }

  move(_taskId: string, options: MoveTaskOptions): Observable<TaskData> {
    return Observable.create((observer: Observer<TaskData>) => {
      const promise = TaskFetch.move(_taskId, options)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateContent(_taskId: string, content: string): Observable<UpdateContentResponse> {
    return Observable.create((observer: Observer<UpdateContentResponse>) => {
      const promise = TaskFetch.updateContent(_taskId, content)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateDueDate(_taskId: string, dueDate: string): Observable<UpdateDueDateResponse> {
    return Observable.create((observer: Observer<UpdateDueDateResponse>) => {
      const promise = TaskFetch.updateDueDate(_taskId, dueDate)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateExecutor(_taskId: string, _executorId: string): Observable<UpdateExecutorResponse> {
    return Observable.create((observer: Observer<UpdateExecutorResponse>) => {
      const promise = TaskFetch.updateExecutor(_taskId, _executorId)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateInvolvemembers(_taskId: string, memberIds: string[], type: 'involveMembers' | 'addInvolvers' | 'delInvolvers'): Observable<TaskData> {
    return Observable.create((observer: Observer<TaskData>) => {
      const promise = TaskFetch.updateInvolvemembers(_taskId, memberIds, type)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateNote(_taskId: string, note: string): Observable<UpdateNoteResponse> {
    return Observable.create((observer: Observer<UpdateNoteResponse>) => {
      const promise = TaskFetch.updateNote(_taskId, note)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateStatus(_taskId: string, status: boolean): Observable<UpdateStatusResponse> {
    return Observable.create((observer: Observer<UpdateStatusResponse>) => {
      const promise = TaskFetch.updateStatus(_taskId, status)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  update<T extends UpdateTaskOptions>(_taskId: string, patch: T): Observable<T> {
    return Observable.create((observer: Observer<T>) => {
      const promise = TaskFetch.update(_taskId, patch)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  archive(taskId: string): Observable<ArchiveTaskResponse> {
    return Observable.create((observer: Observer<ArchiveTaskResponse>) => {
      const promise = TaskFetch.archive(taskId)
      this._updateFromPromise(taskId, observer, promise)
    })
  }

  unarchive(taskId: string, stageId: string): Observable<ArchiveTaskResponse> {
    return Observable.create((observer: Observer<ArchiveTaskResponse>) => {
      const promise = TaskFetch.unarchive(taskId, stageId)
      this._updateFromPromise(taskId, observer, promise)
    })
  }

  updateTags(taskId: string, tags: string[]): Observable<UpdateTagsResponse> {
    return Observable.create((observer: Observer<UpdateTagsResponse>) => {
      const promise = TaskFetch.updateTags(taskId, tags)
      this._updateFromPromise(taskId, observer, promise)
    })
  }

  private _updateFromPromise<T>(_taskId: string, observer: Observer<T>, promise: Promise<T>): Promise<void> {
    return Observable.fromPromise(promise)
      .catch(err => observableError(observer, err))
      .concatMap(r => TaskModel.update(_taskId, r))
      .forEach((r: T) => observer.next(r))
      .then(() => observer.complete())
  }
}
