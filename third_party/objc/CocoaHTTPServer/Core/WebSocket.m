#import "WebSocket.h"
#import "HTTPMessage.h"
#import "GCDAsyncSocket.h"
#import "DDNumber.h"
#import "DDData.h"
#import "HTTPLogging.h"

// Log levels: off, error, warn, info, verbose
// Other flags : trace
static const int httpLogLevel = HTTP_LOG_LEVEL_WARN; // | HTTP_LOG_FLAG_TRACE;

#define TIMEOUT_NONE          -1
#define TIMEOUT_REQUEST_BODY  10

#define TAG_HTTP_REQUEST_BODY      100
#define TAG_HTTP_RESPONSE_HEADERS  200
#define TAG_HTTP_RESPONSE_BODY     201

#define TAG_PREFIX                 300
#define TAG_MSG_PLUS_SUFFIX        301


@interface WebSocket (PrivateAPI)

- (void)readRequestBody;
- (void)sendResponseBody;
- (void)sendResponseHeaders;

@end

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark -
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

@implementation WebSocket

+ (BOOL)isWebSocketRequest:(HTTPMessage *)request
{
	// Request (Draft 75):
	// 
	// GET /demo HTTP/1.1
	// Upgrade: WebSocket
	// Connection: Upgrade
	// Host: example.com
	// Origin: http://example.com
	// WebSocket-Protocol: sample
	// 
	// 
	// Request (Draft 76):
	//
	// GET /demo HTTP/1.1
	// Upgrade: WebSocket
	// Connection: Upgrade
	// Host: example.com
	// Origin: http://example.com
	// Sec-WebSocket-Protocol: sample
	// Sec-WebSocket-Key1: 4 @1  46546xW%0l 1 5
	// Sec-WebSocket-Key2: 12998 5 Y3 1  .P00
	// 
	// ^n:ds[4U
	
	// Look for Upgrade: and Connection: headers.
	// If we find them, and they have the proper value,
	// we can safely assume this is a websocket request.
	
	NSString *upgradeHeaderValue = [request headerField:@"Upgrade"];
	NSString *connectionHeaderValue = [request headerField:@"Connection"];
	
	BOOL isWebSocket = YES;
	
	if (!upgradeHeaderValue || !connectionHeaderValue) {
		isWebSocket = NO;
	}
	else if (![upgradeHeaderValue caseInsensitiveCompare:@"WebSocket"] == NSOrderedSame) {
		isWebSocket = NO;
	}
	else if (![connectionHeaderValue caseInsensitiveCompare:@"Upgrade"] == NSOrderedSame) {
		isWebSocket = NO;
	}
	
	HTTPLogTrace2(@"%@: %@ - %@", THIS_FILE, THIS_METHOD, (isWebSocket ? @"YES" : @"NO"));
	
	return isWebSocket;
}

