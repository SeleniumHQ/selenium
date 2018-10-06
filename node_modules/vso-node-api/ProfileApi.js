"use strict";
/*
* ---------------------------------------------------------
* Copyright(C) Microsoft Corporation. All rights reserved.
* ---------------------------------------------------------
*
* ---------------------------------------------------------
* Generated file, DO NOT EDIT
* ---------------------------------------------------------
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const basem = require("./ClientApiBases");
const ProfileInterfaces = require("./interfaces/ProfileInterfaces");
class ProfileApi extends basem.ClientApiBase {
    constructor(baseUrl, handlers, options) {
        super(baseUrl, handlers, 'node-Profile-api', options);
    }
    /**
    * @param {string} id
    * @param {string} descriptor
    */
    deleteProfileAttribute(id, descriptor) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id
                };
                let queryValues = {
                    descriptor: descriptor,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.2", "Profile", "1392b6ac-d511-492e-af5b-2263e5545a5d", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.del(url, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
    * @param {string} id
    * @param {string} descriptor
    */
    getProfileAttribute(id, descriptor) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id
                };
                let queryValues = {
                    descriptor: descriptor,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.2", "Profile", "1392b6ac-d511-492e-af5b-2263e5545a5d", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ProfileInterfaces.TypeInfo.ProfileAttribute, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
    * @param {string} id
    * @param {string} partition
    * @param {string} modifiedSince
    * @param {string} modifiedAfterRevision
    * @param {boolean} withCoreAttributes
    * @param {string} coreAttributes
    */
    getProfileAttributes(id, partition, modifiedSince, modifiedAfterRevision, withCoreAttributes, coreAttributes) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id
                };
                let queryValues = {
                    partition: partition,
                    modifiedSince: modifiedSince,
                    modifiedAfterRevision: modifiedAfterRevision,
                    withCoreAttributes: withCoreAttributes,
                    coreAttributes: coreAttributes,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.2", "Profile", "1392b6ac-d511-492e-af5b-2263e5545a5d", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ProfileInterfaces.TypeInfo.ProfileAttribute, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
    * @param {any} container
    * @param {string} id
    * @param {string} descriptor
    */
    setProfileAttribute(container, id, descriptor) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id
                };
                let queryValues = {
                    descriptor: descriptor,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.2", "Profile", "1392b6ac-d511-492e-af5b-2263e5545a5d", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, container, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
    * @param {VSSInterfaces.VssJsonCollectionWrapperV<ProfileInterfaces.ProfileAttributeBase<any>[]>} attributesCollection
    * @param {string} id
    */
    setProfileAttributes(attributesCollection, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.2", "Profile", "1392b6ac-d511-492e-af5b-2263e5545a5d", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, attributesCollection, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
    * @param {string} id
    * @param {string} size
    * @param {string} format
    */
    getAvatar(id, size, format) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id
                };
                let queryValues = {
                    size: size,
                    format: format,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "Profile", "67436615-b382-462a-b659-5367a492fb3c", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ProfileInterfaces.TypeInfo.Avatar, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
    * @param {any} container
    * @param {string} id
    * @param {string} size
    * @param {string} format
    * @param {string} displayName
    */
    getAvatarPreview(container, id, size, format, displayName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id
                };
                let queryValues = {
                    size: size,
                    format: format,
                    displayName: displayName,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "Profile", "67436615-b382-462a-b659-5367a492fb3c", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, container, options);
                    let ret = this.formatResponse(res.result, ProfileInterfaces.TypeInfo.Avatar, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
    * @param {string} id
    */
    resetAvatar(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "Profile", "67436615-b382-462a-b659-5367a492fb3c", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.del(url, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
    * @param {any} container
    * @param {string} id
    */
    setAvatar(container, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "Profile", "67436615-b382-462a-b659-5367a492fb3c", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, container, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
    * Lookup up country/region based on provided IPv4, null if using the remote IPv4 address.
    *
    * @param {string} ipaddress - IPv4 address to be used for reverse lookup, null if using RemoteIPAddress in request context
    */
    getGeoRegion(ipaddress) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    ipaddress: ipaddress,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "Profile", "3bcda9c0-3078-48a5-a1e0-83bd05931ad0", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
    * Create profile
    *
    * @param {ProfileInterfaces.CreateProfileContext} createProfileContext - Context for profile creation
    * @param {boolean} autoCreate - Create profile automatically
    */
    createProfile(createProfileContext, autoCreate) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    autoCreate: autoCreate,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.3", "Profile", "f83735dc-483f-4238-a291-d45f6080a9af", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, createProfileContext, options);
                    let ret = this.formatResponse(res.result, ProfileInterfaces.TypeInfo.Profile, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
    * @param {string} id
    * @param {boolean} details
    * @param {boolean} withAttributes
    * @param {string} partition
    * @param {string} coreAttributes
    * @param {boolean} forceRefresh
    */
    getProfile(id, details, withAttributes, partition, coreAttributes, forceRefresh) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id
                };
                let queryValues = {
                    details: details,
                    withAttributes: withAttributes,
                    partition: partition,
                    coreAttributes: coreAttributes,
                    forceRefresh: forceRefresh,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.3", "Profile", "f83735dc-483f-4238-a291-d45f6080a9af", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ProfileInterfaces.TypeInfo.Profile, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
    * Update profile
    *
    * @param {ProfileInterfaces.Profile} profile - Update profile
    * @param {string} id - Profile ID
    */
    updateProfile(profile, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.3", "Profile", "f83735dc-483f-4238-a291-d45f6080a9af", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, profile, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
    */
    getRegions() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "Profile", "92d8d1c9-26b8-4774-a929-d640a73da524", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
    */
    getSupportedLcids() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "Profile", "d5bd1aa6-c269-4bcd-ad32-75fa17475584", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, null, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
    * @param {boolean} includeAvatar
    */
    getUserDefaults(includeAvatar) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    includeAvatar: includeAvatar,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "Profile", "b583a356-1da7-4237-9f4c-1deb2edbc7e8", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ProfileInterfaces.TypeInfo.Profile, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
    * @param {string} id
    */
    refreshUserDefaults(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "Profile", "b583a356-1da7-4237-9f4c-1deb2edbc7e8", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, options);
                    let ret = this.formatResponse(res.result, ProfileInterfaces.TypeInfo.Profile, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
}
exports.ProfileApi = ProfileApi;
