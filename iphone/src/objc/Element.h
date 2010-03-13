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

@class ElementStore;

// This represents a web element accessible via :session/element/X where X is
// the element's elementId. (These are numbers indexed from 0, with 0 reserved
// for the document).
@interface Element : HTTPVirtualDirectory {
 @private
  // The ID of the element. The element is accessible in JS at
  // ELEM_ARRAY[id] or in REST at .../session/element/id
  NSString *elementId_;
  
  // A link back to the element store. Needed for creating new elements.
  // Not retained to avoid a circular dependency.
  ElementStore *elementStore_;
}

@property (nonatomic, readonly, copy) NSString *elementId;

// Designated initializer. Don't call this directly - instead
// use |elementFromJSObject:inStore:| which will generate an id for the element.
- (id)initWithId:(NSString *)elementId inStore:(ElementStore *)store;

// Create a new element from a JSON expression and put the element into the
// element store specified.
+ (Element *)elementFromJSObject:(NSString *)object
                         inStore:(ElementStore *)store;

// Same as |elementFromJSObject:inStore:| above, but using the element's store.
- (Element *)elementFromJSObject:(NSString *)object;

// Returns the key for the element ID in the dictionary returned by
// |idDictionary|.
+ (NSString *)elementIdKey;

// Get the JSON dictionary with this element's ID for transmission
// over the wire: |{"ELEMENT": "elementId"}|.
- (NSDictionary *)idDictionary;

// Get the relative URL for this element (relative to the session).
- (NSString *)url;

// Is this element the document?
- (BOOL)isDocumentElement;

// Get a javascript string through which the element can be accessed and used
// in JS.
- (NSString *)jsLocator;

// Simulate a click on the element. An |NSDictionary| is passed in through REST,
// but it is ignored.
- (void)click:(NSDictionary *)dict;

// Clear the contents of this input field.
- (void)clear;

// Submit this form, or the form containing this element.
- (void)submit;

// The text contained in the element.
- (NSString *)text;

// Type these keys into the element.
- (void)sendKeys:(NSDictionary *)dict;

// Is the element checked?
// This method is only valid on checkboxes and radio buttons.
- (NSNumber *)isChecked;

// Set the element's checked property.
// This method is only valid on checkboxes and radio buttons.
- (void)setChecked:(NSNumber *)numValue;

// Toggle the element's checked property.
// This method is only valid on checkboxes and radio buttons.
- (void)toggleSelected;

// Is the element enabled?
- (NSNumber *)isEnabled;

// Is the element displayed on the screen?
- (NSNumber *)isDisplayed;

// Throws an error if this element is not displayed on the screen.
- (void) verifyIsDisplayed;

// Get the attribute with the given name.
- (NSString *)attribute:(NSString *)attributeName;

// Get the tag name of this element, not the value of the name attribute:
// will return "input" for the element <input name="foo">
- (NSString *)name;

@end
