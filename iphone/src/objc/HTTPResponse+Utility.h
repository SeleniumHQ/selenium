//
//  HTTPDataResponse+Utility.h
//  iWebDriver
//
//  Copyright 2009 Google Inc.
//  Copyright 2011 Software Freedom Conservancy.
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
#import "HTTPDataResponse.h"

// The |Utility| category adds some convenience methods to HTTPDataResponse
// allowing |HTTPDataResponse|s to be created from strings.
@interface HTTPDataResponse (Utility)

// Init an |HTTPDataResponse| containing the given string encoded in UTF8. 
- (id)initWithString:(NSString *)str;

// Create and return an |HTTPDataResponse| containing the given string encoded
// in UTF8. Returned object is autoreleased.
+ (HTTPDataResponse *)responseWithString:(NSString *)str;

- (NSString *)description;

@end
