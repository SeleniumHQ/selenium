// Copyright 2014 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('goog.pubsub.TypedPubSub');

goog.require('goog.Disposable');
goog.require('goog.pubsub.PubSub');



/**
 * This object is a temporary shim that provides goog.pubsub.TopicId support
 * for goog.pubsub.PubSub.  See b/12477087 for more info.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.pubsub.TypedPubSub = function() {
  goog.pubsub.TypedPubSub.base(this, 'constructor');

  this.pubSub_ = new goog.pubsub.PubSub();
  this.registerDisposable(this.pubSub_);
};
goog.inherits(goog.pubsub.TypedPubSub, goog.Disposable);


/**
 * See {@code goog.pubsub.PubSub.subscribe}.
 * @param {!goog.pubsub.TopicId<PAYLOAD>} topic Topic to subscribe to.
 * @param {function(this:CONTEXT, PAYLOAD)} fn Function to be invoked when a
 *     message is published to the given topic.
 * @param {CONTEXT=} opt_context Object in whose context the function is to be
 *     called (the global scope if none).
 * @return {number} Subscription key.
 * @template PAYLOAD, CONTEXT
 */
goog.pubsub.TypedPubSub.prototype.subscribe = function(topic, fn, opt_context) {
  return this.pubSub_.subscribe(topic.toString(), fn, opt_context);
};


/**
 * See {@code goog.pubsub.PubSub.subscribeOnce}.
 * @param {!goog.pubsub.TopicId<PAYLOAD>} topic Topic to subscribe to.
 * @param {function(this:CONTEXT, PAYLOAD)} fn Function to be invoked once and
 *     then unsubscribed when a message is published to the given topic.
 * @param {CONTEXT=} opt_context Object in whose context the function is to be
 *     called (the global scope if none).
 * @return {number} Subscription key.
 * @template PAYLOAD, CONTEXT
 */
goog.pubsub.TypedPubSub.prototype.subscribeOnce = function(
    topic, fn, opt_context) {
  return this.pubSub_.subscribeOnce(topic.toString(), fn, opt_context);
};


/**
 * See {@code goog.pubsub.PubSub.unsubscribe}.
 * @param {!goog.pubsub.TopicId<PAYLOAD>} topic Topic to unsubscribe from.
 * @param {function(this:CONTEXT, PAYLOAD)} fn Function to unsubscribe.
 * @param {CONTEXT=} opt_context Object in whose context the function was to be
 *     called (the global scope if none).
 * @return {boolean} Whether a matching subscription was removed.
 * @template PAYLOAD, CONTEXT
 */
goog.pubsub.TypedPubSub.prototype.unsubscribe = function(
    topic, fn, opt_context) {
  return this.pubSub_.unsubscribe(topic.toString(), fn, opt_context);
};


/**
 * See {@code goog.pubsub.PubSub.unsubscribeByKey}.
 * @param {number} key Subscription key.
 * @return {boolean} Whether a matching subscription was removed.
 */
goog.pubsub.TypedPubSub.prototype.unsubscribeByKey = function(key) {
  return this.pubSub_.unsubscribeByKey(key);
};


/**
 * See {@code goog.pubsub.PubSub.publish}.
 * @param {!goog.pubsub.TopicId<PAYLOAD>} topic Topic to publish to.
 * @param {PAYLOAD} payload Payload passed to each subscription function.
 * @return {boolean} Whether any subscriptions were called.
 * @template PAYLOAD
 */
goog.pubsub.TypedPubSub.prototype.publish = function(topic, payload) {
  return this.pubSub_.publish(topic.toString(), payload);
};


/**
 * See {@code goog.pubsub.PubSub.clear}.
 * @param {!goog.pubsub.TopicId<PAYLOAD>=} opt_topic Topic to clear (all topics
 *     if unspecified).
 * @template PAYLOAD
 */
goog.pubsub.TypedPubSub.prototype.clear = function(opt_topic) {
  this.pubSub_.clear(goog.isDef(opt_topic) ? opt_topic.toString() : undefined);
};


/**
 * See {@code goog.pubsub.PubSub.getCount}.
 * @param {!goog.pubsub.TopicId<PAYLOAD>=} opt_topic The topic (all topics if
 *     unspecified).
 * @return {number} Number of subscriptions to the topic.
 * @template PAYLOAD
 */
goog.pubsub.TypedPubSub.prototype.getCount = function(opt_topic) {
  return this.pubSub_.getCount(
      goog.isDef(opt_topic) ? opt_topic.toString() : undefined);
};
