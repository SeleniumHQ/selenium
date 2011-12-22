#import "MyWebSocket.h"
#import "HTTPLogging.h"

// Log levels: off, error, warn, info, verbose
// Other flags : trace
static const int httpLogLevel = HTTP_LOG_LEVEL_WARN | HTTP_LOG_FLAG_TRACE;


@implementation MyWebSocket

- (void)didOpen
{
	HTTPLogTrace();
	
	[super didOpen];
}

- (void)didReceiveMessage:(NSString *)msg
{
	HTTPLogTrace2(@"%@[%p]: didReceiveMessage: %@", THIS_FILE, self, msg);
	
	[self sendMessage:[NSString stringWithFormat:@"%@", [NSDate date]]];
}

- (void)didClose
{
	HTTPLogTrace();
	
	[super didClose];
}

@end
