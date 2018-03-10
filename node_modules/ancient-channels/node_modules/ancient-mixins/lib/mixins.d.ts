interface IInstance {
    [key: string]: any;
}
declare type TClass<T> = new (...args: any[]) => T;
export { TClass, IInstance };
