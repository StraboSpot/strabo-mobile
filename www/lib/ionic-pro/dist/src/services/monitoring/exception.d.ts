import MonitoringCapture from './capture';
import { MonitoringExtra } from '../../definitions';
export default class MonitoringException extends MonitoringCapture {
    constructor(error: any, extra?: MonitoringExtra);
    private clean;
    /**
     * Some file URLS are bad, real bad. Including iOS with the full
     * path to some obscure location in the bundle.
     *
     * This cleans that up and tries to just remove the path relative to www
     * which should match the name of the sourcemap.
     */
    private cleanOffendingFile;
    /**
     * Check if a given frame came from our app code.
     */
    private isFrameInApp;
}
