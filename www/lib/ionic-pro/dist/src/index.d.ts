/// <reference types="cordova-plugin-ionic" />
export * from './definitions';
import { Api } from './api';
import { App } from './definitions';
import { Monitoring } from './services/monitoring';
import { AppManifest } from './util/manifest';
import { Device } from './util/device';
/**
 * Pro is the main entry class for the rest of the Pro client.
 */
declare class Pro implements App {
    appId: string;
    static _instance: Pro;
    api: Api;
    device: Device;
    manifest: AppManifest;
    _monitoring: Monitoring;
    options: any;
    deviceInfo: any;
    uid: string;
    version: string;
    private platformReadyInfo;
    private platformReadyPromise;
    private _deployProxy;
    /**
     * Main entry point. Bootstraps the Ionic Pro client.
     */
    static init(appId: string, options?: any): Pro;
    /**
     * Get the singleton App instance.
     */
    static getApp(): Pro;
    readonly monitoring: Monitoring;
    readonly deploy: IDeployPluginAPI;
    /**
     * Interact with Ionic Monitoring using these functions.
     * @tutorial
     * To see examples of Pro.monitoring, please see our docs: https://ionicframework.com/docs/pro/monitoring/.
     */
    static readonly monitoring: Monitoring;
    static readonly deploy: IDeployPluginAPI;
    constructor(appId: string, customOptions?: any);
    /**
     * Get which framework we're running on, if any.
     */
    getFramework(): "angular1" | "angular2";
    /**
     * @return the ID for this app.
     */
    getAppId(): string;
    /**
     * @return a reference to the Ionic Pro Cordova Plugin (if running in Cordova).
     */
    getPlugin(): Promise<Window['IonicCordova'] | undefined>;
    /**
     * Wait for the underlying platform to be "ready."
     *
     * This is primarily important for Cordova, but there's
     * a web fallback. The promise will return which system
     * (either "cordova" or "web") it detected.
     *
     * Can be called repeatedly even if the platform is already ready.
     *
     * @return a promise that resolves once the platform is ready, or if already ready
     */
    platformReady(): Promise<any>;
    /**
     * @return the current snapshot ID of the app running through Ionic Pro Deploy.
     */
    getSnapshotId(): Promise<string>;
    /**
     * @return the current channel of the app running through Ionic Pro Deploy.
     */
    getChannel(): Promise<string>;
    /**
     * Create a local UUID for anonymous tracking
     */
    private createUid;
    /**
     * Wait for some kind of platform ready event.
     */
    private watchPlatformReady;
}
export { Pro };
