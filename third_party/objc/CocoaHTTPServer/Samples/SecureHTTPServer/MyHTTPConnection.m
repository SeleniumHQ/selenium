#import "MyHTTPConnection.h"
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
		[DDKeychain createNewIdentity];
		return [DDKeychain SSLIdentityAndCertificates];
	}
	return result;
}

@end
