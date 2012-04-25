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
 * @fileoverview Configures which symbols in the WebDriverJS API should be
 * exported in a user deployable binary.
 */

goog.require('webdriver.Builder');
goog.require('webdriver.Command');
goog.require('webdriver.CommandName');
goog.require('webdriver.EventEmitter');
goog.require('webdriver.Key');
goog.require('webdriver.WebDriver');
goog.require('webdriver.WebElement');
goog.require('webdriver.Session');
goog.require('webdriver.http.CorsClient');
goog.require('webdriver.http.Executor');
goog.require('webdriver.node');
goog.require('webdriver.process');
goog.require('webdriver.promise');


//////////////////////////////////////////////////////////////////////////////
//
//  webdriver.Builder
//
//////////////////////////////////////////////////////////////////////////////
goog.exportSymbol('Builder', webdriver.Builder);
goog.exportProperty(webdriver.Builder, 'SESSION_ID_ENV',
                    webdriver.Builder.SESSION_ID_ENV);
goog.exportProperty(webdriver.Builder, 'SERVER_URL_ENV',
                    webdriver.Builder.SERVER_URL_ENV);
goog.exportProperty(webdriver.Builder, 'DEFAULT_SERVER_URL',
                    webdriver.Builder.DEFAULT_SERVER_URL);
goog.exportProperty(webdriver.Builder.prototype, 'usingServer',
                    webdriver.Builder.prototype.usingServer);
goog.exportProperty(webdriver.Builder.prototype, 'usingSession',
                    webdriver.Builder.prototype.usingSession);
goog.exportProperty(webdriver.Builder.prototype, 'withCapabilities',
                    webdriver.Builder.prototype.withCapabilities);
goog.exportProperty(webdriver.Builder.prototype, 'build',
                    webdriver.Builder.prototype.build);


//////////////////////////////////////////////////////////////////////////////
//
//  webdriver.Command
//
//////////////////////////////////////////////////////////////////////////////
goog.exportSymbol('Command', webdriver.Command);
goog.exportProperty(webdriver.Command.prototype, 'getName',
                    webdriver.Command.prototype.getName);
goog.exportProperty(webdriver.Command.prototype, 'setParameter',
                    webdriver.Command.prototype.setParameter);
goog.exportProperty(webdriver.Command.prototype, 'setParameters',
                    webdriver.Command.prototype.setParameters);
goog.exportProperty(webdriver.Command.prototype, 'getParameter',
                    webdriver.Command.prototype.getParameter);
goog.exportProperty(webdriver.Command.prototype, 'getParameters',
                    webdriver.Command.prototype.getParameters);


//////////////////////////////////////////////////////////////////////////////
//
//  webdriver.CommandName
//
//////////////////////////////////////////////////////////////////////////////
goog.exportSymbol('CommandName.GET_SERVER_STATUS',
                  webdriver.CommandName.GET_SERVER_STATUS);
goog.exportSymbol('CommandName.NEW_SESSION',
                  webdriver.CommandName.NEW_SESSION);
goog.exportSymbol('CommandName.GET_SESSIONS',
                  webdriver.CommandName.GET_SESSIONS);
goog.exportSymbol('CommandName.DESCRIBE_SESSION',
                  webdriver.CommandName.DESCRIBE_SESSION);
goog.exportSymbol('CommandName.CLOSE',
                  webdriver.CommandName.CLOSE);
goog.exportSymbol('CommandName.QUIT',
                  webdriver.CommandName.QUIT);
goog.exportSymbol('CommandName.GET_CURRENT_URL',
                  webdriver.CommandName.GET_CURRENT_URL);
goog.exportSymbol('CommandName.GET',
                  webdriver.CommandName.GET);
goog.exportSymbol('CommandName.GO_BACK',
                  webdriver.CommandName.GO_BACK);
goog.exportSymbol('CommandName.GO_FORWARD',
                  webdriver.CommandName.GO_FORWARD);
goog.exportSymbol('CommandName.REFRESH',
                  webdriver.CommandName.REFRESH);
goog.exportSymbol('CommandName.ADD_COOKIE',
                  webdriver.CommandName.ADD_COOKIE);
goog.exportSymbol('CommandName.GET_COOKIE',
                  webdriver.CommandName.GET_COOKIE);
goog.exportSymbol('CommandName.GET_ALL_COOKIES',
                  webdriver.CommandName.GET_ALL_COOKIES);
