//
//  HTTPPNGResponse.m
//  iWebDriver
//
//  Copyright 2009 Google Inc.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

#import "HTTPPNGResponse.h"
#import "NSData+Base64.h"

@implementation HTTPPNGResponse

- (id)initWithImage:(UIImage *)image {
  NSData *imageData = UIImagePNGRepresentation(image);
  NSString *encodedImageString = [imageData base64EncodedString];
  NSData *encodedImageData = [encodedImageString dataUsingEncoding:NSUTF8StringEncoding];
  NSLog(@"Sending PNG image of size %d bytes", [encodedImageData length]);
  return [super initWithData:encodedImageData];
}

- (NSString *) contentType {
  return @"image/png";
}

@end