+ (BOOL)isVersion76Request:(HTTPMessage *)request
{
	NSString *key1 = [request headerField:@"Sec-WebSocket-Key1"];
	NSString *key2 = [request headerField:@"Sec-WebSocket-Key2"];
	
	BOOL isVersion76;
	
	if (!key1 || !key2) {
		isVersion76 = NO;
	}
	else {
		isVersion76 = YES;
	}
	
	HTTPLogTrace2(@"%@: %@ - %@", THIS_FILE, THIS_METHOD, (isVersion76 ? @"YES" : @"NO"));
	
	return isVersion76;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark Setup and Teardown
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

@synthesize websocketQueue;

- (id)initWithRequest:(HTTPMessage *)aRequest socket:(GCDAsyncSocket *)socket
{
	HTTPLogTrace();
	
	if (aRequest == nil)
	{
		[self release];
		return nil;
	}
	
	if ((self = [super init]))
	{
		if (HTTP_LOG_VERBOSE)
		{
			NSData *requestHeaders = [aRequest messageData];
			
			NSString *temp = [[NSString alloc] initWithData:requestHeaders encoding:NSUTF8StringEncoding];
			HTTPLogVerbose(@"%@[%p] Request Headers:\n%@", THIS_FILE, self, temp);
			[temp release];
		}
		
		websocketQueue = dispatch_queue_create("WebSocket", NULL);
		request = [aRequest retain];
		
		asyncSocket = [socket retain];
		[asyncSocket setDelegate:self delegateQueue:websocketQueue];
		
		isOpen = NO;
		isVersion76 = [[self class] isVersion76Request:request];
		
		term = [[NSData alloc] initWithBytes:"\xFF" length:1];
	}
	return self;
}

- (void)dealloc
{
	HTTPLogTrace();
	
	dispatch_release(websocketQueue);
	
	[request release];
	
	[asyncSocket setDelegate:nil delegateQueue:NULL];
	[asyncSocket disconnect];
	[asyncSocket release];
	
	[super dealloc];
}

- (id)delegate
{
	__block id result = nil;
	
	dispatch_sync(websocketQueue, ^{
		result = delegate;
	});
	
	return result;
}

- (void)setDelegate:(id)newDelegate
{
	dispatch_async(websocketQueue, ^{
		delegate = newDelegate;
	});
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark Start and Stop
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Starting point for the WebSocket after it has been fully initialized (including subclasses).
 * This method is called by the HTTPConnection it is spawned from.
**/
- (void)start
{
	// This method is not exactly designed to be overriden.
	// Subclasses are encouraged to override the didOpen method instead.
	
	dispatch_async(websocketQueue, ^{
		NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
		
		if (isStarted) return;
		isStarted = YES;
		
		if (isVersion76)
		{
			[self readRequestBody];
		}
		else
		{
			[self sendResponseHeaders];
			[self didOpen];
		}
		
		[pool drain];
	});
}

/**
 * This method is called by the HTTPServer if it is asked to stop.
 * The server, in turn, invokes stop on each WebSocket instance.
**/
- (void)stop
{
	// This method is not exactly designed to be overriden.
	// Subclasses are encouraged to override the didClose method instead.
	
	dispatch_async(websocketQueue, ^{
		NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
		
		[asyncSocket disconnect];
		
		[pool drain];
	});
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark HTTP Response
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

- (void)readRequestBody
{
	HTTPLogTrace();
	
	NSAssert(isVersion76, @"WebSocket version 75 doesn't contain a request body");
	
	[asyncSocket readDataToLength:8 withTimeout:TIMEOUT_NONE tag:TAG_HTTP_REQUEST_BODY];
}

- (NSString *)originResponseHeaderValue
{
	HTTPLogTrace();
	
	NSString *origin = [request headerField:@"Origin"];
	
	if (origin == nil)
	{
		NSString *port = [NSString stringWithFormat:@"%hu", [asyncSocket localPort]];
		
		return [NSString stringWithFormat:@"http://localhost:%@", port];
	}
	else
	{
		return origin;
	}
}

- (NSString *)locationResponseHeaderValue
{
	HTTPLogTrace();
	
	NSString *location;
	
	NSString *scheme = [asyncSocket isSecure] ? @"wss" : @"ws";
	NSString *host = [request headerField:@"Host"];
	
	NSString *requestUri = [[request url] relativeString];
	
	if (host == nil)
	{
		NSString *port = [NSString stringWithFormat:@"%hu", [asyncSocket localPort]];
		
		location = [NSString stringWithFormat:@"%@://localhost:%@%@", scheme, port, requestUri];
	}
	else
	{
		location = [NSString stringWithFormat:@"%@://%@%@", scheme, host, requestUri];
	}
	
	return location;
}

- (void)sendResponseHeaders
{
	HTTPLogTrace();
	
	// Request (Draft 75):
	// 
	// GET /demo HTTP/1.1
	// Upgrade: WebSocket
	// Connection: Upgrade
	// Host: example.com
	// Origin: http://example.com
	// WebSocket-Protocol: sample
	// 
	// 
	// Request (Draft 76):
	//
	// GET /demo HTTP/1.1
	// Upgrade: WebSocket
	// Connection: Upgrade
	// Host: example.com
	// Origin: http://example.com
	// Sec-WebSocket-Protocol: sample
	// Sec-WebSocket-Key2: 12998 5 Y3 1  .P00
	// Sec-WebSocket-Key1: 4 @1  46546xW%0l 1 5
	// 
	// ^n:ds[4U

	
	// Response (Draft 75):
	// 
	// HTTP/1.1 101 Web Socket Protocol Handshake
	// Upgrade: WebSocket
	// Connection: Upgrade
	// WebSocket-Origin: http://example.com
	// WebSocket-Location: ws://example.com/demo
	// WebSocket-Protocol: sample
	// 
	// 
	// Response (Draft 76):
	//
	// HTTP/1.1 101 WebSocket Protocol Handshake
	// Upgrade: WebSocket
	// Connection: Upgrade
	// Sec-WebSocket-Origin: http://example.com
	// Sec-WebSocket-Location: ws://example.com/demo
	// Sec-WebSocket-Protocol: sample
	// 
	// 8jKS'y:G*Co,Wxa-

	
	HTTPMessage *wsResponse = [[HTTPMessage alloc] initResponseWithStatusCode:101
	                                                              description:@"Web Socket Protocol Handshake"
	                                                                  version:HTTPVersion1_1];
	
	[wsResponse setHeaderField:@"Upgrade" value:@"WebSocket"];
	[wsResponse setHeaderField:@"Connection" value:@"Upgrade"];
	
	// Note: It appears that WebSocket-Origin and WebSocket-Location
	// are required for Google's Chrome implementation to work properly.
	// 
	// If we don't send either header, Chrome will never report the WebSocket as open.
	// If we only send one of the two, Chrome will immediately close the WebSocket.
	// 
	// In addition to this it appears that Chrome's implementation is very picky of the values of the headers.
	// They have to match exactly with what Chrome sent us or it will close the WebSocket.
	
	NSString *originValue = [self originResponseHeaderValue];
	NSString *locationValue = [self locationResponseHeaderValue];
	
	NSString *originField = isVersion76 ? @"Sec-WebSocket-Origin" : @"WebSocket-Origin";
	NSString *locationField = isVersion76 ? @"Sec-WebSocket-Location" : @"WebSocket-Location";
	
	[wsResponse setHeaderField:originField value:originValue];
	[wsResponse setHeaderField:locationField value:locationValue];
	
	NSData *responseHeaders = [wsResponse messageData];
	
	[wsResponse release];
	
	if (HTTP_LOG_VERBOSE)
	{
		NSString *temp = [[NSString alloc] initWithData:responseHeaders encoding:NSUTF8StringEncoding];
		HTTPLogVerbose(@"%@[%p] Response Headers:\n%@", THIS_FILE, self, temp);
		[temp release];
	}
	
	[asyncSocket writeData:responseHeaders withTimeout:TIMEOUT_NONE tag:TAG_HTTP_RESPONSE_HEADERS];
}

- (NSData *)processKey:(NSString *)key
{
	HTTPLogTrace();
	
	unichar c;
	NSUInteger i;
	NSUInteger length = [key length];
	
	// Concatenate the digits into a string,
	// and count the number of spaces.
	
	NSMutableString *numStr = [NSMutableString stringWithCapacity:10];
	long long numSpaces = 0;
	
	for (i = 0; i < length; i++)
	{
		c = [key characterAtIndex:i];
		
		if (c >= '0' && c <= '9')
		{
			[numStr appendFormat:@"%C", c];
		}
		else if (c == ' ')
		{
			numSpaces++;
		}
	}
	
	long long num = strtoll([numStr UTF8String], NULL, 10);
	
	long long resultHostNum;
	
	if (numSpaces == 0)
		resultHostNum = 0;
	else
		resultHostNum = num / numSpaces;
	
	HTTPLogVerbose(@"key(%@) -> %qi / %qi = %qi", key, num, numSpaces, resultHostNum);
	
	// Convert result to 4 byte big-endian (network byte order)
	// and then convert to raw data.
	
	UInt32 result = OSSwapHostToBigInt32((uint32_t)resultHostNum);
	
	return [NSData dataWithBytes:&result length:4];
}

- (void)sendResponseBody:(NSData *)d3
{
	HTTPLogTrace();
	
	NSAssert(isVersion76, @"WebSocket version 75 doesn't contain a response body");
	NSAssert([d3 length] == 8, @"Invalid requestBody length");
	
	NSString *key1 = [request headerField:@"Sec-WebSocket-Key1"];
	NSString *key2 = [request headerField:@"Sec-WebSocket-Key2"];
	
	NSData *d1 = [self processKey:key1];
	NSData *d2 = [self processKey:key2];
	
	// Concatenated d1, d2 & d3
	
	NSMutableData *d0 = [NSMutableData dataWithCapacity:(4+4+8)];
	[d0 appendData:d1];
	[d0 appendData:d2];
	[d0 appendData:d3];
	
	// Hash the data using MD5
	
	NSData *responseBody = [d0 md5Digest];
	
	[asyncSocket writeData:responseBody withTimeout:TIMEOUT_NONE tag:TAG_HTTP_RESPONSE_BODY];
	
	if (HTTP_LOG_VERBOSE)
	{
		NSString *s1 = [[NSString alloc] initWithData:d1 encoding:NSASCIIStringEncoding];
		NSString *s2 = [[NSString alloc] initWithData:d2 encoding:NSASCIIStringEncoding];
		NSString *s3 = [[NSString alloc] initWithData:d3 encoding:NSASCIIStringEncoding];
		
		NSString *s0 = [[NSString alloc] initWithData:d0 encoding:NSASCIIStringEncoding];
		
		NSString *sH = [[NSString alloc] initWithData:responseBody encoding:NSASCIIStringEncoding];
		
		HTTPLogVerbose(@"key1 result : raw(%@) str(%@)", d1, s1);
		HTTPLogVerbose(@"key2 result : raw(%@) str(%@)", d2, s2);
		HTTPLogVerbose(@"key3 passed : raw(%@) str(%@)", d3, s3);
		HTTPLogVerbose(@"key0 concat : raw(%@) str(%@)", d0, s0);
		HTTPLogVerbose(@"responseBody: raw(%@) str(%@)", responseBody, sH);
		
		[s1 release];
		[s2 release];
		[s3 release];
		[s0 release];
		[sH release];
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark Core Functionality
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

- (void)didOpen
{
	HTTPLogTrace();
	
	// Override me to perform any custom actions once the WebSocket has been opened.
	// This method is invoked on the websocketQueue.
	// 
	// Don't forget to invoke [super didOpen] in your method.
	
	// Start reading for messages
	[asyncSocket readDataToLength:1 withTimeout:TIMEOUT_NONE tag:TAG_PREFIX];
	
	// Notify delegate
	if ([delegate respondsToSelector:@selector(webSocketDidOpen:)])
	{
		[delegate webSocketDidOpen:self];
	}
}

- (void)sendMessage:(NSString *)msg
{
	HTTPLogTrace();
	
	NSData *msgData = [msg dataUsingEncoding:NSUTF8StringEncoding];
	
	NSMutableData *data = [NSMutableData dataWithCapacity:([msgData length] + 2)];
	
	[data appendBytes:"\x00" length:1];
	[data appendData:msgData];
	[data appendBytes:"\xFF" length:1];
	
	// Remember: GCDAsyncSocket is thread-safe
	
	[asyncSocket writeData:data withTimeout:TIMEOUT_NONE tag:0];
}

- (void)didReceiveMessage:(NSString *)msg
{
	HTTPLogTrace();
	
	// Override me to process incoming messages.
	// This method is invoked on the websocketQueue.
	// 
	// For completeness, you should invoke [super didReceiveMessage:msg] in your method.
	
	// Notify delegate
	if ([delegate respondsToSelector:@selector(webSocket:didReceiveMessage:)])
	{
		[delegate webSocket:self didReceiveMessage:msg];
	}
}

- (void)didClose
{
	HTTPLogTrace();
	
	// Override me to perform any cleanup when the socket is closed
	// This method is invoked on the websocketQueue.
	// 
	// Don't forget to invoke [super didClose] at the end of your method.
	
	// Notify delegate
	if ([delegate respondsToSelector:@selector(webSocketDidClose:)])
	{
		[delegate webSocketDidClose:self];
	}
	
	// Notify HTTPServer
	[[NSNotificationCenter defaultCenter] postNotificationName:WebSocketDidDieNotification object:self];
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark AsyncSocket Delegate
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

- (void)socket:(GCDAsyncSocket *)sock didReadData:(NSData *)data withTag:(long)tag
{
	HTTPLogTrace();
	
	if (tag == TAG_HTTP_REQUEST_BODY)
	{
		[self sendResponseHeaders];
		[self sendResponseBody:data];
		[self didOpen];
	}
	else if (tag == TAG_PREFIX)
	{
		UInt8 *pFrame = (UInt8 *)[data bytes];
		UInt8 frame = *pFrame;
		
		if (frame <= 0x7F)
		{
			[asyncSocket readDataToData:term withTimeout:TIMEOUT_NONE tag:TAG_MSG_PLUS_SUFFIX];
		}
		else
		{
			// Unsupported frame type
			[self didClose];
		}
	}
	else
	{
		NSUInteger msgLength = [data length] - 1; // Excluding ending 0xFF frame
		
		NSString *msg = [[NSString alloc] initWithBytes:[data bytes] length:msgLength encoding:NSUTF8StringEncoding];
		
		[self didReceiveMessage:msg];
		
		[msg release];
		
		// Read next message
		[asyncSocket readDataToLength:1 withTimeout:TIMEOUT_NONE tag:TAG_PREFIX];
	}
}

- (void)socketDidDisconnect:(GCDAsyncSocket *)sock withError:(NSError *)error
{
	HTTPLogTrace2(@"%@[%p]: socketDidDisconnect:withError: %@", THIS_FILE, self, error);
	
	[self didClose];
}

@end
