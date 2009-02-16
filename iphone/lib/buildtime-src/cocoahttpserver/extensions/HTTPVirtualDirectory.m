//
//  VirtualDirectory.m
//  iWebDriver
//
//  Created by Joseph Gentle on 12/4/08.
//  Copyright 2008 __MyCompanyName__. All rights reserved.
//

#import "HTTPVirtualDirectory.h"
#import "HTTPStaticResource.h"

@implementation HTTPVirtualDirectory

@synthesize index, redirectBaseToIndex;

- (id)init
{
	if (![super init])
		return nil;
	
	redirectBaseToIndex = NO;
	contents = [[NSMutableDictionary alloc] init];
	
	return self;
}

- (void)dealloc
{
	[contents release];
	[super dealloc];
}

+ (HTTPVirtualDirectory *)virtualDirectory
{
	return [[[self alloc] init] autorelease];
}

- (void)setResource:(id<HTTPResource>)resource withName:(NSString *)name
{
	[contents setValue:resource forKey:name];
}

// Trim leading and trailing '/' characters
+ (NSString *)trimPathSeparatorFrom:(NSString *)query
{
	if ([query isEqualToString:@""])
		return query;
	
	NSCharacterSet *separators = [NSCharacterSet characterSetWithCharactersInString:@"/"]; 
	
	return [query stringByTrimmingCharactersInSet:separators];	
}

// Discard everything after the next '/' or '?' character
+ (NSString *)getNextPathElementInQuery:(NSString *)query Remainder:(NSString **)remainder
{
//	query = [self trimPathSeparatorFrom:query];

	if ([query isEqualToString:@""])
	{
		if (remainder)
			*remainder = @"";
		return query;
	}
	
	if ([query characterAtIndex:0] == '/')
	{
//		NSLog(@"trimming '/'");
		query = [query substringFromIndex:1];
	}
	
	NSCharacterSet *separators = [NSCharacterSet characterSetWithCharactersInString:@"/?"];
	NSRange range = [query rangeOfCharacterFromSet:separators];
	
	if (range.location == NSNotFound)
	{
		if (remainder)
			*remainder = @"";
		return query;
	}
	else
	{
		if (remainder)
			*remainder = [query substringFromIndex:range.location];
		return [query substringToIndex:range.location];
	}
}

- (id<HTTPResource>)elementWithQuery:(NSString *)query
{
//	NSLog(@"query: '%@'", query);

	// There's no file specified. Return the directory's index
	if ([query isEqualToString:@""]
		|| [query isEqualToString:@"/"])
	{
		return index;
	}
	
	NSString *remainder;
	NSString *element = [[self class] getNextPathElementInQuery:query
													  Remainder:&remainder];
	
	if ([element isEqualToString:@""])
	{
		NSLog(@"Invalid query: %@", query);
		return nil;
	}
	
//	NSLog(@"extracting element %@", element);
	id<HTTPResource> resource = [contents objectForKey:element];

	if ([remainder isEqualToString:@""]
		&& [resource isKindOfClass:[HTTPVirtualDirectory class]]
		&& [(HTTPVirtualDirectory*)resource redirectBaseToIndex] == YES)
	{
		// So at this stage, we've distilled the URL down to the final element.
		// If the final element is a directory, we should bounce the client to
		// foo/ - which will then send the directory's index.
		// Its a bit of a kludge putting it here.
		return [HTTPStaticResource redirectWithURL:[NSString stringWithFormat:@"%@/", element]];
	}
	else
	{
		resource = [resource elementWithQuery:remainder];
	}

	return resource;
}

- (id<HTTPResponse,NSObject>)httpResponseForQuery:(NSString *)query
									method:(NSString *)method
								  withData:(NSData *)theData
{
	// This will recursively find the correct handler for this URL
	id<HTTPResource> resource = [self elementWithQuery:query];
	
	return [resource httpResponseForQuery:query method:method withData:theData];
}

@end
