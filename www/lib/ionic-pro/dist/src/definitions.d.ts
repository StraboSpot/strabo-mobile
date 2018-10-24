/// <reference types="cordova-plugin-ionic" />
import { Monitoring } from './services/monitoring';
import { Api } from './api';
import { Device } from './util/device';
import { AppManifest } from './util/manifest';
export interface MonitoringErrorMeta {
    type: 'exception' | 'log';
}
export interface MonitoringLogOptions {
    level: 'info' | 'warn' | 'error';
    syntheticTrace?: boolean;
}
export interface MonitoringExtra {
    [x: string]: any;
}
export interface MonitoringStackTrace {
    stack: any[];
}
export interface Options {
    appVersion?: string;
    apiUrl: string;
    pluginResolveTimeout: number;
    monitoringSyncFrequency: number;
}
export interface App {
    options: Options;
    appId: string;
    version: string;
    device: Device;
    api: Api;
    manifest: AppManifest;
    monitoring: Monitoring;
    deploy: IDeployPluginAPI;
    getFramework(): string;
    getAppId(): string;
    getPlugin(): Promise<Window['IonicCordova']>;
    getSnapshotId(): Promise<string>;
    getChannel(): Promise<string>;
}
