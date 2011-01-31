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

import java.util.List;

import org.openqa.selenium.WebElement;

public class IndexOptionSelectStrategy implements OptionSelectStrategy {
    public boolean select(List<WebElement> fromOptions, String selectThis, boolean setSelected, boolean allowMultipleSelect) {
        try {
            int index = Integer.parseInt(selectThis);
            WebElement option = (WebElement) fromOptions.get(index);
            if (setSelected)
                option.setSelected();
            else if (option.isSelected()) {
                option.toggle();
            }
            return true;
        } catch (Exception e) {
            // Do nothing. Handled below
        }
        return false;
    }
}
