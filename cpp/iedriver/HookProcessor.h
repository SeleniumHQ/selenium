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

#ifndef WEBDRIVER_HOOKPROCESSOR_H_
#define WEBDRIVER_HOOKPROCESSOR_H_

namespace webdriver {

class HookProcessor {
 public:
  HookProcessor(HWND window_handle);
  ~HookProcessor(void);

  static int GetDataBufferSize(void);
  static void SetDataBufferSize(int size);
  static void CopyDataToBuffer(int source_data_size, void* source);
  static void CopyDataFromBuffer(int destination_data_size, void* destination);
  
  bool InstallWindowsHook(const std::string& hook_proc_name,
                          const int hook_proc_type);
  void UninstallWindowsHook(void);
  bool PushData(int data_size,
                void* pointer_to_data);
 private:
  static void ClearBuffer(void);
  HWND window_handle_;
  HHOOK hook_procedure_handle_;
};

} // namespace webdriver

#endif // WEBDRIVER_HOOKPROCESSOR_H_

