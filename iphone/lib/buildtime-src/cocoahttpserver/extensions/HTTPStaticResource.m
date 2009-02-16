//
//  HTTPResourceResponseWrapper.m
//  iWebDriver
//
//  Created by Joseph Gentle on 12/5/08.
//  Copyright 2008 __MyCompanyName__. All rights reserved.
//

#import "HTTPStaticResource.h"
#import "HTTPRedirectResponse.h"

@implementation HTTPStaticResource

@synthesize response;

- (id)initWithResponse:(id<HTTPResponse,NSObject>)theResponse
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

+ (HTTPStaticResource *)resourceWithResponse:(id<HTTPResponse,NSObject>)theResponse
{
	return [[[self alloc] initWithResponse:theResponse] autorelease];
}

+ (HTTPStaticResource *)redirectWithURL:(NSString *)url
{
	return [self resourceWithResponse:[HTTPRedirectResponse redirectToURL:url]];
}

// Get the HTTP response to this request
- (id<HTTPResponse,NSObject>)httpResponseForQuery:(NSString *)query
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
