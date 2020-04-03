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

#ifndef WEBDRIVER_IE_SENDINPUTACTIONSIMULATOR_H_
#define WEBDRIVER_IE_SENDINPUTACTIONSIMULATOR_H_

#include "ActionSimulator.h"

namespace webdriver {

class SendInputActionSimulator : public ActionSimulator {
 public:
  SendInputActionSimulator(void);
  virtual ~SendInputActionSimulator(void);

  int SimulateActions(BrowserHandle browser_wrapper,
                      std::vector<INPUT> inputs,
                      InputState* input_state);

 private:
  void GetNormalizedCoordinates(HWND window_handle,
                                int x,
                                int y,
                                int* normalized_x,
                                int* normalized_y);
  unsigned long NormalizeButtons(bool is_button_swapped,
                                 unsigned long input_flags);

  bool WaitForInputEventProcessing(int input_count);
  void SendInputToBrowser(BrowserHandle browser_wrapper,
                          std::vector<INPUT> inputs,
                          int start_index,
                          int input_count);
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SENDINPUTACTIONSIMULATOR_H_
