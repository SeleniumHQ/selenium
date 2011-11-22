//
//  DisplayPrettyController.m
//  DisplayPretty
//
//  Created by Stig Brautaset on 25/05/2011.
//  Copyright 2011 Stig Brautaset. All rights reserved.
//

#import "DisplayPrettyController.h"
#import <SBJson/SBJson.h>

@implementation DisplayPrettyController

- (id)init
{
    self = [super init];
    if (self) {
        _parser = [[SBJsonParser alloc] init];
        _writer = [[SBJsonWriter alloc] init];
        _writer.humanReadable = YES;
        _writer.sortKeys = YES;
    }    
    return self;
}

- (void)dealloc
{
    [_parser release];
    [_writer release];
    [super dealloc];
}

- (IBAction)formatText:(id)sender {
    id object = [_parser objectWithString:[_source stringValue]];
    if (object) {
        [_formatted setStringValue:[_writer stringWithObject:object]];
    } else {
        [_formatted setStringValue:[NSString stringWithFormat:@"An error occurred: %@", _parser.error]];
    }
    
}

@end
