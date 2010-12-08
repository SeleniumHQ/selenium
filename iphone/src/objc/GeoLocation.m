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

#import "GeoLocation.h"

@implementation CLLocation (Synthesize)

- (CLLocationCoordinate2D)coordinate {
  GeoLocation *locStorage = [GeoLocation sharedManager];
  return [locStorage getCoordinate];
}

- (CLLocationDistance)altitude {
  GeoLocation *locStorage = [GeoLocation sharedManager];
  return [locStorage getAltitude];
}

@end

@implementation GeoLocation

- (CLLocationCoordinate2D)getCoordinate {
  return coordinate_;
}

- (CLLocationDistance)getAltitude {
  return altitude_;
}

- (void)setCoordinate:(CLLocationDegrees)longitude 
             latitude:(CLLocationDegrees)latitude {
  coordinate_.longitude = longitude;
  coordinate_.latitude = latitude;
}

- (void)setAltitude:(CLLocationDistance)altitude {
  altitude_ = altitude;
}

static GeoLocation *sharedLocationStorage = nil;

+ (GeoLocation *)sharedManager {
  @synchronized(self) {
    if (!sharedLocationStorage) {
      [[self alloc] init];
    }
  }
  return sharedLocationStorage;
}

+ (id)allocWithZone:(NSZone *)zone {
  @synchronized(self) {
    if (!sharedLocationStorage) {
      return [super allocWithZone:zone];
    }
  }
  return sharedLocationStorage;
}

- (id)init {
  Class myClass = [self class];
  @synchronized(myClass) {
    if (!sharedLocationStorage) {
      if (self = [super init]) {
        sharedLocationStorage = self;
        coordinate_.latitude = 0.0f;
        coordinate_.longitude = 0.0f;
        altitude_ = 0.0f;
      }
    }
  }
  return sharedLocationStorage;
}

- (id)copyWithZone:(NSZone *)zone {
  return self;
}

- (id)retain {
  return self;
}

- (unsigned)retainCount {
  return UINT_MAX;
}

- (void)release {
}

- (id)autorelease {
  return self;
}

@end
