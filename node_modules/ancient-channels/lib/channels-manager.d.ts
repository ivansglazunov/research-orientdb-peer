import { TClass, IInstance } from 'ancient-mixins/lib/mixins';
import { IManager, IManagerEventsList } from 'ancient-mixins/lib/manager';
import { IChannelPkgEventData, TChannel } from './channel';
declare type TChannelsManager = IChannelsManager<TChannel, IChannelsManagerEventsList>;
interface IChannelsManagerEventData extends IChannelPkgEventData {
    manager: TChannelsManager;
}
interface IChannelsManagerEventsList extends IManagerEventsList {
    connect: IChannelsManagerEventData;
    connected: IChannelsManagerEventData;
    disconnect: IChannelsManagerEventData;
    disconnected: IChannelsManagerEventData;
    got: IChannelsManagerEventData;
    send: IChannelsManagerEventData;
    pack: IChannelsManagerEventData;
    unpack: IChannelsManagerEventData;
}
interface IChannelsManager<IN extends TChannel, IEventsList extends IChannelsManagerEventsList> extends IManager<IN, IEventsList> {
}
declare function mixin<T extends TClass<IInstance>>(superClass: T): any;
declare const MixedChannelsManager: TClass<TChannelsManager>;
declare class ChannelsManager extends MixedChannelsManager {
}
export { mixin as default, mixin, MixedChannelsManager, ChannelsManager, IChannelsManager, IChannelsManagerEventData, IChannelsManagerEventsList, TChannelsManager };
