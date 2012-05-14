/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

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

package org.openqa.grid.internal.listeners;

import java.util.Map;

public interface Prioritizer {

  /**
   * priority of a is lower than b : compare(a,b) > 0
   * <p/>
   * priority of b is lower than a : compare(a,b) < 0
   * <p/>
   * a and b have the same priority : compare(a,b) = 0
   * 
   * @param a
   * @param b
   * @return a negative number is a is less important than b, a positive number is a is more
   *         important than b, 0 if a and b are equally as important.
   */
  public int compareTo(Map<String, Object> a, Map<String, Object> b);
}
