/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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
package org.openqa.selenium.interactions.touch;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.openqa.selenium.interactions.touch.TouchDoubleTapTest;
import org.openqa.selenium.interactions.touch.TouchFlickTest;
import org.openqa.selenium.interactions.touch.TouchLongPressTest;
import org.openqa.selenium.interactions.touch.TouchScrollTest;
import org.openqa.selenium.interactions.touch.TouchSingleTapTest;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    TouchDoubleTapTest.class,
    TouchFlickTest.class,
    TouchLongPressTest.class,
    TouchScrollTest.class,
    TouchSingleTapTest.class
})
public class TouchTests {
}
