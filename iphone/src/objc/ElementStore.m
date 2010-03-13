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
#import "WebDriverResource.h"
#import "ElementStore+FindElement.h"
#import "Element.h"
#import "NSException+WebDriver.h"
#import "errorcodes.h"

static const NSString *JSARRAY = @"_WEBDRIVER_ELEM_CACHE";

@implementation ElementStore

@synthesize document = document_;

- (void)configureJSStore {
  [[self viewController] jsEval:[NSString stringWithFormat:
                                 @"if (typeof %@ !== 'object') var %@ = [];",
                                 JSARRAY,
                                 JSARRAY]];
}

- (id)init {
  if (![super init])
    return nil;
  
  [self configureJSStore];
  
  [self setIndex:[WebDriverResource resourceWithTarget:self
                                             GETAction:NULL
                                            POSTAction:@selector(findElement:)]];
  
  document_ = [self elementFromJSObject:@"document"];
  
  return self;
}

- (void)dealloc {
  [[self index] release]; 
  [super dealloc];
}

+ (ElementStore *)elementStore {
  return [[[self alloc] init] autorelease];
}

- (NSString *)generateElementId {
  return [NSString stringWithFormat:@"%d", nextElementId_++];
}

- (NSString *)jsLocatorForElementWithId:(NSString *)elementId {
  // This is a bit of a hack. Remember that element 0 is always the document.
  // Sometimes the URL will change and we won't reset ELEM_CACHE[0] = document
  // again. Instead of setting it, we'll just refer to element 0 as the document
  // everywhere that it counts.
  if ([elementId isEqualToString:@"0"])
    return @"document";

  // If the element is no longer attached to the DOM, remove it from the cache
  // and throw an error.
  NSLog(@"Checking if element is stale");
  NSString *isStale = [[self viewController] jsEval:
      @"(function(cache, id, currentDocumentElement) {\r"
       "  if (id in cache) {\r"
       "    var e = cache[id];\r"
       "    var parent = e;\r"
       "    while (parent && parent != currentDocumentElement) {\r"
       "      parent = parent.parentNode;\r"
       "    }\r"
       "    if (parent !== currentDocumentElement) {\r"
       "      delete cache[id];\r"
       "      return true;\r"
       "    }\r"
       "  }\r"
       "  return false;\r"
       "})(%@, %@, window.document.documentElement);\r", JSARRAY, elementId];
  if (![isStale isEqualToString:@"false"]) {
    @throw [NSException
            webDriverExceptionWithMessage:@"Element is stale"
                            andStatusCode:EOBSOLETEELEMENT];
  }
  return [NSString stringWithFormat:@"%@[%@]", JSARRAY, elementId];
}

- (NSString *)jsLocatorForElement:(Element *)element {
  return [self jsLocatorForElementWithId:[element elementId]];
}

// Construct an Element from a javascript object. This stores a reference to the
// object in a local array, uses the array index as a new element's key and
// returns the element created.
- (Element *)elementFromJSObject:(NSString *)jsObject {
  if ([[self viewController] jsElementIsNullOrUndefined:jsObject])
    return nil;
  
  NSString *elementId = [self generateElementId];
  Element *element = [[Element alloc] initWithId:elementId inStore:self];
  [element autorelease];

  [self configureJSStore];
  
  // Set the javascript cache to contain the object
  [[self viewController] jsEval:@"%@ = %@;",
                           [self jsLocatorForElementWithId:elementId],
                           jsObject];

  // Add the element to the REST interface
  [self setResource:element withName:elementId];

  return element;
}

// Constructs an array of |Element| objects from a javascript array of
// elements contained in |container|.
// This method maps the elements in the JS array |container| through
// |elementFromJSObject:| (above)
- (NSArray *)elementsFromJSArray:(NSString *)container {
  NSString *lenStr = [[self viewController] jsEval:@"%@.length", container];
  int length = [lenStr intValue];
  
  NSMutableArray *result = [NSMutableArray arrayWithCapacity:length];
  for (int i = 0; i < length; i++) {
    Element *element = [self elementFromJSObject:
                        [NSString stringWithFormat:@"%@[%d]",
                                                  container,
                                                  i]];
    NSLog(@"Found element with id: '%@'", [element attribute:@"id"]);
    [result addObject:element];
  }
  return result;
}

@end
