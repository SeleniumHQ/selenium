//
//  HTTPStaticResource.h
//  iWebDriver
//
//  Copyright 2009 Google Inc.
//  Copyright 2011 Software Freedom Convervancy.
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
#import "HTTPResource.h"
#import "HTTPRedirectResponse.h"

// An HTTPResource which always responds with a particular response.
@interface HTTPStaticResource : NSObject<HTTPResource> {
	HTTPRedirectResponse* response;
}

@property(nonatomic, retain) HTTPRedirectResponse* response;

- (id)initWithResponse:(HTTPRedirectResponse*)theResponse;

+ (HTTPStaticResource *)resourceWithResponse:(HTTPRedirectResponse*)theResponse;

+ (HTTPStaticResource *)redirectWithURL:(NSString *)url;

@end
