#import "DDASLLogger.h"

#import <libkern/OSAtomic.h>


@implementation DDASLLogger

static DDASLLogger *sharedInstance;

/**
 * The runtime sends initialize to each class in a program exactly one time just before the class,
 * or any class that inherits from it, is sent its first message from within the program. (Thus the
 * method may never be invoked if the class is not used.) The runtime sends the initialize message to
 * classes in a thread-safe manner. Superclasses receive this message before their subclasses.
 *
 * This method may also be called directly (assumably by accident), hence the safety mechanism.
**/
+ (void)initialize
{
	static BOOL initialized = NO;
	if (!initialized)
	{
		initialized = YES;
		
		sharedInstance = [[DDASLLogger alloc] init];
	}
}

+ (DDASLLogger *)sharedInstance
{
	return sharedInstance;
}

- (id)init
{
	if (sharedInstance != nil)
	{
		[self release];
		return nil;
	}
	
	if ((self = [super init]))
	{
		// A default asl client is provided for the main thread,
		// but background threads need to create their own client.
		
		client = asl_open(NULL, "com.apple.console", 0);
	}
	return self;
}

- (void)logMessage:(DDLogMessage *)logMessage
{
	NSString *logMsg = logMessage->logMsg;
	
	if (formatter)
	{
		logMsg = [formatter formatLogMessage:logMessage];
	}
	
	if (logMsg)
	{
		const char *msg = [logMsg UTF8String];
		
		int aslLogLevel;
		switch (logMessage->logLevel)
		{
			// Note: By default ASL will filter anything above level 5 (Notice).
			// So our mappings shouldn't go above that level.
			
			case 1  : aslLogLevel = ASL_LEVEL_CRIT;    break;
			case 2  : aslLogLevel = ASL_LEVEL_ERR;     break;
			case 3  : aslLogLevel = ASL_LEVEL_WARNING; break;
			default : aslLogLevel = ASL_LEVEL_NOTICE;  break;
		}
		
		asl_log(client, NULL, aslLogLevel, "%s", msg);
	}
}

- (NSString *)loggerName
{
	return @"cocoa.lumberjack.aslLogger";
}

@end
