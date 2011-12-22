#import <Foundation/Foundation.h>
#import "HTTPResponse.h"
#import "HTTPAsyncFileResponse.h"

/**
 * This class is designed to assist with dynamic content.
 * Imagine you have a file that you want to make dynamic:
 * 
 * <html>
 * <body>
 *   <h1>ComputerName Control Panel</h1>
 *   ...
 *   <li>System Time: SysTime</li>
 * </body>
 * </html>
 * 
 * Now you could generate the entire file in Objective-C,
 * but this would be a horribly tedious process.
 * Beside, you want to design the file with professional tools to make it look pretty.
 * 
 * So all you have to do is escape your dynamic content like this:
 * 
 * ...
 *   <h1>%%ComputerName%% Control Panel</h1>
 * ...
 *   <li>System Time: %%SysTime%%</li>
 * 
 * And then you create an instance of this class with:
 * 
 * - separator = @"%%"
 * - replacementDictionary = { "ComputerName"="Black MacBook", "SysTime"="2010-04-30 03:18:24" }
 * 
 * This class will then perform the replacements for you, on the fly, as it reads the file data.
 * This class is also asynchronous, so it will perform the file IO using its own GCD queue.
 * 
 * All keys for the replacementDictionary must be NSString's.
 * Values for the replacementDictionary may be NSString's, or any object that
 * returns what you want when its description method is invoked.
**/

@interface HTTPDynamicFileResponse : HTTPAsyncFileResponse
{
	NSData *separator;
	NSDictionary *replacementDict;
}

- (id)initWithFilePath:(NSString *)filePath
         forConnection:(HTTPConnection *)connection
             separator:(NSString *)separatorStr
 replacementDictionary:(NSDictionary *)dictionary;

@end
