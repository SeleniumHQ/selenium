// Copyright 2012 Software Freedom Conservancy. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines the messages exchanged between the extension global
 * page and injected scripts.
 */

goog.provide('safaridriver.MessageType');


/**
 * Message types used by the SafariDriver extension.
 * @enum {string}
 */
safaridriver.MessageType = {

  /**
   * Message sent from an injected script to a child frame to indicate that
   * frame should activate itself with the global page.
   */
  ACTIVATE: 'activate',

  /**
   * Message sent by the global page when there is a command for the injected
   * script to execute.
   */
  COMMAND: 'command',

  /**
   * Message sent by an injected script to the global page to indicate it should
   * open a WebSocket connection to a WebDriver client. The data for this
   * message will be the URI for the WebSocket.
   */
  CONNECT: 'connect',

  /**
   * Message sent by the injected page in response to a global page command.
   */
  RESPONSE: 'response'
};
