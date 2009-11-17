//
//  HTTPServerTests.m
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

#import "GTMSenTestCase.h"
#import "HTTPServer.h"
#import "WebDriverHTTPConnection.h"
#import "AsyncSocket.h"
#import "WebDriverHTTPConnection.h"
#import "HTTPResponse.h"
#import "HTTPRedirectResponse.h"

// These tests test that the HTTP Server can correctly send redirect methods,
// handle get, put, post and deletes and respond with custom-generated errors.
// This is all the functionality the web server extensions patch adds to
// CocoaHTTPServer.

// These tests do not simulate actual network traffic but instead inject
// HTTP data into CocoaHTTPServer through AsyncSocket.


// This category lets us access an otherwise internal method of HTTPConnection.
@interface WebDriverHTTPConnection (Internal)

-(void)replyToHTTPRequest;
-(void)setRequest:(CFHTTPMessageRef)newRequest;

@end

// This category lets us dig into the HTTPConnection.
@implementation WebDriverHTTPConnection (TestingAdditions)

- (void)setRequest:(CFHTTPMessageRef)newRequest {
  if (request)
    CFRelease(request);
	
  CFRetain(newRequest);
	
  request = newRequest;
}

@end


@interface HTTPServerTests: SenTestCase {
  HTTPServer *server_;
	
  NSString *lastUrl_;
  NSString *lastMethod_;
  NSData *lastDataBody_;
	
  NSObject<HTTPResponse> *response_;
}

@end


@implementation HTTPServerTests

// Create a simple web server.
-(void) setUp {
  server_ = [[HTTPServer alloc] init];
  [server_ setDelegate:self];
  [server_ setConnectionClass:[WebDriverHTTPConnection class]];
  [server_ setDocumentRoot:[NSURL fileURLWithPath:
                            [@"/" stringByExpandingTildeInPath]]];
  NSError *error = nil;

  BOOL success = [server_ start:&error];

  STAssertEquals(YES, success,
                 @"Could not start server: %@",
                 error);
}

-(void) tearDown {
  [server_ release];
}

- (NSObject<HTTPResponse> *)dummyHTTPResponse {
  NSString *dataString = @"<html><body><h1>hello</h1></body></html>";
  NSData *data = [dataString dataUsingEncoding:NSUTF8StringEncoding];
  return [[[HTTPDataResponse alloc] initWithData:data] autorelease];
}

// This overridden method makes a copy of any HTTP message recieved into our
// HTTPServerTests instance for examination.
- (NSObject<HTTPResponse> *)httpResponseForRequest:(CFHTTPMessageRef)request {
  [lastUrl_ release];
  [lastMethod_ release];
  [lastDataBody_ release];
	
  lastUrl_ = (NSString*)CFURLCopyPath(CFHTTPMessageCopyRequestURL(request));
  lastMethod_ = (NSString*)CFHTTPMessageCopyRequestMethod(request);
  lastDataBody_ = (NSData*)CFHTTPMessageCopyBody(request);
	
  if (response_ == nil)
    return [self dummyHTTPResponse];
  else
    return [[response_ retain] autorelease];
}

// Test if the server has started.
-(void)testStarted {
  // We don't need to do anything here - setUp is called automatically and it
  // will throw an exception if the server didn't start.
}

- (NSURL *)baseURL {
  return [NSURL URLWithString:
          [NSString stringWithFormat:@"http://localhost:%d/", [server_ port]]];
}

// Inject a given HTTP request into the web server.
- (void)injectRequest:(CFHTTPMessageRef)request {
  // Make a fake AsyncSocket with the data we want to inject.
  AsyncSocket *sock = [[AsyncSocket alloc] init];
  WebDriverHTTPConnection *connection = [[WebDriverHTTPConnection alloc] 
                                         initWithAsyncSocket:sock 
                                                   forServer:server_];
  [connection onSocketWillConnect:sock];
  [connection setRequest:request];
  [connection replyToHTTPRequest];
	
  [connection autorelease];
  [sock release];
}

// Test that we correctly recieved and handled an HTTP request with the
// designated message and data.
- (void)sendTestRequestWithMethod:(NSString *)method data:(NSString *)dataStr {
  STAssertNotNULL(server_, @"server is null");
  NSString *testURL = @"/a/b/c";
	
  NSURL *url = [NSURL URLWithString:testURL relativeToURL:[self baseURL]];
  CFHTTPMessageRef request = CFHTTPMessageCreateRequest(NULL,
                                                        (CFStringRef)method,
                                                        (CFURLRef)url,
                                                        kCFHTTPVersion1_1);
	
  NSData *data = nil;
  if (dataStr != nil) {
    data = [dataStr dataUsingEncoding:NSUTF8StringEncoding];
    CFHTTPMessageSetBody(request, (CFDataRef)data);
  }
	
  [self injectRequest:request];
  CFRelease(request);
	
  STAssertNotNULL(lastMethod_, @"Did not recieve HTTP request");
  STAssertEqualStrings(method, lastMethod_,
                       @"Recieved method incorrect - expected %@ recieved %@",
                       method, lastMethod_);
  STAssertEqualStrings(testURL, lastUrl_,
                       @"Recieved URL incorrect - expected %@ recieved %@",
                       testURL, lastUrl_);

  if (dataStr != nil) {
    BOOL dataMathches = [lastDataBody_ isEqualToData:data];
    STAssertTrue(dataMathches, @"Body data does not match!");
  }
}

- (void)testGET {
  [self sendTestRequestWithMethod:@"GET" data:nil];
}

- (void)testDELETE {
  [self sendTestRequestWithMethod:@"DELETE" data:nil];
}

- (void)testPUT {
  [self sendTestRequestWithMethod:@"PUT" data:@"hi mum"];
}

- (void)testPOST {
  [self sendTestRequestWithMethod:@"POST" data:@"hello there"];
}

// Test that the server correctly respects redirect responses. 
- (void)testRedirect {
  NSString *destinationURL = @"/foo/bar/bat";
  response_ = [HTTPRedirectResponse redirectToURL:destinationURL];
	
  STAssertNotNULL(server_, @"server is null");
  NSString *testURL = @"/a/b/c";
	
  NSURL *url = [NSURL URLWithString:testURL relativeToURL:[self baseURL]];
  CFHTTPMessageRef request = CFHTTPMessageCreateRequest(NULL,
                                                        CFSTR("GET"),
                                                        (CFURLRef)url,
                                                        kCFHTTPVersion1_1);
  [self injectRequest:request];
  CFRelease(request);
	
  // TODO(josephg): This test is incomplete.
}

// TODO(josephg): Add a test for error responses (502, etc).

@end
