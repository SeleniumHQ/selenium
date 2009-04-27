//
//  Session.m
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

#import "Session.h"
#import "JSONRESTResource.h"
#import "Context.h"
#import "HTTPRedirectResponse.h"

@implementation Session

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
  // TODO (josephg): Implement DELETE on this method.
  if (![method isEqualToString:@"POST"] && ![method isEqualToString:@"GET"])
    return nil;
  
  int sessionId = nextId_++;
  
  NSLog(@"session %d created", sessionId);

  // Sessions don't really mean anything on the iphone. There's only one
  // browser, only one session and only one context.

  HTTPVirtualDirectory *session = [HTTPVirtualDirectory virtualDirectory];
  [self setResource:session
           withName:[NSString stringWithFormat:@"%d", sessionId]];

  HTTPVirtualDirectory *context = [[[Context alloc]
                                    initWithSessionId:sessionId]
                                    autorelease];
 
  // The context has a static name.
  [session setResource:context withName:[Context contextName]];
  
  [self deleteAllCookies];

  return [HTTPRedirectResponse redirectToURL:
          [NSString stringWithFormat:@"session/%d/%@/",
           sessionId,
           [Context contextName]]];
}

- (void)deleteAllCookies {
  NSArray *cookies = [[NSHTTPCookieStorage sharedHTTPCookieStorage] cookies];
  NSEnumerator *enumerator = [cookies objectEnumerator];
  NSHTTPCookie *cookie = nil;
  while ((cookie = [enumerator nextObject])) {
    [[NSHTTPCookieStorage sharedHTTPCookieStorage] deleteCookie:cookie];
  }
}

@end
