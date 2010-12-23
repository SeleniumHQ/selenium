//
//  Timeouts.h
//  iWebDriver
//
//  Copyright 2010 Google Inc.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

#import <Foundation/Foundation.h>
#import "HTTPVirtualDirectory.h"

@class Session;

// This |HTTPVirtualDirectory| matches the /hub/:session/timeouts
// directory in the WebDriver REST service.
@interface Timeouts : HTTPVirtualDirectory {
  Session* session_;
}

- (id)initWithSession:(Session*)session;

+ (Timeouts*)timeoutsForSession:(Session*)session;

@end

// This |HTTPVirtualDirectory| matches the /hub/:session/timeouts/implicit_wait
// directory in the WebDriver REST service.
@interface ImplicitWait : HTTPVirtualDirectory {
  Session* session_;
}

- (id)initWithSession:(Session*)session;

+ (ImplicitWait*)implicitWaitForSession:(Session*)session;

- (long)getImplicitWait;
- (void)setImplicitWait:(NSDictionary *)params;
- (void)clearImplicitWait;

@end

// This |HTTPVirtualDirectory| 
@interface ScriptTimeout : HTTPVirtualDirectory {
  Session* session_;
}

- (id)initWithSession:(Session*)session;

+ (ScriptTimeout*)scriptTimeoutForSession:(Session*)session;

- (long)getScriptTimeout;
- (void)setScriptTimeout:(NSDictionary *)params;
- (void)clearScriptTimeout;

@end