//
//  Session.h
//  iWebDriver
//
//  Copyright 2009 Google Inc.
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

@class Context;

// This |HTTPVirtualDirectory| matches the /session directory that serves as the
// root of the WebDriver REST service.
@interface SessionRoot : HTTPVirtualDirectory {
  int nextId_;
}

- (NSObject<HTTPResponse> *)createSessionWithData:(id)desiredCapabilities
                                           method:(NSString*)method;
- (void)deleteSessionWithId:(int)sessionId;

@end;

// This |HTTPVirtualDirectory| matches the /:session directory which WebDriver
// expects. All the interesting stuff is in the :session/:context subdirectory
// (Matched by the |Context| class).
@interface Session : HTTPVirtualDirectory {
  SessionRoot* sessionRoot_;
  int sessionId_;
  Context* context_;
}

- (id) initWithSessionRootAndSessionId:(SessionRoot*)root
                             sessionId:(int)sessionId;

- (void)cleanSessionStatus;

// Deletes all from shared cookie storage on iPhone. If cookies are not deleted
// in between sessions than sessions become nondeterministic.
- (void)deleteAllCookies;

// Deletes a session. Recursively destroys all inherited subtree of context,
// elements, etc.
- (void)deleteSession;

@end
