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

#include "CommandHandlerRepository.h"

#include "command_types.h"
#include "logging.h"

#include "CommandHandlers/AcceptAlertCommandHandler.h"
#include "CommandHandlers/ActionsCommandHandler.h"
#include "CommandHandlers/AddCookieCommandHandler.h"
#include "CommandHandlers/ClickElementCommandHandler.h"
#include "CommandHandlers/ClearElementCommandHandler.h"
#include "CommandHandlers/CloseWindowCommandHandler.h"
#include "CommandHandlers/CreateNewWindowCommandHandler.h"
#include "CommandHandlers/DeleteAllCookiesCommandHandler.h"
#include "CommandHandlers/DeleteCookieCommandHandler.h"
#include "CommandHandlers/DismissAlertCommandHandler.h"
#include "CommandHandlers/ElementEqualsCommandHandler.h"
#include "CommandHandlers/ExecuteAsyncScriptCommandHandler.h"
#include "CommandHandlers/ExecuteScriptCommandHandler.h"
#include "CommandHandlers/FindChildElementCommandHandler.h"
#include "CommandHandlers/FindChildElementsCommandHandler.h"
#include "CommandHandlers/FindElementCommandHandler.h"
#include "CommandHandlers/FindElementsCommandHandler.h"
#include "CommandHandlers/FullScreenWindowCommandHandler.h"
#include "CommandHandlers/GetActiveElementCommandHandler.h"
#include "CommandHandlers/GetAlertTextCommandHandler.h"
#include "CommandHandlers/GetAllCookiesCommandHandler.h"
#include "CommandHandlers/GetAllWindowHandlesCommandHandler.h"
#include "CommandHandlers/GetCurrentUrlCommandHandler.h"
#include "CommandHandlers/GetCurrentWindowHandleCommandHandler.h"
#include "CommandHandlers/GetElementAttributeCommandHandler.h"
#include "CommandHandlers/GetElementPropertyCommandHandler.h"
#include "CommandHandlers/GetElementRectCommandHandler.h"
#include "CommandHandlers/GetElementTagNameCommandHandler.h"
#include "CommandHandlers/GetElementTextCommandHandler.h"
#include "CommandHandlers/GetElementValueOfCssPropertyCommandHandler.h"
#include "CommandHandlers/GetNamedCookieCommandHandler.h"
#include "CommandHandlers/GetSessionCapabilitiesCommandHandler.h"
#include "CommandHandlers/GetPageSourceCommandHandler.h"
#include "CommandHandlers/GetTimeoutsCommandHandler.h"
#include "CommandHandlers/GetTitleCommandHandler.h"
#include "CommandHandlers/GetWindowRectCommandHandler.h"
#include "CommandHandlers/GoBackCommandHandler.h"
#include "CommandHandlers/GoForwardCommandHandler.h"
#include "CommandHandlers/GoToUrlCommandHandler.h"
#include "CommandHandlers/IsElementDisplayedCommandHandler.h"
#include "CommandHandlers/IsElementEnabledCommandHandler.h"
#include "CommandHandlers/IsElementSelectedCommandHandler.h"
#include "CommandHandlers/MinimizeWindowCommandHandler.h"
#include "CommandHandlers/MaximizeWindowCommandHandler.h"
#include "CommandHandlers/NewSessionCommandHandler.h"
#include "CommandHandlers/QuitCommandHandler.h"
#include "CommandHandlers/RefreshCommandHandler.h"
#include "CommandHandlers/ReleaseActionsCommandHandler.h"
#include "CommandHandlers/ScreenshotCommandHandler.h"
#include "CommandHandlers/ScreenshotElementCommandHandler.h"
#include "CommandHandlers/SendKeysCommandHandler.h"
#include "CommandHandlers/SendKeysToAlertCommandHandler.h"
#include "CommandHandlers/SetAlertCredentialsCommandHandler.h"
#include "CommandHandlers/SetTimeoutsCommandHandler.h"
#include "CommandHandlers/SetWindowRectCommandHandler.h"
#include "CommandHandlers/SwitchToFrameCommandHandler.h"
#include "CommandHandlers/SwitchToParentFrameCommandHandler.h"
#include "CommandHandlers/SwitchToWindowCommandHandler.h"
#include "IECommandHandler.h"

