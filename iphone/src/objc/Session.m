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
#import "RootViewController.h"
#import "WebDriverResource.h"
#import "WebDriverUtilities.h"
#import "HTTPVirtualDirectory+Remove.h"

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
  // browser, only one session and only one context.

  // But we would like to give a clean status by cleaning up application data,
  // in particular, cookies, cache and HTML5 client-side storage.  
  Session* session = [[[Session alloc]
                       initWithSessionRootAndSessionId:self
                       sessionId:sessionId] autorelease];
	
  NSString *sessionIdStr = [NSString stringWithFormat:@"%d", sessionId];
  [self setResource:session withName:sessionIdStr];

  return [HTTPRedirectResponse redirectToURL:
          [NSString stringWithFormat:@"session/%d/%@/", sessionId,
           [Context contextName]]];
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

@implementation Session
  
- (id) initWithSessionRootAndSessionId:(SessionRoot*)root
                             sessionId:(int)sessionId {
  self = [super init];
  if (!self) {
    return nil;
  }
  sessionRoot_ = root;
  sessionId_ = sessionId;
  context_ = [[[Context alloc] initWithSessionId:sessionId] autorelease];
  
  [self setIndex:[WebDriverResource
                  resourceWithTarget:self
                  GETAction:NULL
                  POSTAction:NULL
                  PUTAction:NULL
                  DELETEAction:@selector(deleteSession)]];
  [self setResource:context_ withName:[Context contextName]];

  [self cleanSessionStatus];

  return self;
}

- (void)cleanSessionStatus{
  [WebDriverUtilities cleanCookies];
  [WebDriverUtilities cleanCache];
  [WebDriverUtilities cleanDatabases];
}
  
- (void)deleteSession {
  [context_ deleteContext];
  [contents removeAllObjects];
  // Tell the session root to remove this resource.
  [sessionRoot_ deleteSessionWithId:sessionId_];
}

- (void)deleteAllCookies {
  NSArray *cookies = [[NSHTTPCookieStorage sharedHTTPCookieStorage] cookies];
  NSEnumerator *enumerator = [cookies objectEnumerator];
  NSHTTPCookie *cookie = nil;
  while ((cookie = [enumerator nextObject])) {
    [[NSHTTPCookieStorage sharedHTTPCookieStorage] deleteCookie:cookie];
  }
}

- (void)dealloc {
  [super dealloc];
}

@end
