#import <Foundation/Foundation.h>

#import "DDLog.h"

/**
 * Welcome to Cocoa Lumberjack!
 * 
 * The Google Code page has a wealth of documentation if you have any questions.
 * http://code.google.com/p/cocoalumberjack/
 * 
 * If you're new to the project you may wish to read the "Getting Started" page.
 * http://code.google.com/p/cocoalumberjack/wiki/GettingStarted
 * 
 * 
 * This class provides an abstract implementation of a database logger.
 * 
 * That is, it provides the base implementation for a database logger to build atop of.
 * All that is needed for a concrete database logger is to extend this class
 * and override the methods in the implementation file that are prefixed with "db_".
**/

@interface DDAbstractDatabaseLogger : DDAbstractLogger {
@protected
	NSUInteger saveThreshold;
	NSTimeInterval saveInterval;
	NSTimeInterval maxAge;
	NSTimeInterval deleteInterval;
	BOOL deleteOnEverySave;
	
	BOOL saveTimerSuspended;
	NSUInteger unsavedCount;
	dispatch_time_t unsavedTime;
	dispatch_source_t saveTimer;
	dispatch_time_t lastDeleteTime;
	dispatch_source_t deleteTimer;
}

/**
 * Specifies how often to save the data to disk.
 * Since saving is an expensive operation (disk io) it is not done after every log statement.
 * These properties allow you to configure how/when the logger saves to disk.
 * 
 * A save is done when either (whichever happens first):
 * 
 * - The number of unsaved log entries reaches saveThreshold
 * - The amount of time since the oldest unsaved log entry was created reaches saveInterval
 * 
 * You can optionally disable the saveThreshold by setting it to zero.
 * If you disable the saveThreshold you are entirely dependent on the saveInterval.
 * 
 * You can optionally disable the saveInterval by setting it to zero (or a negative value).
 * If you disable the saveInterval you are entirely dependent on the saveThreshold.
 * 
 * It's not wise to disable both saveThreshold and saveInterval.
 * 
 * The default saveThreshold is 500.
 * The default saveInterval is 60 seconds.
**/
@property (assign, readwrite) NSUInteger saveThreshold;
@property (assign, readwrite) NSTimeInterval saveInterval;

/**
 * It is likely you don't want the log entries to persist forever.
 * Doing so would allow the database to grow infinitely large over time.
 * 
 * The maxAge property provides a way to specify how old a log statement can get
 * before it should get deleted from the database.
 * 
 * The deleteInterval specifies how often to sweep for old log entries.
 * Since deleting is an expensive operation (disk io) is is done on a fixed interval.
 * 
 * An alternative to the deleteInterval is the deleteOnEverySave option.
 * This specifies that old log entries should be deleted during every save operation.
 * 
 * You can optionally disable the maxAge by setting it to zero (or a negative value).
 * If you disable the maxAge then old log statements are not deleted.
 * 
 * You can optionally disable the deleteInterval by setting it to zero (or a negative value).
 * 
 * If you disable both deleteInterval and deleteOnEverySave then old log statements are not deleted.
 * 
 * It's not wise to enable both deleteInterval and deleteOnEverySave.
 * 
 * The default maxAge is 7 days.
 * The default deleteInterval is 5 minutes.
 * The default deleteOnEverySave is NO.
**/
@property (assign, readwrite) NSTimeInterval maxAge;
@property (assign, readwrite) NSTimeInterval deleteInterval;
@property (assign, readwrite) BOOL deleteOnEverySave;

/**
 * Forces a save of any pending log entries (flushes log entries to disk).
**/
- (void)savePendingLogEntries;

/**
 * Removes any log entries that are older than maxAge.
**/
- (void)deleteOldLogEntries;

@end
