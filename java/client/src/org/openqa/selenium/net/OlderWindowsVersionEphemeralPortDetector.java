package org.openqa.selenium.net;

/*
Copyright 2011 Selenium committers

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

public class OlderWindowsVersionEphemeralPortDetector implements EphemeralPortRangeDetector
{
  public int getLowestEphemeralPort() {
    // This could read the registry to get effective values
    return 1025;
  }

  public int getHighestEphemeralPort() {
    return 5000;
  }
}
