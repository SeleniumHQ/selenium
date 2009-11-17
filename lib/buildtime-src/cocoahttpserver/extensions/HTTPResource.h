//
//  HTTPResource.h
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
#import "HTTPResponse.h"

// An HTTPResource is an element which can respond to queries. It represents
// an element in a virtual subdirectory; eg /foo/bar
@protocol HTTPResource<NSObject>

// Get the HTTP response to this request
- (id<HTTPResponse,NSObject>)httpResponseForQuery:(NSString *)query
										   method:(NSString *)method
										 withData:(NSData *)theData;

// Fetch the sub-resource for this relative query string. This may be
// recursively called on contents of subdirectories. The query string is
// relative to the reciever; so if the string is empty you should probably
// return self.
- (id<HTTPResource>)elementWithQuery:(NSString *)query;

@end
