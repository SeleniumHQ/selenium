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

/**
 * @fileoverview Identifies commands which should always execute in the
 * top frame. This information is maintained in an independent file to avoid
 * circular dependencies.
 */

goog.provide('safaridriver.inject.commands.TOP_FRAME_COMMANDS');

goog.require('webdriver.CommandName');


/**
 * The set of command names that should always be handled by the topmost frame,
 * regardless of whether it is currently active.
 * @type {!Object.<webdriver.CommandName, number>}
 * @const
 */
safaridriver.inject.commands.TOP_FRAME_COMMANDS = {};


goog.scope(function() {
var CommandName = webdriver.CommandName;
var TopFrameCommands = safaridriver.inject.commands.TOP_FRAME_COMMANDS;

TopFrameCommands[CommandName.GET] = 1;
TopFrameCommands[CommandName.REFRESH] = 1;
TopFrameCommands[CommandName.GO_BACK] = 1;
TopFrameCommands[CommandName.GO_FORWARD] = 1;
TopFrameCommands[CommandName.GET_TITLE] = 1;
// The extension handles window switches. It sends the command to this
// injected script only as a means of retrieving the window name.
TopFrameCommands[CommandName.SWITCH_TO_WINDOW] = 1;
TopFrameCommands[CommandName.GET_WINDOW_POSITION] = 1;
TopFrameCommands[CommandName.GET_WINDOW_SIZE] = 1;
TopFrameCommands[CommandName.SET_WINDOW_POSITION] = 1;
TopFrameCommands[CommandName.SET_WINDOW_SIZE] = 1;
TopFrameCommands[CommandName.MAXIMIZE_WINDOW] = 1;
});  // goog.scope
