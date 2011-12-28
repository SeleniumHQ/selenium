//
//  HTTPStaticResource.m
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

#import "HTTPStaticResource.h"
#import "HTTPRedirectResponse.h"

@implementation HTTPStaticResource

@synthesize response;

- (id)initWithResponse:(HTTPRedirectResponse*)theResponse
{
	if (![super init])
		return nil;
	
	[self setResponse:theResponse];
	
	return self;
}

- (void)dealloc
{
	[response release];
	
	[super dealloc];
}

+ (HTTPStaticResource *)resourceWithResponse:(HTTPRedirectResponse*)theResponse
{
	return [[[self alloc] initWithResponse:theResponse] autorelease];
}

+ (HTTPStaticResource *)redirectWithURL:(NSString *)url
{
	return [self resourceWithResponse:
          [[HTTPRedirectResponse alloc] initWithPath:url]
  ];
}

// Get the HTTP response to this request
- (HTTPRedirectResponse*)httpResponseForQuery:(NSString *)query
										  method:(NSString *)method
										withData:(NSData *)theData
{
	return response;
}

- (id<HTTPResource>)elementWithQuery:(NSString *)query
{
	return self;
}

@end
