// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#ifndef WEBDRIVER_SERVER_ERRORCODES_H_
#define WEBDRIVER_SERVER_ERRORCODES_H_

#define WD_SUCCESS 0

#define EINDEXOUTOFBOUNDS      1
#define ENOCOLLECTION          2
#define ENOSTRING              3
#define ENOSTRINGLENGTH        4
#define ENOSTRINGWRAPPER       5
#define ENOSUCHDRIVER          6
#define ENOSUCHELEMENT         7
#define ENOSUCHFRAME           8
#define ENOTIMPLEMENTED        9
#define EOBSOLETEELEMENT       10
#define EELEMENTNOTDISPLAYED   11
#define EELEMENTNOTENABLED     12
#define EUNHANDLEDERROR        13
#define EEXPECTEDERROR         14
#define EELEMENTNOTSELECTED    15
#define ENOSUCHDOCUMENT        16
#define EUNEXPECTEDJSERROR     17
#define ENOSCRIPTRESULT        18
#define EUNKNOWNSCRIPTRESULT   19
#define ENOSUCHCOLLECTION      20
#define ETIMEOUT               21
#define ENULLPOINTER           22
#define ENOSUCHWINDOW          23
#define EINVALIDCOOKIEDOMAIN   24
#define EUNABLETOSETCOOKIE     25
#define EUNEXPECTEDALERTOPEN   26
#define ENOSUCHALERT           27
#define ESCRIPTTIMEOUT         28
#define EINVALIDCOORDINATES    29
#define EINVALIDSELECTOR       32
#define ECLICKINTERCEPTED      33
#define EMOVETARGETOUTOFBOUNDS 34
#define ENOSUCHCOOKIE          35
#define EUNSUPPORTEDOPERATION  36
#define EINVALIDARGUMENT       62

#define ERROR_ELEMENT_CLICK_INTERCEPTED "element click intercepted"
#define ERROR_ELEMENT_NOT_SELECTABLE "element not selectable"
#define ERROR_ELEMENT_NOT_INTERACTABLE "element not interactable"
#define ERROR_INSECURE_CERTIFICATE "insecure certificate"
#define ERROR_INVALID_ARGUMENT "invalid argument"
#define ERROR_INVALID_COOKIE_DOMAIN "invalid cookie domain"
#define ERROR_INVALID_COORDINATES "invalid coordinates"
#define ERROR_INVALID_ELEMENT_STATE "invalid element state"
#define ERROR_INVALID_SELECTOR "invalid selector"
#define ERROR_INVALID_SESSION_ID "invalid session id"
#define ERROR_JAVASCRIPT_ERROR "javascript error"
#define ERROR_MOVE_TARGET_OUT_OF_BOUNDS "move target out of bounds"
#define ERROR_NO_SUCH_ALERT "no such alert"
#define ERROR_NO_SUCH_COOKIE "no such cookie"
#define ERROR_NO_SUCH_ELEMENT "no such element"
#define ERROR_NO_SUCH_FRAME "no such frame"
#define ERROR_NO_SUCH_WINDOW "no such window"
#define ERROR_SCRIPT_TIMEOUT "script timeout"
#define ERROR_SESSION_NOT_CREATED "session not created"
#define ERROR_STALE_ELEMENT_REFERENCE "stale element reference"
#define ERROR_WEBDRIVER_TIMEOUT "timeout"
#define ERROR_UNABLE_TO_SET_COOKIE "unable to set cookie"
#define ERROR_UNABLE_TO_CAPTURE_SCREEN "unable to capture screen"
#define ERROR_UNEXPECTED_ALERT_OPEN "unexpected alert open"
#define ERROR_UNKNOWN_COMMAND "unknown command"
#define ERROR_UNKNOWN_ERROR "unknown error"
#define ERROR_UNKNOWN_METHOD "unknown method"
#define ERROR_UNSUPPORTED_OPERATION "unsupported operation"

#endif // WEBDRIVER_SERVER_ERRORCODES_H_
