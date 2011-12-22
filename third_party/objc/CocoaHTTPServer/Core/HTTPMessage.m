#import "HTTPMessage.h"


@implementation HTTPMessage

- (id)initEmptyRequest
{
	if ((self = [super init]))
	{
		message = CFHTTPMessageCreateEmpty(NULL, YES);
	}
	return self;
}

- (id)initRequestWithMethod:(NSString *)method URL:(NSURL *)url version:(NSString *)version
{
	if ((self = [super init]))
	{
		message = CFHTTPMessageCreateRequest(NULL, (CFStringRef)method, (CFURLRef)url, (CFStringRef)version);
	}
	return self;
}

- (id)initResponseWithStatusCode:(NSInteger)code description:(NSString *)description version:(NSString *)version
{
	if ((self = [super init]))
	{
		message = CFHTTPMessageCreateResponse(NULL, (CFIndex)code, (CFStringRef)description, (CFStringRef)version);
	}
	return self;
}

- (void)dealloc
{
	if (message)
	{
		CFRelease(message);
	}
	[super dealloc];
}

- (BOOL)appendData:(NSData *)data
{
	return CFHTTPMessageAppendBytes(message, [data bytes], [data length]);
}

- (BOOL)isHeaderComplete
{
	return CFHTTPMessageIsHeaderComplete(message);
}

- (NSString *)version
{
	return [NSMakeCollectable(CFHTTPMessageCopyVersion(message)) autorelease];
}

- (NSString *)method
{
	return [NSMakeCollectable(CFHTTPMessageCopyRequestMethod(message)) autorelease];
}

- (NSURL *)url
{
	return [NSMakeCollectable(CFHTTPMessageCopyRequestURL(message)) autorelease];
}

- (NSInteger)statusCode
{
	return (NSInteger)CFHTTPMessageGetResponseStatusCode(message);
}

- (NSDictionary *)allHeaderFields
{
	return [NSMakeCollectable(CFHTTPMessageCopyAllHeaderFields(message)) autorelease];
}

- (NSString *)headerField:(NSString *)headerField
{
	return [NSMakeCollectable(CFHTTPMessageCopyHeaderFieldValue(message, (CFStringRef)headerField)) autorelease];
}

- (void)setHeaderField:(NSString *)headerField value:(NSString *)headerFieldValue
{
	CFHTTPMessageSetHeaderFieldValue(message, (CFStringRef)headerField, (CFStringRef)headerFieldValue);
}

- (NSData *)messageData
{
	return [NSMakeCollectable(CFHTTPMessageCopySerializedMessage(message)) autorelease];
}

- (NSData *)body
{
	return [NSMakeCollectable(CFHTTPMessageCopyBody(message)) autorelease];
}

- (void)setBody:(NSData *)body
{
	CFHTTPMessageSetBody(message, (CFDataRef)body);
}

@end
