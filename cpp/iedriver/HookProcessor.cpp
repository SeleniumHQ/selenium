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

#include "HookProcessor.h"
#include "logging.h"

#define MAX_BUFFER_SIZE 32768

// Define a shared data segment.  Variables in this segment can be
// shared across processes that load this DLL.
#pragma data_seg("SHARED")
int data_buffer_size = MAX_BUFFER_SIZE;
char data_buffer[MAX_BUFFER_SIZE];
#pragma data_seg()

#pragma comment(linker, "/section:SHARED,RWS")

namespace webdriver {

class CopyDataHolderWindow : public CWindowImpl<CopyDataHolderWindow> {
 public:
  DECLARE_WND_CLASS(L"CopyDataHolderWindow")
  BEGIN_MSG_MAP(CopyDataHolderWindow)
  END_MSG_MAP()

  LRESULT CopyData(HWND destination_window_handle,
                   int data_size,
                   void* pointer_to_data) {
    if (data_size > data_buffer_size) {
      LOG(WARN) << "Destination data buffer not large enough";
    }
    
    // Copy the contents of local memory into a temporary structure
    // for transport across the process boundary.
    std::vector<char> buffer(data_size);
    memcpy_s(&buffer[0], data_size, pointer_to_data, data_size);

    // Send the data across using SendMessage with the WM_COPYDATA
    // message. N.B., the window procedure in the other process *must*
    // have a handler for the WM_COPYDATA message, which copies the 
    // content from the message payload into a local buffer. The
    // HookProcessor::CopyDataToBuffer method provides a common
    // implementation to copy the data into the shared buffer location.
    COPYDATASTRUCT data;
    data.dwData = 1;
    data.cbData = static_cast<int>(buffer.size());
    data.lpData = &buffer[0];
    LRESULT result = ::SendMessage(destination_window_handle,
                                   WM_COPYDATA,
                                   reinterpret_cast<WPARAM>(this->m_hWnd),
                                   reinterpret_cast<LPARAM>(&data));
    return result;
  }
};

HookProcessor::HookProcessor(HWND window_handle) {
  this->window_handle_ = window_handle;
}

HookProcessor::~HookProcessor(void) {
}

bool HookProcessor::InstallWindowsHook(const std::string& hook_proc_name,
                                       const int hook_proc_type) {
  LOG(TRACE) << "Entering HookProcessor::InstallWindowsHook";

  HINSTANCE instance_handle = _AtlBaseModule.GetModuleInstance();

  FARPROC hook_procedure_address = ::GetProcAddress(instance_handle,
                                                    hook_proc_name.c_str());
  if (hook_procedure_address == NULL) {
    LOGERR(WARN) << "Unable to get address of hook procedure named "
                 << hook_proc_name;
    return false;
  }
  HOOKPROC hook_procedure = reinterpret_cast<HOOKPROC>(hook_procedure_address);

  // Install the Windows hook.
  DWORD thread_id = 0;
  if (this->window_handle_ != NULL) {
    thread_id = ::GetWindowThreadProcessId(this->window_handle_, NULL);
  }
  this->hook_procedure_handle_ = ::SetWindowsHookEx(hook_proc_type,
                                                   hook_procedure,
                                                   instance_handle,
                                                   thread_id);
  if (this->hook_procedure_handle_ == NULL) {      
    LOGERR(WARN) << "Unable to set windows hook";
    return false;
  }
  return true;
}

void HookProcessor::UninstallWindowsHook() {
  LOG(TRACE) << "Entering HookProcessor::UninstallWindowsHook";
  if (this->hook_procedure_handle_ != NULL) {
    ::UnhookWindowsHookEx(this->hook_procedure_handle_);
  }
}

bool HookProcessor::PushData(int data_size,
                             void* pointer_to_data) {
  LOG(TRACE) << "Entering HookProcessor::PushData";
  if (this->hook_procedure_handle_ == NULL) {      
    LOG(WARN) << "No hook procedure has been set";
    return false;
  }
  CopyDataHolderWindow holder;
  holder.Create(/*HWND*/ HWND_MESSAGE,
                /*_U_RECT rect*/ CWindow::rcDefault,
                /*LPCTSTR szWindowName*/ NULL,
                /*DWORD dwStyle*/ NULL,
                /*DWORD dwExStyle*/ NULL,
                /*_U_MENUorID MenuOrID*/ 0U,
                /*LPVOID lpCreateParam*/ NULL);
  LRESULT result = holder.CopyData(this->window_handle_,
                                   data_size,
                                   pointer_to_data);
  LOG(INFO) << "SendMessage result? " << result;
  holder.DestroyWindow();
  return true;
}

int HookProcessor::GetDataBufferSize() {
  return data_buffer_size;
}

void HookProcessor::SetDataBufferSize(int size) {
  data_buffer_size = size;
}

void HookProcessor::CopyDataToBuffer(int source_data_size, void* source) {
  // clear the shared buffer before putting data into it
  ClearBuffer();
  if (source_data_size < data_buffer_size) {
    data_buffer_size = source_data_size;
  }
  memcpy_s(data_buffer,
           data_buffer_size,
           source,
           data_buffer_size);
}

void HookProcessor::CopyDataFromBuffer(int destination_data_size, void* destination) {
  if (data_buffer_size >= destination_data_size) {
    destination_data_size = data_buffer_size;
  }
  memcpy_s(destination, destination_data_size, data_buffer, destination_data_size); 
  // clear the shared buffer after taking data out of it.
  ClearBuffer();
}

void HookProcessor::ClearBuffer() {
  // Zero out the shared buffer
  data_buffer_size = MAX_BUFFER_SIZE;
  memset(data_buffer, 0, MAX_BUFFER_SIZE);
}

} // namespace webdriver
