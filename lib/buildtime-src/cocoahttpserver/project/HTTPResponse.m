#import "HTTPResponse.h"


@implementation HTTPFileResponse

- (id)initWithFilePath:(NSString *)filePathParam
{
	if(self = [super init])
	{
		filePath = [filePathParam copy];
		fileHandle = [[NSFileHandle fileHandleForReadingAtPath:filePath] retain];
	}
	return self;
}

- (void)dealloc
{
	[filePath release];
	[fileHandle closeFile];
	[fileHandle release];
	[super dealloc];
}

- (UInt64)contentLength
{
	NSDictionary *fileAttributes = [[NSFileManager defaultManager] fileAttributesAtPath:filePath traverseLink:NO];
	
	NSNumber *fileSize = [fileAttributes objectForKey:NSFileSize];
	
	return (UInt64)[fileSize unsignedLongLongValue];
}

- (UInt64)offset
{
	return (UInt64)[fileHandle offsetInFile];
}

- (void)setOffset:(UInt64)offset
{
	[fileHandle seekToFileOffset:offset];
}

- (NSData *)readDataOfLength:(unsigned int)length
{
	return [fileHandle readDataOfLength:length];
}

- (NSString *)filePath
{
	return filePath;
}

@end

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark -
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

@implementation HTTPDataResponse

- (id)initWithData:(NSData *)dataParam
{
	if(self = [super init])
	{
		offset = 0;
		data = [dataParam retain];
	}
	return self;
}

- (void)dealloc
{
	[data release];
	[super dealloc];
}

- (UInt64)contentLength
{
	return (UInt64)[data length];
}

- (UInt64)offset
{
	return offset;
}

- (void)setOffset:(UInt64)offsetParam
{
	offset = offsetParam;
}

- (NSData *)readDataOfLength:(unsigned int)lengthParameter
{
	unsigned int remaining = [data length] - offset;
	unsigned int length = lengthParameter < remaining ? lengthParameter : remaining;
	
	void *bytes = (void *)([data bytes] + offset);
	
	offset += length;
	
	return [NSData dataWithBytesNoCopy:bytes length:length freeWhenDone:NO];
}

@end