goog.exportSymbol('CommandName.DELETE_COOKIE',
                  webdriver.CommandName.DELETE_COOKIE);
goog.exportSymbol('CommandName.DELETE_ALL_COOKIES',
                  webdriver.CommandName.DELETE_ALL_COOKIES);
goog.exportSymbol('CommandName.GET_ACTIVE_ELEMENT',
                  webdriver.CommandName.GET_ACTIVE_ELEMENT);
goog.exportSymbol('CommandName.FIND_ELEMENT',
                  webdriver.CommandName.FIND_ELEMENT);
goog.exportSymbol('CommandName.FIND_ELEMENTS',
                  webdriver.CommandName.FIND_ELEMENTS);
goog.exportSymbol('CommandName.FIND_CHILD_ELEMENT',
                  webdriver.CommandName.FIND_CHILD_ELEMENT);
goog.exportSymbol('CommandName.FIND_CHILD_ELEMENTS',
                  webdriver.CommandName.FIND_CHILD_ELEMENTS);
goog.exportSymbol('CommandName.CLEAR_ELEMENT',
                  webdriver.CommandName.CLEAR_ELEMENT);
goog.exportSymbol('CommandName.CLICK_ELEMENT',
                  webdriver.CommandName.CLICK_ELEMENT);
goog.exportSymbol('CommandName.SEND_KEYS_TO_ELEMENT',
                  webdriver.CommandName.SEND_KEYS_TO_ELEMENT);
goog.exportSymbol('CommandName.SUBMIT_ELEMENT',
                  webdriver.CommandName.SUBMIT_ELEMENT);
goog.exportSymbol('CommandName.GET_CURRENT_WINDOW_HANDLE',
                  webdriver.CommandName.GET_CURRENT_WINDOW_HANDLE);
goog.exportSymbol('CommandName.GET_WINDOW_HANDLES',
                  webdriver.CommandName.GET_WINDOW_HANDLES);
goog.exportSymbol('CommandName.SWITCH_TO_WINDOW',
                  webdriver.CommandName.SWITCH_TO_WINDOW);
goog.exportSymbol('CommandName.SWITCH_TO_FRAME',
                  webdriver.CommandName.SWITCH_TO_FRAME);
goog.exportSymbol('CommandName.GET_PAGE_SOURCE',
                  webdriver.CommandName.GET_PAGE_SOURCE);
goog.exportSymbol('CommandName.GET_TITLE',
                  webdriver.CommandName.GET_TITLE);
goog.exportSymbol('CommandName.EXECUTE_SCRIPT',
                  webdriver.CommandName.EXECUTE_SCRIPT);
goog.exportSymbol('CommandName.EXECUTE_ASYNC_SCRIPT',
                  webdriver.CommandName.EXECUTE_ASYNC_SCRIPT);
goog.exportSymbol('CommandName.GET_ELEMENT_TEXT',
                  webdriver.CommandName.GET_ELEMENT_TEXT);
goog.exportSymbol('CommandName.GET_ELEMENT_TAG_NAME',
                  webdriver.CommandName.GET_ELEMENT_TAG_NAME);
goog.exportSymbol('CommandName.IS_ELEMENT_SELECTED',
                  webdriver.CommandName.IS_ELEMENT_SELECTED);
goog.exportSymbol('CommandName.IS_ELEMENT_ENABLED',
                  webdriver.CommandName.IS_ELEMENT_ENABLED);
goog.exportSymbol('CommandName.IS_ELEMENT_DISPLAYED',
                  webdriver.CommandName.IS_ELEMENT_DISPLAYED);
goog.exportSymbol('CommandName.GET_ELEMENT_LOCATION',
                  webdriver.CommandName.GET_ELEMENT_LOCATION);
goog.exportSymbol('CommandName.GET_ELEMENT_SIZE',
                  webdriver.CommandName.GET_ELEMENT_SIZE);
goog.exportSymbol('CommandName.GET_ELEMENT_ATTRIBUTE',
                  webdriver.CommandName.GET_ELEMENT_ATTRIBUTE);
goog.exportSymbol('CommandName.GET_ELEMENT_VALUE_OF_CSS_PROPERTY',
                  webdriver.CommandName.GET_ELEMENT_VALUE_OF_CSS_PROPERTY);
