/*
 Copyright (C) 2009-2010 Stig Brautaset. All rights reserved.
 
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:
 
 * Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.
 
 * Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.
 
 * Neither the name of the author nor the names of its contributors may be used
   to endorse or promote products derived from this software without specific
   prior written permission.
 
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
 FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

#import <SenTestingKit/SenTestingKit.h>
#import <SBJson/SBJson.h>

#pragma mark Helper objects

@interface True : NSObject
@end

@implementation True
- (id)proxyForJson {
    return [NSNumber numberWithBool:YES];
}
@end

@interface False : NSObject
@end

@implementation False
- (id)proxyForJson {
    return [NSNumber numberWithBool:NO];
}
@end

@interface Bool : NSObject
@end

@implementation Bool
- (id)proxyForJson {
    return [NSArray arrayWithObjects:[True new], [False new], nil];
}
@end

@implementation NSDate (Private)
- (id)proxyForJson {
    return [NSArray arrayWithObject:[self description]];
}
@end

#pragma mark Tests

@interface ProxyTest : SenTestCase {
	SBJsonWriter * writer;
}
@end


@implementation ProxyTest

- (void)setUp {
    writer = [SBJsonWriter new];
}

- (void)testUnsupportedWithoutProxy {
    STAssertNil([writer stringWithObject:[NSArray arrayWithObject:[NSObject new]]], nil);
	STAssertEqualObjects(writer.error, @"JSON serialisation not supported for NSObject", nil);
}

- (void)testUnsupportedWithProxy {
    STAssertEqualObjects([writer stringWithObject:[NSArray arrayWithObject:[True new]]], @"[true]", nil);
}

- (void)testUnsupportedWithProxyWithoutWrapper {
    STAssertNil([writer stringWithObject:[True new]], nil);
}

- (void)testUnsupportedWithNestedProxy {
    STAssertEqualObjects([writer stringWithObject:[NSArray arrayWithObject:[Bool new]]], @"[[true,false]]", nil);
}

- (void)testUnsupportedWithProxyAsCategory {
    STAssertNotNil([writer stringWithObject:[NSArray arrayWithObject:[NSDate date]]], nil);
}

- (void)testUnsupportedWithProxyAsCategoryWithoutWrapper {
    STAssertNotNil([writer stringWithObject:[NSDate date]], nil);
}


@end
