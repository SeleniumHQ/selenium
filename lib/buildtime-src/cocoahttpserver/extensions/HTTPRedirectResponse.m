//
//  HTTPRedirectResponse.m
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

#import "HTTPRedirectResponse.h"


@implementation HTTPRedirectResponse

@synthesize destination;

- (id)initWithDestination:(NSString *)url data:(NSData *)messageData
{
	if (![super initWithData:messageData])
		return nil;
	
	[self setDestination:url];
	
	return self;	
}

- (id)initWithDestination:(NSString *)url
{
	NSString *dataString = [NSString stringWithFormat:
	@"<html><head><title>Moved</title></head>\
	<body><h1>Moved</h1><p>This page has moved to <a href=\"%@\">%@</a>.</p></body></html>",
							url, url];
	
	return [self initWithDestination:url
								data:[dataString dataUsingEncoding:NSASCIIStringEncoding]];
}

+ (HTTPRedirectResponse *)redirectToURL:(NSString *)url
{
	return [[[self alloc] initWithDestination:url] autorelease];
}

- (void)dealloc
{
	[destination release];
	[super dealloc];
}

- (NSString *)redirectURL
{
	return destination;
}

- (void)expandRelativeUrlWithBase:(NSURL *)base
{
//	NSLog(@"relativeString %@ absoluteString %@ path %@", [base relativeString], [base absoluteString], [base path]);

//	NSLog(@"expanding %@ relative to %@", destination, [base absoluteString]);
	NSURL *url = [NSURL URLWithString:destination relativeToURL:base];
	// This is silly, but apparently necessary to form a proper URL
	url = [[url absoluteURL] standardizedURL];
//	NSLog(@"relativeString %@ absoluteString %@ path %@", [url relativeString], [url absoluteString], [url path]);
	
	[self setDestination:[url relativeString]];
//	NSLog(@"to %@", destination);
}

@end