goog.exportSymbol('CommandName.ELEMENT_EQUALS',
                  webdriver.CommandName.ELEMENT_EQUALS);
goog.exportSymbol('CommandName.SCREENSHOT',
                  webdriver.CommandName.SCREENSHOT);
goog.exportSymbol('CommandName.DIMISS_ALERT',
                  webdriver.CommandName.DIMISS_ALERT);
goog.exportSymbol('CommandName.IMPLICITLY_WAIT',
                  webdriver.CommandName.IMPLICITLY_WAIT);
goog.exportSymbol('CommandName.SET_SCRIPT_TIMEOUT',
                  webdriver.CommandName.SET_SCRIPT_TIMEOUT);
goog.exportSymbol('CommandName.GET_ALERT',
                  webdriver.CommandName.GET_ALERT);
goog.exportSymbol('CommandName.ACCEPT_ALERT',
                  webdriver.CommandName.ACCEPT_ALERT);
goog.exportSymbol('CommandName.DISMISS_ALERT',
                  webdriver.CommandName.DISMISS_ALERT);
goog.exportSymbol('CommandName.GET_ALERT_TEXT',
                  webdriver.CommandName.GET_ALERT_TEXT);
goog.exportSymbol('CommandName.SET_ALERT_VALUE',
                  webdriver.CommandName.SET_ALERT_VALUE);
goog.exportSymbol('CommandName.GET_WINDOW_POSITION',
                  webdriver.CommandName.GET_WINDOW_POSITION);
goog.exportSymbol('CommandName.SET_WINDOW_POSITION',
                  webdriver.CommandName.SET_WINDOW_POSITION);
goog.exportSymbol('CommandName.GET_WINDOW_SIZE',
                  webdriver.CommandName.GET_WINDOW_SIZE);
goog.exportSymbol('CommandName.SET_WINDOW_SIZE',
                  webdriver.CommandName.SET_WINDOW_SIZE);


//////////////////////////////////////////////////////////////////////////////
//
//  webdriver.EventEmitter
//
//////////////////////////////////////////////////////////////////////////////
goog.exportSymbol('EventEmitter', webdriver.EventEmitter);
goog.exportProperty(webdriver.EventEmitter.prototype, 'emit',
                    webdriver.EventEmitter.prototype.emit);
goog.exportProperty(webdriver.EventEmitter.prototype, 'addListener',
                    webdriver.EventEmitter.prototype.addListener);
goog.exportProperty(webdriver.EventEmitter.prototype, 'once',
                    webdriver.EventEmitter.prototype.once);
goog.exportProperty(webdriver.EventEmitter.prototype, 'on',
                    webdriver.EventEmitter.prototype.on);
goog.exportProperty(webdriver.EventEmitter.prototype, 'removeListener',
                    webdriver.EventEmitter.prototype.removeListener);
goog.exportProperty(webdriver.EventEmitter.prototype, 'removeAllListeners',
                    webdriver.EventEmitter.prototype.removeAllListeners);


