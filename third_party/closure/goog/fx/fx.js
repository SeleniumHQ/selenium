/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Legacy stub for the goog.fx namespace.  Requires the moved
 * namespaces. Animation and easing have been moved to animation.js and
 * easing.js.  Users of this stub should move off so we may remove it in the
 * future.
 *
 * @suppress {extraRequire} All the requires in this file are "extra"
 * because this file is not actually using them.
 */

goog.provide('goog.fx');

goog.require('goog.asserts');
goog.require('goog.fx.Animation');
goog.require('goog.fx.Animation.EventType');
goog.require('goog.fx.Animation.State');
goog.require('goog.fx.AnimationEvent');
goog.require('goog.fx.Transition.EventType');
goog.require('goog.fx.easing');
