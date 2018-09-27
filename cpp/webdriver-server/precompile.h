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

#ifndef WEBDRIVER_SERVER_PRECOMPILE_H_
#define WEBDRIVER_SERVER_PRECOMPILE_H_

#if defined(_WIN32) && !defined(__SYMBIAN32__)  // Windows specific
#ifndef WINVER
#define WINVER 0x0501  // Minimum target of Windows XP
#endif

#ifndef _WIN32_WINNT
#define _WIN32_WINNT 0x0501  // Minimum target of Windows XP
#endif

#ifndef _WIN32_WINDOWS
#define _WIN32_WINDOWS 0x0501  // Minimum target of Windows XP
#endif

#define WINDOWS
#else
// TODO(JimEvans): Add non-Windows includes here
#endif

// A macro to disallow the copy constructor and operator= functions
// This should be used in the private: declarations for a class
#define DISALLOW_COPY_AND_ASSIGN(TypeName) \
  TypeName(const TypeName&);               \
  void operator=(const TypeName&)

#endif  // WEBDRIVER_SERVER_PRECOMPILE_H_
