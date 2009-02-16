//
//  WebDriverHTTPConnection.m
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

#import "WebDriverHTTPConnection.h"
#import "WebViewController.h"
#import "HTTPServerController.h"

@implementation WebDriverHTTPConnection

- (NSObject<HTTPResponse> *)httpResponseForRequest:(CFHTTPMessageRef)theRequest {
  // Forward the message to our |RESTServiceMapping| instance.
  return [[server delegate] httpResponseForRequest:theRequest];
}

- (NSObject<HTTPResponse> *)httpResponseForMethod:(NSString *)method
                                              URI:(NSString *)path {
  return [self httpResponseForRequest:request];
}

- (BOOL)supportsMethod:(NSString *)method atPath:(NSString *)path {
  // It is up to the |HTTPResource| to determine if it supports a given method.
  // If it doesn't, we'll throw a custom exception.
  return YES;
}

// Overridden to read the data chunk straight into the request object.
// iWebDriver doesn't support range requests. 
- (void)prepareForBodyWithSize:(UInt64)contentLength {
  // Since none of the webdriver RPC methods send much data, for simplicity
  // we'll buffer the whole POST data segment in memory.
  NSMutableData *data = [[NSMutableData alloc] initWithCapacity:contentLength];
  CFHTTPMessageSetBody(request, (CFDataRef)data);
  [data release];
}

// Overridden to read the data chunk straight into the request object.
// See |prepareForBodyWithSize:| above.
- (void)processDataChunk:(NSData *)postDataChunk {
  CFHTTPMessageAppendBytes(request,
                           [postDataChunk bytes],
                           [postDataChunk length]);
}

- (NSData *)preprocessErrorResponse:(CFHTTPMessageRef)response {
  // Return a token 404 message.
  if(CFHTTPMessageGetResponseStatusCode(response) == 404) {
    NSString *msg = @"<html><body>Error 404 - Not Found</body></html>";
    NSData *msgData = [msg dataUsingEncoding:NSUTF8StringEncoding];

    CFHTTPMessageSetBody(response, (CFDataRef)msgData);

    NSString *contentLengthStr =
      [NSString stringWithFormat:@"%u",
                                 (unsigned)[msgData length]];
  
    CFHTTPMessageSetHeaderFieldValue(response,
                                     CFSTR("Content-Length"),
                                     (CFStringRef)contentLengthStr);
  }
  
  return [super preprocessErrorResponse:response];
}


@end
