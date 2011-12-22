#import "DDAbstractDatabaseLogger.h"

@interface DDAbstractDatabaseLogger ()
- (void)destroySaveTimer;
- (void)destroyDeleteTimer;
@end

#pragma mark -

@implementation DDAbstractDatabaseLogger

- (id)init
{
	if ((self = [super init]))
	{
        saveThreshold = 500;
		saveInterval = 60;           // 60 seconds
		maxAge = (60 * 60 * 24 * 7); //  7 days
		deleteInterval = (60 * 5);   //  5 minutes
	}
	return self;
}

- (void)dealloc
{
	[self destroySaveTimer];
	[self destroyDeleteTimer];
	
    [super dealloc];
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark Override Me
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

- (BOOL)db_log:(DDLogMessage *)logMessage
{
	// Override me and add your implementation.
	// 
	// Return YES if an item was added to the buffer.
	// Return NO if the logMessage was ignored.
	
	return NO;
}

- (void)db_save
{
	// Override me and add your implementation.
}

- (void)db_delete
{
	// Override me and add your implementation.
}

- (void)db_saveAndDelete
{
	// Override me and add your implementation.
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark Private API
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

- (void)performSaveAndSuspendSaveTimer
{
	if (unsavedCount > 0)
	{
		if (deleteOnEverySave)
			[self db_saveAndDelete];
		else
			[self db_save];
	}
	
	unsavedCount = 0;
	unsavedTime = 0;
	
	if (saveTimer && !saveTimerSuspended)
	{
		dispatch_suspend(saveTimer);
		saveTimerSuspended = YES;
	}
}

- (void)performDelete
{
	if (maxAge > 0.0)
	{
		[self db_delete];
		
		lastDeleteTime = dispatch_time(DISPATCH_TIME_NOW, 0);
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark Timers
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

- (void)destroySaveTimer
{
	if (saveTimer)
	{
		dispatch_source_cancel(saveTimer);
		dispatch_release(saveTimer);
		saveTimer = NULL;
	}
}

- (void)updateAndResumeSaveTimer
{
	if ((saveTimer != NULL) && (saveInterval > 0.0) && (unsavedTime > 0.0))
	{
		uint64_t interval = saveInterval * NSEC_PER_SEC;
		dispatch_time_t startTime = dispatch_time(unsavedTime, interval);
		
		dispatch_source_set_timer(saveTimer, startTime, interval, 1.0);
		
		if (saveTimerSuspended)
		{
			dispatch_resume(saveTimer);
			saveTimerSuspended = NO;
		}
	}
}

- (void)createSuspendedSaveTimer
{
	if ((saveTimer == NULL) && (saveInterval > 0.0))
	{
		saveTimer = dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0, loggerQueue);
		
		dispatch_source_set_event_handler(saveTimer, ^{
			NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
			
			[self performSaveAndSuspendSaveTimer];
			
			[pool drain];
		});
		
		saveTimerSuspended = YES;
	}
}

- (void)destroyDeleteTimer
{
	if (deleteTimer)
	{
		dispatch_source_cancel(deleteTimer);
		dispatch_release(deleteTimer);
		deleteTimer = NULL;
	}
}

- (void)updateDeleteTimer
{
	if ((deleteTimer != NULL) && (deleteInterval > 0.0) && (maxAge > 0.0))
	{
		uint64_t interval = deleteInterval * NSEC_PER_SEC;
		dispatch_time_t startTime;
		
		if (lastDeleteTime > 0)
			startTime = dispatch_time(lastDeleteTime, interval);
		else
			startTime = dispatch_time(DISPATCH_TIME_NOW, interval);
		
		dispatch_source_set_timer(deleteTimer, startTime, interval, 1.0);
	}
}

- (void)createAndStartDeleteTimer
{
	if ((deleteTimer == NULL) && (deleteInterval > 0.0) && (maxAge > 0.0))
	{
		deleteTimer = dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0, loggerQueue);
		
		dispatch_source_set_event_handler(deleteTimer, ^{
			NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
			
			[self performDelete];
			
			[pool drain];
		});
		
		[self updateDeleteTimer];
		
		dispatch_resume(deleteTimer);
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark Configuration
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

- (NSUInteger)saveThreshold
{
	if (dispatch_get_current_queue() == loggerQueue)
	{
		return saveThreshold;
	}
	else
	{
		__block NSUInteger result;
		
		dispatch_sync(loggerQueue, ^{
			result = saveThreshold;
		});
		
		return result;
	}
}

- (void)setSaveThreshold:(NSUInteger)threshold
{
	dispatch_block_t block = ^{
		
		if (saveThreshold != threshold)
		{
			saveThreshold = threshold;
			
			// Since the saveThreshold has changed,
			// we check to see if the current unsavedCount has surpassed the new threshold.
			// 
			// If it has, we immediately save the log.
			
			if ((unsavedCount >= saveThreshold) && (saveThreshold > 0))
			{
				NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
				
				[self performSaveAndSuspendSaveTimer];
				
				[pool drain];
			}
		}
	};
	
	if (dispatch_get_current_queue() == loggerQueue)
		block();
	else
		dispatch_async(loggerQueue, block);
}

- (NSTimeInterval)saveInterval
{
	if (dispatch_get_current_queue() == loggerQueue)
	{
		return saveInterval;
	}
	else
	{
		__block NSTimeInterval result;
		
		dispatch_sync(loggerQueue, ^{
			result = saveInterval;
		});
		
		return result;
	}
}

- (void)setSaveInterval:(NSTimeInterval)interval
{
	dispatch_block_t block = ^{
	
		if (saveInterval != interval)
		{
			saveInterval = interval;
			
			// There are several cases we need to handle here.
			// 
			// 1. If the saveInterval was previously enabled and it just got disabled,
			//    then we need to stop the saveTimer. (And we might as well release it.)
			// 
			// 2. If the saveInterval was previously disabled and it just got enabled,
			//    then we need to setup the saveTimer. (Plus we might need to do an immediate save.)
			// 
			// 3. If the saveInterval increased, then we need to reset the timer so that it fires at the later date.
			// 
			// 4. If the saveInterval decreased, then we need to reset the timer so that it fires at an earlier date.
			//    (Plus we might need to do an immediate save.)
			
			if (saveInterval > 0.0)
			{
				NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
				
				if (saveTimer == NULL)
				{
					// Handles #2
					// 
					// Since the saveTimer uses the unsavedTime to calculate it's first fireDate,
					// if a save is needed the timer will fire immediately.
					
					[self createSuspendedSaveTimer];
					[self updateAndResumeSaveTimer];
				}
				else
				{
					// Handles #3
					// Handles #4
					// 
					// Since the saveTimer uses the unsavedTime to calculate it's first fireDate,
					// if a save is needed the timer will fire immediately.
					
					[self updateAndResumeSaveTimer];
				}
				
				[pool drain];
			}
			else if (saveTimer)
			{
				// Handles #1
				
				[self destroySaveTimer];
			}
		}
	};
	
	if (dispatch_get_current_queue() == loggerQueue)
		block();
	else
		dispatch_async(loggerQueue, block);
}

- (NSTimeInterval)maxAge
{
	if (dispatch_get_current_queue() == loggerQueue)
	{
		return maxAge;
	}
	else
	{
		__block NSTimeInterval result;
		
		dispatch_sync(loggerQueue, ^{
			result = maxAge;
		});
		
		return result;
	}
}

- (void)setMaxAge:(NSTimeInterval)interval
{
	dispatch_block_t block = ^{
		
		if (maxAge != interval)
		{
			NSTimeInterval oldMaxAge = maxAge;
			NSTimeInterval newMaxAge = interval;
			
			maxAge = interval;
			
			// There are several cases we need to handle here.
			// 
			// 1. If the maxAge was previously enabled and it just got disabled,
			//    then we need to stop the deleteTimer. (And we might as well release it.)
			// 
			// 2. If the maxAge was previously disabled and it just got enabled,
			//    then we need to setup the deleteTimer. (Plus we might need to do an immediate delete.)
			// 
			// 3. If the maxAge was increased,
			//    then we don't need to do anything.
			// 
			// 4. If the maxAge was decreased,
			//    then we should do an immediate delete.
			
			BOOL shouldDeleteNow = NO;
			
			if (oldMaxAge > 0.0)
			{
				if (newMaxAge <= 0.0)
				{
					// Handles #1
					
					[self destroyDeleteTimer];
				}
				else if (oldMaxAge > newMaxAge)
				{
					// Handles #4
					shouldDeleteNow = YES;
				}
			}
			else if (newMaxAge > 0.0)
			{
				// Handles #2
				shouldDeleteNow = YES;
			}
			
			if (shouldDeleteNow)
			{
				NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
				
				[self performDelete];
				
				if (deleteTimer)
					[self updateDeleteTimer];
				else
					[self createAndStartDeleteTimer];
				
				[pool drain];
			}
		}
	};
	
	if (dispatch_get_current_queue() == loggerQueue)
		block();
	else
		dispatch_async(loggerQueue, block);
}

- (NSTimeInterval)deleteInterval
{
	if (dispatch_get_current_queue() == loggerQueue)
	{
		return deleteInterval;
	}
	else
	{
		__block NSTimeInterval result;
		
		dispatch_sync(loggerQueue, ^{
			result = deleteInterval;
		});
		
		return result;
	}
}

- (void)setDeleteInterval:(NSTimeInterval)interval
{
	dispatch_block_t block = ^{
		
		if (deleteInterval != interval)
		{
			deleteInterval = interval;
			
			// There are several cases we need to handle here.
			// 
			// 1. If the deleteInterval was previously enabled and it just got disabled,
			//    then we need to stop the deleteTimer. (And we might as well release it.)
			// 
			// 2. If the deleteInterval was previously disabled and it just got enabled,
			//    then we need to setup the deleteTimer. (Plus we might need to do an immediate delete.)
			// 
			// 3. If the deleteInterval increased, then we need to reset the timer so that it fires at the later date.
			// 
			// 4. If the deleteInterval decreased, then we need to reset the timer so that it fires at an earlier date.
			//    (Plus we might need to do an immediate delete.)
			
			if (deleteInterval > 0.0)
			{
				NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
				
				if (deleteTimer == NULL)
				{
					// Handles #2
					// 
					// Since the deleteTimer uses the lastDeleteTime to calculate it's first fireDate,
					// if a delete is needed the timer will fire immediately.
					
					[self createAndStartDeleteTimer];
				}
				else
				{
					// Handles #3
					// Handles #4
					// 
					// Since the deleteTimer uses the lastDeleteTime to calculate it's first fireDate,
					// if a save is needed the timer will fire immediately.
					
					[self updateDeleteTimer];
				}
				
				[pool drain];
			}
			else if (deleteTimer)
			{
				// Handles #1
				
				[self destroyDeleteTimer];
			}
		}
	};
	
	if (dispatch_get_current_queue() == loggerQueue)
		block();
	else
		dispatch_async(loggerQueue, block);
}

- (BOOL)deleteOnEverySave
{
	if (dispatch_get_current_queue() == loggerQueue)
	{
		return deleteOnEverySave;
	}
	else
	{
		__block BOOL result;
		
		dispatch_sync(loggerQueue, ^{
			result = deleteOnEverySave;
		});
		
		return result;
	}
}

- (void)setDeleteOnEverySave:(BOOL)flag
{
	dispatch_block_t block = ^{
		
		deleteOnEverySave = flag;
	};
	
	if (dispatch_get_current_queue() == loggerQueue)
		block();
	else
		dispatch_async(loggerQueue, block);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark Public API
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

- (void)savePendingLogEntries
{
	dispatch_block_t block = ^{
		NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
		
		[self performSaveAndSuspendSaveTimer];
		
		[pool drain];
	};
	
	if (dispatch_get_current_queue() == loggerQueue)
		block();
	else
		dispatch_async(loggerQueue, block);
}

- (void)deleteOldLogEntries
{
	dispatch_block_t block = ^{
		NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
		
		[self performDelete];
		
		[pool drain];
	};
	
	if (dispatch_get_current_queue() == loggerQueue)
		block();
	else
		dispatch_async(loggerQueue, block);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark DDLogger
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

- (void)didAddLogger
{
	// If you override me be sure to invoke [super didAddLogger];
	
	[self createSuspendedSaveTimer];
	
	[self createAndStartDeleteTimer];
}

- (void)willRemoveLogger
{
	// If you override me be sure to invoke [super willRemoveLogger];
	
	[self performSaveAndSuspendSaveTimer];
	
	[self destroySaveTimer];
	[self destroyDeleteTimer];
}

- (void)logMessage:(DDLogMessage *)logMessage
{
	if ([self db_log:logMessage])
	{
		BOOL firstUnsavedEntry = (++unsavedCount == 1);
		
		if ((unsavedCount >= saveThreshold) && (saveThreshold > 0))
		{
			[self performSaveAndSuspendSaveTimer];
		}
		else if (firstUnsavedEntry)
		{
			unsavedTime = dispatch_time(DISPATCH_TIME_NOW, 0);
			[self updateAndResumeSaveTimer];
		}
	}
}

- (void)flush
{
	// This method is invoked by DDLog's flushLog method.
	// 
	// It is called automatically when the application quits,
	// or if the developer invokes DDLog's flushLog method prior to crashing or something.
	
	[self performSaveAndSuspendSaveTimer];
}

@end
