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

// This represents a web element accessible via :session/element/X where X is an
// opaque ID assigned by the server when the element is first located on the
// page.
@interface Element : HTTPVirtualDirectory {
 @private
  // The opaque ID assigned by the server.
  NSString* elementId_;
  Session* session_;
}

@property (nonatomic, readonly, copy) NSString *elementId;
@property (nonatomic, readonly, retain) Session *session;

// Designated initializer. Don't call this directly - instead
// use |elementWithId|.
- (id)initWithId:(NSString*)elementId
      andSession:(Session*)session;

// Create a new element.
+ (Element*)elementWithId:(NSString*)elementId
               andSession:(Session*)session;

// Get the JSON dictionary with this element's ID for transmission
// over the wire: |{"ELEMENT": "elementId"}|.
- (NSDictionary *)idDictionary;

// Locates the first element under this element that matches the given |query|.
// The |query| must have two keys:
// @li "using" - The locator strategy to use.
// @li "value" - The value to search for using the strategy.
// Returns the JSON representation of the located element.
-(NSDictionary*) findElement:(NSDictionary*)query;

// Locates every element on under this element matching the given |query|.
// The |query| must have two keys:
// @li "using" - The locator strategy to use.
// @li "value" - The value to search for using the strategy.
// Returns an array of elements in their JSON representation.
-(NSArray*) findElements:(NSDictionary*)query;

// Simulate a click on the element.
// Dictionary parameters are passed in by REST service, but are redundant
// with directory ID and are thus ignored.
- (void)click:(NSDictionary*)ignored;

// Clear the contents of this input field.
// Dictionary parameters are passed in by REST service, but are redundant
// with directory ID and are thus ignored.
- (void)clear:(NSDictionary*)ignored;

// Submit this form, or the form containing this element.
// Dictionary parameters are passed in by REST service, but are redundant
// with directory ID and are thus ignored.
- (void)submit:(NSDictionary*)ignored;

// The text contained in the element.
- (NSString *)text;

// Type these keys into the element.
// Dictionary parameters are passed in by REST service, but are redundant
// with directory ID and are thus ignored.
- (void)sendKeys:(NSDictionary *)dict;

// Is the element checked?
// This method is only valid on checkboxes and radio buttons.
- (NSNumber *)isChecked;

// Is the element enabled?
- (NSNumber *)isEnabled;

// Is the element displayed on the screen?
- (NSNumber *)isDisplayed;

// Get the attribute with the given name.
- (id)attribute:(NSString *)attributeName;

// Get the effective CSS property with the given name.
- (NSString*)css:(NSString*)property;

// Get the tag name of this element, not the value of the name attribute:
// will return "input" for the element <input name="foo">
- (NSString *)name;

@end


// Directory acts as a bridge, creating subdirectories on demand to handle
// requests to /session/:id/element/:elementId/equals/:other.
@interface ElementComparatorBridge : HTTPVirtualDirectory {
 @private
  Element* element_;
}

@property (nonatomic, readonly, retain) Element* element;

+ (ElementComparatorBridge*) comparatorBridgeFor:(Element*)element;
- (id) initFor:(Element*)element;

@end

// Temporary directory that handles element equality comparisons.
@interface ElementComparator : HTTPVirtualDirectory {
 @private
  ElementComparatorBridge* parentDirectory_;
  NSDictionary* otherElementId_;
}

- (id) initFor:(ElementComparatorBridge*)parentDirectory
   compareWith:(NSDictionary*)otherElementId;

- (id) compareElements;

@end

