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
#import "Cookie.h"
#import "ElementStore.h"
#import "ElementStore+FindElement.h"
#import "JSONRESTResource.h"
#import "HTTPJSONResponse.h"
#import "HTTPResponse+Utility.h"
#import "HTTPServerController.h"
#import "HTTPVirtualDirectory+AccessViewController.h"
#import "HTTPVirtualDirectory+Remove.h"
#import "RootViewController.h"
#import "Session+ExecuteScript.h"
#import "SessionRoot.h"
#import "WebDriverResource.h"
#import "WebDriverResponse.h"
#import "WebDriverUtilities.h"
#import "WebViewController.h"

@implementation Session
  
@synthesize elementStore = elementStore_;
@synthesize sessionId = sessionId_;

// The WebViewController has most of the actual functionality this vdir exposes.
// We'll just forward most messages there.
- (void)setResourceToViewMethodGET:(SEL)getMethod
                              POST:(SEL)postMethod
                          withName:(NSString *)name {
  [self setResource:[WebDriverResource resourceWithTarget:[self viewController]
                                                GETAction:getMethod
                                               POSTAction:postMethod]
           withName:name];
}

- (id) initWithSessionRootAndSessionId:(SessionRoot*)root
                             sessionId:(int)sessionId {
  self = [super init];
  if (!self) {
    return nil;
  }
  sessionRoot_ = root;
  sessionId_ = sessionId;
  
  [self setIndex:[WebDriverResource
                  resourceWithTarget:self
                  GETAction:@selector(capabilities)
                  POSTAction:NULL
                  PUTAction:NULL
                  DELETEAction:@selector(deleteSession)]];
  
  // Set the view to be visible. This is ignored.
  [self setResourceToViewMethodGET:@selector(visible)
                              POST:@selector(setVisible:)
                          withName:@"visible"];
  
  // Browse to given URL / get current URL.
  [self setResourceToViewMethodGET:@selector(URL)
                              POST:@selector(setURL:)
                          withName:@"url"];
  
  // Evaluate the given javascript string. If the request causes a new page to
  // load, block until that loading is complete.
  // Note that this is 'raw' jsEval - as opposed to /execute below.
  [self setResourceToViewMethodGET:NULL
                              POST:@selector(jsEvalAndBlock:)
                          withName:@"eval"];
  
  // The current title of the web pane.
  [self setResourceToViewMethodGET:@selector(currentTitle)
                              POST:NULL
                          withName:@"title"];
  
  // Go back.
  [self setResourceToViewMethodGET:NULL
                              POST:@selector(back)
                          withName:@"back"];
  
  // Go forward.
  [self setResourceToViewMethodGET:NULL
                              POST:@selector(forward)
                          withName:@"forward"];
  
  // Refresh the page.
  [self setResourceToViewMethodGET:NULL
                              POST:@selector(refresh)
                          withName:@"refresh"];
  
  // Get the loaded HTML
  [self setResourceToViewMethodGET:@selector(source)
                              POST:NULL
                          withName:@"source"];
  
  // Get a screenshot
  [self setResourceToViewMethodGET:@selector(screenshot)
                              POST:NULL
                          withName:@"screenshot"];
  
  // Load firebug into the webview. This doesn't currently work.
  // TODO(josephg): find out why firebug doesn't load and fix it.
  [self setResourceToViewMethodGET:NULL
                              POST:@selector(addFirebug)
                          withName:@"firebug"];
  
  // Execute JS function with the given body. This takes an optional second
  // argument which is a list of arguments to the function.
  // Executes (function() { $1 }).apply(null, $2);
  WebDriverResource *executeScript =
      [WebDriverResource resourceWithTarget:self
                                  GETAction:NULL
                                 POSTAction:@selector(executeScript:)];
  [executeScript setAllowOptionalArguments:YES];
  [self setResource:executeScript withName:@"execute"];
  
  // /element will be an ElementStore virtual directory. We also forward 
  // /elements to the element store - getting from there returns multiple
  // element results.
  elementStore_ = [[ElementStore alloc] init];
  [self setResource:elementStore_ withName:@"element"];
  [self setResource:[WebDriverResource
                     resourceWithTarget:elementStore_
                     GETAction:NULL
                     POSTAction:@selector(findElements:)]
           withName:@"elements"];
  
  [self setResource:[Cookie cookieWithSessionId:sessionId_]
           withName:@"cookie"];
  
  [self cleanSessionStatus];

  return self;
}

- (void)cleanSessionStatus{
  [WebDriverUtilities cleanCookies];
  [WebDriverUtilities cleanCache];
  [WebDriverUtilities cleanDatabases];
}
  
- (id)capabilities {
  NSMutableDictionary *caps = [NSMutableDictionary dictionary];
  [caps setObject:@"mobile safari" forKey:@"browserName"];
  [caps setObject:@"MAC" forKey:@"platform"];
  [caps setValue:[NSNumber numberWithBool:YES]
          forKey:@"javascriptEnabled"];
  [caps setObject:@"1.0" forKey:@"version"];
  return caps;
}

- (void)deleteSession {
  NSLog( @"Delete session: %d", sessionId_ );
  [contents removeAllObjects];
  [elementStore_ release];
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

#pragma mark Webdriver Resource configuration

- (void)configureResource:(id<HTTPResource>)resource {
  if ([resource respondsToSelector:@selector(setSession:)]) {
    [(id)resource setSession:[NSString stringWithFormat:@"%d", sessionId_]];
  }
}

- (id<HTTPResource>)elementWithQuery:(NSString *)query {
  id<HTTPResource> resource = [super elementWithQuery:query];
  [self configureResource:resource];
  return resource;
}

@end
