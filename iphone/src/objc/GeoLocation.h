/*
 Copyright 2010 WebDriver committers
 Copyright 2010 Google Inc.
 
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

#import <CoreLocation/CoreLocation.h>

//  We redefine coordinate and altitude getters to emulate geo location
//  possition. it is the same if we do lazy swizzling
@interface CLLocation (Synthesize)
@end

// mock object (singleton) to keep fake geo positions
@interface GeoLocation : NSObject {
  CLLocationCoordinate2D coordinate_;
  CLLocationDistance altitude_;
}

+ (GeoLocation *)sharedManager;
- (CLLocationCoordinate2D)getCoordinate;
- (CLLocationDistance)getAltitude;
- (void)setCoordinate:(CLLocationDegrees)longitude 
              latitude:(CLLocationDegrees)latitude;
- (void)setAltitude:(CLLocationDistance)altitude;
@end