//////////////////////////////////////////////////////////////////////////////
//
//  webdriver.Key
//
//////////////////////////////////////////////////////////////////////////////
goog.exportSymbol('Key.NULL', webdriver.Key.NULL);
goog.exportSymbol('Key.CANCEL', webdriver.Key.CANCEL);
goog.exportSymbol('Key.HELP', webdriver.Key.HELP);
goog.exportSymbol('Key.BACK_SPACE', webdriver.Key.BACK_SPACE);
goog.exportSymbol('Key.TAB', webdriver.Key.TAB);
goog.exportSymbol('Key.CLEAR', webdriver.Key.CLEAR);
goog.exportSymbol('Key.RETURN', webdriver.Key.RETURN);
goog.exportSymbol('Key.ENTER', webdriver.Key.ENTER);
goog.exportSymbol('Key.SHIFT', webdriver.Key.SHIFT);
goog.exportSymbol('Key.CONTROL', webdriver.Key.CONTROL);
goog.exportSymbol('Key.ALT', webdriver.Key.ALT);
goog.exportSymbol('Key.PAUSE', webdriver.Key.PAUSE);
goog.exportSymbol('Key.ESCAPE', webdriver.Key.ESCAPE);
goog.exportSymbol('Key.SPACE', webdriver.Key.SPACE);
goog.exportSymbol('Key.PAGE_UP', webdriver.Key.PAGE_UP);
goog.exportSymbol('Key.PAGE_DOWN', webdriver.Key.PAGE_DOWN);
goog.exportSymbol('Key.END', webdriver.Key.END);
goog.exportSymbol('Key.HOME', webdriver.Key.HOME);
goog.exportSymbol('Key.ARROW_LEFT', webdriver.Key.ARROW_LEFT);
goog.exportSymbol('Key.LEFT', webdriver.Key.LEFT);
goog.exportSymbol('Key.ARROW_UP', webdriver.Key.ARROW_UP);
goog.exportSymbol('Key.UP', webdriver.Key.UP);
goog.exportSymbol('Key.ARROW_RIGHT', webdriver.Key.ARROW_RIGHT);
goog.exportSymbol('Key.RIGHT', webdriver.Key.RIGHT);
goog.exportSymbol('Key.ARROW_DOWN', webdriver.Key.ARROW_DOWN);
goog.exportSymbol('Key.DOWN', webdriver.Key.DOWN);
goog.exportSymbol('Key.INSERT', webdriver.Key.INSERT);
goog.exportSymbol('Key.DELETE', webdriver.Key.DELETE);
goog.exportSymbol('Key.SEMICOLON', webdriver.Key.SEMICOLON);
goog.exportSymbol('Key.EQUALS', webdriver.Key.EQUALS);
goog.exportSymbol('Key.NUMPAD0', webdriver.Key.NUMPAD0);
goog.exportSymbol('Key.NUMPAD1', webdriver.Key.NUMPAD1);
goog.exportSymbol('Key.NUMPAD2', webdriver.Key.NUMPAD2);
goog.exportSymbol('Key.NUMPAD3', webdriver.Key.NUMPAD3);
goog.exportSymbol('Key.NUMPAD4', webdriver.Key.NUMPAD4);
goog.exportSymbol('Key.NUMPAD5', webdriver.Key.NUMPAD5);
goog.exportSymbol('Key.NUMPAD6', webdriver.Key.NUMPAD6);
goog.exportSymbol('Key.NUMPAD7', webdriver.Key.NUMPAD7);
goog.exportSymbol('Key.NUMPAD8', webdriver.Key.NUMPAD8);
goog.exportSymbol('Key.NUMPAD9', webdriver.Key.NUMPAD9);
goog.exportSymbol('Key.MULTIPLY', webdriver.Key.MULTIPLY);
goog.exportSymbol('Key.ADD', webdriver.Key.ADD);
goog.exportSymbol('Key.SEPARATOR', webdriver.Key.SEPARATOR);
goog.exportSymbol('Key.SUBTRACT', webdriver.Key.SUBTRACT);
goog.exportSymbol('Key.DECIMAL', webdriver.Key.DECIMAL);
goog.exportSymbol('Key.DIVIDE', webdriver.Key.DIVIDE);
goog.exportSymbol('Key.F1', webdriver.Key.F1);
goog.exportSymbol('Key.F2', webdriver.Key.F2);
goog.exportSymbol('Key.F3', webdriver.Key.F3);
goog.exportSymbol('Key.F4', webdriver.Key.F4);
goog.exportSymbol('Key.F5', webdriver.Key.F5);
goog.exportSymbol('Key.F6', webdriver.Key.F6);
goog.exportSymbol('Key.F7', webdriver.Key.F7);
goog.exportSymbol('Key.F8', webdriver.Key.F8);
goog.exportSymbol('Key.F9', webdriver.Key.F9);
goog.exportSymbol('Key.F10', webdriver.Key.F10);
goog.exportSymbol('Key.F11', webdriver.Key.F11);
goog.exportSymbol('Key.F12', webdriver.Key.F12);
goog.exportSymbol('Key.COMMAND', webdriver.Key.COMMAND);
goog.exportSymbol('Key.META', webdriver.Key.META);


//////////////////////////////////////////////////////////////////////////////
//
//  webdriver.WebDriver
//
//////////////////////////////////////////////////////////////////////////////
goog.exportSymbol('WebDriver', webdriver.WebDriver);
goog.exportProperty(webdriver.WebDriver, 'attachToSession',
                    webdriver.WebDriver.attachToSession);
goog.exportProperty(webdriver.WebDriver, 'createSession',
                    webdriver.WebDriver.createSession);
goog.exportProperty(webdriver.WebDriver.prototype, 'getSession',
                    webdriver.WebDriver.prototype.getSession);
