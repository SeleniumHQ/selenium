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
package org.openqa.selenium.support;

import org.openqa.selenium.support.events.EventFiringWebDriverTest;
import org.openqa.selenium.support.pagefactory.AjaxElementLocatorTest;
import org.openqa.selenium.support.pagefactory.AnnotationsTest;
import org.openqa.selenium.support.pagefactory.ByChainedTest;
import org.openqa.selenium.support.pagefactory.DefaultElementLocatorTest;
import org.openqa.selenium.support.pagefactory.DefaultFieldDecoratorTest;
import org.openqa.selenium.support.pagefactory.internal.LocatingElementHandlerTest;
import org.openqa.selenium.support.pagefactory.internal.LocatingElementListHandlerTest;
import org.openqa.selenium.support.ui.FluentWaitTest;
import org.openqa.selenium.support.ui.LoadableComponentTest;
import org.openqa.selenium.support.ui.SelectTest;
import org.openqa.selenium.support.ui.SlowLoadableComponentTest;
import org.openqa.selenium.support.ui.WebDriverWaitTest;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    AjaxElementLocatorTest.class,
    AnnotationsTest.class,
    ByChainedTest.class,
    ColorTest.class,
    DefaultElementLocatorTest.class,
    DefaultFieldDecoratorTest.class,
    EventFiringWebDriverTest.class,
    FluentWaitTest.class,
    LoadableComponentTest.class,
    LocatingElementHandlerTest.class,
    LocatingElementListHandlerTest.class,
    PageFactoryTest.class,
    SelectTest.class,
    SlowLoadableComponentTest.class,
    ThreadGuardTest.class,
    WebDriverWaitTest.class
})
public class SmallTests {}
