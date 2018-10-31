/**
 * AppManifest parses the manifest.json which is a standard file for PWA
 * metadata. We inject a few custom fields into this for helping identify
 * snapshots/channels in Pro.
 */
export declare class AppManifest {
    data: any;
    constructor();
    private saveManifest;
    load(): Promise<any>;
}
