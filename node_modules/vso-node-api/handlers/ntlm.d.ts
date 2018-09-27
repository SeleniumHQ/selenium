import VsoBaseInterfaces = require('../interfaces/common/VsoBaseInterfaces');
export declare class NtlmCredentialHandler implements VsoBaseInterfaces.IRequestHandler {
    username: string;
    password: string;
    workstation: string;
    domain: string;
    constructor(username: string, password: string, workstation?: string, domain?: string);
    prepareRequest(options: any): void;
    canHandleAuthentication(res: VsoBaseInterfaces.IHttpResponse): boolean;
    handleAuthentication(httpClient: any, protocol: any, options: any, objs: any, finalCallback: any): void;
    private sendType1Message(httpClient, protocol, options, objs, keepaliveAgent, callback);
    private sendType3Message(httpClient, protocol, options, objs, keepaliveAgent, res, callback);
}
