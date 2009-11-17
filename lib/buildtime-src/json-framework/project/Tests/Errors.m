//
//  Errors.m
//  JSON
//
//  Created by Stig Brautaset on 13/09/2007.
//  Copyright 2007 Stig Brautaset. All rights reserved.
//

#import "Errors.h"
#import <JSON/JSON.h>

// The ST guys sure like typing. Personally, I don't.
#define tn(expr, name) \
    STAssertThrowsSpecificNamed(expr, NSException, name, @"ieee!")

#define assertErrorContains(e, s) \
    STAssertTrue([[e localizedDescription] hasPrefix:s], @"%@", [e userInfo])

#define assertUnderlyingErrorContains(e, s) \
    STAssertTrue([[[[e userInfo] objectForKey:NSUnderlyingErrorKey] localizedDescription] hasPrefix:s], @"%@", [e userInfo])

@implementation Errors

- (void)setUp {
    json = [SBJSON new];
}

- (void)tearDown {
    [json release];
}

#pragma mark Generator

- (void)testUnsupportedObject
{
    NSError *error = nil;
    STAssertNil([json stringWithObject:[NSDate date] error:&error], nil);
    STAssertNotNil(error, nil);
}

- (void)testNonStringDictionaryKey
{
    NSArray *keys = [NSArray arrayWithObjects:[NSNull null],
                     [NSNumber numberWithInt:1],
                     [NSArray array],
                     [NSDictionary dictionary],
                     nil];
    
    for (int i = 0; i < [keys count]; i++) {
        NSError *error = nil;
        NSDictionary *object = [NSDictionary dictionaryWithObject:@"1" forKey:[keys objectAtIndex:i]];
        STAssertNil([json stringWithObject:object error:&error], nil);
        STAssertNotNil(error, nil);
    }
}


- (void)testScalar
{    
    NSArray *fragments = [NSArray arrayWithObjects:@"foo", @"", [NSNull null], [NSNumber numberWithInt:1], [NSNumber numberWithBool:YES], nil];
    for (int i = 0; i < [fragments count]; i++) {
        NSString *fragment = [fragments objectAtIndex:i];
        
        // We don't check the convenience category here, like we do for parsing,
        // because the category is explicitly on the NSArray and NSDictionary objects.
        // STAssertNil([fragment JSONRepresentation], nil);
        
        NSError *error = nil;
        STAssertNil([json stringWithObject:fragment error:&error], @"%@", fragment);
        assertErrorContains(error, @"Not valid type for JSON");
    }
}


#pragma mark Scanner

- (void)testArray {
    NSError *error;

    STAssertNil([json objectWithString:@"[1,,2]" error:&error], nil);
    assertErrorContains(error, @"Expected value");
    
    STAssertNil([json objectWithString:@"[1,,]" error:&error], nil);
    assertErrorContains(error, @"Expected value");

    STAssertNil([json objectWithString:@"[,1]" error:&error], nil);
    assertErrorContains(error, @"Expected value");


    STAssertNil([json objectWithString:@"[1,]" error:&error], nil);
    assertErrorContains(error, @"Trailing comma disallowed");
    
    
    STAssertNil([json objectWithString:@"[1" error:&error], nil);
    assertErrorContains(error, @"End of input while parsing array");
    
    STAssertNil([json objectWithString:@"[[]" error:&error], nil);
    assertErrorContains(error, @"End of input while parsing array");

    // See if seemingly-valid arrays have nasty elements
    STAssertNil([json objectWithString:@"[+1]" error:&error], nil);
    assertErrorContains(error, @"Expected value");
    assertUnderlyingErrorContains(error, @"Leading + disallowed");
}

- (void)testObject {
    NSError *error;

    STAssertNil([json objectWithString:@"{1" error:&error], nil);
    assertErrorContains(error, @"Object key string expected");
        
    STAssertNil([json objectWithString:@"{null" error:&error], nil);
    assertErrorContains(error, @"Object key string expected");
    
    STAssertNil([json objectWithString:@"{\"a\":1,,}" error:&error], nil);
    assertErrorContains(error, @"Object key string expected");
    
    STAssertNil([json objectWithString:@"{,\"a\":1}" error:&error], nil);
    assertErrorContains(error, @"Object key string expected");
    

    STAssertNil([json objectWithString:@"{\"a\"" error:&error], nil);
    assertErrorContains(error, @"Expected ':'");
    

    STAssertNil([json objectWithString:@"{\"a\":" error:&error], nil);
    assertErrorContains(error, @"Object value expected");
    
    STAssertNil([json objectWithString:@"{\"a\":," error:&error], nil);
    assertErrorContains(error, @"Object value expected");
    
    
    STAssertNil([json objectWithString:@"{\"a\":1,}" error:&error], nil);
    assertErrorContains(error, @"Trailing comma disallowed");
    
    
    STAssertNil([json objectWithString:@"{" error:&error], nil);
    assertErrorContains(error, @"End of input while parsing object");
    
    STAssertNil([json objectWithString:@"{\"a\":{}" error:&error], nil);
    assertErrorContains(error, @"End of input while parsing object");
}

