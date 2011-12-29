//
//  HTTPJSONResponse.h
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

// |HTTPJSONResponse| wraps |HTTPDataResponse| for JSON data. It is used to
// return JSON from an HTTP method.
// 
// Memory use is proportional to the size of the JSON of the object returned.
// Be careful returning very large objects!
@interface HTTPJSONResponse : HTTPDataResponse {

}

// Create an |HTTPJSONResponse| from the object. The object is serialised to
// JSON immediately.
// Object must be one of NSNumber, NSString, NSDictionary, NSArray.
- (id)initWithObject:(id)object;

// A helper method for |initWithObject:| above. As with |initWithObject:|,
// object must be one of NSNumber, NSString, NSDictionary, NSArray.
// Follows standard autorelease pattern.
+ (HTTPJSONResponse *)responseWithObject:(id)object;

@end
