//
//  WebDriverHTTPConnection.m
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

#import "WebDriverHTTPConnection.h"
#import "WebViewController.h"
#import "HTTPServerController.h"
#import "HTTPMessage.h"

@implementation WebDriverHTTPConnection

- (NSObject<HTTPResponse> *)httpResponseForRequest:(HTTPMessage*)theRequest {
  // Forward the message to our |RESTServiceMapping| instance.
  return [[HTTPServerController sharedInstance] httpResponseForRequest:theRequest];
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

// Overriding this method since CocoaHTTPServer is just a pass and it doesn't
// do anything with the POST data otherwise. See HTTPConnection.m
- (void)processBodyData:(NSData *)postDataChunk{
  [request appendData:postDataChunk];
}

- (NSData *)preprocessErrorResponse:(HTTPMessage *)response {
  // Return a token 404 message.
  if([response statusCode] == 404) {
    NSString *msg = @"<html><body>Error 404 - Not Found</body></html>";
    [response setBody:[msg dataUsingEncoding:NSUTF8StringEncoding]];

//    NSString *contentLengthStr =
//      [NSString stringWithFormat:@"%u",
//                                 (unsigned)[msgData length]];
  
    
//    CFHTTPMessageSetHeaderFieldValue(response,
//                                     CFSTR("Content-Length"),
//                                     (CFStringRef)contentLengthStr);
  }
  
  return [super preprocessErrorResponse:response];
}


@end
