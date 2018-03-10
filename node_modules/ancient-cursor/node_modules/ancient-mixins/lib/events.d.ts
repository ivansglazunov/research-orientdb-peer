/// <reference types="node" />
import * as EventEmitter from 'events';
import { TClass, IInstance } from './mixins';
interface IEvents<IEventsList> extends IInstance {
    emitter: EventEmitter;
    emit<IE extends keyof IEventsList>(eventName: string, data: IEventsList[IE]): this;
    on<IE extends keyof IEventsList>(eventName: string, listener: (data: IEventsList[IE]) => void): this;
    once<IE extends keyof IEventsList>(eventName: string, listener: (data: IEventsList[IE]) => void): this;
    off<IE extends keyof IEventsList>(eventName: string, listener: (data: IEventsList[IE]) => void): this;
    [key: string]: any;
}
interface IEventsList {
    [key: string]: any;
}
declare function mixin<T extends TClass<IInstance>>(superClass: T): any;
declare const MixedEvents: TClass<IEvents<IEventsList>>;
declare class Events extends MixedEvents {
}
export { mixin as default, mixin, MixedEvents, Events, IEvents, IEventsList };
