// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#ifndef WEBDRIVER_IE_ACTIONSIMULATOR_H_
#define WEBDRIVER_IE_ACTIONSIMULATOR_H_

#include <string>
#include <vector>

#include "../CustomTypes.h"
#include "../InputState.h"

namespace webdriver {

struct MouseExtraInfo {
  bool offset_specified;
  int offset_x;
  int offset_y;
  std::wstring element_id;
  IHTMLElement* element;
};

struct KeyboardExtraInfo {
  std::wstring character;
};

class ActionSimulator {

 public:
  ActionSimulator(void);
  virtual ~ActionSimulator();

  virtual bool UseExtraInfo(void) const { return false; }

  virtual int SimulateActions(BrowserHandle browser_wrapper,
                              std::vector<INPUT> inputs,
                              InputState* input_state) = 0;
  void UpdateInputState(INPUT current_input,
                        InputState* input_state);

};

} // namespace webdriver

#endif // WEBDRIVER_IE_ACTIONSIMULATOR_H_
