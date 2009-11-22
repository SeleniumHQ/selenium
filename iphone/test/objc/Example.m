//
//  Example.m
//  iWebDriver
//
//  Created by Joseph Gentle on 12/3/08.
//  Copyright 2008 Google Inc. All rights reserved.
//

#import "GTMSenTestCase.h"


@interface Example : SenTestCase {
  
}

@end


@implementation Example

-(void) testExample {
  STAssertTrue(YES, @"foo!");
}

-(void) testExample2 {
//  STAssertTrue(NO, @"foo!");
}
@end
