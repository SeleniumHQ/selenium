/**
 * DDRange is the functional equivalent of a 64 bit NSRange.
 * The HTTP Server is designed to support very large files.
 * On 32 bit architectures (ppc, i386) NSRange uses unsigned 32 bit integers.
 * This only supports a range of up to 4 gigabytes.
 * By defining our own variant, we can support a range up to 16 exabytes.
 * 
 * All effort is given such that DDRange functions EXACTLY the same as NSRange.
**/

#import <Foundation/NSValue.h>
#import <Foundation/NSObjCRuntime.h>

@class NSString;

typedef struct _DDRange {
    UInt64 location;
    UInt64 length;
} DDRange;

typedef DDRange *DDRangePointer;

NS_INLINE DDRange DDMakeRange(UInt64 loc, UInt64 len) {
    DDRange r;
    r.location = loc;
    r.length = len;
    return r;
}

NS_INLINE UInt64 DDMaxRange(DDRange range) {
    return (range.location + range.length);
}

NS_INLINE BOOL DDLocationInRange(UInt64 loc, DDRange range) {
    return (loc - range.location < range.length);
}

NS_INLINE BOOL DDEqualRanges(DDRange range1, DDRange range2) {
    return ((range1.location == range2.location) && (range1.length == range2.length));
}

FOUNDATION_EXPORT DDRange DDUnionRange(DDRange range1, DDRange range2);
FOUNDATION_EXPORT DDRange DDIntersectionRange(DDRange range1, DDRange range2);
FOUNDATION_EXPORT NSString *DDStringFromRange(DDRange range);
FOUNDATION_EXPORT DDRange DDRangeFromString(NSString *aString);

NSInteger DDRangeCompare(DDRangePointer pDDRange1, DDRangePointer pDDRange2);

@interface NSValue (NSValueDDRangeExtensions)

+ (NSValue *)valueWithDDRange:(DDRange)range;
- (DDRange)ddrangeValue;

- (NSInteger)ddrangeCompare:(NSValue *)ddrangeValue;

@end
