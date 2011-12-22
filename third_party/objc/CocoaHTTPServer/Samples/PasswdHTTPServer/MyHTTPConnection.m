#import "MyHTTPConnection.h"
#import "HTTPLogging.h"

// Log levels : off, error, warn, info, verbose
// Other flags: trace
static const int httpLogLevel = HTTP_LOG_LEVEL_VERBOSE | HTTP_LOG_FLAG_TRACE;


@implementation MyHTTPConnection

- (BOOL)isPasswordProtected:(NSString *)path
{
	// We're only going to password protect the "secret" directory.
	
	BOOL result = [path hasPrefix:@"/secret"];
	
	HTTPLogTrace2(@"%@[%p]: isPasswordProtected(%@) - %@", THIS_FILE, self, path, (result ? @"YES" : @"NO"));
	
	return result;
}

- (BOOL)useDigestAccessAuthentication
{
	HTTPLogTrace();
	
	// Digest access authentication is the default setting.
	// Notice in Safari that when you're prompted for your password,
	// Safari tells you "Your login information will be sent securely."
	// 
	// If you return NO in this method, the HTTP server will use
	// basic authentication. Try it and you'll see that Safari
	// will tell you "Your password will be sent unencrypted",
	// which is strongly discouraged.
	
	return YES;
}

- (NSString *)passwordForUser:(NSString *)username
{
	HTTPLogTrace();
	
	// You can do all kinds of cool stuff here.
	// For simplicity, we're not going to check the username, only the password.
	
	return @"secret";
}

@end