namespace webdriver {

CommandHandlerRepository::CommandHandlerRepository(void) {
  this->PopulateCommandHandlers();
}

CommandHandlerRepository::~CommandHandlerRepository(void) {
}

bool CommandHandlerRepository::IsValidCommand(const std::string& command_name) {
  CommandHandlerMap::const_iterator found_iterator =
    this->command_handlers_.find(command_name);

  return found_iterator != this->command_handlers_.end();
}

CommandHandlerHandle CommandHandlerRepository::GetCommandHandler(const std::string& command_name) {
  CommandHandlerMap::const_iterator found_iterator =
    this->command_handlers_.find(command_name);
  
  if (found_iterator == this->command_handlers_.end()) {
    return NULL;
  }

  return found_iterator->second;
}

void CommandHandlerRepository::PopulateCommandHandlers() {
  LOG(TRACE) << "Entering CommandHandlerRepository::PopulateCommandHandlers";

  this->command_handlers_[webdriver::CommandType::NoCommand] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[webdriver::CommandType::NewSession] = CommandHandlerHandle(new NewSessionCommandHandler);
  this->command_handlers_[webdriver::CommandType::Quit] = CommandHandlerHandle(new QuitCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetTimeouts] = CommandHandlerHandle(new GetTimeoutsCommandHandler);
  this->command_handlers_[webdriver::CommandType::SetTimeouts] = CommandHandlerHandle(new SetTimeoutsCommandHandler);
  this->command_handlers_[webdriver::CommandType::Get] = CommandHandlerHandle(new GoToUrlCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetCurrentUrl] = CommandHandlerHandle(new GetCurrentUrlCommandHandler);
  this->command_handlers_[webdriver::CommandType::GoBack] = CommandHandlerHandle(new GoBackCommandHandler);
  this->command_handlers_[webdriver::CommandType::GoForward] = CommandHandlerHandle(new GoForwardCommandHandler);
  this->command_handlers_[webdriver::CommandType::Refresh] = CommandHandlerHandle(new RefreshCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetTitle] = CommandHandlerHandle(new GetTitleCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetCurrentWindowHandle] = CommandHandlerHandle(new GetCurrentWindowHandleCommandHandler);
  this->command_handlers_[webdriver::CommandType::CloseWindow] = CommandHandlerHandle(new CloseWindowCommandHandler);
  this->command_handlers_[webdriver::CommandType::SwitchToWindow] = CommandHandlerHandle(new SwitchToWindowCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetWindowHandles] = CommandHandlerHandle(new GetAllWindowHandlesCommandHandler);
  this->command_handlers_[webdriver::CommandType::NewWindow] = CommandHandlerHandle(new CreateNewWindowCommandHandler);
  this->command_handlers_[webdriver::CommandType::SwitchToFrame] = CommandHandlerHandle(new SwitchToFrameCommandHandler);
  this->command_handlers_[webdriver::CommandType::SwitchToParentFrame] = CommandHandlerHandle(new SwitchToParentFrameCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetWindowRect] = CommandHandlerHandle(new GetWindowRectCommandHandler);
  this->command_handlers_[webdriver::CommandType::SetWindowRect] = CommandHandlerHandle(new SetWindowRectCommandHandler);
  this->command_handlers_[webdriver::CommandType::MaximizeWindow] = CommandHandlerHandle(new MaximizeWindowCommandHandler);
  this->command_handlers_[webdriver::CommandType::MinimizeWindow] = CommandHandlerHandle(new MinimizeWindowCommandHandler);
  this->command_handlers_[webdriver::CommandType::FullscreenWindow] = CommandHandlerHandle(new FullScreenWindowCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetActiveElement] = CommandHandlerHandle(new GetActiveElementCommandHandler);
  this->command_handlers_[webdriver::CommandType::FindElement] = CommandHandlerHandle(new FindElementCommandHandler);
  this->command_handlers_[webdriver::CommandType::FindElements] = CommandHandlerHandle(new FindElementsCommandHandler);
  this->command_handlers_[webdriver::CommandType::FindChildElement] = CommandHandlerHandle(new FindChildElementCommandHandler);
  this->command_handlers_[webdriver::CommandType::FindChildElements] = CommandHandlerHandle(new FindChildElementsCommandHandler);
  this->command_handlers_[webdriver::CommandType::IsElementSelected] = CommandHandlerHandle(new IsElementSelectedCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetElementAttribute] = CommandHandlerHandle(new GetElementAttributeCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetElementProperty] = CommandHandlerHandle(new GetElementPropertyCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetElementValueOfCssProperty] = CommandHandlerHandle(new GetElementValueOfCssPropertyCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetElementText] = CommandHandlerHandle(new GetElementTextCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetElementTagName] = CommandHandlerHandle(new GetElementTagNameCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetElementRect] = CommandHandlerHandle(new GetElementRectCommandHandler);
  this->command_handlers_[webdriver::CommandType::IsElementEnabled] = CommandHandlerHandle(new IsElementEnabledCommandHandler);
  this->command_handlers_[webdriver::CommandType::ClickElement] = CommandHandlerHandle(new ClickElementCommandHandler);
  this->command_handlers_[webdriver::CommandType::ClearElement] = CommandHandlerHandle(new ClearElementCommandHandler);
  this->command_handlers_[webdriver::CommandType::SendKeysToElement] = CommandHandlerHandle(new SendKeysCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetPageSource] = CommandHandlerHandle(new GetPageSourceCommandHandler);
  this->command_handlers_[webdriver::CommandType::ExecuteScript] = CommandHandlerHandle(new ExecuteScriptCommandHandler);
  this->command_handlers_[webdriver::CommandType::ExecuteAsyncScript] = CommandHandlerHandle(new ExecuteAsyncScriptCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetAllCookies] = CommandHandlerHandle(new GetAllCookiesCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetNamedCookie] = CommandHandlerHandle(new GetNamedCookieCommandHandler);
  this->command_handlers_[webdriver::CommandType::AddCookie] = CommandHandlerHandle(new AddCookieCommandHandler);
  this->command_handlers_[webdriver::CommandType::DeleteNamedCookie] = CommandHandlerHandle(new DeleteCookieCommandHandler);
  this->command_handlers_[webdriver::CommandType::DeleteAllCookies] = CommandHandlerHandle(new DeleteAllCookiesCommandHandler);
  this->command_handlers_[webdriver::CommandType::Actions] = CommandHandlerHandle(new ActionsCommandHandler);
  this->command_handlers_[webdriver::CommandType::ReleaseActions] = CommandHandlerHandle(new ReleaseActionsCommandHandler);
  this->command_handlers_[webdriver::CommandType::DismissAlert] = CommandHandlerHandle(new DismissAlertCommandHandler);
  this->command_handlers_[webdriver::CommandType::AcceptAlert] = CommandHandlerHandle(new AcceptAlertCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetAlertText] = CommandHandlerHandle(new GetAlertTextCommandHandler);
  this->command_handlers_[webdriver::CommandType::SendKeysToAlert] = CommandHandlerHandle(new SendKeysToAlertCommandHandler);
  this->command_handlers_[webdriver::CommandType::Screenshot] = CommandHandlerHandle(new ScreenshotCommandHandler);
  this->command_handlers_[webdriver::CommandType::ElementScreenshot] = CommandHandlerHandle(new ScreenshotElementCommandHandler);

  // Additional commands required to be supported, but not defined
  // in the specification.
  this->command_handlers_[webdriver::CommandType::SetAlertCredentials] = CommandHandlerHandle(new SetAlertCredentialsCommandHandler);
  this->command_handlers_[webdriver::CommandType::IsElementDisplayed] = CommandHandlerHandle(new IsElementDisplayedCommandHandler);
  this->command_handlers_[webdriver::CommandType::ElementEquals] = CommandHandlerHandle(new ElementEqualsCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetSessionCapabilities] = CommandHandlerHandle(new GetSessionCapabilitiesCommandHandler);

  // Commands intercepted by the server before reaching the command executor
  this->command_handlers_[webdriver::CommandType::Status] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[webdriver::CommandType::GetSessionList] = CommandHandlerHandle(new IECommandHandler);
}

} // namespace webdriver
