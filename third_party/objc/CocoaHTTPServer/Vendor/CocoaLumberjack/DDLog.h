#import <Foundation/Foundation.h>

/**
 * Welcome to Cocoa Lumberjack!
 * 
 * The Google Code page has a wealth of documentation if you have any questions.
 * http://code.google.com/p/cocoalumberjack/
 * 
 * If you're new to the project you may wish to read the "Getting Started" page.
 * http://code.google.com/p/cocoalumberjack/wiki/GettingStarted
 * 
 * Otherwise, here is a quick refresher.
 * There are three steps to using the macros:
 * 
 * Step 1:
 * Import the header in your implementation file:
 * 
 * #import "DDLog.h"
 * 
 * Step 2:
 * Define your logging level in your implementation file:
 * 
 * // Log levels: off, error, warn, info, verbose
 * static const int ddLogLevel = LOG_LEVEL_VERBOSE;
 * 
 * Step 3:
 * Replace your NSLog statements with DDLog statements according to the severity of the message.
 * 
 * NSLog(@"Fatal error, no dohickey found!"); -> DDLogError(@"Fatal error, no dohickey found!");
 * 
 * DDLog works exactly the same as NSLog.
 * This means you can pass it multiple variables just like NSLog.
**/


// Can we use Grand Central Dispatch?
// 
// This question is actually composed of two parts:
// 1. Is it available to the compiler?
// 2. Is it available to the runtime?
// 
// For example, if we are building a universal iPad/iPhone app,
// our base SDK may be iOS 4, but our deployment target would be iOS 3.2.
// In this case we can compile against the GCD libraries (which are available starting with iOS 4),
// but we can only use them at runtime if running on iOS 4 or later.
// If running on an iPad using iOS 3.2, we need to use runtime checks for backwards compatibility.
// 
// The solution is to use a combination of compile-time and run-time macros.
// 
// Note that when the minimum supported SDK supports GCD
// the run-time checks will be compiled out during optimization.

#if TARGET_OS_IPHONE

  // Compiling for iPod/iPhone/iPad

  #if __IPHONE_OS_VERSION_MAX_ALLOWED >= 40000 // 4.0 supported
  
    #if __IPHONE_OS_VERSION_MIN_REQUIRED >= 40000 // 4.0 supported and required

      #define IS_GCD_AVAILABLE      YES
      #define GCD_MAYBE_AVAILABLE   1
      #define GCD_MAYBE_UNAVAILABLE 0

    #else                                         // 4.0 supported but not required

      #ifndef NSFoundationVersionNumber_iPhoneOS_4_0
        #define NSFoundationVersionNumber_iPhoneOS_4_0 751.32
      #endif

      #define IS_GCD_AVAILABLE     (NSFoundationVersionNumber >= NSFoundationVersionNumber_iPhoneOS_4_0)
      #define GCD_MAYBE_AVAILABLE   1
      #define GCD_MAYBE_UNAVAILABLE 1

    #endif

  #else                                        // 4.0 not supported

    #define IS_GCD_AVAILABLE      NO
    #define GCD_MAYBE_AVAILABLE   0
    #define GCD_MAYBE_UNAVAILABLE 1

  #endif

#else

  // Compiling for Mac OS X

  #if MAC_OS_X_VERSION_MAX_ALLOWED >= 1060 // 10.6 supported
  
    #if MAC_OS_X_VERSION_MIN_REQUIRED >= 1060 // 10.6 supported and required

      #define IS_GCD_AVAILABLE      YES
      #define GCD_MAYBE_AVAILABLE   1
      #define GCD_MAYBE_UNAVAILABLE 0

    #else                                     // 10.6 supported but not required

      #ifndef NSFoundationVersionNumber10_6
        #define NSFoundationVersionNumber10_6 751.00
      #endif

      #define IS_GCD_AVAILABLE     (NSFoundationVersionNumber >= NSFoundationVersionNumber10_6)
      #define GCD_MAYBE_AVAILABLE   1
      #define GCD_MAYBE_UNAVAILABLE 1

    #endif
  
  #else                                    // 10.6 not supported

    #define IS_GCD_AVAILABLE      NO
    #define GCD_MAYBE_AVAILABLE   0
    #define GCD_MAYBE_UNAVAILABLE 1

  #endif

#endif

/*
// Uncomment for quick temporary test to see if it builds for older OS targets
#undef IS_GCD_AVAILABLE
#undef GCD_MAYBE_AVAILABLE
#undef GCD_MAYBE_UNAVAILABLE

#define IS_GCD_AVAILABLE      NO
#define GCD_MAYBE_AVAILABLE   0
#define GCD_MAYBE_UNAVAILABLE 1
*/

