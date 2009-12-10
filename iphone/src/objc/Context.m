//
//  Context.m
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

#import "Context.h"
#import "Cookie.h"
#import "JSONRESTResource.h"
#import "HTTPResponse+Utility.h"
#import "HTTPJSONResponse.h"
#import "WebViewController.h"
#import "HTTPServerController.h"
#import "ElementStore.h"
#import "ElementStore+FindElement.h"
#import "HTTPVirtualDirectory+AccessViewController.h"
#import "WebDriverResponse.h"
#import "WebDriverResource.h"
#import "Context+ExecuteScript.h"

// There is only one context. The whole notion of context (separate from
// session) may be removed some day. When that happens, the functionality
// |Context| provides will be migrated into |Session|.
static NSString * const CONTEXT_NAME = @"foo";

@implementation Context

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

- (id)initWithSessionId:(int)theSessionId {
  if (![super init])
    return nil;

  sessionId_ = theSessionId;
  
  // The index returns the capabilities and OS of the browser
  [self setIndex:[WebDriverResource resourceWithTarget:self
                                             GETAction:@selector(capabilities)
                                            POSTAction:@selector(capabilities)
                                             PUTAction:NULL
                                          DELETEAction:@selector(deleteContext)
   ]];

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
  WebDriverResource *executeScript
        = [WebDriverResource resourceWithTarget:self
                                      GETAction:NULL
                                     POSTAction:@selector(executeScript:withArguments:)];
  [executeScript setAllowOptionalArguments:YES];
  [self setResource:executeScript withName:@"execute"];

  // /element will be an ElementStore virtual directory. We also forward 
  // /elements to the element store - getting from there returns multiple
  // element results.
  elementStore_ = [[ElementStore alloc] init];
  [self setResource:elementStore_ withName:@"element"];
  [self setResource:[WebDriverResource resourceWithTarget:elementStore_
                                                GETAction:NULL
                                               POSTAction:@selector(findElementsByMethod:query:)]
           withName:@"elements"];
  
  [self setResource:[Cookie cookieWithSessionId:sessionId_]
           withName:@"cookie"];
  
  return self;
}

- (id)init {
  NSLog(@"context created with unknown session id");
  return [self initWithSessionId:0];
}

- (void)dealloc {
  [super dealloc];
}

+ (NSString *)contextName {
  return CONTEXT_NAME;
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

// This is called from session when the client sends DELETE to session.
- (void)deleteContext {
  NSLog( @"Delete session: %d", sessionId_ );
  [contents removeAllObjects];
  [elementStore_ release];
}

#pragma mark Webdriver Resource configuration

- (void)configureResource:(id<HTTPResource>)resource {
  if ([resource respondsToSelector:@selector(setContext:)]) {
    [(id)resource setContext:CONTEXT_NAME];
  }
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
