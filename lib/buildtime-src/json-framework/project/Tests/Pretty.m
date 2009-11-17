//
//  Pretty.m
//  JSON
//
//  Created by Stig Brautaset on 26/09/2007.
//  Copyright 2007 Stig Brautaset. All rights reserved.
//

#import "Pretty.h"
#import <JSON/JSON.h>

@implementation Pretty

- (void)testOutputFormat {
    SBJSON *json = [SBJSON new];    
    NSString *inputString = [NSString stringWithContentsOfFile:@"Tests/format/input.json"
                                                      encoding:NSASCIIStringEncoding
                                                         error:nil];

    id input = [json objectWithString:inputString error:NULL];
    id output = [json stringWithObject:input error:NULL];
    STAssertEquals([[output componentsSeparatedByString:@"\n"] count], (NSUInteger)1, nil);
    
    json.humanReadable = YES;
    id humanReadable = [json stringWithObject:input error:NULL];
    STAssertEquals([[humanReadable componentsSeparatedByString:@"\n"] count], (NSUInteger)14, nil);

    json.sortKeys = YES;
    id sortKeys = [json stringWithObject:input error:NULL];
    STAssertEquals([[sortKeys componentsSeparatedByString:@"\n"] count], (NSUInteger)14, nil);
    STAssertFalse([sortKeys isEqual:humanReadable], @"%@ == %@", sortKeys, humanReadable);
    
    NSString *expected = [NSString stringWithContentsOfFile:@"Tests/format/HumanReadable.json"
                                                   encoding:NSASCIIStringEncoding
                                                      error:nil];

    // chop off the newline
    expected = [expected substringToIndex:[expected length]-1];
    STAssertEqualObjects(sortKeys, expected, nil);
}

@end
