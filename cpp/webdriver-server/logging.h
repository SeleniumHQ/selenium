/*
Licensed to the Software Freedom Conservancy (SFC) under one
or more contributor license agreements. See the NOTICE file
distributed with this work for additional information
regarding copyright ownership. The SFC licenses this file
to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

#ifndef logging_h
#define logging_h

#ifdef _WIN32
 #pragma warning(push)
 #pragma warning(disable:4996 4717)
 #define fileno _fileno
 #define isatty _isatty
 #define lseek _lseek
 #ifdef _ftime
  #define ftime _ftime
 #endif
#endif

#ifdef unix
 #include <sys/types.h>
 #include <unistd.h>
#else
 #include <io.h>
 #include <comdef.h>
#endif
#include <stdio.h>
#include <stdlib.h>
#include <sys/timeb.h>
#include <time.h>
#include <sstream>
#include <string>
#include <iostream>

template <class _LOGGER> class Logger {
 public:
  Logger() : fatal_(false) {}

  enum LogLevel {
    logFATAL = 0, logERROR, logWARN, logINFO, logDEBUG, logTRACE };

  ~Logger() {
    os_ << std::endl, _LOGGER::Log(os_.str(), fatal_);
    if (fatal_) {
      exit(EXIT_FAILURE);
    }
  }

  static void Level(const std::string& level) {
    Level() = ToLogLevel(level);
  }

  static LogLevel& Level() {
    static LogLevel level = GetLogLevelEnv();
    return level;
  }

  std::ostringstream& Stream(LogLevel level) {
    static char severity[] = { 'F', 'E', 'W', 'I', 'D', 'T' };
    os_ << severity[level] << ' ' << Time();
    if (level == logFATAL)
      fatal_ = true, os_ << L"FATAL ";
    return os_;
  }

  static std::string Time() {
    struct timeb tb; ftime(&tb);

    char time[26];
    size_t length = strftime(time, sizeof(time), "%Y-%m-%d %H:%M:%S:",
      localtime(reinterpret_cast<const time_t*>(&tb.time)));
    sprintf(time + length, "%03u ", tb.millitm);

    return time;
  }

 private:

  static LogLevel ToLogLevel(const std::string& level) {
    if (level == "ERROR") {
      return logERROR;
    } else if (level == "WARN" ) {
      return logWARN;
    } else if (level == "INFO" ) {
      return logINFO;
    } else if (level == "DEBUG") {
      return logDEBUG;
    } else if (level == "TRACE") {
      return logTRACE;
    } else {
      return logFATAL;
    }
  }

  static LogLevel GetLogLevelEnv() {
    char* tmp = getenv("SELENIUM_LOG_LEVEL");
    return tmp ? ToLogLevel(std::string(tmp)) : logFATAL;
  }

  std::ostringstream os_;
  bool fatal_;
};

class LOG : public Logger<LOG> {
 public:
  static void File(const std::string& name, const char* openMode = "w") {
    const std::string& file = Name(name);
    if (file == "stdout") {
	  LOG::File() = stdout;
    } else if (file == "stderr") {
      LOG::File() = stderr;
    } else {
      LOG::File() = fopen(file.c_str(), openMode);
    }
  }

  static void Limit(off_t size) {
    LOG::Limit() = size;
  }

 private:
  static std::string& Name(const std::string& name) {
    static std::string file_name = "stdout";
    if (!name.empty())
      file_name.assign(name);
    return file_name;
  }

  static FILE*& File() {
    static FILE* file = stdout;
    return file;
  }

  static off_t& Limit() {
    static off_t size_limit = 0;
    return size_limit;
  }

  static void Log(const std::string& str, bool fatal) {
    if (fatal) Limit() = 0;

    FILE* output = File();
    if (output) {
      fwrite(str.data(), sizeof(char), str.size(), output);
      fflush(output);

      if (Limit() && !isatty(fileno(output))) {
        if (lseek(fileno(output), 0, SEEK_END) > Limit()) {
          fclose(output), File("");
        }
      }
    }

    if (fatal && !isatty(fileno(output))) {
      fputs(str.c_str(), stderr);
    }
  }

  friend class Logger<LOG>;
};

#ifdef _WIN32
 #pragma warning(pop)
#endif


#define LOG(LEVEL)                        \
  if (LOG::log ## LEVEL > LOG::Level()) ; \
  else LOG().Stream(LOG::log ## LEVEL) << __FILE__ << "(" << __LINE__ << ") " /* << stuff here */

#ifdef _WIN32
  #define LOGHR(LEVEL,HR) LOG( ## LEVEL) << HR << " [" << (_bstr_t(_com_error((DWORD) HR).ErrorMessage())) << "]: "
  #define LOGERR(LEVEL) LOG( ## LEVEL) << " [Windows Error " << (::GetLastError()) << "]: "
  #define LOGWSTRING(STR) _bstr_t( (## STR).c_str())
#endif


#endif  // logging_h
