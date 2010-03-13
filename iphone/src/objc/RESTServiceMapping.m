//
//  RESTServiceMapping.m
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

#import "RESTServiceMapping.h"
#import "HTTPJSONResponse.h"
#import "HTTPVirtualDirectory.h"
#import "HTTPStaticResource.h"
#import "HTTPRedirectResponse.h"
#import "JSONRESTResource.h"
#import "Session.h"
#import "SessionRoot.h"
#import "HTTPResponse+Utility.h"
#import "RootViewController.h"

@implementation RESTServiceMapping

@synthesize serverRoot = serverRoot_;

- (id)init {
  if (![super init])
    return nil;

  serverRoot_ = [[HTTPVirtualDirectory alloc] init];

  // This makes up for a bug in the java http client (r733). We forward
  // requests for /session to /hub/session.
  [serverRoot_ setResource:[HTTPStaticResource redirectWithURL:@"/hub/session/"]
                  withName:@"session"];

  // The root of our REST service.
  HTTPVirtualDirectory *restRoot = [[[HTTPVirtualDirectory alloc] init] autorelease];
  [serverRoot_ setResource:restRoot withName:@"hub"];
  
  HTTPDataResponse *response =
    [[HTTPDataResponse alloc]
                 initWithData:[@"<html><body><h1>iWebDriver ready.</h1></body>"
                               "</html>"
            dataUsingEncoding:NSASCIIStringEncoding]];
  
  [restRoot setIndex:[HTTPStaticResource resourceWithResponse:response]];
  [response release];
  
  [restRoot setResource:[[[SessionRoot alloc] init] autorelease]
               withName:@"session"];
  	
  return self;
}

// Extract message properties from an http request and return them.
// Pass nil in the |query|, |method| or |data| arguments to ignore.
+ (void)propertiesOfHTTPMessage:(CFHTTPMessageRef)request
                        toQuery:(NSString **)query
                         method:(NSString **)method
                           data:(NSData **)data {
  // Extract method
  if (method != nil) {
    *method = [(NSString *)CFHTTPMessageCopyRequestMethod(request)
                        autorelease];
  }
  
  // Extract requested URI
  if (query != nil) {
    NSURL *uri = [(NSURL *)CFHTTPMessageCopyRequestURL(request) autorelease];
    *query = [uri relativeString];
  }
  
  // Extract POST data
  if (data != nil) {
    *data = [(NSData*)CFHTTPMessageCopyBody(request) autorelease];
  }
}

// Send the request to the right HTTPResource and return its response.
- (NSObject<HTTPResponse> *)httpResponseForRequest:(CFHTTPMessageRef)request {

  NSString *query;
  NSString *method;
  NSData *data;
  
  [RESTServiceMapping propertiesOfHTTPMessage:request
                                      toQuery:&query
                                       method:&method
                                         data:&data];
  
  NSLog(@"Responding to request: %@ %@", method, query);
  if (data) {
    NSLog(@"data: '%@'", [[[NSString alloc] initWithData:data
                                                encoding:NSUTF8StringEncoding]
                            autorelease]);
  }

	// Do the actual work.
  id<HTTPResponse,NSObject> response =
	[serverRoot_ httpResponseForQuery:query
														 method:method
													 withData:data];
	
  // Unfortunately, WebDriver only supports absolute redirects (r733). We need
  // to expand all relative redirects to absolute redirects.
  if ([response isKindOfClass:[HTTPRedirectResponse class]]) {
    NSURL *uri = [(NSURL *)CFHTTPMessageCopyRequestURL(request) autorelease];
    [(HTTPRedirectResponse *)response expandRelativeUrlWithBase:uri];
  }
  
  if (response == nil) {
    NSLog(@"404 - could not create response for request at %@", query);
  }
  
  return response;
}

@end
