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

#include <string>
#include <vector>

namespace webdriver {

enum HookCommunicationType {
  OneWay = 0,
  TwoWay = 1
};

struct HookSettings {
  std::string hook_procedure_name;
  int hook_procedure_type;
  HookCommunicationType communication_type;
  HWND window_handle;
};

class HookProcessor {
 public:
  HookProcessor(void);
  virtual ~HookProcessor(void);

  static int GetDataBufferSize(void);
  static void SetDataBufferSize(int size);
  static void* GetDataBufferAddress(void);

  static int GetEventCount(void);
  static void ResetEventCount(void);
  static void IncrementEventCount(int increment);

  static void ResetFlag(void);
  static bool GetFlagValue(void);
  static void SetFlagValue(bool flag_value);

  static void CopyDataToBuffer(int source_data_size, void* source);
  static void CopyDataFromBuffer(int destination_data_size, void* destination);
  static void CopyWStringToBuffer(const std::wstring& data);
  static std::wstring CopyWStringFromBuffer(void);

  static void WriteBufferToPipe(const int process_id);

  bool CanSetWindowsHook(HWND window_handle);
  void Initialize(const HookSettings& settings);
  void Initialize(const std::string& hook_proc_name, const int hook_proc_type);
  void Dispose(void);

  bool PushData(int data_size,
                void* pointer_to_data);
  bool PushData(const std::wstring& data);

  int PullData(std::vector<char>* data);
  int PullData(std::wstring data);

 private:
  static void ClearBuffer(void);

  void CreateReturnPipe(void);
  bool InstallWindowsHook(const std::string& hook_proc_name,
                          const int hook_proc_type);
  void UninstallWindowsHook(void);
  bool Is64BitProcess(HANDLE process_handle);

  HookCommunicationType communication_type_;
  HWND window_handle_;
  HHOOK hook_procedure_handle_;
  HANDLE pipe_handle_;
};

} // namespace webdriver

#endif // WEBDRIVER_HOOKPROCESSOR_H_

