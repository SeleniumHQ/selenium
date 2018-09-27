"use strict";
//*******************************************************************************************************
// significant portions of this file copied from: VSO\src\Vssf\WebPlatform\Platform\Scripts\VSS\WebApi\RestClient.ts
//*******************************************************************************************************
Object.defineProperty(exports, "__esModule", { value: true });
/// Imports of 3rd Party ///
const url = require("url");
const path = require("path");
class InvalidApiResourceVersionError {
    constructor(message) {
        this.name = "Invalid resource version";
        this.message = message;
    }
}
exports.InvalidApiResourceVersionError = InvalidApiResourceVersionError;
/**
 * Base class that should be used (derived from) to make requests to VSS REST apis
 */
class VsoClient {
    constructor(baseUrl, restClient) {
        this.baseUrl = baseUrl;
        this.basePath = url.parse(baseUrl).pathname;
        this.restClient = restClient;
        this._locationsByAreaPromises = {};
        this._initializationPromise = Promise.resolve(true);
    }
    autoNegotiateApiVersion(location, requestedVersion) {
        let negotiatedVersion;
        let apiVersion;
        let apiVersionString;
        if (requestedVersion) {
            let apiVersionRegEx = new RegExp('(\\d+(\\.\\d+)?)(-preview(\\.(\\d+))?)?');
            // Need to handle 3 types of api versions + invalid apiversion
            // '2.1-preview.1' = ["2.1-preview.1", "2.1", ".1", -preview.1", ".1", "1"]
            // '2.1-preview' = ["2.1-preview", "2.1", ".1", "-preview", undefined, undefined]
            // '2.1' = ["2.1", "2.1", ".1", undefined, undefined, undefined]
            let isPreview = false;
            let resourceVersion;
            let regExExecArray = apiVersionRegEx.exec(requestedVersion);
            if (regExExecArray) {
                if (regExExecArray[1]) {
                    // we have an api version
                    apiVersion = +regExExecArray[1];
                    apiVersionString = regExExecArray[1];
                    if (regExExecArray[3]) {
                        // requesting preview
                        isPreview = true;
                        if (regExExecArray[5]) {
                            // we have a resource version
                            resourceVersion = +regExExecArray[5];
                        }
                    }
                    // compare the location version and requestedversion
                    if (apiVersion <= +location.releasedVersion
                        || (!resourceVersion && apiVersion <= +location.maxVersion && isPreview)
                        || (resourceVersion && apiVersion <= +location.maxVersion && resourceVersion <= +location.resourceVersion)) {
                        negotiatedVersion = requestedVersion;
                    }
                    // else fall back to latest version of the resource from location
                }
            }
        }
        if (!negotiatedVersion) {
            // Use the latest version of the resource if the api version was not specified in the request or if the requested version is higher then the location's supported version
            if (apiVersion < +location.maxVersion) {
                negotiatedVersion = apiVersionString + "-preview";
            }
            else if (location.maxVersion === location.releasedVersion) {
                negotiatedVersion = location.maxVersion;
            }
            else {
                negotiatedVersion = location.maxVersion + "-preview." + location.resourceVersion;
            }
        }
        return negotiatedVersion;
    }
    /**
     * Gets the route template for a resource based on its location ID and negotiates the api version
     */
    getVersioningData(apiVersion, area, locationId, routeValues, queryParams) {
        let requestUrl;
        return new Promise((resolve, reject) => {
            this.beginGetLocation(area, locationId)
                .then((location) => {
                if (!location) {
                    throw new Error("Failed to find api location for area: " + area + " id: " + locationId);
                }
                apiVersion = this.autoNegotiateApiVersion(location, apiVersion);
                requestUrl = this.getRequestUrl(location.routeTemplate, location.area, location.resourceName, routeValues, queryParams);
                let versionData = {
                    apiVersion: apiVersion,
                    requestUrl: requestUrl
                };
                resolve(versionData);
            }, (err) => {
                reject(err);
            });
        });
    }
    /**
     * Sets a promise that is waited on before any requests are issued. Can be used to asynchronously
     * set the request url and auth token manager.
     */
    _setInitializationPromise(promise) {
        if (promise) {
            this._initializationPromise = promise;
        }
    }
    /**
     * Gets information about an API resource location (route template, supported versions, etc.)
     *
     * @param area resource area name
     * @param locationId Guid of the location to get
     */
    beginGetLocation(area, locationId) {
        return this._initializationPromise.then(() => {
            return this.beginGetAreaLocations(area);
        }).then((areaLocations) => {
            return areaLocations[(locationId || "").toLowerCase()];
        });
    }
    beginGetAreaLocations(area) {
        let areaLocationsPromise = this._locationsByAreaPromises[area];
        if (!areaLocationsPromise) {
            areaLocationsPromise = new Promise((resolve, reject) => {
                let requestUrl = this.resolveUrl(VsoClient.APIS_RELATIVE_PATH + "/" + area);
                this.restClient.options(requestUrl)
                    .then((res) => {
                    let locationsLookup = {};
                    let resourceLocations = res.result.value;
                    let i;
                    for (i = 0; i < resourceLocations.length; i++) {
                        let resourceLocation = resourceLocations[i];
                        locationsLookup[resourceLocation.id.toLowerCase()] = resourceLocation;
                    }
                    resolve(locationsLookup);
                })
                    .catch((err) => {
                    reject(err);
                });
            });
            this._locationsByAreaPromises[area] = areaLocationsPromise;
        }
        return areaLocationsPromise;
    }
    resolveUrl(relativeUrl) {
        return url.resolve(this.baseUrl, path.join(this.basePath, relativeUrl));
    }
    getSerializedObject(object) {
        let value = "";
        let first = true;
        for (let property in object) {
            if (object.hasOwnProperty(property)) {
                let prop = object[property];
                if (first && prop !== undefined) {
                    value += property + "=" + encodeURIComponent(prop);
                    first = false;
                }
                else if (prop !== undefined) {
                    value += "&" + property + "=" + encodeURIComponent(prop);
                }
            }
        }
        return value;
    }
    getRequestUrl(routeTemplate, area, resource, routeValues, queryParams) {
        // Add area/resource route values (based on the location)
        routeValues = routeValues || {};
        if (!routeValues.area) {
            routeValues.area = area;
        }
        if (!routeValues.resource) {
            routeValues.resource = resource;
        }
        // Replace templated route values
        let relativeUrl = this.replaceRouteValues(routeTemplate, routeValues);
        //append query parameters to the end
        let first = true;
        for (let queryValue in queryParams) {
            if (queryParams[queryValue] != null) {
                let value = queryParams[queryValue];
                let valueString = null;
                if (typeof (value) === 'object') {
                    valueString = this.getSerializedObject(value);
                }
                else {
                    valueString = queryValue + "=" + encodeURIComponent(queryParams[queryValue]);
                }
                if (first) {
                    relativeUrl += "?" + valueString;
                    first = false;
                }
                else {
                    relativeUrl += "&" + valueString;
                }
            }
        }
        //resolve the relative url with the base
        return url.resolve(this.baseUrl, path.join(this.basePath, relativeUrl));
    }
    // helper method copied directly from VSS\WebAPI\restclient.ts
    replaceRouteValues(routeTemplate, routeValues) {
        let result = "", currentPathPart = "", paramName = "", insideParam = false, charIndex, routeTemplateLength = routeTemplate.length, c;
        for (charIndex = 0; charIndex < routeTemplateLength; charIndex++) {
            c = routeTemplate[charIndex];
            if (insideParam) {
                if (c == "}") {
                    insideParam = false;
                    if (routeValues[paramName]) {
                        currentPathPart += encodeURIComponent(routeValues[paramName]);
                    }
                    else {
                        // Normalize param name in order to capture wild-card routes
                        let strippedParamName = paramName.replace(/[^a-z0-9]/ig, '');
                        if (routeValues[strippedParamName]) {
                            currentPathPart += encodeURIComponent(routeValues[strippedParamName]);
                        }
                    }
                    paramName = "";
                }
                else {
                    paramName += c;
                }
            }
            else {
                if (c == "/") {
                    if (currentPathPart) {
                        if (result) {
                            result += "/";
                        }
                        result += currentPathPart;
                        currentPathPart = "";
                    }
                }
                else if (c == "{") {
                    if ((charIndex + 1) < routeTemplateLength && routeTemplate[charIndex + 1] == "{") {
                        // Escaped '{'
                        currentPathPart += c;
                        charIndex++;
                    }
                    else {
                        insideParam = true;
                    }
                }
                else if (c == '}') {
                    currentPathPart += c;
                    if ((charIndex + 1) < routeTemplateLength && routeTemplate[charIndex + 1] == "}") {
                        // Escaped '}'
                        charIndex++;
                    }
                }
                else {
                    currentPathPart += c;
                }
            }
        }
        if (currentPathPart) {
            if (result) {
                result += "/";
            }
            result += currentPathPart;
        }
        return result;
    }
}
VsoClient.APIS_RELATIVE_PATH = "_apis";
VsoClient.PREVIEW_INDICATOR = "-preview.";
exports.VsoClient = VsoClient;