goog.exportProperty(webdriver.WebDriver.prototype, 'getCapability',
                    webdriver.WebDriver.prototype.getCapability);
goog.exportProperty(webdriver.WebDriver.prototype, 'quit',
                    webdriver.WebDriver.prototype.quit);
goog.exportProperty(webdriver.WebDriver.prototype, 'executeScript',
                    webdriver.WebDriver.prototype.executeScript);
goog.exportProperty(webdriver.WebDriver.prototype, 'executeAsyncScript',
                    webdriver.WebDriver.prototype.executeAsyncScript);
goog.exportProperty(webdriver.WebDriver.prototype, 'call',
                    webdriver.WebDriver.prototype.call);
goog.exportProperty(webdriver.WebDriver.prototype, 'wait',
                    webdriver.WebDriver.prototype.wait);
goog.exportProperty(webdriver.WebDriver.prototype, 'sleep',
                    webdriver.WebDriver.prototype.sleep);
goog.exportProperty(webdriver.WebDriver.prototype, 'getWindowHandle',
                    webdriver.WebDriver.prototype.getWindowHandle);
goog.exportProperty(webdriver.WebDriver.prototype, 'getAllWindowHandles',
                    webdriver.WebDriver.prototype.getAllWindowHandles);
goog.exportProperty(webdriver.WebDriver.prototype, 'getPageSource',
                    webdriver.WebDriver.prototype.getPageSource);
goog.exportProperty(webdriver.WebDriver.prototype, 'close',
                    webdriver.WebDriver.prototype.close);
goog.exportProperty(webdriver.WebDriver.prototype, 'get',
                    webdriver.WebDriver.prototype.get);
goog.exportProperty(webdriver.WebDriver.prototype, 'getCurrentUrl',
                    webdriver.WebDriver.prototype.getCurrentUrl);
goog.exportProperty(webdriver.WebDriver.prototype, 'getTitle',
                    webdriver.WebDriver.prototype.getTitle);
goog.exportProperty(webdriver.WebDriver.prototype, 'findElement',
                    webdriver.WebDriver.prototype.findElement);
goog.exportProperty(webdriver.WebDriver.prototype, 'isElementPresent',
                    webdriver.WebDriver.prototype.isElementPresent);
goog.exportProperty(webdriver.WebDriver.prototype, 'findElements',
                    webdriver.WebDriver.prototype.findElements);
goog.exportProperty(webdriver.WebDriver.prototype, 'takeScreenshot',
                    webdriver.WebDriver.prototype.takeScreenshot);
goog.exportProperty(webdriver.WebDriver.prototype, 'manage',
                    webdriver.WebDriver.prototype.manage);
goog.exportProperty(webdriver.WebDriver.prototype, 'navigate',
                    webdriver.WebDriver.prototype.navigate);
goog.exportProperty(webdriver.WebDriver.prototype, 'switchTo',
                    webdriver.WebDriver.prototype.switchTo);


//////////////////////////////////////////////////////////////////////////////
//
//  webdriver.WebDriver.Navigation
//
//////////////////////////////////////////////////////////////////////////////
goog.exportProperty(webdriver.WebDriver.Navigation.prototype, 'to',
                    webdriver.WebDriver.Navigation.prototype.to);
goog.exportProperty(webdriver.WebDriver.Navigation.prototype, 'back',
                    webdriver.WebDriver.Navigation.prototype.back);
goog.exportProperty(webdriver.WebDriver.Navigation.prototype, 'forward',
                    webdriver.WebDriver.Navigation.prototype.forward);
goog.exportProperty(webdriver.WebDriver.Navigation.prototype, 'refresh',
                    webdriver.WebDriver.Navigation.prototype.refresh);


//////////////////////////////////////////////////////////////////////////////
//
//  webdriver.WebDriver.Options
//
//////////////////////////////////////////////////////////////////////////////
goog.exportProperty(webdriver.WebDriver.Options.prototype, 'addCookie',
                    webdriver.WebDriver.Options.prototype.addCookie);
goog.exportProperty(webdriver.WebDriver.Options.prototype, 'deleteAllCookies',
                    webdriver.WebDriver.Options.prototype.deleteAllCookies);
goog.exportProperty(webdriver.WebDriver.Options.prototype, 'deleteCookie',
                    webdriver.WebDriver.Options.prototype.deleteCookie);
