//
//  HTTPVirtualDirectory+FindElement.h
//  iWebDriver
//
//  Copyright 2010 WebDriver committers
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

#import <Foundation/Foundation.h>
#import "HTTPVirtualDirectory.h"

// Allows |HTTPVirtualDirectory| instances to locate elements on the page.
@interface HTTPVirtualDirectory (FindElement)

// Searches for the first DOM element on the current page to match the given
// search |query|.  The |query| must be defined by two keys:
//   - using: The locator strategy to use, and
//   - value: The search target.
//
// If |elementId| is nil, the search will be conducted starting from the root of
// the DOM tree.  Otherwise, the search will be restricted to those elements
// under the identified element's DOM subtree. This root element must be
// specified by a WebElement JSON dictionary, as defined in the WebDriver
// wire protocol:
// http://code.google.com/p/selenium/wiki/JsonWireProtocol#Basic_Concepts_And_Terms
//
// If |implicitWait| is greater than zero, the |query| will be reapplied until
// an element is found, or the |implicitWait| times out, which ever occurs
// first.
//
// Returns the located element in its WebElement JSON form.
-(NSDictionary*) findElement:(NSDictionary*)query
                        root:(NSDictionary*)elementId
              implicitlyWait:(NSTimeInterval)implicitWait;

// Searches for all DOM elements on the current page that match the given search
// |query|.  The |query| must be defined by two keys:
//   - using: The locator strategy to use, and
//   - value: The search target.
//
// If |elementId| is nil, the search will be conducted starting from the root of
// the DOM tree.  Otherwise, the search will be restricted to those elements
// under the identified element's DOM subtree. This root element must be
// specified by a WebElement JSON dictionary, as defined in the WebDriver
// wire protocol:
// http://code.google.com/p/selenium/wiki/JsonWireProtocol#Basic_Concepts_And_Terms
//
// If |implicitWait| is greater than zero, the |query| will be reapplied until
// at least one element is found, or the |implicitWait| times out, which ever
// occurs first.
//
// Returns a list of located elements, in their WebElement JSON form.
-(NSArray*) findElements:(NSDictionary*)query
                    root:(NSDictionary*)elementId
          implicitlyWait:(NSTimeInterval)implicitWait;

@end
