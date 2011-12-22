#import "DDNumber.h"


@implementation NSNumber (DDNumber)

+ (BOOL)parseString:(NSString *)str intoSInt64:(SInt64 *)pNum
{
	if(str == nil)
	{
		*pNum = 0;
		return NO;
	}
	
	errno = 0;
	
	// On both 32-bit and 64-bit machines, long long = 64 bit
	
	*pNum = strtoll([str UTF8String], NULL, 10);
	
	if(errno != 0)
		return NO;
	else
		return YES;
}

+ (BOOL)parseString:(NSString *)str intoUInt64:(UInt64 *)pNum
{
	if(str == nil)
	{
		*pNum = 0;
		return NO;
	}
	
	errno = 0;
	
	// On both 32-bit and 64-bit machines, unsigned long long = 64 bit
	
	*pNum = strtoull([str UTF8String], NULL, 10);
	
	if(errno != 0)
		return NO;
	else
		return YES;
}

+ (BOOL)parseString:(NSString *)str intoNSInteger:(NSInteger *)pNum
{
	if(str == nil)
	{
		*pNum = 0;
		return NO;
	}
	
	errno = 0;
	
	// On LP64, NSInteger = long = 64 bit
	// Otherwise, NSInteger = int = long = 32 bit
	
	*pNum = strtol([str UTF8String], NULL, 10);
	
	if(errno != 0)
		return NO;
	else
		return YES;
}

+ (BOOL)parseString:(NSString *)str intoNSUInteger:(NSUInteger *)pNum
{
	if(str == nil)
	{
		*pNum = 0;
		return NO;
	}
	
	errno = 0;
	
	// On LP64, NSUInteger = unsigned long = 64 bit
	// Otherwise, NSUInteger = unsigned int = unsigned long = 32 bit
	
	*pNum = strtoul([str UTF8String], NULL, 10);
	
	if(errno != 0)
		return NO;
	else
		return YES;
}

@end
