import basem = require('./ClientApiBases');
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import NotificationInterfaces = require("./interfaces/NotificationInterfaces");
import VSSInterfaces = require("./interfaces/common/VSSInterfaces");
export interface INotificationApi extends basem.ClientApiBase {
    performBatchNotificationOperations(operation: NotificationInterfaces.BatchNotificationOperation): Promise<void>;
    getNotificationTracing(subscriptionId: string): Promise<NotificationInterfaces.NotificationTracing>;
    updateNotificationTracing(setParameters: NotificationInterfaces.NotificationTracingSetParameters, subscriptionId: string): Promise<NotificationInterfaces.NotificationTracing>;
    publishEvent(notificationEvent: VSSInterfaces.VssNotificationEvent): Promise<VSSInterfaces.VssNotificationEvent>;
    queryEventTypes(inputValuesQuery: NotificationInterfaces.FieldValuesQuery, eventType: string): Promise<NotificationInterfaces.NotificationEventField[]>;
    getEventType(eventType: string): Promise<NotificationInterfaces.NotificationEventType>;
    listEventTypes(publisherId?: string): Promise<NotificationInterfaces.NotificationEventType[]>;
    getNotificationReasons(notificationId: number): Promise<NotificationInterfaces.NotificationReason>;
    listNotificationReasons(notificationIds?: number): Promise<NotificationInterfaces.NotificationReason[]>;
    getSubscriber(subscriberId: string): Promise<NotificationInterfaces.NotificationSubscriber>;
    updateSubscriber(updateParameters: NotificationInterfaces.NotificationSubscriberUpdateParameters, subscriberId: string): Promise<NotificationInterfaces.NotificationSubscriber>;
    querySubscriptions(subscriptionQuery: NotificationInterfaces.SubscriptionQuery): Promise<NotificationInterfaces.NotificationSubscription[]>;
    createSubscription(createParameters: NotificationInterfaces.NotificationSubscriptionCreateParameters): Promise<NotificationInterfaces.NotificationSubscription>;
    deleteSubscription(subscriptionId: string): Promise<void>;
    getSubscription(subscriptionId: string, queryFlags?: NotificationInterfaces.SubscriptionQueryFlags): Promise<NotificationInterfaces.NotificationSubscription>;
    listSubscriptions(targetId?: string, ids?: string[], queryFlags?: NotificationInterfaces.SubscriptionQueryFlags): Promise<NotificationInterfaces.NotificationSubscription[]>;
    updateSubscription(updateParameters: NotificationInterfaces.NotificationSubscriptionUpdateParameters, subscriptionId: string): Promise<NotificationInterfaces.NotificationSubscription>;
    getSubscriptionTemplates(): Promise<NotificationInterfaces.NotificationSubscriptionTemplate[]>;
    updateSubscriptionUserSettings(userSettings: NotificationInterfaces.SubscriptionUserSettings, subscriptionId: string, userId: string): Promise<NotificationInterfaces.SubscriptionUserSettings>;
}
export declare class NotificationApi extends basem.ClientApiBase implements INotificationApi {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions);
    /**
     * @param {NotificationInterfaces.BatchNotificationOperation} operation
     */
    performBatchNotificationOperations(operation: NotificationInterfaces.BatchNotificationOperation): Promise<void>;
    /**
     * @param {string} subscriptionId
     */
    getNotificationTracing(subscriptionId: string): Promise<NotificationInterfaces.NotificationTracing>;
    /**
     * @param {NotificationInterfaces.NotificationTracingSetParameters} setParameters
     * @param {string} subscriptionId
     */
    updateNotificationTracing(setParameters: NotificationInterfaces.NotificationTracingSetParameters, subscriptionId: string): Promise<NotificationInterfaces.NotificationTracing>;
    /**
     * Publish an event.
     *
     * @param {VSSInterfaces.VssNotificationEvent} notificationEvent
     */
    publishEvent(notificationEvent: VSSInterfaces.VssNotificationEvent): Promise<VSSInterfaces.VssNotificationEvent>;
    /**
     * @param {NotificationInterfaces.FieldValuesQuery} inputValuesQuery
     * @param {string} eventType
     */
    queryEventTypes(inputValuesQuery: NotificationInterfaces.FieldValuesQuery, eventType: string): Promise<NotificationInterfaces.NotificationEventField[]>;
    /**
     * Get a specific event type.
     *
     * @param {string} eventType
     */
    getEventType(eventType: string): Promise<NotificationInterfaces.NotificationEventType>;
    /**
     * List available event types for this service. Optionally filter by only event types for the specified publisher.
     *
     * @param {string} publisherId - Limit to event types for this publisher
     */
    listEventTypes(publisherId?: string): Promise<NotificationInterfaces.NotificationEventType[]>;
    /**
     * @param {number} notificationId
     */
    getNotificationReasons(notificationId: number): Promise<NotificationInterfaces.NotificationReason>;
    /**
     * @param {number} notificationIds
     */
    listNotificationReasons(notificationIds?: number): Promise<NotificationInterfaces.NotificationReason[]>;
    /**
     * @param {string} subscriberId
     */
    getSubscriber(subscriberId: string): Promise<NotificationInterfaces.NotificationSubscriber>;
    /**
     * @param {NotificationInterfaces.NotificationSubscriberUpdateParameters} updateParameters
     * @param {string} subscriberId
     */
    updateSubscriber(updateParameters: NotificationInterfaces.NotificationSubscriberUpdateParameters, subscriberId: string): Promise<NotificationInterfaces.NotificationSubscriber>;
    /**
     * Query for subscriptions. A subscription is returned if it matches one or more of the specified conditions.
     *
     * @param {NotificationInterfaces.SubscriptionQuery} subscriptionQuery
     */
    querySubscriptions(subscriptionQuery: NotificationInterfaces.SubscriptionQuery): Promise<NotificationInterfaces.NotificationSubscription[]>;
    /**
     * Create a new subscription.
     *
     * @param {NotificationInterfaces.NotificationSubscriptionCreateParameters} createParameters
     */
    createSubscription(createParameters: NotificationInterfaces.NotificationSubscriptionCreateParameters): Promise<NotificationInterfaces.NotificationSubscription>;
    /**
     * Delete a subscription.
     *
     * @param {string} subscriptionId
     */
    deleteSubscription(subscriptionId: string): Promise<void>;
    /**
     * Get a notification subscription by its ID.
     *
     * @param {string} subscriptionId
     * @param {NotificationInterfaces.SubscriptionQueryFlags} queryFlags
     */
    getSubscription(subscriptionId: string, queryFlags?: NotificationInterfaces.SubscriptionQueryFlags): Promise<NotificationInterfaces.NotificationSubscription>;
    /**
     * @param {string} targetId
     * @param {string[]} ids
     * @param {NotificationInterfaces.SubscriptionQueryFlags} queryFlags
     */
    listSubscriptions(targetId?: string, ids?: string[], queryFlags?: NotificationInterfaces.SubscriptionQueryFlags): Promise<NotificationInterfaces.NotificationSubscription[]>;
    /**
     * Update an existing subscription. Depending on the type of subscription and permissions, the caller can update the description, filter settings, channel (delivery) settings and more.
     *
     * @param {NotificationInterfaces.NotificationSubscriptionUpdateParameters} updateParameters
     * @param {string} subscriptionId
     */
    updateSubscription(updateParameters: NotificationInterfaces.NotificationSubscriptionUpdateParameters, subscriptionId: string): Promise<NotificationInterfaces.NotificationSubscription>;
    /**
     * Get available subscription templates.
     *
     */
    getSubscriptionTemplates(): Promise<NotificationInterfaces.NotificationSubscriptionTemplate[]>;
    /**
     * Update the specified user's settings for the specified subscription. This API is typically used to opt in or out of a shared subscription. User settings can only be applied to shared subscriptions, like team subscriptions or default subscriptions.
     *
     * @param {NotificationInterfaces.SubscriptionUserSettings} userSettings
     * @param {string} subscriptionId
     * @param {string} userId - ID of the user
     */
    updateSubscriptionUserSettings(userSettings: NotificationInterfaces.SubscriptionUserSettings, subscriptionId: string, userId: string): Promise<NotificationInterfaces.SubscriptionUserSettings>;
}
