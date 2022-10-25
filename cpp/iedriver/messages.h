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

#define WD_INIT WM_APP + 1
#define WD_SET_COMMAND WM_APP + 2
#define WD_EXEC_COMMAND WM_APP + 3
#define WD_GET_RESPONSE_LENGTH WM_APP + 4
#define WD_GET_RESPONSE WM_APP + 5
#define WD_WAIT WM_APP + 6
#define WD_BROWSER_NEW_WINDOW WM_APP + 7
#define WD_BROWSER_QUIT WM_APP + 8
#define WD_IS_SESSION_VALID WM_APP + 9
#define WD_NEW_HTML_DIALOG WM_APP + 10
#define WD_GET_QUIT_STATUS WM_APP + 11
#define WD_REFRESH_MANAGED_ELEMENTS WM_APP + 12
#define WD_HANDLE_UNEXPECTED_ALERTS WM_APP + 13
#define WD_QUIT WM_APP + 14
#define WD_SHUTDOWN WM_APP + 15

#define WD_SCRIPT_WAIT WM_APP + 16
#define WD_BROWSER_CLOSE_WAIT WM_APP + 17
#define WD_SESSION_QUIT_WAIT WM_APP + 18

#define WD_ASYNC_SCRIPT_SET_DOCUMENT WM_APP + 19
#define WD_ASYNC_SCRIPT_SET_ELEMENT_ARGUMENT WM_APP + 20
#define WD_ASYNC_SCRIPT_SET_POLLING_SCRIPT WM_APP + 21
#define WD_ASYNC_SCRIPT_IS_EXECUTION_READY WM_APP + 22
#define WD_ASYNC_SCRIPT_EXECUTE WM_APP + 23
#define WD_ASYNC_SCRIPT_IS_EXECUTION_COMPLETE WM_APP + 24
#define WD_ASYNC_SCRIPT_GET_RESULT WM_APP + 25
#define WD_ASYNC_SCRIPT_DETACH_LISTENTER WM_APP + 26
#define WD_ASYNC_SCRIPT_GET_REQUIRED_ELEMENT_LIST WM_APP + 27
#define WD_ASYNC_SCRIPT_TRANSFER_MANAGED_ELEMENT WM_APP + 28
#define WD_ASYNC_SCRIPT_NOTIFY_ELEMENT_TRANSFERRED WM_APP + 29
#define WD_ASYNC_SCRIPT_SCHEDULE_REMOVE_MANAGED_ELEMENT WM_APP + 30

#define WD_CHANGE_PROXY WM_APP + 31

#define WD_GET_ALL_COOKIES WM_APP + 32
#define WD_GET_SCRIPTABLE_COOKIES WM_APP + 33
#define WD_GET_HTTPONLY_COOKIES WM_APP + 34
#define WD_GET_SECURE_COOKIES WM_APP + 35
#define WD_GET_COOKIE_CACHE_FILES WM_APP + 36
#define WD_SET_COOKIE WM_APP + 37

#define WD_BEFORE_NEW_WINDOW WM_APP + 38
#define WD_AFTER_NEW_WINDOW WM_APP + 39
#define WD_BROWSER_REATTACH WM_APP + 40
#define WD_BEFORE_BROWSER_REATTACH WM_APP + 41
#define WD_IS_BROWSER_PROTECTED_MODE WM_APP + 42

#define WD_ALLOW_SET_FOREGROUND WM_APP + 43

#define WD_ADD_CHROMIUM_WINDOW_HANDLE WM_APP + 44
