#import "MyHTTPConnection.h"
#import "HTTPMessage.h"
#import "HTTPResponse.h"
#import "HTTPDynamicFileResponse.h"
#import "GCDAsyncSocket.h"
#import "MyWebSocket.h"
#import "HTTPLogging.h"
#import "DDKeychain.h"

// Log levels: off, error, warn, info, verbose
// Other flags: trace
static const int httpLogLevel = HTTP_LOG_LEVEL_WARN; // | HTTP_LOG_FLAG_TRACE;


@implementation MyHTTPConnection

/**
 * Overrides HTTPConnection's method
**/
- (BOOL)isSecureServer
{
	HTTPLogTrace();
	
	// Create an HTTPS server (all connections will be secured via SSL/TLS)
	return YES;
}

/**
 * Overrides HTTPConnection's method
 * 
 * This method is expected to returns an array appropriate for use in kCFStreamSSLCertificates SSL Settings.
 * It should be an array of SecCertificateRefs except for the first element in the array, which is a SecIdentityRef.
**/
- (NSArray *)sslIdentityAndCertificates
{
	HTTPLogTrace();
	
	NSArray *result = [DDKeychain SSLIdentityAndCertificates];
	if([result count] == 0)
	{
        HTTPLogInfo(@"sslIdentityAndCertificates: Creating New Identity...");
		[DDKeychain createNewIdentity];
		return [DDKeychain SSLIdentityAndCertificates];
	}
	return result;
}

- (NSObject<HTTPResponse> *)httpResponseForMethod:(NSString *)method URI:(NSString *)path
{
	HTTPLogTrace();
	
	if ([path isEqualToString:@"/WebSocketTest2.js"])
	{
		// The socket.js file contains a URL template that needs to be completed:
		// 
		// ws = new WebSocket("%%WEBSOCKET_URL%%");
		// 
		// We need to replace "%%WEBSOCKET_URL%%" with whatever URL the server is running on.
		// We can accomplish this easily with the HTTPDynamicFileResponse class,
		// which takes a dictionary of replacement key-value pairs,
		// and performs replacements on the fly as it uploads the file.
		
		NSString *wsLocation;
		
		NSString *scheme = [asyncSocket isSecure] ? @"wss" : @"ws";
		NSString *wsHost = [request headerField:@"Host"];
		
		if (wsHost == nil)
		{
			NSString *port = [NSString stringWithFormat:@"%hu", [asyncSocket localPort]];
			wsLocation = [NSString stringWithFormat:@"%@://localhost:%@%/service", scheme, port];
		}
		else
		{
			wsLocation = [NSString stringWithFormat:@"%@://%@/service", scheme, wsHost];
		}
		
		NSDictionary *replacementDict = [NSDictionary dictionaryWithObject:wsLocation forKey:@"WEBSOCKET_URL"];
		
		return [[[HTTPDynamicFileResponse alloc] initWithFilePath:[self filePathForURI:path]
		                                            forConnection:self
		                                                separator:@"%%"
		                                    replacementDictionary:replacementDict] autorelease];
	}
	
	return [super httpResponseForMethod:method URI:path];
}

- (WebSocket *)webSocketForURI:(NSString *)path
{
	HTTPLogTrace2(@"%@[%p]: webSocketForURI: %@", THIS_FILE, self, path);
	
	if([path isEqualToString:@"/service"])
	{
		HTTPLogInfo(@"MyHTTPConnection: Creating MyWebSocket...");
		
		return [[[MyWebSocket alloc] initWithRequest:request socket:asyncSocket] autorelease];		
	}
	
	return [super webSocketForURI:path];
}

@end
