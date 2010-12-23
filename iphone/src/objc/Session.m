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
#import "JSONRESTResource.h"
#import "HTTPJSONResponse.h"
#import "HTTPResponse+Utility.h"
#import "HTTPServerController.h"
#import "HTTPVirtualDirectory+AccessViewController.h"
#import "HTTPVirtualDirectory+Remove.h"
#import "RootViewController.h"
#import "Session+ExecuteScript.h"
#import "SessionRoot.h"
#import "Storage.h"
#import "Timeouts.h"
#import "WebDriverResource.h"
#import "WebDriverResponse.h"
#import "WebDriverUtilities.h"
#import "WebViewController.h"
#import "Database.h"

static NSString* const LOCAL_STORAGE = @"localStorage";
static NSString* const SESSION_STORAGE = @"sessionStorage";

@implementation Session

@synthesize elementStore = elementStore_;
@synthesize sessionId = sessionId_;
@synthesize implicitWait = implicitWait_;
@synthesize scriptTimeout = scriptTimeout_;

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
  
  // The current title of the web pane.
  [self setResourceToViewMethodGET:@selector(currentTitle)
                              POST:NULL
                          withName:@"title"];
  
  // Go back.
  [self setResourceToViewMethodGET:NULL
                              POST:@selector(back:)
                          withName:@"back"];
  
  // Go forward.
  [self setResourceToViewMethodGET:NULL
                              POST:@selector(forward:)
                          withName:@"forward"];
  
  // Refresh the page.
  [self setResourceToViewMethodGET:NULL
                              POST:@selector(refresh:)
                          withName:@"refresh"];
  
  // Get the loaded HTML
  [self setResourceToViewMethodGET:@selector(source)
                              POST:NULL
                          withName:@"source"];
  
  // Get a screenshot
  [self setResourceToViewMethodGET:@selector(screenshot)
                              POST:NULL
                          withName:@"screenshot"];

  // HTML5 Local WebStorage
  [self setResource:[Storage storageWithSessionId:sessionId_ 
                                          andType:LOCAL_STORAGE]
           withName:@"local_storage"];
  
  // HTML5 Session WebStorage
  [self setResource:[Storage storageWithSessionId:sessionId_ 
                                          andType:SESSION_STORAGE]
           withName:@"session_storage"];
  
  // HTML5 Get and Set GeoLocation
  [self setResourceToViewMethodGET:@selector(location)
                              POST:@selector(setLocation:)
                          withName:@"location"];
  
  // HTML5 Database Storage
  [self setResource:[Database databaseWithSessionId:sessionId_] 
           withName:@"execute_sql"];
  
  // Execute JS function with the given body.
  [self setResource:[WebDriverResource
                     resourceWithTarget:self
                              GETAction:NULL
                             POSTAction:@selector(executeScript:)]
           withName:@"execute"];
 
  [self setResource:[WebDriverResource
                     resourceWithTarget:self
                              GETAction:NULL
                             POSTAction:@selector(executeAsyncScript:)]
           withName:@"execute_async"];
  
  // |ElementStore| handles the /element virtual directory and all of its
  // children. It also installs itself on this session for handling the
  // /elements directory, which is used to find multiple DOM elements on the
  // page.
  elementStore_ = [ElementStore elementStoreForSession:self];

  [self setResource:[Cookie cookieWithSessionId:sessionId_]
           withName:@"cookie"];
  
  [self setResource:[Timeouts timeoutsForSession:self]
           withName:@"timeouts"];
  
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
  [caps setValue:[NSNumber numberWithBool:YES]
          forKey:@"webStorageEnabled"];
  [caps setValue:[NSNumber numberWithBool:YES]
          forKey:@"databaseEnabled"];
  [caps setValue:[NSNumber numberWithBool:YES]
          forKey:@"locationContextEnabled"];
  [caps setValue:[NSNumber numberWithBool:YES]
          forKey:@"takesScreenshot"];
  [caps setObject:@"1.0" forKey:@"version"];
  return caps;
}

- (void)deleteSession {
  NSLog( @"Delete session: %d", sessionId_ );
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

#pragma mark Webdriver Resource configuration

- (void)configureResource:(id<HTTPResource>)resource {
  if ([resource respondsToSelector:@selector(setSession:)]) {
    [(id)resource setSession:[NSString stringWithFormat:@"%d", sessionId_]];
  }
}

- (id<HTTPResource>)elementWithQuery:(NSString *)query {
  // Make sure the web view has finished all pending loads before continuing.
  [[self viewController] waitForLoad];

  id<HTTPResource> resource = [super elementWithQuery:query];
  [self configureResource:resource];
  return resource;
}

@end
