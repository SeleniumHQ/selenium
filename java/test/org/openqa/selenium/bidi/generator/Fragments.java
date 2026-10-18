// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.bidi.generator;

/**
 * Type nodes copied from the real {@code bidi_schema.json}, trimmed to the fields under test and
 * shared by more than one test class or test.
 */
final class Fragments {

  private Fragments() {}

  static final String STRING_ALIAS = "{'kind': 'alias', 'type': {'primitive': 'string'}}";

  static final String INTEGER_ALIAS = "{'kind': 'alias', 'type': {'primitive': 'integer'}}";

  static final String SET_FORCED_COLORS_MODE_THEME_OVERRIDE_PARAMETERS =
      "{'kind': 'record', 'fields': ["
          + "{'name': 'theme', 'wire': 'theme', 'required': true,"
          + " 'type': {'ref': 'emulation.ForcedColorsModeTheme', 'nullable': true}},"
          + "{'name': 'userContexts', 'wire': 'userContexts', 'required': false,"
          + " 'type': {'list': {'ref': 'browser.UserContext'}}}]}";

  static final String FORCED_COLORS_MODE_THEME =
      "{'kind': 'enum', 'values': ['light', 'dark'], 'primitive': 'string'}";

  static final String SET_VIEWPORT_PARAMETERS =
      "{'kind': 'record', 'fields': ["
          + "{'name': 'context', 'wire': 'context', 'required': false,"
          + " 'type': {'ref': 'browsingContext.BrowsingContext'}},"
          + "{'name': 'viewport', 'wire': 'viewport', 'required': false,"
          + " 'type': {'ref': 'browsingContext.Viewport', 'nullable': true}},"
          + "{'name': 'devicePixelRatio', 'wire': 'devicePixelRatio', 'required': false,"
          + " 'type': {'primitive': 'number', 'nullable': true}}]}";

  static final String VIEWPORT =
      "{'kind': 'record', 'fields': ["
          + "{'name': 'width', 'wire': 'width', 'required': true, 'type': {'ref': 'js-uint'}},"
          + "{'name': 'height', 'wire': 'height', 'required': true, 'type': {'ref': 'js-uint'}}]}";

  static final String STATUS_RESULT =
      "{'kind': 'record', 'fields': ["
          + "{'name': 'ready', 'wire': 'ready', 'required': true,"
          + " 'type': {'primitive': 'boolean'}},"
          + "{'name': 'message', 'wire': 'message', 'required': true,"
          + " 'type': {'primitive': 'string'}}]}";

  static final String GET_CLIENT_WINDOWS_RESULT =
      "{'kind': 'record', 'fields': [{'name': 'clientWindows', 'wire': 'clientWindows',"
          + " 'required': true, 'type': {'list': {'ref': 'browser.ClientWindowInfo'}}}]}";

  static final String CLIENT_WINDOW_INFO =
      "{'kind': 'record', 'fields': [{'name': 'active', 'wire': 'active', 'required': true,"
          + " 'type': {'primitive': 'boolean'}}]}";

  static final String CLOSE_PARAMETERS =
      "{'kind': 'record', 'fields': ["
          + "{'name': 'context', 'wire': 'context', 'required': true,"
          + " 'type': {'ref': 'browsingContext.BrowsingContext'}},"
          + "{'name': 'promptUnload', 'wire': 'promptUnload', 'required': false,"
          + " 'type': {'primitive': 'boolean'}}]}";

  static final String WINDOW_REALM_INFO =
      "{'kind': 'record', 'fields': ["
          + "{'name': 'realm', 'wire': 'realm', 'required': true, 'type': {'ref': 'script.Realm'}},"
          + "{'name': 'type', 'wire': 'type', 'required': true, 'type': {'const': 'window'}},"
          + "{'name': 'context', 'wire': 'context', 'required': true,"
          + " 'type': {'ref': 'browsingContext.BrowsingContext'}},"
          + "{'name': 'sandbox', 'wire': 'sandbox', 'required': false,"
          + " 'type': {'primitive': 'string'}}]}";

  static final String NODE_PROPERTIES =
      "{'kind': 'record', 'fields': ["
          + "{'name': 'nodeType', 'wire': 'nodeType', 'required': true,"
          + " 'type': {'ref': 'js-uint'}},"
          + "{'name': 'attributes', 'wire': 'attributes', 'required': false,"
          + " 'type': {'ref': 'script.NodePropertiesAttributes'}}]}";

  static final String NODE_PROPERTIES_ATTRIBUTES =
      "{'kind': 'record', 'fields': [], 'map': {'primitive': 'string'}, 'synthetic': true,"
          + " 'owner': 'script.NodeProperties', 'label': 'Attributes'}";

  static final String USER_PROMPT_HANDLER =
      "{'kind': 'record', 'fields': ["
          + "{'name': 'alert', 'wire': 'alert', 'required': false,"
          + " 'type': {'ref': 'session.UserPromptHandlerType'}},"
          + "{'name': 'default', 'wire': 'default', 'required': false,"
          + " 'type': {'ref': 'session.UserPromptHandlerType'}}]}";

  static final String USER_PROMPT_HANDLER_TYPE =
      "{'kind': 'enum', 'values': ['accept', 'dismiss', 'ignore'], 'primitive': 'string'}";
}
