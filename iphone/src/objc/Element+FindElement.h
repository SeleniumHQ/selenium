//
//  Element+FindElement.h
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
#import "Element.h"

// The |FindElement| category finds elements underneath self in the DOM.
// These methods are exposed via the URLs:
// :session/element/elementId/element[s]/{xpath|name|id|link+text|class+name}
//
// |FindElement| also indirectly handles the global findElement methods
// accessible via: 
// :session/element[s] (with method and query sent in POST).
// These search requests are recieved by |ElementStore| and then forwarded here
// via the document |Element|.
@interface Element (FindElement)

// Add the search element/ and elements/ subdirs to the |Element| virtual
// directory.
- (void)addSearchSubdirs;

// This will find child elements of an element.
- (NSArray *)findElementsByMethod:(NSString *)method query:(NSString *)query;

// This is a wrapper around the /element/id/element[s]/{xpath|name|...} family
// of methods. These send their arguments in a dict which looks like:
// {"value":"test_id_out","using":"id","id":"23"}.
- (NSArray *)findElementsUsing:(NSDictionary *)dict;

// As |findElementsUsing:| above, but only returns one argument.
- (NSDictionary *)findElementUsing:(NSDictionary *)dict;
@end
