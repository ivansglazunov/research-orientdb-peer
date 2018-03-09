import { TClass, IInstance } from 'ancient-mixins/lib/mixins';
import { INode, INodeEventsList } from 'ancient-mixins/lib/node';
declare type TChannel = IChannel<IChannelEventsList>;
declare enum PackageType {
    Disconnect = 1,
    Connect = 2,
    Package = 3,
}
interface IPkgSectionChannel {
    type: PackageType;
}
interface IPkg {
    channel: IPkgSectionChannel;
    data: any;
}
declare type TMsg = string;
interface IChannelPkgEventData {
    channel: TChannel;
    pkg?: IPkg;
    msg?: TMsg;
}
interface IChannelEventsList extends INodeEventsList {
    connect: IChannelPkgEventData;
    connected: IChannelPkgEventData;
    disconnect: IChannelPkgEventData;
    disconnected: IChannelPkgEventData;
    got: IChannelPkgEventData;
    send: IChannelPkgEventData;
    pack: IChannelPkgEventData;
    unpack: IChannelPkgEventData;
}
interface IChannel<IEventsList extends IChannelEventsList> extends INode<IEventsList> {
    isConnected: boolean;
    connect(data?: any): void;
    connected(pkg?: IPkg, msg?: TMsg): void;
    disconnect(data?: any): void;
    disconnected(pkg?: IPkg, msg?: TMsg): void;
    gotPkg(pkg?: IPkg, msg?: TMsg): void;
    got(msg?: TMsg): void;
    send(data?: any): void;
    sendMsg(pkg?: IPkg, msg?: TMsg): void;
    pack(pkg?: IPkg): {
        pkg: IPkg;
        msg: TMsg;
    };
    unpack(msg?: TMsg): {
        pkg: IPkg;
        msg: TMsg;
    };
    serialize(pkg?: IPkg): any;
    deserialize(msg?: TMsg): any;
}
declare function mixin<T extends TClass<IInstance>>(superClass: T): any;
declare const MixedChannel: TClass<IChannel<IChannelEventsList>>;
declare class Channel extends MixedChannel {
}
export { mixin as default, mixin, MixedChannel, Channel, IChannel, PackageType, IPkg, IPkgSectionChannel, TMsg, IChannelPkgEventData, IChannelEventsList, TChannel };
