//
//  VirtualDirectory.m
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
	[index release];
	[super dealloc];
}

+ (HTTPVirtualDirectory *)virtualDirectory
{
	return [[[self alloc] init] autorelease];
}

- (void)setResource:(NSObject*)resource withName:(NSString *)name
{
	[contents setValue:resource forKey:name];
}

- (void)removeResourceWithName:(NSString *)name
{
  [contents removeObjectForKey:name];
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
	if ([query isEqualToString:@""])
	{
		if (remainder)
			*remainder = @"";
		return query;
	}
	
  // Discard duplicate '/' characters in the query string to make up for client bugs.
	while ([query characterAtIndex:0] == '/')
	{
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