- (void)testNumber {
    NSError *error;

    STAssertNil([json fragmentWithString:@"-" error:&error], nil);
    assertErrorContains(error, @"No digits after initial minus");
        
    STAssertNil([json fragmentWithString:@"+1" error:&error], nil);
    assertErrorContains(error, @"Leading + disallowed in number");

    STAssertNil([json fragmentWithString:@"01" error:&error], nil);
    assertErrorContains(error, @"Leading 0 disallowed in number");
    
    STAssertNil([json fragmentWithString:@"0." error:&error], nil);
    assertErrorContains(error, @"No digits after decimal point");
    
    
    STAssertNil([json fragmentWithString:@"1e" error:&error], nil);
    assertErrorContains(error, @"No digits after exponent");
    
    STAssertNil([json fragmentWithString:@"1e-" error:&error], nil);
    assertErrorContains(error, @"No digits after exponent");
    
    STAssertNil([json fragmentWithString:@"1e+" error:&error], nil);
    assertErrorContains(error, @"No digits after exponent");
}

- (void)testNull {
    NSError *error;
    
    STAssertNil([json fragmentWithString:@"nil" error:&error], nil);
    assertErrorContains(error, @"Expected 'null'");
}

- (void)testBool {
    NSError *error;
    
    STAssertNil([json fragmentWithString:@"truth" error:&error], nil);
    assertErrorContains(error, @"Expected 'true'");
    
    STAssertNil([json fragmentWithString:@"fake" error:&error], nil);
    assertErrorContains(error, @"Expected 'false'");
}    

- (void)testString {
    NSError *error;
    
    STAssertNil([json fragmentWithString:@"" error:&error], nil);
    assertErrorContains(error, @"Unexpected end of string");

    STAssertNil([json objectWithString:@"" error:&error], nil);
    assertErrorContains(error, @"Unexpected end of string");
    
    STAssertNil([json fragmentWithString:@"\"" error:&error], nil);
    assertErrorContains(error, @"Unescaped control character");
    
    STAssertNil([json fragmentWithString:@"\"foo" error:&error], nil);
    assertErrorContains(error, @"Unescaped control character");

    
    STAssertNil([json fragmentWithString:@"\"\\uD834foo\"" error:&error], nil);
    assertErrorContains(error, @"Broken unicode character");
    assertUnderlyingErrorContains(error, @"Missing low character");
        
    STAssertNil([json fragmentWithString:@"\"\\uD834\\u001E\"" error:&error], nil);
    assertErrorContains(error, @"Broken unicode character");
    assertUnderlyingErrorContains(error, @"Invalid low surrogate");
    
    STAssertNil([json fragmentWithString:@"\"\\uDD1Ef\"" error:&error], nil);
    assertErrorContains(error, @"Broken unicode character");
    assertUnderlyingErrorContains(error, @"Invalid high character");

    
    for (NSUInteger i = 0; i < 0x20; i++) {
        NSString *str = [NSString stringWithFormat:@"\"%C\"", i];
        STAssertNil([json fragmentWithString:str error:&error], nil);
        assertErrorContains(error, @"Unescaped control character");
    }
}

- (void)testObjectGarbage {
    NSError *error;

    STAssertNil([json objectWithString:@"'1'" error:&error], nil);
    assertErrorContains(error, @"Unrecognised leading character");
    
    STAssertNil([json objectWithString:@"'hello'" error:&error], nil);
    assertErrorContains(error, @"Unrecognised leading character");
    
    STAssertNil([json objectWithString:@"**" error:&error], nil);
    assertErrorContains(error, @"Unrecognised leading character");
    
    STAssertNil([json objectWithString:nil error:&error], nil);
    assertErrorContains(error, @"Input was 'nil'");
}

- (void)testFragmentGarbage {
    NSError *error;
    
    STAssertNil([json fragmentWithString:@"'1'" error:&error], nil);
    assertErrorContains(error, @"Unrecognised leading character");
    
    STAssertNil([json fragmentWithString:@"'hello'" error:&error], nil);
    assertErrorContains(error, @"Unrecognised leading character");
    
    STAssertNil([json fragmentWithString:@"**" error:&error], nil);
    assertErrorContains(error, @"Unrecognised leading character");
    
    STAssertNil([json fragmentWithString:nil error:&error], nil);
    assertErrorContains(error, @"Input was 'nil'");
}

- (void)testFragment
{    
    NSArray *fragments = [@"true false null 1 1.0 \"str\"" componentsSeparatedByString:@" "];
    for (int i = 0; i < [fragments count]; i++) {
        NSString *fragment = [fragments objectAtIndex:i];

        STAssertNil([fragment JSONValue], nil);
        
        NSError *error;
        STAssertNil([json objectWithString:fragment error:&error], fragment);
        assertErrorContains(error, @"Valid fragment");
    }
}

@end
