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

package org.openqa.grid.common.exception;

import java.util.Map;

public class CapabilityNotPresentOnTheGridException extends GridException {

  private static final long serialVersionUID = -5382151149204616537L;

  public CapabilityNotPresentOnTheGridException(String msg) {
    super(msg);
  }

  public CapabilityNotPresentOnTheGridException(Map<String, Object> capabilities) {
    super("cannot find : " + capabilities);
  }
}
