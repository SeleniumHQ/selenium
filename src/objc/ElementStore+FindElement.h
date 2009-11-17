//
//  ElementStore+FindElement.h
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
#import "ElementStore.h"

// This category implements the findElement[s] methods accessable on
// :context/element and :context/elements.
// The methods simply forward the requests to the document |Element|'s
// findElement methods.
@interface ElementStore (FindElement)

// Find and return a single element found after searching with the given search
// method and query. The search method can be 'class', 'name', 'id',
// 'link text' and 'class name'.
// Throws an exception if no element can be found.
- (NSArray *)findElementByMethod:(NSString *)method query:(NSString *)query;

// Find and return all matching elements for the search method and query.
// Valid search methods are the same as for |findElementByMethod:query:| above.
// Throws an exception if no element can be found.
- (NSArray *)findElementsByMethod:(NSString *)method query:(NSString *)query;

@end
