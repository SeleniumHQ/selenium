import VsoBaseInterfaces = require('../interfaces/common/VsoBaseInterfaces');
export declare class PersonalAccessTokenCredentialHandler implements VsoBaseInterfaces.IRequestHandler {
    token: string;
    constructor(token: string);
    prepareRequest(options: any): void;
    canHandleAuthentication(res: VsoBaseInterfaces.IHttpResponse): boolean;
    handleAuthentication(httpClient: any, protocol: any, options: any, objs: any, finalCallback: any): void;
}
