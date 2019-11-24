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

#ifndef WEBDRIVER_IE_SENDKEYSCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SENDKEYSCOMMANDHANDLER_H_

#include "../IECommandHandler.h"

struct IUIAutomation;
struct IUIAutomationElement;
struct IUIAutomationElementArray;

namespace webdriver {

class SendKeysCommandHandler : public IECommandHandler {
 public:
  struct FileNameData {
    HWND main;
    HWND hwnd;
    DWORD ieProcId;
    DWORD dialogTimeout;
    bool useLegacyDialogHandling;
    const wchar_t* text;
  };

  SendKeysCommandHandler(void);
  virtual ~SendKeysCommandHandler(void);

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const ParametersMap& command_parameters,
                       Response* response);
 private:
  static unsigned int WINAPI SetFileValue(void *file_data);
  static bool SendFileNameKeys(FileNameData* file_data);
  static bool GetFileSelectionDialogCandidates(std::vector<HWND> parent_window_handles,
                                               IUIAutomation* ui_automation,
                                               IUIAutomationElementArray** dialog_candidates);
  static bool FillFileName(const wchar_t* file_name,
                           IUIAutomation* ui_automation,
                           IUIAutomationElement* file_selection_dialog);
  static bool AcceptFileSelection(IUIAutomation* ui_automation,
                                  IUIAutomationElement* file_selection_dialog);
  static bool WaitForFileSelectionDialogClose(const int timeout,
                                              IUIAutomationElement* file_selection_dialog);
  static bool FindFileSelectionErrorDialog(IUIAutomation* ui_automation,
                                           IUIAutomationElement* file_selection_dialog,
                                           IUIAutomationElement** error_dialog);
  static bool DismissFileSelectionErrorDialog(IUIAutomation* ui_automation,
                                              IUIAutomationElement* error_dialog);
  static bool DismissFileSelectionDialog(IUIAutomation* ui_automation,
                                         IUIAutomationElement* file_selection_dialog);

  static bool LegacySelectFile(FileNameData* file_data);
  static bool LegacySendKeysToFileUploadAlert(HWND dialog_window_handle,
                                              const wchar_t* value);

  static BOOL CALLBACK FindWindowWithClassNameAndProcess(HWND hwnd,
                                                         LPARAM arg);

  static std::vector<HWND> FindWindowCandidates(FileNameData* file_data);

  void UploadFile(BrowserHandle browser_wrapper,
                  ElementHandle element,
                  const IECommandExecutor& executor,
                  const std::wstring& file_name,
                  Response* response);
  bool IsFileUploadElement(ElementHandle element_wrapper);
  bool HasMultipleAttribute(ElementHandle element_wrapper);
  bool IsElementInteractable(ElementHandle element_wrapper,
                             std::string* error_description);
  bool WaitUntilElementFocused(ElementHandle element_wrapper);
  bool VerifyPageHasFocus(BrowserHandle browser_wrapper);
  bool SetInsertionPoint(IHTMLElement* element);
  bool IsContentEditable(IHTMLElement* element);
  void SetElementFocus(IHTMLElement* element);
  Json::Value CreateActionSequencePayload(const IECommandExecutor& executor,
                                          std::wstring* keys);

  static std::wstring error_text;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SENDKEYSCOMMANDHANDLER_H_
