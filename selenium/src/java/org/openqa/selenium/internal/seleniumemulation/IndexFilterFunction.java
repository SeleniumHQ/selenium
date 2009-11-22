/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

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

package org.openqa.selenium.internal.seleniumemulation;

import java.util.Collections;
import java.util.List;

import com.thoughtworks.selenium.SeleniumException;
import org.openqa.selenium.WebElement;

public class IndexFilterFunction implements FilterFunction {
    public List<WebElement> filterElements(List<WebElement> allElements, String filterValue) {
        try {
            int index = Integer.parseInt(filterValue);
            if (allElements.size() > index)
                return Collections.singletonList(allElements.get(index));
        } catch (NumberFormatException e) {
            // Handled below
        }

        throw new SeleniumException("Element with index " + filterValue + " not found");
    }
}
