export declare class EventEmitter {
    constructor();
    setMaxListeners(n: number): this;
    emit(type: string, ...args: any[]): boolean;
    addListener(type: string, listener: Function): this;    
    on(type: string, listener: Function): this;
    once(type: string, listener: Function): this;
    removeListener(type: string, listener: Function): this;
    removeAllListeners(type: string): this;
    listeners(type: string): Function[]
    listenerCount(type: string): number;
}
