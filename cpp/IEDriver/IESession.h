// Copyright 2011 Software Freedom Conservancy
// Licensed under the Apache License, Version 2.0 (the "License");
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

#ifndef WEBDRIVER_IE_IESESSION_H_
#define WEBDRIVER_IE_IESESSION_H_

#include "session.h"

#define MUTEX_NAME L"WD_INITIALIZATION_MUTEX"
#define MUTEX_WAIT_TIMEOUT 30000

using namespace std;

namespace webdriver {

class IESession : public Session {
public:
  IESession();
  virtual ~IESession(void);

  void Initialize(void* init_params);
  void ShutDown(void);
  bool ExecuteCommand(const std::string& serialized_command,
                      std::string* serialized_response);

private:
  HWND executor_window_handle_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_IESESSION_H_

