#import "DDRange.h"
#import "DDNumber.h"

DDRange DDUnionRange(DDRange range1, DDRange range2)
{
	DDRange result;
	
	result.location = MIN(range1.location, range2.location);
	result.length   = MAX(DDMaxRange(range1), DDMaxRange(range2)) - result.location;
	
	return result;
}

DDRange DDIntersectionRange(DDRange range1, DDRange range2)
{
	DDRange result;
	
	if((DDMaxRange(range1) < range2.location) || (DDMaxRange(range2) < range1.location))
	{
		return DDMakeRange(0, 0);
	}
	
	result.location = MAX(range1.location, range2.location);
	result.length   = MIN(DDMaxRange(range1), DDMaxRange(range2)) - result.location;
	
	return result;
}

NSString *DDStringFromRange(DDRange range)
{
	return [NSString stringWithFormat:@"{%qu, %qu}", range.location, range.length];
}

DDRange DDRangeFromString(NSString *aString)
{
	DDRange result = DDMakeRange(0, 0);
	
	// NSRange will ignore '-' characters, but not '+' characters
	NSCharacterSet *cset = [NSCharacterSet characterSetWithCharactersInString:@"+0123456789"];
	
	NSScanner *scanner = [NSScanner scannerWithString:aString];
	[scanner setCharactersToBeSkipped:[cset invertedSet]];
	
	NSString *str1 = nil;
	NSString *str2 = nil;
	
	BOOL found1 = [scanner scanCharactersFromSet:cset intoString:&str1];
	BOOL found2 = [scanner scanCharactersFromSet:cset intoString:&str2];
	
	if(found1) [NSNumber parseString:str1 intoUInt64:&result.location];
	if(found2) [NSNumber parseString:str2 intoUInt64:&result.length];
	
	return result;
}

NSInteger DDRangeCompare(DDRangePointer pDDRange1, DDRangePointer pDDRange2)
{
	// Comparison basis:
	// Which range would you encouter first if you started at zero, and began walking towards infinity.
	// If you encouter both ranges at the same time, which range would end first.
	
	if(pDDRange1->location < pDDRange2->location)
	{
		return NSOrderedAscending;
	}
	if(pDDRange1->location > pDDRange2->location)
	{
		return NSOrderedDescending;
	}
	if(pDDRange1->length < pDDRange2->length)
	{
		return NSOrderedAscending;
	}
	if(pDDRange1->length > pDDRange2->length)
	{
		return NSOrderedDescending;
	}
	
	return NSOrderedSame;
}

@implementation NSValue (NSValueDDRangeExtensions)

+ (NSValue *)valueWithDDRange:(DDRange)range
{
	return [NSValue valueWithBytes:&range objCType:@encode(DDRange)];
}

- (DDRange)ddrangeValue
{
	DDRange result;
	[self getValue:&result];
	return result;
}

- (NSInteger)ddrangeCompare:(NSValue *)other
{
	DDRange r1 = [self ddrangeValue];
	DDRange r2 = [other ddrangeValue];
	
	return DDRangeCompare(&r1, &r2);
}

@end
