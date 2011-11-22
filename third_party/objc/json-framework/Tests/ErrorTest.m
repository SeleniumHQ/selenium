/*
 Copyright (C) 2007-2011 Stig Brautaset. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:

 * Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.

 * Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

 * Neither the name of the author nor the names of its contributors
   may be used to endorse or promote products derived from this
   software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 */


#import "JsonTestCase.h"


#define SBAssertStringContains(e, s) \
STAssertTrue([e rangeOfString:s].location != NSNotFound, @"%@ vs %@", e, s)

@interface ErrorTest : JsonTestCase
@end

@implementation ErrorTest

- (void)setUp {
    [super setUp];
    parser.maxDepth = 4u;
    writer.maxDepth = 4u;
}

- (NSString*)otherFileName {
    return @"error";
}

- (void)testData {
    [self foreachTestInSuite:@"Tests/Data/invalid" apply:^(NSString *inpath, NSString *errpath) {
        NSData *input = [NSData dataWithContentsOfFile:inpath options:0 error:nil];
        STAssertNotNil(input, inpath);
        
        NSString *error = [NSString stringWithContentsOfFile:errpath encoding:NSUTF8StringEncoding error:nil];
        STAssertNotNil(error, errpath);
        
        error = [error stringByReplacingOccurrencesOfString:@"\n" withString:@""];
        
        STAssertNil([parser objectWithData:input], inpath);
        STAssertEqualObjects(parser.error, error, @"%@: %@", inpath, input);
        
    }];
    
    STAssertEquals(count, (NSUInteger)28, nil);
}

- (void)testWriteRecursion {
    // create a challenge!
    NSMutableArray *a1 = [NSMutableArray array];
    NSMutableArray *a2 = [NSMutableArray arrayWithObject:a1];
    [a1 addObject:a2];
    
    STAssertNil([writer stringWithObject:a1], nil);
    STAssertEqualObjects(writer.error, @"Nested too deep", writer.error);
}


- (void)testUnsupportedObject {
    
    STAssertNil([writer stringWithObject:[NSData data]], nil);
    STAssertNotNil(writer.error, nil);
}

- (void)testNonStringDictionaryKey {
    NSArray *keys = [NSArray arrayWithObjects:[NSNull null],
                     [NSNumber numberWithInt:1],
                     [NSArray array],
                     [NSDictionary dictionary],
                     nil];
    
    for (id key in keys) {
        NSDictionary *object = [NSDictionary dictionaryWithObject:@"1" forKey:key];
        STAssertEqualObjects([writer stringWithObject:object], nil, nil);
        STAssertNotNil(writer.error, nil);
    }
}


- (void)testScalar {
    NSArray *fragments = [NSArray arrayWithObjects:@"foo", @"", [NSNull null], [NSNumber numberWithInt:1], [NSNumber numberWithBool:YES], nil];
    for (NSUInteger i = 0; i < [fragments count]; i++) {
        NSString *fragment = [fragments objectAtIndex:i];
        
        // We don't check the convenience category here, like we do for parsing,
        // because the category is explicitly on the NSArray and NSDictionary objects.
        // STAssertNil([fragment JSONRepresentation], nil);
        
        STAssertNil([writer stringWithObject:fragment], @"%@", fragment);
        SBAssertStringContains(parser.error, @"Not valid type for JSON");
    }
}

- (void)testInfinity {
    NSArray *obj = [NSArray arrayWithObject:[NSNumber numberWithDouble:INFINITY]];    
    STAssertNil([writer stringWithObject:obj], @"%@", obj);
    SBAssertStringContains(parser.error, @"Infinity is not a valid number in JSON");
}

- (void)testNegativeInfinity {
    NSArray *obj = [NSArray arrayWithObject:[NSNumber numberWithDouble:-INFINITY]];
    
    STAssertNil([writer stringWithObject:obj], nil);
    SBAssertStringContains(parser.error, @"Infinity is not a valid number in JSON");
}

- (void)testNaN {
    NSArray *obj = [NSArray arrayWithObject:[NSDecimalNumber notANumber]];
    
    STAssertNil([writer stringWithObject:obj], nil);
    SBAssertStringContains(parser.error, @"NaN is not a valid number in JSON");
}

- (void)testNil {
    STAssertNil([parser objectWithString:nil], nil);
    STAssertEqualObjects(parser.error, @"Input was 'nil'", nil);
    
    STAssertNil([writer stringWithObject:nil], nil);
    SBAssertStringContains(parser.error, @"Input was 'nil'");
    
}

- (void)testWriteDepth {
    writer.maxDepth = 2;
    
    NSArray *a1 = [NSArray array];
    NSArray *a2 = [NSArray arrayWithObject:a1];
    STAssertNotNil([writer stringWithObject:a2], nil);
    
    NSArray *a3 = [NSArray arrayWithObject:a2];
    STAssertNil([writer stringWithObject:a3], nil);
    STAssertEqualObjects(writer.error, @"Nested too deep", writer.error);
}

@end
