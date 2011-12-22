#import "HTTPAsyncFileResponse.h"
#import "HTTPConnection.h"
#import "HTTPLogging.h"

#import <unistd.h>
#import <fcntl.h>

// Log levels : off, error, warn, info, verbose
// Other flags: trace
static const int httpLogLevel = HTTP_LOG_LEVEL_WARN; // | HTTP_LOG_FLAG_TRACE;

#define NULL_FD  -1

/**
 * Architecure overview:
 * 
 * HTTPConnection will invoke our readDataOfLength: method to fetch data.
 * We will return nil, and then proceed to read the data via our readSource on our readQueue.
 * Once the requested amount of data has been read, we then pause our readSource,
 * and inform the connection of the available data.
 * 
 * While our read is in progress, we don't have to worry about the connection calling any other methods,
 * except the connectionDidClose method, which would be invoked if the remote end closed the socket connection.
 * To safely handle this, we do a synchronous dispatch on the readQueue,
 * and nilify the connection as well as cancel our readSource.
 * 
 * In order to minimize resource consumption during a HEAD request,
 * we don't open the file until we have to (until the connection starts requesting data).
**/

@implementation HTTPAsyncFileResponse

- (id)initWithFilePath:(NSString *)fpath forConnection:(HTTPConnection *)parent
{
	if ((self = [super init]))
	{
		HTTPLogTrace();
		
		connection = parent; // Parents retain children, children do NOT retain parents
		
		fileFD = NULL_FD;
		filePath = [fpath copy];
		if (filePath == nil)
		{
			HTTPLogWarn(@"%@: Init failed - Nil filePath", THIS_FILE);
			
			[self release];
			return nil;
		}
		
		NSDictionary *fileAttributes = [[NSFileManager defaultManager] attributesOfItemAtPath:filePath error:NULL];
		if (fileAttributes == nil)
		{
			HTTPLogWarn(@"%@: Init failed - Unable to get file attributes. filePath: %@", THIS_FILE, filePath);
			
			[self release];
			return nil;
		}
		
		fileLength = (UInt64)[[fileAttributes objectForKey:NSFileSize] unsignedLongLongValue];
		fileOffset = 0;
		
		aborted = NO;
		
		// We don't bother opening the file here.
		// If this is a HEAD request we only need to know the fileLength.
	}
	return self;
}

- (void)abort
{
	HTTPLogTrace();
	
	[connection responseDidAbort:self];
	aborted = YES;
}

- (void)processReadBuffer
{
	// This method is here to allow superclasses to perform post-processing of the data.
	// For an example, see the HTTPDynamicFileResponse class.
	// 
	// At this point, the readBuffer has readBufferOffset bytes available.
	// This method is in charge of updating the readBufferOffset.
	// Failure to do so will cause the readBuffer to grow to fileLength. (Imagine a 1 GB file...)
	
	// Copy the data out of the temporary readBuffer.
	data = [[NSData alloc] initWithBytes:readBuffer length:readBufferOffset];
	
	// Reset the read buffer.
	readBufferOffset = 0;
	
	// Notify the connection that we have data available for it.
	[connection responseHasAvailableData:self];
}

- (void)pauseReadSource
{
	if (!readSourceSuspended)
	{
		HTTPLogVerbose(@"%@[%p]: Suspending readSource", THIS_FILE, self);
		
		readSourceSuspended = YES;
		dispatch_suspend(readSource);
	}
}

- (void)resumeReadSource
{
	if (readSourceSuspended)
	{
		HTTPLogVerbose(@"%@[%p]: Resuming readSource", THIS_FILE, self);
		
		readSourceSuspended = NO;
		dispatch_resume(readSource);
	}
}

- (void)cancelReadSource
{
	HTTPLogVerbose(@"%@[%p]: Canceling readSource", THIS_FILE, self);
	
	dispatch_source_cancel(readSource);
	
	// Cancelling a dispatch source doesn't
	// invoke the cancel handler if the dispatch source is paused.
	
	if (readSourceSuspended)
	{
		readSourceSuspended = NO;
		dispatch_resume(readSource);
	}
}

