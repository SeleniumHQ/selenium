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

@implementation Session

static NSMutableDictionary *sessions = nil;
static NSMutableDictionary *contexts = nil;

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
	
	sessions = [NSMutableDictionary new];
	contexts = [NSMutableDictionary new];
	
	return self;
}

- (void)cleanSessionStatus{
  [WebDriverUtilities cleanCookies];
  [WebDriverUtilities cleanCache];
  [WebDriverUtilities cleanDatabases];
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
  [self cleanSessionStatus];
  
  HTTPVirtualDirectory *session = [HTTPVirtualDirectory virtualDirectory];
  [session setIndex:[WebDriverResource resourceWithTarget:self
                                                GETAction:NULL
                                               POSTAction:NULL
                                                PUTAction:NULL
                                             DELETEAction:@selector(deleteSessionWithSessionId:)]];
	
  NSString *sessionIdStr = [NSString stringWithFormat:@"%d", sessionId];
  [self setResource:session withName:sessionIdStr];

  Context *context = [[[Context alloc] initWithSessionId:sessionId] autorelease];
	[contexts setObject:context forKey:sessionIdStr];
 
  // The context has a static name.
  [session setResource:context withName:[Context contextName]];
  [sessions setObject:session forKey:sessionIdStr];
	
  [self deleteAllCookies];

  return [HTTPRedirectResponse redirectToURL:
          [NSString stringWithFormat:@"session/%d/%@/", sessionId,
           [Context contextName]]];
}

- (void)deleteSessionWithSessionId:(NSString *)sessionId {
  Context *ctx = (Context *)[contexts objectForKey:sessionId];
  Session *sess = [sessions objectForKey:sessionId];
  if (ctx == nil || sess == nil) {
      NSLog(@"Session %@ doesn't exist.", sessionId);
      return;
  }
  [contexts removeObjectForKey:sessionId];
  [sessions removeObjectForKey:sessionId];
  [ctx deleteContext];
  [ctx release];
  [contents removeAllObjects];

  NSLog(@"Session %@ deleted", sessionId);
  if ([sessionId intValue] == nextId_ -1)
      nextId_--;
}

- (void)dealloc {
  [super dealloc];
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
