import { TClass, IInstance } from './mixins';
import { INode, INodeEventsList, TNode } from './node';
declare type TManager = IManager<TNode, IManagerEventsList>;
interface IManagerEventData {
    node: TNode;
    manager: TManager;
}
interface IManagerEventsList extends INodeEventsList {
    added: IManagerEventData;
    removed: IManagerEventData;
}
interface IManager<IN, IEventsList extends IManagerEventsList> extends INode<IEventsList> {
    Node: TClass<IN>;
    nodes: {
        [id: string]: IN;
    };
    add(node: IN): this;
    wrap(node: IN): this;
    remove(node: IN): this;
    create(id?: string): IN;
}
declare function mixin<T extends TClass<IInstance>>(superClass: T): any;
declare const MixedManager: TClass<TManager>;
declare class Manager extends MixedManager {
}
export { mixin as default, mixin, MixedManager, Manager, IManager, IManagerEventData, IManagerEventsList, TNode, TManager };