goog.exportProperty(webdriver.WebDriver.Options.prototype, 'getCookies',
                    webdriver.WebDriver.Options.prototype.getCookies);
goog.exportProperty(webdriver.WebDriver.Options.prototype, 'getCookie',
                    webdriver.WebDriver.Options.prototype.getCookie);
goog.exportProperty(webdriver.WebDriver.Options.prototype, 'timeouts',
                    webdriver.WebDriver.Options.prototype.timeouts);
goog.exportProperty(webdriver.WebDriver.Options.prototype, 'window',
                    webdriver.WebDriver.Options.prototype.window);


//////////////////////////////////////////////////////////////////////////////
//
//  webdriver.WebDriver.Timeouts
//
//////////////////////////////////////////////////////////////////////////////
goog.exportProperty(webdriver.WebDriver.Timeouts.prototype, 'implicitlyWait',
    webdriver.WebDriver.Timeouts.prototype.implicitlyWait);
goog.exportProperty(webdriver.WebDriver.Timeouts.prototype, 'setScriptTimeout',
    webdriver.WebDriver.Timeouts.prototype.setScriptTimeout);


//////////////////////////////////////////////////////////////////////////////
//
//  webdriver.WebDriver.TargetLocator
//
//////////////////////////////////////////////////////////////////////////////
goog.exportProperty(webdriver.WebDriver.TargetLocator.prototype,
    'activeElement', webdriver.WebDriver.TargetLocator.prototype.activeElement);
goog.exportProperty(webdriver.WebDriver.TargetLocator.prototype,
    'defaultContent',
    webdriver.WebDriver.TargetLocator.prototype.defaultContent);
goog.exportProperty(webdriver.WebDriver.TargetLocator.prototype,
    'frame', webdriver.WebDriver.TargetLocator.prototype.frame);
goog.exportProperty(webdriver.WebDriver.TargetLocator.prototype,
    'window', webdriver.WebDriver.TargetLocator.prototype.window);


//////////////////////////////////////////////////////////////////////////////
//
//  webdriver.WebDriver.Window
//
//////////////////////////////////////////////////////////////////////////////
goog.exportProperty(webdriver.WebDriver.Window.prototype, 'getPosition',
    webdriver.WebDriver.Window.prototype.getPosition);
goog.exportProperty(webdriver.WebDriver.Window.prototype, 'setPosition',
    webdriver.WebDriver.Window.prototype.setPosition);
goog.exportProperty(webdriver.WebDriver.Window.prototype, 'getSize',
    webdriver.WebDriver.Window.prototype.getSize);
goog.exportProperty(webdriver.WebDriver.Window.prototype, 'setSize',
    webdriver.WebDriver.Window.prototype.setSize);


//////////////////////////////////////////////////////////////////////////////
//
//  webdriver.WebElement
//
//////////////////////////////////////////////////////////////////////////////
goog.exportSymbol('WebElement', webdriver.WebElement);
goog.exportProperty(webdriver.WebElement.prototype, 'getDriver',
                    webdriver.WebElement.prototype.getDriver);
goog.exportProperty(webdriver.WebElement.prototype, 'findElement',
                    webdriver.WebElement.prototype.findElement);
goog.exportProperty(webdriver.WebElement.prototype, 'isElementPresent',
                    webdriver.WebElement.prototype.isElementPresent);
goog.exportProperty(webdriver.WebElement.prototype, 'findElements',
                    webdriver.WebElement.prototype.findElements);
goog.exportProperty(webdriver.WebElement.prototype, 'click',
                    webdriver.WebElement.prototype.click);
goog.exportProperty(webdriver.WebElement.prototype, 'sendKeys',
                    webdriver.WebElement.prototype.sendKeys);
goog.exportProperty(webdriver.WebElement.prototype, 'getTagName',
                    webdriver.WebElement.prototype.getTagName);
goog.exportProperty(webdriver.WebElement.prototype, 'getCssValue',
                    webdriver.WebElement.prototype.getCssValue);
goog.exportProperty(webdriver.WebElement.prototype, 'getAttribute',
                    webdriver.WebElement.prototype.getAttribute);
goog.exportProperty(webdriver.WebElement.prototype, 'getText',
                    webdriver.WebElement.prototype.getText);
goog.exportProperty(webdriver.WebElement.prototype, 'getSize',
                    webdriver.WebElement.prototype.getSize);
