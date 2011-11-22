/*
 Copyright (C) 2011 Stig Brautaset. All rights reserved.

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

@interface FormatTest : JsonTestCase
@end

@implementation FormatTest

- (void)setUp {
    [super setUp];
    writer.humanReadable = YES;
    writer.sortKeys = YES;    
}


- (void)testString {
    [self foreachTestInSuite:@"Tests/Data/format" apply:^(NSString *inpath, NSString *outpath) {
        NSError *error = nil;
        NSString *input = [NSString stringWithContentsOfFile:inpath encoding:NSUTF8StringEncoding error:&error];
        STAssertNotNil(input, @"%@ - %@", inpath, error);

        NSString *output = [NSString stringWithContentsOfFile:outpath encoding:NSUTF8StringEncoding error:&error];
        STAssertNotNil(output, @"%@ - %@", outpath, error);

        id object = [parser objectWithString:input];
        STAssertNotNil(object, nil);

        NSString *json = [writer stringWithObject:object];
        STAssertNotNil(json, nil);

        json = [json stringByAppendingString:@"\n"];
        STAssertEqualObjects(json, output, nil);
    }];

    STAssertEquals(count, (NSUInteger)8, nil);
}

- (void)testData {
    [self foreachTestInSuite:@"Tests/Data/format" apply:^(NSString *inpath, NSString *outpath) {
        NSError *error = nil;
        NSData *input = [NSData dataWithContentsOfFile:inpath];
        STAssertNotNil(input, @"%@ - %@", inpath, error);

        id object = [parser objectWithData:input];
        STAssertNotNil(object, nil);

        NSData *json = [writer dataWithObject:object];
        STAssertNotNil(json, nil);

        NSData *output = [NSData dataWithContentsOfFile:outpath];
        STAssertNotNil(output, @"%@ - %@", outpath, error);

        output = [NSData dataWithBytes:output.bytes length:output.length-1];
        STAssertEqualObjects(json, output, nil);
    }];

    STAssertEquals(count, (NSUInteger)8, nil);
}

@end
