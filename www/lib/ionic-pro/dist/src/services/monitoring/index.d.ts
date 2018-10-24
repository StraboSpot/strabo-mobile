import { App, MonitoringExtra, MonitoringLogOptions } from '../../definitions';
declare module 'tracekit';
export declare class Monitoring {
    private app;
    queue: any[];
    timerId: any;
    appId: string;
    framework: string;
    initPromise: Promise<any>;
    constructor(app: App);
    /**
     * Initialize the monitoring plugin by first grabbing device and deploy
     * plugin info, and then identifying the user.
     */
    init(): Promise<void>;
    /**
     * Handle a new error from a given exception.
     */
    handleNewError(err: any, extra?: MonitoringExtra): void;
    /**
     * Returns a wrapped function that catches errors automatically and track them.
     */
    wrap(fn: Function, extra?: MonitoringExtra): () => any;
    /**
     * Call a function and automatically catch errors and track them
     */
    call(fn: Function, extra?: MonitoringExtra): any;
    /**
     * Log a message to the monitoring service.
     */
    log(msg: string, options: MonitoringLogOptions, extra?: MonitoringExtra): void;
    /**
     * Send a custom exception to the monitoring service.
     */
    exception(err: Error, extra?: MonitoringExtra): void;
    private handleCapture;
    drainQueue(): Promise<void>;
}
