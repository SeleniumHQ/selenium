#import "HTTPDataResponse.h"
#import "HTTPLogging.h"

// Log levels : off, error, warn, info, verbose
// Other flags: trace
static const int httpLogLevel = HTTP_LOG_LEVEL_OFF; // | HTTP_LOG_FLAG_TRACE;


@implementation HTTPDataResponse

- (id)initWithData:(NSData *)dataParam
{
	if((self = [super init]))
	{
		HTTPLogTrace();
		
		offset = 0;
		data = [dataParam retain];
	}
	return self;
}

- (void)dealloc
{
	HTTPLogTrace();
	
	[data release];
	[super dealloc];
}

- (UInt64)contentLength
{
	UInt64 result = (UInt64)[data length];
	
	HTTPLogTrace2(@"%@[%p]: contentLength - %llu", THIS_FILE, self, result);
	
	return result;
}

- (UInt64)offset
{
	HTTPLogTrace();
	
	return offset;
}

- (void)setOffset:(UInt64)offsetParam
{
	HTTPLogTrace2(@"%@[%p]: setOffset:%llu", THIS_FILE, self, offset);
	
	offset = (NSUInteger)offsetParam;
}

- (NSData *)readDataOfLength:(NSUInteger)lengthParameter
{
	HTTPLogTrace2(@"%@[%p]: readDataOfLength:%lu", THIS_FILE, self, (unsigned long)lengthParameter);
	
	NSUInteger remaining = [data length] - offset;
	NSUInteger length = lengthParameter < remaining ? lengthParameter : remaining;
	
	void *bytes = (void *)([data bytes] + offset);
	
	offset += length;
	
	return [NSData dataWithBytesNoCopy:bytes length:length freeWhenDone:NO];
}

- (BOOL)isDone
{
	BOOL result = (offset == [data length]);
	
	HTTPLogTrace2(@"%@[%p]: isDone - %@", THIS_FILE, self, (result ? @"YES" : @"NO"));
	
	return result;
}

@end
