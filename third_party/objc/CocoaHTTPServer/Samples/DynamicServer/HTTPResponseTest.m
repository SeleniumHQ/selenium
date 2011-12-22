#import "HTTPResponseTest.h"
#import "HTTPConnection.h"
#import "HTTPLogging.h"

// Log levels: off, error, warn, info, verbose
// Other flags: trace
static const int httpLogLevel = HTTP_LOG_LEVEL_OFF; // | HTTP_LOG_FLAG_TRACE;

// 
// This class is a UnitTest for the delayResponeHeaders capability of HTTPConnection
// 

@interface HTTPResponseTest (PrivateAPI)
- (void)doAsyncStuff;
- (void)asyncStuffFinished;
@end


@implementation HTTPResponseTest

- (id)initWithConnection:(HTTPConnection *)parent
{
	if ((self = [super init]))
	{
		HTTPLogTrace();
		
		connection = parent; // Parents retain children, children do NOT retain parents
		
		connectionQueue = dispatch_get_current_queue();
		dispatch_retain(connectionQueue);
		
		readyToSendResponseHeaders = NO;
		
		dispatch_queue_t concurrentQueue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_LOW, 0);
		dispatch_async(concurrentQueue, ^{
			NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
			[self doAsyncStuff];
			[pool release];
		});
	}
	return self;
}

- (void)doAsyncStuff
{
	// This method is executed on a global concurrent queue
	
	HTTPLogTrace();
	
	[NSThread sleepForTimeInterval:5.0];
	
	dispatch_async(connectionQueue, ^{
		NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
		[self asyncStuffFinished];
		[pool release];
	});
}

- (void)asyncStuffFinished
{
	// This method is executed on the connectionQueue
	
	HTTPLogTrace();
	
	readyToSendResponseHeaders = YES;
	[connection responseHasAvailableData:self];
}

- (BOOL)delayResponeHeaders
{
	HTTPLogTrace2(@"%@[%p] %@ -> %@", THIS_FILE, self, THIS_METHOD, (readyToSendResponseHeaders ? @"NO" : @"YES"));
	
	return !readyToSendResponseHeaders;
}

- (void)connectionDidClose
{
	// This method is executed on the connectionQueue
	
	HTTPLogTrace();
	
	connection = nil;
}

- (UInt64)contentLength
{
	HTTPLogTrace();
	
	return 0;
}

- (UInt64)offset
{
	HTTPLogTrace();
	
	return 0;
}

- (void)setOffset:(UInt64)offset
{
	HTTPLogTrace();
	
	// Ignored
}

- (NSData *)readDataOfLength:(NSUInteger)length
{
	HTTPLogTrace();
	
	return nil;
}

- (BOOL)isDone
{
	HTTPLogTrace();
	
	return YES;
}

- (void)dealloc
{
	HTTPLogTrace();
	
	dispatch_release(connectionQueue);
	[super dealloc];
}

@end