goog.exportProperty(webdriver.WebElement.prototype, 'getLocation',
                    webdriver.WebElement.prototype.getLocation);
goog.exportProperty(webdriver.WebElement.prototype, 'isEnabled',
                    webdriver.WebElement.prototype.isEnabled);
goog.exportProperty(webdriver.WebElement.prototype, 'isSelected',
                    webdriver.WebElement.prototype.isSelected);
goog.exportProperty(webdriver.WebElement.prototype, 'submit',
                    webdriver.WebElement.prototype.submit);
goog.exportProperty(webdriver.WebElement.prototype, 'clear',
                    webdriver.WebElement.prototype.clear);
goog.exportProperty(webdriver.WebElement.prototype, 'isDisplayed',
                    webdriver.WebElement.prototype.isDisplayed);
goog.exportProperty(webdriver.WebElement.prototype, 'getOuterHtml',
                    webdriver.WebElement.prototype.getOuterHtml);
goog.exportProperty(webdriver.WebElement.prototype, 'getInnerHtml',
                    webdriver.WebElement.prototype.getInnerHtml);


//////////////////////////////////////////////////////////////////////////////
//
//  webdriver.Session
//
//////////////////////////////////////////////////////////////////////////////
goog.exportSymbol('Session', webdriver.Session);
goog.exportProperty(webdriver.Session.prototype, 'getId',
                    webdriver.Session.prototype.getId);
goog.exportProperty(webdriver.Session.prototype, 'getCapabilities',
                    webdriver.Session.prototype.getCapabilities);
goog.exportProperty(webdriver.Session.prototype, 'getCapability',
                    webdriver.Session.prototype.getCapability);


//////////////////////////////////////////////////////////////////////////////
//
//  webdriver.http
//
//////////////////////////////////////////////////////////////////////////////
goog.exportSymbol('http.CorsClient', webdriver.http.CorsClient);
goog.exportSymbol('http.Executor', webdriver.http.Executor);


//////////////////////////////////////////////////////////////////////////////
//
//  webdriver.node
//
//////////////////////////////////////////////////////////////////////////////
goog.exportSymbol('node.toSource', webdriver.node.toSource);
goog.exportSymbol('node.HttpClient', webdriver.node.HttpClient);


//////////////////////////////////////////////////////////////////////////////
//
//  webdriver.process
//
//////////////////////////////////////////////////////////////////////////////
goog.exportSymbol('process.isNative', webdriver.process.isNative);
goog.exportSymbol('process.getEnv', webdriver.process.getEnv);
goog.exportSymbol('process.setEnv', webdriver.process.setEnv);


//////////////////////////////////////////////////////////////////////////////
//
//  webdriver.promise
//
//////////////////////////////////////////////////////////////////////////////
goog.exportSymbol('promise.isPromise', webdriver.promise.isPromise);
goog.exportSymbol('promise.delayed', webdriver.promise.delayed);
goog.exportSymbol('promise.resolved', webdriver.promise.resolved);
goog.exportSymbol('promise.rejected', webdriver.promise.rejected);
goog.exportSymbol('promise.checkedNodeCall', webdriver.promise.checkedNodeCall);
goog.exportSymbol('promise.when', webdriver.promise.when);
goog.exportSymbol('promise.asap', webdriver.promise.asap);
goog.exportSymbol('promise.fullyResolved', webdriver.promise.fullyResolved);
goog.exportSymbol('promise.Application.getInstance',
                  webdriver.promise.Application.getInstance);
goog.exportSymbol('promise.Application.EventType.IDLE',
                  webdriver.promise.Application.EventType.IDLE);
goog.exportSymbol('promise.Application.EventType.SCHEDULE_TASK',
                  webdriver.promise.Application.EventType.SCHEDULE_TASK);
goog.exportSymbol('promise.Application.EventType.UNCAUGHT_EXCEPTION',
                  webdriver.promise.Application.EventType.UNCAUGHT_EXCEPTION);
goog.exportProperty(webdriver.promise.Application.prototype, 'schedule',
                    webdriver.promise.Application.prototype.schedule);
goog.exportProperty(webdriver.promise.Application.prototype, 'scheduleTimeout',
                    webdriver.promise.Application.prototype.scheduleTimeout);
goog.exportProperty(webdriver.promise.Application.prototype, 'scheduleWait',
                    webdriver.promise.Application.prototype.scheduleWait);


