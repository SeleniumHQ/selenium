//
//  HTTPRedirectResponse.m
//  iWebDriver
//
//  Created by Joseph Gentle on 12/5/08.
//  Copyright 2008 __MyCompanyName__. All rights reserved.
//

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
