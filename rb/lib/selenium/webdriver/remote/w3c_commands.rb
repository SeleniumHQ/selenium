# encoding: utf-8
#
# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

class Selenium::WebDriver::Remote::W3CBridge

  #
  # http://www.w3.org/TR/2015/WD-webdriver-20150918/#list-of-endpoints
  #

  #
  # session handling
  #

  command :newSession,                 :post,    "session"
  command :deleteSession,              :delete,  "session/:session_id"


  #
  # basic driver
  #

  command :get,                        :post,    "session/:session_id/url"
  command :getCurrentUrl,              :get,     "session/:session_id/url"
  command :back,                       :post,    "session/:session_id/back"
  command :forward,                    :post,    "session/:session_id/forward"
  command :refresh,                    :post,    "session/:session_id/refresh"
  command :getTitle,                   :get,     "session/:session_id/title"

  #
  # window and Frame handling
  #

  command :getWindowHandle,            :get,     "session/:session_id/window"
  command :closeWindow,                :delete,  "session/:session_id/window"
  command :switchToWindow,             :post,    "session/:session_id/window"
  command :getWindowHandles,           :get,     "session/:session_id/window/handles"
  command :fullscreenWindow,           :post,    "session/:session_id/window/fullscreen"
  command :maximizeWindow,             :post,    "session/:session_id/window/maximize"
  command :setWindowSize,              :post,    "session/:session_id/window/size"
  command :getWindowSize,              :get,     "session/:session_id/window/size"
  command :switchToFrame,              :post,    "session/:session_id/frame"
  command :switchToParentFrame,        :post,    "session/:session_id/frame/parent"

  #
  # element
  #

  command :findElement,                :post,    "session/:session_id/element"
  command :findElements,               :post,    "session/:session_id/elements"
  command :findChildElement,           :post,    "session/:session_id/element/:id/element"
  command :findChildElements,          :post,    "session/:session_id/element/:id/elements"
  command :getActiveElement,           :get,     "session/:session_id/element/active"
  command :isElementSelected,          :get,     "session/:session_id/element/:id/selected"
  command :getElementAttribute,        :get,     "session/:session_id/element/:id/attribute/:name"
  command :getElementProperty,         :get,     "session/:session_id/element/:id/property/:name"
  command :getElementCssValue,         :get,     "session/:session_id/element/:id/css/:property_name"
  command :getElementText,             :get,     "session/:session_id/element/:id/text"
  command :getElementTagName,          :get,     "session/:session_id/element/:id/name"
  command :getElementRect,             :get,     "session/:session_id/element/:id/rect"
  command :isElementEnabled,           :get,     "session/:session_id/element/:id/enabled"

  #
  # script execution
  #

  command :executeScript,              :post,    "session/:session_id/execute/sync"
  command :executeAsyncScript,         :post,    "session/:session_id/execute/async"

  #
  # cookies
  #

  command :getAllCookies,              :get,     "session/:session_id/cookie"
  command :getCookie,                  :get,     "session/:session_id/cookie/:name"
  command :addCookie,                  :post,    "session/:session_id/cookie"
  command :deleteCookie,               :delete,  "session/:session_id/cookie/:name"

  #
  # timeouts
  #

  command :setTimeout,                 :post,    "session/:session_id/timeouts"

  #
  # actions
  #

  command :actions,                    :post,    "session/:session_id/actions"


  #
  # Element Operations
  #

  command :elementClick,               :post,    "session/:session_id/element/:id/click"
  command :elementTap,                 :post,    "session/:session_id/element/:id/tap"
  command :elementClear,               :post,    "session/:session_id/element/:id/clear"
  command :elementSendKeys,            :post,    "session/:session_id/element/:id/value"

  #
  # alerts
  #

  command :dismissAlert,               :post,    "session/:session_id/alert/dismiss"
  command :acceptAlert,                :post,    "session/:session_id/alert/accept"
  command :getAlertText,               :get,     "session/:session_id/alert/text"
  command :sendAlertText,              :post,    "session/:session_id/alert/text"

  #
  # screenshot
  #

  command :takeScreenshot,             :get,     "session/:session_id/screenshot"
  command :takeElementScreenshot,      :get,     "session/:session_id/element/:id/screenshot"

end
