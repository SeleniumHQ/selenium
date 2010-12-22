//
//  Element.h
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

#import <Foundation/Foundation.h>
#import "HTTPVirtualDirectory.h"

@class Session;
@class Element;

// This represents the /:session/element 'directory'.
// All the elements are in /element/X where X is the element's id.
// Elements are cached in a JS object on the current page, ensuring the cache is
// cleared whenever a new page is loaded.  The keyword "active" is a special
// element ID reserved for specifying the element which has focus on the page.
@interface ElementStore : HTTPVirtualDirectory {
 @protected
  Session* session_;
}

@property (nonatomic, readonly, retain) Session *session;

- (id) initWithSession:(Session*)session;

// Make an element store.  Installs itself as the /element and /elements
// virtual directory handler for the given |session|.
+ (ElementStore *)elementStoreForSession:(Session*)session;

// Locates the element that currently has focus on the page, falling back to
// the body element if it cannot be determined.
// Returns the WebElement JSON dictionary for the located element.
- (NSDictionary*) getActiveElement:(NSDictionary *)ignored;

// Locates the first element on the page that matches the given |query|. The
// |query| must have two keys:
// @li "using" - The locator strategy to use.
// @li "value" - The value to search for using the strategy.
// Returns the JSON representation of the located element.
-(NSDictionary*) findElement:(NSDictionary*)query;

// Locates every element on the page matching the given |query|. The |query|
// must have two keys:
// @li "using" - The locator strategy to use.
// @li "value" - The value to search for using the strategy.
// Returns an array of elements in their JSON representation.
-(NSArray*) findElements:(NSDictionary*)query;

@end
