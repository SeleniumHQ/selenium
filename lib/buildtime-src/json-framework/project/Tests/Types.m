//
//  Types.m
//  JSON
//
//  Created by Stig Brautaset on 11/09/2007.
//  Copyright 2007 Stig Brautaset. All rights reserved.
//

#import "Types.h"
#import <JSON/JSON.h>

#define eq(x, y)        STAssertEquals(x, y, nil)
#define eqo(x, y)       STAssertEqualObjects(x, y, nil)

NSString *file(NSString *path) {
    NSString *content = [NSString stringWithContentsOfFile:path
                                                  encoding:NSASCIIStringEncoding
                                                     error:nil];
    assert(content);
    return [content substringToIndex:[content length]-1];
}

@implementation Types

- (void)testNull
{
    NSString *json = @"[null,null]";
    NSArray *nulls = [NSArray arrayWithObjects:[NSNull null], [NSNull null], nil];
    STAssertEqualObjects([json JSONValue], nulls, nil);
    STAssertEqualObjects([nulls JSONRepresentation], json, nil);
}

- (void)testBool
{
    NSString *json = @"[true,false]";
    NSArray *bools = [NSArray arrayWithObjects:[NSNumber numberWithBool:YES], [NSNumber numberWithBool:NO], nil];
    STAssertEqualObjects([json JSONValue], bools, nil);
    STAssertEqualObjects([bools JSONRepresentation], json, nil);
}

- (void)testNumbers
{
    NSDictionary *numbers = [file(@"Tests/types/number.plist") propertyList];
    NSEnumerator *iterator = [numbers keyEnumerator];
    
    for (NSString *number; number = [iterator nextObject]; ) {
        NSNumber *n = [number JSONFragmentValue];
        NSNumber *e = [numbers objectForKey:number];
        STAssertTrue([n isKindOfClass:[NSNumber class]], nil);
        STAssertEqualsWithAccuracy([n doubleValue], [e doubleValue], 1e-6, nil);
        
        // Numbers can be written in many different ways, so cannot always go back to the exact representation used.
        STAssertEqualsWithAccuracy([[[n JSONFragment] JSONFragmentValue] doubleValue], [e doubleValue], 1e-6, nil);
    }
}

- (void)testEscapedSlashes
{
    eqo([@"\"\\/test\\/path\"" JSONFragmentValue], @"/test/path");
    eqo([@"\"\\\\/test\\\\/path\"" JSONFragmentValue], @"\\/test\\/path");
}

- (void)testUnicodeEscapes
{
    NSDictionary *dict = [NSDictionary dictionaryWithObjectsAndKeys:
        // e-acute and greater-than-or-equal-to
        [NSString stringWithFormat:@"%C%C", 0xe9, 0x2265],  @"\"\\u00e9\\u2265\"",
        
        // e-acute and greater-than-or-equal-to, surrounded by 42
        [NSString stringWithFormat:@"42%C42%C42", 0xe9, 0x2265],  @"\"42\\u00e942\\u226542\"",

        // e-acute with upper-case hex
        [NSString stringWithFormat:@"%C", 0xe9],  @"\"\\u00E9\"",

        // G-clef (UTF16 surrogate pair)
        [NSString stringWithFormat:@"%C", 0x1D11E],  @"\"\\uD834\\uDD1E\"",

        nil];

    NSEnumerator *enumerator = [dict keyEnumerator];
    for (NSString *key; key = [enumerator nextObject]; ) {
        NSString *val = [dict objectForKey:key];
        eqo([key JSONFragmentValue], val);
        eqo([[val JSONFragment] JSONFragmentValue], val);
    }
}

- (void)testControlCharacters
{
    NSArray *array = [NSArray arrayWithObjects:
        @"\\u0000", @"\\u0001", @"\\u0002", @"\\u0003", @"\\u0004",
        @"\\u0005", @"\\u0006", @"\\u0007", @"\\b",     @"\\t",
        @"\\n",     @"\\u000b", @"\\f",     @"\\r",     @"\\u000e",
        @"\\u000f", @"\\u0010", @"\\u0011", @"\\u0012", @"\\u0013",
        @"\\u0014", @"\\u0015", @"\\u0016", @"\\u0017", @"\\u0018",
        @"\\u0019", @"\\u001a", @"\\u001b", @"\\u001c", @"\\u001d",
        @"\\u001e", @"\\u001f", @" ", nil];

    for (int i = 0; i < [array count]; i++) {
        id string = [NSString stringWithFormat:@"%C", (unichar)i];
        id fragment = [NSString stringWithFormat:@"\"%@\"", [array objectAtIndex:i]];
        eqo([string JSONFragment], fragment);
        eqo([fragment JSONFragmentValue], string);
    }
}

- (void)testString
{
    NSDictionary *strings = [file(@"Tests/types/string.plist") propertyList];
    NSEnumerator *iterator = [strings keyEnumerator];
    for (NSString *string; string = [iterator nextObject]; ) {
        NSString *expected = [strings objectForKey:string];
        id json = [string JSONFragmentValue];
        STAssertTrue([json isKindOfClass:[NSString class]], nil);
        STAssertEqualObjects(json, expected, nil);
        STAssertEqualObjects([expected JSONFragment], string, nil);
    }
}

- (void)testArray
{
    NSDictionary *dict = [file(@"Tests/types/array.plist") propertyList];
    NSEnumerator *enumerator = [dict keyEnumerator];
    for (NSString *jsonrep; jsonrep = [enumerator nextObject]; ) {
        id expected = [dict objectForKey:jsonrep];
        id json = [jsonrep JSONValue];
        STAssertTrue([json isKindOfClass:[expected class]], nil);
        STAssertEqualObjects(json, expected, nil);
        STAssertEqualObjects([expected JSONRepresentation], jsonrep, nil);
    }
}

- (void)testObject
{
    NSDictionary *dict = [file(@"Tests/types/object.plist") propertyList];
    NSEnumerator *enumerator = [dict keyEnumerator];
    for (NSString *jsonrep; jsonrep = [enumerator nextObject]; ) {
        id expected = [dict objectForKey:jsonrep];
        id json = [jsonrep JSONValue];
        STAssertTrue([json isKindOfClass:[expected class]], nil);
        STAssertEqualObjects(json, expected, nil);
        STAssertEqualObjects([expected JSONRepresentation], jsonrep, nil);
    }
}

@end
