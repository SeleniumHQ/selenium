//
//  Attribute.h
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

// This represents the element/:elementId/attribute virtual directory.
@interface Attribute : HTTPVirtualDirectory {
  Element *element_;
}

+ (Attribute *)attributeDirectoryForElement:(Element *)element;

// Designated initialiser. Does not retain the element as per
// parent retain pattern.
- (id)initForElement:(Element *)element;

@end

// This represents the element/:elementId/attribute/:name virtual directory.
// This directory is dynamically added by |Attribute| the first time a request
// is received for |:name|.
@interface NamedAttribute : HTTPVirtualDirectory {
  @private
  Element* element_;
  NSString* name_;
}

+ (NamedAttribute *)namedAttributeDirectoryForElement:(Element *)element
                                              andName:(NSString *)name;
- (id)initForElement:(Element *)element
             andName:(NSString *)name;

- (id)getAttribute;

@end
