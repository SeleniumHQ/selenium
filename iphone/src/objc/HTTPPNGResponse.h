//
//  HTTPPNGResponse.h
//  iWebDriver
//
//  Copyright 2009 Google Inc.
//  Copyright 2011 Software Freedom Conservancy.
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

#import <Foundation/Foundation.h>
#import "HTTPDataResponse.h"

// |HTTPPNGResponse| wraps |HTTPDataResponse| for image data. It is used to
// return a PNG from an HTTP method.
// 
// Memory use is proportional to the size of the PNG of the object returned.
// Be careful returning very large images!
@interface HTTPPNGResponse : HTTPDataResponse {

}

- (id)initWithImage:(UIImage *)image;

@end
