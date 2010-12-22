//
//  Element.m
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

#import "ElementStore.h"

#import "JSONRESTResource.h"
#import "HTTPRedirectResponse.h"
#import "WebViewController.h"
#import "HTTPVirtualDirectory+AccessViewController.h"
#import "HTTPVirtualDirectory+ExecuteScript.h"
#import "HTTPVirtualDirectory+FindElement.h"
#import "WebDriverResource.h"
#import "Element.h"
#import "NSException+WebDriver.h"
#import "Session.h"
#import "errorcodes.h"

@implementation ElementStore

@synthesize session = session_;

- (id)initWithSession:(Session*) session {
  if (![super init]) {
    return nil;
  }

  session_ = session;

  // Install ourselves under the session's virtual directory
  [session setResource:self withName:@"element"];
  [self setIndex:[WebDriverResource resourceWithTarget:self
                                             GETAction:NULL
                                            POSTAction:@selector(findElement:)]];

  [session setResource:[WebDriverResource
                        resourceWithTarget:self
                                 GETAction:NULL
                                POSTAction:@selector(findElements:)]
              withName:@"elements"];

  // Install the special handler that retrieves the active element on the page.
  [self setResource:[WebDriverResource
                     resourceWithTarget:self
                              GETAction:NULL
                             POSTAction:@selector(getActiveElement:)]
           withName:@"active"];
  
  return self;
}

- (void)dealloc {
  [super dealloc];
}

+ (ElementStore *)elementStoreForSession:(Session*)session {
  return [[[ElementStore alloc] initWithSession:session] autorelease];
}

// Discard everything after the next '/' or '?' character
- (NSString *)getNextPathElementInQuery:(NSString *)query {
  if ([query isEqualToString:@""]) {
    return query;
  }

  // Discard duplicate '/' characters in the query string to
  // make up for client bugs.
  while ([query characterAtIndex:0] == '/') {
    query = [query substringFromIndex:1];
  }

  NSCharacterSet *separators =
      [NSCharacterSet characterSetWithCharactersInString:@"/?"];
  NSRange range = [query rangeOfCharacterFromSet:separators];

  return range.location == NSNotFound
      ? query
      : [query substringToIndex:range.location];
}

// Overrides |elementWithQuery| to redirect a request for an |Element| resource
// to that specific subdirectory.
- (id<HTTPResource>)elementWithQuery:(NSString *)query {
  if ([query length] > 0) {
    NSString* queriedElement = [self getNextPathElementInQuery:query];

    // Check if there is a already a handler registered for this element.
    // Note that "active" is a reserved ID whose handler is registered in
    // this class's initializer.
    id<HTTPResource> resource = [contents objectForKey:queriedElement];
    if (resource == nil) {
      NSLog(@"Adding directory for element %@", queriedElement);
      // TODO(jleyba): Fix memory leak and remove stale element directories.
      resource = [Element elementWithId:queriedElement
                             andSession:session_];
      [self setResource:resource withName:queriedElement];
    }
  }
  // Need to delegate back to |super| so |Session| can set the session ID on the
  // response.
  return [super elementWithQuery:query];
}

- (NSDictionary*) getActiveElement:(NSDictionary *)ignored {
  return (NSDictionary*) [self
      executeJsFunction:@"function() {return document.activeElement || "
                         "document.body;}"
               withArgs:[NSArray array]];
}

-(NSDictionary*) findElement:(NSDictionary*)query {
  return [self findElement:query
                      root:nil
            implicitlyWait:[session_ implicitWait]];
}

-(NSArray*) findElements:(NSDictionary*)query {
  return [self findElements:query
                       root:nil
             implicitlyWait:[session_ implicitWait]];
}

@end
