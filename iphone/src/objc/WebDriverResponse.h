//
//  WebDriverResponse.h
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

@class HTTPJSONResponse;

// |WebDriverResponse| mirrors the |Response| class in webdriver. It is the
// return type for all of WebDriver's RPC methods.
//
// This is implemented as a proxy around an HTTPResponse. When the standard
// HTTPResponse methods are called, the data in WebDriverResponse's fields are
// baked into an HTTPJSONResponse and the data fields (isError, value, etc)
// become immutable.
// 
// Don't confuse HTTPResponse (a response to an HTTP message) and a
// WebDriver |Response| (an HTTPResponse containing the return value of a
// method).
@interface WebDriverResponse : NSObject {
  // These fields mirror their equivalents in WebDriver.
  
  // Did the method call generate an error?
  BOOL isError_;
  // The value the method returned or the exception generated
  id value_;
  
  // The active session
  NSString *sessionId_;
  // The active context
  NSString *context_;

  // We're a proxy around this response.
  HTTPDataResponse *response_;
}

@property (nonatomic) BOOL isError;
@property (nonatomic, retain) id value;
@property (nonatomic, copy) NSString *sessionId;
@property (nonatomic, copy) NSString *context;

- (id)initWithValue:(id)value;
- (id)initWithError:(id)error;

+ (WebDriverResponse *)responseWithValue:(id)value;
+ (WebDriverResponse *)responseWithError:(id)error;

- (HTTPDataResponse *)response;

@end

// This is needed so the world knows that WebDriverResponse indirectly
// implements the |HTTPResponse| protocol. WebDriverResponse implements this
// through forwarding. Doing it this way supresses compiler warnings. 
@interface WebDriverResponse (ForwardedHTTPResponse) <HTTPResponse>

@end