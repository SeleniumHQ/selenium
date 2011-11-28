//
//  SessionRoot.h
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

// This |HTTPVirtualDirectory| matches the /session directory that serves as the
// root of the WebDriver REST service.
@interface SessionRoot : HTTPVirtualDirectory {
  int nextId_;
  NSString *ipAddress_;
  NSString *port_;
}

- (id)initWithAddress:(NSString *)ipAddress
                 port:(NSString *)port;

- (NSObject<HTTPResponse> *)createSessionWithData:(id)desiredCapabilities
                                           method:(NSString*)method;
- (void)deleteSessionWithId:(NSString *)sessionId;

@end;
