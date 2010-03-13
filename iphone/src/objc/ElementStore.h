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

@class Element;

// This represents the /:session/element 'directory'.
// All the elements are in /element/X where X is the element's id.
// The elements are kept in a JS array on the webpage.
// TODO: Fix memory leak of elements never being destroyed when new pages
// are navigated to.
@interface ElementStore : HTTPVirtualDirectory {
 @private
  int nextElementId_;
 
 @protected
  // This is not actually an HTMLElement, but for the purposes of searching
  // for elements across the whole web page, I'm going to treat it as one.
  Element *document_;
}

@property (nonatomic, readonly) Element *document;

// Make an element store.
+ (ElementStore *)elementStore;

// Create an element from a JS object and add it to the REST interface.
// The input is a javascript expression which will be evaluated multiple times.
// You probably should store your complex expression in a variable and pass in
// that.
- (Element *)elementFromJSObject:(NSString *)jsObject;
// Create an array of obj-c elements from the elements stored in the javascript
// array called container.
- (NSArray *)elementsFromJSArray:(NSString *)container;

// Get javascript locator to access an element with the given id.
- (NSString *)jsLocatorForElementWithId:(NSString *)elementId;

// Get javascript locator for given element
- (NSString *)jsLocatorForElement:(Element *)element;

@end
