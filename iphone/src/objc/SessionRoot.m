//
//  SessionRoot.m
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

#import "SessionRoot.h"
#import "HTTPRedirectResponse.h"
#import "JSONRESTResource.h"
#import "Session.h"

@implementation SessionRoot

- (id)init {
  if (![super init])
    return nil;

  // Sessions are created by POSTing to /hub/session with
  // a set of |DesiredCapabilities|.
  [self setIndex:[JSONRESTResource
                  JSONResourceWithTarget:self 
                  action:@selector(createSessionWithData:method:)]];

  // Session IDs start at 1001.
  nextId_ = 1001;

  return self;
}

// TODO (josephg): We really only support one session. Error (or ignore the
// request) if the session is already created. When the session exists, change
// the service we advertise using zeroconf.

// Create a session. This method is bound to the index of /hub/session/
- (NSObject<HTTPResponse> *)createSessionWithData:(id)desiredCapabilities
                                           method:(NSString *)method {

  if (![method isEqualToString:@"POST"] && ![method isEqualToString:@"GET"])
    return nil;

  int sessionId = nextId_++;
  
  NSLog(@"session %d created", sessionId);

  // Sessions don't really mean anything on the iphone. There's only one
  // browser and only one session.

  // But we would like to give a clean status by cleaning up application data,
  // in particular, cookies, cache and HTML5 client-side storage.  
  Session* session = [[[Session alloc]
                       initWithSessionRootAndSessionId:self
                       sessionId:sessionId] autorelease];

  NSString *sessionIdStr = [NSString stringWithFormat:@"%d", sessionId];
  [self setResource:session withName:sessionIdStr];

  return [HTTPRedirectResponse redirectToURL:
          [NSString stringWithFormat:@"session/%d/", sessionId]];
}

- (void) deleteSessionWithId:(int)sessionId {
  NSString *sessionIdStr = [NSString stringWithFormat:@"%d", sessionId];
  [self setResource:nil withName:sessionIdStr];
  NSLog(@"session %d deleted", sessionId);
  if (sessionId == nextId_ - 1) {
    nextId_--;
  }
}

- (void)dealloc {
  [super dealloc];
}

@end

