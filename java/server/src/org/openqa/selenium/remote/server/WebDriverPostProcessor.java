package org.openqa.selenium.remote.server;
/*
Copyright 2011 WebDriver committers
Copyright 2011 Google Inc.

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

import org.openqa.selenium.WebDriver;

/**
 * Allows a plugin to transform/modify a standard WebDriver instance.
 * @author Kristian Rosenvold
 */
public interface WebDriverPostProcessor
{
    /**
     * Transforms/modifies the supplied webdriver instance into something modified/new.
     *
     * @param original  The original WebDriver instance that is source for the transformation.
     * @return A transformed webdriver instance which will be used instead of "original". May be the same instance as
     *         original.
     */
    WebDriver transform(WebDriver original);
}
