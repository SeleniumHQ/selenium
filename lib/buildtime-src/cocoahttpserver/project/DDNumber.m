#import "DDNumber.h"


@implementation NSNumber (DDNumber)

+ (BOOL)parseString:(NSString *)str intoSInt64:(SInt64 *)pNum
{
	errno = 0;
	
#if __LP64__
	// long = 64 bit
	*pNum = strtol([str UTF8String], NULL, 10);
#else
	// long = 32 bit
	// long long = 64 bit
	*pNum = strtoll([str UTF8String], NULL, 10);
#endif
	
	if(errno != 0)
		return NO;
	else
		return YES;
}

+ (BOOL)parseString:(NSString *)str intoUInt64:(UInt64 *)pNum
{
	errno = 0;
	
#if __LP64__
	// unsigned long = 64 bit
	*pNum = strtoul([str UTF8String], NULL, 10);
#else
	// unsigned long = 32 bit
	// unsigned long long = 64 bit
	*pNum = strtoull([str UTF8String], NULL, 10);
#endif
	
	if(errno != 0)
		return NO;
	else
		return YES;
}

+ (BOOL)parseString:(NSString *)str intoNSInteger:(NSInteger *)pNum
{
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
