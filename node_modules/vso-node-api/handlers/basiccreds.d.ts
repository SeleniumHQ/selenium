import VsoBaseInterfaces = require('../interfaces/common/VsoBaseInterfaces');
export declare class BasicCredentialHandler implements VsoBaseInterfaces.IRequestHandler {
    username: string;
    password: string;
    constructor(username: string, password: string);
    prepareRequest(options: any): void;
    canHandleAuthentication(res: VsoBaseInterfaces.IHttpResponse): boolean;
    handleAuthentication(httpClient: any, protocol: any, options: any, objs: any, finalCallback: any): void;
}