- (BOOL)openFileAndSetupReadSource
{
	HTTPLogTrace();
	
	fileFD = open([filePath UTF8String], (O_RDONLY | O_NONBLOCK));
	if (fileFD == NULL_FD)
	{
		HTTPLogError(@"%@: Unable to open file. filePath: %@", THIS_FILE, filePath);
		
		return NO;
	}
	
	HTTPLogVerbose(@"%@[%p]: Open fd[%i] -> %@", THIS_FILE, self, fileFD, filePath);
	
	readQueue = dispatch_queue_create("HTTPAsyncFileResponse", NULL);
	readSource = dispatch_source_create(DISPATCH_SOURCE_TYPE_READ, fileFD, 0, readQueue);
	
	
	dispatch_source_set_event_handler(readSource, ^{
		
		HTTPLogTrace2(@"%@: eventBlock - fd[%i]", THIS_FILE, fileFD);
		
		// Determine how much data we should read.
		// 
		// It is OK if we ask to read more bytes than exist in the file.
		// It is NOT OK to over-allocate the buffer.
		
		unsigned long long _bytesAvailableOnFD = dispatch_source_get_data(readSource);
		
		UInt64 _bytesLeftInFile = fileLength - readOffset;
		
		NSUInteger bytesAvailableOnFD;
		NSUInteger bytesLeftInFile;
		
		bytesAvailableOnFD = (_bytesAvailableOnFD > NSUIntegerMax) ? NSUIntegerMax : (NSUInteger)_bytesAvailableOnFD;
		bytesLeftInFile    = (_bytesLeftInFile    > NSUIntegerMax) ? NSUIntegerMax : (NSUInteger)_bytesLeftInFile;
		
		NSUInteger bytesLeftInRequest = readRequestLength - readBufferOffset;
		
		NSUInteger bytesLeft = MIN(bytesLeftInRequest, bytesLeftInFile);
		
		NSUInteger bytesToRead = MIN(bytesAvailableOnFD, bytesLeft);
		
		// Make sure buffer is big enough for read request.
		// Do not over-allocate.
		
		if (readBuffer == NULL || bytesToRead > (readBufferSize - readBufferOffset))
		{
			readBufferSize = bytesToRead;
			readBuffer = reallocf(readBuffer, (size_t)bytesToRead);
			
			if (readBuffer == NULL)
			{
				HTTPLogError(@"%@[%p]: Unable to allocate buffer", THIS_FILE, self);
				
				[self pauseReadSource];
				[self abort];
				
				return;
			}
		}
		
		// Perform the read
		
		HTTPLogVerbose(@"%@[%p]: Attempting to read %lu bytes from file", THIS_FILE, self, bytesToRead);
		
		ssize_t result = read(fileFD, readBuffer + readBufferOffset, (size_t)bytesToRead);
		
		// Check the results
		if (result < 0)
		{
			HTTPLogError(@"%@: Error(%i) reading file(%@)", THIS_FILE, errno, filePath);
			
			[self pauseReadSource];
			[self abort];
		}
		else if (result == 0)
		{
			HTTPLogError(@"%@: Read EOF on file(%@)", THIS_FILE, filePath);
			
			[self pauseReadSource];
			[self abort];
		}
		else // (result > 0)
		{
			HTTPLogVerbose(@"%@[%p]: Read %d bytes from file", THIS_FILE, self, result);
			
			readOffset += result;
			readBufferOffset += result;
			
			[self pauseReadSource];
			[self processReadBuffer];
		}
		
	});
	
	int theFileFD = fileFD;
	dispatch_source_t theReadSource = readSource;
	
	dispatch_source_set_cancel_handler(readSource, ^{
		
		// Do not access self from within this block in any way, shape or form.
		// 
		// Note: You access self if you reference an iVar.
		
		HTTPLogTrace2(@"%@: cancelBlock - Close fd[%i]", THIS_FILE, theFileFD);
		
		dispatch_release(theReadSource);
		close(theFileFD);
	});
	
	readSourceSuspended = YES;
	
	return YES;
}

- (BOOL)openFileIfNeeded
{
	if (aborted)
	{
		// The file operation has been aborted.
		// This could be because we failed to open the file,
		// or the reading process failed.
		return NO;
	}
	
	if (fileFD != NULL_FD)
	{
		// File has already been opened.
		return YES;
	}
	
	return [self openFileAndSetupReadSource];
}	

- (UInt64)contentLength
{
	HTTPLogTrace2(@"%@[%p]: contentLength - %llu", THIS_FILE, self, fileLength);
	
	return fileLength;
}

- (UInt64)offset
{
	HTTPLogTrace();
	
	return fileOffset;
}

- (void)setOffset:(UInt64)offset
{
	HTTPLogTrace2(@"%@[%p]: setOffset:%llu", THIS_FILE, self, offset);
	
	if (![self openFileIfNeeded])
	{
		// File opening failed,
		// or response has been aborted due to another error.
		return;
	}
	
	fileOffset = offset;
	readOffset = offset;
	
	off_t result = lseek(fileFD, (off_t)offset, SEEK_SET);
	if (result == -1)
	{
		HTTPLogError(@"%@[%p]: lseek failed - errno(%i) filePath(%@)", THIS_FILE, self, errno, filePath);
		
		[self abort];
	}
}

- (NSData *)readDataOfLength:(NSUInteger)length
{
	HTTPLogTrace2(@"%@[%p]: readDataOfLength:%lu", THIS_FILE, self, (unsigned long)length);
	
	if (data)
	{
		NSUInteger dataLength = [data length];
		
		HTTPLogVerbose(@"%@[%p]: Returning data of length %lu", THIS_FILE, self, dataLength);
		
		fileOffset += dataLength;
		
		NSData *result = data;
		data = nil;
		
		return [result autorelease];
	}
	else
	{
		if (![self openFileIfNeeded])
		{
			// File opening failed,
			// or response has been aborted due to another error.
			return nil;
		}
		
		dispatch_sync(readQueue, ^{
			
			NSAssert(readSourceSuspended, @"Invalid logic - perhaps HTTPConnection has changed.");
			
			readRequestLength = length;
			[self resumeReadSource];
		});
		
		return nil;
	}
}

- (BOOL)isDone
{
	BOOL result = (fileOffset == fileLength);
	
	HTTPLogTrace2(@"%@[%p]: isDone - %@", THIS_FILE, self, (result ? @"YES" : @"NO"));
	
	return result;
}

- (NSString *)filePath
{
	return filePath;
}

- (BOOL)isAsynchronous
{
	HTTPLogTrace();
	
	return YES;
}

- (void)connectionDidClose
{
	HTTPLogTrace();
	
	if (fileFD != NULL_FD)
	{
		dispatch_sync(readQueue, ^{
			
			// Prevent any further calls to the connection
			connection = nil;
			
			// Cancel the readSource.
			// We do this here because the readSource's eventBlock has retained self.
			// In other words, if we don't cancel the readSource, we will never get deallocated.
			
			[self cancelReadSource];
		});
	}
}

- (void)dealloc
{
	HTTPLogTrace();
	
	if (readQueue)
		dispatch_release(readQueue);
	
	if (readBuffer)
		free(readBuffer);
	
	[filePath release];
	[data release];
	
	[super dealloc];
}

@end
