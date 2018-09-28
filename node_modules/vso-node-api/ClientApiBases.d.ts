import vsom = require('./VsoClient');
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import * as rm from 'typed-rest-client/RestClient';
import * as hm from 'typed-rest-client/HttpClient';
export declare class ClientApiBase {
    baseUrl: string;
    userAgent: string;
    http: hm.HttpClient;
    rest: rm.RestClient;
    vsoClient: vsom.VsoClient;
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], userAgent?: string, options?: VsoBaseInterfaces.IRequestOptions);
    createAcceptHeader(type: string, apiVersion?: string): string;
    createRequestOptions(type: string, apiVersion?: string): rm.IRequestOptions;
    formatResponse(data: any, responseTypeMetadata: any, isCollection: boolean): any;
}
