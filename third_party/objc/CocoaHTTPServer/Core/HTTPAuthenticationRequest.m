#import "HTTPAuthenticationRequest.h"
#import "HTTPMessage.h"

@interface HTTPAuthenticationRequest (PrivateAPI)
- (NSString *)quotedSubHeaderFieldValue:(NSString *)param fromHeaderFieldValue:(NSString *)header;
- (NSString *)nonquotedSubHeaderFieldValue:(NSString *)param fromHeaderFieldValue:(NSString *)header;
@end


@implementation HTTPAuthenticationRequest

- (id)initWithRequest:(HTTPMessage *)request
{
	if ((self = [super init]))
	{
		NSString *authInfo = [request headerField:@"Authorization"];
		
		isBasic = NO;
		if ([authInfo length] >= 6)
		{
			isBasic = [[authInfo substringToIndex:6] caseInsensitiveCompare:@"Basic "] == NSOrderedSame;
		}
		
		isDigest = NO;
		if ([authInfo length] >= 7)
		{
			isDigest = [[authInfo substringToIndex:7] caseInsensitiveCompare:@"Digest "] == NSOrderedSame;
		}
		
		if (isBasic)
		{
			NSMutableString *temp = [[[authInfo substringFromIndex:6] mutableCopy] autorelease];
			CFStringTrimWhitespace((CFMutableStringRef)temp);
			
			base64Credentials = [temp copy];
		}
		
		if (isDigest)
		{
			username = [[self quotedSubHeaderFieldValue:@"username" fromHeaderFieldValue:authInfo] retain];
			realm    = [[self quotedSubHeaderFieldValue:@"realm" fromHeaderFieldValue:authInfo] retain];
			nonce    = [[self quotedSubHeaderFieldValue:@"nonce" fromHeaderFieldValue:authInfo] retain];
			uri      = [[self quotedSubHeaderFieldValue:@"uri" fromHeaderFieldValue:authInfo] retain];
			
			// It appears from RFC 2617 that the qop is to be given unquoted
			// Tests show that Firefox performs this way, but Safari does not
			// Thus we'll attempt to retrieve the value as nonquoted, but we'll verify it doesn't start with a quote
			qop      = [self nonquotedSubHeaderFieldValue:@"qop" fromHeaderFieldValue:authInfo];
			if(qop && ([qop characterAtIndex:0] == '"'))
			{
				qop  = [self quotedSubHeaderFieldValue:@"qop" fromHeaderFieldValue:authInfo];
			}
			[qop retain];
			
			nc       = [[self nonquotedSubHeaderFieldValue:@"nc" fromHeaderFieldValue:authInfo] retain];
			cnonce   = [[self quotedSubHeaderFieldValue:@"cnonce" fromHeaderFieldValue:authInfo] retain];
			response = [[self quotedSubHeaderFieldValue:@"response" fromHeaderFieldValue:authInfo] retain];
		}
	}
	return self;
}

- (void)dealloc
{
	[base64Credentials release];
	[username release];
	[realm release];
	[nonce release];
	[uri release];
	[qop release];
	[nc release];
	[cnonce release];
	[response release];
	[super dealloc];
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark Accessors:
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

- (BOOL)isBasic {
	return isBasic;
}

- (BOOL)isDigest {
	return isDigest;
}

- (NSString *)base64Credentials {
	return base64Credentials;
}

- (NSString *)username {
	return username;
}

- (NSString *)realm {
	return realm;
}

- (NSString *)nonce {
	return nonce;
}

- (NSString *)uri {
	return uri;
}

- (NSString *)qop {
	return qop;
}

- (NSString *)nc {
	return nc;
}

- (NSString *)cnonce {
	return cnonce;
}

- (NSString *)response {
	return response;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark Private API:
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Retrieves a "Sub Header Field Value" from a given header field value.
 * The sub header field is expected to be quoted.
 * 
 * In the following header field:
 * Authorization: Digest username="Mufasa", qop=auth, response="6629fae4939"
 * The sub header field titled 'username' is quoted, and this method would return the value @"Mufasa".
**/
- (NSString *)quotedSubHeaderFieldValue:(NSString *)param fromHeaderFieldValue:(NSString *)header
{
	NSRange startRange = [header rangeOfString:[NSString stringWithFormat:@"%@=\"", param]];
	if(startRange.location == NSNotFound)
	{
		// The param was not found anywhere in the header
		return nil;
	}
	
	NSUInteger postStartRangeLocation = startRange.location + startRange.length;
	NSUInteger postStartRangeLength = [header length] - postStartRangeLocation;
	NSRange postStartRange = NSMakeRange(postStartRangeLocation, postStartRangeLength);
	
	NSRange endRange = [header rangeOfString:@"\"" options:0 range:postStartRange];
	if(endRange.location == NSNotFound)
	{
		// The ending double-quote was not found anywhere in the header
		return nil;
	}
	
	NSRange subHeaderRange = NSMakeRange(postStartRangeLocation, endRange.location - postStartRangeLocation);
	return [header substringWithRange:subHeaderRange];
}

/**
 * Retrieves a "Sub Header Field Value" from a given header field value.
 * The sub header field is expected to not be quoted.
 * 
 * In the following header field:
 * Authorization: Digest username="Mufasa", qop=auth, response="6629fae4939"
 * The sub header field titled 'qop' is nonquoted, and this method would return the value @"auth".
**/
- (NSString *)nonquotedSubHeaderFieldValue:(NSString *)param fromHeaderFieldValue:(NSString *)header
{
	NSRange startRange = [header rangeOfString:[NSString stringWithFormat:@"%@=", param]];
	if(startRange.location == NSNotFound)
	{
		// The param was not found anywhere in the header
		return nil;
	}
	
	NSUInteger postStartRangeLocation = startRange.location + startRange.length;
	NSUInteger postStartRangeLength = [header length] - postStartRangeLocation;
	NSRange postStartRange = NSMakeRange(postStartRangeLocation, postStartRangeLength);
	
	NSRange endRange = [header rangeOfString:@"," options:0 range:postStartRange];
	if(endRange.location == NSNotFound)
	{
		// The ending comma was not found anywhere in the header
		// However, if the nonquoted param is at the end of the string, there would be no comma
		// This is only possible if there are no spaces anywhere
		NSRange endRange2 = [header rangeOfString:@" " options:0 range:postStartRange];
		if(endRange2.location != NSNotFound)
		{
			return nil;
		}
		else
		{
			return [header substringWithRange:postStartRange];
		}
	}
	else
	{
		NSRange subHeaderRange = NSMakeRange(postStartRangeLocation, endRange.location - postStartRangeLocation);
		return [header substringWithRange:subHeaderRange];
	}
}

@end
