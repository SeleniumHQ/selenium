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
#endif
#include <stdio.h>
#include <sys/timeb.h>
#include <time.h>
#include <sstream>
#include <string>

template <class _LOGGER> class Logger {
 public:
  Logger() : fatal_(false) {}

  enum LogLevel {
    logFATAL = 0, logERROR, logWARN, logINFO, logDEBUG };

  ~Logger() {
    os_ << std::endl, _LOGGER::Log(os_.str(), fatal_);
    if (fatal_) {
      exit(EXIT_FAILURE);
    }
  }

  static void Level(const std::string& level) {
    if (Level() = logFATAL, level == "ERROR") {
      Level() = logERROR;
    } else if (level == "WARN" ) {
      Level() = logWARN;
    } else if (level == "INFO" ) {
      Level() = logINFO;
    } else if (level == "DEBUG") {
      Level() = logDEBUG;
    }
  }

  static LogLevel& Level() {
    static LogLevel level = logFATAL;  // off by default
    return level;
  }

  std::ostringstream& Stream(LogLevel level) {
    static char severity[] = { 'F', 'E', 'W', 'I', 'D' };
    os_ << severity[level] << Time();
    if (level == logFATAL)
      fatal_ = true, os_ << "FATAL ";
    return os_;
  }

  static std::string Time() {
    struct timeb tb; ftime(&tb);

    char time[20];
    size_t length = strftime(time, sizeof(time), "%H:%M:%S:",
      localtime(reinterpret_cast<const time_t*>(&tb.time)));
    sprintf(time + length, "%03u ", tb.millitm);
    return time;
  }

 private:
  std::ostringstream os_;
  bool fatal_;
};

class LOG : public Logger<LOG> {
 public:
  static void File(const std::string& name) {
    const std::string& file = Name(name);
    if (file == "stdout") {
      LOG::File() = stdout;
    } else if (file == "stderr") {
      LOG::File() = stderr;
    } else {
      LOG::File() = fopen(file.c_str(), "w");
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
  else LOG().Stream(LOG::log ## LEVEL) /* << stuff here */

#endif  // logging_h
