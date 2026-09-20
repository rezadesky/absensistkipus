import { AxiosInstance } from 'axios';
import routeFn from 'ziggy-js';

declare global {
    interface Window {
        axios: AxiosInstance;
    }
    var route: typeof routeFn;
}
