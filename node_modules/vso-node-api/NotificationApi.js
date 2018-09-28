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
const NotificationInterfaces = require("./interfaces/NotificationInterfaces");
class NotificationApi extends basem.ClientApiBase {
    constructor(baseUrl, handlers, options) {
        super(baseUrl, handlers, 'node-Notification-api', options);
    }
    /**
     * @param {NotificationInterfaces.BatchNotificationOperation} operation
     */
    performBatchNotificationOperations(operation) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "notification", "8f3c6ab2-5bae-4537-b16e-f84e0955599e", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, operation, options);
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
     * @param {string} subscriptionId
     */
    getNotificationTracing(subscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    subscriptionId: subscriptionId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "notification", "20f1929d-4be7-4c2e-a74e-d47640ff3418", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, NotificationInterfaces.TypeInfo.NotificationTracing, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {NotificationInterfaces.NotificationTracingSetParameters} setParameters
     * @param {string} subscriptionId
     */
    updateNotificationTracing(setParameters, subscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    subscriptionId: subscriptionId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "notification", "20f1929d-4be7-4c2e-a74e-d47640ff3418", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, setParameters, options);
                    let ret = this.formatResponse(res.result, NotificationInterfaces.TypeInfo.NotificationTracing, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Publish an event.
     *
     * @param {VSSInterfaces.VssNotificationEvent} notificationEvent
     */
    publishEvent(notificationEvent) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "notification", "14c57b7a-c0e6-4555-9f51-e067188fdd8e", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, notificationEvent, options);
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
     * @param {NotificationInterfaces.FieldValuesQuery} inputValuesQuery
     * @param {string} eventType
     */
    queryEventTypes(inputValuesQuery, eventType) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    eventType: eventType
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "notification", "b5bbdd21-c178-4398-b6db-0166d910028a", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, inputValuesQuery, options);
                    let ret = this.formatResponse(res.result, NotificationInterfaces.TypeInfo.NotificationEventField, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get a specific event type.
     *
     * @param {string} eventType
     */
    getEventType(eventType) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    eventType: eventType
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "notification", "cc84fb5f-6247-4c7a-aeae-e5a3c3fddb21", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, NotificationInterfaces.TypeInfo.NotificationEventType, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * List available event types for this service. Optionally filter by only event types for the specified publisher.
     *
     * @param {string} publisherId - Limit to event types for this publisher
     */
    listEventTypes(publisherId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    publisherId: publisherId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "notification", "cc84fb5f-6247-4c7a-aeae-e5a3c3fddb21", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, NotificationInterfaces.TypeInfo.NotificationEventType, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {number} notificationId
     */
    getNotificationReasons(notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    notificationId: notificationId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "notification", "19824fa9-1c76-40e6-9cce-cf0b9ca1cb60", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, NotificationInterfaces.TypeInfo.NotificationReason, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {number} notificationIds
     */
    listNotificationReasons(notificationIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    notificationIds: notificationIds,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "notification", "19824fa9-1c76-40e6-9cce-cf0b9ca1cb60", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, NotificationInterfaces.TypeInfo.NotificationReason, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} subscriberId
     */
    getSubscriber(subscriberId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    subscriberId: subscriberId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "notification", "4d5caff1-25ba-430b-b808-7a1f352cc197", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, NotificationInterfaces.TypeInfo.NotificationSubscriber, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {NotificationInterfaces.NotificationSubscriberUpdateParameters} updateParameters
     * @param {string} subscriberId
     */
    updateSubscriber(updateParameters, subscriberId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    subscriberId: subscriberId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "notification", "4d5caff1-25ba-430b-b808-7a1f352cc197", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, updateParameters, options);
                    let ret = this.formatResponse(res.result, NotificationInterfaces.TypeInfo.NotificationSubscriber, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Query for subscriptions. A subscription is returned if it matches one or more of the specified conditions.
     *
     * @param {NotificationInterfaces.SubscriptionQuery} subscriptionQuery
     */
    querySubscriptions(subscriptionQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "notification", "6864db85-08c0-4006-8e8e-cc1bebe31675", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, subscriptionQuery, options);
                    let ret = this.formatResponse(res.result, NotificationInterfaces.TypeInfo.NotificationSubscription, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Create a new subscription.
     *
     * @param {NotificationInterfaces.NotificationSubscriptionCreateParameters} createParameters
     */
    createSubscription(createParameters) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "notification", "70f911d6-abac-488c-85b3-a206bf57e165", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, createParameters, options);
                    let ret = this.formatResponse(res.result, NotificationInterfaces.TypeInfo.NotificationSubscription, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Delete a subscription.
     *
     * @param {string} subscriptionId
     */
    deleteSubscription(subscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    subscriptionId: subscriptionId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "notification", "70f911d6-abac-488c-85b3-a206bf57e165", routeValues);
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
     * Get a notification subscription by its ID.
     *
     * @param {string} subscriptionId
     * @param {NotificationInterfaces.SubscriptionQueryFlags} queryFlags
     */
    getSubscription(subscriptionId, queryFlags) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    subscriptionId: subscriptionId
                };
                let queryValues = {
                    queryFlags: queryFlags,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "notification", "70f911d6-abac-488c-85b3-a206bf57e165", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, NotificationInterfaces.TypeInfo.NotificationSubscription, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} targetId
     * @param {string[]} ids
     * @param {NotificationInterfaces.SubscriptionQueryFlags} queryFlags
     */
    listSubscriptions(targetId, ids, queryFlags) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    targetId: targetId,
                    ids: ids && ids.join(","),
                    queryFlags: queryFlags,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "notification", "70f911d6-abac-488c-85b3-a206bf57e165", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, NotificationInterfaces.TypeInfo.NotificationSubscription, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update an existing subscription. Depending on the type of subscription and permissions, the caller can update the description, filter settings, channel (delivery) settings and more.
     *
     * @param {NotificationInterfaces.NotificationSubscriptionUpdateParameters} updateParameters
     * @param {string} subscriptionId
     */
    updateSubscription(updateParameters, subscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    subscriptionId: subscriptionId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "notification", "70f911d6-abac-488c-85b3-a206bf57e165", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, updateParameters, options);
                    let ret = this.formatResponse(res.result, NotificationInterfaces.TypeInfo.NotificationSubscription, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get available subscription templates.
     *
     */
    getSubscriptionTemplates() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "notification", "fa5d24ba-7484-4f3d-888d-4ec6b1974082", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, NotificationInterfaces.TypeInfo.NotificationSubscriptionTemplate, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update the specified user's settings for the specified subscription. This API is typically used to opt in or out of a shared subscription. User settings can only be applied to shared subscriptions, like team subscriptions or default subscriptions.
     *
     * @param {NotificationInterfaces.SubscriptionUserSettings} userSettings
     * @param {string} subscriptionId
     * @param {string} userId - ID of the user
     */
    updateSubscriptionUserSettings(userSettings, subscriptionId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    subscriptionId: subscriptionId,
                    userId: userId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "notification", "ed5a3dff-aeb5-41b1-b4f7-89e66e58b62e", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, userSettings, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
}
exports.NotificationApi = NotificationApi;
