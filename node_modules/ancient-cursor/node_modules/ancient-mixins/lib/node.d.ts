import { TClass, IInstance } from './mixins';
import { IEvents, IEventsList } from './events';
declare type TNode = INode<INodeEventsList>;
interface INodeEventData {
    node: INode<INodeEventsList>;
}
interface INodeEventsList extends IEventsList {
    destroyed: INodeEventData;
}
interface INode<IEventsList extends INodeEventsList> extends IEvents<IEventsList> {
    id: string;
    new (id?: string): any;
    generateId: () => string;
    isDestroyed: boolean;
    destroy: () => void;
}
declare function mixin<T extends TClass<IInstance>>(superClass: T): any;
declare const MixedNode: TClass<INode<INodeEventsList>>;
declare class Node extends MixedNode {
}
export { mixin as default, mixin, MixedNode, Node, INode, INodeEventData, INodeEventsList, TNode };
