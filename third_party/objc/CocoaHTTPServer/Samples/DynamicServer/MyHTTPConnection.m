#import "MyHTTPConnection.h"
#import "HTTPDynamicFileResponse.h"
#import "HTTPResponseTest.h"
#import "HTTPLogging.h"

// Log levels: off, error, warn, info, verbose
// Other flags: trace
static const int httpLogLevel = HTTP_LOG_LEVEL_WARN; // | HTTP_LOG_FLAG_TRACE;


@implementation MyHTTPConnection

- (NSObject<HTTPResponse> *)httpResponseForMethod:(NSString *)method URI:(NSString *)path
{
	// Use HTTPConnection's filePathForURI method.
	// This method takes the given path (which comes directly from the HTTP request),
	// and converts it to a full path by combining it with the configured document root.
	// 
	// It also does cool things for us like support for converting "/" to "/index.html",
	// and security restrictions (ensuring we don't serve documents outside configured document root folder).
	
	NSString *filePath = [self filePathForURI:path];
	
	// Convert to relative path
	
	NSString *documentRoot = [config documentRoot];
	
	if (![filePath hasPrefix:documentRoot])
	{
		// Uh oh.
		// HTTPConnection's filePathForURI was supposed to take care of this for us.
		return nil;
	}
	
	NSString *relativePath = [filePath substringFromIndex:[documentRoot length]];
	
	if ([relativePath isEqualToString:@"/index.html"])
	{
		HTTPLogVerbose(@"%@[%p]: Serving up dynamic content", THIS_FILE, self);
		
		// The index.html file contains several dynamic fields that need to be completed.
		// For example:
		// 
		// Computer name: %%COMPUTER_NAME%%
		// 
		// We need to replace "%%COMPUTER_NAME%%" with whatever the computer name is.
		// We can accomplish this easily with the HTTPDynamicFileResponse class,
		// which takes a dictionary of replacement key-value pairs,
		// and performs replacements on the fly as it uploads the file.
		
		NSString *computerName = [[NSHost currentHost] localizedName];
		NSString *currentTime = [[NSDate date] description];
		
		NSString *story = @"<br/><br/>"
		                   "I'll tell you a story     <br/>" \
		                   "About Jack a Nory;        <br/>" \
		                   "And now my story's begun; <br/>" \
		                   "I'll tell you another     <br/>" \
		                   "Of Jack and his brother,  <br/>" \
		                   "And now my story is done. <br/>";
		
		NSMutableDictionary *replacementDict = [NSMutableDictionary dictionaryWithCapacity:5];
		
		[replacementDict setObject:computerName forKey:@"COMPUTER_NAME"];
		[replacementDict setObject:currentTime  forKey:@"TIME"];
		[replacementDict setObject:story        forKey:@"STORY"];
		[replacementDict setObject:@"A"         forKey:@"ALPHABET"];
		[replacementDict setObject:@"  QUACK  " forKey:@"QUACK"];
		
		HTTPLogVerbose(@"%@[%p]: replacementDict = \n%@", THIS_FILE, self, replacementDict);
		
		return [[[HTTPDynamicFileResponse alloc] initWithFilePath:[self filePathForURI:path]
		                                            forConnection:self
		                                                separator:@"%%"
		                                    replacementDictionary:replacementDict] autorelease];
	}
	else if ([relativePath isEqualToString:@"/unittest.html"])
	{
		HTTPLogVerbose(@"%@[%p]: Serving up HTTPResponseTest (unit testing)", THIS_FILE, self);
		
		return [[[HTTPResponseTest alloc] initWithConnection:self] autorelease];
	}
	
	return [super httpResponseForMethod:method URI:path];
}

@end
