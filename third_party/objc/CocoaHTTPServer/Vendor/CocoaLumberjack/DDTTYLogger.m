#import "DDTTYLogger.h"

#import <unistd.h>
#import <sys/uio.h>


@implementation DDTTYLogger

static DDTTYLogger *sharedInstance;

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
		
		sharedInstance = [[DDTTYLogger alloc] init];
	}
}

+ (DDTTYLogger *)sharedInstance
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
		isaTTY = isatty(STDERR_FILENO);
		
		if (isaTTY)
		{
			dateFormatter = [[NSDateFormatter alloc] init];
			[dateFormatter setFormatterBehavior:NSDateFormatterBehavior10_4];
			[dateFormatter setDateFormat:@"yyyy-MM-dd HH:mm:ss:SSS"];
			
			// Initialze 'app' variable (char *)
			
			NSString *appNStr = [[NSProcessInfo processInfo] processName];
			const char *appCStr = [appNStr UTF8String];
			
			appLen = strlen(appCStr);
			
			app = (char *)malloc(appLen);
			strncpy(app, appCStr, appLen); // Not null terminated
			
			// Initialize 'pid' variable (char *)
			
			NSString *pidNStr = [NSString stringWithFormat:@"%i", (int)getpid()];
			const char *pidCStr = [pidNStr UTF8String];
			
			pidLen = strlen(pidCStr);
			
			pid = (char *)malloc(pidLen);
			strncpy(pid, pidCStr, pidLen); // Not null terminated
		}
	}
	return self;
}

- (void)logMessage:(DDLogMessage *)logMessage
{
	if (!isaTTY) return;
	
	NSString *logMsg = logMessage->logMsg;
	BOOL isFormatted = NO;
	
	if (formatter)
	{
		logMsg = [formatter formatLogMessage:logMessage];
		isFormatted = logMsg != logMessage->logMsg;
	}
	
	if (logMsg)
	{
		const char *msg = [logMsg UTF8String];
		size_t msgLen = strlen(msg);
		
		if (isFormatted)
		{
			struct iovec v[2];
			
			v[0].iov_base = (char *)msg;
			v[0].iov_len = msgLen;
			
			v[1].iov_base = "\n";
			v[1].iov_len = (msg[msgLen] == '\n') ? 0 : 1;
			
			writev(STDERR_FILENO, v, 2);
		}
		else
		{
			// The following is a highly optimized verion of file output to std err.
			
			// ts = timestamp
			
			NSString *tsNStr = [dateFormatter stringFromDate:(logMessage->timestamp)];
			
			const char *tsCStr = [tsNStr UTF8String];
			size_t tsLen = strlen(tsCStr);
			
			// tid = thread id
			// 
			// How many characters do we need for the thread id?
			// logMessage->machThreadID is of type mach_port_t, which is an unsigned int.
			// 
			// 1 hex char = 4 bits
			// 8 hex chars for 32 bit, plus ending '\0' = 9
			
			char tidCStr[9];
			int tidLen = snprintf(tidCStr, 9, "%x", logMessage->machThreadID);
			
			// Here is our format: "%s %s[%i:%s] %s", timestamp, appName, processID, threadID, logMsg
			
			struct iovec v[10];
			
			v[0].iov_base = (char *)tsCStr;
			v[0].iov_len = tsLen;
			
			v[1].iov_base = " ";
			v[1].iov_len = 1;
			
			v[2].iov_base = app;
			v[2].iov_len = appLen;
			
			v[3].iov_base = "[";
			v[3].iov_len = 1;
			
			v[4].iov_base = pid;
			v[4].iov_len = pidLen;
			
			v[5].iov_base = ":";
			v[5].iov_len = 1;
			
			v[6].iov_base = tidCStr;
			v[6].iov_len = MIN((size_t)8, tidLen); // snprintf doesn't return what you might think
			
			v[7].iov_base = "] ";
			v[7].iov_len = 2;
			
			v[8].iov_base = (char *)msg;
			v[8].iov_len = msgLen;
			
			v[9].iov_base = "\n";
			v[9].iov_len = (msg[msgLen] == '\n') ? 0 : 1;
			
			writev(STDERR_FILENO, v, 10);
		}
	}
}

- (NSString *)loggerName
{
	return @"cocoa.lumberjack.ttyLogger";
}

@end