@class DDLogMessage;

@protocol DDLogger;
@protocol DDLogFormatter;

/**
 * Define our big multiline macros so all the other macros will be easy to read.
**/

#define LOG_MACRO(isAsynchronous, lvl, flg, ctx, fnct, frmt, ...) \
  [DDLog log:isAsynchronous                                       \
       level:lvl                                                  \
        flag:flg                                                  \
     context:ctx                                                  \
        file:__FILE__                                             \
    function:fnct                                                 \
        line:__LINE__                                             \
      format:(frmt), ##__VA_ARGS__]


#define LOG_OBJC_MACRO(async, lvl, flg, ctx, frmt, ...) \
             LOG_MACRO(async, lvl, flg, ctx, sel_getName(_cmd), frmt, ##__VA_ARGS__)

#define LOG_C_MACRO(async, lvl, flg, ctx, frmt, ...) \
          LOG_MACRO(async, lvl, flg, ctx, __FUNCTION__, frmt, ##__VA_ARGS__)

#define  SYNC_LOG_OBJC_MACRO(lvl, flg, ctx, frmt, ...) \
              LOG_OBJC_MACRO( NO, lvl, flg, ctx, frmt, ##__VA_ARGS__)

#define ASYNC_LOG_OBJC_MACRO(lvl, flg, ctx, frmt, ...) \
              LOG_OBJC_MACRO(YES, lvl, flg, ctx, frmt, ##__VA_ARGS__)

#define  SYNC_LOG_C_MACRO(lvl, flg, ctx, frmt, ...) \
              LOG_C_MACRO( NO, lvl, flg, ctx, frmt, ##__VA_ARGS__)

#define ASYNC_LOG_C_MACRO(lvl, flg, ctx, frmt, ...) \
              LOG_C_MACRO(YES, lvl, flg, ctx, frmt, ##__VA_ARGS__)


#define LOG_MAYBE(async, lvl, flg, ctx, fnct, frmt, ...) \
  do { if(lvl & flg) LOG_MACRO(async, lvl, flg, ctx, fnct, frmt, ##__VA_ARGS__); } while(0)

#define LOG_OBJC_MAYBE(async, lvl, flg, ctx, frmt, ...) \
             LOG_MAYBE(async, lvl, flg, ctx, sel_getName(_cmd), frmt, ##__VA_ARGS__)

#define LOG_C_MAYBE(async, lvl, flg, ctx, frmt, ...) \
          LOG_MAYBE(async, lvl, flg, ctx, __FUNCTION__, frmt, ##__VA_ARGS__)

#define  SYNC_LOG_OBJC_MAYBE(lvl, flg, ctx, frmt, ...) \
              LOG_OBJC_MAYBE( NO, lvl, flg, ctx, frmt, ##__VA_ARGS__)

#define ASYNC_LOG_OBJC_MAYBE(lvl, flg, ctx, frmt, ...) \
              LOG_OBJC_MAYBE(YES, lvl, flg, ctx, frmt, ##__VA_ARGS__)

#define  SYNC_LOG_C_MAYBE(lvl, flg, ctx, frmt, ...) \
              LOG_C_MAYBE( NO, lvl, flg, ctx, frmt, ##__VA_ARGS__)

#define ASYNC_LOG_C_MAYBE(lvl, flg, ctx, frmt, ...) \
              LOG_C_MAYBE(YES, lvl, flg, ctx, frmt, ##__VA_ARGS__)

/**
 * Define the standard options.
 * 
 * We default to only 4 levels because it makes it easier for beginners
 * to make the transition to a logging framework.
 * 
 * More advanced users may choose to completely customize the levels (and level names) to suite their needs.
 * For more information on this see the "Custom Log Levels" page:
 * http://code.google.com/p/cocoalumberjack/wiki/CustomLogLevels
 * 
 * Advanced users may also notice that we're using a bitmask.
 * This is to allow for custom fine grained logging:
 * http://code.google.com/p/cocoalumberjack/wiki/FineGrainedLogging
 * 
 * -- Flags --
 * 
 * Typically you will use the LOG_LEVELS (see below), but the flags may be used directly in certain situations.
 * For example, say you have a lot of warning log messages, and you wanted to disable them.
 * However, you still needed to see your error and info log messages.
 * You could accomplish that with the following:
 * 
 * static const int ddLogLevel = LOG_FLAG_ERROR | LOG_FLAG_INFO;
 * 
 * Flags may also be consulted when writing custom log formatters,
 * as the DDLogMessage class captures the individual flag that caused the log message to fire.
 * 
 * -- Levels --
 * 
 * Log levels are simply the proper bitmask of the flags.
 * 
 * -- Booleans --
 * 
 * The booleans may be used when your logging code involves more than one line.
 * For example:
 * 
 * if (LOG_VERBOSE) {
 *     for (id sprocket in sprockets)
 *         DDLogVerbose(@"sprocket: %@", [sprocket description])
 * }
 * 
 * -- Async --
 * 
 * Defines the default asynchronous options.
 * The default philosophy for asynchronous logging is very simple:
 * 
 * Log messages with errors should be executed synchronously.
 *     After all, an error just occurred. The application could be unstable.
 * 
 * All other log messages, such as debug output, are executed asynchronously.
 *     After all, if it wasn't an error, then it was just informational output,
 *     or something the application was easily able to recover from.
 * 
 * -- Changes --
 * 
 * You are strongly discouraged from modifying this file.
 * If you do, you make it more difficult on yourself to merge future bug fixes and improvements from the project.
 * Instead, create your own MyLogging.h or ApplicationNameLogging.h or CompanyLogging.h
 * 
 * For an example of customizing your logging experience, see the "Custom Log Levels" page:
 * http://code.google.com/p/cocoalumberjack/wiki/CustomLogLevels
**/

#define LOG_FLAG_ERROR    (1 << 0)  // 0...0001
#define LOG_FLAG_WARN     (1 << 1)  // 0...0010
#define LOG_FLAG_INFO     (1 << 2)  // 0...0100
#define LOG_FLAG_VERBOSE  (1 << 3)  // 0...1000

#define LOG_LEVEL_OFF     0
#define LOG_LEVEL_ERROR   (LOG_FLAG_ERROR)                                                    // 0...0001
#define LOG_LEVEL_WARN    (LOG_FLAG_ERROR | LOG_FLAG_WARN)                                    // 0...0011
#define LOG_LEVEL_INFO    (LOG_FLAG_ERROR | LOG_FLAG_WARN | LOG_FLAG_INFO)                    // 0...0111
#define LOG_LEVEL_VERBOSE (LOG_FLAG_ERROR | LOG_FLAG_WARN | LOG_FLAG_INFO | LOG_FLAG_VERBOSE) // 0...1111

#define LOG_ERROR   (ddLogLevel & LOG_FLAG_ERROR)
#define LOG_WARN    (ddLogLevel & LOG_FLAG_WARN)
#define LOG_INFO    (ddLogLevel & LOG_FLAG_INFO)
#define LOG_VERBOSE (ddLogLevel & LOG_FLAG_VERBOSE)

#define LOG_ASYNC_ENABLED YES

#define LOG_ASYNC_ERROR   ( NO && LOG_ASYNC_ENABLED)
#define LOG_ASYNC_WARN    (YES && LOG_ASYNC_ENABLED)
#define LOG_ASYNC_INFO    (YES && LOG_ASYNC_ENABLED)
#define LOG_ASYNC_VERBOSE (YES && LOG_ASYNC_ENABLED)

#define DDLogError(frmt, ...)   LOG_OBJC_MAYBE(LOG_ASYNC_ERROR,   ddLogLevel, LOG_FLAG_ERROR,   0, frmt, ##__VA_ARGS__)
#define DDLogWarn(frmt, ...)    LOG_OBJC_MAYBE(LOG_ASYNC_WARN,    ddLogLevel, LOG_FLAG_WARN,    0, frmt, ##__VA_ARGS__)
#define DDLogInfo(frmt, ...)    LOG_OBJC_MAYBE(LOG_ASYNC_INFO,    ddLogLevel, LOG_FLAG_INFO,    0, frmt, ##__VA_ARGS__)
#define DDLogVerbose(frmt, ...) LOG_OBJC_MAYBE(LOG_ASYNC_VERBOSE, ddLogLevel, LOG_FLAG_VERBOSE, 0, frmt, ##__VA_ARGS__)

#define DDLogCError(frmt, ...)   LOG_C_MAYBE(LOG_ASYNC_ERROR,   ddLogLevel, LOG_FLAG_ERROR,   0, frmt, ##__VA_ARGS__)
#define DDLogCWarn(frmt, ...)    LOG_C_MAYBE(LOG_ASYNC_WARN,    ddLogLevel, LOG_FLAG_WARN,    0, frmt, ##__VA_ARGS__)
#define DDLogCInfo(frmt, ...)    LOG_C_MAYBE(LOG_ASYNC_INFO,    ddLogLevel, LOG_FLAG_INFO,    0, frmt, ##__VA_ARGS__)
#define DDLogCVerbose(frmt, ...) LOG_C_MAYBE(LOG_ASYNC_VERBOSE, ddLogLevel, LOG_FLAG_VERBOSE, 0, frmt, ##__VA_ARGS__)

/**
 * The THIS_FILE macro gives you an NSString of the file name.
 * For simplicity and clarity, the file name does not include the full path or file extension.
 * 
 * For example: DDLogWarn(@"%@: Unable to find thingy", THIS_FILE) -> @"MyViewController: Unable to find thingy"
**/

NSString *ExtractFileNameWithoutExtension(const char *filePath, BOOL copy);

#define THIS_FILE (ExtractFileNameWithoutExtension(__FILE__, NO))

/**
 * The THIS_METHOD macro gives you the name of the current objective-c method.
 * 
 * For example: DDLogWarn(@"%@ - Requires non-nil strings") -> @"setMake:model: requires non-nil strings"
 * 
 * Note: This does NOT work in straight C functions (non objective-c).
 * Instead you should use the predefined __FUNCTION__ macro.
**/

#define THIS_METHOD NSStringFromSelector(_cmd)


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark -
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

@interface DDLog : NSObject

#if GCD_MAYBE_AVAILABLE

/**
 * Provides access to the underlying logging queue.
 * This may be helpful to Logger classes for things like thread synchronization.
**/

+ (dispatch_queue_t)loggingQueue;

#endif

#if GCD_MAYBE_UNAVAILABLE

/**
 * Provides access to the underlying logging thread.
 * This may be helpful to Logger classes for things like thread synchronization.
**/

+ (NSThread *)loggingThread;

#endif

/**
 * Logging Primitive.
 * 
 * This method is used by the macros above.
 * It is suggested you stick with the macros as they're easier to use.
**/

+ (void)log:(BOOL)synchronous
      level:(int)level
       flag:(int)flag
    context:(int)context
       file:(const char *)file
   function:(const char *)function
       line:(int)line
     format:(NSString *)format, ...;

/**
 * Since logging can be asynchronous, there may be times when you want to flush the logs.
 * The framework invokes this automatically when the application quits.
**/

+ (void)flushLog;

/** 
 * Loggers
 * 
 * If you want your log statements to go somewhere,
 * you should create and add a logger.
**/

+ (void)addLogger:(id <DDLogger>)logger;
+ (void)removeLogger:(id <DDLogger>)logger;

+ (void)removeAllLoggers;

/**
 * Registered Dynamic Logging
 * 
 * These methods allow you to obtain a list of classes that are using registered dynamic logging,
 * and also provides methods to get and set their log level during run time.
**/

+ (NSArray *)registeredClasses;
+ (NSArray *)registeredClassNames;

+ (int)logLevelForClass:(Class)aClass;
+ (int)logLevelForClassWithName:(NSString *)aClassName;

+ (void)setLogLevel:(int)logLevel forClass:(Class)aClass;
+ (void)setLogLevel:(int)logLevel forClassWithName:(NSString *)aClassName;

@end

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark -
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

@protocol DDLogger <NSObject>
@required

- (void)logMessage:(DDLogMessage *)logMessage;

/**
 * Formatters may optionally be added to any logger.
 * If no formatter is set, the logger simply logs the message as it is given in logMessage.
 * Or it may use its own built in formatting style.
**/
- (id <DDLogFormatter>)logFormatter;
- (void)setLogFormatter:(id <DDLogFormatter>)formatter;

@optional

/**
 * Since logging is asynchronous, adding and removing loggers is also asynchronous.
 * In other words, the loggers are added and removed at appropriate times with regards to log messages.
 * 
 * - Loggers will not receive log messages that were executed prior to when they were added.
 * - Loggers will not receive log messages that were executed after they were removed.
 * 
 * These methods are executed in the logging thread/queue.
 * This is the same thread/queue that will execute every logMessage: invocation.
 * Loggers may use these methods for thread synchronization or other setup/teardown tasks.
**/
- (void)didAddLogger;
- (void)willRemoveLogger;

/**
 * Some loggers may buffer IO for optimization purposes.
 * For example, a database logger may only save occasionaly as the disk IO is slow.
 * In such loggers, this method should be implemented to flush any pending IO.
 * 
 * This allows invocations of DDLog's flushLog method to be propogated to loggers that need it.
 * 
 * Note that DDLog's flushLog method is invoked automatically when the application quits,
 * and it may be also invoked manually by the developer prior to application crashes, or other such reasons.
**/
- (void)flush;

#if GCD_MAYBE_AVAILABLE

/**
 * When Grand Central Dispatch is available
 * each logger is executed concurrently with respect to the other loggers.
 * Thus, a dedicated dispatch queue is used for each logger.
 * Logger implementations may optionally choose to provide their own dispatch queue.
**/
- (dispatch_queue_t)loggerQueue;

/**
 * If the logger implementation does not choose to provide its own queue,
 * one will automatically be created for it.
 * The created queue will receive its name from this method.
 * This may be helpful for debugging or profiling reasons.
**/
- (NSString *)loggerName;

#endif

@end

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark -
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

@protocol DDLogFormatter <NSObject>
@required

/**
 * Formatters may optionally be added to any logger.
 * This allows for increased flexibility in the logging environment.
 * For example, log messages for log files may be formatted differently than log messages for the console.
 * 
 * For more information about formatters, see the "Custom Formatters" page:
 * http://code.google.com/p/cocoalumberjack/wiki/CustomFormatters
 * 
 * The formatter may also optionally filter the log message by returning nil,
 * in which case the logger will not log the message.
**/

- (NSString *)formatLogMessage:(DDLogMessage *)logMessage;

@end

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark -
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

@protocol DDRegisteredDynamicLogging

/**
 * Implement these methods to allow a file's log level to be managed from a central location.
 * 
 * This is useful if you'd like to be able to change log levels for various parts
 * of your code from within the running application.
 * 
 * Imagine pulling up the settings for your application,
 * and being able to configure the logging level on a per file basis.
 * 
 * The implementation can be very straight-forward:
 * 
 * + (int)ddLogLevel
 * {
 *     return ddLogLevel;
 * }
 *  
 * + (void)ddSetLogLevel:(int)logLevel
 * {
 *     ddLogLevel = logLevel;
 * }
**/

+ (int)ddLogLevel;
+ (void)ddSetLogLevel:(int)logLevel;

@end

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark -
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * The DDLogMessage class encapsulates information about the log message.
 * If you write custom loggers or formatters, you will be dealing with objects of this class.
**/

@interface DDLogMessage : NSObject
{

// The public variables below can be accessed directly (for speed).
// For example: logMessage->logLevel
	
@public
	int logLevel;
	int logFlag;
	int logContext;
	NSString *logMsg;
	NSDate *timestamp;
	const char *file;
	const char *function;
	int lineNumber;
	mach_port_t machThreadID;

// The private variables below are only calculated if needed.
// You should use the public methods to access this information.
	
@private
	NSString *threadID;
	NSString *fileName;
	NSString *methodName;
}

// The initializer is somewhat reserved for internal use.
// However, if you find need to manually create logMessage objects,
// there is one thing you should be aware of.
// The initializer expects the file and function parameters to be string literals.
// That is, it expects the given strings to exist for the duration of the object's lifetime,
// and it expects the given strings to be immutable.
// In other words, it does not copy these strings, it simply points to them.

- (id)initWithLogMsg:(NSString *)logMsg
               level:(int)logLevel
                flag:(int)logFlag
             context:(int)logContext
                file:(const char *)file
            function:(const char *)function
                line:(int)line;

/**
 * Returns the threadID as it appears in NSLog.
 * That is, it is a hexadecimal value which is calculated from the machThreadID.
**/
- (NSString *)threadID;

/**
 * Convenience method to get just the file name, as the file variable is generally the full file path.
 * This method does not include the file extension, which is generally unwanted for logging purposes.
**/
- (NSString *)fileName;

/**
 * Returns the function variable in NSString form.
**/
- (NSString *)methodName;

@end

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark -
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * The DDLogger protocol specifies that an optional formatter can be added to a logger.
 * Most (but not all) loggers will want to support formatters.
 * 
 * However, writting getters and setters in a thread safe manner,
 * while still maintaining maximum speed for the logging process, is a difficult task.
 * 
 * To do it right, the implementation of the getter/setter has strict requiremenets:
 * - Must NOT require the logMessage method to acquire a lock.
 * - Must NOT require the logMessage method to access an atomic property (also a lock of sorts).
 * 
 * To simplify things, an abstract logger is provided that implements the getter and setter.
 * 
 * Logger implementations may simply extend this class,
 * and they can ACCESS THE FORMATTER VARIABLE DIRECTLY from within their logMessage method!
**/

@interface DDAbstractLogger : NSObject <DDLogger>
{
	id <DDLogFormatter> formatter;
	
#if GCD_MAYBE_AVAILABLE
	dispatch_queue_t loggerQueue;
#endif
}

- (id <DDLogFormatter>)logFormatter;
- (void)setLogFormatter:(id <DDLogFormatter>)formatter;

@end
