//
//  RESTServiceMapping.m
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

#import "RESTServiceMapping.h"
#import "HTTPJSONResponse.h"
#import "HTTPVirtualDirectory.h"
#import "HTTPStaticResource.h"
#import "HTTPRedirectResponse.h"
#import "JSONRESTResource.h"
#import "Session.h"
#import "SessionRoot.h"
#import "Status.h"
#import "HTTPResponse+Utility.h"
#import "RootViewController.h"

@implementation RESTServiceMapping

@synthesize serverRoot = serverRoot_;

- (id)initWithIpAddress:(NSString *)ipAddress 
                   port:(int)port {
  if (![super init])
    return nil;

  serverRoot_ = [[HTTPVirtualDirectory alloc] init];

  // This makes up for a bug in the java http client (r733). We forward
  // requests for /session to /hub/session.
  [serverRoot_ setResource:[[HTTPRedirectResponse alloc]initWithPath:@"/hub/session/"]
                  withName:@"session"];

  // The root of our REST service.
  HTTPVirtualDirectory *restRoot = [[[HTTPVirtualDirectory alloc] init] autorelease];
  [serverRoot_ setResource:restRoot withName:@"hub"];
  
  // Respond to /status
  [restRoot setResource:[[[Status alloc] init] autorelease] withName:@"status"];

  // Make the root also accessible from /wd/hub. This will allow clients hard
  // coded for the java Selenium server to also work with us.
  HTTPVirtualDirectory *wd = [[[HTTPVirtualDirectory alloc] init] autorelease];
  [wd setResource:restRoot withName:@"hub"];
  [serverRoot_ setResource:wd withName:@"wd"];
  
  HTTPDataResponse *response =
    [[HTTPDataResponse alloc]
                 initWithData:[@"<html><body><h1>iWebDriver ready.</h1></body>"
                               "</html>"
            dataUsingEncoding:NSASCIIStringEncoding]];
  
  [restRoot setIndex:[HTTPStaticResource resourceWithResponse:response]];
  [response release];
  
  [restRoot setResource:[[SessionRoot alloc] initWithAddress:ipAddress port:[NSString stringWithFormat:@"%d", port] ]
               withName:@"session"];
  	
  return self;
}

// Extract message properties from an http request and return them.
// Pass nil in the |query|, |method| or |data| arguments to ignore.
+ (void)propertiesOfHTTPMessage:(HTTPMessage*)request
                        toQuery:(NSString **)query
                          toUri:(NSURL **)uri
                         method:(NSString **)method
                           data:(NSData **)data {
  // Extract method
  if (method != nil) {
    *method = [request method];
  }
  
  // Extract requested URI
  if (query != nil) {
    *uri = [request url];
    *query = [*uri relativeString];
  }
  
  // Extract POST data
  if (data != nil) {
    *data = [request body];
  }
}

// Send the request to the right HTTPResource and return its response.
- (NSObject<HTTPResponse> *)httpResponseForRequest:(HTTPMessage*)request {

  NSString *query;
  NSURL *uri;
  NSString *method;
  NSData *data;
  
  [RESTServiceMapping propertiesOfHTTPMessage:request
                                      toQuery:&query
                                        toUri:&uri
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
    NSString * path = [[(HTTPRedirectResponse *)response httpHeaders] objectForKey:@"Location"];
    response = [[HTTPRedirectResponse alloc] initWithPath:
                [[NSString alloc] initWithFormat:@"http://%@:%@/wd/hub/%@",
                                       [uri host], [uri port], path ]
                ];
    NSLog(@"redirecting to: http://%@:%@/wd/hub/%@", [uri host], [uri port], path);
  }
	
  if (response == nil) {
    NSLog(@"404 - could not create response for request at %@", query);
  }
  
  return response;
}

@end
