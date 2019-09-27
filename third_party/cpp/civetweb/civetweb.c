/* Copyright (c) 2013-2018 the Civetweb developers
 * Copyright (c) 2004-2013 Sergey Lyubka
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

#if defined(__GNUC__) || defined(__MINGW32__)
#define GCC_VERSION                                                            \
	(__GNUC__ * 10000 + __GNUC_MINOR__ * 100 + __GNUC_PATCHLEVEL__)
#if GCC_VERSION >= 40500
/* gcc diagnostic pragmas available */
#define GCC_DIAGNOSTIC
#endif
#endif

#if defined(GCC_DIAGNOSTIC)
/* Disable unused macros warnings - not all defines are required
 * for all systems and all compilers. */
#pragma GCC diagnostic ignored "-Wunused-macros"
/* A padding warning is just plain useless */
#pragma GCC diagnostic ignored "-Wpadded"
#endif

#if defined(__clang__) /* GCC does not (yet) support this pragma */
/* We must set some flags for the headers we include. These flags
 * are reserved ids according to C99, so we need to disable a
 * warning for that. */
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wreserved-id-macro"
#endif

#if defined(_WIN32)
#if !defined(_CRT_SECURE_NO_WARNINGS)
#define _CRT_SECURE_NO_WARNINGS /* Disable deprecation warning in VS2005 */
#endif
#if !defined(_WIN32_WINNT) /* defined for tdm-gcc so we can use getnameinfo */
#define _WIN32_WINNT 0x0501
#endif
#else
#if !defined(_GNU_SOURCE)
#define _GNU_SOURCE /* for setgroups(), pthread_setname_np() */
#endif
#if defined(__linux__) && !defined(_XOPEN_SOURCE)
#define _XOPEN_SOURCE 600 /* For flockfile() on Linux */
#endif
#if !defined(_LARGEFILE_SOURCE)
#define _LARGEFILE_SOURCE /* For fseeko(), ftello() */
#endif
#if !defined(_FILE_OFFSET_BITS)
#define _FILE_OFFSET_BITS 64 /* Use 64-bit file offsets by default */
#endif
#if !defined(__STDC_FORMAT_MACROS)
#define __STDC_FORMAT_MACROS /* <inttypes.h> wants this for C++ */
#endif
#if !defined(__STDC_LIMIT_MACROS)
#define __STDC_LIMIT_MACROS /* C++ wants that for INT64_MAX */
#endif
#if !defined(_DARWIN_UNLIMITED_SELECT)
#define _DARWIN_UNLIMITED_SELECT
#endif
#if defined(__sun)
#define __EXTENSIONS__  /* to expose flockfile and friends in stdio.h */
#define __inline inline /* not recognized on older compiler versions */
#endif
#endif

#if defined(__clang__)
/* Enable reserved-id-macro warning again. */
#pragma GCC diagnostic pop
#endif


#if defined(USE_LUA)
#define USE_TIMERS
#endif

#if defined(_MSC_VER)
/* 'type cast' : conversion from 'int' to 'HANDLE' of greater size */
#pragma warning(disable : 4306)
/* conditional expression is constant: introduced by FD_SET(..) */
#pragma warning(disable : 4127)
/* non-constant aggregate initializer: issued due to missing C99 support */
#pragma warning(disable : 4204)
/* padding added after data member */
#pragma warning(disable : 4820)
/* not defined as a preprocessor macro, replacing with '0' for '#if/#elif' */
#pragma warning(disable : 4668)
/* no function prototype given: converting '()' to '(void)' */
#pragma warning(disable : 4255)
/* function has been selected for automatic inline expansion */
#pragma warning(disable : 4711)
#endif


/* This code uses static_assert to check some conditions.
 * Unfortunately some compilers still do not support it, so we have a
 * replacement function here. */
#if defined(__STDC_VERSION__) && __STDC_VERSION__ > 201100L
#define mg_static_assert _Static_assert
#elif defined(__cplusplus) && __cplusplus >= 201103L
#define mg_static_assert static_assert
#else
char static_assert_replacement[1];
#define mg_static_assert(cond, txt)                                            \
	extern char static_assert_replacement[(cond) ? 1 : -1]
#endif

mg_static_assert(sizeof(int) == 4 || sizeof(int) == 8,
                 "int data type size check");
mg_static_assert(sizeof(void *) == 4 || sizeof(void *) == 8,
                 "pointer data type size check");
mg_static_assert(sizeof(void *) >= sizeof(int), "data type size check");


/* Alternative queue is well tested and should be the new default */
#if defined(NO_ALTERNATIVE_QUEUE)
#if defined(ALTERNATIVE_QUEUE)
#error "Define ALTERNATIVE_QUEUE or NO_ALTERNATIVE_QUEUE or none, but not both"
#endif
#else
#define ALTERNATIVE_QUEUE
#endif


/* DTL -- including winsock2.h works better if lean and mean */
#if !defined(WIN32_LEAN_AND_MEAN)
#define WIN32_LEAN_AND_MEAN
#endif

#if defined(__SYMBIAN32__)
/* According to https://en.wikipedia.org/wiki/Symbian#History,
 * Symbian is no longer maintained since 2014-01-01.
 * Recent versions of CivetWeb are no longer tested for Symbian.
 * It makes no sense, to support an abandoned operating system.
 */
#error "Symbian is no longer maintained. CivetWeb no longer supports Symbian."
#define NO_SSL /* SSL is not supported */
#define NO_CGI /* CGI is not supported */
#define PATH_MAX FILENAME_MAX
#endif /* __SYMBIAN32__ */


#if !defined(CIVETWEB_HEADER_INCLUDED)
/* Include the header file here, so the CivetWeb interface is defined for the
 * entire implementation, including the following forward definitions. */
#include "civetweb.h"
#endif

#if !defined(DEBUG_TRACE)
#if defined(DEBUG)
static void DEBUG_TRACE_FUNC(const char *func,
                             unsigned line,
                             PRINTF_FORMAT_STRING(const char *fmt),
                             ...) PRINTF_ARGS(3, 4);

#define DEBUG_TRACE(fmt, ...)                                                  \
	DEBUG_TRACE_FUNC(__func__, __LINE__, fmt, __VA_ARGS__)

#define NEED_DEBUG_TRACE_FUNC

#else
#define DEBUG_TRACE(fmt, ...)                                                  \
	do {                                                                       \
	} while (0)
#endif /* DEBUG */
#endif /* DEBUG_TRACE */


#if !defined(DEBUG_ASSERT)
#if defined(DEBUG)
#define DEBUG_ASSERT(cond)                                                     \
	do {                                                                       \
		if (!(cond)) {                                                         \
			DEBUG_TRACE("ASSERTION FAILED: %s", #cond);                        \
			exit(2); /* Exit with error */                                     \
		}                                                                      \
	} while (0)
#else
#define DEBUG_ASSERT(cond)
#endif /* DEBUG */
#endif


#if defined(__GNUC__) && defined(GCC_INSTRUMENTATION)
void __cyg_profile_func_enter(void *this_fn, void *call_site)
    __attribute__((no_instrument_function));

void __cyg_profile_func_exit(void *this_fn, void *call_site)
    __attribute__((no_instrument_function));

void
__cyg_profile_func_enter(void *this_fn, void *call_site)
{
	if ((void *)this_fn != (void *)printf) {
		printf("E %p %p\n", this_fn, call_site);
	}
}

void
__cyg_profile_func_exit(void *this_fn, void *call_site)
{
	if ((void *)this_fn != (void *)printf) {
		printf("X %p %p\n", this_fn, call_site);
	}
}
#endif


#if !defined(IGNORE_UNUSED_RESULT)
#define IGNORE_UNUSED_RESULT(a) ((void)((a) && 1))
#endif


#if defined(__GNUC__) || defined(__MINGW32__)

/* GCC unused function attribute seems fundamentally broken.
 * Several attempts to tell the compiler "THIS FUNCTION MAY BE USED
 * OR UNUSED" for individual functions failed.
 * Either the compiler creates an "unused-function" warning if a
 * function is not marked with __attribute__((unused)).
 * On the other hand, if the function is marked with this attribute,
 * but is used, the compiler raises a completely idiotic
 * "used-but-marked-unused" warning - and
 *   #pragma GCC diagnostic ignored "-Wused-but-marked-unused"
 * raises error: unknown option after "#pragma GCC diagnostic".
 * Disable this warning completely, until the GCC guys sober up
 * again.
 */

#pragma GCC diagnostic ignored "-Wunused-function"

#define FUNCTION_MAY_BE_UNUSED /* __attribute__((unused)) */

#else
#define FUNCTION_MAY_BE_UNUSED
#endif


/* Some ANSI #includes are not available on Windows CE */
#if !defined(_WIN32_WCE)
#include <errno.h>
#include <fcntl.h>
#include <signal.h>
#include <sys/stat.h>
#include <sys/types.h>
#endif /* !_WIN32_WCE */


#if defined(__clang__)
/* When using -Weverything, clang does not accept it's own headers
 * in a release build configuration. Disable what is too much in
 * -Weverything. */
#pragma clang diagnostic ignored "-Wdisabled-macro-expansion"
#endif

#if defined(__GNUC__) || defined(__MINGW32__)
/* Who on earth came to the conclusion, using __DATE__ should rise
 * an "expansion of date or time macro is not reproducible"
 * warning. That's exactly what was intended by using this macro.
 * Just disable this nonsense warning. */

/* And disabling them does not work either:
 * #pragma clang diagnostic ignored "-Wno-error=date-time"
 * #pragma clang diagnostic ignored "-Wdate-time"
 * So we just have to disable ALL warnings for some lines
 * of code.
 * This seems to be a known GCC bug, not resolved since 2012:
 * https://gcc.gnu.org/bugzilla/show_bug.cgi?id=53431
 */
#endif


#if defined(__MACH__) /* Apple OSX section */

#if defined(__clang__)
#if (__clang_major__ == 3) && ((__clang_minor__ == 7) || (__clang_minor__ == 8))
/* Avoid warnings for Xcode 7. It seems it does no longer exist in Xcode 8 */
#pragma clang diagnostic ignored "-Wno-reserved-id-macro"
#pragma clang diagnostic ignored "-Wno-keyword-macro"
#endif
#endif

#define CLOCK_MONOTONIC (1)
#define CLOCK_REALTIME (2)

#include <mach/clock.h>
#include <mach/mach.h>
#include <mach/mach_time.h>
#include <sys/errno.h>
#include <sys/time.h>

/* clock_gettime is not implemented on OSX prior to 10.12 */
static int
_civet_clock_gettime(int clk_id, struct timespec *t)
{
	memset(t, 0, sizeof(*t));
	if (clk_id == CLOCK_REALTIME) {
		struct timeval now;
		int rv = gettimeofday(&now, NULL);
		if (rv) {
			return rv;
		}
		t->tv_sec = now.tv_sec;
		t->tv_nsec = now.tv_usec * 1000;
		return 0;

	} else if (clk_id == CLOCK_MONOTONIC) {
		static uint64_t clock_start_time = 0;
		static mach_timebase_info_data_t timebase_ifo = {0, 0};

		uint64_t now = mach_absolute_time();

		if (clock_start_time == 0) {
			kern_return_t mach_status = mach_timebase_info(&timebase_ifo);
			DEBUG_ASSERT(mach_status == KERN_SUCCESS);

			/* appease "unused variable" warning for release builds */
			(void)mach_status;

			clock_start_time = now;
		}

		now = (uint64_t)((double)(now - clock_start_time)
		                 * (double)timebase_ifo.numer
		                 / (double)timebase_ifo.denom);

		t->tv_sec = now / 1000000000;
		t->tv_nsec = now % 1000000000;
		return 0;
	}
	return -1; /* EINVAL - Clock ID is unknown */
}

/* if clock_gettime is declared, then __CLOCK_AVAILABILITY will be defined */
#if defined(__CLOCK_AVAILABILITY)
/* If we compiled with Mac OSX 10.12 or later, then clock_gettime will be
 * declared but it may be NULL at runtime. So we need to check before using
 * it. */
static int
_civet_safe_clock_gettime(int clk_id, struct timespec *t)
{
	if (clock_gettime) {
		return clock_gettime(clk_id, t);
	}
	return _civet_clock_gettime(clk_id, t);
}
#define clock_gettime _civet_safe_clock_gettime
#else
#define clock_gettime _civet_clock_gettime
#endif

#endif


#include <ctype.h>
#include <limits.h>
#include <stdarg.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

/********************************************************************/
/* CivetWeb configuration defines */
/********************************************************************/

/* Maximum number of threads that can be configured.
 * The number of threads actually created depends on the "num_threads"
 * configuration parameter, but this is the upper limit. */
#if !defined(MAX_WORKER_THREADS)
#define MAX_WORKER_THREADS (1024 * 64) /* in threads (count) */
#endif

/* Timeout interval for select/poll calls.
 * The timeouts depend on "*_timeout_ms" configuration values, but long
 * timeouts are split into timouts as small as SOCKET_TIMEOUT_QUANTUM.
 * This reduces the time required to stop the server. */
#if !defined(SOCKET_TIMEOUT_QUANTUM)
#define SOCKET_TIMEOUT_QUANTUM (2000) /* in ms */
#endif

/* Do not try to compress files smaller than this limit. */
#if !defined(MG_FILE_COMPRESSION_SIZE_LIMIT)
#define MG_FILE_COMPRESSION_SIZE_LIMIT (1024) /* in bytes */
#endif

#if !defined(PASSWORDS_FILE_NAME)
#define PASSWORDS_FILE_NAME ".htpasswd"
#endif

/* Initial buffer size for all CGI environment variables. In case there is
 * not enough space, another block is allocated. */
#if !defined(CGI_ENVIRONMENT_SIZE)
#define CGI_ENVIRONMENT_SIZE (4096) /* in bytes */
#endif

/* Maximum number of environment variables. */
#if !defined(MAX_CGI_ENVIR_VARS)
#define MAX_CGI_ENVIR_VARS (256) /* in variables (count) */
#endif

/* General purpose buffer size. */
#if !defined(MG_BUF_LEN) /* in bytes */
#define MG_BUF_LEN (1024 * 8)
#endif

/* Size of the accepted socket queue (in case the old queue implementation
 * is used). */
#if !defined(MGSQLEN)
#define MGSQLEN (20) /* count */
#endif


/********************************************************************/

/* Helper makros */
#define ARRAY_SIZE(array) (sizeof(array) / sizeof(array[0]))

/* Standard defines */
#if !defined(INT64_MAX)
#define INT64_MAX (9223372036854775807)
#endif

#define SHUTDOWN_RD (0)
#define SHUTDOWN_WR (1)
#define SHUTDOWN_BOTH (2)

mg_static_assert(MAX_WORKER_THREADS >= 1,
                 "worker threads must be a positive number");

mg_static_assert(sizeof(size_t) == 4 || sizeof(size_t) == 8,
                 "size_t data type size check");

#if defined(_WIN32) /* WINDOWS include block */
#include <windows.h>
#include <winsock2.h> /* DTL add for SO_EXCLUSIVE */
#include <ws2tcpip.h>

typedef const char *SOCK_OPT_TYPE;

#if !defined(PATH_MAX)
#define W_PATH_MAX (MAX_PATH)
/* at most three UTF-8 chars per wchar_t */
#define PATH_MAX (W_PATH_MAX * 3)
#else
#define W_PATH_MAX ((PATH_MAX + 2) / 3)
#endif

mg_static_assert(PATH_MAX >= 1, "path length must be a positive number");

#if !defined(_IN_PORT_T)
#if !defined(in_port_t)
#define in_port_t u_short
#endif
#endif

#if !defined(_WIN32_WCE)
#include <direct.h>
#include <io.h>
#include <process.h>
#else            /* _WIN32_WCE */
#define NO_CGI   /* WinCE has no pipes */
#define NO_POPEN /* WinCE has no popen */

typedef long off_t;

#define errno ((int)(GetLastError()))
#define strerror(x) (_ultoa(x, (char *)_alloca(sizeof(x) * 3), 10))
#endif /* _WIN32_WCE */

#define MAKEUQUAD(lo, hi)                                                      \
	((uint64_t)(((uint32_t)(lo)) | ((uint64_t)((uint32_t)(hi))) << 32))
#define RATE_DIFF (10000000) /* 100 nsecs */
#define EPOCH_DIFF (MAKEUQUAD(0xd53e8000, 0x019db1de))
#define SYS2UNIX_TIME(lo, hi)                                                  \
	((time_t)((MAKEUQUAD((lo), (hi)) - EPOCH_DIFF) / RATE_DIFF))

/* Visual Studio 6 does not know __func__ or __FUNCTION__
 * The rest of MS compilers use __FUNCTION__, not C99 __func__
 * Also use _strtoui64 on modern M$ compilers */
#if defined(_MSC_VER)
#if (_MSC_VER < 1300)
#define STRX(x) #x
#define STR(x) STRX(x)
#define __func__ __FILE__ ":" STR(__LINE__)
#define strtoull(x, y, z) ((unsigned __int64)_atoi64(x))
#define strtoll(x, y, z) (_atoi64(x))
#else
#define __func__ __FUNCTION__
#define strtoull(x, y, z) (_strtoui64(x, y, z))
#define strtoll(x, y, z) (_strtoi64(x, y, z))
#endif
#endif /* _MSC_VER */

#define ERRNO ((int)(GetLastError()))
#define NO_SOCKLEN_T

#if defined(_WIN64) || defined(__MINGW64__)
#if !defined(SSL_LIB)
#define SSL_LIB "ssleay64.dll"
#endif
#if !defined(CRYPTO_LIB)
#define CRYPTO_LIB "libeay64.dll"
#endif
#else
#if !defined(SSL_LIB)
#define SSL_LIB "ssleay32.dll"
#endif
#if !defined(CRYPTO_LIB)
#define CRYPTO_LIB "libeay32.dll"
#endif
#endif

#define O_NONBLOCK (0)
#if !defined(W_OK)
#define W_OK (2) /* http://msdn.microsoft.com/en-us/library/1w06ktdy.aspx */
#endif
#if !defined(EWOULDBLOCK)
#define EWOULDBLOCK WSAEWOULDBLOCK
#endif /* !EWOULDBLOCK */
#define _POSIX_
#define INT64_FMT "I64d"
#define UINT64_FMT "I64u"

#define WINCDECL __cdecl
#define vsnprintf_impl _vsnprintf
#define access _access
#define mg_sleep(x) (Sleep(x))

#define pipe(x) _pipe(x, MG_BUF_LEN, _O_BINARY)
#if !defined(popen)
#define popen(x, y) (_popen(x, y))
#endif
#if !defined(pclose)
#define pclose(x) (_pclose(x))
#endif
#define close(x) (_close(x))
#define dlsym(x, y) (GetProcAddress((HINSTANCE)(x), (y)))
#define RTLD_LAZY (0)
#define fseeko(x, y, z) ((_lseeki64(_fileno(x), (y), (z)) == -1) ? -1 : 0)
#define fdopen(x, y) (_fdopen((x), (y)))
#define write(x, y, z) (_write((x), (y), (unsigned)z))
#define read(x, y, z) (_read((x), (y), (unsigned)z))
#define flockfile(x) (EnterCriticalSection(&global_log_file_lock))
#define funlockfile(x) (LeaveCriticalSection(&global_log_file_lock))
#define sleep(x) (Sleep((x)*1000))
#define rmdir(x) (_rmdir(x))
#if defined(_WIN64) || !defined(__MINGW32__)
/* Only MinGW 32 bit is missing this function */
#define timegm(x) (_mkgmtime(x))
#else
time_t timegm(struct tm *tm);
#define NEED_TIMEGM
#endif


#if !defined(fileno)
#define fileno(x) (_fileno(x))
#endif /* !fileno MINGW #defines fileno */

typedef HANDLE pthread_mutex_t;
typedef DWORD pthread_key_t;
typedef HANDLE pthread_t;
typedef struct {
	CRITICAL_SECTION threadIdSec;
	struct mg_workerTLS *waiting_thread; /* The chain of threads */
} pthread_cond_t;

#if !defined(__clockid_t_defined)
typedef DWORD clockid_t;
#endif
#if !defined(CLOCK_MONOTONIC)
#define CLOCK_MONOTONIC (1)
#endif
#if !defined(CLOCK_REALTIME)
#define CLOCK_REALTIME (2)
#endif
#if !defined(CLOCK_THREAD)
#define CLOCK_THREAD (3)
#endif
#if !defined(CLOCK_PROCESS)
#define CLOCK_PROCESS (4)
#endif


#if defined(_MSC_VER) && (_MSC_VER >= 1900)
#define _TIMESPEC_DEFINED
#endif
#if !defined(_TIMESPEC_DEFINED)
struct timespec {
	time_t tv_sec; /* seconds */
	long tv_nsec;  /* nanoseconds */
};
#endif

#if !defined(WIN_PTHREADS_TIME_H)
#define MUST_IMPLEMENT_CLOCK_GETTIME
#endif

#if defined(MUST_IMPLEMENT_CLOCK_GETTIME)
#define clock_gettime mg_clock_gettime
static int
clock_gettime(clockid_t clk_id, struct timespec *tp)
{
	FILETIME ft;
	ULARGE_INTEGER li, li2;
	BOOL ok = FALSE;
	double d;
	static double perfcnt_per_sec = 0.0;
	static BOOL initialized = FALSE;

	if (!initialized) {
		QueryPerformanceFrequency((LARGE_INTEGER *)&li);
		perfcnt_per_sec = 1.0 / li.QuadPart;
		initialized = TRUE;
	}

	if (tp) {
		memset(tp, 0, sizeof(*tp));

		if (clk_id == CLOCK_REALTIME) {

			/* BEGIN: CLOCK_REALTIME = wall clock (date and time) */
			GetSystemTimeAsFileTime(&ft);
			li.LowPart = ft.dwLowDateTime;
			li.HighPart = ft.dwHighDateTime;
			li.QuadPart -= 116444736000000000; /* 1.1.1970 in filedate */
			tp->tv_sec = (time_t)(li.QuadPart / 10000000);
			tp->tv_nsec = (long)(li.QuadPart % 10000000) * 100;
			ok = TRUE;
			/* END: CLOCK_REALTIME */

		} else if (clk_id == CLOCK_MONOTONIC) {

			/* BEGIN: CLOCK_MONOTONIC = stopwatch (time differences) */
			QueryPerformanceCounter((LARGE_INTEGER *)&li);
			d = li.QuadPart * perfcnt_per_sec;
			tp->tv_sec = (time_t)d;
			d -= (double)tp->tv_sec;
			tp->tv_nsec = (long)(d * 1.0E9);
			ok = TRUE;
			/* END: CLOCK_MONOTONIC */

		} else if (clk_id == CLOCK_THREAD) {

			/* BEGIN: CLOCK_THREAD = CPU usage of thread */
			FILETIME t_create, t_exit, t_kernel, t_user;
			if (GetThreadTimes(GetCurrentThread(),
			                   &t_create,
			                   &t_exit,
			                   &t_kernel,
			                   &t_user)) {
				li.LowPart = t_user.dwLowDateTime;
				li.HighPart = t_user.dwHighDateTime;
				li2.LowPart = t_kernel.dwLowDateTime;
				li2.HighPart = t_kernel.dwHighDateTime;
				li.QuadPart += li2.QuadPart;
				tp->tv_sec = (time_t)(li.QuadPart / 10000000);
				tp->tv_nsec = (long)(li.QuadPart % 10000000) * 100;
				ok = TRUE;
			}
			/* END: CLOCK_THREAD */

		} else if (clk_id == CLOCK_PROCESS) {

			/* BEGIN: CLOCK_PROCESS = CPU usage of process */
			FILETIME t_create, t_exit, t_kernel, t_user;
			if (GetProcessTimes(GetCurrentProcess(),
			                    &t_create,
			                    &t_exit,
			                    &t_kernel,
			                    &t_user)) {
				li.LowPart = t_user.dwLowDateTime;
				li.HighPart = t_user.dwHighDateTime;
				li2.LowPart = t_kernel.dwLowDateTime;
				li2.HighPart = t_kernel.dwHighDateTime;
				li.QuadPart += li2.QuadPart;
				tp->tv_sec = (time_t)(li.QuadPart / 10000000);
				tp->tv_nsec = (long)(li.QuadPart % 10000000) * 100;
				ok = TRUE;
			}
			/* END: CLOCK_PROCESS */

		} else {

			/* BEGIN: unknown clock */
			/* ok = FALSE; already set by init */
			/* END: unknown clock */
		}
	}

	return ok ? 0 : -1;
}
#endif


#define pid_t HANDLE /* MINGW typedefs pid_t to int. Using #define here. */

static int pthread_mutex_lock(pthread_mutex_t *);
static int pthread_mutex_unlock(pthread_mutex_t *);
static void path_to_unicode(const struct mg_connection *conn,
                            const char *path,
                            wchar_t *wbuf,
                            size_t wbuf_len);

/* All file operations need to be rewritten to solve #246. */

struct mg_file;

static const char *
mg_fgets(char *buf, size_t size, struct mg_file *filep, char **p);


/* POSIX dirent interface */
struct dirent {
	char d_name[PATH_MAX];
};

typedef struct DIR {
	HANDLE handle;
	WIN32_FIND_DATAW info;
	struct dirent result;
} DIR;

#if defined(_WIN32)
#if !defined(HAVE_POLL)
struct pollfd {
	SOCKET fd;
	short events;
	short revents;
};
#endif
#endif

/* Mark required libraries */
#if defined(_MSC_VER)
#pragma comment(lib, "Ws2_32.lib")
#endif

#else /* defined(_WIN32) - WINDOWS vs UNIX include block */

#include <arpa/inet.h>
#include <inttypes.h>
#include <netdb.h>
#include <netinet/in.h>
#include <netinet/tcp.h>
#include <stdint.h>
#include <sys/poll.h>
#include <sys/socket.h>
#include <sys/time.h>
#include <sys/utsname.h>
#include <sys/wait.h>
typedef const void *SOCK_OPT_TYPE;

#if defined(ANDROID)
typedef unsigned short int in_port_t;
#endif

#include <dirent.h>
#include <grp.h>
#include <pwd.h>
#include <unistd.h>
#define vsnprintf_impl vsnprintf

#if !defined(NO_SSL_DL) && !defined(NO_SSL)
#include <dlfcn.h>
#endif
#include <pthread.h>
#if defined(__MACH__)
#define SSL_LIB "libssl.dylib"
#define CRYPTO_LIB "libcrypto.dylib"
#else
#if !defined(SSL_LIB)
#define SSL_LIB "libssl.so"
#endif
#if !defined(CRYPTO_LIB)
#define CRYPTO_LIB "libcrypto.so"
#endif
#endif
#if !defined(O_BINARY)
#define O_BINARY (0)
#endif /* O_BINARY */
#define closesocket(a) (close(a))
#define mg_mkdir(conn, path, mode) (mkdir(path, mode))
#define mg_remove(conn, x) (remove(x))
#define mg_sleep(x) (usleep((x)*1000))
#define mg_opendir(conn, x) (opendir(x))
#define mg_closedir(x) (closedir(x))
#define mg_readdir(x) (readdir(x))
#define ERRNO (errno)
#define INVALID_SOCKET (-1)
#define INT64_FMT PRId64
#define UINT64_FMT PRIu64
typedef int SOCKET;
#define WINCDECL

#if defined(__hpux)
/* HPUX 11 does not have monotonic, fall back to realtime */
#if !defined(CLOCK_MONOTONIC)
#define CLOCK_MONOTONIC CLOCK_REALTIME
#endif

/* HPUX defines socklen_t incorrectly as size_t which is 64bit on
 * Itanium.  Without defining _XOPEN_SOURCE or _XOPEN_SOURCE_EXTENDED
 * the prototypes use int* rather than socklen_t* which matches the
 * actual library expectation.  When called with the wrong size arg
 * accept() returns a zero client inet addr and check_acl() always
 * fails.  Since socklen_t is widely used below, just force replace
 * their typedef with int. - DTL
 */
#define socklen_t int
#endif /* hpux */

#endif /* defined(_WIN32) - WINDOWS vs UNIX include block */

/* Maximum queue length for pending connections. This value is passed as
 * parameter to the "listen" socket call. */
#if !defined(SOMAXCONN)
/* This symbol may be defined in winsock2.h so this must after that include */
#define SOMAXCONN (100) /* in pending connections (count) */
#endif

/* In case our C library is missing "timegm", provide an implementation */
#if defined(NEED_TIMEGM)
static inline int
is_leap(int y)
{
	return (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
}

static inline int
count_leap(int y)
{
	return (y - 1969) / 4 - (y - 1901) / 100 + (y - 1601) / 400;
}

time_t
timegm(struct tm *tm)
{
	static const unsigned short ydays[] = {
	    0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365};
	int year = tm->tm_year + 1900;
	int mon = tm->tm_mon;
	int mday = tm->tm_mday - 1;
	int hour = tm->tm_hour;
	int min = tm->tm_min;
	int sec = tm->tm_sec;

	if (year < 1970 || mon < 0 || mon > 11 || mday < 0
	    || (mday >= ydays[mon + 1] - ydays[mon]
	                    + (mon == 1 && is_leap(year) ? 1 : 0))
	    || hour < 0 || hour > 23 || min < 0 || min > 59 || sec < 0 || sec > 60)
		return -1;

	time_t res = year - 1970;
	res *= 365;
	res += mday;
	res += ydays[mon] + (mon > 1 && is_leap(year) ? 1 : 0);
	res += count_leap(year);

	res *= 24;
	res += hour;
	res *= 60;
	res += min;
	res *= 60;
	res += sec;
	return res;
}
#endif /* NEED_TIMEGM */


/* va_copy should always be a macro, C99 and C++11 - DTL */
#if !defined(va_copy)
#define va_copy(x, y) ((x) = (y))
#endif


#if defined(_WIN32)
/* Create substitutes for POSIX functions in Win32. */

#if defined(GCC_DIAGNOSTIC)
/* Show no warning in case system functions are not used. */
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wunused-function"
#endif


static CRITICAL_SECTION global_log_file_lock;

FUNCTION_MAY_BE_UNUSED
static DWORD
pthread_self(void)
{
	return GetCurrentThreadId();
}


FUNCTION_MAY_BE_UNUSED
static int
pthread_key_create(
    pthread_key_t *key,
    void (*_ignored)(void *) /* destructor not supported for Windows */
)
{
	(void)_ignored;

	if ((key != 0)) {
		*key = TlsAlloc();
		return (*key != TLS_OUT_OF_INDEXES) ? 0 : -1;
	}
	return -2;
}


FUNCTION_MAY_BE_UNUSED
static int
pthread_key_delete(pthread_key_t key)
{
	return TlsFree(key) ? 0 : 1;
}


FUNCTION_MAY_BE_UNUSED
static int
pthread_setspecific(pthread_key_t key, void *value)
{
	return TlsSetValue(key, value) ? 0 : 1;
}


FUNCTION_MAY_BE_UNUSED
static void *
pthread_getspecific(pthread_key_t key)
{
	return TlsGetValue(key);
}

#if defined(GCC_DIAGNOSTIC)
/* Enable unused function warning again */
#pragma GCC diagnostic pop
#endif

static struct pthread_mutex_undefined_struct *pthread_mutex_attr = NULL;
#else
static pthread_mutexattr_t pthread_mutex_attr;
#endif /* _WIN32 */


#if defined(_WIN32_WCE)
/* Create substitutes for POSIX functions in Win32. */

#if defined(GCC_DIAGNOSTIC)
/* Show no warning in case system functions are not used. */
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wunused-function"
#endif


FUNCTION_MAY_BE_UNUSED
static time_t
time(time_t *ptime)
{
	time_t t;
	SYSTEMTIME st;
	FILETIME ft;

	GetSystemTime(&st);
	SystemTimeToFileTime(&st, &ft);
	t = SYS2UNIX_TIME(ft.dwLowDateTime, ft.dwHighDateTime);

	if (ptime != NULL) {
		*ptime = t;
	}

	return t;
}


FUNCTION_MAY_BE_UNUSED
static struct tm *
localtime_s(const time_t *ptime, struct tm *ptm)
{
	int64_t t = ((int64_t)*ptime) * RATE_DIFF + EPOCH_DIFF;
	FILETIME ft, lft;
	SYSTEMTIME st;
	TIME_ZONE_INFORMATION tzinfo;

	if (ptm == NULL) {
		return NULL;
	}

	*(int64_t *)&ft = t;
	FileTimeToLocalFileTime(&ft, &lft);
	FileTimeToSystemTime(&lft, &st);
	ptm->tm_year = st.wYear - 1900;
	ptm->tm_mon = st.wMonth - 1;
	ptm->tm_wday = st.wDayOfWeek;
	ptm->tm_mday = st.wDay;
	ptm->tm_hour = st.wHour;
	ptm->tm_min = st.wMinute;
	ptm->tm_sec = st.wSecond;
	ptm->tm_yday = 0; /* hope nobody uses this */
	ptm->tm_isdst =
	    (GetTimeZoneInformation(&tzinfo) == TIME_ZONE_ID_DAYLIGHT) ? 1 : 0;

	return ptm;
}


FUNCTION_MAY_BE_UNUSED
static struct tm *
gmtime_s(const time_t *ptime, struct tm *ptm)
{
	/* FIXME(lsm): fix this. */
	return localtime_s(ptime, ptm);
}


static int mg_atomic_inc(volatile int *addr);
static struct tm tm_array[MAX_WORKER_THREADS];
static int tm_index = 0;


FUNCTION_MAY_BE_UNUSED
static struct tm *
localtime(const time_t *ptime)
{
	int i = mg_atomic_inc(&tm_index) % (sizeof(tm_array) / sizeof(tm_array[0]));
	return localtime_s(ptime, tm_array + i);
}


FUNCTION_MAY_BE_UNUSED
static struct tm *
gmtime(const time_t *ptime)
{
	int i = mg_atomic_inc(&tm_index) % ARRAY_SIZE(tm_array);
	return gmtime_s(ptime, tm_array + i);
}


FUNCTION_MAY_BE_UNUSED
static size_t
strftime(char *dst, size_t dst_size, const char *fmt, const struct tm *tm)
{
	/* TODO: (void)mg_snprintf(NULL, dst, dst_size, "implement strftime()
	 * for WinCE"); */
	return 0;
}

#define _beginthreadex(psec, stack, func, prm, flags, ptid)                    \
	(uintptr_t) CreateThread(psec, stack, func, prm, flags, ptid)

#define remove(f) mg_remove(NULL, f)


FUNCTION_MAY_BE_UNUSED
static int
rename(const char *a, const char *b)
{
	wchar_t wa[W_PATH_MAX];
	wchar_t wb[W_PATH_MAX];
	path_to_unicode(NULL, a, wa, ARRAY_SIZE(wa));
	path_to_unicode(NULL, b, wb, ARRAY_SIZE(wb));

	return MoveFileW(wa, wb) ? 0 : -1;
}


struct stat {
	int64_t st_size;
	time_t st_mtime;
};


FUNCTION_MAY_BE_UNUSED
static int
stat(const char *name, struct stat *st)
{
	wchar_t wbuf[W_PATH_MAX];
	WIN32_FILE_ATTRIBUTE_DATA attr;
	time_t creation_time, write_time;

	path_to_unicode(NULL, name, wbuf, ARRAY_SIZE(wbuf));
	memset(&attr, 0, sizeof(attr));

	GetFileAttributesExW(wbuf, GetFileExInfoStandard, &attr);
	st->st_size =
	    (((int64_t)attr.nFileSizeHigh) << 32) + (int64_t)attr.nFileSizeLow;

	write_time = SYS2UNIX_TIME(attr.ftLastWriteTime.dwLowDateTime,
	                           attr.ftLastWriteTime.dwHighDateTime);
	creation_time = SYS2UNIX_TIME(attr.ftCreationTime.dwLowDateTime,
	                              attr.ftCreationTime.dwHighDateTime);

	if (creation_time > write_time) {
		st->st_mtime = creation_time;
	} else {
		st->st_mtime = write_time;
	}
	return 0;
}

#define access(x, a) 1 /* not required anyway */

/* WinCE-TODO: define stat, remove, rename, _rmdir, _lseeki64 */
/* Values from errno.h in Windows SDK (Visual Studio). */
#define EEXIST 17
#define EACCES 13
#define ENOENT 2

#if defined(GCC_DIAGNOSTIC)
/* Enable unused function warning again */
#pragma GCC diagnostic pop
#endif

#endif /* defined(_WIN32_WCE) */


#if defined(GCC_DIAGNOSTIC)
/* Show no warning in case system functions are not used. */
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wunused-function"
#endif /* defined(GCC_DIAGNOSTIC) */
#if defined(__clang__)
/* Show no warning in case system functions are not used. */
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunused-function"
#endif

static pthread_mutex_t global_lock_mutex;


#if defined(_WIN32)
/* Forward declaration for Windows */
FUNCTION_MAY_BE_UNUSED
static int pthread_mutex_lock(pthread_mutex_t *mutex);

FUNCTION_MAY_BE_UNUSED
static int pthread_mutex_unlock(pthread_mutex_t *mutex);
#endif


FUNCTION_MAY_BE_UNUSED
static void
mg_global_lock(void)
{
	(void)pthread_mutex_lock(&global_lock_mutex);
}


FUNCTION_MAY_BE_UNUSED
static void
mg_global_unlock(void)
{
	(void)pthread_mutex_unlock(&global_lock_mutex);
}


FUNCTION_MAY_BE_UNUSED
static int
mg_atomic_inc(volatile int *addr)
{
	int ret;
#if defined(_WIN32) && !defined(NO_ATOMICS)
	/* Depending on the SDK, this function uses either
	 * (volatile unsigned int *) or (volatile LONG *),
	 * so whatever you use, the other SDK is likely to raise a warning. */
	ret = InterlockedIncrement((volatile long *)addr);
#elif defined(__GNUC__)                                                        \
    && ((__GNUC__ > 4) || ((__GNUC__ == 4) && (__GNUC_MINOR__ > 0)))           \
    && !defined(NO_ATOMICS)
	ret = __sync_add_and_fetch(addr, 1);
#else
	mg_global_lock();
	ret = (++(*addr));
	mg_global_unlock();
#endif
	return ret;
}


FUNCTION_MAY_BE_UNUSED
static int
mg_atomic_dec(volatile int *addr)
{
	int ret;
#if defined(_WIN32) && !defined(NO_ATOMICS)
	/* Depending on the SDK, this function uses either
	 * (volatile unsigned int *) or (volatile LONG *),
	 * so whatever you use, the other SDK is likely to raise a warning. */
	ret = InterlockedDecrement((volatile long *)addr);
#elif defined(__GNUC__)                                                        \
    && ((__GNUC__ > 4) || ((__GNUC__ == 4) && (__GNUC_MINOR__ > 0)))           \
    && !defined(NO_ATOMICS)
	ret = __sync_sub_and_fetch(addr, 1);
#else
	mg_global_lock();
	ret = (--(*addr));
	mg_global_unlock();
#endif
	return ret;
}


#if defined(USE_SERVER_STATS)
static int64_t
mg_atomic_add(volatile int64_t *addr, int64_t value)
{
	int64_t ret;
#if defined(_WIN64) && !defined(NO_ATOMICS)
	ret = InterlockedAdd64(addr, value);
#elif defined(__GNUC__)                                                        \
    && ((__GNUC__ > 4) || ((__GNUC__ == 4) && (__GNUC_MINOR__ > 0)))           \
    && !defined(NO_ATOMICS)
	ret = __sync_add_and_fetch(addr, value);
#else
	mg_global_lock();
	*addr += value;
	ret = (*addr);
	mg_global_unlock();
#endif
	return ret;
}
#endif


#if defined(GCC_DIAGNOSTIC)
/* Show no warning in case system functions are not used. */
#pragma GCC diagnostic pop
#endif /* defined(GCC_DIAGNOSTIC) */
#if defined(__clang__)
/* Show no warning in case system functions are not used. */
#pragma clang diagnostic pop
#endif


#if defined(USE_SERVER_STATS)

struct mg_memory_stat {
	volatile int64_t totalMemUsed;
	volatile int64_t maxMemUsed;
	volatile int blockCount;
};


static struct mg_memory_stat *get_memory_stat(struct mg_context *ctx);


static void *
mg_malloc_ex(size_t size,
             struct mg_context *ctx,
             const char *file,
             unsigned line)
{
	void *data = malloc(size + 2 * sizeof(uintptr_t));
	void *memory = 0;
	struct mg_memory_stat *mstat = get_memory_stat(ctx);

#if defined(MEMORY_DEBUGGING)
	char mallocStr[256];
#else
	(void)file;
	(void)line;
#endif

	if (data) {
		int64_t mmem = mg_atomic_add(&mstat->totalMemUsed, (int64_t)size);
		if (mmem > mstat->maxMemUsed) {
			/* could use atomic compare exchange, but this
			 * seems overkill for statistics data */
			mstat->maxMemUsed = mmem;
		}

		mg_atomic_inc(&mstat->blockCount);
		((uintptr_t *)data)[0] = size;
		((uintptr_t *)data)[1] = (uintptr_t)mstat;
		memory = (void *)(((char *)data) + 2 * sizeof(uintptr_t));
	}

#if defined(MEMORY_DEBUGGING)
	sprintf(mallocStr,
	        "MEM: %p %5lu alloc   %7lu %4lu --- %s:%u\n",
	        memory,
	        (unsigned long)size,
	        (unsigned long)mstat->totalMemUsed,
	        (unsigned long)mstat->blockCount,
	        file,
	        line);
#if defined(_WIN32)
	OutputDebugStringA(mallocStr);
#else
	DEBUG_TRACE("%s", mallocStr);
#endif
#endif

	return memory;
}


static void *
mg_calloc_ex(size_t count,
             size_t size,
             struct mg_context *ctx,
             const char *file,
             unsigned line)
{
	void *data = mg_malloc_ex(size * count, ctx, file, line);

	if (data) {
		memset(data, 0, size * count);
	}
	return data;
}


static void
mg_free_ex(void *memory, const char *file, unsigned line)
{
	void *data = (void *)(((char *)memory) - 2 * sizeof(uintptr_t));


#if defined(MEMORY_DEBUGGING)
	char mallocStr[256];
#else
	(void)file;
	(void)line;
#endif

	if (memory) {
		uintptr_t size = ((uintptr_t *)data)[0];
		struct mg_memory_stat *mstat =
		    (struct mg_memory_stat *)(((uintptr_t *)data)[1]);
		mg_atomic_add(&mstat->totalMemUsed, -(int64_t)size);
		mg_atomic_dec(&mstat->blockCount);
#if defined(MEMORY_DEBUGGING)
		sprintf(mallocStr,
		        "MEM: %p %5lu free    %7lu %4lu --- %s:%u\n",
		        memory,
		        (unsigned long)size,
		        (unsigned long)mstat->totalMemUsed,
		        (unsigned long)mstat->blockCount,
		        file,
		        line);
#if defined(_WIN32)
		OutputDebugStringA(mallocStr);
#else
		DEBUG_TRACE("%s", mallocStr);
#endif
#endif
		free(data);
	}
}


static void *
mg_realloc_ex(void *memory,
              size_t newsize,
              struct mg_context *ctx,
              const char *file,
              unsigned line)
{
	void *data;
	void *_realloc;
	uintptr_t oldsize;

#if defined(MEMORY_DEBUGGING)
	char mallocStr[256];
#else
	(void)file;
	(void)line;
#endif

	if (newsize) {
		if (memory) {
			/* Reallocate existing block */
			struct mg_memory_stat *mstat;
			data = (void *)(((char *)memory) - 2 * sizeof(uintptr_t));
			oldsize = ((uintptr_t *)data)[0];
			mstat = (struct mg_memory_stat *)((uintptr_t *)data)[1];
			_realloc = realloc(data, newsize + 2 * sizeof(uintptr_t));
			if (_realloc) {
				data = _realloc;
				mg_atomic_add(&mstat->totalMemUsed, -(int64_t)oldsize);
#if defined(MEMORY_DEBUGGING)
				sprintf(mallocStr,
				        "MEM: %p %5lu r-free  %7lu %4lu --- %s:%u\n",
				        memory,
				        (unsigned long)oldsize,
				        (unsigned long)mstat->totalMemUsed,
				        (unsigned long)mstat->blockCount,
				        file,
				        line);
#if defined(_WIN32)
				OutputDebugStringA(mallocStr);
#else
				DEBUG_TRACE("%s", mallocStr);
#endif
#endif
				mg_atomic_add(&mstat->totalMemUsed, (int64_t)newsize);
#if defined(MEMORY_DEBUGGING)
				sprintf(mallocStr,
				        "MEM: %p %5lu r-alloc %7lu %4lu --- %s:%u\n",
				        memory,
				        (unsigned long)newsize,
				        (unsigned long)mstat->totalMemUsed,
				        (unsigned long)mstat->blockCount,
				        file,
				        line);
#if defined(_WIN32)
				OutputDebugStringA(mallocStr);
#else
				DEBUG_TRACE("%s", mallocStr);
#endif
#endif
				*(uintptr_t *)data = newsize;
				data = (void *)(((char *)data) + 2 * sizeof(uintptr_t));
			} else {
#if defined(MEMORY_DEBUGGING)
#if defined(_WIN32)
				OutputDebugStringA("MEM: realloc failed\n");
#else
				DEBUG_TRACE("%s", "MEM: realloc failed\n");
#endif
#endif
				return _realloc;
			}
		} else {
			/* Allocate new block */
			data = mg_malloc_ex(newsize, ctx, file, line);
		}
	} else {
		/* Free existing block */
		data = 0;
		mg_free_ex(memory, file, line);
	}

	return data;
}

#define mg_malloc(a) mg_malloc_ex(a, NULL, __FILE__, __LINE__)
#define mg_calloc(a, b) mg_calloc_ex(a, b, NULL, __FILE__, __LINE__)
#define mg_realloc(a, b) mg_realloc_ex(a, b, NULL, __FILE__, __LINE__)
#define mg_free(a) mg_free_ex(a, __FILE__, __LINE__)

#define mg_malloc_ctx(a, c) mg_malloc_ex(a, c, __FILE__, __LINE__)
#define mg_calloc_ctx(a, b, c) mg_calloc_ex(a, b, c, __FILE__, __LINE__)
#define mg_realloc_ctx(a, b, c) mg_realloc_ex(a, b, c, __FILE__, __LINE__)

#else /* USE_SERVER_STATS */

static __inline void *
mg_malloc(size_t a)
{
	return malloc(a);
}

static __inline void *
mg_calloc(size_t a, size_t b)
{
	return calloc(a, b);
}

static __inline void *
mg_realloc(void *a, size_t b)
{
	return realloc(a, b);
}

static __inline void
mg_free(void *a)
{
	free(a);
}

#define mg_malloc_ctx(a, c) mg_malloc(a)
#define mg_calloc_ctx(a, b, c) mg_calloc(a, b)
#define mg_realloc_ctx(a, b, c) mg_realloc(a, b)
#define mg_free_ctx(a, c) mg_free(a)

#endif /* USE_SERVER_STATS */


static void mg_vsnprintf(const struct mg_connection *conn,
                         int *truncated,
                         char *buf,
                         size_t buflen,
                         const char *fmt,
                         va_list ap);

static void mg_snprintf(const struct mg_connection *conn,
                        int *truncated,
                        char *buf,
                        size_t buflen,
                        PRINTF_FORMAT_STRING(const char *fmt),
                        ...) PRINTF_ARGS(5, 6);

/* This following lines are just meant as a reminder to use the mg-functions
 * for memory management */
#if defined(malloc)
#undef malloc
#endif
#if defined(calloc)
#undef calloc
#endif
#if defined(realloc)
#undef realloc
#endif
#if defined(free)
#undef free
#endif
#if defined(snprintf)
#undef snprintf
#endif
#if defined(vsnprintf)
#undef vsnprintf
#endif
#define malloc DO_NOT_USE_THIS_FUNCTION__USE_mg_malloc
#define calloc DO_NOT_USE_THIS_FUNCTION__USE_mg_calloc
#define realloc DO_NOT_USE_THIS_FUNCTION__USE_mg_realloc
#define free DO_NOT_USE_THIS_FUNCTION__USE_mg_free
#define snprintf DO_NOT_USE_THIS_FUNCTION__USE_mg_snprintf
#if defined(_WIN32)
/* vsnprintf must not be used in any system,
 * but this define only works well for Windows. */
#define vsnprintf DO_NOT_USE_THIS_FUNCTION__USE_mg_vsnprintf
#endif


/* mg_init_library counter */
static int mg_init_library_called = 0;

#if !defined(NO_SSL)
static int mg_ssl_initialized = 0;
#endif

static pthread_key_t sTlsKey; /* Thread local storage index */
static int thread_idx_max = 0;

#if defined(MG_LEGACY_INTERFACE)
#define MG_ALLOW_USING_GET_REQUEST_INFO_FOR_RESPONSE
#endif

struct mg_workerTLS {
	int is_master;
	unsigned long thread_idx;
#if defined(_WIN32)
	HANDLE pthread_cond_helper_mutex;
	struct mg_workerTLS *next_waiting_thread;
#endif
#if defined(MG_ALLOW_USING_GET_REQUEST_INFO_FOR_RESPONSE)
	char txtbuf[4];
#endif
};


#if defined(GCC_DIAGNOSTIC)
/* Show no warning in case system functions are not used. */
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wunused-function"
#endif /* defined(GCC_DIAGNOSTIC) */
#if defined(__clang__)
/* Show no warning in case system functions are not used. */
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunused-function"
#endif


/* Get a unique thread ID as unsigned long, independent from the data type
 * of thread IDs defined by the operating system API.
 * If two calls to mg_current_thread_id  return the same value, they calls
 * are done from the same thread. If they return different values, they are
 * done from different threads. (Provided this function is used in the same
 * process context and threads are not repeatedly created and deleted, but
 * CivetWeb does not do that).
 * This function must match the signature required for SSL id callbacks:
 * CRYPTO_set_id_callback
 */
FUNCTION_MAY_BE_UNUSED
static unsigned long
mg_current_thread_id(void)
{
#if defined(_WIN32)
	return GetCurrentThreadId();
#else

#if defined(__clang__)
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunreachable-code"
/* For every compiler, either "sizeof(pthread_t) > sizeof(unsigned long)"
 * or not, so one of the two conditions will be unreachable by construction.
 * Unfortunately the C standard does not define a way to check this at
 * compile time, since the #if preprocessor conditions can not use the sizeof
 * operator as an argument. */
#endif

	if (sizeof(pthread_t) > sizeof(unsigned long)) {
		/* This is the problematic case for CRYPTO_set_id_callback:
		 * The OS pthread_t can not be cast to unsigned long. */
		struct mg_workerTLS *tls =
		    (struct mg_workerTLS *)pthread_getspecific(sTlsKey);
		if (tls == NULL) {
			/* SSL called from an unknown thread: Create some thread index.
			 */
			tls = (struct mg_workerTLS *)mg_malloc(sizeof(struct mg_workerTLS));
			tls->is_master = -2; /* -2 means "3rd party thread" */
			tls->thread_idx = (unsigned)mg_atomic_inc(&thread_idx_max);
			pthread_setspecific(sTlsKey, tls);
		}
		return tls->thread_idx;
	} else {
		/* pthread_t may be any data type, so a simple cast to unsigned long
		 * can rise a warning/error, depending on the platform.
		 * Here memcpy is used as an anything-to-anything cast. */
		unsigned long ret = 0;
		pthread_t t = pthread_self();
		memcpy(&ret, &t, sizeof(pthread_t));
		return ret;
	}

#if defined(__clang__)
#pragma clang diagnostic pop
#endif

#endif
}


FUNCTION_MAY_BE_UNUSED
static uint64_t
mg_get_current_time_ns(void)
{
	struct timespec tsnow;
	clock_gettime(CLOCK_REALTIME, &tsnow);
	return (((uint64_t)tsnow.tv_sec) * 1000000000) + (uint64_t)tsnow.tv_nsec;
}


#if defined(GCC_DIAGNOSTIC)
/* Show no warning in case system functions are not used. */
#pragma GCC diagnostic pop
#endif /* defined(GCC_DIAGNOSTIC) */
#if defined(__clang__)
/* Show no warning in case system functions are not used. */
#pragma clang diagnostic pop
#endif


#if defined(NEED_DEBUG_TRACE_FUNC)
static void
DEBUG_TRACE_FUNC(const char *func, unsigned line, const char *fmt, ...)
{
	va_list args;
	uint64_t nsnow;
	static uint64_t nslast;
	struct timespec tsnow;

	/* Get some operating system independent thread id */
	unsigned long thread_id = mg_current_thread_id();

	clock_gettime(CLOCK_REALTIME, &tsnow);
	nsnow = ((uint64_t)tsnow.tv_sec) * ((uint64_t)1000000000)
	        + ((uint64_t)tsnow.tv_nsec);

	if (!nslast) {
		nslast = nsnow;
	}

	flockfile(stdout);
	printf("*** %lu.%09lu %12" INT64_FMT " %lu %s:%u: ",
	       (unsigned long)tsnow.tv_sec,
	       (unsigned long)tsnow.tv_nsec,
	       nsnow - nslast,
	       thread_id,
	       func,
	       line);
	va_start(args, fmt);
	vprintf(fmt, args);
	va_end(args);
	putchar('\n');
	fflush(stdout);
	funlockfile(stdout);
	nslast = nsnow;
}
#endif /* NEED_DEBUG_TRACE_FUNC */


#define MD5_STATIC static
#include "md5.inl"

/* Darwin prior to 7.0 and Win32 do not have socklen_t */
#if defined(NO_SOCKLEN_T)
typedef int socklen_t;
#endif /* NO_SOCKLEN_T */

#define IP_ADDR_STR_LEN (50) /* IPv6 hex string is 46 chars */

#if !defined(MSG_NOSIGNAL)
#define MSG_NOSIGNAL (0)
#endif


#if defined(NO_SSL)
typedef struct SSL SSL; /* dummy for SSL argument to push/pull */
typedef struct SSL_CTX SSL_CTX;
#else
#if defined(NO_SSL_DL)
#include <openssl/bn.h>
#include <openssl/conf.h>
#include <openssl/crypto.h>
#include <openssl/dh.h>
#include <openssl/engine.h>
#include <openssl/err.h>
#include <openssl/opensslv.h>
#include <openssl/pem.h>
#include <openssl/ssl.h>
#include <openssl/x509.h>

#if defined(WOLFSSL_VERSION)
/* Additional defines for WolfSSL, see
 * https://github.com/civetweb/civetweb/issues/583 */
#include "wolfssl_extras.inl"
#endif

#if (OPENSSL_VERSION_NUMBER >= 0x10100000L)
/* If OpenSSL headers are included, automatically select the API version */
#if !defined(OPENSSL_API_1_1)
#define OPENSSL_API_1_1
#endif
#endif


#else

/* SSL loaded dynamically from DLL.
 * I put the prototypes here to be independent from OpenSSL source
 * installation. */

typedef struct ssl_st SSL;
typedef struct ssl_method_st SSL_METHOD;
typedef struct ssl_ctx_st SSL_CTX;
typedef struct x509_store_ctx_st X509_STORE_CTX;
typedef struct x509_name X509_NAME;
typedef struct asn1_integer ASN1_INTEGER;
typedef struct bignum BIGNUM;
typedef struct ossl_init_settings_st OPENSSL_INIT_SETTINGS;
typedef struct evp_md EVP_MD;
typedef struct x509 X509;


#define SSL_CTRL_OPTIONS (32)
#define SSL_CTRL_CLEAR_OPTIONS (77)
#define SSL_CTRL_SET_ECDH_AUTO (94)

#define OPENSSL_INIT_NO_LOAD_SSL_STRINGS 0x00100000L
#define OPENSSL_INIT_LOAD_SSL_STRINGS 0x00200000L
#define OPENSSL_INIT_LOAD_CRYPTO_STRINGS 0x00000002L

#define SSL_VERIFY_NONE (0)
#define SSL_VERIFY_PEER (1)
#define SSL_VERIFY_FAIL_IF_NO_PEER_CERT (2)
#define SSL_VERIFY_CLIENT_ONCE (4)
#define SSL_OP_ALL ((long)(0x80000BFFUL))
#define SSL_OP_NO_SSLv2 (0x01000000L)
#define SSL_OP_NO_SSLv3 (0x02000000L)
#define SSL_OP_NO_TLSv1 (0x04000000L)
#define SSL_OP_NO_TLSv1_2 (0x08000000L)
#define SSL_OP_NO_TLSv1_1 (0x10000000L)
#define SSL_OP_SINGLE_DH_USE (0x00100000L)
#define SSL_OP_CIPHER_SERVER_PREFERENCE (0x00400000L)
#define SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION (0x00010000L)
#define SSL_OP_NO_COMPRESSION (0x00020000L)

#define SSL_CB_HANDSHAKE_START (0x10)
#define SSL_CB_HANDSHAKE_DONE (0x20)

#define SSL_ERROR_NONE (0)
#define SSL_ERROR_SSL (1)
#define SSL_ERROR_WANT_READ (2)
#define SSL_ERROR_WANT_WRITE (3)
#define SSL_ERROR_WANT_X509_LOOKUP (4)
#define SSL_ERROR_SYSCALL (5) /* see errno */
#define SSL_ERROR_ZERO_RETURN (6)
#define SSL_ERROR_WANT_CONNECT (7)
#define SSL_ERROR_WANT_ACCEPT (8)

#define TLSEXT_TYPE_server_name (0)
#define TLSEXT_NAMETYPE_host_name (0)
#define SSL_TLSEXT_ERR_OK (0)
#define SSL_TLSEXT_ERR_ALERT_WARNING (1)
#define SSL_TLSEXT_ERR_ALERT_FATAL (2)
#define SSL_TLSEXT_ERR_NOACK (3)

struct ssl_func {
	const char *name;  /* SSL function name */
	void (*ptr)(void); /* Function pointer */
};


#if defined(OPENSSL_API_1_1)

#define SSL_free (*(void (*)(SSL *))ssl_sw[0].ptr)
#define SSL_accept (*(int (*)(SSL *))ssl_sw[1].ptr)
#define SSL_connect (*(int (*)(SSL *))ssl_sw[2].ptr)
#define SSL_read (*(int (*)(SSL *, void *, int))ssl_sw[3].ptr)
#define SSL_write (*(int (*)(SSL *, const void *, int))ssl_sw[4].ptr)
#define SSL_get_error (*(int (*)(SSL *, int))ssl_sw[5].ptr)
#define SSL_set_fd (*(int (*)(SSL *, SOCKET))ssl_sw[6].ptr)
#define SSL_new (*(SSL * (*)(SSL_CTX *)) ssl_sw[7].ptr)
#define SSL_CTX_new (*(SSL_CTX * (*)(SSL_METHOD *)) ssl_sw[8].ptr)
#define TLS_server_method (*(SSL_METHOD * (*)(void)) ssl_sw[9].ptr)
#define OPENSSL_init_ssl                                                       \
	(*(int (*)(uint64_t opts,                                                  \
	           const OPENSSL_INIT_SETTINGS *settings))ssl_sw[10]               \
	      .ptr)
#define SSL_CTX_use_PrivateKey_file                                            \
	(*(int (*)(SSL_CTX *, const char *, int))ssl_sw[11].ptr)
#define SSL_CTX_use_certificate_file                                           \
	(*(int (*)(SSL_CTX *, const char *, int))ssl_sw[12].ptr)
#define SSL_CTX_set_default_passwd_cb                                          \
	(*(void (*)(SSL_CTX *, mg_callback_t))ssl_sw[13].ptr)
#define SSL_CTX_free (*(void (*)(SSL_CTX *))ssl_sw[14].ptr)
#define SSL_CTX_use_certificate_chain_file                                     \
	(*(int (*)(SSL_CTX *, const char *))ssl_sw[15].ptr)
#define TLS_client_method (*(SSL_METHOD * (*)(void)) ssl_sw[16].ptr)
#define SSL_pending (*(int (*)(SSL *))ssl_sw[17].ptr)
#define SSL_CTX_set_verify                                                     \
	(*(void (*)(SSL_CTX *,                                                     \
	            int,                                                           \
	            int (*verify_callback)(int, X509_STORE_CTX *)))ssl_sw[18]      \
	      .ptr)
#define SSL_shutdown (*(int (*)(SSL *))ssl_sw[19].ptr)
#define SSL_CTX_load_verify_locations                                          \
	(*(int (*)(SSL_CTX *, const char *, const char *))ssl_sw[20].ptr)
#define SSL_CTX_set_default_verify_paths (*(int (*)(SSL_CTX *))ssl_sw[21].ptr)
#define SSL_CTX_set_verify_depth (*(void (*)(SSL_CTX *, int))ssl_sw[22].ptr)
#define SSL_get_peer_certificate (*(X509 * (*)(SSL *)) ssl_sw[23].ptr)
#define SSL_get_version (*(const char *(*)(SSL *))ssl_sw[24].ptr)
#define SSL_get_current_cipher (*(SSL_CIPHER * (*)(SSL *)) ssl_sw[25].ptr)
#define SSL_CIPHER_get_name                                                    \
	(*(const char *(*)(const SSL_CIPHER *))ssl_sw[26].ptr)
#define SSL_CTX_check_private_key (*(int (*)(SSL_CTX *))ssl_sw[27].ptr)
#define SSL_CTX_set_session_id_context                                         \
	(*(int (*)(SSL_CTX *, const unsigned char *, unsigned int))ssl_sw[28].ptr)
#define SSL_CTX_ctrl (*(long (*)(SSL_CTX *, int, long, void *))ssl_sw[29].ptr)
#define SSL_CTX_set_cipher_list                                                \
	(*(int (*)(SSL_CTX *, const char *))ssl_sw[30].ptr)
#define SSL_CTX_set_options                                                    \
	(*(unsigned long (*)(SSL_CTX *, unsigned long))ssl_sw[31].ptr)
#define SSL_CTX_set_info_callback                                              \
	(*(void (*)(SSL_CTX * ctx, void (*callback)(SSL * s, int, int)))           \
	      ssl_sw[32]                                                           \
	          .ptr)
#define SSL_get_ex_data (*(char *(*)(SSL *, int))ssl_sw[33].ptr)
#define SSL_set_ex_data (*(void (*)(SSL *, int, char *))ssl_sw[34].ptr)
#define SSL_CTX_callback_ctrl                                                  \
	(*(long (*)(SSL_CTX *, int, void (*)(void)))ssl_sw[35].ptr)
#define SSL_get_servername                                                     \
	(*(const char *(*)(const SSL *, int type))ssl_sw[36].ptr)
#define SSL_set_SSL_CTX (*(SSL_CTX * (*)(SSL *, SSL_CTX *)) ssl_sw[37].ptr)

#define SSL_CTX_clear_options(ctx, op)                                         \
	SSL_CTX_ctrl((ctx), SSL_CTRL_CLEAR_OPTIONS, (op), NULL)
#define SSL_CTX_set_ecdh_auto(ctx, onoff)                                      \
	SSL_CTX_ctrl(ctx, SSL_CTRL_SET_ECDH_AUTO, onoff, NULL)

#define SSL_CTRL_SET_TLSEXT_SERVERNAME_CB 53
#define SSL_CTRL_SET_TLSEXT_SERVERNAME_ARG 54
#define SSL_CTX_set_tlsext_servername_callback(ctx, cb)                        \
	SSL_CTX_callback_ctrl(ctx,                                                 \
	                      SSL_CTRL_SET_TLSEXT_SERVERNAME_CB,                   \
	                      (void (*)(void))cb)
#define SSL_CTX_set_tlsext_servername_arg(ctx, arg)                            \
	SSL_CTX_ctrl(ctx, SSL_CTRL_SET_TLSEXT_SERVERNAME_ARG, 0, (void *)arg)

#define X509_get_notBefore(x) ((x)->cert_info->validity->notBefore)
#define X509_get_notAfter(x) ((x)->cert_info->validity->notAfter)

#define SSL_set_app_data(s, arg) (SSL_set_ex_data(s, 0, (char *)arg))
#define SSL_get_app_data(s) (SSL_get_ex_data(s, 0))

#define ERR_get_error (*(unsigned long (*)(void))crypto_sw[0].ptr)
#define ERR_error_string (*(char *(*)(unsigned long, char *))crypto_sw[1].ptr)
#define ERR_remove_state (*(void (*)(unsigned long))crypto_sw[2].ptr)
#define CONF_modules_unload (*(void (*)(int))crypto_sw[3].ptr)
#define X509_free (*(void (*)(X509 *))crypto_sw[4].ptr)
#define X509_get_subject_name (*(X509_NAME * (*)(X509 *)) crypto_sw[5].ptr)
#define X509_get_issuer_name (*(X509_NAME * (*)(X509 *)) crypto_sw[6].ptr)
#define X509_NAME_oneline                                                      \
	(*(char *(*)(X509_NAME *, char *, int))crypto_sw[7].ptr)
#define X509_get_serialNumber (*(ASN1_INTEGER * (*)(X509 *)) crypto_sw[8].ptr)
#define EVP_get_digestbyname                                                   \
	(*(const EVP_MD *(*)(const char *))crypto_sw[9].ptr)
#define EVP_Digest                                                             \
	(*(int (*)(                                                                \
	    const void *, size_t, void *, unsigned int *, const EVP_MD *, void *)) \
	      crypto_sw[10]                                                        \
	          .ptr)
#define i2d_X509 (*(int (*)(X509 *, unsigned char **))crypto_sw[11].ptr)
#define BN_bn2hex (*(char *(*)(const BIGNUM *a))crypto_sw[12].ptr)
#define ASN1_INTEGER_to_BN                                                     \
	(*(BIGNUM * (*)(const ASN1_INTEGER *ai, BIGNUM *bn)) crypto_sw[13].ptr)
#define BN_free (*(void (*)(const BIGNUM *a))crypto_sw[14].ptr)
#define CRYPTO_free (*(void (*)(void *addr))crypto_sw[15].ptr)

#define OPENSSL_free(a) CRYPTO_free(a)


/* init_ssl_ctx() function updates this array.
 * It loads SSL library dynamically and changes NULLs to the actual addresses
 * of respective functions. The macros above (like SSL_connect()) are really
 * just calling these functions indirectly via the pointer. */
static struct ssl_func ssl_sw[] = {{"SSL_free", NULL},
                                   {"SSL_accept", NULL},
                                   {"SSL_connect", NULL},
                                   {"SSL_read", NULL},
                                   {"SSL_write", NULL},
                                   {"SSL_get_error", NULL},
                                   {"SSL_set_fd", NULL},
                                   {"SSL_new", NULL},
                                   {"SSL_CTX_new", NULL},
                                   {"TLS_server_method", NULL},
                                   {"OPENSSL_init_ssl", NULL},
                                   {"SSL_CTX_use_PrivateKey_file", NULL},
                                   {"SSL_CTX_use_certificate_file", NULL},
                                   {"SSL_CTX_set_default_passwd_cb", NULL},
                                   {"SSL_CTX_free", NULL},
                                   {"SSL_CTX_use_certificate_chain_file", NULL},
                                   {"TLS_client_method", NULL},
                                   {"SSL_pending", NULL},
                                   {"SSL_CTX_set_verify", NULL},
                                   {"SSL_shutdown", NULL},
                                   {"SSL_CTX_load_verify_locations", NULL},
                                   {"SSL_CTX_set_default_verify_paths", NULL},
                                   {"SSL_CTX_set_verify_depth", NULL},
                                   {"SSL_get_peer_certificate", NULL},
                                   {"SSL_get_version", NULL},
                                   {"SSL_get_current_cipher", NULL},
                                   {"SSL_CIPHER_get_name", NULL},
                                   {"SSL_CTX_check_private_key", NULL},
                                   {"SSL_CTX_set_session_id_context", NULL},
                                   {"SSL_CTX_ctrl", NULL},
                                   {"SSL_CTX_set_cipher_list", NULL},
                                   {"SSL_CTX_set_options", NULL},
                                   {"SSL_CTX_set_info_callback", NULL},
                                   {"SSL_get_ex_data", NULL},
                                   {"SSL_set_ex_data", NULL},
                                   {"SSL_CTX_callback_ctrl", NULL},
                                   {"SSL_get_servername", NULL},
                                   {"SSL_set_SSL_CTX", NULL},
                                   {NULL, NULL}};


/* Similar array as ssl_sw. These functions could be located in different
 * lib. */
static struct ssl_func crypto_sw[] = {{"ERR_get_error", NULL},
                                      {"ERR_error_string", NULL},
                                      {"ERR_remove_state", NULL},
                                      {"CONF_modules_unload", NULL},
                                      {"X509_free", NULL},
                                      {"X509_get_subject_name", NULL},
                                      {"X509_get_issuer_name", NULL},
                                      {"X509_NAME_oneline", NULL},
                                      {"X509_get_serialNumber", NULL},
                                      {"EVP_get_digestbyname", NULL},
                                      {"EVP_Digest", NULL},
                                      {"i2d_X509", NULL},
                                      {"BN_bn2hex", NULL},
                                      {"ASN1_INTEGER_to_BN", NULL},
                                      {"BN_free", NULL},
                                      {"CRYPTO_free", NULL},
                                      {NULL, NULL}};
#else

#define SSL_free (*(void (*)(SSL *))ssl_sw[0].ptr)
#define SSL_accept (*(int (*)(SSL *))ssl_sw[1].ptr)
#define SSL_connect (*(int (*)(SSL *))ssl_sw[2].ptr)
#define SSL_read (*(int (*)(SSL *, void *, int))ssl_sw[3].ptr)
#define SSL_write (*(int (*)(SSL *, const void *, int))ssl_sw[4].ptr)
#define SSL_get_error (*(int (*)(SSL *, int))ssl_sw[5].ptr)
#define SSL_set_fd (*(int (*)(SSL *, SOCKET))ssl_sw[6].ptr)
#define SSL_new (*(SSL * (*)(SSL_CTX *)) ssl_sw[7].ptr)
#define SSL_CTX_new (*(SSL_CTX * (*)(SSL_METHOD *)) ssl_sw[8].ptr)
#define SSLv23_server_method (*(SSL_METHOD * (*)(void)) ssl_sw[9].ptr)
#define SSL_library_init (*(int (*)(void))ssl_sw[10].ptr)
#define SSL_CTX_use_PrivateKey_file                                            \
	(*(int (*)(SSL_CTX *, const char *, int))ssl_sw[11].ptr)
#define SSL_CTX_use_certificate_file                                           \
	(*(int (*)(SSL_CTX *, const char *, int))ssl_sw[12].ptr)
#define SSL_CTX_set_default_passwd_cb                                          \
	(*(void (*)(SSL_CTX *, mg_callback_t))ssl_sw[13].ptr)
#define SSL_CTX_free (*(void (*)(SSL_CTX *))ssl_sw[14].ptr)
#define SSL_load_error_strings (*(void (*)(void))ssl_sw[15].ptr)
#define SSL_CTX_use_certificate_chain_file                                     \
	(*(int (*)(SSL_CTX *, const char *))ssl_sw[16].ptr)
#define SSLv23_client_method (*(SSL_METHOD * (*)(void)) ssl_sw[17].ptr)
#define SSL_pending (*(int (*)(SSL *))ssl_sw[18].ptr)
#define SSL_CTX_set_verify                                                     \
	(*(void (*)(SSL_CTX *,                                                     \
	            int,                                                           \
	            int (*verify_callback)(int, X509_STORE_CTX *)))ssl_sw[19]      \
	      .ptr)
#define SSL_shutdown (*(int (*)(SSL *))ssl_sw[20].ptr)
#define SSL_CTX_load_verify_locations                                          \
	(*(int (*)(SSL_CTX *, const char *, const char *))ssl_sw[21].ptr)
#define SSL_CTX_set_default_verify_paths (*(int (*)(SSL_CTX *))ssl_sw[22].ptr)
#define SSL_CTX_set_verify_depth (*(void (*)(SSL_CTX *, int))ssl_sw[23].ptr)
#define SSL_get_peer_certificate (*(X509 * (*)(SSL *)) ssl_sw[24].ptr)
#define SSL_get_version (*(const char *(*)(SSL *))ssl_sw[25].ptr)
#define SSL_get_current_cipher (*(SSL_CIPHER * (*)(SSL *)) ssl_sw[26].ptr)
#define SSL_CIPHER_get_name                                                    \
	(*(const char *(*)(const SSL_CIPHER *))ssl_sw[27].ptr)
#define SSL_CTX_check_private_key (*(int (*)(SSL_CTX *))ssl_sw[28].ptr)
#define SSL_CTX_set_session_id_context                                         \
	(*(int (*)(SSL_CTX *, const unsigned char *, unsigned int))ssl_sw[29].ptr)
#define SSL_CTX_ctrl (*(long (*)(SSL_CTX *, int, long, void *))ssl_sw[30].ptr)
#define SSL_CTX_set_cipher_list                                                \
	(*(int (*)(SSL_CTX *, const char *))ssl_sw[31].ptr)
#define SSL_CTX_set_info_callback                                              \
	(*(void (*)(SSL_CTX *, void (*callback)(SSL * s, int, int))) ssl_sw[32].ptr)
#define SSL_get_ex_data (*(char *(*)(SSL *, int))ssl_sw[33].ptr)
#define SSL_set_ex_data (*(void (*)(SSL *, int, char *))ssl_sw[34].ptr)
#define SSL_CTX_callback_ctrl                                                  \
	(*(long (*)(SSL_CTX *, int, void (*)(void)))ssl_sw[35].ptr)
#define SSL_get_servername                                                     \
	(*(const char *(*)(const SSL *, int type))ssl_sw[36].ptr)
#define SSL_set_SSL_CTX (*(SSL_CTX * (*)(SSL *, SSL_CTX *)) ssl_sw[37].ptr)

#define SSL_CTX_set_options(ctx, op)                                           \
	SSL_CTX_ctrl((ctx), SSL_CTRL_OPTIONS, (op), NULL)
#define SSL_CTX_clear_options(ctx, op)                                         \
	SSL_CTX_ctrl((ctx), SSL_CTRL_CLEAR_OPTIONS, (op), NULL)
#define SSL_CTX_set_ecdh_auto(ctx, onoff)                                      \
	SSL_CTX_ctrl(ctx, SSL_CTRL_SET_ECDH_AUTO, onoff, NULL)

#define SSL_CTRL_SET_TLSEXT_SERVERNAME_CB 53
#define SSL_CTRL_SET_TLSEXT_SERVERNAME_ARG 54
#define SSL_CTX_set_tlsext_servername_callback(ctx, cb)                        \
	SSL_CTX_callback_ctrl(ctx,                                                 \
	                      SSL_CTRL_SET_TLSEXT_SERVERNAME_CB,                   \
	                      (void (*)(void))cb)
#define SSL_CTX_set_tlsext_servername_arg(ctx, arg)                            \
	SSL_CTX_ctrl(ctx, SSL_CTRL_SET_TLSEXT_SERVERNAME_ARG, 0, (void *)arg)

#define X509_get_notBefore(x) ((x)->cert_info->validity->notBefore)
#define X509_get_notAfter(x) ((x)->cert_info->validity->notAfter)

#define SSL_set_app_data(s, arg) (SSL_set_ex_data(s, 0, (char *)arg))
#define SSL_get_app_data(s) (SSL_get_ex_data(s, 0))

#define CRYPTO_num_locks (*(int (*)(void))crypto_sw[0].ptr)
#define CRYPTO_set_locking_callback                                            \
	(*(void (*)(void (*)(int, int, const char *, int)))crypto_sw[1].ptr)
#define CRYPTO_set_id_callback                                                 \
	(*(void (*)(unsigned long (*)(void)))crypto_sw[2].ptr)
#define ERR_get_error (*(unsigned long (*)(void))crypto_sw[3].ptr)
#define ERR_error_string (*(char *(*)(unsigned long, char *))crypto_sw[4].ptr)
#define ERR_remove_state (*(void (*)(unsigned long))crypto_sw[5].ptr)
#define ERR_free_strings (*(void (*)(void))crypto_sw[6].ptr)
#define ENGINE_cleanup (*(void (*)(void))crypto_sw[7].ptr)
#define CONF_modules_unload (*(void (*)(int))crypto_sw[8].ptr)
#define CRYPTO_cleanup_all_ex_data (*(void (*)(void))crypto_sw[9].ptr)
#define EVP_cleanup (*(void (*)(void))crypto_sw[10].ptr)
#define X509_free (*(void (*)(X509 *))crypto_sw[11].ptr)
#define X509_get_subject_name (*(X509_NAME * (*)(X509 *)) crypto_sw[12].ptr)
#define X509_get_issuer_name (*(X509_NAME * (*)(X509 *)) crypto_sw[13].ptr)
#define X509_NAME_oneline                                                      \
	(*(char *(*)(X509_NAME *, char *, int))crypto_sw[14].ptr)
#define X509_get_serialNumber (*(ASN1_INTEGER * (*)(X509 *)) crypto_sw[15].ptr)
#define i2c_ASN1_INTEGER                                                       \
	(*(int (*)(ASN1_INTEGER *, unsigned char **))crypto_sw[16].ptr)
#define EVP_get_digestbyname                                                   \
	(*(const EVP_MD *(*)(const char *))crypto_sw[17].ptr)
#define EVP_Digest                                                             \
	(*(int (*)(                                                                \
	    const void *, size_t, void *, unsigned int *, const EVP_MD *, void *)) \
	      crypto_sw[18]                                                        \
	          .ptr)
#define i2d_X509 (*(int (*)(X509 *, unsigned char **))crypto_sw[19].ptr)
#define BN_bn2hex (*(char *(*)(const BIGNUM *a))crypto_sw[20].ptr)
#define ASN1_INTEGER_to_BN                                                     \
	(*(BIGNUM * (*)(const ASN1_INTEGER *ai, BIGNUM *bn)) crypto_sw[21].ptr)
#define BN_free (*(void (*)(const BIGNUM *a))crypto_sw[22].ptr)
#define CRYPTO_free (*(void (*)(void *addr))crypto_sw[23].ptr)

#define OPENSSL_free(a) CRYPTO_free(a)

/* init_ssl_ctx() function updates this array.
 * It loads SSL library dynamically and changes NULLs to the actual addresses
 * of respective functions. The macros above (like SSL_connect()) are really
 * just calling these functions indirectly via the pointer. */
static struct ssl_func ssl_sw[] = {{"SSL_free", NULL},
                                   {"SSL_accept", NULL},
                                   {"SSL_connect", NULL},
                                   {"SSL_read", NULL},
                                   {"SSL_write", NULL},
                                   {"SSL_get_error", NULL},
                                   {"SSL_set_fd", NULL},
                                   {"SSL_new", NULL},
                                   {"SSL_CTX_new", NULL},
                                   {"SSLv23_server_method", NULL},
                                   {"SSL_library_init", NULL},
                                   {"SSL_CTX_use_PrivateKey_file", NULL},
                                   {"SSL_CTX_use_certificate_file", NULL},
                                   {"SSL_CTX_set_default_passwd_cb", NULL},
                                   {"SSL_CTX_free", NULL},
                                   {"SSL_load_error_strings", NULL},
                                   {"SSL_CTX_use_certificate_chain_file", NULL},
                                   {"SSLv23_client_method", NULL},
                                   {"SSL_pending", NULL},
                                   {"SSL_CTX_set_verify", NULL},
                                   {"SSL_shutdown", NULL},
                                   {"SSL_CTX_load_verify_locations", NULL},
                                   {"SSL_CTX_set_default_verify_paths", NULL},
                                   {"SSL_CTX_set_verify_depth", NULL},
                                   {"SSL_get_peer_certificate", NULL},
                                   {"SSL_get_version", NULL},
                                   {"SSL_get_current_cipher", NULL},
                                   {"SSL_CIPHER_get_name", NULL},
                                   {"SSL_CTX_check_private_key", NULL},
                                   {"SSL_CTX_set_session_id_context", NULL},
                                   {"SSL_CTX_ctrl", NULL},
                                   {"SSL_CTX_set_cipher_list", NULL},
                                   {"SSL_CTX_set_info_callback", NULL},
                                   {"SSL_get_ex_data", NULL},
                                   {"SSL_set_ex_data", NULL},
                                   {"SSL_CTX_callback_ctrl", NULL},
                                   {"SSL_get_servername", NULL},
                                   {"SSL_set_SSL_CTX", NULL},
                                   {NULL, NULL}};


/* Similar array as ssl_sw. These functions could be located in different
 * lib. */
static struct ssl_func crypto_sw[] = {{"CRYPTO_num_locks", NULL},
                                      {"CRYPTO_set_locking_callback", NULL},
                                      {"CRYPTO_set_id_callback", NULL},
                                      {"ERR_get_error", NULL},
                                      {"ERR_error_string", NULL},
                                      {"ERR_remove_state", NULL},
                                      {"ERR_free_strings", NULL},
                                      {"ENGINE_cleanup", NULL},
                                      {"CONF_modules_unload", NULL},
                                      {"CRYPTO_cleanup_all_ex_data", NULL},
                                      {"EVP_cleanup", NULL},
                                      {"X509_free", NULL},
                                      {"X509_get_subject_name", NULL},
                                      {"X509_get_issuer_name", NULL},
                                      {"X509_NAME_oneline", NULL},
                                      {"X509_get_serialNumber", NULL},
                                      {"i2c_ASN1_INTEGER", NULL},
                                      {"EVP_get_digestbyname", NULL},
                                      {"EVP_Digest", NULL},
                                      {"i2d_X509", NULL},
                                      {"BN_bn2hex", NULL},
                                      {"ASN1_INTEGER_to_BN", NULL},
                                      {"BN_free", NULL},
                                      {"CRYPTO_free", NULL},
                                      {NULL, NULL}};
#endif /* OPENSSL_API_1_1 */
#endif /* NO_SSL_DL */
#endif /* NO_SSL */


#if !defined(NO_CACHING)
static const char *month_names[] = {"Jan",
                                    "Feb",
                                    "Mar",
                                    "Apr",
                                    "May",
                                    "Jun",
                                    "Jul",
                                    "Aug",
                                    "Sep",
                                    "Oct",
                                    "Nov",
                                    "Dec"};
#endif /* !NO_CACHING */

/* Unified socket address. For IPv6 support, add IPv6 address structure in
 * the
 * union u. */
union usa {
	struct sockaddr sa;
	struct sockaddr_in sin;
#if defined(USE_IPV6)
	struct sockaddr_in6 sin6;
#endif
};

/* Describes a string (chunk of memory). */
struct vec {
	const char *ptr;
	size_t len;
};

struct mg_file_stat {
	/* File properties filled by mg_stat: */
	uint64_t size;
	time_t last_modified;
	int is_directory; /* Set to 1 if mg_stat is called for a directory */
	int is_gzipped;   /* Set to 1 if the content is gzipped, in which
	                   * case we need a "Content-Eencoding: gzip" header */
	int location;     /* 0 = nowhere, 1 = on disk, 2 = in memory */
};

struct mg_file_in_memory {
	char *p;
	uint32_t pos;
	char mode;
};

struct mg_file_access {
	/* File properties filled by mg_fopen: */
	FILE *fp;
#if defined(MG_USE_OPEN_FILE)
	/* TODO (low): Remove obsolete "file in memory" implementation.
	 * In an "early 2017" discussion at Google groups
	 * https://groups.google.com/forum/#!topic/civetweb/h9HT4CmeYqI
	 * we decided to get rid of this feature (after some fade-out
	 * phase). */
	const char *membuf;
#endif
};

struct mg_file {
	struct mg_file_stat stat;
	struct mg_file_access access;
};

#if defined(MG_USE_OPEN_FILE)

#define STRUCT_FILE_INITIALIZER                                                \
	{                                                                          \
		{(uint64_t)0, (time_t)0, 0, 0, 0},                                     \
		{                                                                      \
			(FILE *)NULL, (const char *)NULL                                   \
		}                                                                      \
	}

#else

#define STRUCT_FILE_INITIALIZER                                                \
	{                                                                          \
		{(uint64_t)0, (time_t)0, 0, 0, 0},                                     \
		{                                                                      \
			(FILE *)NULL                                                       \
		}                                                                      \
	}

#endif


/* Describes listening socket, or socket which was accept()-ed by the master
 * thread and queued for future handling by the worker thread. */
struct socket {
	SOCKET sock;             /* Listening socket */
	union usa lsa;           /* Local socket address */
	union usa rsa;           /* Remote socket address */
	unsigned char is_ssl;    /* Is port SSL-ed */
	unsigned char ssl_redir; /* Is port supposed to redirect everything to SSL
	                          * port */
	unsigned char in_use;    /* Is valid */
};


/* Enum const for all options must be in sync with
 * static struct mg_option config_options[]
 * This is tested in the unit test (test/private.c)
 * "Private Config Options"
 */
enum {
	/* Once for each server */
	LISTENING_PORTS,
	NUM_THREADS,
	RUN_AS_USER,
	CONFIG_TCP_NODELAY, /* Prepended CONFIG_ to avoid conflict with the
	                     * socket option typedef TCP_NODELAY. */
	MAX_REQUEST_SIZE,
	LINGER_TIMEOUT,
#if defined(__linux__)
	ALLOW_SENDFILE_CALL,
#endif
#if defined(_WIN32)
	CASE_SENSITIVE_FILES,
#endif
	THROTTLE,
	ACCESS_LOG_FILE,
	ERROR_LOG_FILE,
	ENABLE_KEEP_ALIVE,
	REQUEST_TIMEOUT,
	KEEP_ALIVE_TIMEOUT,
#if defined(USE_WEBSOCKET)
	WEBSOCKET_TIMEOUT,
	ENABLE_WEBSOCKET_PING_PONG,
#endif
	DECODE_URL,
#if defined(USE_LUA)
	LUA_BACKGROUND_SCRIPT,
	LUA_BACKGROUND_SCRIPT_PARAMS,
#endif
#if defined(USE_TIMERS)
	CGI_TIMEOUT,
#endif

	/* Once for each domain */
	DOCUMENT_ROOT,
	CGI_EXTENSIONS,
	CGI_ENVIRONMENT,
	PUT_DELETE_PASSWORDS_FILE,
	CGI_INTERPRETER,
	PROTECT_URI,
	AUTHENTICATION_DOMAIN,
	ENABLE_AUTH_DOMAIN_CHECK,
	SSI_EXTENSIONS,
	ENABLE_DIRECTORY_LISTING,
	GLOBAL_PASSWORDS_FILE,
	INDEX_FILES,
	ACCESS_CONTROL_LIST,
	EXTRA_MIME_TYPES,
	SSL_CERTIFICATE,
	SSL_CERTIFICATE_CHAIN,
	URL_REWRITE_PATTERN,
	HIDE_FILES,
	SSL_DO_VERIFY_PEER,
	SSL_CA_PATH,
	SSL_CA_FILE,
	SSL_VERIFY_DEPTH,
	SSL_DEFAULT_VERIFY_PATHS,
	SSL_CIPHER_LIST,
	SSL_PROTOCOL_VERSION,
	SSL_SHORT_TRUST,

#if defined(USE_LUA)
	LUA_PRELOAD_FILE,
	LUA_SCRIPT_EXTENSIONS,
	LUA_SERVER_PAGE_EXTENSIONS,
#if defined(MG_EXPERIMENTAL_INTERFACES)
	LUA_DEBUG_PARAMS,
#endif
#endif
#if defined(USE_DUKTAPE)
	DUKTAPE_SCRIPT_EXTENSIONS,
#endif

#if defined(USE_WEBSOCKET)
	WEBSOCKET_ROOT,
#endif
#if defined(USE_LUA) && defined(USE_WEBSOCKET)
	LUA_WEBSOCKET_EXTENSIONS,
#endif

	ACCESS_CONTROL_ALLOW_ORIGIN,
	ACCESS_CONTROL_ALLOW_METHODS,
	ACCESS_CONTROL_ALLOW_HEADERS,
	ERROR_PAGES,
#if !defined(NO_CACHING)
	STATIC_FILE_MAX_AGE,
#endif
#if !defined(NO_SSL)
	STRICT_HTTPS_MAX_AGE,
#endif
	ADDITIONAL_HEADER,
	ALLOW_INDEX_SCRIPT_SUB_RES,

	NUM_OPTIONS
};


/* Config option name, config types, default value.
 * Must be in the same order as the enum const above.
 */
static const struct mg_option config_options[] = {

    /* Once for each server */
    {"listening_ports", MG_CONFIG_TYPE_STRING_LIST, "8080"},
    {"num_threads", MG_CONFIG_TYPE_NUMBER, "50"},
    {"run_as_user", MG_CONFIG_TYPE_STRING, NULL},
    {"tcp_nodelay", MG_CONFIG_TYPE_NUMBER, "0"},
    {"max_request_size", MG_CONFIG_TYPE_NUMBER, "16384"},
    {"linger_timeout_ms", MG_CONFIG_TYPE_NUMBER, NULL},
#if defined(__linux__)
    {"allow_sendfile_call", MG_CONFIG_TYPE_BOOLEAN, "yes"},
#endif
#if defined(_WIN32)
    {"case_sensitive", MG_CONFIG_TYPE_BOOLEAN, "no"},
#endif
    {"throttle", MG_CONFIG_TYPE_STRING_LIST, NULL},
    {"access_log_file", MG_CONFIG_TYPE_FILE, NULL},
    {"error_log_file", MG_CONFIG_TYPE_FILE, NULL},
    {"enable_keep_alive", MG_CONFIG_TYPE_BOOLEAN, "no"},
    {"request_timeout_ms", MG_CONFIG_TYPE_NUMBER, "30000"},
    {"keep_alive_timeout_ms", MG_CONFIG_TYPE_NUMBER, "500"},
#if defined(USE_WEBSOCKET)
    {"websocket_timeout_ms", MG_CONFIG_TYPE_NUMBER, NULL},
    {"enable_websocket_ping_pong", MG_CONFIG_TYPE_BOOLEAN, "no"},
#endif
    {"decode_url", MG_CONFIG_TYPE_BOOLEAN, "yes"},
#if defined(USE_LUA)
    {"lua_background_script", MG_CONFIG_TYPE_FILE, NULL},
    {"lua_background_script_params", MG_CONFIG_TYPE_STRING_LIST, NULL},
#endif
#if defined(USE_TIMERS)
    {"cgi_timeout_ms", MG_CONFIG_TYPE_NUMBER, NULL},
#endif

    /* Once for each domain */
    {"document_root", MG_CONFIG_TYPE_DIRECTORY, NULL},
    {"cgi_pattern", MG_CONFIG_TYPE_EXT_PATTERN, "**.cgi$|**.pl$|**.php$"},
    {"cgi_environment", MG_CONFIG_TYPE_STRING_LIST, NULL},
    {"put_delete_auth_file", MG_CONFIG_TYPE_FILE, NULL},
    {"cgi_interpreter", MG_CONFIG_TYPE_FILE, NULL},
    {"protect_uri", MG_CONFIG_TYPE_STRING_LIST, NULL},
    {"authentication_domain", MG_CONFIG_TYPE_STRING, "mydomain.com"},
    {"enable_auth_domain_check", MG_CONFIG_TYPE_BOOLEAN, "yes"},
    {"ssi_pattern", MG_CONFIG_TYPE_EXT_PATTERN, "**.shtml$|**.shtm$"},
    {"enable_directory_listing", MG_CONFIG_TYPE_BOOLEAN, "yes"},
    {"global_auth_file", MG_CONFIG_TYPE_FILE, NULL},
    {"index_files",
     MG_CONFIG_TYPE_STRING_LIST,
#if defined(USE_LUA)
     "index.xhtml,index.html,index.htm,"
     "index.lp,index.lsp,index.lua,index.cgi,"
     "index.shtml,index.php"},
#else
     "index.xhtml,index.html,index.htm,index.cgi,index.shtml,index.php"},
#endif
    {"access_control_list", MG_CONFIG_TYPE_STRING_LIST, NULL},
    {"extra_mime_types", MG_CONFIG_TYPE_STRING_LIST, NULL},
    {"ssl_certificate", MG_CONFIG_TYPE_FILE, NULL},
    {"ssl_certificate_chain", MG_CONFIG_TYPE_FILE, NULL},
    {"url_rewrite_patterns", MG_CONFIG_TYPE_STRING_LIST, NULL},
    {"hide_files_patterns", MG_CONFIG_TYPE_EXT_PATTERN, NULL},

    {"ssl_verify_peer", MG_CONFIG_TYPE_YES_NO_OPTIONAL, "no"},

    {"ssl_ca_path", MG_CONFIG_TYPE_DIRECTORY, NULL},
    {"ssl_ca_file", MG_CONFIG_TYPE_FILE, NULL},
    {"ssl_verify_depth", MG_CONFIG_TYPE_NUMBER, "9"},
    {"ssl_default_verify_paths", MG_CONFIG_TYPE_BOOLEAN, "yes"},
    {"ssl_cipher_list", MG_CONFIG_TYPE_STRING, NULL},
    {"ssl_protocol_version", MG_CONFIG_TYPE_NUMBER, "0"},
    {"ssl_short_trust", MG_CONFIG_TYPE_BOOLEAN, "no"},

#if defined(USE_LUA)
    {"lua_preload_file", MG_CONFIG_TYPE_FILE, NULL},
    {"lua_script_pattern", MG_CONFIG_TYPE_EXT_PATTERN, "**.lua$"},
    {"lua_server_page_pattern", MG_CONFIG_TYPE_EXT_PATTERN, "**.lp$|**.lsp$"},
#if defined(MG_EXPERIMENTAL_INTERFACES)
    {"lua_debug", MG_CONFIG_TYPE_STRING, NULL},
#endif
#endif
#if defined(USE_DUKTAPE)
    /* The support for duktape is still in alpha version state.
     * The name of this config option might change. */
    {"duktape_script_pattern", MG_CONFIG_TYPE_EXT_PATTERN, "**.ssjs$"},
#endif

#if defined(USE_WEBSOCKET)
    {"websocket_root", MG_CONFIG_TYPE_DIRECTORY, NULL},
#endif
#if defined(USE_LUA) && defined(USE_WEBSOCKET)
    {"lua_websocket_pattern", MG_CONFIG_TYPE_EXT_PATTERN, "**.lua$"},
#endif
    {"access_control_allow_origin", MG_CONFIG_TYPE_STRING, "*"},
    {"access_control_allow_methods", MG_CONFIG_TYPE_STRING, "*"},
    {"access_control_allow_headers", MG_CONFIG_TYPE_STRING, "*"},
    {"error_pages", MG_CONFIG_TYPE_DIRECTORY, NULL},
#if !defined(NO_CACHING)
    {"static_file_max_age", MG_CONFIG_TYPE_NUMBER, "3600"},
#endif
#if !defined(NO_SSL)
    {"strict_transport_security_max_age", MG_CONFIG_TYPE_NUMBER, NULL},
#endif
    {"additional_header", MG_CONFIG_TYPE_STRING_MULTILINE, NULL},
    {"allow_index_script_resource", MG_CONFIG_TYPE_BOOLEAN, "no"},

    {NULL, MG_CONFIG_TYPE_UNKNOWN, NULL}};


/* Check if the config_options and the corresponding enum have compatible
 * sizes. */
mg_static_assert((sizeof(config_options) / sizeof(config_options[0]))
                     == (NUM_OPTIONS + 1),
                 "config_options and enum not sync");


enum { REQUEST_HANDLER, WEBSOCKET_HANDLER, AUTH_HANDLER };


struct mg_handler_info {
	/* Name/Pattern of the URI. */
	char *uri;
	size_t uri_len;

	/* handler type */
	int handler_type;

	/* Handler for http/https or authorization requests. */
	mg_request_handler handler;
	unsigned int refcount;
	pthread_mutex_t refcount_mutex; /* Protects refcount */
	pthread_cond_t
	    refcount_cond; /* Signaled when handler refcount is decremented */

	/* Handler for ws/wss (websocket) requests. */
	mg_websocket_connect_handler connect_handler;
	mg_websocket_ready_handler ready_handler;
	mg_websocket_data_handler data_handler;
	mg_websocket_close_handler close_handler;

	/* accepted subprotocols for ws/wss requests. */
	struct mg_websocket_subprotocols *subprotocols;

	/* Handler for authorization requests */
	mg_authorization_handler auth_handler;

	/* User supplied argument for the handler function. */
	void *cbdata;

	/* next handler in a linked list */
	struct mg_handler_info *next;
};


enum {
	CONTEXT_INVALID,
	CONTEXT_SERVER,
	CONTEXT_HTTP_CLIENT,
	CONTEXT_WS_CLIENT
};


struct mg_domain_context {
	SSL_CTX *ssl_ctx;                 /* SSL context */
	char *config[NUM_OPTIONS];        /* Civetweb configuration parameters */
	struct mg_handler_info *handlers; /* linked list of uri handlers */

	/* Server nonce */
	uint64_t auth_nonce_mask;  /* Mask for all nonce values */
	unsigned long nonce_count; /* Used nonces, used for authentication */

#if defined(USE_LUA) && defined(USE_WEBSOCKET)
	/* linked list of shared lua websockets */
	struct mg_shared_lua_websocket_list *shared_lua_websockets;
#endif

	/* Linked list of domains */
	struct mg_domain_context *next;
};


struct mg_context {

	/* Part 1 - Physical context:
	 * This holds threads, ports, timeouts, ...
	 * set for the entire server, independent from the
	 * addressed hostname.
	 */

	/* Connection related */
	int context_type; /* See CONTEXT_* above */

	struct socket *listening_sockets;
	struct pollfd *listening_socket_fds;
	unsigned int num_listening_sockets;

	struct mg_connection *worker_connections; /* The connection struct, pre-
	                                           * allocated for each worker */

#if defined(USE_SERVER_STATS)
	int active_connections;
	int max_connections;
	int64_t total_connections;
	int64_t total_requests;
	int64_t total_data_read;
	int64_t total_data_written;
#endif

	/* Thread related */
	volatile int stop_flag;       /* Should we stop event loop */
	pthread_mutex_t thread_mutex; /* Protects (max|num)_threads */

	pthread_t masterthreadid; /* The master thread ID */
	unsigned int
	    cfg_worker_threads;      /* The number of configured worker threads. */
	pthread_t *worker_threadids; /* The worker thread IDs */

/* Connection to thread dispatching */
#if defined(ALTERNATIVE_QUEUE)
	struct socket *client_socks;
	void **client_wait_events;
#else
	struct socket queue[MGSQLEN]; /* Accepted sockets */
	volatile int sq_head;         /* Head of the socket queue */
	volatile int sq_tail;         /* Tail of the socket queue */
	pthread_cond_t sq_full;       /* Signaled when socket is produced */
	pthread_cond_t sq_empty;      /* Signaled when socket is consumed */
#endif

	/* Memory related */
	unsigned int max_request_size; /* The max request size */

#if defined(USE_SERVER_STATS)
	struct mg_memory_stat ctx_memory;
#endif

	/* Operating system related */
	char *systemName;  /* What operating system is running */
	time_t start_time; /* Server start time, used for authentication
	                    * and for diagnstics. */

#if defined(USE_TIMERS)
	struct ttimers *timers;
#endif

/* Lua specific: Background operations and shared websockets */
#if defined(USE_LUA)
	void *lua_background_state;
#endif

	/* Server nonce */
	pthread_mutex_t nonce_mutex; /* Protects nonce_count */

	/* Server callbacks */
	struct mg_callbacks callbacks; /* User-defined callback function */
	void *user_data;               /* User-defined data */

	/* Part 2 - Logical domain:
	 * This holds hostname, TLS certificate, document root, ...
	 * set for a domain hosted at the server.
	 * There may be multiple domains hosted at one physical server.
	 * The default domain "dd" is the first element of a list of
	 * domains.
	 */
	struct mg_domain_context dd; /* default domain */
};


#if defined(USE_SERVER_STATS)
static struct mg_memory_stat mg_common_memory = {0, 0, 0};

static struct mg_memory_stat *
get_memory_stat(struct mg_context *ctx)
{
	if (ctx) {
		return &(ctx->ctx_memory);
	}
	return &mg_common_memory;
}
#endif

enum {
	CONNECTION_TYPE_INVALID,
	CONNECTION_TYPE_REQUEST,
	CONNECTION_TYPE_RESPONSE
};

struct mg_connection {
	int connection_type; /* see CONNECTION_TYPE_* above */

	struct mg_request_info request_info;
	struct mg_response_info response_info;

	struct mg_context *phys_ctx;
	struct mg_domain_context *dom_ctx;

#if defined(USE_SERVER_STATS)
	int conn_state; /* 0 = undef, numerical value may change in different
	                 * versions. For the current definition, see
	                 * mg_get_connection_info_impl */
#endif

	const char *host;         /* Host (HTTP/1.1 header or SNI) */
	SSL *ssl;                 /* SSL descriptor */
	SSL_CTX *client_ssl_ctx;  /* SSL context for client connections */
	struct socket client;     /* Connected client */
	time_t conn_birth_time;   /* Time (wall clock) when connection was
	                           * established */
	struct timespec req_time; /* Time (since system start) when the request
	                           * was received */
	int64_t num_bytes_sent;   /* Total bytes sent to client */
	int64_t content_len;      /* Content-Length header value */
	int64_t consumed_content; /* How many bytes of content have been read */
	int is_chunked;           /* Transfer-Encoding is chunked:
	                           * 0 = not chunked,
	                           * 1 = chunked, do data read yet,
	                           * 2 = chunked, some data read,
	                           * 3 = chunked, all data read
	                           */
	size_t chunk_remainder;   /* Unread data from the last chunk */
	char *buf;                /* Buffer for received data */
	char *path_info;          /* PATH_INFO part of the URL */

	int must_close;       /* 1 if connection must be closed */
	int accept_gzip;      /* 1 if gzip encoding is accepted */
	int in_error_handler; /* 1 if in handler for user defined error
	                       * pages */
#if defined(USE_WEBSOCKET)
	int in_websocket_handling; /* 1 if in read_websocket */
#endif
	int handled_requests; /* Number of requests handled by this connection
	                       */
	int buf_size;         /* Buffer size */
	int request_len;      /* Size of the request + headers in a buffer */
	int data_len;         /* Total size of data in a buffer */
	int status_code;      /* HTTP reply status code, e.g. 200 */
	int throttle;         /* Throttling, bytes/sec. <= 0 means no
	                       * throttle */

	time_t last_throttle_time;   /* Last time throttled data was sent */
	int64_t last_throttle_bytes; /* Bytes sent this second */
	pthread_mutex_t mutex;       /* Used by mg_(un)lock_connection to ensure
	                              * atomic transmissions for websockets */
#if defined(USE_LUA) && defined(USE_WEBSOCKET)
	void *lua_websocket_state; /* Lua_State for a websocket connection */
#endif

	int thread_index; /* Thread index within ctx */
};


/* Directory entry */
struct de {
	struct mg_connection *conn;
	char *file_name;
	struct mg_file_stat file;
};


#if defined(USE_WEBSOCKET)
static int is_websocket_protocol(const struct mg_connection *conn);
#else
#define is_websocket_protocol(conn) (0)
#endif


#define mg_cry_internal(conn, fmt, ...)                                        \
	mg_cry_internal_wrap(conn, __func__, __LINE__, fmt, __VA_ARGS__)

static void mg_cry_internal_wrap(const struct mg_connection *conn,
                                 const char *func,
                                 unsigned line,
                                 const char *fmt,
                                 ...) PRINTF_ARGS(4, 5);


#if !defined(NO_THREAD_NAME)
#if defined(_WIN32) && defined(_MSC_VER)
/* Set the thread name for debugging purposes in Visual Studio
 * http://msdn.microsoft.com/en-us/library/xcb2z8hs.aspx
 */
#pragma pack(push, 8)
typedef struct tagTHREADNAME_INFO {
	DWORD dwType;     /* Must be 0x1000. */
	LPCSTR szName;    /* Pointer to name (in user addr space). */
	DWORD dwThreadID; /* Thread ID (-1=caller thread). */
	DWORD dwFlags;    /* Reserved for future use, must be zero. */
} THREADNAME_INFO;
#pragma pack(pop)

#elif defined(__linux__)

#include <sys/prctl.h>
#include <sys/sendfile.h>
#if defined(ALTERNATIVE_QUEUE)
#include <sys/eventfd.h>
#endif /* ALTERNATIVE_QUEUE */


#if defined(ALTERNATIVE_QUEUE)

static void *
event_create(void)
{
	int evhdl = eventfd(0, EFD_CLOEXEC);
	int *ret;

	if (evhdl == -1) {
		/* Linux uses -1 on error, Windows NULL. */
		/* However, Linux does not return 0 on success either. */
		return 0;
	}

	ret = (int *)mg_malloc(sizeof(int));
	if (ret) {
		*ret = evhdl;
	} else {
		(void)close(evhdl);
	}

	return (void *)ret;
}


static int
event_wait(void *eventhdl)
{
	uint64_t u;
	int evhdl, s;

	if (!eventhdl) {
		/* error */
		return 0;
	}
	evhdl = *(int *)eventhdl;

	s = (int)read(evhdl, &u, sizeof(u));
	if (s != sizeof(u)) {
		/* error */
		return 0;
	}
	(void)u; /* the value is not required */
	return 1;
}


static int
event_signal(void *eventhdl)
{
	uint64_t u = 1;
	int evhdl, s;

	if (!eventhdl) {
		/* error */
		return 0;
	}
	evhdl = *(int *)eventhdl;

	s = (int)write(evhdl, &u, sizeof(u));
	if (s != sizeof(u)) {
		/* error */
		return 0;
	}
	return 1;
}


static void
event_destroy(void *eventhdl)
{
	int evhdl;

	if (!eventhdl) {
		/* error */
		return;
	}
	evhdl = *(int *)eventhdl;

	close(evhdl);
	mg_free(eventhdl);
}


#endif

#endif


#if !defined(__linux__) && !defined(_WIN32) && defined(ALTERNATIVE_QUEUE)

struct posix_event {
	pthread_mutex_t mutex;
	pthread_cond_t cond;
};


static void *
event_create(void)
{
	struct posix_event *ret = mg_malloc(sizeof(struct posix_event));
	if (ret == 0) {
		/* out of memory */
		return 0;
	}
	if (0 != pthread_mutex_init(&(ret->mutex), NULL)) {
		/* pthread mutex not available */
		mg_free(ret);
		return 0;
	}
	if (0 != pthread_cond_init(&(ret->cond), NULL)) {
		/* pthread cond not available */
		pthread_mutex_destroy(&(ret->mutex));
		mg_free(ret);
		return 0;
	}
	return (void *)ret;
}


static int
event_wait(void *eventhdl)
{
	struct posix_event *ev = (struct posix_event *)eventhdl;
	pthread_mutex_lock(&(ev->mutex));
	pthread_cond_wait(&(ev->cond), &(ev->mutex));
	pthread_mutex_unlock(&(ev->mutex));
	return 1;
}


static int
event_signal(void *eventhdl)
{
	struct posix_event *ev = (struct posix_event *)eventhdl;
	pthread_mutex_lock(&(ev->mutex));
	pthread_cond_signal(&(ev->cond));
	pthread_mutex_unlock(&(ev->mutex));
	return 1;
}


static void
event_destroy(void *eventhdl)
{
	struct posix_event *ev = (struct posix_event *)eventhdl;
	pthread_cond_destroy(&(ev->cond));
	pthread_mutex_destroy(&(ev->mutex));
	mg_free(ev);
}
#endif


static void
mg_set_thread_name(const char *name)
{
	char threadName[16 + 1]; /* 16 = Max. thread length in Linux/OSX/.. */

	mg_snprintf(
	    NULL, NULL, threadName, sizeof(threadName), "civetweb-%s", name);

#if defined(_WIN32)
#if defined(_MSC_VER)
	/* Windows and Visual Studio Compiler */
	__try {
		THREADNAME_INFO info;
		info.dwType = 0x1000;
		info.szName = threadName;
		info.dwThreadID = ~0U;
		info.dwFlags = 0;

		RaiseException(0x406D1388,
		               0,
		               sizeof(info) / sizeof(ULONG_PTR),
		               (ULONG_PTR *)&info);
	} __except (EXCEPTION_EXECUTE_HANDLER) {
	}
#elif defined(__MINGW32__)
/* No option known to set thread name for MinGW */
#endif
#elif defined(_GNU_SOURCE) && defined(__GLIBC__)                               \
    && ((__GLIBC__ > 2) || ((__GLIBC__ == 2) && (__GLIBC_MINOR__ >= 12)))
/* pthread_setname_np first appeared in glibc in version 2.12*/
#if defined(__MACH__)
	/* OS X only current thread name can be changed */
	(void)pthread_setname_np(threadName);
#else
	(void)pthread_setname_np(pthread_self(), threadName);
#endif
#elif defined(__linux__)
	/* on linux we can use the old prctl function */
	(void)prctl(PR_SET_NAME, threadName, 0, 0, 0);
#endif
}
#else /* !defined(NO_THREAD_NAME) */
void
mg_set_thread_name(const char *threadName)
{
}
#endif


#if defined(MG_LEGACY_INTERFACE)
const char **
mg_get_valid_option_names(void)
{
	/* This function is deprecated. Use mg_get_valid_options instead. */
	static const char
	    *data[2 * sizeof(config_options) / sizeof(config_options[0])] = {0};
	int i;

	for (i = 0; config_options[i].name != NULL; i++) {
		data[i * 2] = config_options[i].name;
		data[i * 2 + 1] = config_options[i].default_value;
	}

	return data;
}
#endif


const struct mg_option *
mg_get_valid_options(void)
{
	return config_options;
}


/* Do not open file (used in is_file_in_memory) */
#define MG_FOPEN_MODE_NONE (0)

/* Open file for read only access */
#define MG_FOPEN_MODE_READ (1)

/* Open file for writing, create and overwrite */
#define MG_FOPEN_MODE_WRITE (2)

/* Open file for writing, create and append */
#define MG_FOPEN_MODE_APPEND (4)


/* If a file is in memory, set all "stat" members and the membuf pointer of
 * output filep and return 1, otherwise return 0 and don't modify anything.
 */
static int
open_file_in_memory(const struct mg_connection *conn,
                    const char *path,
                    struct mg_file *filep,
                    int mode)
{
#if defined(MG_USE_OPEN_FILE)

	size_t size = 0;
	const char *buf = NULL;
	if (!conn) {
		return 0;
	}

	if ((mode != MG_FOPEN_MODE_NONE) && (mode != MG_FOPEN_MODE_READ)) {
		return 0;
	}

	if (conn->phys_ctx->callbacks.open_file) {
		buf = conn->phys_ctx->callbacks.open_file(conn, path, &size);
		if (buf != NULL) {
			if (filep == NULL) {
				/* This is a file in memory, but we cannot store the
				 * properties
				 * now.
				 * Called from "is_file_in_memory" function. */
				return 1;
			}

			/* NOTE: override filep->size only on success. Otherwise, it
			 * might
			 * break constructs like if (!mg_stat() || !mg_fopen()) ... */
			filep->access.membuf = buf;
			filep->access.fp = NULL;

			/* Size was set by the callback */
			filep->stat.size = size;

			/* Assume the data may change during runtime by setting
			 * last_modified = now */
			filep->stat.last_modified = time(NULL);

			filep->stat.is_directory = 0;
			filep->stat.is_gzipped = 0;
		}
	}

	return (buf != NULL);

#else
	(void)conn;
	(void)path;
	(void)filep;
	(void)mode;

	return 0;

#endif
}


static int
is_file_in_memory(const struct mg_connection *conn, const char *path)
{
	return open_file_in_memory(conn, path, NULL, MG_FOPEN_MODE_NONE);
}


static int
is_file_opened(const struct mg_file_access *fileacc)
{
	if (!fileacc) {
		return 0;
	}

#if defined(MG_USE_OPEN_FILE)
	return (fileacc->membuf != NULL) || (fileacc->fp != NULL);
#else
	return (fileacc->fp != NULL);
#endif
}


static int mg_stat(const struct mg_connection *conn,
                   const char *path,
                   struct mg_file_stat *filep);


/* mg_fopen will open a file either in memory or on the disk.
 * The input parameter path is a string in UTF-8 encoding.
 * The input parameter mode is MG_FOPEN_MODE_*
 * On success, either fp or membuf will be set in the output
 * struct file. All status members will also be set.
 * The function returns 1 on success, 0 on error. */
static int
mg_fopen(const struct mg_connection *conn,
         const char *path,
         int mode,
         struct mg_file *filep)
{
	int found;

	if (!filep) {
		return 0;
	}
	filep->access.fp = NULL;
#if defined(MG_USE_OPEN_FILE)
	filep->access.membuf = NULL;
#endif

	if (!is_file_in_memory(conn, path)) {

		/* filep is initialized in mg_stat: all fields with memset to,
		 * some fields like size and modification date with values */
		found = mg_stat(conn, path, &(filep->stat));

		if ((mode == MG_FOPEN_MODE_READ) && (!found)) {
			/* file does not exist and will not be created */
			return 0;
		}

#if defined(_WIN32)
		{
			wchar_t wbuf[W_PATH_MAX];
			path_to_unicode(conn, path, wbuf, ARRAY_SIZE(wbuf));
			switch (mode) {
			case MG_FOPEN_MODE_READ:
				filep->access.fp = _wfopen(wbuf, L"rb");
				break;
			case MG_FOPEN_MODE_WRITE:
				filep->access.fp = _wfopen(wbuf, L"wb");
				break;
			case MG_FOPEN_MODE_APPEND:
				filep->access.fp = _wfopen(wbuf, L"ab");
				break;
			}
		}
#else
		/* Linux et al already use unicode. No need to convert. */
		switch (mode) {
		case MG_FOPEN_MODE_READ:
			filep->access.fp = fopen(path, "r");
			break;
		case MG_FOPEN_MODE_WRITE:
			filep->access.fp = fopen(path, "w");
			break;
		case MG_FOPEN_MODE_APPEND:
			filep->access.fp = fopen(path, "a");
			break;
		}

#endif
		if (!found) {
			/* File did not exist before fopen was called.
			 * Maybe it has been created now. Get stat info
			 * like creation time now. */
			found = mg_stat(conn, path, &(filep->stat));
			(void)found;
		}

		/* file is on disk */
		return (filep->access.fp != NULL);

	} else {
#if defined(MG_USE_OPEN_FILE)
		/* is_file_in_memory returned true */
		if (open_file_in_memory(conn, path, filep, mode)) {
			/* file is in memory */
			return (filep->access.membuf != NULL);
		}
#endif
	}

	/* Open failed */
	return 0;
}


/* return 0 on success, just like fclose */
static int
mg_fclose(struct mg_file_access *fileacc)
{
	int ret = -1;
	if (fileacc != NULL) {
		if (fileacc->fp != NULL) {
			ret = fclose(fileacc->fp);
#if defined(MG_USE_OPEN_FILE)
		} else if (fileacc->membuf != NULL) {
			ret = 0;
#endif
		}
		/* reset all members of fileacc */
		memset(fileacc, 0, sizeof(*fileacc));
	}
	return ret;
}


static void
mg_strlcpy(register char *dst, register const char *src, size_t n)
{
	for (; *src != '\0' && n > 1; n--) {
		*dst++ = *src++;
	}
	*dst = '\0';
}


static int
lowercase(const char *s)
{
	return tolower(*(const unsigned char *)s);
}


int
mg_strncasecmp(const char *s1, const char *s2, size_t len)
{
	int diff = 0;

	if (len > 0) {
		do {
			diff = lowercase(s1++) - lowercase(s2++);
		} while (diff == 0 && s1[-1] != '\0' && --len > 0);
	}

	return diff;
}


int
mg_strcasecmp(const char *s1, const char *s2)
{
	int diff;

	do {
		diff = lowercase(s1++) - lowercase(s2++);
	} while (diff == 0 && s1[-1] != '\0');

	return diff;
}


static char *
mg_strndup_ctx(const char *ptr, size_t len, struct mg_context *ctx)
{
	char *p;
	(void)ctx; /* Avoid Visual Studio warning if USE_SERVER_STATS is not
	            * defined */

	if ((p = (char *)mg_malloc_ctx(len + 1, ctx)) != NULL) {
		mg_strlcpy(p, ptr, len + 1);
	}

	return p;
}


static char *
mg_strdup_ctx(const char *str, struct mg_context *ctx)
{
	return mg_strndup_ctx(str, strlen(str), ctx);
}

static char *
mg_strdup(const char *str)
{
	return mg_strndup_ctx(str, strlen(str), NULL);
}


static const char *
mg_strcasestr(const char *big_str, const char *small_str)
{
	size_t i, big_len = strlen(big_str), small_len = strlen(small_str);

	if (big_len >= small_len) {
		for (i = 0; i <= (big_len - small_len); i++) {
			if (mg_strncasecmp(big_str + i, small_str, small_len) == 0) {
				return big_str + i;
			}
		}
	}

	return NULL;
}


/* Return null terminated string of given maximum length.
 * Report errors if length is exceeded. */
static void
mg_vsnprintf(const struct mg_connection *conn,
             int *truncated,
             char *buf,
             size_t buflen,
             const char *fmt,
             va_list ap)
{
	int n, ok;

	if (buflen == 0) {
		if (truncated) {
			*truncated = 1;
		}
		return;
	}

#if defined(__clang__)
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wformat-nonliteral"
/* Using fmt as a non-literal is intended here, since it is mostly called
 * indirectly by mg_snprintf */
#endif

	n = (int)vsnprintf_impl(buf, buflen, fmt, ap);
	ok = (n >= 0) && ((size_t)n < buflen);

#if defined(__clang__)
#pragma clang diagnostic pop
#endif

	if (ok) {
		if (truncated) {
			*truncated = 0;
		}
	} else {
		if (truncated) {
			*truncated = 1;
		}
		mg_cry_internal(conn,
		                "truncating vsnprintf buffer: [%.*s]",
		                (int)((buflen > 200) ? 200 : (buflen - 1)),
		                buf);
		n = (int)buflen - 1;
	}
	buf[n] = '\0';
}


static void
mg_snprintf(const struct mg_connection *conn,
            int *truncated,
            char *buf,
            size_t buflen,
            const char *fmt,
            ...)
{
	va_list ap;

	va_start(ap, fmt);
	mg_vsnprintf(conn, truncated, buf, buflen, fmt, ap);
	va_end(ap);
}


static int
get_option_index(const char *name)
{
	int i;

	for (i = 0; config_options[i].name != NULL; i++) {
		if (strcmp(config_options[i].name, name) == 0) {
			return i;
		}
	}
	return -1;
}


const char *
mg_get_option(const struct mg_context *ctx, const char *name)
{
	int i;
	if ((i = get_option_index(name)) == -1) {
		return NULL;
	} else if (!ctx || ctx->dd.config[i] == NULL) {
		return "";
	} else {
		return ctx->dd.config[i];
	}
}

#define mg_get_option DO_NOT_USE_THIS_FUNCTION_INTERNALLY__access_directly

struct mg_context *
mg_get_context(const struct mg_connection *conn)
{
	return (conn == NULL) ? (struct mg_context *)NULL : (conn->phys_ctx);
}


void *
mg_get_user_data(const struct mg_context *ctx)
{
	return (ctx == NULL) ? NULL : ctx->user_data;
}


void
mg_set_user_connection_data(struct mg_connection *conn, void *data)
{
	if (conn != NULL) {
		conn->request_info.conn_data = data;
	}
}


void *
mg_get_user_connection_data(const struct mg_connection *conn)
{
	if (conn != NULL) {
		return conn->request_info.conn_data;
	}
	return NULL;
}


#if defined(MG_LEGACY_INTERFACE)
/* Deprecated: Use mg_get_server_ports instead. */
size_t
mg_get_ports(const struct mg_context *ctx, size_t size, int *ports, int *ssl)
{
	size_t i;
	if (!ctx) {
		return 0;
	}
	for (i = 0; i < size && i < ctx->num_listening_sockets; i++) {
		ssl[i] = ctx->listening_sockets[i].is_ssl;
		ports[i] =
#if defined(USE_IPV6)
		    (ctx->listening_sockets[i].lsa.sa.sa_family == AF_INET6)
		        ? ntohs(ctx->listening_sockets[i].lsa.sin6.sin6_port)
		        :
#endif
		        ntohs(ctx->listening_sockets[i].lsa.sin.sin_port);
	}
	return i;
}
#endif


int
mg_get_server_ports(const struct mg_context *ctx,
                    int size,
                    struct mg_server_ports *ports)
{
	int i, cnt = 0;

	if (size <= 0) {
		return -1;
	}
	memset(ports, 0, sizeof(*ports) * (size_t)size);
	if (!ctx) {
		return -1;
	}
	if (!ctx->listening_sockets) {
		return -1;
	}

	for (i = 0; (i < size) && (i < (int)ctx->num_listening_sockets); i++) {

		ports[cnt].port =
#if defined(USE_IPV6)
		    (ctx->listening_sockets[i].lsa.sa.sa_family == AF_INET6)
		        ? ntohs(ctx->listening_sockets[i].lsa.sin6.sin6_port)
		        :
#endif
		        ntohs(ctx->listening_sockets[i].lsa.sin.sin_port);
		ports[cnt].is_ssl = ctx->listening_sockets[i].is_ssl;
		ports[cnt].is_redirect = ctx->listening_sockets[i].ssl_redir;

		if (ctx->listening_sockets[i].lsa.sa.sa_family == AF_INET) {
			/* IPv4 */
			ports[cnt].protocol = 1;
			cnt++;
		} else if (ctx->listening_sockets[i].lsa.sa.sa_family == AF_INET6) {
			/* IPv6 */
			ports[cnt].protocol = 3;
			cnt++;
		}
	}

	return cnt;
}


static void
sockaddr_to_string(char *buf, size_t len, const union usa *usa)
{
	buf[0] = '\0';

	if (!usa) {
		return;
	}

	if (usa->sa.sa_family == AF_INET) {
		getnameinfo(&usa->sa,
		            sizeof(usa->sin),
		            buf,
		            (unsigned)len,
		            NULL,
		            0,
		            NI_NUMERICHOST);
	}
#if defined(USE_IPV6)
	else if (usa->sa.sa_family == AF_INET6) {
		getnameinfo(&usa->sa,
		            sizeof(usa->sin6),
		            buf,
		            (unsigned)len,
		            NULL,
		            0,
		            NI_NUMERICHOST);
	}
#endif
}


/* Convert time_t to a string. According to RFC2616, Sec 14.18, this must be
 * included in all responses other than 100, 101, 5xx. */
static void
gmt_time_string(char *buf, size_t buf_len, time_t *t)
{
#if !defined(REENTRANT_TIME)
	struct tm *tm;

	tm = ((t != NULL) ? gmtime(t) : NULL);
	if (tm != NULL) {
#else
	struct tm _tm;
	struct tm *tm = &_tm;

	if (t != NULL) {
		gmtime_r(t, tm);
#endif
		strftime(buf, buf_len, "%a, %d %b %Y %H:%M:%S GMT", tm);
	} else {
		mg_strlcpy(buf, "Thu, 01 Jan 1970 00:00:00 GMT", buf_len);
		buf[buf_len - 1] = '\0';
	}
}


/* difftime for struct timespec. Return value is in seconds. */
static double
mg_difftimespec(const struct timespec *ts_now, const struct timespec *ts_before)
{
	return (double)(ts_now->tv_nsec - ts_before->tv_nsec) * 1.0E-9
	       + (double)(ts_now->tv_sec - ts_before->tv_sec);
}


#if defined(MG_EXTERNAL_FUNCTION_mg_cry_internal_impl)
static void mg_cry_internal_impl(const struct mg_connection *conn,
                                 const char *func,
                                 unsigned line,
                                 const char *fmt,
                                 va_list ap);
#include "external_mg_cry_internal_impl.inl"
#else

/* Print error message to the opened error log stream. */
static void
mg_cry_internal_impl(const struct mg_connection *conn,
                     const char *func,
                     unsigned line,
                     const char *fmt,
                     va_list ap)
{
	char buf[MG_BUF_LEN], src_addr[IP_ADDR_STR_LEN];
	struct mg_file fi;
	time_t timestamp;

	/* Unused, in the RELEASE build */
	(void)func;
	(void)line;

#if defined(GCC_DIAGNOSTIC)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wformat-nonliteral"
#endif

	IGNORE_UNUSED_RESULT(vsnprintf_impl(buf, sizeof(buf), fmt, ap));

#if defined(GCC_DIAGNOSTIC)
#pragma GCC diagnostic pop
#endif

	buf[sizeof(buf) - 1] = 0;

	DEBUG_TRACE("mg_cry called from %s:%u: %s", func, line, buf);

	if (!conn) {
		puts(buf);
		return;
	}

	/* Do not lock when getting the callback value, here and below.
	 * I suppose this is fine, since function cannot disappear in the
	 * same way string option can. */
	if ((conn->phys_ctx->callbacks.log_message == NULL)
	    || (conn->phys_ctx->callbacks.log_message(conn, buf) == 0)) {

		if (conn->dom_ctx->config[ERROR_LOG_FILE] != NULL) {
			if (mg_fopen(conn,
			             conn->dom_ctx->config[ERROR_LOG_FILE],
			             MG_FOPEN_MODE_APPEND,
			             &fi)
			    == 0) {
				fi.access.fp = NULL;
			}
		} else {
			fi.access.fp = NULL;
		}

		if (fi.access.fp != NULL) {
			flockfile(fi.access.fp);
			timestamp = time(NULL);

			sockaddr_to_string(src_addr, sizeof(src_addr), &conn->client.rsa);
			fprintf(fi.access.fp,
			        "[%010lu] [error] [client %s] ",
			        (unsigned long)timestamp,
			        src_addr);

			if (conn->request_info.request_method != NULL) {
				fprintf(fi.access.fp,
				        "%s %s: ",
				        conn->request_info.request_method,
				        conn->request_info.request_uri
				            ? conn->request_info.request_uri
				            : "");
			}

			fprintf(fi.access.fp, "%s", buf);
			fputc('\n', fi.access.fp);
			fflush(fi.access.fp);
			funlockfile(fi.access.fp);
			(void)mg_fclose(&fi.access); /* Ignore errors. We can't call
			                              * mg_cry here anyway ;-) */
		}
	}
}

#endif /* Externally provided function */


static void
mg_cry_internal_wrap(const struct mg_connection *conn,
                     const char *func,
                     unsigned line,
                     const char *fmt,
                     ...)
{
	va_list ap;
	va_start(ap, fmt);
	mg_cry_internal_impl(conn, func, line, fmt, ap);
	va_end(ap);
}


void
mg_cry(const struct mg_connection *conn, const char *fmt, ...)
{
	va_list ap;
	va_start(ap, fmt);
	mg_cry_internal_impl(conn, "user", 0, fmt, ap);
	va_end(ap);
}


#define mg_cry DO_NOT_USE_THIS_FUNCTION__USE_mg_cry_internal


/* Return fake connection structure. Used for logging, if connection
 * is not applicable at the moment of logging. */
static struct mg_connection *
fc(struct mg_context *ctx)
{
	static struct mg_connection fake_connection;
	fake_connection.phys_ctx = ctx;
	fake_connection.dom_ctx = &(ctx->dd);
	return &fake_connection;
}


const char *
mg_version(void)
{
	return CIVETWEB_VERSION;
}


const struct mg_request_info *
mg_get_request_info(const struct mg_connection *conn)
{
	if (!conn) {
		return NULL;
	}
#if defined(MG_ALLOW_USING_GET_REQUEST_INFO_FOR_RESPONSE)
	if (conn->connection_type == CONNECTION_TYPE_RESPONSE) {
		char txt[16];
		struct mg_workerTLS *tls =
		    (struct mg_workerTLS *)pthread_getspecific(sTlsKey);

		sprintf(txt, "%03i", conn->response_info.status_code);
		if (strlen(txt) == 3) {
			memcpy(tls->txtbuf, txt, 4);
		} else {
			strcpy(tls->txtbuf, "ERR");
		}

		((struct mg_connection *)conn)->request_info.local_uri =
		    ((struct mg_connection *)conn)->request_info.request_uri =
		        tls->txtbuf; /* use thread safe buffer */

		((struct mg_connection *)conn)->request_info.num_headers =
		    conn->response_info.num_headers;
		memcpy(((struct mg_connection *)conn)->request_info.http_headers,
		       conn->response_info.http_headers,
		       sizeof(conn->response_info.http_headers));
	} else
#endif
	    if (conn->connection_type != CONNECTION_TYPE_REQUEST) {
		return NULL;
	}
	return &conn->request_info;
}


const struct mg_response_info *
mg_get_response_info(const struct mg_connection *conn)
{
	if (!conn) {
		return NULL;
	}
	if (conn->connection_type != CONNECTION_TYPE_RESPONSE) {
		return NULL;
	}
	return &conn->response_info;
}


static const char *
get_proto_name(const struct mg_connection *conn)
{
#if defined(__clang__)
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunreachable-code"
/* Depending on USE_WEBSOCKET and NO_SSL, some oft the protocols might be
 * not supported. Clang raises an "unreachable code" warning for parts of ?:
 * unreachable, but splitting into four different #ifdef clauses here is more
 * complicated.
 */
#endif

	const struct mg_request_info *ri = &conn->request_info;

	const char *proto =
	    (is_websocket_protocol(conn) ? (ri->is_ssl ? "wss" : "ws")
	                                 : (ri->is_ssl ? "https" : "http"));

	return proto;

#if defined(__clang__)
#pragma clang diagnostic pop
#endif
}


int
mg_get_request_link(const struct mg_connection *conn, char *buf, size_t buflen)
{
	if ((buflen < 1) || (buf == 0) || (conn == 0)) {
		return -1;
	} else {

		int truncated = 0;
		const struct mg_request_info *ri = &conn->request_info;

		const char *proto = get_proto_name(conn);

		if (ri->local_uri == NULL) {
			return -1;
		}

		if ((ri->request_uri != NULL)
		    && (0 != strcmp(ri->local_uri, ri->request_uri))) {
			/* The request uri is different from the local uri.
			 * This is usually if an absolute URI, including server
			 * name has been provided. */
			mg_snprintf(conn,
			            &truncated,
			            buf,
			            buflen,
			            "%s://%s",
			            proto,
			            ri->request_uri);
			if (truncated) {
				return -1;
			}
			return 0;

		} else {

			/* The common case is a relative URI, so we have to
			 * construct an absolute URI from server name and port */

#if defined(USE_IPV6)
			int is_ipv6 = (conn->client.lsa.sa.sa_family == AF_INET6);
			int port = is_ipv6 ? htons(conn->client.lsa.sin6.sin6_port)
			                   : htons(conn->client.lsa.sin.sin_port);
#else
			int port = htons(conn->client.lsa.sin.sin_port);
#endif
			int def_port = ri->is_ssl ? 443 : 80;
			int auth_domain_check_enabled =
			    conn->dom_ctx->config[ENABLE_AUTH_DOMAIN_CHECK]
			    && (!mg_strcasecmp(
			           conn->dom_ctx->config[ENABLE_AUTH_DOMAIN_CHECK], "yes"));
			const char *server_domain =
			    conn->dom_ctx->config[AUTHENTICATION_DOMAIN];

			char portstr[16];
			char server_ip[48];

			if (port != def_port) {
				sprintf(portstr, ":%u", (unsigned)port);
			} else {
				portstr[0] = 0;
			}

			if (!auth_domain_check_enabled || !server_domain) {

				sockaddr_to_string(server_ip,
				                   sizeof(server_ip),
				                   &conn->client.lsa);

				server_domain = server_ip;
			}

			mg_snprintf(conn,
			            &truncated,
			            buf,
			            buflen,
			            "%s://%s%s%s",
			            proto,
			            server_domain,
			            portstr,
			            ri->local_uri);
			if (truncated) {
				return -1;
			}
			return 0;
		}
	}
}

/* Skip the characters until one of the delimiters characters found.
 * 0-terminate resulting word. Skip the delimiter and following whitespaces.
 * Advance pointer to buffer to the next word. Return found 0-terminated
 * word.
 * Delimiters can be quoted with quotechar. */
static char *
skip_quoted(char **buf,
            const char *delimiters,
            const char *whitespace,
            char quotechar)
{
	char *p, *begin_word, *end_word, *end_whitespace;

	begin_word = *buf;
	end_word = begin_word + strcspn(begin_word, delimiters);

	/* Check for quotechar */
	if (end_word > begin_word) {
		p = end_word - 1;
		while (*p == quotechar) {
			/* While the delimiter is quoted, look for the next delimiter.
			 */
			/* This happens, e.g., in calls from parse_auth_header,
			 * if the user name contains a " character. */

			/* If there is anything beyond end_word, copy it. */
			if (*end_word != '\0') {
				size_t end_off = strcspn(end_word + 1, delimiters);
				memmove(p, end_word, end_off + 1);
				p += end_off; /* p must correspond to end_word - 1 */
				end_word += end_off + 1;
			} else {
				*p = '\0';
				break;
			}
		}
		for (p++; p < end_word; p++) {
			*p = '\0';
		}
	}

	if (*end_word == '\0') {
		*buf = end_word;
	} else {

#if defined(GCC_DIAGNOSTIC)
/* Disable spurious conversion warning for GCC */
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wsign-conversion"
#endif /* defined(GCC_DIAGNOSTIC) */

		end_whitespace = end_word + strspn(&end_word[1], whitespace) + 1;

#if defined(GCC_DIAGNOSTIC)
#pragma GCC diagnostic pop
#endif /* defined(GCC_DIAGNOSTIC) */

		for (p = end_word; p < end_whitespace; p++) {
			*p = '\0';
		}

		*buf = end_whitespace;
	}

	return begin_word;
}


/* Return HTTP header value, or NULL if not found. */
static const char *
get_header(const struct mg_header *hdr, int num_hdr, const char *name)
{
	int i;
	for (i = 0; i < num_hdr; i++) {
		if (!mg_strcasecmp(name, hdr[i].name)) {
			return hdr[i].value;
		}
	}

	return NULL;
}


#if defined(USE_WEBSOCKET)
/* Retrieve requested HTTP header multiple values, and return the number of
 * found occurrences */
static int
get_req_headers(const struct mg_request_info *ri,
                const char *name,
                const char **output,
                int output_max_size)
{
	int i;
	int cnt = 0;
	if (ri) {
		for (i = 0; i < ri->num_headers && cnt < output_max_size; i++) {
			if (!mg_strcasecmp(name, ri->http_headers[i].name)) {
				output[cnt++] = ri->http_headers[i].value;
			}
		}
	}
	return cnt;
}
#endif


const char *
mg_get_header(const struct mg_connection *conn, const char *name)
{
	if (!conn) {
		return NULL;
	}

	if (conn->connection_type == CONNECTION_TYPE_REQUEST) {
		return get_header(conn->request_info.http_headers,
		                  conn->request_info.num_headers,
		                  name);
	}
	if (conn->connection_type == CONNECTION_TYPE_RESPONSE) {
		return get_header(conn->response_info.http_headers,
		                  conn->response_info.num_headers,
		                  name);
	}
	return NULL;
}


static const char *
get_http_version(const struct mg_connection *conn)
{
	if (!conn) {
		return NULL;
	}

	if (conn->connection_type == CONNECTION_TYPE_REQUEST) {
		return conn->request_info.http_version;
	}
	if (conn->connection_type == CONNECTION_TYPE_RESPONSE) {
		return conn->response_info.http_version;
	}
	return NULL;
}


/* A helper function for traversing a comma separated list of values.
 * It returns a list pointer shifted to the next value, or NULL if the end
 * of the list found.
 * Value is stored in val vector. If value has form "x=y", then eq_val
 * vector is initialized to point to the "y" part, and val vector length
 * is adjusted to point only to "x". */
static const char *
next_option(const char *list, struct vec *val, struct vec *eq_val)
{
	int end;

reparse:
	if (val == NULL || list == NULL || *list == '\0') {
		/* End of the list */
		return NULL;
	}

	/* Skip over leading LWS */
	while (*list == ' ' || *list == '\t')
		list++;

	val->ptr = list;
	if ((list = strchr(val->ptr, ',')) != NULL) {
		/* Comma found. Store length and shift the list ptr */
		val->len = ((size_t)(list - val->ptr));
		list++;
	} else {
		/* This value is the last one */
		list = val->ptr + strlen(val->ptr);
		val->len = ((size_t)(list - val->ptr));
	}

	/* Adjust length for trailing LWS */
	end = (int)val->len - 1;
	while (end >= 0 && ((val->ptr[end] == ' ') || (val->ptr[end] == '\t')))
		end--;
	val->len = (size_t)(end + 1);

	if (val->len == 0) {
		/* Ignore any empty entries. */
		goto reparse;
	}

	if (eq_val != NULL) {
		/* Value has form "x=y", adjust pointers and lengths
		 * so that val points to "x", and eq_val points to "y". */
		eq_val->len = 0;
		eq_val->ptr = (const char *)memchr(val->ptr, '=', val->len);
		if (eq_val->ptr != NULL) {
			eq_val->ptr++; /* Skip over '=' character */
			eq_val->len = ((size_t)(val->ptr - eq_val->ptr)) + val->len;
			val->len = ((size_t)(eq_val->ptr - val->ptr)) - 1;
		}
	}

	return list;
}


/* A helper function for checking if a comma separated list of values
 * contains
 * the given option (case insensitvely).
 * 'header' can be NULL, in which case false is returned. */
static int
header_has_option(const char *header, const char *option)
{
	struct vec opt_vec;
	struct vec eq_vec;

	DEBUG_ASSERT(option != NULL);
	DEBUG_ASSERT(option[0] != '\0');

	while ((header = next_option(header, &opt_vec, &eq_vec)) != NULL) {
		if (mg_strncasecmp(option, opt_vec.ptr, opt_vec.len) == 0)
			return 1;
	}

	return 0;
}


/* Perform case-insensitive match of string against pattern */
static ptrdiff_t
match_prefix(const char *pattern, size_t pattern_len, const char *str)
{
	const char *or_str;
	ptrdiff_t i, j, len, res;

	if ((or_str = (const char *)memchr(pattern, '|', pattern_len)) != NULL) {
		res = match_prefix(pattern, (size_t)(or_str - pattern), str);
		return (res > 0) ? res
		                 : match_prefix(or_str + 1,
		                                (size_t)((pattern + pattern_len)
		                                         - (or_str + 1)),
		                                str);
	}

	for (i = 0, j = 0; (i < (ptrdiff_t)pattern_len); i++, j++) {
		if ((pattern[i] == '?') && (str[j] != '\0')) {
			continue;
		} else if (pattern[i] == '$') {
			return (str[j] == '\0') ? j : -1;
		} else if (pattern[i] == '*') {
			i++;
			if (pattern[i] == '*') {
				i++;
				len = strlen(str + j);
			} else {
				len = strcspn(str + j, "/");
			}
			if (i == (ptrdiff_t)pattern_len) {
				return j + len;
			}
			do {
				res = match_prefix(pattern + i, pattern_len - i, str + j + len);
			} while (res == -1 && len-- > 0);
			return (res == -1) ? -1 : j + res + len;
		} else if (lowercase(&pattern[i]) != lowercase(&str[j])) {
			return -1;
		}
	}
	return (ptrdiff_t)j;
}


/* HTTP 1.1 assumes keep alive if "Connection:" header is not set
 * This function must tolerate situations when connection info is not
 * set up, for example if request parsing failed. */
static int
should_keep_alive(const struct mg_connection *conn)
{
	const char *http_version;
	const char *header;

	/* First satisfy needs of the server */
	if ((conn == NULL) || conn->must_close) {
		/* Close, if civetweb framework needs to close */
		return 0;
	}

	if (mg_strcasecmp(conn->dom_ctx->config[ENABLE_KEEP_ALIVE], "yes") != 0) {
		/* Close, if keep alive is not enabled */
		return 0;
	}

	/* Check explicit wish of the client */
	header = mg_get_header(conn, "Connection");
	if (header) {
		/* If there is a connection header from the client, obey */
		if (header_has_option(header, "keep-alive")) {
			return 1;
		}
		return 0;
	}

	/* Use default of the standard */
	http_version = get_http_version(conn);
	if (http_version && (0 == strcmp(http_version, "1.1"))) {
		/* HTTP 1.1 default is keep alive */
		return 1;
	}

	/* HTTP 1.0 (and earlier) default is to close the connection */
	return 0;
}


static int
should_decode_url(const struct mg_connection *conn)
{
	if (!conn || !conn->dom_ctx) {
		return 0;
	}

	return (mg_strcasecmp(conn->dom_ctx->config[DECODE_URL], "yes") == 0);
}


static const char *
suggest_connection_header(const struct mg_connection *conn)
{
	return should_keep_alive(conn) ? "keep-alive" : "close";
}


static int
send_no_cache_header(struct mg_connection *conn)
{
	/* Send all current and obsolete cache opt-out directives. */
	return mg_printf(conn,
	                 "Cache-Control: no-cache, no-store, "
	                 "must-revalidate, private, max-age=0\r\n"
	                 "Pragma: no-cache\r\n"
	                 "Expires: 0\r\n");
}


static int
send_static_cache_header(struct mg_connection *conn)
{
#if !defined(NO_CACHING)
	/* Read the server config to check how long a file may be cached.
	 * The configuration is in seconds. */
	int max_age = atoi(conn->dom_ctx->config[STATIC_FILE_MAX_AGE]);
	if (max_age <= 0) {
		/* 0 means "do not cache". All values <0 are reserved
		 * and may be used differently in the future. */
		/* If a file should not be cached, do not only send
		 * max-age=0, but also pragmas and Expires headers. */
		return send_no_cache_header(conn);
	}

	/* Use "Cache-Control: max-age" instead of "Expires" header.
	 * Reason: see https://www.mnot.net/blog/2007/05/15/expires_max-age */
	/* See also https://www.mnot.net/cache_docs/ */
	/* According to RFC 2616, Section 14.21, caching times should not exceed
	 * one year. A year with 365 days corresponds to 31536000 seconds, a
	 * leap
	 * year to 31622400 seconds. For the moment, we just send whatever has
	 * been configured, still the behavior for >1 year should be considered
	 * as undefined. */
	return mg_printf(conn, "Cache-Control: max-age=%u\r\n", (unsigned)max_age);
#else  /* NO_CACHING */
	return send_no_cache_header(conn);
#endif /* !NO_CACHING */
}


static int
send_additional_header(struct mg_connection *conn)
{
	int i = 0;
	const char *header = conn->dom_ctx->config[ADDITIONAL_HEADER];

#if !defined(NO_SSL)
	if (conn->dom_ctx->config[STRICT_HTTPS_MAX_AGE]) {
		int max_age = atoi(conn->dom_ctx->config[STRICT_HTTPS_MAX_AGE]);
		if (max_age >= 0) {
			i += mg_printf(conn,
			               "Strict-Transport-Security: max-age=%u\r\n",
			               (unsigned)max_age);
		}
	}
#endif

	if (header && header[0]) {
		i += mg_printf(conn, "%s\r\n", header);
	}

	return i;
}


static void handle_file_based_request(struct mg_connection *conn,
                                      const char *path,
                                      struct mg_file *filep);


const char *
mg_get_response_code_text(const struct mg_connection *conn, int response_code)
{
	/* See IANA HTTP status code assignment:
	 * http://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
	 */

	switch (response_code) {
	/* RFC2616 Section 10.1 - Informational 1xx */
	case 100:
		return "Continue"; /* RFC2616 Section 10.1.1 */
	case 101:
		return "Switching Protocols"; /* RFC2616 Section 10.1.2 */
	case 102:
		return "Processing"; /* RFC2518 Section 10.1 */

	/* RFC2616 Section 10.2 - Successful 2xx */
	case 200:
		return "OK"; /* RFC2616 Section 10.2.1 */
	case 201:
		return "Created"; /* RFC2616 Section 10.2.2 */
	case 202:
		return "Accepted"; /* RFC2616 Section 10.2.3 */
	case 203:
		return "Non-Authoritative Information"; /* RFC2616 Section 10.2.4 */
	case 204:
		return "No Content"; /* RFC2616 Section 10.2.5 */
	case 205:
		return "Reset Content"; /* RFC2616 Section 10.2.6 */
	case 206:
		return "Partial Content"; /* RFC2616 Section 10.2.7 */
	case 207:
		return "Multi-Status"; /* RFC2518 Section 10.2, RFC4918 Section 11.1
		                        */
	case 208:
		return "Already Reported"; /* RFC5842 Section 7.1 */

	case 226:
		return "IM used"; /* RFC3229 Section 10.4.1 */

	/* RFC2616 Section 10.3 - Redirection 3xx */
	case 300:
		return "Multiple Choices"; /* RFC2616 Section 10.3.1 */
	case 301:
		return "Moved Permanently"; /* RFC2616 Section 10.3.2 */
	case 302:
		return "Found"; /* RFC2616 Section 10.3.3 */
	case 303:
		return "See Other"; /* RFC2616 Section 10.3.4 */
	case 304:
		return "Not Modified"; /* RFC2616 Section 10.3.5 */
	case 305:
		return "Use Proxy"; /* RFC2616 Section 10.3.6 */
	case 307:
		return "Temporary Redirect"; /* RFC2616 Section 10.3.8 */
	case 308:
		return "Permanent Redirect"; /* RFC7238 Section 3 */

	/* RFC2616 Section 10.4 - Client Error 4xx */
	case 400:
		return "Bad Request"; /* RFC2616 Section 10.4.1 */
	case 401:
		return "Unauthorized"; /* RFC2616 Section 10.4.2 */
	case 402:
		return "Payment Required"; /* RFC2616 Section 10.4.3 */
	case 403:
		return "Forbidden"; /* RFC2616 Section 10.4.4 */
	case 404:
		return "Not Found"; /* RFC2616 Section 10.4.5 */
	case 405:
		return "Method Not Allowed"; /* RFC2616 Section 10.4.6 */
	case 406:
		return "Not Acceptable"; /* RFC2616 Section 10.4.7 */
	case 407:
		return "Proxy Authentication Required"; /* RFC2616 Section 10.4.8 */
	case 408:
		return "Request Time-out"; /* RFC2616 Section 10.4.9 */
	case 409:
		return "Conflict"; /* RFC2616 Section 10.4.10 */
	case 410:
		return "Gone"; /* RFC2616 Section 10.4.11 */
	case 411:
		return "Length Required"; /* RFC2616 Section 10.4.12 */
	case 412:
		return "Precondition Failed"; /* RFC2616 Section 10.4.13 */
	case 413:
		return "Request Entity Too Large"; /* RFC2616 Section 10.4.14 */
	case 414:
		return "Request-URI Too Large"; /* RFC2616 Section 10.4.15 */
	case 415:
		return "Unsupported Media Type"; /* RFC2616 Section 10.4.16 */
	case 416:
		return "Requested range not satisfiable"; /* RFC2616 Section 10.4.17
		                                           */
	case 417:
		return "Expectation Failed"; /* RFC2616 Section 10.4.18 */

	case 421:
		return "Misdirected Request"; /* RFC7540 Section 9.1.2 */
	case 422:
		return "Unproccessable entity"; /* RFC2518 Section 10.3, RFC4918
		                                 * Section 11.2 */
	case 423:
		return "Locked"; /* RFC2518 Section 10.4, RFC4918 Section 11.3 */
	case 424:
		return "Failed Dependency"; /* RFC2518 Section 10.5, RFC4918
		                             * Section 11.4 */

	case 426:
		return "Upgrade Required"; /* RFC 2817 Section 4 */

	case 428:
		return "Precondition Required"; /* RFC 6585, Section 3 */
	case 429:
		return "Too Many Requests"; /* RFC 6585, Section 4 */

	case 431:
		return "Request Header Fields Too Large"; /* RFC 6585, Section 5 */

	case 451:
		return "Unavailable For Legal Reasons"; /* draft-tbray-http-legally-restricted-status-05,
		                                         * Section 3 */

	/* RFC2616 Section 10.5 - Server Error 5xx */
	case 500:
		return "Internal Server Error"; /* RFC2616 Section 10.5.1 */
	case 501:
		return "Not Implemented"; /* RFC2616 Section 10.5.2 */
	case 502:
		return "Bad Gateway"; /* RFC2616 Section 10.5.3 */
	case 503:
		return "Service Unavailable"; /* RFC2616 Section 10.5.4 */
	case 504:
		return "Gateway Time-out"; /* RFC2616 Section 10.5.5 */
	case 505:
		return "HTTP Version not supported"; /* RFC2616 Section 10.5.6 */
	case 506:
		return "Variant Also Negotiates"; /* RFC 2295, Section 8.1 */
	case 507:
		return "Insufficient Storage"; /* RFC2518 Section 10.6, RFC4918
		                                * Section 11.5 */
	case 508:
		return "Loop Detected"; /* RFC5842 Section 7.1 */

	case 510:
		return "Not Extended"; /* RFC 2774, Section 7 */
	case 511:
		return "Network Authentication Required"; /* RFC 6585, Section 6 */

	/* Other status codes, not shown in the IANA HTTP status code
	 * assignment.
	 * E.g., "de facto" standards due to common use, ... */
	case 418:
		return "I am a teapot"; /* RFC2324 Section 2.3.2 */
	case 419:
		return "Authentication Timeout"; /* common use */
	case 420:
		return "Enhance Your Calm"; /* common use */
	case 440:
		return "Login Timeout"; /* common use */
	case 509:
		return "Bandwidth Limit Exceeded"; /* common use */

	default:
		/* This error code is unknown. This should not happen. */
		if (conn) {
			mg_cry_internal(conn,
			                "Unknown HTTP response code: %u",
			                response_code);
		}

		/* Return at least a category according to RFC 2616 Section 10. */
		if (response_code >= 100 && response_code < 200) {
			/* Unknown informational status code */
			return "Information";
		}
		if (response_code >= 200 && response_code < 300) {
			/* Unknown success code */
			return "Success";
		}
		if (response_code >= 300 && response_code < 400) {
			/* Unknown redirection code */
			return "Redirection";
		}
		if (response_code >= 400 && response_code < 500) {
			/* Unknown request error code */
			return "Client Error";
		}
		if (response_code >= 500 && response_code < 600) {
			/* Unknown server error code */
			return "Server Error";
		}

		/* Response code not even within reasonable range */
		return "";
	}
}


static int
mg_send_http_error_impl(struct mg_connection *conn,
                        int status,
                        const char *fmt,
                        va_list args)
{
	char errmsg_buf[MG_BUF_LEN];
	char path_buf[PATH_MAX];
	va_list ap;
	int len, i, page_handler_found, scope, truncated, has_body;
	char date[64];
	time_t curtime = time(NULL);
	const char *error_handler = NULL;
	struct mg_file error_page_file = STRUCT_FILE_INITIALIZER;
	const char *error_page_file_ext, *tstr;
	int handled_by_callback = 0;

	const char *status_text = mg_get_response_code_text(conn, status);

	if ((conn == NULL) || (fmt == NULL)) {
		return -2;
	}

	/* Set status (for log) */
	conn->status_code = status;

	/* Errors 1xx, 204 and 304 MUST NOT send a body */
	has_body = ((status > 199) && (status != 204) && (status != 304));

	/* Prepare message in buf, if required */
	if (has_body
	    || (!conn->in_error_handler
	        && (conn->phys_ctx->callbacks.http_error != NULL))) {
		/* Store error message in errmsg_buf */
		va_copy(ap, args);
		mg_vsnprintf(conn, NULL, errmsg_buf, sizeof(errmsg_buf), fmt, ap);
		va_end(ap);
		/* In a debug build, print all html errors */
		DEBUG_TRACE("Error %i - [%s]", status, errmsg_buf);
	}

	/* If there is a http_error callback, call it.
	 * But don't do it recursively, if callback calls mg_send_http_error again.
	 */
	if (!conn->in_error_handler
	    && (conn->phys_ctx->callbacks.http_error != NULL)) {
		/* Mark in_error_handler to avoid recursion and call user callback. */
		conn->in_error_handler = 1;
		handled_by_callback =
		    (conn->phys_ctx->callbacks.http_error(conn, status, errmsg_buf)
		     == 0);
		conn->in_error_handler = 0;
	}

	if (!handled_by_callback) {
		/* Check for recursion */
		if (conn->in_error_handler) {
			DEBUG_TRACE(
			    "Recursion when handling error %u - fall back to default",
			    status);
		} else {
			/* Send user defined error pages, if defined */
			error_handler = conn->dom_ctx->config[ERROR_PAGES];
			error_page_file_ext = conn->dom_ctx->config[INDEX_FILES];
			page_handler_found = 0;

			if (error_handler != NULL) {
				for (scope = 1; (scope <= 3) && !page_handler_found; scope++) {
					switch (scope) {
					case 1: /* Handler for specific error, e.g. 404 error */
						mg_snprintf(conn,
						            &truncated,
						            path_buf,
						            sizeof(path_buf) - 32,
						            "%serror%03u.",
						            error_handler,
						            status);
						break;
					case 2: /* Handler for error group, e.g., 5xx error
					         * handler
					         * for all server errors (500-599) */
						mg_snprintf(conn,
						            &truncated,
						            path_buf,
						            sizeof(path_buf) - 32,
						            "%serror%01uxx.",
						            error_handler,
						            status / 100);
						break;
					default: /* Handler for all errors */
						mg_snprintf(conn,
						            &truncated,
						            path_buf,
						            sizeof(path_buf) - 32,
						            "%serror.",
						            error_handler);
						break;
					}

					/* String truncation in buf may only occur if
					 * error_handler is too long. This string is
					 * from the config, not from a client. */
					(void)truncated;

					len = (int)strlen(path_buf);

					tstr = strchr(error_page_file_ext, '.');

					while (tstr) {
						for (i = 1;
						     (i < 32) && (tstr[i] != 0) && (tstr[i] != ',');
						     i++) {
							/* buffer overrun is not possible here, since
							 * (i < 32) && (len < sizeof(path_buf) - 32)
							 * ==> (i + len) < sizeof(path_buf) */
							path_buf[len + i - 1] = tstr[i];
						}
						/* buffer overrun is not possible here, since
						 * (i <= 32) && (len < sizeof(path_buf) - 32)
						 * ==> (i + len) <= sizeof(path_buf) */
						path_buf[len + i - 1] = 0;

						if (mg_stat(conn, path_buf, &error_page_file.stat)) {
							DEBUG_TRACE("Check error page %s - found",
							            path_buf);
							page_handler_found = 1;
							break;
						}
						DEBUG_TRACE("Check error page %s - not found",
						            path_buf);

						tstr = strchr(tstr + i, '.');
					}
				}
			}

			if (page_handler_found) {
				conn->in_error_handler = 1;
				handle_file_based_request(conn, path_buf, &error_page_file);
				conn->in_error_handler = 0;
				return 0;
			}
		}

		/* No custom error page. Send default error page. */
		gmt_time_string(date, sizeof(date), &curtime);

		conn->must_close = 1;
		mg_printf(conn, "HTTP/1.1 %d %s\r\n", status, status_text);
		send_no_cache_header(conn);
		send_additional_header(conn);
		if (has_body) {
			mg_printf(conn,
			          "%s",
			          "Content-Type: text/plain; charset=utf-8\r\n");
		}
		mg_printf(conn,
		          "Date: %s\r\n"
		          "Connection: close\r\n\r\n",
		          date);

		/* HTTP responses 1xx, 204 and 304 MUST NOT send a body */
		if (has_body) {
			/* For other errors, send a generic error message. */
			mg_printf(conn, "Error %d: %s\n", status, status_text);
			mg_write(conn, errmsg_buf, strlen(errmsg_buf));

		} else {
			/* No body allowed. Close the connection. */
			DEBUG_TRACE("Error %i", status);
		}
	}
	return 0;
}


int
mg_send_http_error(struct mg_connection *conn, int status, const char *fmt, ...)
{
	va_list ap;
	int ret;

	va_start(ap, fmt);
	ret = mg_send_http_error_impl(conn, status, fmt, ap);
	va_end(ap);

	return ret;
}


int
mg_send_http_ok(struct mg_connection *conn,
                const char *mime_type,
                long long content_length)
{
	char date[64];
	time_t curtime = time(NULL);

	if ((mime_type == NULL) || (*mime_type == 0)) {
		/* Parameter error */
		return -2;
	}

	gmt_time_string(date, sizeof(date), &curtime);

	mg_printf(conn,
	          "HTTP/1.1 200 OK\r\n"
	          "Content-Type: %s\r\n"
	          "Date: %s\r\n"
	          "Connection: %s\r\n",
	          mime_type,
	          date,
	          suggest_connection_header(conn));

	send_no_cache_header(conn);
	send_additional_header(conn);
	if (content_length < 0) {
		mg_printf(conn, "Transfer-Encoding: chunked\r\n\r\n");
	} else {
		mg_printf(conn,
		          "Content-Length: %" UINT64_FMT "\r\n\r\n",
		          (uint64_t)content_length);
	}

	return 0;
}


int
mg_send_http_redirect(struct mg_connection *conn,
                      const char *target_url,
                      int redirect_code)
{
	/* Send a 30x redirect response.
	 *
	 * Redirect types (status codes):
	 *
	 * Status | Perm/Temp | Method              | Version
	 *   301  | permanent | POST->GET undefined | HTTP/1.0
	 *   302  | temporary | POST->GET undefined | HTTP/1.0
	 *   303  | temporary | always use GET      | HTTP/1.1
	 *   307  | temporary | always keep method  | HTTP/1.1
	 *   308  | permanent | always keep method  | HTTP/1.1
	 */
	const char *redirect_text;
	int ret;
	size_t content_len = 0;
	char reply[MG_BUF_LEN];

	/* In case redirect_code=0, use 307. */
	if (redirect_code == 0) {
		redirect_code = 307;
	}

	/* In case redirect_code is none of the above, return error. */
	if ((redirect_code != 301) && (redirect_code != 302)
	    && (redirect_code != 303) && (redirect_code != 307)
	    && (redirect_code != 308)) {
		/* Parameter error */
		return -2;
	}

	/* Get proper text for response code */
	redirect_text = mg_get_response_code_text(conn, redirect_code);

	/* If target_url is not defined, redirect to "/". */
	if ((target_url == NULL) || (*target_url == 0)) {
		target_url = "/";
	}

#if defined(MG_SEND_REDIRECT_BODY)
	/* TODO: condition name? */

	/* Prepare a response body with a hyperlink.
	 *
	 * According to RFC2616 (and RFC1945 before):
	 * Unless the request method was HEAD, the entity of the
	 * response SHOULD contain a short hypertext note with a hyperlink to
	 * the new URI(s).
	 *
	 * However, this response body is not useful in M2M communication.
	 * Probably the original reason in the RFC was, clients not supporting
	 * a 30x HTTP redirect could still show the HTML page and let the user
	 * press the link. Since current browsers support 30x HTTP, the additional
	 * HTML body does not seem to make sense anymore.
	 *
	 * The new RFC7231 (Section 6.4) does no longer recommend it ("SHOULD"),
	 * but it only notes:
	 * The server's response payload usually contains a short
	 * hypertext note with a hyperlink to the new URI(s).
	 *
	 * Deactivated by default. If you need the 30x body, set the define.
	 */
	mg_snprintf(
	    conn,
	    NULL /* ignore truncation */,
	    reply,
	    sizeof(reply),
	    "<html><head>%s</head><body><a href=\"%s\">%s</a></body></html>",
	    redirect_text,
	    target_url,
	    target_url);
	content_len = strlen(reply);
#else
	reply[0] = 0;
#endif

	/* Do not send any additional header. For all other options,
	 * including caching, there are suitable defaults. */
	ret = mg_printf(conn,
	                "HTTP/1.1 %i %s\r\n"
	                "Location: %s\r\n"
	                "Content-Length: %u\r\n"
	                "Connection: %s\r\n\r\n",
	                redirect_code,
	                redirect_text,
	                target_url,
	                (unsigned int)content_len,
	                suggest_connection_header(conn));

	/* Send response body */
	if (ret > 0) {
		/* ... unless it is a HEAD request */
		if (0 != strcmp(conn->request_info.request_method, "HEAD")) {
			ret = mg_write(conn, reply, content_len);
		}
	}

	return (ret > 0) ? ret : -1;
}


#if defined(_WIN32)
/* Create substitutes for POSIX functions in Win32. */

#if defined(GCC_DIAGNOSTIC)
/* Show no warning in case system functions are not used. */
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wunused-function"
#endif


FUNCTION_MAY_BE_UNUSED
static int
pthread_mutex_init(pthread_mutex_t *mutex, void *unused)
{
	(void)unused;
	*mutex = CreateMutex(NULL, FALSE, NULL);
	return (*mutex == NULL) ? -1 : 0;
}

FUNCTION_MAY_BE_UNUSED
static int
pthread_mutex_destroy(pthread_mutex_t *mutex)
{
	return (CloseHandle(*mutex) == 0) ? -1 : 0;
}


FUNCTION_MAY_BE_UNUSED
static int
pthread_mutex_lock(pthread_mutex_t *mutex)
{
	return (WaitForSingleObject(*mutex, (DWORD)INFINITE) == WAIT_OBJECT_0) ? 0
	                                                                       : -1;
}


#if defined(ENABLE_UNUSED_PTHREAD_FUNCTIONS)
FUNCTION_MAY_BE_UNUSED
static int
pthread_mutex_trylock(pthread_mutex_t *mutex)
{
	switch (WaitForSingleObject(*mutex, 0)) {
	case WAIT_OBJECT_0:
		return 0;
	case WAIT_TIMEOUT:
		return -2; /* EBUSY */
	}
	return -1;
}
#endif


FUNCTION_MAY_BE_UNUSED
static int
pthread_mutex_unlock(pthread_mutex_t *mutex)
{
	return (ReleaseMutex(*mutex) == 0) ? -1 : 0;
}


FUNCTION_MAY_BE_UNUSED
static int
pthread_cond_init(pthread_cond_t *cv, const void *unused)
{
	(void)unused;
	InitializeCriticalSection(&cv->threadIdSec);
	cv->waiting_thread = NULL;
	return 0;
}


FUNCTION_MAY_BE_UNUSED
static int
pthread_cond_timedwait(pthread_cond_t *cv,
                       pthread_mutex_t *mutex,
                       FUNCTION_MAY_BE_UNUSED const struct timespec *abstime)
{
	struct mg_workerTLS **ptls,
	    *tls = (struct mg_workerTLS *)pthread_getspecific(sTlsKey);
	int ok;
	int64_t nsnow, nswaitabs, nswaitrel;
	DWORD mswaitrel;

	EnterCriticalSection(&cv->threadIdSec);
	/* Add this thread to cv's waiting list */
	ptls = &cv->waiting_thread;
	for (; *ptls != NULL; ptls = &(*ptls)->next_waiting_thread)
		;
	tls->next_waiting_thread = NULL;
	*ptls = tls;
	LeaveCriticalSection(&cv->threadIdSec);

	if (abstime) {
		nsnow = mg_get_current_time_ns();
		nswaitabs =
		    (((int64_t)abstime->tv_sec) * 1000000000) + abstime->tv_nsec;
		nswaitrel = nswaitabs - nsnow;
		if (nswaitrel < 0) {
			nswaitrel = 0;
		}
		mswaitrel = (DWORD)(nswaitrel / 1000000);
	} else {
		mswaitrel = (DWORD)INFINITE;
	}

	pthread_mutex_unlock(mutex);
	ok = (WAIT_OBJECT_0
	      == WaitForSingleObject(tls->pthread_cond_helper_mutex, mswaitrel));
	if (!ok) {
		ok = 1;
		EnterCriticalSection(&cv->threadIdSec);
		ptls = &cv->waiting_thread;
		for (; *ptls != NULL; ptls = &(*ptls)->next_waiting_thread) {
			if (*ptls == tls) {
				*ptls = tls->next_waiting_thread;
				ok = 0;
				break;
			}
		}
		LeaveCriticalSection(&cv->threadIdSec);
		if (ok) {
			WaitForSingleObject(tls->pthread_cond_helper_mutex,
			                    (DWORD)INFINITE);
		}
	}
	/* This thread has been removed from cv's waiting list */
	pthread_mutex_lock(mutex);

	return ok ? 0 : -1;
}


FUNCTION_MAY_BE_UNUSED
static int
pthread_cond_wait(pthread_cond_t *cv, pthread_mutex_t *mutex)
{
	return pthread_cond_timedwait(cv, mutex, NULL);
}


FUNCTION_MAY_BE_UNUSED
static int
pthread_cond_signal(pthread_cond_t *cv)
{
	HANDLE wkup = NULL;
	BOOL ok = FALSE;

	EnterCriticalSection(&cv->threadIdSec);
	if (cv->waiting_thread) {
		wkup = cv->waiting_thread->pthread_cond_helper_mutex;
		cv->waiting_thread = cv->waiting_thread->next_waiting_thread;

		ok = SetEvent(wkup);
		DEBUG_ASSERT(ok);
	}
	LeaveCriticalSection(&cv->threadIdSec);

	return ok ? 0 : 1;
}


FUNCTION_MAY_BE_UNUSED
static int
pthread_cond_broadcast(pthread_cond_t *cv)
{
	EnterCriticalSection(&cv->threadIdSec);
	while (cv->waiting_thread) {
		pthread_cond_signal(cv);
	}
	LeaveCriticalSection(&cv->threadIdSec);

	return 0;
}


FUNCTION_MAY_BE_UNUSED
static int
pthread_cond_destroy(pthread_cond_t *cv)
{
	EnterCriticalSection(&cv->threadIdSec);
	DEBUG_ASSERT(cv->waiting_thread == NULL);
	LeaveCriticalSection(&cv->threadIdSec);
	DeleteCriticalSection(&cv->threadIdSec);

	return 0;
}


#if defined(ALTERNATIVE_QUEUE)
FUNCTION_MAY_BE_UNUSED
static void *
event_create(void)
{
	return (void *)CreateEvent(NULL, FALSE, FALSE, NULL);
}


FUNCTION_MAY_BE_UNUSED
static int
event_wait(void *eventhdl)
{
	int res = WaitForSingleObject((HANDLE)eventhdl, (DWORD)INFINITE);
	return (res == WAIT_OBJECT_0);
}


FUNCTION_MAY_BE_UNUSED
static int
event_signal(void *eventhdl)
{
	return (int)SetEvent((HANDLE)eventhdl);
}


FUNCTION_MAY_BE_UNUSED
static void
event_destroy(void *eventhdl)
{
	CloseHandle((HANDLE)eventhdl);
}
#endif


#if defined(GCC_DIAGNOSTIC)
/* Enable unused function warning again */
#pragma GCC diagnostic pop
#endif


/* For Windows, change all slashes to backslashes in path names. */
static void
change_slashes_to_backslashes(char *path)
{
	int i;

	for (i = 0; path[i] != '\0'; i++) {
		if (path[i] == '/') {
			path[i] = '\\';
		}

		/* remove double backslash (check i > 0 to preserve UNC paths,
		 * like \\server\file.txt) */
		if ((path[i] == '\\') && (i > 0)) {
			while ((path[i + 1] == '\\') || (path[i + 1] == '/')) {
				(void)memmove(path + i + 1, path + i + 2, strlen(path + i + 1));
			}
		}
	}
}


static int
mg_wcscasecmp(const wchar_t *s1, const wchar_t *s2)
{
	int diff;

	do {
		diff = tolower(*s1) - tolower(*s2);
		s1++;
		s2++;
	} while ((diff == 0) && (s1[-1] != '\0'));

	return diff;
}


/* Encode 'path' which is assumed UTF-8 string, into UNICODE string.
 * wbuf and wbuf_len is a target buffer and its length. */
static void
path_to_unicode(const struct mg_connection *conn,
                const char *path,
                wchar_t *wbuf,
                size_t wbuf_len)
{
	char buf[PATH_MAX], buf2[PATH_MAX];
	wchar_t wbuf2[W_PATH_MAX + 1];
	DWORD long_len, err;
	int (*fcompare)(const wchar_t *, const wchar_t *) = mg_wcscasecmp;

	mg_strlcpy(buf, path, sizeof(buf));
	change_slashes_to_backslashes(buf);

	/* Convert to Unicode and back. If doubly-converted string does not
	 * match the original, something is fishy, reject. */
	memset(wbuf, 0, wbuf_len * sizeof(wchar_t));
	MultiByteToWideChar(CP_UTF8, 0, buf, -1, wbuf, (int)wbuf_len);
	WideCharToMultiByte(
	    CP_UTF8, 0, wbuf, (int)wbuf_len, buf2, sizeof(buf2), NULL, NULL);
	if (strcmp(buf, buf2) != 0) {
		wbuf[0] = L'\0';
	}

	/* Windows file systems are not case sensitive, but you can still use
	 * uppercase and lowercase letters (on all modern file systems).
	 * The server can check if the URI uses the same upper/lowercase
	 * letters an the file system, effectively making Windows servers
	 * case sensitive (like Linux servers are). It is still not possible
	 * to use two files with the same name in different cases on Windows
	 * (like /a and /A) - this would be possible in Linux.
	 * As a default, Windows is not case sensitive, but the case sensitive
	 * file name check can be activated by an additional configuration. */
	if (conn) {
		if (conn->dom_ctx->config[CASE_SENSITIVE_FILES]
		    && !mg_strcasecmp(conn->dom_ctx->config[CASE_SENSITIVE_FILES],
		                      "yes")) {
			/* Use case sensitive compare function */
			fcompare = wcscmp;
		}
	}
	(void)conn; /* conn is currently unused */

#if !defined(_WIN32_WCE)
	/* Only accept a full file path, not a Windows short (8.3) path. */
	memset(wbuf2, 0, ARRAY_SIZE(wbuf2) * sizeof(wchar_t));
	long_len = GetLongPathNameW(wbuf, wbuf2, ARRAY_SIZE(wbuf2) - 1);
	if (long_len == 0) {
		err = GetLastError();
		if (err == ERROR_FILE_NOT_FOUND) {
			/* File does not exist. This is not always a problem here. */
			return;
		}
	}
	if ((long_len >= ARRAY_SIZE(wbuf2)) || (fcompare(wbuf, wbuf2) != 0)) {
		/* Short name is used. */
		wbuf[0] = L'\0';
	}
#else
	(void)long_len;
	(void)wbuf2;
	(void)err;

	if (strchr(path, '~')) {
		wbuf[0] = L'\0';
	}
#endif
}


/* Windows happily opens files with some garbage at the end of file name.
 * For example, fopen("a.cgi    ", "r") on Windows successfully opens
 * "a.cgi", despite one would expect an error back.
 * This function returns non-0 if path ends with some garbage. */
static int
path_cannot_disclose_cgi(const char *path)
{
	static const char *allowed_last_characters = "_-";
	int last = path[strlen(path) - 1];
	return isalnum(last) || strchr(allowed_last_characters, last) != NULL;
}


static int
mg_stat(const struct mg_connection *conn,
        const char *path,
        struct mg_file_stat *filep)
{
	wchar_t wbuf[W_PATH_MAX];
	WIN32_FILE_ATTRIBUTE_DATA info;
	time_t creation_time;

	if (!filep) {
		return 0;
	}
	memset(filep, 0, sizeof(*filep));

	if (conn && is_file_in_memory(conn, path)) {
		/* filep->is_directory = 0; filep->gzipped = 0; .. already done by
		 * memset */

		/* Quick fix (for 1.9.x): */
		/* mg_stat must fill all fields, also for files in memory */
		struct mg_file tmp_file = STRUCT_FILE_INITIALIZER;
		open_file_in_memory(conn, path, &tmp_file, MG_FOPEN_MODE_NONE);
		filep->size = tmp_file.stat.size;
		filep->location = 2;
		/* TODO: for 1.10: restructure how files in memory are handled */

		/* The "file in memory" feature is a candidate for deletion.
		 * Please join the discussion at
		 * https://groups.google.com/forum/#!topic/civetweb/h9HT4CmeYqI
		 */

		filep->last_modified = time(NULL); /* TODO */
		/* last_modified = now ... assumes the file may change during
		 * runtime,
		 * so every mg_fopen call may return different data */
		/* last_modified = conn->phys_ctx.start_time;
		 * May be used it the data does not change during runtime. This
		 * allows
		 * browser caching. Since we do not know, we have to assume the file
		 * in memory may change. */
		return 1;
	}

	path_to_unicode(conn, path, wbuf, ARRAY_SIZE(wbuf));
	if (GetFileAttributesExW(wbuf, GetFileExInfoStandard, &info) != 0) {
		filep->size = MAKEUQUAD(info.nFileSizeLow, info.nFileSizeHigh);
		filep->last_modified =
		    SYS2UNIX_TIME(info.ftLastWriteTime.dwLowDateTime,
		                  info.ftLastWriteTime.dwHighDateTime);

		/* On Windows, the file creation time can be higher than the
		 * modification time, e.g. when a file is copied.
		 * Since the Last-Modified timestamp is used for caching
		 * it should be based on the most recent timestamp. */
		creation_time = SYS2UNIX_TIME(info.ftCreationTime.dwLowDateTime,
		                              info.ftCreationTime.dwHighDateTime);
		if (creation_time > filep->last_modified) {
			filep->last_modified = creation_time;
		}

		filep->is_directory = info.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY;
		/* If file name is fishy, reset the file structure and return
		 * error.
		 * Note it is important to reset, not just return the error, cause
		 * functions like is_file_opened() check the struct. */
		if (!filep->is_directory && !path_cannot_disclose_cgi(path)) {
			memset(filep, 0, sizeof(*filep));
			return 0;
		}

		return 1;
	}

	return 0;
}


static int
mg_remove(const struct mg_connection *conn, const char *path)
{
	wchar_t wbuf[W_PATH_MAX];
	path_to_unicode(conn, path, wbuf, ARRAY_SIZE(wbuf));
	return DeleteFileW(wbuf) ? 0 : -1;
}


static int
mg_mkdir(const struct mg_connection *conn, const char *path, int mode)
{
	wchar_t wbuf[W_PATH_MAX];
	(void)mode;
	path_to_unicode(conn, path, wbuf, ARRAY_SIZE(wbuf));
	return CreateDirectoryW(wbuf, NULL) ? 0 : -1;
}


/* Create substitutes for POSIX functions in Win32. */

#if defined(GCC_DIAGNOSTIC)
/* Show no warning in case system functions are not used. */
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wunused-function"
#endif


/* Implementation of POSIX opendir/closedir/readdir for Windows. */
FUNCTION_MAY_BE_UNUSED
static DIR *
mg_opendir(const struct mg_connection *conn, const char *name)
{
	DIR *dir = NULL;
	wchar_t wpath[W_PATH_MAX];
	DWORD attrs;

	if (name == NULL) {
		SetLastError(ERROR_BAD_ARGUMENTS);
	} else if ((dir = (DIR *)mg_malloc(sizeof(*dir))) == NULL) {
		SetLastError(ERROR_NOT_ENOUGH_MEMORY);
	} else {
		path_to_unicode(conn, name, wpath, ARRAY_SIZE(wpath));
		attrs = GetFileAttributesW(wpath);
		if ((wcslen(wpath) + 2 < ARRAY_SIZE(wpath)) && (attrs != 0xFFFFFFFF)
		    && ((attrs & FILE_ATTRIBUTE_DIRECTORY) != 0)) {
			(void)wcscat(wpath, L"\\*");
			dir->handle = FindFirstFileW(wpath, &dir->info);
			dir->result.d_name[0] = '\0';
		} else {
			mg_free(dir);
			dir = NULL;
		}
	}

	return dir;
}


FUNCTION_MAY_BE_UNUSED
static int
mg_closedir(DIR *dir)
{
	int result = 0;

	if (dir != NULL) {
		if (dir->handle != INVALID_HANDLE_VALUE)
			result = FindClose(dir->handle) ? 0 : -1;

		mg_free(dir);
	} else {
		result = -1;
		SetLastError(ERROR_BAD_ARGUMENTS);
	}

	return result;
}


FUNCTION_MAY_BE_UNUSED
static struct dirent *
mg_readdir(DIR *dir)
{
	struct dirent *result = 0;

	if (dir) {
		if (dir->handle != INVALID_HANDLE_VALUE) {
			result = &dir->result;
			(void)WideCharToMultiByte(CP_UTF8,
			                          0,
			                          dir->info.cFileName,
			                          -1,
			                          result->d_name,
			                          sizeof(result->d_name),
			                          NULL,
			                          NULL);

			if (!FindNextFileW(dir->handle, &dir->info)) {
				(void)FindClose(dir->handle);
				dir->handle = INVALID_HANDLE_VALUE;
			}

		} else {
			SetLastError(ERROR_FILE_NOT_FOUND);
		}
	} else {
		SetLastError(ERROR_BAD_ARGUMENTS);
	}

	return result;
}


#if !defined(HAVE_POLL)
#define POLLIN (1)  /* Data ready - read will not block. */
#define POLLPRI (2) /* Priority data ready. */
#define POLLOUT (4) /* Send queue not full - write will not block. */

FUNCTION_MAY_BE_UNUSED
static int
poll(struct pollfd *pfd, unsigned int n, int milliseconds)
{
	struct timeval tv;
	fd_set rset;
	fd_set wset;
	unsigned int i;
	int result;
	SOCKET maxfd = 0;

	memset(&tv, 0, sizeof(tv));
	tv.tv_sec = milliseconds / 1000;
	tv.tv_usec = (milliseconds % 1000) * 1000;
	FD_ZERO(&rset);
	FD_ZERO(&wset);

	for (i = 0; i < n; i++) {
		if (pfd[i].events & POLLIN) {
			FD_SET((SOCKET)pfd[i].fd, &rset);
		} else if (pfd[i].events & POLLOUT) {
			FD_SET((SOCKET)pfd[i].fd, &wset);
		}
		pfd[i].revents = 0;

		if (pfd[i].fd > maxfd) {
			maxfd = pfd[i].fd;
		}
	}

	if ((result = select((int)maxfd + 1, &rset, &wset, NULL, &tv)) > 0) {
		for (i = 0; i < n; i++) {
			if (FD_ISSET(pfd[i].fd, &rset)) {
				pfd[i].revents |= POLLIN;
			}
			if (FD_ISSET(pfd[i].fd, &wset)) {
				pfd[i].revents |= POLLOUT;
			}
		}
	}

	/* We should subtract the time used in select from remaining
	 * "milliseconds", in particular if called from mg_poll with a
	 * timeout quantum.
	 * Unfortunately, the remaining time is not stored in "tv" in all
	 * implementations, so the result in "tv" must be considered undefined.
	 * See http://man7.org/linux/man-pages/man2/select.2.html */

	return result;
}
#endif /* HAVE_POLL */


#if defined(GCC_DIAGNOSTIC)
/* Enable unused function warning again */
#pragma GCC diagnostic pop
#endif


static void
set_close_on_exec(SOCKET sock, struct mg_connection *conn /* may be null */)
{
	(void)conn; /* Unused. */
#if defined(_WIN32_WCE)
	(void)sock;
#else
	(void)SetHandleInformation((HANDLE)(intptr_t)sock, HANDLE_FLAG_INHERIT, 0);
#endif
}


int
mg_start_thread(mg_thread_func_t f, void *p)
{
#if defined(USE_STACK_SIZE) && (USE_STACK_SIZE > 1)
	/* Compile-time option to control stack size, e.g.
	 * -DUSE_STACK_SIZE=16384
	 */
	return ((_beginthread((void(__cdecl *)(void *))f, USE_STACK_SIZE, p)
	         == ((uintptr_t)(-1L)))
	            ? -1
	            : 0);
#else
	return (
	    (_beginthread((void(__cdecl *)(void *))f, 0, p) == ((uintptr_t)(-1L)))
	        ? -1
	        : 0);
#endif /* defined(USE_STACK_SIZE) && (USE_STACK_SIZE > 1) */
}


/* Start a thread storing the thread context. */
static int
mg_start_thread_with_id(unsigned(__stdcall *f)(void *),
                        void *p,
                        pthread_t *threadidptr)
{
	uintptr_t uip;
	HANDLE threadhandle;
	int result = -1;

	uip = _beginthreadex(NULL, 0, (unsigned(__stdcall *)(void *))f, p, 0, NULL);
	threadhandle = (HANDLE)uip;
	if ((uip != (uintptr_t)(-1L)) && (threadidptr != NULL)) {
		*threadidptr = threadhandle;
		result = 0;
	}

	return result;
}


/* Wait for a thread to finish. */
static int
mg_join_thread(pthread_t threadid)
{
	int result;
	DWORD dwevent;

	result = -1;
	dwevent = WaitForSingleObject(threadid, (DWORD)INFINITE);
	if (dwevent == WAIT_FAILED) {
		DEBUG_TRACE("WaitForSingleObject() failed, error %d", ERRNO);
	} else {
		if (dwevent == WAIT_OBJECT_0) {
			CloseHandle(threadid);
			result = 0;
		}
	}

	return result;
}

#if !defined(NO_SSL_DL) && !defined(NO_SSL)
/* If SSL is loaded dynamically, dlopen/dlclose is required. */
/* Create substitutes for POSIX functions in Win32. */

#if defined(GCC_DIAGNOSTIC)
/* Show no warning in case system functions are not used. */
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wunused-function"
#endif


FUNCTION_MAY_BE_UNUSED
static HANDLE
dlopen(const char *dll_name, int flags)
{
	wchar_t wbuf[W_PATH_MAX];
	(void)flags;
	path_to_unicode(NULL, dll_name, wbuf, ARRAY_SIZE(wbuf));
	return LoadLibraryW(wbuf);
}


FUNCTION_MAY_BE_UNUSED
static int
dlclose(void *handle)
{
	int result;

	if (FreeLibrary((HMODULE)handle) != 0) {
		result = 0;
	} else {
		result = -1;
	}

	return result;
}


#if defined(GCC_DIAGNOSTIC)
/* Enable unused function warning again */
#pragma GCC diagnostic pop
#endif

#endif


#if !defined(NO_CGI)
#define SIGKILL (0)


static int
kill(pid_t pid, int sig_num)
{
	(void)TerminateProcess((HANDLE)pid, (UINT)sig_num);
	(void)CloseHandle((HANDLE)pid);
	return 0;
}


#if !defined(WNOHANG)
#define WNOHANG (1)
#endif


static pid_t
waitpid(pid_t pid, int *status, int flags)
{
	DWORD timeout = INFINITE;
	DWORD waitres;

	(void)status; /* Currently not used by any client here */

	if ((flags | WNOHANG) == WNOHANG) {
		timeout = 0;
	}

	waitres = WaitForSingleObject((HANDLE)pid, timeout);
	if (waitres == WAIT_OBJECT_0) {
		return pid;
	}
	if (waitres == WAIT_TIMEOUT) {
		return 0;
	}
	return (pid_t)-1;
}


static void
trim_trailing_whitespaces(char *s)
{
	char *e = s + strlen(s) - 1;
	while ((e > s) && isspace(*(unsigned char *)e)) {
		*e-- = '\0';
	}
}


static pid_t
spawn_process(struct mg_connection *conn,
              const char *prog,
              char *envblk,
              char *envp[],
              int fdin[2],
              int fdout[2],
              int fderr[2],
              const char *dir)
{
	HANDLE me;
	char *p, *interp, full_interp[PATH_MAX], full_dir[PATH_MAX],
	    cmdline[PATH_MAX], buf[PATH_MAX];
	int truncated;
	struct mg_file file = STRUCT_FILE_INITIALIZER;
	STARTUPINFOA si;
	PROCESS_INFORMATION pi = {0};

	(void)envp;

	memset(&si, 0, sizeof(si));
	si.cb = sizeof(si);

	si.dwFlags = STARTF_USESTDHANDLES | STARTF_USESHOWWINDOW;
	si.wShowWindow = SW_HIDE;

	me = GetCurrentProcess();
	DuplicateHandle(me,
	                (HANDLE)_get_osfhandle(fdin[0]),
	                me,
	                &si.hStdInput,
	                0,
	                TRUE,
	                DUPLICATE_SAME_ACCESS);
	DuplicateHandle(me,
	                (HANDLE)_get_osfhandle(fdout[1]),
	                me,
	                &si.hStdOutput,
	                0,
	                TRUE,
	                DUPLICATE_SAME_ACCESS);
	DuplicateHandle(me,
	                (HANDLE)_get_osfhandle(fderr[1]),
	                me,
	                &si.hStdError,
	                0,
	                TRUE,
	                DUPLICATE_SAME_ACCESS);

	/* Mark handles that should not be inherited. See
	 * https://msdn.microsoft.com/en-us/library/windows/desktop/ms682499%28v=vs.85%29.aspx
	 */
	SetHandleInformation((HANDLE)_get_osfhandle(fdin[1]),
	                     HANDLE_FLAG_INHERIT,
	                     0);
	SetHandleInformation((HANDLE)_get_osfhandle(fdout[0]),
	                     HANDLE_FLAG_INHERIT,
	                     0);
	SetHandleInformation((HANDLE)_get_osfhandle(fderr[0]),
	                     HANDLE_FLAG_INHERIT,
	                     0);

	/* If CGI file is a script, try to read the interpreter line */
	interp = conn->dom_ctx->config[CGI_INTERPRETER];
	if (interp == NULL) {
		buf[0] = buf[1] = '\0';

		/* Read the first line of the script into the buffer */
		mg_snprintf(
		    conn, &truncated, cmdline, sizeof(cmdline), "%s/%s", dir, prog);

		if (truncated) {
			pi.hProcess = (pid_t)-1;
			goto spawn_cleanup;
		}

		if (mg_fopen(conn, cmdline, MG_FOPEN_MODE_READ, &file)) {
#if defined(MG_USE_OPEN_FILE)
			p = (char *)file.access.membuf;
#else
			p = (char *)NULL;
#endif
			mg_fgets(buf, sizeof(buf), &file, &p);
			(void)mg_fclose(&file.access); /* ignore error on read only file */
			buf[sizeof(buf) - 1] = '\0';
		}

		if ((buf[0] == '#') && (buf[1] == '!')) {
			trim_trailing_whitespaces(buf + 2);
		} else {
			buf[2] = '\0';
		}
		interp = buf + 2;
	}

	if (interp[0] != '\0') {
		GetFullPathNameA(interp, sizeof(full_interp), full_interp, NULL);
		interp = full_interp;
	}
	GetFullPathNameA(dir, sizeof(full_dir), full_dir, NULL);

	if (interp[0] != '\0') {
		mg_snprintf(conn,
		            &truncated,
		            cmdline,
		            sizeof(cmdline),
		            "\"%s\" \"%s\\%s\"",
		            interp,
		            full_dir,
		            prog);
	} else {
		mg_snprintf(conn,
		            &truncated,
		            cmdline,
		            sizeof(cmdline),
		            "\"%s\\%s\"",
		            full_dir,
		            prog);
	}

	if (truncated) {
		pi.hProcess = (pid_t)-1;
		goto spawn_cleanup;
	}

	DEBUG_TRACE("Running [%s]", cmdline);
	if (CreateProcessA(NULL,
	                   cmdline,
	                   NULL,
	                   NULL,
	                   TRUE,
	                   CREATE_NEW_PROCESS_GROUP,
	                   envblk,
	                   NULL,
	                   &si,
	                   &pi)
	    == 0) {
		mg_cry_internal(
		    conn, "%s: CreateProcess(%s): %ld", __func__, cmdline, (long)ERRNO);
		pi.hProcess = (pid_t)-1;
		/* goto spawn_cleanup; */
	}

spawn_cleanup:
	(void)CloseHandle(si.hStdOutput);
	(void)CloseHandle(si.hStdError);
	(void)CloseHandle(si.hStdInput);
	if (pi.hThread != NULL) {
		(void)CloseHandle(pi.hThread);
	}

	return (pid_t)pi.hProcess;
}
#endif /* !NO_CGI */


static int
set_blocking_mode(SOCKET sock)
{
	unsigned long non_blocking = 0;
	return ioctlsocket(sock, (long)FIONBIO, &non_blocking);
}

static int
set_non_blocking_mode(SOCKET sock)
{
	unsigned long non_blocking = 1;
	return ioctlsocket(sock, (long)FIONBIO, &non_blocking);
}

#else

static int
mg_stat(const struct mg_connection *conn,
        const char *path,
        struct mg_file_stat *filep)
{
	struct stat st;
	if (!filep) {
		return 0;
	}
	memset(filep, 0, sizeof(*filep));

	if (conn && is_file_in_memory(conn, path)) {

		/* Quick fix (for 1.9.x): */
		/* mg_stat must fill all fields, also for files in memory */
		struct mg_file tmp_file = STRUCT_FILE_INITIALIZER;
		open_file_in_memory(conn, path, &tmp_file, MG_FOPEN_MODE_NONE);
		filep->size = tmp_file.stat.size;
		filep->last_modified = time(NULL);
		filep->location = 2;
		/* TODO: remove legacy "files in memory" feature */

		return 1;
	}

	if (0 == stat(path, &st)) {
		filep->size = (uint64_t)(st.st_size);
		filep->last_modified = st.st_mtime;
		filep->is_directory = S_ISDIR(st.st_mode);
		return 1;
	}

	return 0;
}


static void
set_close_on_exec(SOCKET fd, struct mg_connection *conn /* may be null */)
{
	if (fcntl(fd, F_SETFD, FD_CLOEXEC) != 0) {
		if (conn) {
			mg_cry_internal(conn,
			                "%s: fcntl(F_SETFD FD_CLOEXEC) failed: %s",
			                __func__,
			                strerror(ERRNO));
		}
	}
}


int
mg_start_thread(mg_thread_func_t func, void *param)
{
	pthread_t thread_id;
	pthread_attr_t attr;
	int result;

	(void)pthread_attr_init(&attr);
	(void)pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_DETACHED);

#if defined(USE_STACK_SIZE) && (USE_STACK_SIZE > 1)
	/* Compile-time option to control stack size,
	 * e.g. -DUSE_STACK_SIZE=16384 */
	(void)pthread_attr_setstacksize(&attr, USE_STACK_SIZE);
#endif /* defined(USE_STACK_SIZE) && (USE_STACK_SIZE > 1) */

	result = pthread_create(&thread_id, &attr, func, param);
	pthread_attr_destroy(&attr);

	return result;
}


/* Start a thread storing the thread context. */
static int
mg_start_thread_with_id(mg_thread_func_t func,
                        void *param,
                        pthread_t *threadidptr)
{
	pthread_t thread_id;
	pthread_attr_t attr;
	int result;

	(void)pthread_attr_init(&attr);

#if defined(USE_STACK_SIZE) && (USE_STACK_SIZE > 1)
	/* Compile-time option to control stack size,
	 * e.g. -DUSE_STACK_SIZE=16384 */
	(void)pthread_attr_setstacksize(&attr, USE_STACK_SIZE);
#endif /* defined(USE_STACK_SIZE) && USE_STACK_SIZE > 1 */

	result = pthread_create(&thread_id, &attr, func, param);
	pthread_attr_destroy(&attr);
	if ((result == 0) && (threadidptr != NULL)) {
		*threadidptr = thread_id;
	}
	return result;
}


/* Wait for a thread to finish. */
static int
mg_join_thread(pthread_t threadid)
{
	int result;

	result = pthread_join(threadid, NULL);
	return result;
}


#if !defined(NO_CGI)
static pid_t
spawn_process(struct mg_connection *conn,
              const char *prog,
              char *envblk,
              char *envp[],
              int fdin[2],
              int fdout[2],
              int fderr[2],
              const char *dir)
{
	pid_t pid;
	const char *interp;

	(void)envblk;

	if (conn == NULL) {
		return 0;
	}

	if ((pid = fork()) == -1) {
		/* Parent */
		mg_send_http_error(conn,
		                   500,
		                   "Error: Creating CGI process\nfork(): %s",
		                   strerror(ERRNO));
	} else if (pid == 0) {
		/* Child */
		if (chdir(dir) != 0) {
			mg_cry_internal(
			    conn, "%s: chdir(%s): %s", __func__, dir, strerror(ERRNO));
		} else if (dup2(fdin[0], 0) == -1) {
			mg_cry_internal(conn,
			                "%s: dup2(%d, 0): %s",
			                __func__,
			                fdin[0],
			                strerror(ERRNO));
		} else if (dup2(fdout[1], 1) == -1) {
			mg_cry_internal(conn,
			                "%s: dup2(%d, 1): %s",
			                __func__,
			                fdout[1],
			                strerror(ERRNO));
		} else if (dup2(fderr[1], 2) == -1) {
			mg_cry_internal(conn,
			                "%s: dup2(%d, 2): %s",
			                __func__,
			                fderr[1],
			                strerror(ERRNO));
		} else {
			/* Keep stderr and stdout in two different pipes.
			 * Stdout will be sent back to the client,
			 * stderr should go into a server error log. */
			(void)close(fdin[0]);
			(void)close(fdout[1]);
			(void)close(fderr[1]);

			/* Close write end fdin and read end fdout and fderr */
			(void)close(fdin[1]);
			(void)close(fdout[0]);
			(void)close(fderr[0]);

			/* After exec, all signal handlers are restored to their default
			 * values, with one exception of SIGCHLD. According to
			 * POSIX.1-2001 and Linux's implementation, SIGCHLD's handler
			 * will leave unchanged after exec if it was set to be ignored.
			 * Restore it to default action. */
			signal(SIGCHLD, SIG_DFL);

			interp = conn->dom_ctx->config[CGI_INTERPRETER];
			if (interp == NULL) {
				(void)execle(prog, prog, NULL, envp);
				mg_cry_internal(conn,
				                "%s: execle(%s): %s",
				                __func__,
				                prog,
				                strerror(ERRNO));
			} else {
				(void)execle(interp, interp, prog, NULL, envp);
				mg_cry_internal(conn,
				                "%s: execle(%s %s): %s",
				                __func__,
				                interp,
				                prog,
				                strerror(ERRNO));
			}
		}
		exit(EXIT_FAILURE);
	}

	return pid;
}
#endif /* !NO_CGI */


static int
set_non_blocking_mode(SOCKET sock)
{
	int flags = fcntl(sock, F_GETFL, 0);
	if (flags < 0) {
		return -1;
	}

	if (fcntl(sock, F_SETFL, (flags | O_NONBLOCK)) < 0) {
		return -1;
	}
	return 0;
}

static int
set_blocking_mode(SOCKET sock)
{
	int flags = fcntl(sock, F_GETFL, 0);
	if (flags < 0) {
		return -1;
	}

	if (fcntl(sock, F_SETFL, flags & (~(int)(O_NONBLOCK))) < 0) {
		return -1;
	}
	return 0;
}
#endif /* _WIN32 / else */

/* End of initial operating system specific define block. */


/* Get a random number (independent of C rand function) */
static uint64_t
get_random(void)
{
	static uint64_t lfsr = 0; /* Linear feedback shift register */
	static uint64_t lcg = 0;  /* Linear congruential generator */
	uint64_t now = mg_get_current_time_ns();

	if (lfsr == 0) {
		/* lfsr will be only 0 if has not been initialized,
		 * so this code is called only once. */
		lfsr = mg_get_current_time_ns();
		lcg = mg_get_current_time_ns();
	} else {
		/* Get the next step of both random number generators. */
		lfsr = (lfsr >> 1)
		       | ((((lfsr >> 0) ^ (lfsr >> 1) ^ (lfsr >> 3) ^ (lfsr >> 4)) & 1)
		          << 63);
		lcg = lcg * 6364136223846793005LL + 1442695040888963407LL;
	}

	/* Combining two pseudo-random number generators and a high resolution
	 * part
	 * of the current server time will make it hard (impossible?) to guess
	 * the
	 * next number. */
	return (lfsr ^ lcg ^ now);
}


static int
mg_poll(struct pollfd *pfd,
        unsigned int n,
        int milliseconds,
        volatile int *stop_server)
{
	/* Call poll, but only for a maximum time of a few seconds.
	 * This will allow to stop the server after some seconds, instead
	 * of having to wait for a long socket timeout. */
	int ms_now = SOCKET_TIMEOUT_QUANTUM; /* Sleep quantum in ms */

	do {
		int result;

		if (*stop_server) {
			/* Shut down signal */
			return -2;
		}

		if ((milliseconds >= 0) && (milliseconds < ms_now)) {
			ms_now = milliseconds;
		}

		result = poll(pfd, n, ms_now);
		if (result != 0) {
			/* Poll returned either success (1) or error (-1).
			 * Forward both to the caller. */
			return result;
		}

		/* Poll returned timeout (0). */
		if (milliseconds > 0) {
			milliseconds -= ms_now;
		}

	} while (milliseconds != 0);

	/* timeout: return 0 */
	return 0;
}


/* Write data to the IO channel - opened file descriptor, socket or SSL
 * descriptor.
 * Return value:
 *  >=0 .. number of bytes successfully written
 *   -1 .. timeout
 *   -2 .. error
 */
static int
push_inner(struct mg_context *ctx,
           FILE *fp,
           SOCKET sock,
           SSL *ssl,
           const char *buf,
           int len,
           double timeout)
{
	uint64_t start = 0, now = 0, timeout_ns = 0;
	int n, err;
	unsigned ms_wait = SOCKET_TIMEOUT_QUANTUM; /* Sleep quantum in ms */

#if defined(_WIN32)
	typedef int len_t;
#else
	typedef size_t len_t;
#endif

	if (timeout > 0) {
		now = mg_get_current_time_ns();
		start = now;
		timeout_ns = (uint64_t)(timeout * 1.0E9);
	}

	if (ctx == NULL) {
		return -2;
	}

#if defined(NO_SSL)
	if (ssl) {
		return -2;
	}
#endif

	/* Try to read until it succeeds, fails, times out, or the server
	 * shuts down. */
	for (;;) {

#if !defined(NO_SSL)
		if (ssl != NULL) {
			n = SSL_write(ssl, buf, len);
			if (n <= 0) {
				err = SSL_get_error(ssl, n);
				if ((err == SSL_ERROR_SYSCALL) && (n == -1)) {
					err = ERRNO;
				} else if ((err == SSL_ERROR_WANT_READ)
				           || (err == SSL_ERROR_WANT_WRITE)) {
					n = 0;
				} else {
					DEBUG_TRACE("SSL_write() failed, error %d", err);
					return -2;
				}
			} else {
				err = 0;
			}
		} else
#endif
		    if (fp != NULL) {
			n = (int)fwrite(buf, 1, (size_t)len, fp);
			if (ferror(fp)) {
				n = -1;
				err = ERRNO;
			} else {
				err = 0;
			}
		} else {
			n = (int)send(sock, buf, (len_t)len, MSG_NOSIGNAL);
			err = (n < 0) ? ERRNO : 0;
#if defined(_WIN32)
			if (err == WSAEWOULDBLOCK) {
				err = 0;
				n = 0;
			}
#else
			if (err == EWOULDBLOCK) {
				err = 0;
				n = 0;
			}
#endif
			if (n < 0) {
				/* shutdown of the socket at client side */
				return -2;
			}
		}

		if (ctx->stop_flag) {
			return -2;
		}

		if ((n > 0) || ((n == 0) && (len == 0))) {
			/* some data has been read, or no data was requested */
			return n;
		}
		if (n < 0) {
			/* socket error - check errno */
			DEBUG_TRACE("send() failed, error %d", err);

			/* TODO (mid): error handling depending on the error code.
			 * These codes are different between Windows and Linux.
			 * Currently there is no problem with failing send calls,
			 * if there is a reproducible situation, it should be
			 * investigated in detail.
			 */
			return -2;
		}

		/* Only in case n=0 (timeout), repeat calling the write function */

		/* If send failed, wait before retry */
		if (fp != NULL) {
			/* For files, just wait a fixed time.
			 * Maybe it helps, maybe not. */
			mg_sleep(5);
		} else {
			/* For sockets, wait for the socket using poll */
			struct pollfd pfd[1];
			int pollres;

			pfd[0].fd = sock;
			pfd[0].events = POLLOUT;
			pollres = mg_poll(pfd, 1, (int)(ms_wait), &(ctx->stop_flag));
			if (ctx->stop_flag) {
				return -2;
			}
			if (pollres > 0) {
				continue;
			}
		}

		if (timeout > 0) {
			now = mg_get_current_time_ns();
			if ((now - start) > timeout_ns) {
				/* Timeout */
				break;
			}
		}
	}

	(void)err; /* Avoid unused warning if NO_SSL is set and DEBUG_TRACE is not
	              used */

	return -1;
}


static int64_t
push_all(struct mg_context *ctx,
         FILE *fp,
         SOCKET sock,
         SSL *ssl,
         const char *buf,
         int64_t len)
{
	double timeout = -1.0;
	int64_t n, nwritten = 0;

	if (ctx == NULL) {
		return -1;
	}

	if (ctx->dd.config[REQUEST_TIMEOUT]) {
		timeout = atoi(ctx->dd.config[REQUEST_TIMEOUT]) / 1000.0;
	}

	while ((len > 0) && (ctx->stop_flag == 0)) {
		n = push_inner(ctx, fp, sock, ssl, buf + nwritten, (int)len, timeout);
		if (n < 0) {
			if (nwritten == 0) {
				nwritten = n; /* Propagate the error */
			}
			break;
		} else if (n == 0) {
			break; /* No more data to write */
		} else {
			nwritten += n;
			len -= n;
		}
	}

	return nwritten;
}


/* Read from IO channel - opened file descriptor, socket, or SSL descriptor.
 * Return value:
 *  >=0 .. number of bytes successfully read
 *   -1 .. timeout
 *   -2 .. error
 */
static int
pull_inner(FILE *fp,
           struct mg_connection *conn,
           char *buf,
           int len,
           double timeout)
{
	int nread, err = 0;

#if defined(_WIN32)
	typedef int len_t;
#else
	typedef size_t len_t;
#endif
#if !defined(NO_SSL)
	int ssl_pending;
#endif

	/* We need an additional wait loop around this, because in some cases
	 * with TLSwe may get data from the socket but not from SSL_read.
	 * In this case we need to repeat at least once.
	 */

	if (fp != NULL) {
#if !defined(_WIN32_WCE)
		/* Use read() instead of fread(), because if we're reading from the
		 * CGI pipe, fread() may block until IO buffer is filled up. We
		 * cannot afford to block and must pass all read bytes immediately
		 * to the client. */
		nread = (int)read(fileno(fp), buf, (size_t)len);
#else
		/* WinCE does not support CGI pipes */
		nread = (int)fread(buf, 1, (size_t)len, fp);
#endif
		err = (nread < 0) ? ERRNO : 0;
		if ((nread == 0) && (len > 0)) {
			/* Should get data, but got EOL */
			return -2;
		}

#if !defined(NO_SSL)
	} else if ((conn->ssl != NULL)
	           && ((ssl_pending = SSL_pending(conn->ssl)) > 0)) {
		/* We already know there is no more data buffered in conn->buf
		 * but there is more available in the SSL layer. So don't poll
		 * conn->client.sock yet. */
		if (ssl_pending > len) {
			ssl_pending = len;
		}
		nread = SSL_read(conn->ssl, buf, ssl_pending);
		if (nread <= 0) {
			err = SSL_get_error(conn->ssl, nread);
			if ((err == SSL_ERROR_SYSCALL) && (nread == -1)) {
				err = ERRNO;
			} else if ((err == SSL_ERROR_WANT_READ)
			           || (err == SSL_ERROR_WANT_WRITE)) {
				nread = 0;
			} else {
				DEBUG_TRACE("SSL_read() failed, error %d", err);
				return -1;
			}
		} else {
			err = 0;
		}

	} else if (conn->ssl != NULL) {

		struct pollfd pfd[1];
		int pollres;

		pfd[0].fd = conn->client.sock;
		pfd[0].events = POLLIN;
		pollres = mg_poll(pfd,
		                  1,
		                  (int)(timeout * 1000.0),
		                  &(conn->phys_ctx->stop_flag));
		if (conn->phys_ctx->stop_flag) {
			return -2;
		}
		if (pollres > 0) {
			nread = SSL_read(conn->ssl, buf, len);
			if (nread <= 0) {
				err = SSL_get_error(conn->ssl, nread);
				if ((err == SSL_ERROR_SYSCALL) && (nread == -1)) {
					err = ERRNO;
				} else if ((err == SSL_ERROR_WANT_READ)
				           || (err == SSL_ERROR_WANT_WRITE)) {
					nread = 0;
				} else {
					DEBUG_TRACE("SSL_read() failed, error %d", err);
					return -2;
				}
			} else {
				err = 0;
			}

		} else if (pollres < 0) {
			/* Error */
			return -2;
		} else {
			/* pollres = 0 means timeout */
			nread = 0;
		}
#endif

	} else {
		struct pollfd pfd[1];
		int pollres;

		pfd[0].fd = conn->client.sock;
		pfd[0].events = POLLIN;
		pollres = mg_poll(pfd,
		                  1,
		                  (int)(timeout * 1000.0),
		                  &(conn->phys_ctx->stop_flag));
		if (conn->phys_ctx->stop_flag) {
			return -2;
		}
		if (pollres > 0) {
			nread = (int)recv(conn->client.sock, buf, (len_t)len, 0);
			err = (nread < 0) ? ERRNO : 0;
			if (nread <= 0) {
				/* shutdown of the socket at client side */
				return -2;
			}
		} else if (pollres < 0) {
			/* error callint poll */
			return -2;
		} else {
			/* pollres = 0 means timeout */
			nread = 0;
		}
	}

	if (conn->phys_ctx->stop_flag) {
		return -2;
	}

	if ((nread > 0) || ((nread == 0) && (len == 0))) {
		/* some data has been read, or no data was requested */
		return nread;
	}

	if (nread < 0) {
/* socket error - check errno */
#if defined(_WIN32)
		if (err == WSAEWOULDBLOCK) {
			/* TODO (low): check if this is still required */
			/* standard case if called from close_socket_gracefully */
			return -2;
		} else if (err == WSAETIMEDOUT) {
			/* TODO (low): check if this is still required */
			/* timeout is handled by the while loop  */
			return 0;
		} else if (err == WSAECONNABORTED) {
			/* See https://www.chilkatsoft.com/p/p_299.asp */
			return -2;
		} else {
			DEBUG_TRACE("recv() failed, error %d", err);
			return -2;
		}
#else
		/* TODO: POSIX returns either EAGAIN or EWOULDBLOCK in both cases,
		 * if the timeout is reached and if the socket was set to non-
		 * blocking in close_socket_gracefully, so we can not distinguish
		 * here. We have to wait for the timeout in both cases for now.
		 */
		if ((err == EAGAIN) || (err == EWOULDBLOCK) || (err == EINTR)) {
			/* TODO (low): check if this is still required */
			/* EAGAIN/EWOULDBLOCK:
			 * standard case if called from close_socket_gracefully
			 * => should return -1 */
			/* or timeout occurred
			 * => the code must stay in the while loop */

			/* EINTR can be generated on a socket with a timeout set even
			 * when SA_RESTART is effective for all relevant signals
			 * (see signal(7)).
			 * => stay in the while loop */
		} else {
			DEBUG_TRACE("recv() failed, error %d", err);
			return -2;
		}
#endif
	}

	/* Timeout occurred, but no data available. */
	return -1;
}


static int
pull_all(FILE *fp, struct mg_connection *conn, char *buf, int len)
{
	int n, nread = 0;
	double timeout = -1.0;
	uint64_t start_time = 0, now = 0, timeout_ns = 0;

	if (conn->dom_ctx->config[REQUEST_TIMEOUT]) {
		timeout = atoi(conn->dom_ctx->config[REQUEST_TIMEOUT]) / 1000.0;
	}
	if (timeout >= 0.0) {
		start_time = mg_get_current_time_ns();
		timeout_ns = (uint64_t)(timeout * 1.0E9);
	}

	while ((len > 0) && (conn->phys_ctx->stop_flag == 0)) {
		n = pull_inner(fp, conn, buf + nread, len, timeout);
		if (n == -2) {
			if (nread == 0) {
				nread = -1; /* Propagate the error */
			}
			break;
		} else if (n == -1) {
			/* timeout */
			if (timeout >= 0.0) {
				now = mg_get_current_time_ns();
				if ((now - start_time) <= timeout_ns) {
					continue;
				}
			}
			break;
		} else if (n == 0) {
			break; /* No more data to read */
		} else {
			conn->consumed_content += n;
			nread += n;
			len -= n;
		}
	}

	return nread;
}


static void
discard_unread_request_data(struct mg_connection *conn)
{
	char buf[MG_BUF_LEN];
	size_t to_read;
	int nread;

	if (conn == NULL) {
		return;
	}

	to_read = sizeof(buf);

	if (conn->is_chunked) {
		/* Chunked encoding: 3=chunk read completely
		 * completely */
		while (conn->is_chunked != 3) {
			nread = mg_read(conn, buf, to_read);
			if (nread <= 0) {
				break;
			}
		}

	} else {
		/* Not chunked: content length is known */
		while (conn->consumed_content < conn->content_len) {
			if (to_read
			    > (size_t)(conn->content_len - conn->consumed_content)) {
				to_read = (size_t)(conn->content_len - conn->consumed_content);
			}

			nread = mg_read(conn, buf, to_read);
			if (nread <= 0) {
				break;
			}
		}
	}
}


static int
mg_read_inner(struct mg_connection *conn, void *buf, size_t len)
{
	int64_t n, buffered_len, nread;
	int64_t len64 =
	    (int64_t)((len > INT_MAX) ? INT_MAX : len); /* since the return value is
	                                                 * int, we may not read more
	                                                 * bytes */
	const char *body;

	if (conn == NULL) {
		return 0;
	}

	/* If Content-Length is not set for a request with body data
	 * (e.g., a PUT or POST request), we do not know in advance
	 * how much data should be read. */
	if (conn->consumed_content == 0) {
		if (conn->is_chunked == 1) {
			conn->content_len = len64;
			conn->is_chunked = 2;
		} else if (conn->content_len == -1) {
			/* The body data is completed when the connection
			 * is closed. */
			conn->content_len = INT64_MAX;
			conn->must_close = 1;
		}
	}

	nread = 0;
	if (conn->consumed_content < conn->content_len) {
		/* Adjust number of bytes to read. */
		int64_t left_to_read = conn->content_len - conn->consumed_content;
		if (left_to_read < len64) {
			/* Do not read more than the total content length of the
			 * request.
			 */
			len64 = left_to_read;
		}

		/* Return buffered data */
		buffered_len = (int64_t)(conn->data_len) - (int64_t)conn->request_len
		               - conn->consumed_content;
		if (buffered_len > 0) {
			if (len64 < buffered_len) {
				buffered_len = len64;
			}
			body = conn->buf + conn->request_len + conn->consumed_content;
			memcpy(buf, body, (size_t)buffered_len);
			len64 -= buffered_len;
			conn->consumed_content += buffered_len;
			nread += buffered_len;
			buf = (char *)buf + buffered_len;
		}

		/* We have returned all buffered data. Read new data from the remote
		 * socket.
		 */
		if ((n = pull_all(NULL, conn, (char *)buf, (int)len64)) >= 0) {
			nread += n;
		} else {
			nread = ((nread > 0) ? nread : n);
		}
	}
	return (int)nread;
}


static char
mg_getc(struct mg_connection *conn)
{
	char c;
	if (conn == NULL) {
		return 0;
	}
	if (mg_read_inner(conn, &c, 1) <= 0) {
		return (char)0;
	}
	return c;
}


int
mg_read(struct mg_connection *conn, void *buf, size_t len)
{
	if (len > INT_MAX) {
		len = INT_MAX;
	}

	if (conn == NULL) {
		return 0;
	}

	if (conn->is_chunked) {
		size_t all_read = 0;

		while (len > 0) {
			if (conn->is_chunked == 3) {
				/* No more data left to read */
				return 0;
			}

			if (conn->chunk_remainder) {
				/* copy from the remainder of the last received chunk */
				long read_ret;
				size_t read_now =
				    ((conn->chunk_remainder > len) ? (len)
				                                   : (conn->chunk_remainder));

				conn->content_len += (int)read_now;
				read_ret =
				    mg_read_inner(conn, (char *)buf + all_read, read_now);

				if (read_ret < 1) {
					/* read error */
					return -1;
				}

				all_read += (size_t)read_ret;
				conn->chunk_remainder -= (size_t)read_ret;
				len -= (size_t)read_ret;

				if (conn->chunk_remainder == 0) {
					/* Add data bytes in the current chunk have been read,
					 * so we are expecting \r\n now. */
					char x1, x2;
					conn->content_len += 2;
					x1 = mg_getc(conn);
					x2 = mg_getc(conn);
					if ((x1 != '\r') || (x2 != '\n')) {
						/* Protocol violation */
						return -1;
					}
				}

			} else {
				/* fetch a new chunk */
				int i = 0;
				char lenbuf[64];
				char *end = 0;
				unsigned long chunkSize = 0;

				for (i = 0; i < ((int)sizeof(lenbuf) - 1); i++) {
					conn->content_len++;
					lenbuf[i] = mg_getc(conn);
					if ((i > 0) && (lenbuf[i] == '\r')
					    && (lenbuf[i - 1] != '\r')) {
						continue;
					}
					if ((i > 1) && (lenbuf[i] == '\n')
					    && (lenbuf[i - 1] == '\r')) {
						lenbuf[i + 1] = 0;
						chunkSize = strtoul(lenbuf, &end, 16);
						if (chunkSize == 0) {
							/* regular end of content */
							conn->is_chunked = 3;
						}
						break;
					}
					if (!isxdigit(lenbuf[i])) {
						/* illegal character for chunk length */
						return -1;
					}
				}
				if ((end == NULL) || (*end != '\r')) {
					/* chunksize not set correctly */
					return -1;
				}
				if (chunkSize == 0) {
					break;
				}

				conn->chunk_remainder = chunkSize;
			}
		}

		return (int)all_read;
	}
	return mg_read_inner(conn, buf, len);
}


int
mg_write(struct mg_connection *conn, const void *buf, size_t len)
{
	time_t now;
	int64_t n, total, allowed;

	if (conn == NULL) {
		return 0;
	}

	if (conn->throttle > 0) {
		if ((now = time(NULL)) != conn->last_throttle_time) {
			conn->last_throttle_time = now;
			conn->last_throttle_bytes = 0;
		}
		allowed = conn->throttle - conn->last_throttle_bytes;
		if (allowed > (int64_t)len) {
			allowed = (int64_t)len;
		}
		if ((total = push_all(conn->phys_ctx,
		                      NULL,
		                      conn->client.sock,
		                      conn->ssl,
		                      (const char *)buf,
		                      (int64_t)allowed))
		    == allowed) {
			buf = (const char *)buf + total;
			conn->last_throttle_bytes += total;
			while ((total < (int64_t)len) && (conn->phys_ctx->stop_flag == 0)) {
				allowed = (conn->throttle > ((int64_t)len - total))
				              ? (int64_t)len - total
				              : conn->throttle;
				if ((n = push_all(conn->phys_ctx,
				                  NULL,
				                  conn->client.sock,
				                  conn->ssl,
				                  (const char *)buf,
				                  (int64_t)allowed))
				    != allowed) {
					break;
				}
				sleep(1);
				conn->last_throttle_bytes = allowed;
				conn->last_throttle_time = time(NULL);
				buf = (const char *)buf + n;
				total += n;
			}
		}
	} else {
		total = push_all(conn->phys_ctx,
		                 NULL,
		                 conn->client.sock,
		                 conn->ssl,
		                 (const char *)buf,
		                 (int64_t)len);
	}
	if (total > 0) {
		conn->num_bytes_sent += total;
	}
	return (int)total;
}


/* Send a chunk, if "Transfer-Encoding: chunked" is used */
int
mg_send_chunk(struct mg_connection *conn,
              const char *chunk,
              unsigned int chunk_len)
{
	char lenbuf[16];
	size_t lenbuf_len;
	int ret;
	int t;

	/* First store the length information in a text buffer. */
	sprintf(lenbuf, "%x\r\n", chunk_len);
	lenbuf_len = strlen(lenbuf);

	/* Then send length information, chunk and terminating \r\n. */
	ret = mg_write(conn, lenbuf, lenbuf_len);
	if (ret != (int)lenbuf_len) {
		return -1;
	}
	t = ret;

	ret = mg_write(conn, chunk, chunk_len);
	if (ret != (int)chunk_len) {
		return -1;
	}
	t += ret;

	ret = mg_write(conn, "\r\n", 2);
	if (ret != 2) {
		return -1;
	}
	t += ret;

	return t;
}


#if defined(GCC_DIAGNOSTIC)
/* This block forwards format strings to printf implementations,
 * so we need to disable the format-nonliteral warning. */
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wformat-nonliteral"
#endif


/* Alternative alloc_vprintf() for non-compliant C runtimes */
static int
alloc_vprintf2(char **buf, const char *fmt, va_list ap)
{
	va_list ap_copy;
	size_t size = MG_BUF_LEN / 4;
	int len = -1;

	*buf = NULL;
	while (len < 0) {
		if (*buf) {
			mg_free(*buf);
		}

		size *= 4;
		*buf = (char *)mg_malloc(size);
		if (!*buf) {
			break;
		}

		va_copy(ap_copy, ap);
		len = vsnprintf_impl(*buf, size - 1, fmt, ap_copy);
		va_end(ap_copy);
		(*buf)[size - 1] = 0;
	}

	return len;
}


/* Print message to buffer. If buffer is large enough to hold the message,
 * return buffer. If buffer is to small, allocate large enough buffer on
 * heap,
 * and return allocated buffer. */
static int
alloc_vprintf(char **out_buf,
              char *prealloc_buf,
              size_t prealloc_size,
              const char *fmt,
              va_list ap)
{
	va_list ap_copy;
	int len;

	/* Windows is not standard-compliant, and vsnprintf() returns -1 if
	 * buffer is too small. Also, older versions of msvcrt.dll do not have
	 * _vscprintf().  However, if size is 0, vsnprintf() behaves correctly.
	 * Therefore, we make two passes: on first pass, get required message
	 * length.
	 * On second pass, actually print the message. */
	va_copy(ap_copy, ap);
	len = vsnprintf_impl(NULL, 0, fmt, ap_copy);
	va_end(ap_copy);

	if (len < 0) {
		/* C runtime is not standard compliant, vsnprintf() returned -1.
		 * Switch to alternative code path that uses incremental
		 * allocations.
		 */
		va_copy(ap_copy, ap);
		len = alloc_vprintf2(out_buf, fmt, ap_copy);
		va_end(ap_copy);

	} else if ((size_t)(len) >= prealloc_size) {
		/* The pre-allocated buffer not large enough. */
		/* Allocate a new buffer. */
		*out_buf = (char *)mg_malloc((size_t)(len) + 1);
		if (!*out_buf) {
			/* Allocation failed. Return -1 as "out of memory" error. */
			return -1;
		}
		/* Buffer allocation successful. Store the string there. */
		va_copy(ap_copy, ap);
		IGNORE_UNUSED_RESULT(
		    vsnprintf_impl(*out_buf, (size_t)(len) + 1, fmt, ap_copy));
		va_end(ap_copy);

	} else {
		/* The pre-allocated buffer is large enough.
		 * Use it to store the string and return the address. */
		va_copy(ap_copy, ap);
		IGNORE_UNUSED_RESULT(
		    vsnprintf_impl(prealloc_buf, prealloc_size, fmt, ap_copy));
		va_end(ap_copy);
		*out_buf = prealloc_buf;
	}

	return len;
}


#if defined(GCC_DIAGNOSTIC)
/* Enable format-nonliteral warning again. */
#pragma GCC diagnostic pop
#endif


static int
mg_vprintf(struct mg_connection *conn, const char *fmt, va_list ap)
{
	char mem[MG_BUF_LEN];
	char *buf = NULL;
	int len;

	if ((len = alloc_vprintf(&buf, mem, sizeof(mem), fmt, ap)) > 0) {
		len = mg_write(conn, buf, (size_t)len);
	}
	if ((buf != mem) && (buf != NULL)) {
		mg_free(buf);
	}

	return len;
}


int
mg_printf(struct mg_connection *conn, const char *fmt, ...)
{
	va_list ap;
	int result;

	va_start(ap, fmt);
	result = mg_vprintf(conn, fmt, ap);
	va_end(ap);

	return result;
}


int
mg_url_decode(const char *src,
              int src_len,
              char *dst,
              int dst_len,
              int is_form_url_encoded)
{
	int i, j, a, b;
#define HEXTOI(x) (isdigit(x) ? (x - '0') : (x - 'W'))

	for (i = j = 0; (i < src_len) && (j < (dst_len - 1)); i++, j++) {
		if ((i < src_len - 2) && (src[i] == '%')
		    && isxdigit(*(const unsigned char *)(src + i + 1))
		    && isxdigit(*(const unsigned char *)(src + i + 2))) {
			a = tolower(*(const unsigned char *)(src + i + 1));
			b = tolower(*(const unsigned char *)(src + i + 2));
			dst[j] = (char)((HEXTOI(a) << 4) | HEXTOI(b));
			i += 2;
		} else if (is_form_url_encoded && (src[i] == '+')) {
			dst[j] = ' ';
		} else {
			dst[j] = src[i];
		}
	}

	dst[j] = '\0'; /* Null-terminate the destination */

	return (i >= src_len) ? j : -1;
}


int
mg_get_var(const char *data,
           size_t data_len,
           const char *name,
           char *dst,
           size_t dst_len)
{
	return mg_get_var2(data, data_len, name, dst, dst_len, 0);
}


int
mg_get_var2(const char *data,
            size_t data_len,
            const char *name,
            char *dst,
            size_t dst_len,
            size_t occurrence)
{
	const char *p, *e, *s;
	size_t name_len;
	int len;

	if ((dst == NULL) || (dst_len == 0)) {
		len = -2;
	} else if ((data == NULL) || (name == NULL) || (data_len == 0)) {
		len = -1;
		dst[0] = '\0';
	} else {
		name_len = strlen(name);
		e = data + data_len;
		len = -1;
		dst[0] = '\0';

		/* data is "var1=val1&var2=val2...". Find variable first */
		for (p = data; p + name_len < e; p++) {
			if (((p == data) || (p[-1] == '&')) && (p[name_len] == '=')
			    && !mg_strncasecmp(name, p, name_len) && 0 == occurrence--) {
				/* Point p to variable value */
				p += name_len + 1;

				/* Point s to the end of the value */
				s = (const char *)memchr(p, '&', (size_t)(e - p));
				if (s == NULL) {
					s = e;
				}
				DEBUG_ASSERT(s >= p);
				if (s < p) {
					return -3;
				}

				/* Decode variable into destination buffer */
				len = mg_url_decode(p, (int)(s - p), dst, (int)dst_len, 1);

				/* Redirect error code from -1 to -2 (destination buffer too
				 * small). */
				if (len == -1) {
					len = -2;
				}
				break;
			}
		}
	}

	return len;
}


/* HCP24: some changes to compare hole var_name */
int
mg_get_cookie(const char *cookie_header,
              const char *var_name,
              char *dst,
              size_t dst_size)
{
	const char *s, *p, *end;
	int name_len, len = -1;

	if ((dst == NULL) || (dst_size == 0)) {
		return -2;
	}

	dst[0] = '\0';
	if ((var_name == NULL) || ((s = cookie_header) == NULL)) {
		return -1;
	}

	name_len = (int)strlen(var_name);
	end = s + strlen(s);
	for (; (s = mg_strcasestr(s, var_name)) != NULL; s += name_len) {
		if (s[name_len] == '=') {
			/* HCP24: now check is it a substring or a full cookie name */
			if ((s == cookie_header) || (s[-1] == ' ')) {
				s += name_len + 1;
				if ((p = strchr(s, ' ')) == NULL) {
					p = end;
				}
				if (p[-1] == ';') {
					p--;
				}
				if ((*s == '"') && (p[-1] == '"') && (p > s + 1)) {
					s++;
					p--;
				}
				if ((size_t)(p - s) < dst_size) {
					len = (int)(p - s);
					mg_strlcpy(dst, s, (size_t)len + 1);
				} else {
					len = -3;
				}
				break;
			}
		}
	}
	return len;
}


#if defined(USE_WEBSOCKET) || defined(USE_LUA)
static void
base64_encode(const unsigned char *src, int src_len, char *dst)
{
	static const char *b64 =
	    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	int i, j, a, b, c;

	for (i = j = 0; i < src_len; i += 3) {
		a = src[i];
		b = ((i + 1) >= src_len) ? 0 : src[i + 1];
		c = ((i + 2) >= src_len) ? 0 : src[i + 2];

		dst[j++] = b64[a >> 2];
		dst[j++] = b64[((a & 3) << 4) | (b >> 4)];
		if (i + 1 < src_len) {
			dst[j++] = b64[(b & 15) << 2 | (c >> 6)];
		}
		if (i + 2 < src_len) {
			dst[j++] = b64[c & 63];
		}
	}
	while (j % 4 != 0) {
		dst[j++] = '=';
	}
	dst[j++] = '\0';
}
#endif


#if defined(USE_LUA)
static unsigned char
b64reverse(char letter)
{
	if ((letter >= 'A') && (letter <= 'Z')) {
		return letter - 'A';
	}
	if ((letter >= 'a') && (letter <= 'z')) {
		return letter - 'a' + 26;
	}
	if ((letter >= '0') && (letter <= '9')) {
		return letter - '0' + 52;
	}
	if (letter == '+') {
		return 62;
	}
	if (letter == '/') {
		return 63;
	}
	if (letter == '=') {
		return 255; /* normal end */
	}
	return 254; /* error */
}


static int
base64_decode(const unsigned char *src, int src_len, char *dst, size_t *dst_len)
{
	int i;
	unsigned char a, b, c, d;

	*dst_len = 0;

	for (i = 0; i < src_len; i += 4) {
		a = b64reverse(src[i]);
		if (a >= 254) {
			return i;
		}

		b = b64reverse(((i + 1) >= src_len) ? 0 : src[i + 1]);
		if (b >= 254) {
			return i + 1;
		}

		c = b64reverse(((i + 2) >= src_len) ? 0 : src[i + 2]);
		if (c == 254) {
			return i + 2;
		}

		d = b64reverse(((i + 3) >= src_len) ? 0 : src[i + 3]);
		if (d == 254) {
			return i + 3;
		}

		dst[(*dst_len)++] = (a << 2) + (b >> 4);
		if (c != 255) {
			dst[(*dst_len)++] = (b << 4) + (c >> 2);
			if (d != 255) {
				dst[(*dst_len)++] = (c << 6) + d;
			}
		}
	}
	return -1;
}
#endif


static int
is_put_or_delete_method(const struct mg_connection *conn)
{
	if (conn) {
		const char *s = conn->request_info.request_method;
		return (s != NULL)
		       && (!strcmp(s, "PUT") || !strcmp(s, "DELETE")
		           || !strcmp(s, "MKCOL") || !strcmp(s, "PATCH"));
	}
	return 0;
}


#if !defined(NO_FILES)
static int
extention_matches_script(
    struct mg_connection *conn, /* in: request (must be valid) */
    const char *filename        /* in: filename  (must be valid) */
)
{
#if !defined(NO_CGI)
	if (match_prefix(conn->dom_ctx->config[CGI_EXTENSIONS],
	                 strlen(conn->dom_ctx->config[CGI_EXTENSIONS]),
	                 filename)
	    > 0) {
		return 1;
	}
#endif
#if defined(USE_LUA)
	if (match_prefix(conn->dom_ctx->config[LUA_SCRIPT_EXTENSIONS],
	                 strlen(conn->dom_ctx->config[LUA_SCRIPT_EXTENSIONS]),
	                 filename)
	    > 0) {
		return 1;
	}
#endif
#if defined(USE_DUKTAPE)
	if (match_prefix(conn->dom_ctx->config[DUKTAPE_SCRIPT_EXTENSIONS],
	                 strlen(conn->dom_ctx->config[DUKTAPE_SCRIPT_EXTENSIONS]),
	                 filename)
	    > 0) {
		return 1;
	}
#endif
	/* filename and conn could be unused, if all preocessor conditions
	 * are false (no script language supported). */
	(void)filename;
	(void)conn;

	return 0;
}


/* For given directory path, substitute it to valid index file.
 * Return 1 if index file has been found, 0 if not found.
 * If the file is found, it's stats is returned in stp. */
static int
substitute_index_file(struct mg_connection *conn,
                      char *path,
                      size_t path_len,
                      struct mg_file_stat *filestat)
{
	const char *list = conn->dom_ctx->config[INDEX_FILES];
	struct vec filename_vec;
	size_t n = strlen(path);
	int found = 0;

	/* The 'path' given to us points to the directory. Remove all trailing
	 * directory separator characters from the end of the path, and
	 * then append single directory separator character. */
	while ((n > 0) && (path[n - 1] == '/')) {
		n--;
	}
	path[n] = '/';

	/* Traverse index files list. For each entry, append it to the given
	 * path and see if the file exists. If it exists, break the loop */
	while ((list = next_option(list, &filename_vec, NULL)) != NULL) {
		/* Ignore too long entries that may overflow path buffer */
		if ((filename_vec.len + 1) > (path_len - (n + 1))) {
			continue;
		}

		/* Prepare full path to the index file */
		mg_strlcpy(path + n + 1, filename_vec.ptr, filename_vec.len + 1);

		/* Does it exist? */
		if (mg_stat(conn, path, filestat)) {
			/* Yes it does, break the loop */
			found = 1;
			break;
		}
	}

	/* If no index file exists, restore directory path */
	if (!found) {
		path[n] = '\0';
	}

	return found;
}
#endif


static void
interpret_uri(struct mg_connection *conn, /* in/out: request (must be valid) */
              char *filename,             /* out: filename */
              size_t filename_buf_len,    /* in: size of filename buffer */
              struct mg_file_stat *filestat, /* out: file status structure */
              int *is_found,                 /* out: file found (directly) */
              int *is_script_resource,       /* out: handled by a script? */
              int *is_websocket_request,     /* out: websocket connetion? */
              int *is_put_or_delete_request  /* out: put/delete a file? */
)
{
	char const *accept_encoding;

#if !defined(NO_FILES)
	const char *uri = conn->request_info.local_uri;
	const char *root = conn->dom_ctx->config[DOCUMENT_ROOT];
	const char *rewrite;
	struct vec a, b;
	ptrdiff_t match_len;
	char gz_path[PATH_MAX];
	int truncated;
#if !defined(NO_CGI) || defined(USE_LUA) || defined(USE_DUKTAPE)
	char *tmp_str;
	size_t tmp_str_len, sep_pos;
	int allow_substitute_script_subresources;
#endif
#else
	(void)filename_buf_len; /* unused if NO_FILES is defined */
#endif

	/* Step 1: Set all initially unknown outputs to zero */
	memset(filestat, 0, sizeof(*filestat));
	*filename = 0;
	*is_found = 0;
	*is_script_resource = 0;

	/* Step 2: Check if the request attempts to modify the file system */
	*is_put_or_delete_request = is_put_or_delete_method(conn);

/* Step 3: Check if it is a websocket request, and modify the document
 * root if required */
#if defined(USE_WEBSOCKET)
	*is_websocket_request = is_websocket_protocol(conn);
#if !defined(NO_FILES)
	if (*is_websocket_request && conn->dom_ctx->config[WEBSOCKET_ROOT]) {
		root = conn->dom_ctx->config[WEBSOCKET_ROOT];
	}
#endif /* !NO_FILES */
#else  /* USE_WEBSOCKET */
	*is_websocket_request = 0;
#endif /* USE_WEBSOCKET */

	/* Step 4: Check if gzip encoded response is allowed */
	conn->accept_gzip = 0;
	if ((accept_encoding = mg_get_header(conn, "Accept-Encoding")) != NULL) {
		if (strstr(accept_encoding, "gzip") != NULL) {
			conn->accept_gzip = 1;
		}
	}

#if !defined(NO_FILES)
	/* Step 5: If there is no root directory, don't look for files. */
	/* Note that root == NULL is a regular use case here. This occurs,
	 * if all requests are handled by callbacks, so the WEBSOCKET_ROOT
	 * config is not required. */
	if (root == NULL) {
		/* all file related outputs have already been set to 0, just return
		 */
		return;
	}

	/* Step 6: Determine the local file path from the root path and the
	 * request uri. */
	/* Using filename_buf_len - 1 because memmove() for PATH_INFO may shift
	 * part of the path one byte on the right. */
	mg_snprintf(
	    conn, &truncated, filename, filename_buf_len - 1, "%s%s", root, uri);

	if (truncated) {
		goto interpret_cleanup;
	}

	/* Step 7: URI rewriting */
	rewrite = conn->dom_ctx->config[URL_REWRITE_PATTERN];
	while ((rewrite = next_option(rewrite, &a, &b)) != NULL) {
		if ((match_len = match_prefix(a.ptr, a.len, uri)) > 0) {
			mg_snprintf(conn,
			            &truncated,
			            filename,
			            filename_buf_len - 1,
			            "%.*s%s",
			            (int)b.len,
			            b.ptr,
			            uri + match_len);
			break;
		}
	}

	if (truncated) {
		goto interpret_cleanup;
	}

	/* Step 8: Check if the file exists at the server */
	/* Local file path and name, corresponding to requested URI
	 * is now stored in "filename" variable. */
	if (mg_stat(conn, filename, filestat)) {
		int uri_len = (int)strlen(uri);
		int is_uri_end_slash = (uri_len > 0) && (uri[uri_len - 1] == '/');

		/* 8.1: File exists. */
		*is_found = 1;

		/* 8.2: Check if it is a script type. */
		if (extention_matches_script(conn, filename)) {
			/* The request addresses a CGI resource, Lua script or
			 * server-side javascript.
			 * The URI corresponds to the script itself (like
			 * /path/script.cgi), and there is no additional resource
			 * path (like /path/script.cgi/something).
			 * Requests that modify (replace or delete) a resource, like
			 * PUT and DELETE requests, should replace/delete the script
			 * file.
			 * Requests that read or write from/to a resource, like GET and
			 * POST requests, should call the script and return the
			 * generated response. */
			*is_script_resource = (!*is_put_or_delete_request);
		}

		/* 8.3: If the request target is a directory, there could be
		 * a substitute file (index.html, index.cgi, ...). */
		if (filestat->is_directory && is_uri_end_slash) {
			/* Use a local copy here, since substitute_index_file will
			 * change the content of the file status */
			struct mg_file_stat tmp_filestat;
			memset(&tmp_filestat, 0, sizeof(tmp_filestat));

			if (substitute_index_file(
			        conn, filename, filename_buf_len, &tmp_filestat)) {

				/* Substitute file found. Copy stat to the output, then
				 * check if the file is a script file */
				*filestat = tmp_filestat;

				if (extention_matches_script(conn, filename)) {
					/* Substitute file is a script file */
					*is_script_resource = 1;
				} else {
					/* Substitute file is a regular file */
					*is_script_resource = 0;
					*is_found = (mg_stat(conn, filename, filestat) ? 1 : 0);
				}
			}
			/* If there is no substitute file, the server could return
			 * a directory listing in a later step */
		}
		return;
	}

	/* Step 9: Check for zipped files: */
	/* If we can't find the actual file, look for the file
	 * with the same name but a .gz extension. If we find it,
	 * use that and set the gzipped flag in the file struct
	 * to indicate that the response need to have the content-
	 * encoding: gzip header.
	 * We can only do this if the browser declares support. */
	if (conn->accept_gzip) {
		mg_snprintf(
		    conn, &truncated, gz_path, sizeof(gz_path), "%s.gz", filename);

		if (truncated) {
			goto interpret_cleanup;
		}

		if (mg_stat(conn, gz_path, filestat)) {
			if (filestat) {
				filestat->is_gzipped = 1;
				*is_found = 1;
			}
			/* Currently gz files can not be scripts. */
			return;
		}
	}

#if !defined(NO_CGI) || defined(USE_LUA) || defined(USE_DUKTAPE)
	/* Step 10: Script resources may handle sub-resources */
	/* Support PATH_INFO for CGI scripts. */
	tmp_str_len = strlen(filename);
	tmp_str = (char *)mg_malloc_ctx(tmp_str_len + PATH_MAX + 1, conn->phys_ctx);
	if (!tmp_str) {
		/* Out of memory */
		goto interpret_cleanup;
	}
	memcpy(tmp_str, filename, tmp_str_len + 1);

	/* Check config, if index scripts may have sub-resources */
	allow_substitute_script_subresources =
	    !mg_strcasecmp(conn->dom_ctx->config[ALLOW_INDEX_SCRIPT_SUB_RES],
	                   "yes");

	sep_pos = tmp_str_len;
	while (sep_pos > 0) {
		sep_pos--;
		if (tmp_str[sep_pos] == '/') {
			int is_script = 0, does_exist = 0;

			tmp_str[sep_pos] = 0;
			if (tmp_str[0]) {
				is_script = extention_matches_script(conn, tmp_str);
				does_exist = mg_stat(conn, tmp_str, filestat);
			}

			if (does_exist && is_script) {
				filename[sep_pos] = 0;
				memmove(filename + sep_pos + 2,
				        filename + sep_pos + 1,
				        strlen(filename + sep_pos + 1) + 1);
				conn->path_info = filename + sep_pos + 1;
				filename[sep_pos + 1] = '/';
				*is_script_resource = 1;
				*is_found = 1;
				break;
			}

			if (allow_substitute_script_subresources) {
				if (substitute_index_file(
				        conn, tmp_str, tmp_str_len + PATH_MAX, filestat)) {

					/* some intermediate directory has an index file */
					if (extention_matches_script(conn, tmp_str)) {

						char *tmp_str2;

						DEBUG_TRACE("Substitute script %s serving path %s",
						            tmp_str,
						            filename);

						/* this index file is a script */
						tmp_str2 = mg_strdup_ctx(filename + sep_pos + 1,
						                         conn->phys_ctx);
						mg_snprintf(conn,
						            &truncated,
						            filename,
						            filename_buf_len,
						            "%s//%s",
						            tmp_str,
						            tmp_str2);
						mg_free(tmp_str2);

						if (truncated) {
							mg_free(tmp_str);
							goto interpret_cleanup;
						}
						sep_pos = strlen(tmp_str);
						filename[sep_pos] = 0;
						conn->path_info = filename + sep_pos + 1;
						*is_script_resource = 1;
						*is_found = 1;
						break;

					} else {

						DEBUG_TRACE("Substitute file %s serving path %s",
						            tmp_str,
						            filename);

						/* non-script files will not have sub-resources */
						filename[sep_pos] = 0;
						conn->path_info = 0;
						*is_script_resource = 0;
						*is_found = 0;
						break;
					}
				}
			}

			tmp_str[sep_pos] = '/';
		}
	}

	mg_free(tmp_str);

#endif /* !defined(NO_CGI) || defined(USE_LUA) || defined(USE_DUKTAPE) */
#endif /* !defined(NO_FILES) */
	return;

#if !defined(NO_FILES)
/* Reset all outputs */
interpret_cleanup:
	memset(filestat, 0, sizeof(*filestat));
	*filename = 0;
	*is_found = 0;
	*is_script_resource = 0;
	*is_websocket_request = 0;
	*is_put_or_delete_request = 0;
#endif /* !defined(NO_FILES) */
}


/* Check whether full request is buffered. Return:
 * -1  if request or response is malformed
 *  0  if request or response is not yet fully buffered
 * >0  actual request length, including last \r\n\r\n */
static int
get_http_header_len(const char *buf, int buflen)
{
	int i;
	for (i = 0; i < buflen; i++) {
		/* Do an unsigned comparison in some conditions below */
		const unsigned char c = ((const unsigned char *)buf)[i];

		if ((c < 128) && ((char)c != '\r') && ((char)c != '\n')
		    && !isprint(c)) {
			/* abort scan as soon as one malformed character is found */
			return -1;
		}

		if (i < buflen - 1) {
			if ((buf[i] == '\n') && (buf[i + 1] == '\n')) {
				/* Two newline, no carriage return - not standard compliant,
				 * but
				 * it
				 * should be accepted */
				return i + 2;
			}
		}

		if (i < buflen - 3) {
			if ((buf[i] == '\r') && (buf[i + 1] == '\n') && (buf[i + 2] == '\r')
			    && (buf[i + 3] == '\n')) {
				/* Two \r\n - standard compliant */
				return i + 4;
			}
		}
	}

	return 0;
}


#if !defined(NO_CACHING)
/* Convert month to the month number. Return -1 on error, or month number */
static int
get_month_index(const char *s)
{
	size_t i;

	for (i = 0; i < ARRAY_SIZE(month_names); i++) {
		if (!strcmp(s, month_names[i])) {
			return (int)i;
		}
	}

	return -1;
}


/* Parse UTC date-time string, and return the corresponding time_t value. */
static time_t
parse_date_string(const char *datetime)
{
	char month_str[32] = {0};
	int second, minute, hour, day, month, year;
	time_t result = (time_t)0;
	struct tm tm;

	if ((sscanf(datetime,
	            "%d/%3s/%d %d:%d:%d",
	            &day,
	            month_str,
	            &year,
	            &hour,
	            &minute,
	            &second)
	     == 6)
	    || (sscanf(datetime,
	               "%d %3s %d %d:%d:%d",
	               &day,
	               month_str,
	               &year,
	               &hour,
	               &minute,
	               &second)
	        == 6)
	    || (sscanf(datetime,
	               "%*3s, %d %3s %d %d:%d:%d",
	               &day,
	               month_str,
	               &year,
	               &hour,
	               &minute,
	               &second)
	        == 6)
	    || (sscanf(datetime,
	               "%d-%3s-%d %d:%d:%d",
	               &day,
	               month_str,
	               &year,
	               &hour,
	               &minute,
	               &second)
	        == 6)) {
		month = get_month_index(month_str);
		if ((month >= 0) && (year >= 1970)) {
			memset(&tm, 0, sizeof(tm));
			tm.tm_year = year - 1900;
			tm.tm_mon = month;
			tm.tm_mday = day;
			tm.tm_hour = hour;
			tm.tm_min = minute;
			tm.tm_sec = second;
			result = timegm(&tm);
		}
	}

	return result;
}
#endif /* !NO_CACHING */


/* Protect against directory disclosure attack by removing '..',
 * excessive '/' and '\' characters */
static void
remove_double_dots_and_double_slashes(char *s)
{
	char *p = s;

	while ((s[0] == '.') && (s[1] == '.')) {
		s++;
	}

	while (*s != '\0') {
		*p++ = *s++;
		if ((s[-1] == '/') || (s[-1] == '\\')) {
			/* Skip all following slashes, backslashes and double-dots */
			while (s[0] != '\0') {
				if ((s[0] == '/') || (s[0] == '\\')) {
					s++;
				} else if ((s[0] == '.') && (s[1] == '.')) {
					s += 2;
				} else {
					break;
				}
			}
		}
	}
	*p = '\0';
}


static const struct {
	const char *extension;
	size_t ext_len;
	const char *mime_type;
} builtin_mime_types[] = {
    /* IANA registered MIME types
     * (http://www.iana.org/assignments/media-types)
     * application types */
    {".doc", 4, "application/msword"},
    {".eps", 4, "application/postscript"},
    {".exe", 4, "application/octet-stream"},
    {".js", 3, "application/javascript"},
    {".json", 5, "application/json"},
    {".pdf", 4, "application/pdf"},
    {".ps", 3, "application/postscript"},
    {".rtf", 4, "application/rtf"},
    {".xhtml", 6, "application/xhtml+xml"},
    {".xsl", 4, "application/xml"},
    {".xslt", 5, "application/xml"},

    /* fonts */
    {".ttf", 4, "application/font-sfnt"},
    {".cff", 4, "application/font-sfnt"},
    {".otf", 4, "application/font-sfnt"},
    {".aat", 4, "application/font-sfnt"},
    {".sil", 4, "application/font-sfnt"},
    {".pfr", 4, "application/font-tdpfr"},
    {".woff", 5, "application/font-woff"},

    /* audio */
    {".mp3", 4, "audio/mpeg"},
    {".oga", 4, "audio/ogg"},
    {".ogg", 4, "audio/ogg"},

    /* image */
    {".gif", 4, "image/gif"},
    {".ief", 4, "image/ief"},
    {".jpeg", 5, "image/jpeg"},
    {".jpg", 4, "image/jpeg"},
    {".jpm", 4, "image/jpm"},
    {".jpx", 4, "image/jpx"},
    {".png", 4, "image/png"},
    {".svg", 4, "image/svg+xml"},
    {".tif", 4, "image/tiff"},
    {".tiff", 5, "image/tiff"},

    /* model */
    {".wrl", 4, "model/vrml"},

    /* text */
    {".css", 4, "text/css"},
    {".csv", 4, "text/csv"},
    {".htm", 4, "text/html"},
    {".html", 5, "text/html"},
    {".sgm", 4, "text/sgml"},
    {".shtm", 5, "text/html"},
    {".shtml", 6, "text/html"},
    {".txt", 4, "text/plain"},
    {".xml", 4, "text/xml"},

    /* video */
    {".mov", 4, "video/quicktime"},
    {".mp4", 4, "video/mp4"},
    {".mpeg", 5, "video/mpeg"},
    {".mpg", 4, "video/mpeg"},
    {".ogv", 4, "video/ogg"},
    {".qt", 3, "video/quicktime"},

    /* not registered types
     * (http://reference.sitepoint.com/html/mime-types-full,
     * http://www.hansenb.pdx.edu/DMKB/dict/tutorials/mime_typ.php, ..) */
    {".arj", 4, "application/x-arj-compressed"},
    {".gz", 3, "application/x-gunzip"},
    {".rar", 4, "application/x-arj-compressed"},
    {".swf", 4, "application/x-shockwave-flash"},
    {".tar", 4, "application/x-tar"},
    {".tgz", 4, "application/x-tar-gz"},
    {".torrent", 8, "application/x-bittorrent"},
    {".ppt", 4, "application/x-mspowerpoint"},
    {".xls", 4, "application/x-msexcel"},
    {".zip", 4, "application/x-zip-compressed"},
    {".aac",
     4,
     "audio/aac"}, /* http://en.wikipedia.org/wiki/Advanced_Audio_Coding */
    {".aif", 4, "audio/x-aif"},
    {".m3u", 4, "audio/x-mpegurl"},
    {".mid", 4, "audio/x-midi"},
    {".ra", 3, "audio/x-pn-realaudio"},
    {".ram", 4, "audio/x-pn-realaudio"},
    {".wav", 4, "audio/x-wav"},
    {".bmp", 4, "image/bmp"},
    {".ico", 4, "image/x-icon"},
    {".pct", 4, "image/x-pct"},
    {".pict", 5, "image/pict"},
    {".rgb", 4, "image/x-rgb"},
    {".webm", 5, "video/webm"}, /* http://en.wikipedia.org/wiki/WebM */
    {".asf", 4, "video/x-ms-asf"},
    {".avi", 4, "video/x-msvideo"},
    {".m4v", 4, "video/x-m4v"},
    {NULL, 0, NULL}};


const char *
mg_get_builtin_mime_type(const char *path)
{
	const char *ext;
	size_t i, path_len;

	path_len = strlen(path);

	for (i = 0; builtin_mime_types[i].extension != NULL; i++) {
		ext = path + (path_len - builtin_mime_types[i].ext_len);
		if ((path_len > builtin_mime_types[i].ext_len)
		    && (mg_strcasecmp(ext, builtin_mime_types[i].extension) == 0)) {
			return builtin_mime_types[i].mime_type;
		}
	}

	return "text/plain";
}


/* Look at the "path" extension and figure what mime type it has.
 * Store mime type in the vector. */
static void
get_mime_type(struct mg_connection *conn, const char *path, struct vec *vec)
{
	struct vec ext_vec, mime_vec;
	const char *list, *ext;
	size_t path_len;

	path_len = strlen(path);

	if ((conn == NULL) || (vec == NULL)) {
		if (vec != NULL) {
			memset(vec, '\0', sizeof(struct vec));
		}
		return;
	}

	/* Scan user-defined mime types first, in case user wants to
	 * override default mime types. */
	list = conn->dom_ctx->config[EXTRA_MIME_TYPES];
	while ((list = next_option(list, &ext_vec, &mime_vec)) != NULL) {
		/* ext now points to the path suffix */
		ext = path + path_len - ext_vec.len;
		if (mg_strncasecmp(ext, ext_vec.ptr, ext_vec.len) == 0) {
			*vec = mime_vec;
			return;
		}
	}

	vec->ptr = mg_get_builtin_mime_type(path);
	vec->len = strlen(vec->ptr);
}


/* Stringify binary data. Output buffer must be twice as big as input,
 * because each byte takes 2 bytes in string representation */
static void
bin2str(char *to, const unsigned char *p, size_t len)
{
	static const char *hex = "0123456789abcdef";

	for (; len--; p++) {
		*to++ = hex[p[0] >> 4];
		*to++ = hex[p[0] & 0x0f];
	}
	*to = '\0';
}


/* Return stringified MD5 hash for list of strings. Buffer must be 33 bytes.
 */
char *
mg_md5(char buf[33], ...)
{
	md5_byte_t hash[16];
	const char *p;
	va_list ap;
	md5_state_t ctx;

	md5_init(&ctx);

	va_start(ap, buf);
	while ((p = va_arg(ap, const char *)) != NULL) {
		md5_append(&ctx, (const md5_byte_t *)p, strlen(p));
	}
	va_end(ap);

	md5_finish(&ctx, hash);
	bin2str(buf, hash, sizeof(hash));
	return buf;
}


/* Check the user's password, return 1 if OK */
static int
check_password(const char *method,
               const char *ha1,
               const char *uri,
               const char *nonce,
               const char *nc,
               const char *cnonce,
               const char *qop,
               const char *response)
{
	char ha2[32 + 1], expected_response[32 + 1];

	/* Some of the parameters may be NULL */
	if ((method == NULL) || (nonce == NULL) || (nc == NULL) || (cnonce == NULL)
	    || (qop == NULL) || (response == NULL)) {
		return 0;
	}

	/* NOTE(lsm): due to a bug in MSIE, we do not compare the URI */
	if (strlen(response) != 32) {
		return 0;
	}

	mg_md5(ha2, method, ":", uri, NULL);
	mg_md5(expected_response,
	       ha1,
	       ":",
	       nonce,
	       ":",
	       nc,
	       ":",
	       cnonce,
	       ":",
	       qop,
	       ":",
	       ha2,
	       NULL);

	return mg_strcasecmp(response, expected_response) == 0;
}


/* Use the global passwords file, if specified by auth_gpass option,
 * or search for .htpasswd in the requested directory. */
static void
open_auth_file(struct mg_connection *conn,
               const char *path,
               struct mg_file *filep)
{
	if ((conn != NULL) && (conn->dom_ctx != NULL)) {
		char name[PATH_MAX];
		const char *p, *e,
		    *gpass = conn->dom_ctx->config[GLOBAL_PASSWORDS_FILE];
		int truncated;

		if (gpass != NULL) {
			/* Use global passwords file */
			if (!mg_fopen(conn, gpass, MG_FOPEN_MODE_READ, filep)) {
#if defined(DEBUG)
				/* Use mg_cry_internal here, since gpass has been configured. */
				mg_cry_internal(conn, "fopen(%s): %s", gpass, strerror(ERRNO));
#endif
			}
			/* Important: using local struct mg_file to test path for
			 * is_directory flag. If filep is used, mg_stat() makes it
			 * appear as if auth file was opened.
			 * TODO(mid): Check if this is still required after rewriting
			 * mg_stat */
		} else if (mg_stat(conn, path, &filep->stat)
		           && filep->stat.is_directory) {
			mg_snprintf(conn,
			            &truncated,
			            name,
			            sizeof(name),
			            "%s/%s",
			            path,
			            PASSWORDS_FILE_NAME);

			if (truncated || !mg_fopen(conn, name, MG_FOPEN_MODE_READ, filep)) {
#if defined(DEBUG)
				/* Don't use mg_cry_internal here, but only a trace, since this
				 * is
				 * a typical case. It will occur for every directory
				 * without a password file. */
				DEBUG_TRACE("fopen(%s): %s", name, strerror(ERRNO));
#endif
			}
		} else {
			/* Try to find .htpasswd in requested directory. */
			for (p = path, e = p + strlen(p) - 1; e > p; e--) {
				if (e[0] == '/') {
					break;
				}
			}
			mg_snprintf(conn,
			            &truncated,
			            name,
			            sizeof(name),
			            "%.*s/%s",
			            (int)(e - p),
			            p,
			            PASSWORDS_FILE_NAME);

			if (truncated || !mg_fopen(conn, name, MG_FOPEN_MODE_READ, filep)) {
#if defined(DEBUG)
				/* Don't use mg_cry_internal here, but only a trace, since this
				 * is
				 * a typical case. It will occur for every directory
				 * without a password file. */
				DEBUG_TRACE("fopen(%s): %s", name, strerror(ERRNO));
#endif
			}
		}
	}
}


/* Parsed Authorization header */
struct ah {
	char *user, *uri, *cnonce, *response, *qop, *nc, *nonce;
};


/* Return 1 on success. Always initializes the ah structure. */
static int
parse_auth_header(struct mg_connection *conn,
                  char *buf,
                  size_t buf_size,
                  struct ah *ah)
{
	char *name, *value, *s;
	const char *auth_header;
	uint64_t nonce;

	if (!ah || !conn) {
		return 0;
	}

	(void)memset(ah, 0, sizeof(*ah));
	if (((auth_header = mg_get_header(conn, "Authorization")) == NULL)
	    || mg_strncasecmp(auth_header, "Digest ", 7) != 0) {
		return 0;
	}

	/* Make modifiable copy of the auth header */
	(void)mg_strlcpy(buf, auth_header + 7, buf_size);
	s = buf;

	/* Parse authorization header */
	for (;;) {
		/* Gobble initial spaces */
		while (isspace(*(unsigned char *)s)) {
			s++;
		}
		name = skip_quoted(&s, "=", " ", 0);
		/* Value is either quote-delimited, or ends at first comma or space.
		 */
		if (s[0] == '\"') {
			s++;
			value = skip_quoted(&s, "\"", " ", '\\');
			if (s[0] == ',') {
				s++;
			}
		} else {
			value = skip_quoted(&s, ", ", " ", 0); /* IE uses commas, FF uses
			                                        * spaces */
		}
		if (*name == '\0') {
			break;
		}

		if (!strcmp(name, "username")) {
			ah->user = value;
		} else if (!strcmp(name, "cnonce")) {
			ah->cnonce = value;
		} else if (!strcmp(name, "response")) {
			ah->response = value;
		} else if (!strcmp(name, "uri")) {
			ah->uri = value;
		} else if (!strcmp(name, "qop")) {
			ah->qop = value;
		} else if (!strcmp(name, "nc")) {
			ah->nc = value;
		} else if (!strcmp(name, "nonce")) {
			ah->nonce = value;
		}
	}

#if !defined(NO_NONCE_CHECK)
	/* Read the nonce from the response. */
	if (ah->nonce == NULL) {
		return 0;
	}
	s = NULL;
	nonce = strtoull(ah->nonce, &s, 10);
	if ((s == NULL) || (*s != 0)) {
		return 0;
	}

	/* Convert the nonce from the client to a number. */
	nonce ^= conn->dom_ctx->auth_nonce_mask;

	/* The converted number corresponds to the time the nounce has been
	 * created. This should not be earlier than the server start. */
	/* Server side nonce check is valuable in all situations but one:
	 * if the server restarts frequently, but the client should not see
	 * that, so the server should accept nonces from previous starts. */
	/* However, the reasonable default is to not accept a nonce from a
	 * previous start, so if anyone changed the access rights between
	 * two restarts, a new login is required. */
	if (nonce < (uint64_t)conn->phys_ctx->start_time) {
		/* nonce is from a previous start of the server and no longer valid
		 * (replay attack?) */
		return 0;
	}
	/* Check if the nonce is too high, so it has not (yet) been used by the
	 * server. */
	if (nonce >= ((uint64_t)conn->phys_ctx->start_time
	              + conn->dom_ctx->nonce_count)) {
		return 0;
	}
#else
	(void)nonce;
#endif

	/* CGI needs it as REMOTE_USER */
	if (ah->user != NULL) {
		conn->request_info.remote_user =
		    mg_strdup_ctx(ah->user, conn->phys_ctx);
	} else {
		return 0;
	}

	return 1;
}


static const char *
mg_fgets(char *buf, size_t size, struct mg_file *filep, char **p)
{
#if defined(MG_USE_OPEN_FILE)
	const char *eof;
	size_t len;
	const char *memend;
#else
	(void)p; /* parameter is unused */
#endif

	if (!filep) {
		return NULL;
	}

#if defined(MG_USE_OPEN_FILE)
	if ((filep->access.membuf != NULL) && (*p != NULL)) {
		memend = (const char *)&filep->access.membuf[filep->stat.size];
		/* Search for \n from p till the end of stream */
		eof = (char *)memchr(*p, '\n', (size_t)(memend - *p));
		if (eof != NULL) {
			eof += 1; /* Include \n */
		} else {
			eof = memend; /* Copy remaining data */
		}
		len =
		    ((size_t)(eof - *p) > (size - 1)) ? (size - 1) : (size_t)(eof - *p);
		memcpy(buf, *p, len);
		buf[len] = '\0';
		*p += len;
		return len ? eof : NULL;
	} else /* filep->access.fp block below */
#endif
	    if (filep->access.fp != NULL) {
		return fgets(buf, (int)size, filep->access.fp);
	} else {
		return NULL;
	}
}

/* Define the initial recursion depth for procesesing htpasswd files that
 * include other htpasswd
 * (or even the same) files.  It is not difficult to provide a file or files
 * s.t. they force civetweb
 * to infinitely recurse and then crash.
 */
#define INITIAL_DEPTH 9
#if INITIAL_DEPTH <= 0
#error Bad INITIAL_DEPTH for recursion, set to at least 1
#endif

struct read_auth_file_struct {
	struct mg_connection *conn;
	struct ah ah;
	const char *domain;
	char buf[256 + 256 + 40];
	const char *f_user;
	const char *f_domain;
	const char *f_ha1;
};


static int
read_auth_file(struct mg_file *filep,
               struct read_auth_file_struct *workdata,
               int depth)
{
	char *p = NULL /* init if MG_USE_OPEN_FILE is not set */;
	int is_authorized = 0;
	struct mg_file fp;
	size_t l;

	if (!filep || !workdata || (0 == depth)) {
		return 0;
	}

/* Loop over passwords file */
#if defined(MG_USE_OPEN_FILE)
	p = (char *)filep->access.membuf;
#endif
	while (mg_fgets(workdata->buf, sizeof(workdata->buf), filep, &p) != NULL) {
		l = strlen(workdata->buf);
		while (l > 0) {
			if (isspace(workdata->buf[l - 1])
			    || iscntrl(workdata->buf[l - 1])) {
				l--;
				workdata->buf[l] = 0;
			} else
				break;
		}
		if (l < 1) {
			continue;
		}

		workdata->f_user = workdata->buf;

		if (workdata->f_user[0] == ':') {
			/* user names may not contain a ':' and may not be empty,
			 * so lines starting with ':' may be used for a special purpose
			 */
			if (workdata->f_user[1] == '#') {
				/* :# is a comment */
				continue;
			} else if (!strncmp(workdata->f_user + 1, "include=", 8)) {
				if (mg_fopen(workdata->conn,
				             workdata->f_user + 9,
				             MG_FOPEN_MODE_READ,
				             &fp)) {
					is_authorized = read_auth_file(&fp, workdata, depth - 1);
					(void)mg_fclose(
					    &fp.access); /* ignore error on read only file */

					/* No need to continue processing files once we have a
					 * match, since nothing will reset it back
					 * to 0.
					 */
					if (is_authorized) {
						return is_authorized;
					}
				} else {
					mg_cry_internal(workdata->conn,
					                "%s: cannot open authorization file: %s",
					                __func__,
					                workdata->buf);
				}
				continue;
			}
			/* everything is invalid for the moment (might change in the
			 * future) */
			mg_cry_internal(workdata->conn,
			                "%s: syntax error in authorization file: %s",
			                __func__,
			                workdata->buf);
			continue;
		}

		workdata->f_domain = strchr(workdata->f_user, ':');
		if (workdata->f_domain == NULL) {
			mg_cry_internal(workdata->conn,
			                "%s: syntax error in authorization file: %s",
			                __func__,
			                workdata->buf);
			continue;
		}
		*(char *)(workdata->f_domain) = 0;
		(workdata->f_domain)++;

		workdata->f_ha1 = strchr(workdata->f_domain, ':');
		if (workdata->f_ha1 == NULL) {
			mg_cry_internal(workdata->conn,
			                "%s: syntax error in authorization file: %s",
			                __func__,
			                workdata->buf);
			continue;
		}
		*(char *)(workdata->f_ha1) = 0;
		(workdata->f_ha1)++;

		if (!strcmp(workdata->ah.user, workdata->f_user)
		    && !strcmp(workdata->domain, workdata->f_domain)) {
			return check_password(workdata->conn->request_info.request_method,
			                      workdata->f_ha1,
			                      workdata->ah.uri,
			                      workdata->ah.nonce,
			                      workdata->ah.nc,
			                      workdata->ah.cnonce,
			                      workdata->ah.qop,
			                      workdata->ah.response);
		}
	}

	return is_authorized;
}


/* Authorize against the opened passwords file. Return 1 if authorized. */
static int
authorize(struct mg_connection *conn, struct mg_file *filep, const char *realm)
{
	struct read_auth_file_struct workdata;
	char buf[MG_BUF_LEN];

	if (!conn || !conn->dom_ctx) {
		return 0;
	}

	memset(&workdata, 0, sizeof(workdata));
	workdata.conn = conn;

	if (!parse_auth_header(conn, buf, sizeof(buf), &workdata.ah)) {
		return 0;
	}

	if (realm) {
		workdata.domain = realm;
	} else {
		workdata.domain = conn->dom_ctx->config[AUTHENTICATION_DOMAIN];
	}

	return read_auth_file(filep, &workdata, INITIAL_DEPTH);
}


/* Public function to check http digest authentication header */
int
mg_check_digest_access_authentication(struct mg_connection *conn,
                                      const char *realm,
                                      const char *filename)
{
	struct mg_file file = STRUCT_FILE_INITIALIZER;
	int auth;

	if (!conn || !filename) {
		return -1;
	}
	if (!mg_fopen(conn, filename, MG_FOPEN_MODE_READ, &file)) {
		return -2;
	}

	auth = authorize(conn, &file, realm);

	mg_fclose(&file.access);

	return auth;
}


/* Return 1 if request is authorised, 0 otherwise. */
static int
check_authorization(struct mg_connection *conn, const char *path)
{
	char fname[PATH_MAX];
	struct vec uri_vec, filename_vec;
	const char *list;
	struct mg_file file = STRUCT_FILE_INITIALIZER;
	int authorized = 1, truncated;

	if (!conn || !conn->dom_ctx) {
		return 0;
	}

	list = conn->dom_ctx->config[PROTECT_URI];
	while ((list = next_option(list, &uri_vec, &filename_vec)) != NULL) {
		if (!memcmp(conn->request_info.local_uri, uri_vec.ptr, uri_vec.len)) {
			mg_snprintf(conn,
			            &truncated,
			            fname,
			            sizeof(fname),
			            "%.*s",
			            (int)filename_vec.len,
			            filename_vec.ptr);

			if (truncated
			    || !mg_fopen(conn, fname, MG_FOPEN_MODE_READ, &file)) {
				mg_cry_internal(conn,
				                "%s: cannot open %s: %s",
				                __func__,
				                fname,
				                strerror(errno));
			}
			break;
		}
	}

	if (!is_file_opened(&file.access)) {
		open_auth_file(conn, path, &file);
	}

	if (is_file_opened(&file.access)) {
		authorized = authorize(conn, &file, NULL);
		(void)mg_fclose(&file.access); /* ignore error on read only file */
	}

	return authorized;
}


/* Internal function. Assumes conn is valid */
static void
send_authorization_request(struct mg_connection *conn, const char *realm)
{
	char date[64];
	time_t curtime = time(NULL);
	uint64_t nonce = (uint64_t)(conn->phys_ctx->start_time);

	if (!realm) {
		realm = conn->dom_ctx->config[AUTHENTICATION_DOMAIN];
	}

	(void)pthread_mutex_lock(&conn->phys_ctx->nonce_mutex);
	nonce += conn->dom_ctx->nonce_count;
	++conn->dom_ctx->nonce_count;
	(void)pthread_mutex_unlock(&conn->phys_ctx->nonce_mutex);

	nonce ^= conn->dom_ctx->auth_nonce_mask;
	conn->status_code = 401;
	conn->must_close = 1;

	gmt_time_string(date, sizeof(date), &curtime);

	mg_printf(conn, "HTTP/1.1 401 Unauthorized\r\n");
	send_no_cache_header(conn);
	send_additional_header(conn);
	mg_printf(conn,
	          "Date: %s\r\n"
	          "Connection: %s\r\n"
	          "Content-Length: 0\r\n"
	          "WWW-Authenticate: Digest qop=\"auth\", realm=\"%s\", "
	          "nonce=\"%" UINT64_FMT "\"\r\n\r\n",
	          date,
	          suggest_connection_header(conn),
	          realm,
	          nonce);
}


/* Interface function. Parameters are provided by the user, so do
 * at least some basic checks.
 */
int
mg_send_digest_access_authentication_request(struct mg_connection *conn,
                                             const char *realm)
{
	if (conn && conn->dom_ctx) {
		send_authorization_request(conn, realm);
		return 0;
	}
	return -1;
}


#if !defined(NO_FILES)
static int
is_authorized_for_put(struct mg_connection *conn)
{
	if (conn) {
		struct mg_file file = STRUCT_FILE_INITIALIZER;
		const char *passfile = conn->dom_ctx->config[PUT_DELETE_PASSWORDS_FILE];
		int ret = 0;

		if (passfile != NULL
		    && mg_fopen(conn, passfile, MG_FOPEN_MODE_READ, &file)) {
			ret = authorize(conn, &file, NULL);
			(void)mg_fclose(&file.access); /* ignore error on read only file */
		}

		return ret;
	}
	return 0;
}
#endif


int
mg_modify_passwords_file(const char *fname,
                         const char *domain,
                         const char *user,
                         const char *pass)
{
	int found, i;
	char line[512], u[512] = "", d[512] = "", ha1[33], tmp[PATH_MAX + 8];
	FILE *fp, *fp2;

	found = 0;
	fp = fp2 = NULL;

	/* Regard empty password as no password - remove user record. */
	if ((pass != NULL) && (pass[0] == '\0')) {
		pass = NULL;
	}

	/* Other arguments must not be empty */
	if ((fname == NULL) || (domain == NULL) || (user == NULL)) {
		return 0;
	}

	/* Using the given file format, user name and domain must not contain
	 * ':'
	 */
	if (strchr(user, ':') != NULL) {
		return 0;
	}
	if (strchr(domain, ':') != NULL) {
		return 0;
	}

	/* Do not allow control characters like newline in user name and domain.
	 * Do not allow excessively long names either. */
	for (i = 0; ((i < 255) && (user[i] != 0)); i++) {
		if (iscntrl(user[i])) {
			return 0;
		}
	}
	if (user[i]) {
		return 0;
	}
	for (i = 0; ((i < 255) && (domain[i] != 0)); i++) {
		if (iscntrl(domain[i])) {
			return 0;
		}
	}
	if (domain[i]) {
		return 0;
	}

	/* The maximum length of the path to the password file is limited */
	if ((strlen(fname) + 4) >= PATH_MAX) {
		return 0;
	}

	/* Create a temporary file name. Length has been checked before. */
	strcpy(tmp, fname);
	strcat(tmp, ".tmp");

	/* Create the file if does not exist */
	/* Use of fopen here is OK, since fname is only ASCII */
	if ((fp = fopen(fname, "a+")) != NULL) {
		(void)fclose(fp);
	}

	/* Open the given file and temporary file */
	if ((fp = fopen(fname, "r")) == NULL) {
		return 0;
	} else if ((fp2 = fopen(tmp, "w+")) == NULL) {
		fclose(fp);
		return 0;
	}

	/* Copy the stuff to temporary file */
	while (fgets(line, sizeof(line), fp) != NULL) {
		if (sscanf(line, "%255[^:]:%255[^:]:%*s", u, d) != 2) {
			continue;
		}
		u[255] = 0;
		d[255] = 0;

		if (!strcmp(u, user) && !strcmp(d, domain)) {
			found++;
			if (pass != NULL) {
				mg_md5(ha1, user, ":", domain, ":", pass, NULL);
				fprintf(fp2, "%s:%s:%s\n", user, domain, ha1);
			}
		} else {
			fprintf(fp2, "%s", line);
		}
	}

	/* If new user, just add it */
	if (!found && (pass != NULL)) {
		mg_md5(ha1, user, ":", domain, ":", pass, NULL);
		fprintf(fp2, "%s:%s:%s\n", user, domain, ha1);
	}

	/* Close files */
	fclose(fp);
	fclose(fp2);

	/* Put the temp file in place of real file */
	IGNORE_UNUSED_RESULT(remove(fname));
	IGNORE_UNUSED_RESULT(rename(tmp, fname));

	return 1;
}


static int
is_valid_port(unsigned long port)
{
	return (port <= 0xffff);
}


static int
mg_inet_pton(int af, const char *src, void *dst, size_t dstlen)
{
	struct addrinfo hints, *res, *ressave;
	int func_ret = 0;
	int gai_ret;

	memset(&hints, 0, sizeof(struct addrinfo));
	hints.ai_family = af;

	gai_ret = getaddrinfo(src, NULL, &hints, &res);
	if (gai_ret != 0) {
		/* gai_strerror could be used to convert gai_ret to a string */
		/* POSIX return values: see
		 * http://pubs.opengroup.org/onlinepubs/9699919799/functions/freeaddrinfo.html
		 */
		/* Windows return values: see
		 * https://msdn.microsoft.com/en-us/library/windows/desktop/ms738520%28v=vs.85%29.aspx
		 */
		return 0;
	}

	ressave = res;

	while (res) {
		if (dstlen >= (size_t)res->ai_addrlen) {
			memcpy(dst, res->ai_addr, res->ai_addrlen);
			func_ret = 1;
		}
		res = res->ai_next;
	}

	freeaddrinfo(ressave);
	return func_ret;
}


static int
connect_socket(struct mg_context *ctx /* may be NULL */,
               const char *host,
               int port,
               int use_ssl,
               char *ebuf,
               size_t ebuf_len,
               SOCKET *sock /* output: socket, must not be NULL */,
               union usa *sa /* output: socket address, must not be NULL  */
)
{
	int ip_ver = 0;
	int conn_ret = -1;
	int ret;
	*sock = INVALID_SOCKET;
	memset(sa, 0, sizeof(*sa));

	if (ebuf_len > 0) {
		*ebuf = 0;
	}

	if (host == NULL) {
		mg_snprintf(NULL,
		            NULL, /* No truncation check for ebuf */
		            ebuf,
		            ebuf_len,
		            "%s",
		            "NULL host");
		return 0;
	}

	if ((port <= 0) || !is_valid_port((unsigned)port)) {
		mg_snprintf(NULL,
		            NULL, /* No truncation check for ebuf */
		            ebuf,
		            ebuf_len,
		            "%s",
		            "invalid port");
		return 0;
	}

#if !defined(NO_SSL)
#if !defined(NO_SSL_DL)
#if defined(OPENSSL_API_1_1)
	if (use_ssl && (TLS_client_method == NULL)) {
		mg_snprintf(NULL,
		            NULL, /* No truncation check for ebuf */
		            ebuf,
		            ebuf_len,
		            "%s",
		            "SSL is not initialized");
		return 0;
	}
#else
	if (use_ssl && (SSLv23_client_method == NULL)) {
		mg_snprintf(NULL,
		            NULL, /* No truncation check for ebuf */
		            ebuf,
		            ebuf_len,
		            "%s",
		            "SSL is not initialized");
		return 0;
	}

#endif /* OPENSSL_API_1_1 */
#else
	(void)use_ssl;
#endif /* NO_SSL_DL */
#else
	(void)use_ssl;
#endif /* !defined(NO_SSL) */

	if (mg_inet_pton(AF_INET, host, &sa->sin, sizeof(sa->sin))) {
		sa->sin.sin_family = AF_INET;
		sa->sin.sin_port = htons((uint16_t)port);
		ip_ver = 4;
#if defined(USE_IPV6)
	} else if (mg_inet_pton(AF_INET6, host, &sa->sin6, sizeof(sa->sin6))) {
		sa->sin6.sin6_family = AF_INET6;
		sa->sin6.sin6_port = htons((uint16_t)port);
		ip_ver = 6;
	} else if (host[0] == '[') {
		/* While getaddrinfo on Windows will work with [::1],
		 * getaddrinfo on Linux only works with ::1 (without []). */
		size_t l = strlen(host + 1);
		char *h = (l > 1) ? mg_strdup_ctx(host + 1, ctx) : NULL;
		if (h) {
			h[l - 1] = 0;
			if (mg_inet_pton(AF_INET6, h, &sa->sin6, sizeof(sa->sin6))) {
				sa->sin6.sin6_family = AF_INET6;
				sa->sin6.sin6_port = htons((uint16_t)port);
				ip_ver = 6;
			}
			mg_free(h);
		}
#endif
	}

	if (ip_ver == 0) {
		mg_snprintf(NULL,
		            NULL, /* No truncation check for ebuf */
		            ebuf,
		            ebuf_len,
		            "%s",
		            "host not found");
		return 0;
	}

	if (ip_ver == 4) {
		*sock = socket(PF_INET, SOCK_STREAM, 0);
	}
#if defined(USE_IPV6)
	else if (ip_ver == 6) {
		*sock = socket(PF_INET6, SOCK_STREAM, 0);
	}
#endif

	if (*sock == INVALID_SOCKET) {
		mg_snprintf(NULL,
		            NULL, /* No truncation check for ebuf */
		            ebuf,
		            ebuf_len,
		            "socket(): %s",
		            strerror(ERRNO));
		return 0;
	}

	if (0 != set_non_blocking_mode(*sock)) {
		mg_snprintf(NULL,
		            NULL, /* No truncation check for ebuf */
		            ebuf,
		            ebuf_len,
		            "Cannot set socket to non-blocking: %s",
		            strerror(ERRNO));
		closesocket(*sock);
		*sock = INVALID_SOCKET;
		return 0;
	}

	set_close_on_exec(*sock, fc(ctx));

	if (ip_ver == 4) {
		/* connected with IPv4 */
		conn_ret = connect(*sock,
		                   (struct sockaddr *)((void *)&sa->sin),
		                   sizeof(sa->sin));
	}
#if defined(USE_IPV6)
	else if (ip_ver == 6) {
		/* connected with IPv6 */
		conn_ret = connect(*sock,
		                   (struct sockaddr *)((void *)&sa->sin6),
		                   sizeof(sa->sin6));
	}
#endif

#if defined(_WIN32)
	if (conn_ret != 0) {
		DWORD err = WSAGetLastError(); /* could return WSAEWOULDBLOCK */
		conn_ret = (int)err;
#if !defined(EINPROGRESS)
#define EINPROGRESS (WSAEWOULDBLOCK) /* Winsock equivalent */
#endif                               /* if !defined(EINPROGRESS) */
	}
#endif

	if ((conn_ret != 0) && (conn_ret != EINPROGRESS)) {
		/* Data for getsockopt */
		int sockerr = -1;
		void *psockerr = &sockerr;

#if defined(_WIN32)
		int len = (int)sizeof(sockerr);
#else
		socklen_t len = (socklen_t)sizeof(sockerr);
#endif

		/* Data for poll */
		struct pollfd pfd[1];
		int pollres;
		int ms_wait = 10000; /* 10 second timeout */

		/* For a non-blocking socket, the connect sequence is:
		 * 1) call connect (will not block)
		 * 2) wait until the socket is ready for writing (select or poll)
		 * 3) check connection state with getsockopt
		 */
		pfd[0].fd = *sock;
		pfd[0].events = POLLOUT;
		pollres = mg_poll(pfd, 1, (int)(ms_wait), &(ctx->stop_flag));

		if (pollres != 1) {
			/* Not connected */
			mg_snprintf(NULL,
			            NULL, /* No truncation check for ebuf */
			            ebuf,
			            ebuf_len,
			            "connect(%s:%d): timeout",
			            host,
			            port);
			closesocket(*sock);
			*sock = INVALID_SOCKET;
			return 0;
		}

#if defined(_WIN32)
		ret = getsockopt(*sock, SOL_SOCKET, SO_ERROR, (char *)psockerr, &len);
#else
		ret = getsockopt(*sock, SOL_SOCKET, SO_ERROR, psockerr, &len);
#endif

		if ((ret != 0) || (sockerr != 0)) {
			/* Not connected */
			mg_snprintf(NULL,
			            NULL, /* No truncation check for ebuf */
			            ebuf,
			            ebuf_len,
			            "connect(%s:%d): error %s",
			            host,
			            port,
			            strerror(sockerr));
			closesocket(*sock);
			*sock = INVALID_SOCKET;
			return 0;
		}
	}

	return 1;
}


int
mg_url_encode(const char *src, char *dst, size_t dst_len)
{
	static const char *dont_escape = "._-$,;~()";
	static const char *hex = "0123456789abcdef";
	char *pos = dst;
	const char *end = dst + dst_len - 1;

	for (; ((*src != '\0') && (pos < end)); src++, pos++) {
		if (isalnum(*(const unsigned char *)src)
		    || (strchr(dont_escape, *(const unsigned char *)src) != NULL)) {
			*pos = *src;
		} else if (pos + 2 < end) {
			pos[0] = '%';
			pos[1] = hex[(*(const unsigned char *)src) >> 4];
			pos[2] = hex[(*(const unsigned char *)src) & 0xf];
			pos += 2;
		} else {
			break;
		}
	}

	*pos = '\0';
	return (*src == '\0') ? (int)(pos - dst) : -1;
}

/* Return 0 on success, non-zero if an error occurs. */

static int
print_dir_entry(struct de *de)
{
	size_t hrefsize;
	char *href;
	char size[64], mod[64];
#if defined(REENTRANT_TIME)
	struct tm _tm;
	struct tm *tm = &_tm;
#else
	struct tm *tm;
#endif

	hrefsize = PATH_MAX * 3; /* worst case */
	href = (char *)mg_malloc(hrefsize);
	if (href == NULL) {
		return -1;
	}
	if (de->file.is_directory) {
		mg_snprintf(de->conn,
		            NULL, /* Buffer is big enough */
		            size,
		            sizeof(size),
		            "%s",
		            "[DIRECTORY]");
	} else {
		/* We use (signed) cast below because MSVC 6 compiler cannot
		 * convert unsigned __int64 to double. Sigh. */
		if (de->file.size < 1024) {
			mg_snprintf(de->conn,
			            NULL, /* Buffer is big enough */
			            size,
			            sizeof(size),
			            "%d",
			            (int)de->file.size);
		} else if (de->file.size < 0x100000) {
			mg_snprintf(de->conn,
			            NULL, /* Buffer is big enough */
			            size,
			            sizeof(size),
			            "%.1fk",
			            (double)de->file.size / 1024.0);
		} else if (de->file.size < 0x40000000) {
			mg_snprintf(de->conn,
			            NULL, /* Buffer is big enough */
			            size,
			            sizeof(size),
			            "%.1fM",
			            (double)de->file.size / 1048576);
		} else {
			mg_snprintf(de->conn,
			            NULL, /* Buffer is big enough */
			            size,
			            sizeof(size),
			            "%.1fG",
			            (double)de->file.size / 1073741824);
		}
	}

	/* Note: mg_snprintf will not cause a buffer overflow above.
	 * So, string truncation checks are not required here. */

#if defined(REENTRANT_TIME)
	localtime_r(&de->file.last_modified, tm);
#else
	tm = localtime(&de->file.last_modified);
#endif
	if (tm != NULL) {
		strftime(mod, sizeof(mod), "%d-%b-%Y %H:%M", tm);
	} else {
		mg_strlcpy(mod, "01-Jan-1970 00:00", sizeof(mod));
		mod[sizeof(mod) - 1] = '\0';
	}
	mg_url_encode(de->file_name, href, hrefsize);
	mg_printf(de->conn,
	          "<tr><td><a href=\"%s%s%s\">%s%s</a></td>"
	          "<td>&nbsp;%s</td><td>&nbsp;&nbsp;%s</td></tr>\n",
	          de->conn->request_info.local_uri,
	          href,
	          de->file.is_directory ? "/" : "",
	          de->file_name,
	          de->file.is_directory ? "/" : "",
	          mod,
	          size);
	mg_free(href);
	return 0;
}


/* This function is called from send_directory() and used for
 * sorting directory entries by size, or name, or modification time.
 * On windows, __cdecl specification is needed in case if project is built
 * with __stdcall convention. qsort always requires __cdels callback. */
static int WINCDECL
compare_dir_entries(const void *p1, const void *p2)
{
	if (p1 && p2) {
		const struct de *a = (const struct de *)p1, *b = (const struct de *)p2;
		const char *query_string = a->conn->request_info.query_string;
		int cmp_result = 0;

		if (query_string == NULL) {
			query_string = "na";
		}

		if (a->file.is_directory && !b->file.is_directory) {
			return -1; /* Always put directories on top */
		} else if (!a->file.is_directory && b->file.is_directory) {
			return 1; /* Always put directories on top */
		} else if (*query_string == 'n') {
			cmp_result = strcmp(a->file_name, b->file_name);
		} else if (*query_string == 's') {
			cmp_result = (a->file.size == b->file.size)
			                 ? 0
			                 : ((a->file.size > b->file.size) ? 1 : -1);
		} else if (*query_string == 'd') {
			cmp_result =
			    (a->file.last_modified == b->file.last_modified)
			        ? 0
			        : ((a->file.last_modified > b->file.last_modified) ? 1
			                                                           : -1);
		}

		return (query_string[1] == 'd') ? -cmp_result : cmp_result;
	}
	return 0;
}


static int
must_hide_file(struct mg_connection *conn, const char *path)
{
	if (conn && conn->dom_ctx) {
		const char *pw_pattern = "**" PASSWORDS_FILE_NAME "$";
		const char *pattern = conn->dom_ctx->config[HIDE_FILES];
		return (match_prefix(pw_pattern, strlen(pw_pattern), path) > 0)
		       || ((pattern != NULL)
		           && (match_prefix(pattern, strlen(pattern), path) > 0));
	}
	return 0;
}


static int
scan_directory(struct mg_connection *conn,
               const char *dir,
               void *data,
               int (*cb)(struct de *, void *))
{
	char path[PATH_MAX];
	struct dirent *dp;
	DIR *dirp;
	struct de de;
	int truncated;

	if ((dirp = mg_opendir(conn, dir)) == NULL) {
		return 0;
	} else {
		de.conn = conn;

		while ((dp = mg_readdir(dirp)) != NULL) {
			/* Do not show current dir and hidden files */
			if (!strcmp(dp->d_name, ".") || !strcmp(dp->d_name, "..")
			    || must_hide_file(conn, dp->d_name)) {
				continue;
			}

			mg_snprintf(
			    conn, &truncated, path, sizeof(path), "%s/%s", dir, dp->d_name);

			/* If we don't memset stat structure to zero, mtime will have
			 * garbage and strftime() will segfault later on in
			 * print_dir_entry(). memset is required only if mg_stat()
			 * fails. For more details, see
			 * http://code.google.com/p/mongoose/issues/detail?id=79 */
			memset(&de.file, 0, sizeof(de.file));

			if (truncated) {
				/* If the path is not complete, skip processing. */
				continue;
			}

			if (!mg_stat(conn, path, &de.file)) {
				mg_cry_internal(conn,
				                "%s: mg_stat(%s) failed: %s",
				                __func__,
				                path,
				                strerror(ERRNO));
			}
			de.file_name = dp->d_name;
			cb(&de, data);
		}
		(void)mg_closedir(dirp);
	}
	return 1;
}


#if !defined(NO_FILES)
static int
remove_directory(struct mg_connection *conn, const char *dir)
{
	char path[PATH_MAX];
	struct dirent *dp;
	DIR *dirp;
	struct de de;
	int truncated;
	int ok = 1;

	if ((dirp = mg_opendir(conn, dir)) == NULL) {
		return 0;
	} else {
		de.conn = conn;

		while ((dp = mg_readdir(dirp)) != NULL) {
			/* Do not show current dir (but show hidden files as they will
			 * also be removed) */
			if (!strcmp(dp->d_name, ".") || !strcmp(dp->d_name, "..")) {
				continue;
			}

			mg_snprintf(
			    conn, &truncated, path, sizeof(path), "%s/%s", dir, dp->d_name);

			/* If we don't memset stat structure to zero, mtime will have
			 * garbage and strftime() will segfault later on in
			 * print_dir_entry(). memset is required only if mg_stat()
			 * fails. For more details, see
			 * http://code.google.com/p/mongoose/issues/detail?id=79 */
			memset(&de.file, 0, sizeof(de.file));

			if (truncated) {
				/* Do not delete anything shorter */
				ok = 0;
				continue;
			}

			if (!mg_stat(conn, path, &de.file)) {
				mg_cry_internal(conn,
				                "%s: mg_stat(%s) failed: %s",
				                __func__,
				                path,
				                strerror(ERRNO));
				ok = 0;
			}

			if (de.file.is_directory) {
				if (remove_directory(conn, path) == 0) {
					ok = 0;
				}
			} else {
				/* This will fail file is the file is in memory */
				if (mg_remove(conn, path) == 0) {
					ok = 0;
				}
			}
		}
		(void)mg_closedir(dirp);

		IGNORE_UNUSED_RESULT(rmdir(dir));
	}

	return ok;
}
#endif


struct dir_scan_data {
	struct de *entries;
	unsigned int num_entries;
	unsigned int arr_size;
};


/* Behaves like realloc(), but frees original pointer on failure */
static void *
realloc2(void *ptr, size_t size)
{
	void *new_ptr = mg_realloc(ptr, size);
	if (new_ptr == NULL) {
		mg_free(ptr);
	}
	return new_ptr;
}


static int
dir_scan_callback(struct de *de, void *data)
{
	struct dir_scan_data *dsd = (struct dir_scan_data *)data;

	if ((dsd->entries == NULL) || (dsd->num_entries >= dsd->arr_size)) {
		dsd->arr_size *= 2;
		dsd->entries =
		    (struct de *)realloc2(dsd->entries,
		                          dsd->arr_size * sizeof(dsd->entries[0]));
	}
	if (dsd->entries == NULL) {
		/* TODO(lsm, low): propagate an error to the caller */
		dsd->num_entries = 0;
	} else {
		dsd->entries[dsd->num_entries].file_name = mg_strdup(de->file_name);
		dsd->entries[dsd->num_entries].file = de->file;
		dsd->entries[dsd->num_entries].conn = de->conn;
		dsd->num_entries++;
	}

	return 0;
}


static void
handle_directory_request(struct mg_connection *conn, const char *dir)
{
	unsigned int i;
	int sort_direction;
	struct dir_scan_data data = {NULL, 0, 128};
	char date[64];
	time_t curtime = time(NULL);

	if (!scan_directory(conn, dir, &data, dir_scan_callback)) {
		mg_send_http_error(conn,
		                   500,
		                   "Error: Cannot open directory\nopendir(%s): %s",
		                   dir,
		                   strerror(ERRNO));
		return;
	}

	gmt_time_string(date, sizeof(date), &curtime);

	if (!conn) {
		return;
	}

	sort_direction = ((conn->request_info.query_string != NULL)
	                  && (conn->request_info.query_string[1] == 'd'))
	                     ? 'a'
	                     : 'd';

	conn->must_close = 1;
	mg_printf(conn, "HTTP/1.1 200 OK\r\n");
	send_static_cache_header(conn);
	send_additional_header(conn);
	mg_printf(conn,
	          "Date: %s\r\n"
	          "Connection: close\r\n"
	          "Content-Type: text/html; charset=utf-8\r\n\r\n",
	          date);
	mg_printf(conn,
	          "<html><head><title>Index of %s</title>"
	          "<style>th {text-align: left;}</style></head>"
	          "<body><h1>Index of %s</h1><pre><table cellpadding=\"0\">"
	          "<tr><th><a href=\"?n%c\">Name</a></th>"
	          "<th><a href=\"?d%c\">Modified</a></th>"
	          "<th><a href=\"?s%c\">Size</a></th></tr>"
	          "<tr><td colspan=\"3\"><hr></td></tr>",
	          conn->request_info.local_uri,
	          conn->request_info.local_uri,
	          sort_direction,
	          sort_direction,
	          sort_direction);

	/* Print first entry - link to a parent directory */
	mg_printf(conn,
	          "<tr><td><a href=\"%s%s\">%s</a></td>"
	          "<td>&nbsp;%s</td><td>&nbsp;&nbsp;%s</td></tr>\n",
	          conn->request_info.local_uri,
	          "..",
	          "Parent directory",
	          "-",
	          "-");

	/* Sort and print directory entries */
	if (data.entries != NULL) {
		qsort(data.entries,
		      (size_t)data.num_entries,
		      sizeof(data.entries[0]),
		      compare_dir_entries);
		for (i = 0; i < data.num_entries; i++) {
			print_dir_entry(&data.entries[i]);
			mg_free(data.entries[i].file_name);
		}
		mg_free(data.entries);
	}

	mg_printf(conn, "%s", "</table></body></html>");
	conn->status_code = 200;
}


/* Send len bytes from the opened file to the client. */
static void
send_file_data(struct mg_connection *conn,
               struct mg_file *filep,
               int64_t offset,
               int64_t len)
{
	char buf[MG_BUF_LEN];
	int to_read, num_read, num_written;
	int64_t size;

	if (!filep || !conn) {
		return;
	}

	/* Sanity check the offset */
	size = (filep->stat.size > INT64_MAX) ? INT64_MAX
	                                      : (int64_t)(filep->stat.size);
	offset = (offset < 0) ? 0 : ((offset > size) ? size : offset);

#if defined(MG_USE_OPEN_FILE)
	if ((len > 0) && (filep->access.membuf != NULL) && (size > 0)) {
		/* file stored in memory */
		if (len > size - offset) {
			len = size - offset;
		}
		mg_write(conn, filep->access.membuf + offset, (size_t)len);
	} else /* else block below */
#endif
	    if (len > 0 && filep->access.fp != NULL) {
/* file stored on disk */
#if defined(__linux__)
		/* sendfile is only available for Linux */
		if ((conn->ssl == 0) && (conn->throttle == 0)
		    && (!mg_strcasecmp(conn->dom_ctx->config[ALLOW_SENDFILE_CALL],
		                       "yes"))) {
			off_t sf_offs = (off_t)offset;
			ssize_t sf_sent;
			int sf_file = fileno(filep->access.fp);
			int loop_cnt = 0;

			do {
				/* 2147479552 (0x7FFFF000) is a limit found by experiment on
				 * 64 bit Linux (2^31 minus one memory page of 4k?). */
				size_t sf_tosend =
				    (size_t)((len < 0x7FFFF000) ? len : 0x7FFFF000);
				sf_sent =
				    sendfile(conn->client.sock, sf_file, &sf_offs, sf_tosend);
				if (sf_sent > 0) {
					len -= sf_sent;
					offset += sf_sent;
				} else if (loop_cnt == 0) {
					/* This file can not be sent using sendfile.
					 * This might be the case for pseudo-files in the
					 * /sys/ and /proc/ file system.
					 * Use the regular user mode copy code instead. */
					break;
				} else if (sf_sent == 0) {
					/* No error, but 0 bytes sent. May be EOF? */
					return;
				}
				loop_cnt++;

			} while ((len > 0) && (sf_sent >= 0));

			if (sf_sent > 0) {
				return; /* OK */
			}

			/* sf_sent<0 means error, thus fall back to the classic way */
			/* This is always the case, if sf_file is not a "normal" file,
			 * e.g., for sending data from the output of a CGI process. */
			offset = (int64_t)sf_offs;
		}
#endif
		if ((offset > 0) && (fseeko(filep->access.fp, offset, SEEK_SET) != 0)) {
			mg_cry_internal(conn,
			                "%s: fseeko() failed: %s",
			                __func__,
			                strerror(ERRNO));
			mg_send_http_error(
			    conn,
			    500,
			    "%s",
			    "Error: Unable to access file at requested position.");
		} else {
			while (len > 0) {
				/* Calculate how much to read from the file in the buffer */
				to_read = sizeof(buf);
				if ((int64_t)to_read > len) {
					to_read = (int)len;
				}

				/* Read from file, exit the loop on error */
				if ((num_read =
				         (int)fread(buf, 1, (size_t)to_read, filep->access.fp))
				    <= 0) {
					break;
				}

				/* Send read bytes to the client, exit the loop on error */
				if ((num_written = mg_write(conn, buf, (size_t)num_read))
				    != num_read) {
					break;
				}

				/* Both read and were successful, adjust counters */
				len -= num_written;
			}
		}
	}
}


static int
parse_range_header(const char *header, int64_t *a, int64_t *b)
{
	return sscanf(header, "bytes=%" INT64_FMT "-%" INT64_FMT, a, b);
}


static void
construct_etag(char *buf, size_t buf_len, const struct mg_file_stat *filestat)
{
	if ((filestat != NULL) && (buf != NULL)) {
		mg_snprintf(NULL,
		            NULL, /* All calls to construct_etag use 64 byte buffer */
		            buf,
		            buf_len,
		            "\"%lx.%" INT64_FMT "\"",
		            (unsigned long)filestat->last_modified,
		            filestat->size);
	}
}


static void
fclose_on_exec(struct mg_file_access *filep, struct mg_connection *conn)
{
	if (filep != NULL && filep->fp != NULL) {
#if defined(_WIN32)
		(void)conn; /* Unused. */
#else
		if (fcntl(fileno(filep->fp), F_SETFD, FD_CLOEXEC) != 0) {
			mg_cry_internal(conn,
			                "%s: fcntl(F_SETFD FD_CLOEXEC) failed: %s",
			                __func__,
			                strerror(ERRNO));
		}
#endif
	}
}


#if defined(USE_ZLIB)
#include "mod_zlib.inl"
#endif


static void
handle_static_file_request(struct mg_connection *conn,
                           const char *path,
                           struct mg_file *filep,
                           const char *mime_type,
                           const char *additional_headers)
{
	char date[64], lm[64], etag[64];
	char range[128]; /* large enough, so there will be no overflow */
	const char *msg = "OK", *hdr;
	time_t curtime = time(NULL);
	int64_t cl, r1, r2;
	struct vec mime_vec;
	int n, truncated;
	char gz_path[PATH_MAX];
	const char *encoding = "";
	const char *cors1, *cors2, *cors3;
	int is_head_request;

#if defined(USE_ZLIB)
	/* Compression is allowed, unless there is a reason not to use compression.
	 * If the file is already compressed, too small or a "range" request was
	 * made, on the fly compression is not possible. */
	int allow_on_the_fly_compression = 1;
#endif

	if ((conn == NULL) || (conn->dom_ctx == NULL) || (filep == NULL)) {
		return;
	}

	is_head_request = !strcmp(conn->request_info.request_method, "HEAD");

	if (mime_type == NULL) {
		get_mime_type(conn, path, &mime_vec);
	} else {
		mime_vec.ptr = mime_type;
		mime_vec.len = strlen(mime_type);
	}
	if (filep->stat.size > INT64_MAX) {
		mg_send_http_error(conn,
		                   500,
		                   "Error: File size is too large to send\n%" INT64_FMT,
		                   filep->stat.size);
		return;
	}
	cl = (int64_t)filep->stat.size;
	conn->status_code = 200;
	range[0] = '\0';

#if defined(USE_ZLIB)
	/* if this file is in fact a pre-gzipped file, rewrite its filename
	 * it's important to rewrite the filename after resolving
	 * the mime type from it, to preserve the actual file's type */
	if (!conn->accept_gzip) {
		allow_on_the_fly_compression = 0;
	}
#endif

	if (filep->stat.is_gzipped) {
		mg_snprintf(conn, &truncated, gz_path, sizeof(gz_path), "%s.gz", path);

		if (truncated) {
			mg_send_http_error(conn,
			                   500,
			                   "Error: Path of zipped file too long (%s)",
			                   path);
			return;
		}

		path = gz_path;
		encoding = "Content-Encoding: gzip\r\n";

#if defined(USE_ZLIB)
		/* File is already compressed. No "on the fly" compression. */
		allow_on_the_fly_compression = 0;
#endif
	}

	if (!mg_fopen(conn, path, MG_FOPEN_MODE_READ, filep)) {
		mg_send_http_error(conn,
		                   500,
		                   "Error: Cannot open file\nfopen(%s): %s",
		                   path,
		                   strerror(ERRNO));
		return;
	}

	fclose_on_exec(&filep->access, conn);

	/* If "Range" request was made: parse header, send only selected part
	 * of the file. */
	r1 = r2 = 0;
	hdr = mg_get_header(conn, "Range");
	if ((hdr != NULL) && ((n = parse_range_header(hdr, &r1, &r2)) > 0)
	    && (r1 >= 0) && (r2 >= 0)) {
		/* actually, range requests don't play well with a pre-gzipped
		 * file (since the range is specified in the uncompressed space) */
		if (filep->stat.is_gzipped) {
			mg_send_http_error(
			    conn,
			    416, /* 416 = Range Not Satisfiable */
			    "%s",
			    "Error: Range requests in gzipped files are not supported");
			(void)mg_fclose(
			    &filep->access); /* ignore error on read only file */
			return;
		}
		conn->status_code = 206;
		cl = (n == 2) ? (((r2 > cl) ? cl : r2) - r1 + 1) : (cl - r1);
		mg_snprintf(conn,
		            NULL, /* range buffer is big enough */
		            range,
		            sizeof(range),
		            "Content-Range: bytes "
		            "%" INT64_FMT "-%" INT64_FMT "/%" INT64_FMT "\r\n",
		            r1,
		            r1 + cl - 1,
		            filep->stat.size);
		msg = "Partial Content";

#if defined(USE_ZLIB)
		/* Do not compress ranges. */
		allow_on_the_fly_compression = 0;
#endif
	}

/* Do not compress small files. Small files do not benefit from file
 * compression, but there is still some overhead. */
#if defined(USE_ZLIB)
	if (filep->stat.size < MG_FILE_COMPRESSION_SIZE_LIMIT) {
		/* File is below the size limit. */
		allow_on_the_fly_compression = 0;
	}
#endif

	/* Standard CORS header */
	hdr = mg_get_header(conn, "Origin");
	if (hdr) {
		/* Cross-origin resource sharing (CORS), see
		 * http://www.html5rocks.com/en/tutorials/cors/,
		 * http://www.html5rocks.com/static/images/cors_server_flowchart.png
		 * -
		 * preflight is not supported for files. */
		cors1 = "Access-Control-Allow-Origin: ";
		cors2 = conn->dom_ctx->config[ACCESS_CONTROL_ALLOW_ORIGIN];
		cors3 = "\r\n";
	} else {
		cors1 = cors2 = cors3 = "";
	}

	/* Prepare Etag, Date, Last-Modified headers. Must be in UTC,
	 * according to
	 * http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3 */
	gmt_time_string(date, sizeof(date), &curtime);
	gmt_time_string(lm, sizeof(lm), &filep->stat.last_modified);
	construct_etag(etag, sizeof(etag), &filep->stat);

	/* Send header */
	(void)mg_printf(conn,
	                "HTTP/1.1 %d %s\r\n"
	                "%s%s%s" /* CORS */
	                "Date: %s\r\n"
	                "Last-Modified: %s\r\n"
	                "Etag: %s\r\n"
	                "Content-Type: %.*s\r\n"
	                "Connection: %s\r\n",
	                conn->status_code,
	                msg,
	                cors1,
	                cors2,
	                cors3,
	                date,
	                lm,
	                etag,
	                (int)mime_vec.len,
	                mime_vec.ptr,
	                suggest_connection_header(conn));
	send_static_cache_header(conn);
	send_additional_header(conn);

#if defined(USE_ZLIB)
	/* On the fly compression allowed */
	if (allow_on_the_fly_compression) {
		/* For on the fly compression, we don't know the content size in
		 * advance, so we have to use chunked encoding */
		(void)mg_printf(conn,
		                "Content-Encoding: gzip\r\n"
		                "Transfer-Encoding: chunked\r\n");
	} else
#endif
	{
		/* Without on-the-fly compression, we know the content-length
		 * and we can use ranges (with on-the-fly compression we cannot).
		 * So we send these response headers only in this case. */
		(void)mg_printf(conn,
		                "Content-Length: %" INT64_FMT "\r\n"
		                "Accept-Ranges: bytes\r\n"
		                "%s" /* range */
		                "%s" /* encoding */,
		                cl,
		                range,
		                encoding);
	}

	/* The previous code must not add any header starting with X- to make
	 * sure no one of the additional_headers is included twice */
	if (additional_headers != NULL) {
		(void)mg_printf(conn,
		                "%.*s\r\n\r\n",
		                (int)strlen(additional_headers),
		                additional_headers);
	} else {
		(void)mg_printf(conn, "\r\n");
	}

	if (!is_head_request) {
#if defined(USE_ZLIB)
		if (allow_on_the_fly_compression) {
			/* Compress and send */
			send_compressed_data(conn, filep);
		} else
#endif
		{
			/* Send file directly */
			send_file_data(conn, filep, r1, cl);
		}
	}
	(void)mg_fclose(&filep->access); /* ignore error on read only file */
}


int
mg_send_file_body(struct mg_connection *conn, const char *path)
{
	struct mg_file file = STRUCT_FILE_INITIALIZER;
	if (!mg_fopen(conn, path, MG_FOPEN_MODE_READ, &file)) {
		return -1;
	}
	fclose_on_exec(&file.access, conn);
	send_file_data(conn, &file, 0, INT64_MAX);
	(void)mg_fclose(&file.access); /* Ignore errors for readonly files */
	return 0;                      /* >= 0 for OK */
}


#if !defined(NO_CACHING)
/* Return True if we should reply 304 Not Modified. */
static int
is_not_modified(const struct mg_connection *conn,
                const struct mg_file_stat *filestat)
{
	char etag[64];
	const char *ims = mg_get_header(conn, "If-Modified-Since");
	const char *inm = mg_get_header(conn, "If-None-Match");
	construct_etag(etag, sizeof(etag), filestat);

	return ((inm != NULL) && !mg_strcasecmp(etag, inm))
	       || ((ims != NULL)
	           && (filestat->last_modified <= parse_date_string(ims)));
}

static void
handle_not_modified_static_file_request(struct mg_connection *conn,
                                        struct mg_file *filep)
{
	char date[64], lm[64], etag[64];
	time_t curtime = time(NULL);

	if ((conn == NULL) || (filep == NULL)) {
		return;
	}
	conn->status_code = 304;
	gmt_time_string(date, sizeof(date), &curtime);
	gmt_time_string(lm, sizeof(lm), &filep->stat.last_modified);
	construct_etag(etag, sizeof(etag), &filep->stat);

	(void)mg_printf(conn,
	                "HTTP/1.1 %d %s\r\n"
	                "Date: %s\r\n",
	                conn->status_code,
	                mg_get_response_code_text(conn, conn->status_code),
	                date);
	send_static_cache_header(conn);
	send_additional_header(conn);
	(void)mg_printf(conn,
	                "Last-Modified: %s\r\n"
	                "Etag: %s\r\n"
	                "Connection: %s\r\n"
	                "\r\n",
	                lm,
	                etag,
	                suggest_connection_header(conn));
}
#endif


void
mg_send_file(struct mg_connection *conn, const char *path)
{
	mg_send_mime_file2(conn, path, NULL, NULL);
}


void
mg_send_mime_file(struct mg_connection *conn,
                  const char *path,
                  const char *mime_type)
{
	mg_send_mime_file2(conn, path, mime_type, NULL);
}


void
mg_send_mime_file2(struct mg_connection *conn,
                   const char *path,
                   const char *mime_type,
                   const char *additional_headers)
{
	struct mg_file file = STRUCT_FILE_INITIALIZER;

	if (!conn) {
		/* No conn */
		return;
	}

	if (mg_stat(conn, path, &file.stat)) {
#if !defined(NO_CACHING)
		if (is_not_modified(conn, &file.stat)) {
			/* Send 304 "Not Modified" - this must not send any body data */
			handle_not_modified_static_file_request(conn, &file);
		} else
#endif /* NO_CACHING */
		    if (file.stat.is_directory) {
			if (!mg_strcasecmp(conn->dom_ctx->config[ENABLE_DIRECTORY_LISTING],
			                   "yes")) {
				handle_directory_request(conn, path);
			} else {
				mg_send_http_error(conn,
				                   403,
				                   "%s",
				                   "Error: Directory listing denied");
			}
		} else {
			handle_static_file_request(
			    conn, path, &file, mime_type, additional_headers);
		}
	} else {
		mg_send_http_error(conn, 404, "%s", "Error: File not found");
	}
}


/* For a given PUT path, create all intermediate subdirectories.
 * Return  0  if the path itself is a directory.
 * Return  1  if the path leads to a file.
 * Return -1  for if the path is too long.
 * Return -2  if path can not be created.
 */
static int
put_dir(struct mg_connection *conn, const char *path)
{
	char buf[PATH_MAX];
	const char *s, *p;
	struct mg_file file = STRUCT_FILE_INITIALIZER;
	size_t len;
	int res = 1;

	for (s = p = path + 2; (p = strchr(s, '/')) != NULL; s = ++p) {
		len = (size_t)(p - path);
		if (len >= sizeof(buf)) {
			/* path too long */
			res = -1;
			break;
		}
		memcpy(buf, path, len);
		buf[len] = '\0';

		/* Try to create intermediate directory */
		DEBUG_TRACE("mkdir(%s)", buf);
		if (!mg_stat(conn, buf, &file.stat) && mg_mkdir(conn, buf, 0755) != 0) {
			/* path does not exixt and can not be created */
			res = -2;
			break;
		}

		/* Is path itself a directory? */
		if (p[1] == '\0') {
			res = 0;
		}
	}

	return res;
}


static void
remove_bad_file(const struct mg_connection *conn, const char *path)
{
	int r = mg_remove(conn, path);
	if (r != 0) {
		mg_cry_internal(conn,
		                "%s: Cannot remove invalid file %s",
		                __func__,
		                path);
	}
}


long long
mg_store_body(struct mg_connection *conn, const char *path)
{
	char buf[MG_BUF_LEN];
	long long len = 0;
	int ret, n;
	struct mg_file fi;

	if (conn->consumed_content != 0) {
		mg_cry_internal(conn, "%s: Contents already consumed", __func__);
		return -11;
	}

	ret = put_dir(conn, path);
	if (ret < 0) {
		/* -1 for path too long,
		 * -2 for path can not be created. */
		return ret;
	}
	if (ret != 1) {
		/* Return 0 means, path itself is a directory. */
		return 0;
	}

	if (mg_fopen(conn, path, MG_FOPEN_MODE_WRITE, &fi) == 0) {
		return -12;
	}

	ret = mg_read(conn, buf, sizeof(buf));
	while (ret > 0) {
		n = (int)fwrite(buf, 1, (size_t)ret, fi.access.fp);
		if (n != ret) {
			(void)mg_fclose(
			    &fi.access); /* File is bad and will be removed anyway. */
			remove_bad_file(conn, path);
			return -13;
		}
		len += ret;
		ret = mg_read(conn, buf, sizeof(buf));
	}

	/* File is open for writing. If fclose fails, there was probably an
	 * error flushing the buffer to disk, so the file on disk might be
	 * broken. Delete it and return an error to the caller. */
	if (mg_fclose(&fi.access) != 0) {
		remove_bad_file(conn, path);
		return -14;
	}

	return len;
}


/* Parse a buffer:
 * Forward the string pointer till the end of a word, then
 * terminate it and forward till the begin of the next word.
 */
static int
skip_to_end_of_word_and_terminate(char **ppw, int eol)
{
	/* Forward until a space is found - use isgraph here */
	/* See http://www.cplusplus.com/reference/cctype/ */
	while (isgraph(**ppw)) {
		(*ppw)++;
	}

	/* Check end of word */
	if (eol) {
		/* must be a end of line */
		if ((**ppw != '\r') && (**ppw != '\n')) {
			return -1;
		}
	} else {
		/* must be a end of a word, but not a line */
		if (**ppw != ' ') {
			return -1;
		}
	}

	/* Terminate and forward to the next word */
	do {
		**ppw = 0;
		(*ppw)++;
	} while ((**ppw) && isspace(**ppw));

	/* Check after term */
	if (!eol) {
		/* if it's not the end of line, there must be a next word */
		if (!isgraph(**ppw)) {
			return -1;
		}
	}

	/* ok */
	return 1;
}


/* Parse HTTP headers from the given buffer, advance buf pointer
 * to the point where parsing stopped.
 * All parameters must be valid pointers (not NULL).
 * Return <0 on error. */
static int
parse_http_headers(char **buf, struct mg_header hdr[MG_MAX_HEADERS])
{
	int i;
	int num_headers = 0;

	for (i = 0; i < (int)MG_MAX_HEADERS; i++) {
		char *dp = *buf;
		while ((*dp != ':') && (*dp >= 33) && (*dp <= 126)) {
			dp++;
		}
		if (dp == *buf) {
			/* End of headers reached. */
			break;
		}
		if (*dp != ':') {
			/* This is not a valid field. */
			return -1;
		}

		/* End of header key (*dp == ':') */
		/* Truncate here and set the key name */
		*dp = 0;
		hdr[i].name = *buf;
		do {
			dp++;
		} while (*dp == ' ');

		/* The rest of the line is the value */
		hdr[i].value = dp;
		*buf = dp + strcspn(dp, "\r\n");
		if (((*buf)[0] != '\r') || ((*buf)[1] != '\n')) {
			*buf = NULL;
		}

		num_headers = i + 1;
		if (*buf) {
			(*buf)[0] = 0;
			(*buf)[1] = 0;
			*buf += 2;
		} else {
			*buf = dp;
			break;
		}

		if ((*buf)[0] == '\r') {
			/* This is the end of the header */
			break;
		}
	}
	return num_headers;
}


struct mg_http_method_info {
	const char *name;
	int request_has_body;
	int response_has_body;
	int is_safe;
	int is_idempotent;
	int is_cacheable;
};


/* https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods */
static struct mg_http_method_info http_methods[] = {
    /* HTTP (RFC 2616) */
    {"GET", 0, 1, 1, 1, 1},
    {"POST", 1, 1, 0, 0, 0},
    {"PUT", 1, 0, 0, 1, 0},
    {"DELETE", 0, 0, 0, 1, 0},
    {"HEAD", 0, 0, 1, 1, 1},
    {"OPTIONS", 0, 0, 1, 1, 0},
    {"CONNECT", 1, 1, 0, 0, 0},
    /* TRACE method (RFC 2616) is not supported for security reasons */

    /* PATCH method (RFC 5789) */
    {"PATCH", 1, 0, 0, 0, 0},
    /* PATCH method only allowed for CGI/Lua/LSP and callbacks. */

    /* WEBDAV (RFC 2518) */
    {"PROPFIND", 0, 1, 1, 1, 0},
    /* http://www.webdav.org/specs/rfc4918.html, 9.1:
     * Some PROPFIND results MAY be cached, with care,
     * as there is no cache validation mechanism for
     * most properties. This method is both safe and
     * idempotent (see Section 9.1 of [RFC2616]). */
    {"MKCOL", 0, 0, 0, 1, 0},
    /* http://www.webdav.org/specs/rfc4918.html, 9.1:
     * When MKCOL is invoked without a request body,
     * the newly created collection SHOULD have no
     * members. A MKCOL request message may contain
     * a message body. The precise behavior of a MKCOL
     * request when the body is present is undefined,
     * ... ==> We do not support MKCOL with body data.
     * This method is idempotent, but not safe (see
     * Section 9.1 of [RFC2616]). Responses to this
     * method MUST NOT be cached. */

    /* Unsupported WEBDAV Methods: */
    /* PROPPATCH, COPY, MOVE, LOCK, UNLOCK (RFC 2518) */
    /* + 11 methods from RFC 3253 */
    /* ORDERPATCH (RFC 3648) */
    /* ACL (RFC 3744) */
    /* SEARCH (RFC 5323) */
    /* + MicroSoft extensions
     * https://msdn.microsoft.com/en-us/library/aa142917.aspx */

    /* REPORT method (RFC 3253) */
    {"REPORT", 1, 1, 1, 1, 1},
    /* REPORT method only allowed for CGI/Lua/LSP and callbacks. */
    /* It was defined for WEBDAV in RFC 3253, Sec. 3.6
     * (https://tools.ietf.org/html/rfc3253#section-3.6), but seems
     * to be useful for REST in case a "GET request with body" is
     * required. */

    {NULL, 0, 0, 0, 0, 0}
    /* end of list */
};


static const struct mg_http_method_info *
get_http_method_info(const char *method)
{
	/* Check if the method is known to the server. The list of all known
	 * HTTP methods can be found here at
	 * http://www.iana.org/assignments/http-methods/http-methods.xhtml
	 */
	const struct mg_http_method_info *m = http_methods;

	while (m->name) {
		if (!strcmp(m->name, method)) {
			return m;
		}
		m++;
	}
	return NULL;
}


static int
is_valid_http_method(const char *method)
{
	return (get_http_method_info(method) != NULL);
}


/* Parse HTTP request, fill in mg_request_info structure.
 * This function modifies the buffer by NUL-terminating
 * HTTP request components, header names and header values.
 * Parameters:
 *   buf (in/out): pointer to the HTTP header to parse and split
 *   len (in): length of HTTP header buffer
 *   re (out): parsed header as mg_request_info
 * buf and ri must be valid pointers (not NULL), len>0.
 * Returns <0 on error. */
static int
parse_http_request(char *buf, int len, struct mg_request_info *ri)
{
	int request_length;
	int init_skip = 0;

	/* Reset attributes. DO NOT TOUCH is_ssl, remote_addr,
	 * remote_port */
	ri->remote_user = ri->request_method = ri->request_uri = ri->http_version =
	    NULL;
	ri->num_headers = 0;

	/* RFC says that all initial whitespaces should be ingored */
	/* This included all leading \r and \n (isspace) */
	/* See table: http://www.cplusplus.com/reference/cctype/ */
	while ((len > 0) && isspace(*(unsigned char *)buf)) {
		buf++;
		len--;
		init_skip++;
	}

	if (len == 0) {
		/* Incomplete request */
		return 0;
	}

	/* Control characters are not allowed, including zero */
	if (iscntrl(*(unsigned char *)buf)) {
		return -1;
	}

	/* Find end of HTTP header */
	request_length = get_http_header_len(buf, len);
	if (request_length <= 0) {
		return request_length;
	}
	buf[request_length - 1] = '\0';

	if ((*buf == 0) || (*buf == '\r') || (*buf == '\n')) {
		return -1;
	}

	/* The first word has to be the HTTP method */
	ri->request_method = buf;

	if (skip_to_end_of_word_and_terminate(&buf, 0) <= 0) {
		return -1;
	}

	/* Check for a valid http method */
	if (!is_valid_http_method(ri->request_method)) {
		return -1;
	}

	/* The second word is the URI */
	ri->request_uri = buf;

	if (skip_to_end_of_word_and_terminate(&buf, 0) <= 0) {
		return -1;
	}

	/* Next would be the HTTP version */
	ri->http_version = buf;

	if (skip_to_end_of_word_and_terminate(&buf, 1) <= 0) {
		return -1;
	}

	/* Check for a valid HTTP version key */
	if (strncmp(ri->http_version, "HTTP/", 5) != 0) {
		/* Invalid request */
		return -1;
	}
	ri->http_version += 5;


	/* Parse all HTTP headers */
	ri->num_headers = parse_http_headers(&buf, ri->http_headers);
	if (ri->num_headers < 0) {
		/* Error while parsing headers */
		return -1;
	}

	return request_length + init_skip;
}


static int
parse_http_response(char *buf, int len, struct mg_response_info *ri)
{
	int response_length;
	int init_skip = 0;
	char *tmp, *tmp2;
	long l;

	/* Initialize elements. */
	ri->http_version = ri->status_text = NULL;
	ri->num_headers = ri->status_code = 0;

	/* RFC says that all initial whitespaces should be ingored */
	/* This included all leading \r and \n (isspace) */
	/* See table: http://www.cplusplus.com/reference/cctype/ */
	while ((len > 0) && isspace(*(unsigned char *)buf)) {
		buf++;
		len--;
		init_skip++;
	}

	if (len == 0) {
		/* Incomplete request */
		return 0;
	}

	/* Control characters are not allowed, including zero */
	if (iscntrl(*(unsigned char *)buf)) {
		return -1;
	}

	/* Find end of HTTP header */
	response_length = get_http_header_len(buf, len);
	if (response_length <= 0) {
		return response_length;
	}
	buf[response_length - 1] = '\0';

	if ((*buf == 0) || (*buf == '\r') || (*buf == '\n')) {
		return -1;
	}

	/* The first word is the HTTP version */
	/* Check for a valid HTTP version key */
	if (strncmp(buf, "HTTP/", 5) != 0) {
		/* Invalid request */
		return -1;
	}
	buf += 5;
	if (!isgraph(buf[0])) {
		/* Invalid request */
		return -1;
	}
	ri->http_version = buf;

	if (skip_to_end_of_word_and_terminate(&buf, 0) <= 0) {
		return -1;
	}

	/* The second word is the status as a number */
	tmp = buf;

	if (skip_to_end_of_word_and_terminate(&buf, 0) <= 0) {
		return -1;
	}

	l = strtol(tmp, &tmp2, 10);
	if ((l < 100) || (l >= 1000) || ((tmp2 - tmp) != 3) || (*tmp2 != 0)) {
		/* Everything else but a 3 digit code is invalid */
		return -1;
	}
	ri->status_code = (int)l;

	/* The rest of the line is the status text */
	ri->status_text = buf;

	/* Find end of status text */
	/* isgraph or isspace = isprint */
	while (isprint(*buf)) {
		buf++;
	}
	if ((*buf != '\r') && (*buf != '\n')) {
		return -1;
	}
	/* Terminate string and forward buf to next line */
	do {
		*buf = 0;
		buf++;
	} while ((*buf) && isspace(*buf));


	/* Parse all HTTP headers */
	ri->num_headers = parse_http_headers(&buf, ri->http_headers);
	if (ri->num_headers < 0) {
		/* Error while parsing headers */
		return -1;
	}

	return response_length + init_skip;
}


/* Keep reading the input (either opened file descriptor fd, or socket sock,
 * or SSL descriptor ssl) into buffer buf, until \r\n\r\n appears in the
 * buffer (which marks the end of HTTP request). Buffer buf may already
 * have some data. The length of the data is stored in nread.
 * Upon every read operation, increase nread by the number of bytes read. */
static int
read_message(FILE *fp,
             struct mg_connection *conn,
             char *buf,
             int bufsiz,
             int *nread)
{
	int request_len, n = 0;
	struct timespec last_action_time;
	double request_timeout;

	if (!conn) {
		return 0;
	}

	memset(&last_action_time, 0, sizeof(last_action_time));

	if (conn->dom_ctx->config[REQUEST_TIMEOUT]) {
		/* value of request_timeout is in seconds, config in milliseconds */
		request_timeout = atof(conn->dom_ctx->config[REQUEST_TIMEOUT]) / 1000.0;
	} else {
		request_timeout = -1.0;
	}
	if (conn->handled_requests > 0) {
		if (conn->dom_ctx->config[KEEP_ALIVE_TIMEOUT]) {
			request_timeout =
			    atof(conn->dom_ctx->config[KEEP_ALIVE_TIMEOUT]) / 1000.0;
		}
	}

	request_len = get_http_header_len(buf, *nread);

	/* first time reading from this connection */
	clock_gettime(CLOCK_MONOTONIC, &last_action_time);

	while (request_len == 0) {
		/* Full request not yet received */
		if (conn->phys_ctx->stop_flag != 0) {
			/* Server is to be stopped. */
			return -1;
		}

		if (*nread >= bufsiz) {
			/* Request too long */
			return -2;
		}

		n = pull_inner(
		    fp, conn, buf + *nread, bufsiz - *nread, request_timeout);
		if (n == -2) {
			/* Receive error */
			return -1;
		}
		if (n > 0) {
			*nread += n;
			request_len = get_http_header_len(buf, *nread);
		} else {
			request_len = 0;
		}

		if ((request_len == 0) && (request_timeout >= 0)) {
			if (mg_difftimespec(&last_action_time, &(conn->req_time))
			    > request_timeout) {
				/* Timeout */
				return -1;
			}
			clock_gettime(CLOCK_MONOTONIC, &last_action_time);
		}
	}

	return request_len;
}


#if !defined(NO_CGI) || !defined(NO_FILES)
static int
forward_body_data(struct mg_connection *conn, FILE *fp, SOCKET sock, SSL *ssl)
{
	const char *expect, *body;
	char buf[MG_BUF_LEN];
	int to_read, nread, success = 0;
	int64_t buffered_len;
	double timeout = -1.0;

	if (!conn) {
		return 0;
	}
	if (conn->dom_ctx->config[REQUEST_TIMEOUT]) {
		timeout = atoi(conn->dom_ctx->config[REQUEST_TIMEOUT]) / 1000.0;
	}

	expect = mg_get_header(conn, "Expect");
	DEBUG_ASSERT(fp != NULL);
	if (!fp) {
		mg_send_http_error(conn, 500, "%s", "Error: NULL File");
		return 0;
	}

	if ((conn->content_len == -1) && (!conn->is_chunked)) {
		/* Content length is not specified by the client. */
		mg_send_http_error(conn,
		                   411,
		                   "%s",
		                   "Error: Client did not specify content length");
	} else if ((expect != NULL)
	           && (mg_strcasecmp(expect, "100-continue") != 0)) {
		/* Client sent an "Expect: xyz" header and xyz is not 100-continue.
		 */
		mg_send_http_error(conn,
		                   417,
		                   "Error: Can not fulfill expectation %s",
		                   expect);
	} else {
		if (expect != NULL) {
			(void)mg_printf(conn, "%s", "HTTP/1.1 100 Continue\r\n\r\n");
			conn->status_code = 100;
		} else {
			conn->status_code = 200;
		}

		buffered_len = (int64_t)(conn->data_len) - (int64_t)conn->request_len
		               - conn->consumed_content;

		DEBUG_ASSERT(buffered_len >= 0);
		DEBUG_ASSERT(conn->consumed_content == 0);

		if ((buffered_len < 0) || (conn->consumed_content != 0)) {
			mg_send_http_error(conn, 500, "%s", "Error: Size mismatch");
			return 0;
		}

		if (buffered_len > 0) {
			if ((int64_t)buffered_len > conn->content_len) {
				buffered_len = (int)conn->content_len;
			}
			body = conn->buf + conn->request_len + conn->consumed_content;
			push_all(
			    conn->phys_ctx, fp, sock, ssl, body, (int64_t)buffered_len);
			conn->consumed_content += buffered_len;
		}

		nread = 0;
		while (conn->consumed_content < conn->content_len) {
			to_read = sizeof(buf);
			if ((int64_t)to_read > conn->content_len - conn->consumed_content) {
				to_read = (int)(conn->content_len - conn->consumed_content);
			}
			nread = pull_inner(NULL, conn, buf, to_read, timeout);
			if (nread == -2) {
				/* error */
				break;
			}
			if (nread > 0) {
				if (push_all(conn->phys_ctx, fp, sock, ssl, buf, nread)
				    != nread) {
					break;
				}
			}
			conn->consumed_content += nread;
		}

		if (conn->consumed_content == conn->content_len) {
			success = (nread >= 0);
		}

		/* Each error code path in this function must send an error */
		if (!success) {
			/* NOTE: Maybe some data has already been sent. */
			/* TODO (low): If some data has been sent, a correct error
			 * reply can no longer be sent, so just close the connection */
			mg_send_http_error(conn, 500, "%s", "");
		}
	}

	return success;
}
#endif


#if defined(USE_TIMERS)

#define TIMER_API static
#include "timer.inl"

#endif /* USE_TIMERS */


#if !defined(NO_CGI)
/* This structure helps to create an environment for the spawned CGI
 * program.
 * Environment is an array of "VARIABLE=VALUE\0" ASCIIZ strings,
 * last element must be NULL.
 * However, on Windows there is a requirement that all these
 * VARIABLE=VALUE\0
 * strings must reside in a contiguous buffer. The end of the buffer is
 * marked by two '\0' characters.
 * We satisfy both worlds: we create an envp array (which is vars), all
 * entries are actually pointers inside buf. */
struct cgi_environment {
	struct mg_connection *conn;
	/* Data block */
	char *buf;      /* Environment buffer */
	size_t buflen;  /* Space available in buf */
	size_t bufused; /* Space taken in buf */
	                /* Index block */
	char **var;     /* char **envp */
	size_t varlen;  /* Number of variables available in var */
	size_t varused; /* Number of variables stored in var */
};


static void addenv(struct cgi_environment *env,
                   PRINTF_FORMAT_STRING(const char *fmt),
                   ...) PRINTF_ARGS(2, 3);

/* Append VARIABLE=VALUE\0 string to the buffer, and add a respective
 * pointer into the vars array. Assumes env != NULL and fmt != NULL. */
static void
addenv(struct cgi_environment *env, const char *fmt, ...)
{
	size_t n, space;
	int truncated = 0;
	char *added;
	va_list ap;

	/* Calculate how much space is left in the buffer */
	space = (env->buflen - env->bufused);

	/* Calculate an estimate for the required space */
	n = strlen(fmt) + 2 + 128;

	do {
		if (space <= n) {
			/* Allocate new buffer */
			n = env->buflen + CGI_ENVIRONMENT_SIZE;
			added = (char *)mg_realloc_ctx(env->buf, n, env->conn->phys_ctx);
			if (!added) {
				/* Out of memory */
				mg_cry_internal(
				    env->conn,
				    "%s: Cannot allocate memory for CGI variable [%s]",
				    __func__,
				    fmt);
				return;
			}
			env->buf = added;
			env->buflen = n;
			space = (env->buflen - env->bufused);
		}

		/* Make a pointer to the free space int the buffer */
		added = env->buf + env->bufused;

		/* Copy VARIABLE=VALUE\0 string into the free space */
		va_start(ap, fmt);
		mg_vsnprintf(env->conn, &truncated, added, (size_t)space, fmt, ap);
		va_end(ap);

		/* Do not add truncated strings to the environment */
		if (truncated) {
			/* Reallocate the buffer */
			space = 0;
			n = 1;
		}
	} while (truncated);

	/* Calculate number of bytes added to the environment */
	n = strlen(added) + 1;
	env->bufused += n;

	/* Now update the variable index */
	space = (env->varlen - env->varused);
	if (space < 2) {
		mg_cry_internal(env->conn,
		                "%s: Cannot register CGI variable [%s]",
		                __func__,
		                fmt);
		return;
	}

	/* Append a pointer to the added string into the envp array */
	env->var[env->varused] = added;
	env->varused++;
}

/* Return 0 on success, non-zero if an error occurs. */

static int
prepare_cgi_environment(struct mg_connection *conn,
                        const char *prog,
                        struct cgi_environment *env)
{
	const char *s;
	struct vec var_vec;
	char *p, src_addr[IP_ADDR_STR_LEN], http_var_name[128];
	int i, truncated, uri_len;

	if ((conn == NULL) || (prog == NULL) || (env == NULL)) {
		return -1;
	}

	env->conn = conn;
	env->buflen = CGI_ENVIRONMENT_SIZE;
	env->bufused = 0;
	env->buf = (char *)mg_malloc_ctx(env->buflen, conn->phys_ctx);
	if (env->buf == NULL) {
		mg_cry_internal(conn,
		                "%s: Not enough memory for environmental buffer",
		                __func__);
		return -1;
	}
	env->varlen = MAX_CGI_ENVIR_VARS;
	env->varused = 0;
	env->var =
	    (char **)mg_malloc_ctx(env->buflen * sizeof(char *), conn->phys_ctx);
	if (env->var == NULL) {
		mg_cry_internal(conn,
		                "%s: Not enough memory for environmental variables",
		                __func__);
		mg_free(env->buf);
		return -1;
	}

	addenv(env, "SERVER_NAME=%s", conn->dom_ctx->config[AUTHENTICATION_DOMAIN]);
	addenv(env, "SERVER_ROOT=%s", conn->dom_ctx->config[DOCUMENT_ROOT]);
	addenv(env, "DOCUMENT_ROOT=%s", conn->dom_ctx->config[DOCUMENT_ROOT]);
	addenv(env, "SERVER_SOFTWARE=CivetWeb/%s", mg_version());

	/* Prepare the environment block */
	addenv(env, "%s", "GATEWAY_INTERFACE=CGI/1.1");
	addenv(env, "%s", "SERVER_PROTOCOL=HTTP/1.1");
	addenv(env, "%s", "REDIRECT_STATUS=200"); /* For PHP */

#if defined(USE_IPV6)
	if (conn->client.lsa.sa.sa_family == AF_INET6) {
		addenv(env, "SERVER_PORT=%d", ntohs(conn->client.lsa.sin6.sin6_port));
	} else
#endif
	{
		addenv(env, "SERVER_PORT=%d", ntohs(conn->client.lsa.sin.sin_port));
	}

	sockaddr_to_string(src_addr, sizeof(src_addr), &conn->client.rsa);
	addenv(env, "REMOTE_ADDR=%s", src_addr);

	addenv(env, "REQUEST_METHOD=%s", conn->request_info.request_method);
	addenv(env, "REMOTE_PORT=%d", conn->request_info.remote_port);

	addenv(env, "REQUEST_URI=%s", conn->request_info.request_uri);
	addenv(env, "LOCAL_URI=%s", conn->request_info.local_uri);

	/* SCRIPT_NAME */
	uri_len = (int)strlen(conn->request_info.local_uri);
	if (conn->path_info == NULL) {
		if (conn->request_info.local_uri[uri_len - 1] != '/') {
			/* URI: /path_to_script/script.cgi */
			addenv(env, "SCRIPT_NAME=%s", conn->request_info.local_uri);
		} else {
			/* URI: /path_to_script/ ... using index.cgi */
			const char *index_file = strrchr(prog, '/');
			if (index_file) {
				addenv(env,
				       "SCRIPT_NAME=%s%s",
				       conn->request_info.local_uri,
				       index_file + 1);
			}
		}
	} else {
		/* URI: /path_to_script/script.cgi/path_info */
		addenv(env,
		       "SCRIPT_NAME=%.*s",
		       uri_len - (int)strlen(conn->path_info),
		       conn->request_info.local_uri);
	}

	addenv(env, "SCRIPT_FILENAME=%s", prog);
	if (conn->path_info == NULL) {
		addenv(env, "PATH_TRANSLATED=%s", conn->dom_ctx->config[DOCUMENT_ROOT]);
	} else {
		addenv(env,
		       "PATH_TRANSLATED=%s%s",
		       conn->dom_ctx->config[DOCUMENT_ROOT],
		       conn->path_info);
	}

	addenv(env, "HTTPS=%s", (conn->ssl == NULL) ? "off" : "on");

	if ((s = mg_get_header(conn, "Content-Type")) != NULL) {
		addenv(env, "CONTENT_TYPE=%s", s);
	}
	if (conn->request_info.query_string != NULL) {
		addenv(env, "QUERY_STRING=%s", conn->request_info.query_string);
	}
	if ((s = mg_get_header(conn, "Content-Length")) != NULL) {
		addenv(env, "CONTENT_LENGTH=%s", s);
	}
	if ((s = getenv("PATH")) != NULL) {
		addenv(env, "PATH=%s", s);
	}
	if (conn->path_info != NULL) {
		addenv(env, "PATH_INFO=%s", conn->path_info);
	}

	if (conn->status_code > 0) {
		/* CGI error handler should show the status code */
		addenv(env, "STATUS=%d", conn->status_code);
	}

#if defined(_WIN32)
	if ((s = getenv("COMSPEC")) != NULL) {
		addenv(env, "COMSPEC=%s", s);
	}
	if ((s = getenv("SYSTEMROOT")) != NULL) {
		addenv(env, "SYSTEMROOT=%s", s);
	}
	if ((s = getenv("SystemDrive")) != NULL) {
		addenv(env, "SystemDrive=%s", s);
	}
	if ((s = getenv("ProgramFiles")) != NULL) {
		addenv(env, "ProgramFiles=%s", s);
	}
	if ((s = getenv("ProgramFiles(x86)")) != NULL) {
		addenv(env, "ProgramFiles(x86)=%s", s);
	}
#else
	if ((s = getenv("LD_LIBRARY_PATH")) != NULL) {
		addenv(env, "LD_LIBRARY_PATH=%s", s);
	}
#endif /* _WIN32 */

	if ((s = getenv("PERLLIB")) != NULL) {
		addenv(env, "PERLLIB=%s", s);
	}

	if (conn->request_info.remote_user != NULL) {
		addenv(env, "REMOTE_USER=%s", conn->request_info.remote_user);
		addenv(env, "%s", "AUTH_TYPE=Digest");
	}

	/* Add all headers as HTTP_* variables */
	for (i = 0; i < conn->request_info.num_headers; i++) {

		(void)mg_snprintf(conn,
		                  &truncated,
		                  http_var_name,
		                  sizeof(http_var_name),
		                  "HTTP_%s",
		                  conn->request_info.http_headers[i].name);

		if (truncated) {
			mg_cry_internal(conn,
			                "%s: HTTP header variable too long [%s]",
			                __func__,
			                conn->request_info.http_headers[i].name);
			continue;
		}

		/* Convert variable name into uppercase, and change - to _ */
		for (p = http_var_name; *p != '\0'; p++) {
			if (*p == '-') {
				*p = '_';
			}
			*p = (char)toupper(*(unsigned char *)p);
		}

		addenv(env,
		       "%s=%s",
		       http_var_name,
		       conn->request_info.http_headers[i].value);
	}

	/* Add user-specified variables */
	s = conn->dom_ctx->config[CGI_ENVIRONMENT];
	while ((s = next_option(s, &var_vec, NULL)) != NULL) {
		addenv(env, "%.*s", (int)var_vec.len, var_vec.ptr);
	}

	env->var[env->varused] = NULL;
	env->buf[env->bufused] = '\0';

	return 0;
}


/* Data for CGI process control: PID and number of references */
struct process_control_data {
	pid_t pid;
	int references;
};

static int
abort_process(void *data)
{
	/* Waitpid checks for child status and won't work for a pid that does not
	 * identify a child of the current process. Thus, if the pid is reused,
	 * we will not affect a different process. */
	struct process_control_data *proc = (struct process_control_data *)data;
	int status = 0;
	int refs;
	pid_t ret_pid;

	ret_pid = waitpid(proc->pid, &status, WNOHANG);
	if ((ret_pid != (pid_t)-1) && (status == 0)) {
		/* Stop child process */
		DEBUG_TRACE("CGI timer: Stop child process %p\n", proc->pid);
		kill(proc->pid, SIGABRT);

		/* Wait until process is terminated (don't leave zombies) */
		while (waitpid(proc->pid, &status, 0) != (pid_t)-1) /* nop */
			;
	} else {
		DEBUG_TRACE("CGI timer: Child process %p already stopped\n", proc->pid);
	}
	/* Dec reference counter */
	refs = mg_atomic_dec(&proc->references);
	if (refs == 0) {
		/* no more references - free data */
		mg_free(data);
	}

	return 0;
}


static void
handle_cgi_request(struct mg_connection *conn, const char *prog)
{
	char *buf;
	size_t buflen;
	int headers_len, data_len, i, truncated;
	int fdin[2] = {-1, -1}, fdout[2] = {-1, -1}, fderr[2] = {-1, -1};
	const char *status, *status_text, *connection_state;
	char *pbuf, dir[PATH_MAX], *p;
	struct mg_request_info ri;
	struct cgi_environment blk;
	FILE *in = NULL, *out = NULL, *err = NULL;
	struct mg_file fout = STRUCT_FILE_INITIALIZER;
	pid_t pid = (pid_t)-1;
	struct process_control_data *proc = NULL;

#if defined(USE_TIMERS)
	double cgi_timeout = -1.0;
	if (conn->dom_ctx->config[CGI_TIMEOUT]) {
		/* Get timeout in seconds */
		cgi_timeout = atof(conn->dom_ctx->config[CGI_TIMEOUT]) * 0.001;
	}
#endif

	if (conn == NULL) {
		return;
	}

	buf = NULL;
	buflen = conn->phys_ctx->max_request_size;
	i = prepare_cgi_environment(conn, prog, &blk);
	if (i != 0) {
		blk.buf = NULL;
		blk.var = NULL;
		goto done;
	}

	/* CGI must be executed in its own directory. 'dir' must point to the
	 * directory containing executable program, 'p' must point to the
	 * executable program name relative to 'dir'. */
	(void)mg_snprintf(conn, &truncated, dir, sizeof(dir), "%s", prog);

	if (truncated) {
		mg_cry_internal(conn, "Error: CGI program \"%s\": Path too long", prog);
		mg_send_http_error(conn, 500, "Error: %s", "CGI path too long");
		goto done;
	}

	if ((p = strrchr(dir, '/')) != NULL) {
		*p++ = '\0';
	} else {
		dir[0] = '.';
		dir[1] = '\0';
		p = (char *)prog;
	}

	if ((pipe(fdin) != 0) || (pipe(fdout) != 0) || (pipe(fderr) != 0)) {
		status = strerror(ERRNO);
		mg_cry_internal(
		    conn,
		    "Error: CGI program \"%s\": Can not create CGI pipes: %s",
		    prog,
		    status);
		mg_send_http_error(conn,
		                   500,
		                   "Error: Cannot create CGI pipe: %s",
		                   status);
		goto done;
	}

	proc = (struct process_control_data *)
	    mg_malloc_ctx(sizeof(struct process_control_data), conn->phys_ctx);
	if (proc == NULL) {
		mg_cry_internal(conn, "Error: CGI program \"%s\": Out or memory", prog);
		mg_send_http_error(conn, 500, "Error: Out of memory [%s]", prog);
		goto done;
	}

	DEBUG_TRACE("CGI: spawn %s %s\n", dir, p);
	pid = spawn_process(conn, p, blk.buf, blk.var, fdin, fdout, fderr, dir);

	if (pid == (pid_t)-1) {
		status = strerror(ERRNO);
		mg_cry_internal(
		    conn,
		    "Error: CGI program \"%s\": Can not spawn CGI process: %s",
		    prog,
		    status);
		mg_send_http_error(conn,
		                   500,
		                   "Error: Cannot spawn CGI process [%s]: %s",
		                   prog,
		                   status);
		mg_free(proc);
		proc = NULL;
		goto done;
	}

	/* Store data in shared process_control_data */
	proc->pid = pid;
	proc->references = 1;

#if defined(USE_TIMERS)
	if (cgi_timeout > 0.0) {
		proc->references = 2;

		// Start a timer for CGI
		timer_add(conn->phys_ctx,
		          cgi_timeout /* in seconds */,
		          0.0,
		          1,
		          abort_process,
		          (void *)proc);
	}
#endif

	/* Make sure child closes all pipe descriptors. It must dup them to 0,1 */
	set_close_on_exec((SOCKET)fdin[0], conn);  /* stdin read */
	set_close_on_exec((SOCKET)fdin[1], conn);  /* stdin write */
	set_close_on_exec((SOCKET)fdout[0], conn); /* stdout read */
	set_close_on_exec((SOCKET)fdout[1], conn); /* stdout write */
	set_close_on_exec((SOCKET)fderr[0], conn); /* stderr read */
	set_close_on_exec((SOCKET)fderr[1], conn); /* stderr write */

	/* Parent closes only one side of the pipes.
	 * If we don't mark them as closed, close() attempt before
	 * return from this function throws an exception on Windows.
	 * Windows does not like when closed descriptor is closed again. */
	(void)close(fdin[0]);
	(void)close(fdout[1]);
	(void)close(fderr[1]);
	fdin[0] = fdout[1] = fderr[1] = -1;

	if ((in = fdopen(fdin[1], "wb")) == NULL) {
		status = strerror(ERRNO);
		mg_cry_internal(conn,
		                "Error: CGI program \"%s\": Can not open stdin: %s",
		                prog,
		                status);
		mg_send_http_error(conn,
		                   500,
		                   "Error: CGI can not open fdin\nfopen: %s",
		                   status);
		goto done;
	}

	if ((out = fdopen(fdout[0], "rb")) == NULL) {
		status = strerror(ERRNO);
		mg_cry_internal(conn,
		                "Error: CGI program \"%s\": Can not open stdout: %s",
		                prog,
		                status);
		mg_send_http_error(conn,
		                   500,
		                   "Error: CGI can not open fdout\nfopen: %s",
		                   status);
		goto done;
	}

	if ((err = fdopen(fderr[0], "rb")) == NULL) {
		status = strerror(ERRNO);
		mg_cry_internal(conn,
		                "Error: CGI program \"%s\": Can not open stderr: %s",
		                prog,
		                status);
		mg_send_http_error(conn,
		                   500,
		                   "Error: CGI can not open fderr\nfopen: %s",
		                   status);
		goto done;
	}

	setbuf(in, NULL);
	setbuf(out, NULL);
	setbuf(err, NULL);
	fout.access.fp = out;

	if ((conn->request_info.content_length != 0) || (conn->is_chunked)) {
		DEBUG_TRACE("CGI: send body data (%lli)\n",
		            (signed long long)conn->request_info.content_length);

		/* This is a POST/PUT request, or another request with body data. */
		if (!forward_body_data(conn, in, INVALID_SOCKET, NULL)) {
			/* Error sending the body data */
			mg_cry_internal(
			    conn,
			    "Error: CGI program \"%s\": Forward body data failed",
			    prog);
			goto done;
		}
	}

	/* Close so child gets an EOF. */
	fclose(in);
	in = NULL;
	fdin[1] = -1;

	/* Now read CGI reply into a buffer. We need to set correct
	 * status code, thus we need to see all HTTP headers first.
	 * Do not send anything back to client, until we buffer in all
	 * HTTP headers. */
	data_len = 0;
	buf = (char *)mg_malloc_ctx(buflen, conn->phys_ctx);
	if (buf == NULL) {
		mg_send_http_error(conn,
		                   500,
		                   "Error: Not enough memory for CGI buffer (%u bytes)",
		                   (unsigned int)buflen);
		mg_cry_internal(
		    conn,
		    "Error: CGI program \"%s\": Not enough memory for buffer (%u "
		    "bytes)",
		    prog,
		    (unsigned int)buflen);
		goto done;
	}

	DEBUG_TRACE("CGI: %s", "wait for response");
	headers_len = read_message(out, conn, buf, (int)buflen, &data_len);
	DEBUG_TRACE("CGI: response: %li", (signed long)headers_len);

	if (headers_len <= 0) {

		/* Could not parse the CGI response. Check if some error message on
		 * stderr. */
		i = pull_all(err, conn, buf, (int)buflen);
		if (i > 0) {
			/* CGI program explicitly sent an error */
			/* Write the error message to the internal log */
			mg_cry_internal(conn,
			                "Error: CGI program \"%s\" sent error "
			                "message: [%.*s]",
			                prog,
			                i,
			                buf);
			/* Don't send the error message back to the client */
			mg_send_http_error(conn,
			                   500,
			                   "Error: CGI program \"%s\" failed.",
			                   prog);
		} else {
			/* CGI program did not explicitly send an error, but a broken
			 * respon header */
			mg_cry_internal(conn,
			                "Error: CGI program sent malformed or too big "
			                "(>%u bytes) HTTP headers: [%.*s]",
			                (unsigned)buflen,
			                data_len,
			                buf);

			mg_send_http_error(conn,
			                   500,
			                   "Error: CGI program sent malformed or too big "
			                   "(>%u bytes) HTTP headers: [%.*s]",
			                   (unsigned)buflen,
			                   data_len,
			                   buf);
		}

		/* in both cases, abort processing CGI */
		goto done;
	}

	pbuf = buf;
	buf[headers_len - 1] = '\0';
	ri.num_headers = parse_http_headers(&pbuf, ri.http_headers);

	/* Make up and send the status line */
	status_text = "OK";
	if ((status = get_header(ri.http_headers, ri.num_headers, "Status"))
	    != NULL) {
		conn->status_code = atoi(status);
		status_text = status;
		while (isdigit(*(const unsigned char *)status_text)
		       || *status_text == ' ') {
			status_text++;
		}
	} else if (get_header(ri.http_headers, ri.num_headers, "Location")
	           != NULL) {
		conn->status_code = 307;
	} else {
		conn->status_code = 200;
	}
	connection_state =
	    get_header(ri.http_headers, ri.num_headers, "Connection");
	if (!header_has_option(connection_state, "keep-alive")) {
		conn->must_close = 1;
	}

	DEBUG_TRACE("CGI: response %u %s", conn->status_code, status_text);

	(void)mg_printf(conn, "HTTP/1.1 %d %s\r\n", conn->status_code, status_text);

	/* Send headers */
	for (i = 0; i < ri.num_headers; i++) {
		mg_printf(conn,
		          "%s: %s\r\n",
		          ri.http_headers[i].name,
		          ri.http_headers[i].value);
	}
	mg_write(conn, "\r\n", 2);

	/* Send chunk of data that may have been read after the headers */
	mg_write(conn, buf + headers_len, (size_t)(data_len - headers_len));

	/* Read the rest of CGI output and send to the client */
	DEBUG_TRACE("CGI: %s", "forward all data");
	send_file_data(conn, &fout, 0, INT64_MAX);
	DEBUG_TRACE("CGI: %s", "all data sent");

done:
	mg_free(blk.var);
	mg_free(blk.buf);

	if (pid != (pid_t)-1) {
		abort_process((void *)proc);
	}

	if (fdin[0] != -1) {
		close(fdin[0]);
	}
	if (fdout[1] != -1) {
		close(fdout[1]);
	}

	if (in != NULL) {
		fclose(in);
	} else if (fdin[1] != -1) {
		close(fdin[1]);
	}

	if (out != NULL) {
		fclose(out);
	} else if (fdout[0] != -1) {
		close(fdout[0]);
	}

	if (err != NULL) {
		fclose(err);
	} else if (fderr[0] != -1) {
		close(fderr[0]);
	}

	if (buf != NULL) {
		mg_free(buf);
	}
}
#endif /* !NO_CGI */


#if !defined(NO_FILES)
static void
mkcol(struct mg_connection *conn, const char *path)
{
	int rc, body_len;
	struct de de;
	char date[64];
	time_t curtime = time(NULL);

	if (conn == NULL) {
		return;
	}

	/* TODO (mid): Check the mg_send_http_error situations in this function
	 */

	memset(&de.file, 0, sizeof(de.file));
	if (!mg_stat(conn, path, &de.file)) {
		mg_cry_internal(conn,
		                "%s: mg_stat(%s) failed: %s",
		                __func__,
		                path,
		                strerror(ERRNO));
	}

	if (de.file.last_modified) {
		/* TODO (mid): This check does not seem to make any sense ! */
		/* TODO (mid): Add a webdav unit test first, before changing
		 * anything here. */
		mg_send_http_error(
		    conn, 405, "Error: mkcol(%s): %s", path, strerror(ERRNO));
		return;
	}

	body_len = conn->data_len - conn->request_len;
	if (body_len > 0) {
		mg_send_http_error(
		    conn, 415, "Error: mkcol(%s): %s", path, strerror(ERRNO));
		return;
	}

	rc = mg_mkdir(conn, path, 0755);

	if (rc == 0) {
		conn->status_code = 201;
		gmt_time_string(date, sizeof(date), &curtime);
		mg_printf(conn,
		          "HTTP/1.1 %d Created\r\n"
		          "Date: %s\r\n",
		          conn->status_code,
		          date);
		send_static_cache_header(conn);
		send_additional_header(conn);
		mg_printf(conn,
		          "Content-Length: 0\r\n"
		          "Connection: %s\r\n\r\n",
		          suggest_connection_header(conn));
	} else {
		if (errno == EEXIST) {
			mg_send_http_error(
			    conn, 405, "Error: mkcol(%s): %s", path, strerror(ERRNO));
		} else if (errno == EACCES) {
			mg_send_http_error(
			    conn, 403, "Error: mkcol(%s): %s", path, strerror(ERRNO));
		} else if (errno == ENOENT) {
			mg_send_http_error(
			    conn, 409, "Error: mkcol(%s): %s", path, strerror(ERRNO));
		} else {
			mg_send_http_error(
			    conn, 500, "fopen(%s): %s", path, strerror(ERRNO));
		}
	}
}


static void
put_file(struct mg_connection *conn, const char *path)
{
	struct mg_file file = STRUCT_FILE_INITIALIZER;
	const char *range;
	int64_t r1, r2;
	int rc;
	char date[64];
	time_t curtime = time(NULL);

	if (conn == NULL) {
		return;
	}

	if (mg_stat(conn, path, &file.stat)) {
		/* File already exists */
		conn->status_code = 200;

		if (file.stat.is_directory) {
			/* This is an already existing directory,
			 * so there is nothing to do for the server. */
			rc = 0;

		} else {
			/* File exists and is not a directory. */
			/* Can it be replaced? */

#if defined(MG_USE_OPEN_FILE)
			if (file.access.membuf != NULL) {
				/* This is an "in-memory" file, that can not be replaced */
				mg_send_http_error(conn,
				                   405,
				                   "Error: Put not possible\nReplacing %s "
				                   "is not supported",
				                   path);
				return;
			}
#endif

			/* Check if the server may write this file */
			if (access(path, W_OK) == 0) {
				/* Access granted */
				conn->status_code = 200;
				rc = 1;
			} else {
				mg_send_http_error(
				    conn,
				    403,
				    "Error: Put not possible\nReplacing %s is not allowed",
				    path);
				return;
			}
		}
	} else {
		/* File should be created */
		conn->status_code = 201;
		rc = put_dir(conn, path);
	}

	if (rc == 0) {
		/* put_dir returns 0 if path is a directory */
		gmt_time_string(date, sizeof(date), &curtime);
		mg_printf(conn,
		          "HTTP/1.1 %d %s\r\n",
		          conn->status_code,
		          mg_get_response_code_text(NULL, conn->status_code));
		send_no_cache_header(conn);
		send_additional_header(conn);
		mg_printf(conn,
		          "Date: %s\r\n"
		          "Content-Length: 0\r\n"
		          "Connection: %s\r\n\r\n",
		          date,
		          suggest_connection_header(conn));

		/* Request to create a directory has been fulfilled successfully.
		 * No need to put a file. */
		return;
	}

	if (rc == -1) {
		/* put_dir returns -1 if the path is too long */
		mg_send_http_error(conn,
		                   414,
		                   "Error: Path too long\nput_dir(%s): %s",
		                   path,
		                   strerror(ERRNO));
		return;
	}

	if (rc == -2) {
		/* put_dir returns -2 if the directory can not be created */
		mg_send_http_error(conn,
		                   500,
		                   "Error: Can not create directory\nput_dir(%s): %s",
		                   path,
		                   strerror(ERRNO));
		return;
	}

	/* A file should be created or overwritten. */
	/* Currently CivetWeb does not nead read+write access. */
	if (!mg_fopen(conn, path, MG_FOPEN_MODE_WRITE, &file)
	    || file.access.fp == NULL) {
		(void)mg_fclose(&file.access);
		mg_send_http_error(conn,
		                   500,
		                   "Error: Can not create file\nfopen(%s): %s",
		                   path,
		                   strerror(ERRNO));
		return;
	}

	fclose_on_exec(&file.access, conn);
	range = mg_get_header(conn, "Content-Range");
	r1 = r2 = 0;
	if ((range != NULL) && parse_range_header(range, &r1, &r2) > 0) {
		conn->status_code = 206; /* Partial content */
		fseeko(file.access.fp, r1, SEEK_SET);
	}

	if (!forward_body_data(conn, file.access.fp, INVALID_SOCKET, NULL)) {
		/* forward_body_data failed.
		 * The error code has already been sent to the client,
		 * and conn->status_code is already set. */
		(void)mg_fclose(&file.access);
		return;
	}

	if (mg_fclose(&file.access) != 0) {
		/* fclose failed. This might have different reasons, but a likely
		 * one is "no space on disk", http 507. */
		conn->status_code = 507;
	}

	gmt_time_string(date, sizeof(date), &curtime);
	mg_printf(conn,
	          "HTTP/1.1 %d %s\r\n",
	          conn->status_code,
	          mg_get_response_code_text(NULL, conn->status_code));
	send_no_cache_header(conn);
	send_additional_header(conn);
	mg_printf(conn,
	          "Date: %s\r\n"
	          "Content-Length: 0\r\n"
	          "Connection: %s\r\n\r\n",
	          date,
	          suggest_connection_header(conn));
}


static void
delete_file(struct mg_connection *conn, const char *path)
{
	struct de de;
	memset(&de.file, 0, sizeof(de.file));
	if (!mg_stat(conn, path, &de.file)) {
		/* mg_stat returns 0 if the file does not exist */
		mg_send_http_error(conn,
		                   404,
		                   "Error: Cannot delete file\nFile %s not found",
		                   path);
		return;
	}

#if 0 /* Ignore if a file in memory is inside a folder */
        if (de.access.membuf != NULL) {
                /* the file is cached in memory */
                mg_send_http_error(
                    conn,
                    405,
                    "Error: Delete not possible\nDeleting %s is not supported",
                    path);
                return;
        }
#endif

	if (de.file.is_directory) {
		if (remove_directory(conn, path)) {
			/* Delete is successful: Return 204 without content. */
			mg_send_http_error(conn, 204, "%s", "");
		} else {
			/* Delete is not successful: Return 500 (Server error). */
			mg_send_http_error(conn, 500, "Error: Could not delete %s", path);
		}
		return;
	}

	/* This is an existing file (not a directory).
	 * Check if write permission is granted. */
	if (access(path, W_OK) != 0) {
		/* File is read only */
		mg_send_http_error(
		    conn,
		    403,
		    "Error: Delete not possible\nDeleting %s is not allowed",
		    path);
		return;
	}

	/* Try to delete it. */
	if (mg_remove(conn, path) == 0) {
		/* Delete was successful: Return 204 without content. */
		mg_send_http_error(conn, 204, "%s", "");
	} else {
		/* Delete not successful (file locked). */
		mg_send_http_error(conn,
		                   423,
		                   "Error: Cannot delete file\nremove(%s): %s",
		                   path,
		                   strerror(ERRNO));
	}
}
#endif /* !NO_FILES */


static void
send_ssi_file(struct mg_connection *, const char *, struct mg_file *, int);


static void
do_ssi_include(struct mg_connection *conn,
               const char *ssi,
               char *tag,
               int include_level)
{
	char file_name[MG_BUF_LEN], path[512], *p;
	struct mg_file file = STRUCT_FILE_INITIALIZER;
	size_t len;
	int truncated = 0;

	if (conn == NULL) {
		return;
	}

	/* sscanf() is safe here, since send_ssi_file() also uses buffer
	 * of size MG_BUF_LEN to get the tag. So strlen(tag) is
	 * always < MG_BUF_LEN. */
	if (sscanf(tag, " virtual=\"%511[^\"]\"", file_name) == 1) {
		/* File name is relative to the webserver root */
		file_name[511] = 0;
		(void)mg_snprintf(conn,
		                  &truncated,
		                  path,
		                  sizeof(path),
		                  "%s/%s",
		                  conn->dom_ctx->config[DOCUMENT_ROOT],
		                  file_name);

	} else if (sscanf(tag, " abspath=\"%511[^\"]\"", file_name) == 1) {
		/* File name is relative to the webserver working directory
		 * or it is absolute system path */
		file_name[511] = 0;
		(void)
		    mg_snprintf(conn, &truncated, path, sizeof(path), "%s", file_name);

	} else if ((sscanf(tag, " file=\"%511[^\"]\"", file_name) == 1)
	           || (sscanf(tag, " \"%511[^\"]\"", file_name) == 1)) {
		/* File name is relative to the currect document */
		file_name[511] = 0;
		(void)mg_snprintf(conn, &truncated, path, sizeof(path), "%s", ssi);

		if (!truncated) {
			if ((p = strrchr(path, '/')) != NULL) {
				p[1] = '\0';
			}
			len = strlen(path);
			(void)mg_snprintf(conn,
			                  &truncated,
			                  path + len,
			                  sizeof(path) - len,
			                  "%s",
			                  file_name);
		}

	} else {
		mg_cry_internal(conn, "Bad SSI #include: [%s]", tag);
		return;
	}

	if (truncated) {
		mg_cry_internal(conn, "SSI #include path length overflow: [%s]", tag);
		return;
	}

	if (!mg_fopen(conn, path, MG_FOPEN_MODE_READ, &file)) {
		mg_cry_internal(conn,
		                "Cannot open SSI #include: [%s]: fopen(%s): %s",
		                tag,
		                path,
		                strerror(ERRNO));
	} else {
		fclose_on_exec(&file.access, conn);
		if (match_prefix(conn->dom_ctx->config[SSI_EXTENSIONS],
		                 strlen(conn->dom_ctx->config[SSI_EXTENSIONS]),
		                 path)
		    > 0) {
			send_ssi_file(conn, path, &file, include_level + 1);
		} else {
			send_file_data(conn, &file, 0, INT64_MAX);
		}
		(void)mg_fclose(&file.access); /* Ignore errors for readonly files */
	}
}


#if !defined(NO_POPEN)
static void
do_ssi_exec(struct mg_connection *conn, char *tag)
{
	char cmd[1024] = "";
	struct mg_file file = STRUCT_FILE_INITIALIZER;

	if (sscanf(tag, " \"%1023[^\"]\"", cmd) != 1) {
		mg_cry_internal(conn, "Bad SSI #exec: [%s]", tag);
	} else {
		cmd[1023] = 0;
		if ((file.access.fp = popen(cmd, "r")) == NULL) {
			mg_cry_internal(conn,
			                "Cannot SSI #exec: [%s]: %s",
			                cmd,
			                strerror(ERRNO));
		} else {
			send_file_data(conn, &file, 0, INT64_MAX);
			pclose(file.access.fp);
		}
	}
}
#endif /* !NO_POPEN */


static int
mg_fgetc(struct mg_file *filep, int offset)
{
	(void)offset; /* unused in case MG_USE_OPEN_FILE is set */

	if (filep == NULL) {
		return EOF;
	}
#if defined(MG_USE_OPEN_FILE)
	if ((filep->access.membuf != NULL) && (offset >= 0)
	    && (((unsigned int)(offset)) < filep->stat.size)) {
		return ((const unsigned char *)filep->access.membuf)[offset];
	} else /* else block below */
#endif
	    if (filep->access.fp != NULL) {
		return fgetc(filep->access.fp);
	} else {
		return EOF;
	}
}


static void
send_ssi_file(struct mg_connection *conn,
              const char *path,
              struct mg_file *filep,
              int include_level)
{
	char buf[MG_BUF_LEN];
	int ch, offset, len, in_tag, in_ssi_tag;

	if (include_level > 10) {
		mg_cry_internal(conn, "SSI #include level is too deep (%s)", path);
		return;
	}

	in_tag = in_ssi_tag = len = offset = 0;

	/* Read file, byte by byte, and look for SSI include tags */
	while ((ch = mg_fgetc(filep, offset++)) != EOF) {

		if (in_tag) {
			/* We are in a tag, either SSI tag or html tag */

			if (ch == '>') {
				/* Tag is closing */
				buf[len++] = '>';

				if (in_ssi_tag) {
					/* Handle SSI tag */
					buf[len] = 0;

					if ((len > 12) && !memcmp(buf + 5, "include", 7)) {
						do_ssi_include(conn, path, buf + 12, include_level + 1);
#if !defined(NO_POPEN)
					} else if ((len > 9) && !memcmp(buf + 5, "exec", 4)) {
						do_ssi_exec(conn, buf + 9);
#endif /* !NO_POPEN */
					} else {
						mg_cry_internal(conn,
						                "%s: unknown SSI "
						                "command: \"%s\"",
						                path,
						                buf);
					}
					len = 0;
					in_ssi_tag = in_tag = 0;

				} else {
					/* Not an SSI tag */
					/* Flush buffer */
					(void)mg_write(conn, buf, (size_t)len);
					len = 0;
					in_tag = 0;
				}

			} else {
				/* Tag is still open */
				buf[len++] = (char)(ch & 0xff);

				if ((len == 5) && !memcmp(buf, "<!--#", 5)) {
					/* All SSI tags start with <!--# */
					in_ssi_tag = 1;
				}

				if ((len + 2) > (int)sizeof(buf)) {
					/* Tag to long for buffer */
					mg_cry_internal(conn, "%s: tag is too large", path);
					return;
				}
			}

		} else {

			/* We are not in a tag yet. */
			if (ch == '<') {
				/* Tag is opening */
				in_tag = 1;

				if (len > 0) {
					/* Flush current buffer.
					 * Buffer is filled with "len" bytes. */
					(void)mg_write(conn, buf, (size_t)len);
				}
				/* Store the < */
				len = 1;
				buf[0] = '<';

			} else {
				/* No Tag */
				/* Add data to buffer */
				buf[len++] = (char)(ch & 0xff);
				/* Flush if buffer is full */
				if (len == (int)sizeof(buf)) {
					mg_write(conn, buf, (size_t)len);
					len = 0;
				}
			}
		}
	}

	/* Send the rest of buffered data */
	if (len > 0) {
		mg_write(conn, buf, (size_t)len);
	}
}


static void
handle_ssi_file_request(struct mg_connection *conn,
                        const char *path,
                        struct mg_file *filep)
{
	char date[64];
	time_t curtime = time(NULL);
	const char *cors1, *cors2, *cors3;

	if ((conn == NULL) || (path == NULL) || (filep == NULL)) {
		return;
	}

	if (mg_get_header(conn, "Origin")) {
		/* Cross-origin resource sharing (CORS). */
		cors1 = "Access-Control-Allow-Origin: ";
		cors2 = conn->dom_ctx->config[ACCESS_CONTROL_ALLOW_ORIGIN];
		cors3 = "\r\n";
	} else {
		cors1 = cors2 = cors3 = "";
	}

	if (!mg_fopen(conn, path, MG_FOPEN_MODE_READ, filep)) {
		/* File exists (precondition for calling this function),
		 * but can not be opened by the server. */
		mg_send_http_error(conn,
		                   500,
		                   "Error: Cannot read file\nfopen(%s): %s",
		                   path,
		                   strerror(ERRNO));
	} else {
		conn->must_close = 1;
		gmt_time_string(date, sizeof(date), &curtime);
		fclose_on_exec(&filep->access, conn);
		mg_printf(conn, "HTTP/1.1 200 OK\r\n");
		send_no_cache_header(conn);
		send_additional_header(conn);
		mg_printf(conn,
		          "%s%s%s"
		          "Date: %s\r\n"
		          "Content-Type: text/html\r\n"
		          "Connection: %s\r\n\r\n",
		          cors1,
		          cors2,
		          cors3,
		          date,
		          suggest_connection_header(conn));
		send_ssi_file(conn, path, filep, 0);
		(void)mg_fclose(&filep->access); /* Ignore errors for readonly files */
	}
}


#if !defined(NO_FILES)
static void
send_options(struct mg_connection *conn)
{
	char date[64];
	time_t curtime = time(NULL);

	if (!conn) {
		return;
	}

	conn->status_code = 200;
	conn->must_close = 1;
	gmt_time_string(date, sizeof(date), &curtime);

	/* We do not set a "Cache-Control" header here, but leave the default.
	 * Since browsers do not send an OPTIONS request, we can not test the
	 * effect anyway. */
	mg_printf(conn,
	          "HTTP/1.1 200 OK\r\n"
	          "Date: %s\r\n"
	          "Connection: %s\r\n"
	          "Allow: GET, POST, HEAD, CONNECT, PUT, DELETE, OPTIONS, "
	          "PROPFIND, MKCOL\r\n"
	          "DAV: 1\r\n",
	          date,
	          suggest_connection_header(conn));
	send_additional_header(conn);
	mg_printf(conn, "\r\n");
}


/* Writes PROPFIND properties for a collection element */
static void
print_props(struct mg_connection *conn,
            const char *uri,
            struct mg_file_stat *filep)
{
	char mtime[64];

	if ((conn == NULL) || (uri == NULL) || (filep == NULL)) {
		return;
	}

	gmt_time_string(mtime, sizeof(mtime), &filep->last_modified);
	mg_printf(conn,
	          "<d:response>"
	          "<d:href>%s</d:href>"
	          "<d:propstat>"
	          "<d:prop>"
	          "<d:resourcetype>%s</d:resourcetype>"
	          "<d:getcontentlength>%" INT64_FMT "</d:getcontentlength>"
	          "<d:getlastmodified>%s</d:getlastmodified>"
	          "</d:prop>"
	          "<d:status>HTTP/1.1 200 OK</d:status>"
	          "</d:propstat>"
	          "</d:response>\n",
	          uri,
	          filep->is_directory ? "<d:collection/>" : "",
	          filep->size,
	          mtime);
}


static int
print_dav_dir_entry(struct de *de, void *data)
{
	char href[PATH_MAX];
	int truncated;

	struct mg_connection *conn = (struct mg_connection *)data;
	if (!de || !conn) {
		return -1;
	}
	mg_snprintf(conn,
	            &truncated,
	            href,
	            sizeof(href),
	            "%s%s",
	            conn->request_info.local_uri,
	            de->file_name);

	if (!truncated) {
		size_t href_encoded_size;
		char *href_encoded;

		href_encoded_size = PATH_MAX * 3; /* worst case */
		href_encoded = (char *)mg_malloc(href_encoded_size);
		if (href_encoded == NULL) {
			return -1;
		}
		mg_url_encode(href, href_encoded, href_encoded_size);
		print_props(conn, href_encoded, &de->file);
		mg_free(href_encoded);
	}

	return 0;
}


static void
handle_propfind(struct mg_connection *conn,
                const char *path,
                struct mg_file_stat *filep)
{
	const char *depth = mg_get_header(conn, "Depth");
	char date[64];
	time_t curtime = time(NULL);

	gmt_time_string(date, sizeof(date), &curtime);

	if (!conn || !path || !filep || !conn->dom_ctx) {
		return;
	}

	conn->must_close = 1;
	conn->status_code = 207;
	mg_printf(conn,
	          "HTTP/1.1 207 Multi-Status\r\n"
	          "Date: %s\r\n",
	          date);
	send_static_cache_header(conn);
	send_additional_header(conn);
	mg_printf(conn,
	          "Connection: %s\r\n"
	          "Content-Type: text/xml; charset=utf-8\r\n\r\n",
	          suggest_connection_header(conn));

	mg_printf(conn,
	          "<?xml version=\"1.0\" encoding=\"utf-8\"?>"
	          "<d:multistatus xmlns:d='DAV:'>\n");

	/* Print properties for the requested resource itself */
	print_props(conn, conn->request_info.local_uri, filep);

	/* If it is a directory, print directory entries too if Depth is not 0
	 */
	if (filep->is_directory
	    && !mg_strcasecmp(conn->dom_ctx->config[ENABLE_DIRECTORY_LISTING],
	                      "yes")
	    && ((depth == NULL) || (strcmp(depth, "0") != 0))) {
		scan_directory(conn, path, conn, &print_dav_dir_entry);
	}

	mg_printf(conn, "%s\n", "</d:multistatus>");
}
#endif

void
mg_lock_connection(struct mg_connection *conn)
{
	if (conn) {
		(void)pthread_mutex_lock(&conn->mutex);
	}
}

void
mg_unlock_connection(struct mg_connection *conn)
{
	if (conn) {
		(void)pthread_mutex_unlock(&conn->mutex);
	}
}

void
mg_lock_context(struct mg_context *ctx)
{
	if (ctx) {
		(void)pthread_mutex_lock(&ctx->nonce_mutex);
	}
}

void
mg_unlock_context(struct mg_context *ctx)
{
	if (ctx) {
		(void)pthread_mutex_unlock(&ctx->nonce_mutex);
	}
}


#if defined(USE_LUA)
#include "mod_lua.inl"
#endif /* USE_LUA */

#if defined(USE_DUKTAPE)
#include "mod_duktape.inl"
#endif /* USE_DUKTAPE */

#if defined(USE_WEBSOCKET)

#if !defined(NO_SSL_DL)
#define SHA_API static
#include "sha1.inl"
#endif

static int
send_websocket_handshake(struct mg_connection *conn, const char *websock_key)
{
	static const char *magic = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
	char buf[100], sha[20], b64_sha[sizeof(sha) * 2];
	SHA_CTX sha_ctx;
	int truncated;

	/* Calculate Sec-WebSocket-Accept reply from Sec-WebSocket-Key. */
	mg_snprintf(conn, &truncated, buf, sizeof(buf), "%s%s", websock_key, magic);
	if (truncated) {
		conn->must_close = 1;
		return 0;
	}

	DEBUG_TRACE("%s", "Send websocket handshake");

	SHA1_Init(&sha_ctx);
	SHA1_Update(&sha_ctx, (unsigned char *)buf, (uint32_t)strlen(buf));
	SHA1_Final((unsigned char *)sha, &sha_ctx);
	base64_encode((unsigned char *)sha, sizeof(sha), b64_sha);
	mg_printf(conn,
	          "HTTP/1.1 101 Switching Protocols\r\n"
	          "Upgrade: websocket\r\n"
	          "Connection: Upgrade\r\n"
	          "Sec-WebSocket-Accept: %s\r\n",
	          b64_sha);
	if (conn->request_info.acceptedWebSocketSubprotocol) {
		mg_printf(conn,
		          "Sec-WebSocket-Protocol: %s\r\n\r\n",
		          conn->request_info.acceptedWebSocketSubprotocol);
	} else {
		mg_printf(conn, "%s", "\r\n");
	}

	return 1;
}


#if !defined(MG_MAX_UNANSWERED_PING)
/* Configuration of the maximum number of websocket PINGs that might
 * stay unanswered before the connection is considered broken.
 * Note: The name of this define may still change (until it is
 * defined as a compile parameter in a documentation).
 */
#define MG_MAX_UNANSWERED_PING (5)
#endif


static void
read_websocket(struct mg_connection *conn,
               mg_websocket_data_handler ws_data_handler,
               void *callback_data)
{
	/* Pointer to the beginning of the portion of the incoming websocket
	 * message queue.
	 * The original websocket upgrade request is never removed, so the queue
	 * begins after it. */
	unsigned char *buf = (unsigned char *)conn->buf + conn->request_len;
	int n, error, exit_by_callback;
	int ret;

	/* body_len is the length of the entire queue in bytes
	 * len is the length of the current message
	 * data_len is the length of the current message's data payload
	 * header_len is the length of the current message's header */
	size_t i, len, mask_len = 0, header_len, body_len;
	uint64_t data_len = 0;

	/* "The masking key is a 32-bit value chosen at random by the client."
	 * http://tools.ietf.org/html/draft-ietf-hybi-thewebsocketprotocol-17#section-5
	 */
	unsigned char mask[4];

	/* data points to the place where the message is stored when passed to
	 * the websocket_data callback.  This is either mem on the stack, or a
	 * dynamically allocated buffer if it is too large. */
	unsigned char mem[4096];
	unsigned char mop; /* mask flag and opcode */


	/* Variables used for connection monitoring */
	double timeout = -1.0;
	int enable_ping_pong = 0;
	int ping_count = 0;

	if (conn->dom_ctx->config[ENABLE_WEBSOCKET_PING_PONG]) {
		enable_ping_pong =
		    !mg_strcasecmp(conn->dom_ctx->config[ENABLE_WEBSOCKET_PING_PONG],
		                   "yes");
	}

	if (conn->dom_ctx->config[WEBSOCKET_TIMEOUT]) {
		timeout = atoi(conn->dom_ctx->config[WEBSOCKET_TIMEOUT]) / 1000.0;
	}
	if ((timeout <= 0.0) && (conn->dom_ctx->config[REQUEST_TIMEOUT])) {
		timeout = atoi(conn->dom_ctx->config[REQUEST_TIMEOUT]) / 1000.0;
	}

	/* Enter data processing loop */
	DEBUG_TRACE("Websocket connection %s:%u start data processing loop",
	            conn->request_info.remote_addr,
	            conn->request_info.remote_port);
	conn->in_websocket_handling = 1;
	mg_set_thread_name("wsock");

	/* Loop continuously, reading messages from the socket, invoking the
	 * callback, and waiting repeatedly until an error occurs. */
	while (!conn->phys_ctx->stop_flag && !conn->must_close) {
		header_len = 0;
		DEBUG_ASSERT(conn->data_len >= conn->request_len);
		if ((body_len = (size_t)(conn->data_len - conn->request_len)) >= 2) {
			len = buf[1] & 127;
			mask_len = (buf[1] & 128) ? 4 : 0;
			if ((len < 126) && (body_len >= mask_len)) {
				/* inline 7-bit length field */
				data_len = len;
				header_len = 2 + mask_len;
			} else if ((len == 126) && (body_len >= (4 + mask_len))) {
				/* 16-bit length field */
				header_len = 4 + mask_len;
				data_len = ((((size_t)buf[2]) << 8) + buf[3]);
			} else if (body_len >= (10 + mask_len)) {
				/* 64-bit length field */
				uint32_t l1, l2;
				memcpy(&l1, &buf[2], 4); /* Use memcpy for alignment */
				memcpy(&l2, &buf[6], 4);
				header_len = 10 + mask_len;
				data_len = (((uint64_t)ntohl(l1)) << 32) + ntohl(l2);

				if (data_len > (uint64_t)0x7FFF0000ul) {
					/* no can do */
					mg_cry_internal(
					    conn,
					    "%s",
					    "websocket out of memory; closing connection");
					break;
				}
			}
		}

		if ((header_len > 0) && (body_len >= header_len)) {
			/* Allocate space to hold websocket payload */
			unsigned char *data = mem;

			if ((size_t)data_len > (size_t)sizeof(mem)) {
				data = (unsigned char *)mg_malloc_ctx((size_t)data_len,
				                                      conn->phys_ctx);
				if (data == NULL) {
					/* Allocation failed, exit the loop and then close the
					 * connection */
					mg_cry_internal(
					    conn,
					    "%s",
					    "websocket out of memory; closing connection");
					break;
				}
			}

			/* Copy the mask before we shift the queue and destroy it */
			if (mask_len > 0) {
				memcpy(mask, buf + header_len - mask_len, sizeof(mask));
			} else {
				memset(mask, 0, sizeof(mask));
			}

			/* Read frame payload from the first message in the queue into
			 * data and advance the queue by moving the memory in place. */
			DEBUG_ASSERT(body_len >= header_len);
			if (data_len + (uint64_t)header_len > (uint64_t)body_len) {
				mop = buf[0]; /* current mask and opcode */
				/* Overflow case */
				len = body_len - header_len;
				memcpy(data, buf + header_len, len);
				error = 0;
				while ((uint64_t)len < data_len) {
					n = pull_inner(NULL,
					               conn,
					               (char *)(data + len),
					               (int)(data_len - len),
					               timeout);
					if (n <= -2) {
						error = 1;
						break;
					} else if (n > 0) {
						len += (size_t)n;
					} else {
						/* Timeout: should retry */
						/* TODO: retry condition */
					}
				}
				if (error) {
					mg_cry_internal(
					    conn,
					    "%s",
					    "Websocket pull failed; closing connection");
					if (data != mem) {
						mg_free(data);
					}
					break;
				}

				conn->data_len = conn->request_len;

			} else {

				mop = buf[0]; /* current mask and opcode, overwritten by
				               * memmove() */

				/* Length of the message being read at the front of the
				 * queue. Cast to 31 bit is OK, since we limited
				 * data_len before. */
				len = (size_t)data_len + header_len;

				/* Copy the data payload into the data pointer for the
				 * callback. Cast to 31 bit is OK, since we
				 * limited data_len */
				memcpy(data, buf + header_len, (size_t)data_len);

				/* Move the queue forward len bytes */
				memmove(buf, buf + len, body_len - len);

				/* Mark the queue as advanced */
				conn->data_len -= (int)len;
			}

			/* Apply mask if necessary */
			if (mask_len > 0) {
				for (i = 0; i < (size_t)data_len; i++) {
					data[i] ^= mask[i & 3];
				}
			}

			exit_by_callback = 0;
			if (enable_ping_pong && ((mop & 0xF) == MG_WEBSOCKET_OPCODE_PONG)) {
				/* filter PONG messages */
				DEBUG_TRACE("PONG from %s:%u",
				            conn->request_info.remote_addr,
				            conn->request_info.remote_port);
				/* No unanwered PINGs left */
				ping_count = 0;
			} else if (enable_ping_pong
			           && ((mop & 0xF) == MG_WEBSOCKET_OPCODE_PING)) {
				/* reply PING messages */
				DEBUG_TRACE("Reply PING from %s:%u",
				            conn->request_info.remote_addr,
				            conn->request_info.remote_port);
				ret = mg_websocket_write(conn,
				                         MG_WEBSOCKET_OPCODE_PONG,
				                         (char *)data,
				                         (size_t)data_len);
				if (ret <= 0) {
					/* Error: send failed */
					DEBUG_TRACE("Reply PONG failed (%i)", ret);
					break;
				}


			} else {
				/* Exit the loop if callback signals to exit (server side),
				 * or "connection close" opcode received (client side). */
				if ((ws_data_handler != NULL)
				    && !ws_data_handler(conn,
				                        mop,
				                        (char *)data,
				                        (size_t)data_len,
				                        callback_data)) {
					exit_by_callback = 1;
				}
			}

			/* It a buffer has been allocated, free it again */
			if (data != mem) {
				mg_free(data);
			}

			if (exit_by_callback) {
				DEBUG_TRACE("Callback requests to close connection from %s:%u",
				            conn->request_info.remote_addr,
				            conn->request_info.remote_port);
				break;
			}
			if ((mop & 0xf) == MG_WEBSOCKET_OPCODE_CONNECTION_CLOSE) {
				/* Opcode == 8, connection close */
				DEBUG_TRACE("Message requests to close connection from %s:%u",
				            conn->request_info.remote_addr,
				            conn->request_info.remote_port);
				break;
			}

			/* Not breaking the loop, process next websocket frame. */
		} else {
			/* Read from the socket into the next available location in the
			 * message queue. */
			n = pull_inner(NULL,
			               conn,
			               conn->buf + conn->data_len,
			               conn->buf_size - conn->data_len,
			               timeout);
			if (n <= -2) {
				/* Error, no bytes read */
				DEBUG_TRACE("PULL from %s:%u failed",
				            conn->request_info.remote_addr,
				            conn->request_info.remote_port);
				break;
			}
			if (n > 0) {
				conn->data_len += n;
				/* Reset open PING count */
				ping_count = 0;
			} else {
				if (!conn->phys_ctx->stop_flag && !conn->must_close) {
					if (ping_count > MG_MAX_UNANSWERED_PING) {
						/* Stop sending PING */
						DEBUG_TRACE("Too many (%i) unanswered ping from %s:%u "
						            "- closing connection",
						            ping_count,
						            conn->request_info.remote_addr,
						            conn->request_info.remote_port);
						break;
					}
					if (enable_ping_pong) {
						/* Send Websocket PING message */
						DEBUG_TRACE("PING to %s:%u",
						            conn->request_info.remote_addr,
						            conn->request_info.remote_port);
						ret = mg_websocket_write(conn,
						                         MG_WEBSOCKET_OPCODE_PING,
						                         NULL,
						                         0);

						if (ret <= 0) {
							/* Error: send failed */
							DEBUG_TRACE("Send PING failed (%i)", ret);
							break;
						}
						ping_count++;
					}
				}
				/* Timeout: should retry */
				/* TODO: get timeout def */
			}
		}
	}

	/* Leave data processing loop */
	mg_set_thread_name("worker");
	conn->in_websocket_handling = 0;
	DEBUG_TRACE("Websocket connection %s:%u left data processing loop",
	            conn->request_info.remote_addr,
	            conn->request_info.remote_port);
}


static int
mg_websocket_write_exec(struct mg_connection *conn,
                        int opcode,
                        const char *data,
                        size_t dataLen,
                        uint32_t masking_key)
{
	unsigned char header[14];
	size_t headerLen;
	int retval;

#if defined(GCC_DIAGNOSTIC)
/* Disable spurious conversion warning for GCC */
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wconversion"
#endif

	header[0] = 0x80u | (unsigned char)((unsigned)opcode & 0xf);

#if defined(GCC_DIAGNOSTIC)
#pragma GCC diagnostic pop
#endif

	/* Frame format: http://tools.ietf.org/html/rfc6455#section-5.2 */
	if (dataLen < 126) {
		/* inline 7-bit length field */
		header[1] = (unsigned char)dataLen;
		headerLen = 2;
	} else if (dataLen <= 0xFFFF) {
		/* 16-bit length field */
		uint16_t len = htons((uint16_t)dataLen);
		header[1] = 126;
		memcpy(header + 2, &len, 2);
		headerLen = 4;
	} else {
		/* 64-bit length field */
		uint32_t len1 = htonl((uint32_t)((uint64_t)dataLen >> 32));
		uint32_t len2 = htonl((uint32_t)(dataLen & 0xFFFFFFFFu));
		header[1] = 127;
		memcpy(header + 2, &len1, 4);
		memcpy(header + 6, &len2, 4);
		headerLen = 10;
	}

	if (masking_key) {
		/* add mask */
		header[1] |= 0x80;
		memcpy(header + headerLen, &masking_key, 4);
		headerLen += 4;
	}

	/* Note that POSIX/Winsock's send() is threadsafe
	 * http://stackoverflow.com/questions/1981372/are-parallel-calls-to-send-recv-on-the-same-socket-valid
	 * but mongoose's mg_printf/mg_write is not (because of the loop in
	 * push(), although that is only a problem if the packet is large or
	 * outgoing buffer is full). */

	/* TODO: Check if this lock should be moved to user land.
	 * Currently the server sets this lock for websockets, but
	 * not for any other connection. It must be set for every
	 * conn read/written by more than one thread, no matter if
	 * it is a websocket or regular connection. */
	(void)mg_lock_connection(conn);

	retval = mg_write(conn, header, headerLen);
	if (retval != (int)headerLen) {
		/* Did not send complete header */
		retval = -1;
	} else {
		if (dataLen > 0) {
			retval = mg_write(conn, data, dataLen);
		}
		/* if dataLen == 0, the header length (2) is returned */
	}

	/* TODO: Remove this unlock as well, when lock is removed. */
	mg_unlock_connection(conn);

	return retval;
}

int
mg_websocket_write(struct mg_connection *conn,
                   int opcode,
                   const char *data,
                   size_t dataLen)
{
	return mg_websocket_write_exec(conn, opcode, data, dataLen, 0);
}


static void
mask_data(const char *in, size_t in_len, uint32_t masking_key, char *out)
{
	size_t i = 0;

	i = 0;
	if ((in_len > 3) && ((ptrdiff_t)in % 4) == 0) {
		/* Convert in 32 bit words, if data is 4 byte aligned */
		while (i < (in_len - 3)) {
			*(uint32_t *)(void *)(out + i) =
			    *(uint32_t *)(void *)(in + i) ^ masking_key;
			i += 4;
		}
	}
	if (i != in_len) {
		/* convert 1-3 remaining bytes if ((dataLen % 4) != 0)*/
		while (i < in_len) {
			*(uint8_t *)(void *)(out + i) =
			    *(uint8_t *)(void *)(in + i)
			    ^ *(((uint8_t *)&masking_key) + (i % 4));
			i++;
		}
	}
}


int
mg_websocket_client_write(struct mg_connection *conn,
                          int opcode,
                          const char *data,
                          size_t dataLen)
{
	int retval = -1;
	char *masked_data =
	    (char *)mg_malloc_ctx(((dataLen + 7) / 4) * 4, conn->phys_ctx);
	uint32_t masking_key = 0;

	if (masked_data == NULL) {
		/* Return -1 in an error case */
		mg_cry_internal(conn,
		                "%s",
		                "Cannot allocate buffer for masked websocket response: "
		                "Out of memory");
		return -1;
	}

	do {
		/* Get a masking key - but not 0 */
		masking_key = (uint32_t)get_random();
	} while (masking_key == 0);

	mask_data(data, dataLen, masking_key, masked_data);

	retval = mg_websocket_write_exec(
	    conn, opcode, masked_data, dataLen, masking_key);
	mg_free(masked_data);

	return retval;
}


static void
handle_websocket_request(struct mg_connection *conn,
                         const char *path,
                         int is_callback_resource,
                         struct mg_websocket_subprotocols *subprotocols,
                         mg_websocket_connect_handler ws_connect_handler,
                         mg_websocket_ready_handler ws_ready_handler,
                         mg_websocket_data_handler ws_data_handler,
                         mg_websocket_close_handler ws_close_handler,
                         void *cbData)
{
	const char *websock_key = mg_get_header(conn, "Sec-WebSocket-Key");
	const char *version = mg_get_header(conn, "Sec-WebSocket-Version");
	ptrdiff_t lua_websock = 0;

#if !defined(USE_LUA)
	(void)path;
#endif

	/* Step 1: Check websocket protocol version. */
	/* Step 1.1: Check Sec-WebSocket-Key. */
	if (!websock_key) {
		/* The RFC standard version (https://tools.ietf.org/html/rfc6455)
		 * requires a Sec-WebSocket-Key header.
		 */
		/* It could be the hixie draft version
		 * (http://tools.ietf.org/html/draft-hixie-thewebsocketprotocol-76).
		 */
		const char *key1 = mg_get_header(conn, "Sec-WebSocket-Key1");
		const char *key2 = mg_get_header(conn, "Sec-WebSocket-Key2");
		char key3[8];

		if ((key1 != NULL) && (key2 != NULL)) {
			/* This version uses 8 byte body data in a GET request */
			conn->content_len = 8;
			if (8 == mg_read(conn, key3, 8)) {
				/* This is the hixie version */
				mg_send_http_error(conn,
				                   426,
				                   "%s",
				                   "Protocol upgrade to RFC 6455 required");
				return;
			}
		}
		/* This is an unknown version */
		mg_send_http_error(conn, 400, "%s", "Malformed websocket request");
		return;
	}

	/* Step 1.2: Check websocket protocol version. */
	/* The RFC version (https://tools.ietf.org/html/rfc6455) is 13. */
	if ((version == NULL) || (strcmp(version, "13") != 0)) {
		/* Reject wrong versions */
		mg_send_http_error(conn, 426, "%s", "Protocol upgrade required");
		return;
	}

	/* Step 1.3: Could check for "Host", but we do not really nead this
	 * value for anything, so just ignore it. */

	/* Step 2: If a callback is responsible, call it. */
	if (is_callback_resource) {
		/* Step 2.1 check and select subprotocol */
		const char *protocols[64]; // max 64 headers
		int nbSubprotocolHeader = get_req_headers(&conn->request_info,
		                                          "Sec-WebSocket-Protocol",
		                                          protocols,
		                                          64);
		if ((nbSubprotocolHeader > 0) && subprotocols) {
			int cnt = 0;
			int idx;
			unsigned long len;
			const char *sep, *curSubProtocol,
			    *acceptedWebSocketSubprotocol = NULL;


			/* look for matching subprotocol */
			do {
				const char *protocol = protocols[cnt];

				do {
					sep = strchr(protocol, ',');
					curSubProtocol = protocol;
					len = sep ? (unsigned long)(sep - protocol)
					          : (unsigned long)strlen(protocol);
					while (sep && isspace(*++sep))
						; // ignore leading whitespaces
					protocol = sep;


					for (idx = 0; idx < subprotocols->nb_subprotocols; idx++) {
						if ((strlen(subprotocols->subprotocols[idx]) == len)
						    && (strncmp(curSubProtocol,
						                subprotocols->subprotocols[idx],
						                len)
						        == 0)) {
							acceptedWebSocketSubprotocol =
							    subprotocols->subprotocols[idx];
							break;
						}
					}
				} while (sep && !acceptedWebSocketSubprotocol);
			} while (++cnt < nbSubprotocolHeader
			         && !acceptedWebSocketSubprotocol);

			conn->request_info.acceptedWebSocketSubprotocol =
			    acceptedWebSocketSubprotocol;

		} else if (nbSubprotocolHeader > 0) {
			/* keep legacy behavior */
			const char *protocol = protocols[0];

			/* The protocol is a comma separated list of names. */
			/* The server must only return one value from this list. */
			/* First check if it is a list or just a single value. */
			const char *sep = strrchr(protocol, ',');
			if (sep == NULL) {
				/* Just a single protocol -> accept it. */
				conn->request_info.acceptedWebSocketSubprotocol = protocol;
			} else {
				/* Multiple protocols -> accept the last one. */
				/* This is just a quick fix if the client offers multiple
				 * protocols. The handler should have a list of accepted
				 * protocols on his own
				 * and use it to select one protocol among those the client
				 * has
				 * offered.
				 */
				while (isspace(*++sep)) {
					; /* ignore leading whitespaces */
				}
				conn->request_info.acceptedWebSocketSubprotocol = sep;
			}
		}

		if ((ws_connect_handler != NULL)
		    && (ws_connect_handler(conn, cbData) != 0)) {
			/* C callback has returned non-zero, do not proceed with
			 * handshake.
			 */
			/* Note that C callbacks are no longer called when Lua is
			 * responsible, so C can no longer filter callbacks for Lua. */
			return;
		}
	}

#if defined(USE_LUA)
	/* Step 3: No callback. Check if Lua is responsible. */
	else {
		/* Step 3.1: Check if Lua is responsible. */
		if (conn->dom_ctx->config[LUA_WEBSOCKET_EXTENSIONS]) {
			lua_websock = match_prefix(
			    conn->dom_ctx->config[LUA_WEBSOCKET_EXTENSIONS],
			    strlen(conn->dom_ctx->config[LUA_WEBSOCKET_EXTENSIONS]),
			    path);
		}

		if (lua_websock) {
			/* Step 3.2: Lua is responsible: call it. */
			conn->lua_websocket_state = lua_websocket_new(path, conn);
			if (!conn->lua_websocket_state) {
				/* Lua rejected the new client */
				return;
			}
		}
	}
#endif

	/* Step 4: Check if there is a responsible websocket handler. */
	if (!is_callback_resource && !lua_websock) {
		/* There is no callback, and Lua is not responsible either. */
		/* Reply with a 404 Not Found. We are still at a standard
		 * HTTP request here, before the websocket handshake, so
		 * we can still send standard HTTP error replies. */
		mg_send_http_error(conn, 404, "%s", "Not found");
		return;
	}

	/* Step 5: The websocket connection has been accepted */
	if (!send_websocket_handshake(conn, websock_key)) {
		mg_send_http_error(conn, 500, "%s", "Websocket handshake failed");
		return;
	}

	/* Step 6: Call the ready handler */
	if (is_callback_resource) {
		if (ws_ready_handler != NULL) {
			ws_ready_handler(conn, cbData);
		}
#if defined(USE_LUA)
	} else if (lua_websock) {
		if (!lua_websocket_ready(conn, conn->lua_websocket_state)) {
			/* the ready handler returned false */
			return;
		}
#endif
	}

	/* Step 7: Enter the read loop */
	if (is_callback_resource) {
		read_websocket(conn, ws_data_handler, cbData);
#if defined(USE_LUA)
	} else if (lua_websock) {
		read_websocket(conn, lua_websocket_data, conn->lua_websocket_state);
#endif
	}

	/* Step 8: Call the close handler */
	if (ws_close_handler) {
		ws_close_handler(conn, cbData);
	}
}


static int
is_websocket_protocol(const struct mg_connection *conn)
{
	const char *upgrade, *connection;

	/* A websocket protocoll has the following HTTP headers:
	 *
	 * Connection: Upgrade
	 * Upgrade: Websocket
	 */

	upgrade = mg_get_header(conn, "Upgrade");
	if (upgrade == NULL) {
		return 0; /* fail early, don't waste time checking other header
		           * fields
		           */
	}
	if (!mg_strcasestr(upgrade, "websocket")) {
		return 0;
	}

	connection = mg_get_header(conn, "Connection");
	if (connection == NULL) {
		return 0;
	}
	if (!mg_strcasestr(connection, "upgrade")) {
		return 0;
	}

	/* The headers "Host", "Sec-WebSocket-Key", "Sec-WebSocket-Protocol" and
	 * "Sec-WebSocket-Version" are also required.
	 * Don't check them here, since even an unsupported websocket protocol
	 * request still IS a websocket request (in contrast to a standard HTTP
	 * request). It will fail later in handle_websocket_request.
	 */

	return 1;
}
#endif /* !USE_WEBSOCKET */


static int
isbyte(int n)
{
	return (n >= 0) && (n <= 255);
}


static int
parse_net(const char *spec, uint32_t *net, uint32_t *mask)
{
	int n, a, b, c, d, slash = 32, len = 0;

	if (((sscanf(spec, "%d.%d.%d.%d/%d%n", &a, &b, &c, &d, &slash, &n) == 5)
	     || (sscanf(spec, "%d.%d.%d.%d%n", &a, &b, &c, &d, &n) == 4))
	    && isbyte(a) && isbyte(b) && isbyte(c) && isbyte(d) && (slash >= 0)
	    && (slash < 33)) {
		len = n;
		*net = ((uint32_t)a << 24) | ((uint32_t)b << 16) | ((uint32_t)c << 8)
		       | (uint32_t)d;
		*mask = slash ? (0xffffffffU << (32 - slash)) : 0;
	}

	return len;
}


static int
set_throttle(const char *spec, uint32_t remote_ip, const char *uri)
{
	int throttle = 0;
	struct vec vec, val;
	uint32_t net, mask;
	char mult;
	double v;

	while ((spec = next_option(spec, &vec, &val)) != NULL) {
		mult = ',';
		if ((val.ptr == NULL) || (sscanf(val.ptr, "%lf%c", &v, &mult) < 1)
		    || (v < 0)
		    || ((lowercase(&mult) != 'k') && (lowercase(&mult) != 'm')
		        && (mult != ','))) {
			continue;
		}
		v *= (lowercase(&mult) == 'k')
		         ? 1024
		         : ((lowercase(&mult) == 'm') ? 1048576 : 1);
		if (vec.len == 1 && vec.ptr[0] == '*') {
			throttle = (int)v;
		} else if (parse_net(vec.ptr, &net, &mask) > 0) {
			if ((remote_ip & mask) == net) {
				throttle = (int)v;
			}
		} else if (match_prefix(vec.ptr, vec.len, uri) > 0) {
			throttle = (int)v;
		}
	}

	return throttle;
}


static uint32_t
get_remote_ip(const struct mg_connection *conn)
{
	if (!conn) {
		return 0;
	}
	return ntohl(*(const uint32_t *)&conn->client.rsa.sin.sin_addr);
}


/* The mg_upload function is superseeded by mg_handle_form_request. */
#include "handle_form.inl"


#if defined(MG_LEGACY_INTERFACE)
/* Implement the deprecated mg_upload function by calling the new
 * mg_handle_form_request function. While mg_upload could only handle
 * HTML forms sent as POST request in multipart/form-data format
 * containing only file input elements, mg_handle_form_request can
 * handle all form input elements and all standard request methods. */
struct mg_upload_user_data {
	struct mg_connection *conn;
	const char *destination_dir;
	int num_uploaded_files;
};


/* Helper function for deprecated mg_upload. */
static int
mg_upload_field_found(const char *key,
                      const char *filename,
                      char *path,
                      size_t pathlen,
                      void *user_data)
{
	int truncated = 0;
	struct mg_upload_user_data *fud = (struct mg_upload_user_data *)user_data;
	(void)key;

	if (!filename) {
		mg_cry_internal(fud->conn, "%s: No filename set", __func__);
		return FORM_FIELD_STORAGE_ABORT;
	}
	mg_snprintf(fud->conn,
	            &truncated,
	            path,
	            pathlen - 1,
	            "%s/%s",
	            fud->destination_dir,
	            filename);
	if (truncated) {
		mg_cry_internal(fud->conn, "%s: File path too long", __func__);
		return FORM_FIELD_STORAGE_ABORT;
	}
	return FORM_FIELD_STORAGE_STORE;
}


/* Helper function for deprecated mg_upload. */
static int
mg_upload_field_get(const char *key,
                    const char *value,
                    size_t value_size,
                    void *user_data)
{
	/* Function should never be called */
	(void)key;
	(void)value;
	(void)value_size;
	(void)user_data;

	return 0;
}


/* Helper function for deprecated mg_upload. */
static int
mg_upload_field_stored(const char *path, long long file_size, void *user_data)
{
	struct mg_upload_user_data *fud = (struct mg_upload_user_data *)user_data;
	(void)file_size;

	fud->num_uploaded_files++;
	fud->conn->phys_ctx->callbacks.upload(fud->conn, path);

	return 0;
}


/* Deprecated function mg_upload - use mg_handle_form_request instead. */
int
mg_upload(struct mg_connection *conn, const char *destination_dir)
{
	struct mg_upload_user_data fud = {conn, destination_dir, 0};
	struct mg_form_data_handler fdh = {mg_upload_field_found,
	                                   mg_upload_field_get,
	                                   mg_upload_field_stored,
	                                   0};
	int ret;

	fdh.user_data = (void *)&fud;
	ret = mg_handle_form_request(conn, &fdh);

	if (ret < 0) {
		mg_cry_internal(conn, "%s: Error while parsing the request", __func__);
	}

	return fud.num_uploaded_files;
}
#endif


static int
get_first_ssl_listener_index(const struct mg_context *ctx)
{
	unsigned int i;
	int idx = -1;
	if (ctx) {
		for (i = 0; ((idx == -1) && (i < ctx->num_listening_sockets)); i++) {
			idx = ctx->listening_sockets[i].is_ssl ? ((int)(i)) : -1;
		}
	}
	return idx;
}


/* Return host (without port) */
/* Use mg_free to free the result */
static const char *
alloc_get_host(struct mg_connection *conn)
{
	char buf[1025];
	size_t buflen = sizeof(buf);
	const char *host_header = get_header(conn->request_info.http_headers,
	                                     conn->request_info.num_headers,
	                                     "Host");
	char *host;

	if (host_header != NULL) {
		char *pos;

		/* Create a local copy of the "Host" header, since it might be
		 * modified here. */
		mg_strlcpy(buf, host_header, buflen);
		buf[buflen - 1] = '\0';
		host = buf;
		while (isspace(*host)) {
			host++;
		}

		/* If the "Host" is an IPv6 address, like [::1], parse until ]
		 * is found. */
		if (*host == '[') {
			pos = strchr(host, ']');
			if (!pos) {
				/* Malformed hostname starts with '[', but no ']' found */
				DEBUG_TRACE("%s", "Host name format error '[' without ']'");
				return NULL;
			}
			/* terminate after ']' */
			pos[1] = 0;
		} else {
			/* Otherwise, a ':' separates hostname and port number */
			pos = strchr(host, ':');
			if (pos != NULL) {
				*pos = '\0';
			}
		}

		if (conn->ssl) {
			/* This is a HTTPS connection, maybe we have a hostname
			 * from SNI (set in ssl_servername_callback). */
			const char *sslhost = conn->dom_ctx->config[AUTHENTICATION_DOMAIN];
			if (sslhost && (conn->dom_ctx != &(conn->phys_ctx->dd))) {
				/* We are not using the default domain */
				if (mg_strcasecmp(host, sslhost)) {
					/* Mismatch between SNI domain and HTTP domain */
					DEBUG_TRACE("Host mismatch: SNI: %s, HTTPS: %s",
					            sslhost,
					            host);
					return NULL;
				}
			}
			DEBUG_TRACE("HTTPS Host: %s", host);

		} else {
			struct mg_domain_context *dom = &(conn->phys_ctx->dd);
			while (dom) {
				if (!mg_strcasecmp(host, dom->config[AUTHENTICATION_DOMAIN])) {

					/* Found matching domain */
					DEBUG_TRACE("HTTP domain %s found",
					            dom->config[AUTHENTICATION_DOMAIN]);

					/* TODO: Check if this is a HTTP or HTTPS domain */
					conn->dom_ctx = dom;
					break;
				}
				dom = dom->next;
			}

			DEBUG_TRACE("HTTP Host: %s", host);
		}

	} else {
		sockaddr_to_string(buf, buflen, &conn->client.lsa);
		host = buf;

		DEBUG_TRACE("IP: %s", host);
	}

	return mg_strdup_ctx(host, conn->phys_ctx);
}


static void
redirect_to_https_port(struct mg_connection *conn, int ssl_index)
{
	char target_url[MG_BUF_LEN];
	int truncated = 0;

	conn->must_close = 1;

	/* Send host, port, uri and (if it exists) ?query_string */
	if (conn->host) {

		/* Use "308 Permanent Redirect" */
		int redirect_code = 308;

		/* Create target URL */
		mg_snprintf(
		    conn,
		    &truncated,
		    target_url,
		    sizeof(target_url),
		    "https://%s:%d%s%s%s",

		    conn->host,
#if defined(USE_IPV6)
		    (conn->phys_ctx->listening_sockets[ssl_index].lsa.sa.sa_family
		     == AF_INET6)
		        ? (int)ntohs(conn->phys_ctx->listening_sockets[ssl_index]
		                         .lsa.sin6.sin6_port)
		        :
#endif
		        (int)ntohs(conn->phys_ctx->listening_sockets[ssl_index]
		                       .lsa.sin.sin_port),
		    conn->request_info.local_uri,
		    (conn->request_info.query_string == NULL) ? "" : "?",
		    (conn->request_info.query_string == NULL)
		        ? ""
		        : conn->request_info.query_string);

		/* Check overflow in location buffer (will not occur if MG_BUF_LEN
		 * is used as buffer size) */
		if (truncated) {
			mg_send_http_error(conn, 500, "%s", "Redirect URL too long");
			return;
		}

		/* Use redirect helper function */
		mg_send_http_redirect(conn, target_url, redirect_code);
	}
}


static void
handler_info_acquire(struct mg_handler_info *handler_info)
{
	pthread_mutex_lock(&handler_info->refcount_mutex);
	handler_info->refcount++;
	pthread_mutex_unlock(&handler_info->refcount_mutex);
}


static void
handler_info_release(struct mg_handler_info *handler_info)
{
	pthread_mutex_lock(&handler_info->refcount_mutex);
	handler_info->refcount--;
	pthread_cond_signal(&handler_info->refcount_cond);
	pthread_mutex_unlock(&handler_info->refcount_mutex);
}


static void
handler_info_wait_unused(struct mg_handler_info *handler_info)
{
	pthread_mutex_lock(&handler_info->refcount_mutex);
	while (handler_info->refcount) {
		pthread_cond_wait(&handler_info->refcount_cond,
		                  &handler_info->refcount_mutex);
	}
	pthread_mutex_unlock(&handler_info->refcount_mutex);
}


static void
mg_set_handler_type(struct mg_context *phys_ctx,
                    struct mg_domain_context *dom_ctx,
                    const char *uri,
                    int handler_type,
                    int is_delete_request,
                    mg_request_handler handler,
                    struct mg_websocket_subprotocols *subprotocols,
                    mg_websocket_connect_handler connect_handler,
                    mg_websocket_ready_handler ready_handler,
                    mg_websocket_data_handler data_handler,
                    mg_websocket_close_handler close_handler,
                    mg_authorization_handler auth_handler,
                    void *cbdata)
{
	struct mg_handler_info *tmp_rh, **lastref;
	size_t urilen = strlen(uri);

	if (handler_type == WEBSOCKET_HANDLER) {
		DEBUG_ASSERT(handler == NULL);
		DEBUG_ASSERT(is_delete_request || connect_handler != NULL
		             || ready_handler != NULL || data_handler != NULL
		             || close_handler != NULL);

		DEBUG_ASSERT(auth_handler == NULL);
		if (handler != NULL) {
			return;
		}
		if (!is_delete_request && (connect_handler == NULL)
		    && (ready_handler == NULL) && (data_handler == NULL)
		    && (close_handler == NULL)) {
			return;
		}
		if (auth_handler != NULL) {
			return;
		}
	} else if (handler_type == REQUEST_HANDLER) {
		DEBUG_ASSERT(connect_handler == NULL && ready_handler == NULL
		             && data_handler == NULL && close_handler == NULL);
		DEBUG_ASSERT(is_delete_request || (handler != NULL));
		DEBUG_ASSERT(auth_handler == NULL);

		if ((connect_handler != NULL) || (ready_handler != NULL)
		    || (data_handler != NULL) || (close_handler != NULL)) {
			return;
		}
		if (!is_delete_request && (handler == NULL)) {
			return;
		}
		if (auth_handler != NULL) {
			return;
		}
	} else { /* AUTH_HANDLER */
		DEBUG_ASSERT(handler == NULL);
		DEBUG_ASSERT(connect_handler == NULL && ready_handler == NULL
		             && data_handler == NULL && close_handler == NULL);
		DEBUG_ASSERT(auth_handler != NULL);
		if (handler != NULL) {
			return;
		}
		if ((connect_handler != NULL) || (ready_handler != NULL)
		    || (data_handler != NULL) || (close_handler != NULL)) {
			return;
		}
		if (!is_delete_request && (auth_handler == NULL)) {
			return;
		}
	}

	if (!phys_ctx || !dom_ctx) {
		return;
	}

	mg_lock_context(phys_ctx);

	/* first try to find an existing handler */
	lastref = &(dom_ctx->handlers);
	for (tmp_rh = dom_ctx->handlers; tmp_rh != NULL; tmp_rh = tmp_rh->next) {
		if (tmp_rh->handler_type == handler_type) {
			if ((urilen == tmp_rh->uri_len) && !strcmp(tmp_rh->uri, uri)) {
				if (!is_delete_request) {
					/* update existing handler */
					if (handler_type == REQUEST_HANDLER) {
						/* Wait for end of use before updating */
						handler_info_wait_unused(tmp_rh);

						/* Ok, the handler is no more use -> Update it */
						tmp_rh->handler = handler;
					} else if (handler_type == WEBSOCKET_HANDLER) {
						tmp_rh->subprotocols = subprotocols;
						tmp_rh->connect_handler = connect_handler;
						tmp_rh->ready_handler = ready_handler;
						tmp_rh->data_handler = data_handler;
						tmp_rh->close_handler = close_handler;
					} else { /* AUTH_HANDLER */
						tmp_rh->auth_handler = auth_handler;
					}
					tmp_rh->cbdata = cbdata;
				} else {
					/* remove existing handler */
					if (handler_type == REQUEST_HANDLER) {
						/* Wait for end of use before removing */
						handler_info_wait_unused(tmp_rh);

						/* Ok, the handler is no more used -> Destroy resources
						 */
						pthread_cond_destroy(&tmp_rh->refcount_cond);
						pthread_mutex_destroy(&tmp_rh->refcount_mutex);
					}
					*lastref = tmp_rh->next;
					mg_free(tmp_rh->uri);
					mg_free(tmp_rh);
				}
				mg_unlock_context(phys_ctx);
				return;
			}
		}
		lastref = &(tmp_rh->next);
	}

	if (is_delete_request) {
		/* no handler to set, this was a remove request to a non-existing
		 * handler */
		mg_unlock_context(phys_ctx);
		return;
	}

	tmp_rh =
	    (struct mg_handler_info *)mg_calloc_ctx(sizeof(struct mg_handler_info),
	                                            1,
	                                            phys_ctx);
	if (tmp_rh == NULL) {
		mg_unlock_context(phys_ctx);
		mg_cry_internal(fc(phys_ctx),
		                "%s",
		                "Cannot create new request handler struct, OOM");
		return;
	}
	tmp_rh->uri = mg_strdup_ctx(uri, phys_ctx);
	if (!tmp_rh->uri) {
		mg_unlock_context(phys_ctx);
		mg_free(tmp_rh);
		mg_cry_internal(fc(phys_ctx),
		                "%s",
		                "Cannot create new request handler struct, OOM");
		return;
	}
	tmp_rh->uri_len = urilen;
	if (handler_type == REQUEST_HANDLER) {
		/* Init refcount mutex and condition */
		if (0 != pthread_mutex_init(&tmp_rh->refcount_mutex, NULL)) {
			mg_unlock_context(phys_ctx);
			mg_free(tmp_rh);
			mg_cry_internal(fc(phys_ctx), "%s", "Cannot init refcount mutex");
			return;
		}
		if (0 != pthread_cond_init(&tmp_rh->refcount_cond, NULL)) {
			mg_unlock_context(phys_ctx);
			pthread_mutex_destroy(&tmp_rh->refcount_mutex);
			mg_free(tmp_rh);
			mg_cry_internal(fc(phys_ctx), "%s", "Cannot init refcount cond");
			return;
		}
		tmp_rh->refcount = 0;
		tmp_rh->handler = handler;
	} else if (handler_type == WEBSOCKET_HANDLER) {
		tmp_rh->subprotocols = subprotocols;
		tmp_rh->connect_handler = connect_handler;
		tmp_rh->ready_handler = ready_handler;
		tmp_rh->data_handler = data_handler;
		tmp_rh->close_handler = close_handler;
	} else { /* AUTH_HANDLER */
		tmp_rh->auth_handler = auth_handler;
	}
	tmp_rh->cbdata = cbdata;
	tmp_rh->handler_type = handler_type;
	tmp_rh->next = NULL;

	*lastref = tmp_rh;
	mg_unlock_context(phys_ctx);
}


void
mg_set_request_handler(struct mg_context *ctx,
                       const char *uri,
                       mg_request_handler handler,
                       void *cbdata)
{
	mg_set_handler_type(ctx,
	                    &(ctx->dd),
	                    uri,
	                    REQUEST_HANDLER,
	                    handler == NULL,
	                    handler,
	                    NULL,
	                    NULL,
	                    NULL,
	                    NULL,
	                    NULL,
	                    NULL,
	                    cbdata);
}


void
mg_set_websocket_handler(struct mg_context *ctx,
                         const char *uri,
                         mg_websocket_connect_handler connect_handler,
                         mg_websocket_ready_handler ready_handler,
                         mg_websocket_data_handler data_handler,
                         mg_websocket_close_handler close_handler,
                         void *cbdata)
{
	mg_set_websocket_handler_with_subprotocols(ctx,
	                                           uri,
	                                           NULL,
	                                           connect_handler,
	                                           ready_handler,
	                                           data_handler,
	                                           close_handler,
	                                           cbdata);
}


void
mg_set_websocket_handler_with_subprotocols(
    struct mg_context *ctx,
    const char *uri,
    struct mg_websocket_subprotocols *subprotocols,
    mg_websocket_connect_handler connect_handler,
    mg_websocket_ready_handler ready_handler,
    mg_websocket_data_handler data_handler,
    mg_websocket_close_handler close_handler,
    void *cbdata)
{
	int is_delete_request = (connect_handler == NULL) && (ready_handler == NULL)
	                        && (data_handler == NULL)
	                        && (close_handler == NULL);
	mg_set_handler_type(ctx,
	                    &(ctx->dd),
	                    uri,
	                    WEBSOCKET_HANDLER,
	                    is_delete_request,
	                    NULL,
	                    subprotocols,
	                    connect_handler,
	                    ready_handler,
	                    data_handler,
	                    close_handler,
	                    NULL,
	                    cbdata);
}


void
mg_set_auth_handler(struct mg_context *ctx,
                    const char *uri,
                    mg_request_handler handler,
                    void *cbdata)
{
	mg_set_handler_type(ctx,
	                    &(ctx->dd),
	                    uri,
	                    AUTH_HANDLER,
	                    handler == NULL,
	                    NULL,
	                    NULL,
	                    NULL,
	                    NULL,
	                    NULL,
	                    NULL,
	                    handler,
	                    cbdata);
}


static int
get_request_handler(struct mg_connection *conn,
                    int handler_type,
                    mg_request_handler *handler,
                    struct mg_websocket_subprotocols **subprotocols,
                    mg_websocket_connect_handler *connect_handler,
                    mg_websocket_ready_handler *ready_handler,
                    mg_websocket_data_handler *data_handler,
                    mg_websocket_close_handler *close_handler,
                    mg_authorization_handler *auth_handler,
                    void **cbdata,
                    struct mg_handler_info **handler_info)
{
	const struct mg_request_info *request_info = mg_get_request_info(conn);
	if (request_info) {
		const char *uri = request_info->local_uri;
		size_t urilen = strlen(uri);
		struct mg_handler_info *tmp_rh;

		if (!conn || !conn->phys_ctx || !conn->dom_ctx) {
			return 0;
		}

		mg_lock_context(conn->phys_ctx);

		/* first try for an exact match */
		for (tmp_rh = conn->dom_ctx->handlers; tmp_rh != NULL;
		     tmp_rh = tmp_rh->next) {
			if (tmp_rh->handler_type == handler_type) {
				if ((urilen == tmp_rh->uri_len) && !strcmp(tmp_rh->uri, uri)) {
					if (handler_type == WEBSOCKET_HANDLER) {
						*subprotocols = tmp_rh->subprotocols;
						*connect_handler = tmp_rh->connect_handler;
						*ready_handler = tmp_rh->ready_handler;
						*data_handler = tmp_rh->data_handler;
						*close_handler = tmp_rh->close_handler;
					} else if (handler_type == REQUEST_HANDLER) {
						*handler = tmp_rh->handler;
						/* Acquire handler and give it back */
						handler_info_acquire(tmp_rh);
						*handler_info = tmp_rh;
					} else { /* AUTH_HANDLER */
						*auth_handler = tmp_rh->auth_handler;
					}
					*cbdata = tmp_rh->cbdata;
					mg_unlock_context(conn->phys_ctx);
					return 1;
				}
			}
		}

		/* next try for a partial match, we will accept uri/something */
		for (tmp_rh = conn->dom_ctx->handlers; tmp_rh != NULL;
		     tmp_rh = tmp_rh->next) {
			if (tmp_rh->handler_type == handler_type) {
				if ((tmp_rh->uri_len < urilen) && (uri[tmp_rh->uri_len] == '/')
				    && (memcmp(tmp_rh->uri, uri, tmp_rh->uri_len) == 0)) {
					if (handler_type == WEBSOCKET_HANDLER) {
						*subprotocols = tmp_rh->subprotocols;
						*connect_handler = tmp_rh->connect_handler;
						*ready_handler = tmp_rh->ready_handler;
						*data_handler = tmp_rh->data_handler;
						*close_handler = tmp_rh->close_handler;
					} else if (handler_type == REQUEST_HANDLER) {
						*handler = tmp_rh->handler;
						/* Acquire handler and give it back */
						handler_info_acquire(tmp_rh);
						*handler_info = tmp_rh;
					} else { /* AUTH_HANDLER */
						*auth_handler = tmp_rh->auth_handler;
					}
					*cbdata = tmp_rh->cbdata;
					mg_unlock_context(conn->phys_ctx);
					return 1;
				}
			}
		}

		/* finally try for pattern match */
		for (tmp_rh = conn->dom_ctx->handlers; tmp_rh != NULL;
		     tmp_rh = tmp_rh->next) {
			if (tmp_rh->handler_type == handler_type) {
				if (match_prefix(tmp_rh->uri, tmp_rh->uri_len, uri) > 0) {
					if (handler_type == WEBSOCKET_HANDLER) {
						*subprotocols = tmp_rh->subprotocols;
						*connect_handler = tmp_rh->connect_handler;
						*ready_handler = tmp_rh->ready_handler;
						*data_handler = tmp_rh->data_handler;
						*close_handler = tmp_rh->close_handler;
					} else if (handler_type == REQUEST_HANDLER) {
						*handler = tmp_rh->handler;
						/* Acquire handler and give it back */
						handler_info_acquire(tmp_rh);
						*handler_info = tmp_rh;
					} else { /* AUTH_HANDLER */
						*auth_handler = tmp_rh->auth_handler;
					}
					*cbdata = tmp_rh->cbdata;
					mg_unlock_context(conn->phys_ctx);
					return 1;
				}
			}
		}

		mg_unlock_context(conn->phys_ctx);
	}
	return 0; /* none found */
}


/* Check if the script file is in a path, allowed for script files.
 * This can be used if uploading files is possible not only for the server
 * admin, and the upload mechanism does not check the file extension.
 */
static int
is_in_script_path(const struct mg_connection *conn, const char *path)
{
	/* TODO (Feature): Add config value for allowed script path.
	 * Default: All allowed. */
	(void)conn;
	(void)path;
	return 1;
}


#if defined(USE_WEBSOCKET) && defined(MG_LEGACY_INTERFACE)
static int
deprecated_websocket_connect_wrapper(const struct mg_connection *conn,
                                     void *cbdata)
{
	struct mg_callbacks *pcallbacks = (struct mg_callbacks *)cbdata;
	if (pcallbacks->websocket_connect) {
		return pcallbacks->websocket_connect(conn);
	}
	/* No handler set - assume "OK" */
	return 0;
}


static void
deprecated_websocket_ready_wrapper(struct mg_connection *conn, void *cbdata)
{
	struct mg_callbacks *pcallbacks = (struct mg_callbacks *)cbdata;
	if (pcallbacks->websocket_ready) {
		pcallbacks->websocket_ready(conn);
	}
}


static int
deprecated_websocket_data_wrapper(struct mg_connection *conn,
                                  int bits,
                                  char *data,
                                  size_t len,
                                  void *cbdata)
{
	struct mg_callbacks *pcallbacks = (struct mg_callbacks *)cbdata;
	if (pcallbacks->websocket_data) {
		return pcallbacks->websocket_data(conn, bits, data, len);
	}
	/* No handler set - assume "OK" */
	return 1;
}
#endif


/* This is the heart of the Civetweb's logic.
 * This function is called when the request is read, parsed and validated,
 * and Civetweb must decide what action to take: serve a file, or
 * a directory, or call embedded function, etcetera. */
static void
handle_request(struct mg_connection *conn)
{
	struct mg_request_info *ri = &conn->request_info;
	char path[PATH_MAX];
	int uri_len, ssl_index;
	int is_found = 0, is_script_resource = 0, is_websocket_request = 0,
	    is_put_or_delete_request = 0, is_callback_resource = 0;
	int i;
	struct mg_file file = STRUCT_FILE_INITIALIZER;
	mg_request_handler callback_handler = NULL;
	struct mg_handler_info *handler_info = NULL;
	struct mg_websocket_subprotocols *subprotocols;
	mg_websocket_connect_handler ws_connect_handler = NULL;
	mg_websocket_ready_handler ws_ready_handler = NULL;
	mg_websocket_data_handler ws_data_handler = NULL;
	mg_websocket_close_handler ws_close_handler = NULL;
	void *callback_data = NULL;
	mg_authorization_handler auth_handler = NULL;
	void *auth_callback_data = NULL;
	int handler_type;
	time_t curtime = time(NULL);
	char date[64];

	path[0] = 0;

	/* 1. get the request url */
	/* 1.1. split into url and query string */
	if ((conn->request_info.query_string = strchr(ri->request_uri, '?'))
	    != NULL) {
		*((char *)conn->request_info.query_string++) = '\0';
	}

	/* 1.2. do a https redirect, if required. Do not decode URIs yet. */
	if (!conn->client.is_ssl && conn->client.ssl_redir) {
		ssl_index = get_first_ssl_listener_index(conn->phys_ctx);
		if (ssl_index >= 0) {
			redirect_to_https_port(conn, ssl_index);
		} else {
			/* A http to https forward port has been specified,
			 * but no https port to forward to. */
			mg_send_http_error(conn,
			                   503,
			                   "%s",
			                   "Error: SSL forward not configured properly");
			mg_cry_internal(conn,
			                "%s",
			                "Can not redirect to SSL, no SSL port available");
		}
		return;
	}
	uri_len = (int)strlen(ri->local_uri);

	/* 1.3. decode url (if config says so) */
	if (should_decode_url(conn)) {
		mg_url_decode(
		    ri->local_uri, uri_len, (char *)ri->local_uri, uri_len + 1, 0);
	}

	/* 1.4. clean URIs, so a path like allowed_dir/../forbidden_file is
	 * not possible */
	remove_double_dots_and_double_slashes((char *)ri->local_uri);

	/* step 1. completed, the url is known now */
	uri_len = (int)strlen(ri->local_uri);
	DEBUG_TRACE("URL: %s", ri->local_uri);

	/* 2. if this ip has limited speed, set it for this connection */
	conn->throttle = set_throttle(conn->dom_ctx->config[THROTTLE],
	                              get_remote_ip(conn),
	                              ri->local_uri);

	/* 3. call a "handle everything" callback, if registered */
	if (conn->phys_ctx->callbacks.begin_request != NULL) {
		/* Note that since V1.7 the "begin_request" function is called
		 * before an authorization check. If an authorization check is
		 * required, use a request_handler instead. */
		i = conn->phys_ctx->callbacks.begin_request(conn);
		if (i > 0) {
			/* callback already processed the request. Store the
			   return value as a status code for the access log. */
			conn->status_code = i;
			discard_unread_request_data(conn);
			return;
		} else if (i == 0) {
			/* civetweb should process the request */
		} else {
			/* unspecified - may change with the next version */
			return;
		}
	}

	/* request not yet handled by a handler or redirect, so the request
	 * is processed here */

	/* 4. Check for CORS preflight requests and handle them (if configured).
	 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
	 */
	if (!strcmp(ri->request_method, "OPTIONS")) {
		/* Send a response to CORS preflights only if
		 * access_control_allow_methods is not NULL and not an empty string.
		 * In this case, scripts can still handle CORS. */
		const char *cors_meth_cfg =
		    conn->dom_ctx->config[ACCESS_CONTROL_ALLOW_METHODS];
		const char *cors_orig_cfg =
		    conn->dom_ctx->config[ACCESS_CONTROL_ALLOW_ORIGIN];
		const char *cors_origin =
		    get_header(ri->http_headers, ri->num_headers, "Origin");
		const char *cors_acrm = get_header(ri->http_headers,
		                                   ri->num_headers,
		                                   "Access-Control-Request-Method");

		/* Todo: check if cors_origin is in cors_orig_cfg.
		 * Or, let the client check this. */

		if ((cors_meth_cfg != NULL) && (*cors_meth_cfg != 0)
		    && (cors_orig_cfg != NULL) && (*cors_orig_cfg != 0)
		    && (cors_origin != NULL) && (cors_acrm != NULL)) {
			/* This is a valid CORS preflight, and the server is configured
			 * to
			 * handle it automatically. */
			const char *cors_acrh =
			    get_header(ri->http_headers,
			               ri->num_headers,
			               "Access-Control-Request-Headers");

			gmt_time_string(date, sizeof(date), &curtime);
			mg_printf(conn,
			          "HTTP/1.1 200 OK\r\n"
			          "Date: %s\r\n"
			          "Access-Control-Allow-Origin: %s\r\n"
			          "Access-Control-Allow-Methods: %s\r\n"
			          "Content-Length: 0\r\n"
			          "Connection: %s\r\n",
			          date,
			          cors_orig_cfg,
			          ((cors_meth_cfg[0] == '*') ? cors_acrm : cors_meth_cfg),
			          suggest_connection_header(conn));

			if (cors_acrh != NULL) {
				/* CORS request is asking for additional headers */
				const char *cors_hdr_cfg =
				    conn->dom_ctx->config[ACCESS_CONTROL_ALLOW_HEADERS];

				if ((cors_hdr_cfg != NULL) && (*cors_hdr_cfg != 0)) {
					/* Allow only if access_control_allow_headers is
					 * not NULL and not an empty string. If this
					 * configuration is set to *, allow everything.
					 * Otherwise this configuration must be a list
					 * of allowed HTTP header names. */
					mg_printf(conn,
					          "Access-Control-Allow-Headers: %s\r\n",
					          ((cors_hdr_cfg[0] == '*') ? cors_acrh
					                                    : cors_hdr_cfg));
				}
			}
			mg_printf(conn, "Access-Control-Max-Age: 60\r\n");

			mg_printf(conn, "\r\n");
			return;
		}
	}

	/* 5. interpret the url to find out how the request must be handled
	 */
	/* 5.1. first test, if the request targets the regular http(s)://
	 * protocol namespace or the websocket ws(s):// protocol namespace.
	 */
	is_websocket_request = is_websocket_protocol(conn);
#if defined(USE_WEBSOCKET)
	handler_type = is_websocket_request ? WEBSOCKET_HANDLER : REQUEST_HANDLER;
#else
	handler_type = REQUEST_HANDLER;
#endif /* defined(USE_WEBSOCKET) */
	/* 5.2. check if the request will be handled by a callback */
	if (get_request_handler(conn,
	                        handler_type,
	                        &callback_handler,
	                        &subprotocols,
	                        &ws_connect_handler,
	                        &ws_ready_handler,
	                        &ws_data_handler,
	                        &ws_close_handler,
	                        NULL,
	                        &callback_data,
	                        &handler_info)) {
		/* 5.2.1. A callback will handle this request. All requests
		 * handled
		 * by a callback have to be considered as requests to a script
		 * resource. */
		is_callback_resource = 1;
		is_script_resource = 1;
		is_put_or_delete_request = is_put_or_delete_method(conn);
	} else {
	no_callback_resource:

		/* 5.2.2. No callback is responsible for this request. The URI
		 * addresses a file based resource (static content or Lua/cgi
		 * scripts in the file system). */
		is_callback_resource = 0;
		interpret_uri(conn,
		              path,
		              sizeof(path),
		              &file.stat,
		              &is_found,
		              &is_script_resource,
		              &is_websocket_request,
		              &is_put_or_delete_request);
	}

	/* 6. authorization check */
	/* 6.1. a custom authorization handler is installed */
	if (get_request_handler(conn,
	                        AUTH_HANDLER,
	                        NULL,
	                        NULL,
	                        NULL,
	                        NULL,
	                        NULL,
	                        NULL,
	                        &auth_handler,
	                        &auth_callback_data,
	                        NULL)) {
		if (!auth_handler(conn, auth_callback_data)) {
			return;
		}
	} else if (is_put_or_delete_request && !is_script_resource
	           && !is_callback_resource) {
/* 6.2. this request is a PUT/DELETE to a real file */
/* 6.2.1. thus, the server must have real files */
#if defined(NO_FILES)
		if (1) {
#else
		if (conn->dom_ctx->config[DOCUMENT_ROOT] == NULL) {
#endif
			/* This server does not have any real files, thus the
			 * PUT/DELETE methods are not valid. */
			mg_send_http_error(conn,
			                   405,
			                   "%s method not allowed",
			                   conn->request_info.request_method);
			return;
		}

#if !defined(NO_FILES)
		/* 6.2.2. Check if put authorization for static files is
		 * available.
		 */
		if (!is_authorized_for_put(conn)) {
			send_authorization_request(conn, NULL);
			return;
		}
#endif

	} else {
		/* 6.3. This is either a OPTIONS, GET, HEAD or POST request,
		 * or it is a PUT or DELETE request to a resource that does not
		 * correspond to a file. Check authorization. */
		if (!check_authorization(conn, path)) {
			send_authorization_request(conn, NULL);
			return;
		}
	}

	/* request is authorized or does not need authorization */

	/* 7. check if there are request handlers for this uri */
	if (is_callback_resource) {
		if (!is_websocket_request) {
			i = callback_handler(conn, callback_data);

			/* Callback handler will not be used anymore. Release it */
			handler_info_release(handler_info);

			if (i > 0) {
				/* Do nothing, callback has served the request. Store
				 * then return value as status code for the log and discard
				 * all data from the client not used by the callback. */
				conn->status_code = i;
				discard_unread_request_data(conn);
			} else {
				/* The handler did NOT handle the request. */
				/* Some proper reactions would be:
				 * a) close the connections without sending anything
				 * b) send a 404 not found
				 * c) try if there is a file matching the URI
				 * It would be possible to do a, b or c in the callback
				 * implementation, and return 1 - we cannot do anything
				 * here, that is not possible in the callback.
				 *
				 * TODO: What would be the best reaction here?
				 * (Note: The reaction may change, if there is a better
				 *idea.)
				 */

				/* For the moment, use option c: We look for a proper file,
				 * but since a file request is not always a script resource,
				 * the authorization check might be different. */
				interpret_uri(conn,
				              path,
				              sizeof(path),
				              &file.stat,
				              &is_found,
				              &is_script_resource,
				              &is_websocket_request,
				              &is_put_or_delete_request);
				callback_handler = NULL;

				/* Here we are at a dead end:
				 * According to URI matching, a callback should be
				 * responsible for handling the request,
				 * we called it, but the callback declared itself
				 * not responsible.
				 * We use a goto here, to get out of this dead end,
				 * and continue with the default handling.
				 * A goto here is simpler and better to understand
				 * than some curious loop. */
				goto no_callback_resource;
			}
		} else {
#if defined(USE_WEBSOCKET)
			handle_websocket_request(conn,
			                         path,
			                         is_callback_resource,
			                         subprotocols,
			                         ws_connect_handler,
			                         ws_ready_handler,
			                         ws_data_handler,
			                         ws_close_handler,
			                         callback_data);
#endif
		}
		return;
	}

/* 8. handle websocket requests */
#if defined(USE_WEBSOCKET)
	if (is_websocket_request) {
		if (is_script_resource) {

			if (is_in_script_path(conn, path)) {
				/* Websocket Lua script */
				handle_websocket_request(conn,
				                         path,
				                         0 /* Lua Script */,
				                         NULL,
				                         NULL,
				                         NULL,
				                         NULL,
				                         NULL,
				                         conn->phys_ctx->user_data);
			} else {
				/* Script was in an illegal path */
				mg_send_http_error(conn, 403, "%s", "Forbidden");
			}
		} else {
#if defined(MG_LEGACY_INTERFACE)
			handle_websocket_request(
			    conn,
			    path,
			    !is_script_resource /* could be deprecated global callback */,
			    NULL,
			    deprecated_websocket_connect_wrapper,
			    deprecated_websocket_ready_wrapper,
			    deprecated_websocket_data_wrapper,
			    NULL,
			    conn->phys_ctx->user_data);
#else
			mg_send_http_error(conn, 404, "%s", "Not found");
#endif
		}
		return;
	} else
#endif

#if defined(NO_FILES)
		/* 9a. In case the server uses only callbacks, this uri is
		 * unknown.
		 * Then, all request handling ends here. */
		mg_send_http_error(conn, 404, "%s", "Not Found");

#else
	/* 9b. This request is either for a static file or resource handled
	 * by a script file. Thus, a DOCUMENT_ROOT must exist. */
	if (conn->dom_ctx->config[DOCUMENT_ROOT] == NULL) {
		mg_send_http_error(conn, 404, "%s", "Not Found");
		return;
	}

	/* 10. Request is handled by a script */
	if (is_script_resource) {
		handle_file_based_request(conn, path, &file);
		return;
	}

	/* 11. Handle put/delete/mkcol requests */
	if (is_put_or_delete_request) {
		/* 11.1. PUT method */
		if (!strcmp(ri->request_method, "PUT")) {
			put_file(conn, path);
			return;
		}
		/* 11.2. DELETE method */
		if (!strcmp(ri->request_method, "DELETE")) {
			delete_file(conn, path);
			return;
		}
		/* 11.3. MKCOL method */
		if (!strcmp(ri->request_method, "MKCOL")) {
			mkcol(conn, path);
			return;
		}
		/* 11.4. PATCH method
		 * This method is not supported for static resources,
		 * only for scripts (Lua, CGI) and callbacks. */
		mg_send_http_error(conn,
		                   405,
		                   "%s method not allowed",
		                   conn->request_info.request_method);
		return;
	}

	/* 11. File does not exist, or it was configured that it should be
	 * hidden */
	if (!is_found || (must_hide_file(conn, path))) {
		mg_send_http_error(conn, 404, "%s", "Not found");
		return;
	}

	/* 12. Directory uris should end with a slash */
	if (file.stat.is_directory && (uri_len > 0)
	    && (ri->local_uri[uri_len - 1] != '/')) {
		gmt_time_string(date, sizeof(date), &curtime);
		mg_printf(conn,
		          "HTTP/1.1 301 Moved Permanently\r\n"
		          "Location: %s/\r\n"
		          "Date: %s\r\n"
		          /* "Cache-Control: private\r\n" (= default) */
		          "Content-Length: 0\r\n"
		          "Connection: %s\r\n",
		          ri->request_uri,
		          date,
		          suggest_connection_header(conn));
		send_additional_header(conn);
		mg_printf(conn, "\r\n");
		return;
	}

	/* 13. Handle other methods than GET/HEAD */
	/* 13.1. Handle PROPFIND */
	if (!strcmp(ri->request_method, "PROPFIND")) {
		handle_propfind(conn, path, &file.stat);
		return;
	}
	/* 13.2. Handle OPTIONS for files */
	if (!strcmp(ri->request_method, "OPTIONS")) {
		/* This standard handler is only used for real files.
		 * Scripts should support the OPTIONS method themselves, to allow a
		 * maximum flexibility.
		 * Lua and CGI scripts may fully support CORS this way (including
		 * preflights). */
		send_options(conn);
		return;
	}
	/* 13.3. everything but GET and HEAD (e.g. POST) */
	if ((0 != strcmp(ri->request_method, "GET"))
	    && (0 != strcmp(ri->request_method, "HEAD"))) {
		mg_send_http_error(conn,
		                   405,
		                   "%s method not allowed",
		                   conn->request_info.request_method);
		return;
	}

	/* 14. directories */
	if (file.stat.is_directory) {
		/* Substitute files have already been handled above. */
		/* Here we can either generate and send a directory listing,
		 * or send an "access denied" error. */
		if (!mg_strcasecmp(conn->dom_ctx->config[ENABLE_DIRECTORY_LISTING],
		                   "yes")) {
			handle_directory_request(conn, path);
		} else {
			mg_send_http_error(conn,
			                   403,
			                   "%s",
			                   "Error: Directory listing denied");
		}
		return;
	}

	/* 15. read a normal file with GET or HEAD */
	handle_file_based_request(conn, path, &file);
#endif /* !defined(NO_FILES) */
}


static void
handle_file_based_request(struct mg_connection *conn,
                          const char *path,
                          struct mg_file *file)
{
	if (!conn || !conn->dom_ctx) {
		return;
	}

	if (0) {
#if defined(USE_LUA)
	} else if (match_prefix(
	               conn->dom_ctx->config[LUA_SERVER_PAGE_EXTENSIONS],
	               strlen(conn->dom_ctx->config[LUA_SERVER_PAGE_EXTENSIONS]),
	               path)
	           > 0) {
		if (is_in_script_path(conn, path)) {
			/* Lua server page: an SSI like page containing mostly plain
			 * html
			 * code
			 * plus some tags with server generated contents. */
			handle_lsp_request(conn, path, file, NULL);
		} else {
			/* Script was in an illegal path */
			mg_send_http_error(conn, 403, "%s", "Forbidden");
		}

	} else if (match_prefix(conn->dom_ctx->config[LUA_SCRIPT_EXTENSIONS],
	                        strlen(
	                            conn->dom_ctx->config[LUA_SCRIPT_EXTENSIONS]),
	                        path)
	           > 0) {
		if (is_in_script_path(conn, path)) {
			/* Lua in-server module script: a CGI like script used to
			 * generate
			 * the
			 * entire reply. */
			mg_exec_lua_script(conn, path, NULL);
		} else {
			/* Script was in an illegal path */
			mg_send_http_error(conn, 403, "%s", "Forbidden");
		}
#endif
#if defined(USE_DUKTAPE)
	} else if (match_prefix(
	               conn->dom_ctx->config[DUKTAPE_SCRIPT_EXTENSIONS],
	               strlen(conn->dom_ctx->config[DUKTAPE_SCRIPT_EXTENSIONS]),
	               path)
	           > 0) {
		if (is_in_script_path(conn, path)) {
			/* Call duktape to generate the page */
			mg_exec_duktape_script(conn, path);
		} else {
			/* Script was in an illegal path */
			mg_send_http_error(conn, 403, "%s", "Forbidden");
		}
#endif
#if !defined(NO_CGI)
	} else if (match_prefix(conn->dom_ctx->config[CGI_EXTENSIONS],
	                        strlen(conn->dom_ctx->config[CGI_EXTENSIONS]),
	                        path)
	           > 0) {
		if (is_in_script_path(conn, path)) {
			/* CGI scripts may support all HTTP methods */
			handle_cgi_request(conn, path);
		} else {
			/* Script was in an illegal path */
			mg_send_http_error(conn, 403, "%s", "Forbidden");
		}
#endif /* !NO_CGI */
	} else if (match_prefix(conn->dom_ctx->config[SSI_EXTENSIONS],
	                        strlen(conn->dom_ctx->config[SSI_EXTENSIONS]),
	                        path)
	           > 0) {
		if (is_in_script_path(conn, path)) {
			handle_ssi_file_request(conn, path, file);
		} else {
			/* Script was in an illegal path */
			mg_send_http_error(conn, 403, "%s", "Forbidden");
		}
#if !defined(NO_CACHING)
	} else if ((!conn->in_error_handler)
	           && is_not_modified(conn, &file->stat)) {
		/* Send 304 "Not Modified" - this must not send any body data */
		handle_not_modified_static_file_request(conn, file);
#endif /* !NO_CACHING */
	} else {
		handle_static_file_request(conn, path, file, NULL, NULL);
	}
}


static void
close_all_listening_sockets(struct mg_context *ctx)
{
	unsigned int i;
	if (!ctx) {
		return;
	}

	for (i = 0; i < ctx->num_listening_sockets; i++) {
		closesocket(ctx->listening_sockets[i].sock);
		ctx->listening_sockets[i].sock = INVALID_SOCKET;
	}
	mg_free(ctx->listening_sockets);
	ctx->listening_sockets = NULL;
	mg_free(ctx->listening_socket_fds);
	ctx->listening_socket_fds = NULL;
}


/* Valid listening port specification is: [ip_address:]port[s]
 * Examples for IPv4: 80, 443s, 127.0.0.1:3128, 192.0.2.3:8080s
 * Examples for IPv6: [::]:80, [::1]:80,
 *   [2001:0db8:7654:3210:FEDC:BA98:7654:3210]:443s
 *   see https://tools.ietf.org/html/rfc3513#section-2.2
 * In order to bind to both, IPv4 and IPv6, you can either add
 * both ports using 8080,[::]:8080, or the short form +8080.
 * Both forms differ in detail: 8080,[::]:8080 create two sockets,
 * one only accepting IPv4 the other only IPv6. +8080 creates
 * one socket accepting IPv4 and IPv6. Depending on the IPv6
 * environment, they might work differently, or might not work
 * at all - it must be tested what options work best in the
 * relevant network environment.
 */
static int
parse_port_string(const struct vec *vec, struct socket *so, int *ip_version)
{
	unsigned int a, b, c, d, port;
	int ch, len;
	const char *cb;
#if defined(USE_IPV6)
	char buf[100] = {0};
#endif

	/* MacOS needs that. If we do not zero it, subsequent bind() will fail.
	 * Also, all-zeroes in the socket address means binding to all addresses
	 * for both IPv4 and IPv6 (INADDR_ANY and IN6ADDR_ANY_INIT). */
	memset(so, 0, sizeof(*so));
	so->lsa.sin.sin_family = AF_INET;
	*ip_version = 0;

	/* Initialize port and len as invalid. */
	port = 0;
	len = 0;

	/* Test for different ways to format this string */
	if (sscanf(vec->ptr, "%u.%u.%u.%u:%u%n", &a, &b, &c, &d, &port, &len)
	    == 5) {
		/* Bind to a specific IPv4 address, e.g. 192.168.1.5:8080 */
		so->lsa.sin.sin_addr.s_addr =
		    htonl((a << 24) | (b << 16) | (c << 8) | d);
		so->lsa.sin.sin_port = htons((uint16_t)port);
		*ip_version = 4;

#if defined(USE_IPV6)
	} else if (sscanf(vec->ptr, "[%49[^]]]:%u%n", buf, &port, &len) == 2
	           && mg_inet_pton(
	                  AF_INET6, buf, &so->lsa.sin6, sizeof(so->lsa.sin6))) {
		/* IPv6 address, examples: see above */
		/* so->lsa.sin6.sin6_family = AF_INET6; already set by mg_inet_pton
		 */
		so->lsa.sin6.sin6_port = htons((uint16_t)port);
		*ip_version = 6;
#endif

	} else if ((vec->ptr[0] == '+')
	           && (sscanf(vec->ptr + 1, "%u%n", &port, &len) == 1)) {

		/* Port is specified with a +, bind to IPv6 and IPv4, INADDR_ANY */
		/* Add 1 to len for the + character we skipped before */
		len++;

#if defined(USE_IPV6)
		/* Set socket family to IPv6, do not use IPV6_V6ONLY */
		so->lsa.sin6.sin6_family = AF_INET6;
		so->lsa.sin6.sin6_port = htons((uint16_t)port);
		*ip_version = 4 + 6;
#else
		/* Bind to IPv4 only, since IPv6 is not built in. */
		so->lsa.sin.sin_port = htons((uint16_t)port);
		*ip_version = 4;
#endif

	} else if (sscanf(vec->ptr, "%u%n", &port, &len) == 1) {
		/* If only port is specified, bind to IPv4, INADDR_ANY */
		so->lsa.sin.sin_port = htons((uint16_t)port);
		*ip_version = 4;

	} else if ((cb = strchr(vec->ptr, ':')) != NULL) {
		/* String could be a hostname. This check algotithm
		 * will only work for RFC 952 compliant hostnames,
		 * starting with a letter, containing only letters,
		 * digits and hyphen ('-'). Newer specs may allow
		 * more, but this is not guaranteed here, since it
		 * may interfere with rules for port option lists. */

		/* According to RFC 1035, hostnames are restricted to 255 characters
		 * in total (63 between two dots). */
		char hostname[256];
		size_t hostnlen = (size_t)(cb - vec->ptr);

		if (hostnlen >= sizeof(hostname)) {
			/* This would be invalid in any case */
			*ip_version = 0;
			return 0;
		}

		memcpy(hostname, vec->ptr, hostnlen);
		hostname[hostnlen] = 0;

		if (mg_inet_pton(
		        AF_INET, vec->ptr, &so->lsa.sin, sizeof(so->lsa.sin))) {
			if (sscanf(cb + 1, "%u%n", &port, &len) == 1) {
				*ip_version = 4;
				so->lsa.sin.sin_family = AF_INET;
				so->lsa.sin.sin_port = htons((uint16_t)port);
				len += (int)(hostnlen + 1);
			} else {
				port = 0;
				len = 0;
			}
#if defined(USE_IPV6)
		} else if (mg_inet_pton(AF_INET6,
		                        vec->ptr,
		                        &so->lsa.sin6,
		                        sizeof(so->lsa.sin6))) {
			if (sscanf(cb + 1, "%u%n", &port, &len) == 1) {
				*ip_version = 6;
				so->lsa.sin6.sin6_family = AF_INET6;
				so->lsa.sin.sin_port = htons((uint16_t)port);
				len += (int)(hostnlen + 1);
			} else {
				port = 0;
				len = 0;
			}
#endif
		}


	} else {
		/* Parsing failure. */
	}

	/* sscanf and the option splitting code ensure the following condition
	 */
	if ((len < 0) && ((unsigned)len > (unsigned)vec->len)) {
		*ip_version = 0;
		return 0;
	}
	ch = vec->ptr[len]; /* Next character after the port number */
	so->is_ssl = (ch == 's');
	so->ssl_redir = (ch == 'r');

	/* Make sure the port is valid and vector ends with 's', 'r' or ',' */
	if (is_valid_port(port)
	    && ((ch == '\0') || (ch == 's') || (ch == 'r') || (ch == ','))) {
		return 1;
	}

	/* Reset ip_version to 0 if there is an error */
	*ip_version = 0;
	return 0;
}


/* Is there any SSL port in use? */
static int
is_ssl_port_used(const char *ports)
{
	if (ports) {
		/* There are several different allowed syntax variants:
		 * - "80" for a single port using every network interface
		 * - "localhost:80" for a single port using only localhost
		 * - "80,localhost:8080" for two ports, one bound to localhost
		 * - "80,127.0.0.1:8084,[::1]:8086" for three ports, one bound
		 *   to IPv4 localhost, one to IPv6 localhost
		 * - "+80" use port 80 for IPv4 and IPv6
		 * - "+80r,+443s" port 80 (HTTP) is a redirect to port 443 (HTTPS),
		 *   for both: IPv4 and IPv4
		 * - "+443s,localhost:8080" port 443 (HTTPS) for every interface,
		 *   additionally port 8080 bound to localhost connections
		 *
		 * If we just look for 's' anywhere in the string, "localhost:80"
		 * will be detected as SSL (false positive).
		 * Looking for 's' after a digit may cause false positives in
		 * "my24service:8080".
		 * Looking from 's' backward if there are only ':' and numbers
		 * before will not work for "24service:8080" (non SSL, port 8080)
		 * or "24s" (SSL, port 24).
		 *
		 * Remark: Initially hostnames were not allowed to start with a
		 * digit (according to RFC 952), this was allowed later (RFC 1123,
		 * Section 2.1).
		 *
		 * To get this correct, the entire string must be parsed as a whole,
		 * reading it as a list element for element and parsing with an
		 * algorithm equivalent to parse_port_string.
		 *
		 * In fact, we use local interface names here, not arbitrary hostnames,
		 * so in most cases the only name will be "localhost".
		 *
		 * So, for now, we use this simple algorithm, that may still return
		 * a false positive in bizarre cases.
		 */
		int i;
		int portslen = (int)strlen(ports);
		char prevIsNumber = 0;

		for (i = 0; i < portslen; i++) {
			if (prevIsNumber && (ports[i] == 's' || ports[i] == 'r')) {
				return 1;
			}
			if (ports[i] >= '0' && ports[i] <= '9') {
				prevIsNumber = 1;
			} else {
				prevIsNumber = 0;
			}
		}
	}
	return 0;
}


static int
set_ports_option(struct mg_context *phys_ctx)
{
	const char *list;
	int on = 1;
#if defined(USE_IPV6)
	int off = 0;
#endif
	struct vec vec;
	struct socket so, *ptr;

	struct pollfd *pfd;
	union usa usa;
	socklen_t len;
	int ip_version;

	int portsTotal = 0;
	int portsOk = 0;

	if (!phys_ctx) {
		return 0;
	}

	memset(&so, 0, sizeof(so));
	memset(&usa, 0, sizeof(usa));
	len = sizeof(usa);
	list = phys_ctx->dd.config[LISTENING_PORTS];

	while ((list = next_option(list, &vec, NULL)) != NULL) {

		portsTotal++;

		if (!parse_port_string(&vec, &so, &ip_version)) {
			mg_cry_internal(
			    fc(phys_ctx),
			    "%.*s: invalid port spec (entry %i). Expecting list of: %s",
			    (int)vec.len,
			    vec.ptr,
			    portsTotal,
			    "[IP_ADDRESS:]PORT[s|r]");
			continue;
		}

#if !defined(NO_SSL)
		if (so.is_ssl && phys_ctx->dd.ssl_ctx == NULL) {

			mg_cry_internal(fc(phys_ctx),
			                "Cannot add SSL socket (entry %i)",
			                portsTotal);
			continue;
		}
#endif

		if ((so.sock = socket(so.lsa.sa.sa_family, SOCK_STREAM, 6))
		    == INVALID_SOCKET) {

			mg_cry_internal(fc(phys_ctx),
			                "cannot create socket (entry %i)",
			                portsTotal);
			continue;
		}

#if defined(_WIN32)
		/* Windows SO_REUSEADDR lets many procs binds to a
		 * socket, SO_EXCLUSIVEADDRUSE makes the bind fail
		 * if someone already has the socket -- DTL */
		/* NOTE: If SO_EXCLUSIVEADDRUSE is used,
		 * Windows might need a few seconds before
		 * the same port can be used again in the
		 * same process, so a short Sleep may be
		 * required between mg_stop and mg_start.
		 */
		if (setsockopt(so.sock,
		               SOL_SOCKET,
		               SO_EXCLUSIVEADDRUSE,
		               (SOCK_OPT_TYPE)&on,
		               sizeof(on))
		    != 0) {

			/* Set reuse option, but don't abort on errors. */
			mg_cry_internal(
			    fc(phys_ctx),
			    "cannot set socket option SO_EXCLUSIVEADDRUSE (entry %i)",
			    portsTotal);
		}
#else
		if (setsockopt(so.sock,
		               SOL_SOCKET,
		               SO_REUSEADDR,
		               (SOCK_OPT_TYPE)&on,
		               sizeof(on))
		    != 0) {

			/* Set reuse option, but don't abort on errors. */
			mg_cry_internal(fc(phys_ctx),
			                "cannot set socket option SO_REUSEADDR (entry %i)",
			                portsTotal);
		}
#endif

		if (ip_version > 4) {
/* Could be 6 for IPv6 onlyor 10 (4+6) for IPv4+IPv6 */
#if defined(USE_IPV6)
			if (ip_version > 6) {
				if (so.lsa.sa.sa_family == AF_INET6
				    && setsockopt(so.sock,
				                  IPPROTO_IPV6,
				                  IPV6_V6ONLY,
				                  (void *)&off,
				                  sizeof(off))
				           != 0) {

					/* Set IPv6 only option, but don't abort on errors. */
					mg_cry_internal(
					    fc(phys_ctx),
					    "cannot set socket option IPV6_V6ONLY=off (entry %i)",
					    portsTotal);
				}
			} else {
				if (so.lsa.sa.sa_family == AF_INET6
				    && setsockopt(so.sock,
				                  IPPROTO_IPV6,
				                  IPV6_V6ONLY,
				                  (void *)&on,
				                  sizeof(on))
				           != 0) {

					/* Set IPv6 only option, but don't abort on errors. */
					mg_cry_internal(
					    fc(phys_ctx),
					    "cannot set socket option IPV6_V6ONLY=on (entry %i)",
					    portsTotal);
				}
			}
#else
			mg_cry_internal(fc(phys_ctx), "%s", "IPv6 not available");
			closesocket(so.sock);
			so.sock = INVALID_SOCKET;
			continue;
#endif
		}

		if (so.lsa.sa.sa_family == AF_INET) {

			len = sizeof(so.lsa.sin);
			if (bind(so.sock, &so.lsa.sa, len) != 0) {
				mg_cry_internal(fc(phys_ctx),
				                "cannot bind to %.*s: %d (%s)",
				                (int)vec.len,
				                vec.ptr,
				                (int)ERRNO,
				                strerror(errno));
				closesocket(so.sock);
				so.sock = INVALID_SOCKET;
				continue;
			}
		}
#if defined(USE_IPV6)
		else if (so.lsa.sa.sa_family == AF_INET6) {

			len = sizeof(so.lsa.sin6);
			if (bind(so.sock, &so.lsa.sa, len) != 0) {
				mg_cry_internal(fc(phys_ctx),
				                "cannot bind to IPv6 %.*s: %d (%s)",
				                (int)vec.len,
				                vec.ptr,
				                (int)ERRNO,
				                strerror(errno));
				closesocket(so.sock);
				so.sock = INVALID_SOCKET;
				continue;
			}
		}
#endif
		else {
			mg_cry_internal(
			    fc(phys_ctx),
			    "cannot bind: address family not supported (entry %i)",
			    portsTotal);
			closesocket(so.sock);
			so.sock = INVALID_SOCKET;
			continue;
		}

		if (listen(so.sock, SOMAXCONN) != 0) {

			mg_cry_internal(fc(phys_ctx),
			                "cannot listen to %.*s: %d (%s)",
			                (int)vec.len,
			                vec.ptr,
			                (int)ERRNO,
			                strerror(errno));
			closesocket(so.sock);
			so.sock = INVALID_SOCKET;
			continue;
		}

		if ((getsockname(so.sock, &(usa.sa), &len) != 0)
		    || (usa.sa.sa_family != so.lsa.sa.sa_family)) {

			int err = (int)ERRNO;
			mg_cry_internal(fc(phys_ctx),
			                "call to getsockname failed %.*s: %d (%s)",
			                (int)vec.len,
			                vec.ptr,
			                err,
			                strerror(errno));
			closesocket(so.sock);
			so.sock = INVALID_SOCKET;
			continue;
		}

/* Update lsa port in case of random free ports */
#if defined(USE_IPV6)
		if (so.lsa.sa.sa_family == AF_INET6) {
			so.lsa.sin6.sin6_port = usa.sin6.sin6_port;
		} else
#endif
		{
			so.lsa.sin.sin_port = usa.sin.sin_port;
		}

		if ((ptr = (struct socket *)
		         mg_realloc_ctx(phys_ctx->listening_sockets,
		                        (phys_ctx->num_listening_sockets + 1)
		                            * sizeof(phys_ctx->listening_sockets[0]),
		                        phys_ctx))
		    == NULL) {

			mg_cry_internal(fc(phys_ctx), "%s", "Out of memory");
			closesocket(so.sock);
			so.sock = INVALID_SOCKET;
			continue;
		}

		if ((pfd = (struct pollfd *)
		         mg_realloc_ctx(phys_ctx->listening_socket_fds,
		                        (phys_ctx->num_listening_sockets + 1)
		                            * sizeof(phys_ctx->listening_socket_fds[0]),
		                        phys_ctx))
		    == NULL) {

			mg_cry_internal(fc(phys_ctx), "%s", "Out of memory");
			closesocket(so.sock);
			so.sock = INVALID_SOCKET;
			mg_free(ptr);
			continue;
		}

		set_close_on_exec(so.sock, fc(phys_ctx));
		phys_ctx->listening_sockets = ptr;
		phys_ctx->listening_sockets[phys_ctx->num_listening_sockets] = so;
		phys_ctx->listening_socket_fds = pfd;
		phys_ctx->num_listening_sockets++;
		portsOk++;
	}

	if (portsOk != portsTotal) {
		close_all_listening_sockets(phys_ctx);
		portsOk = 0;
	}

	return portsOk;
}


static const char *
header_val(const struct mg_connection *conn, const char *header)
{
	const char *header_value;

	if ((header_value = mg_get_header(conn, header)) == NULL) {
		return "-";
	} else {
		return header_value;
	}
}


#if defined(MG_EXTERNAL_FUNCTION_log_access)
static void log_access(const struct mg_connection *conn);
#include "external_log_access.inl"
#else

static void
log_access(const struct mg_connection *conn)
{
	const struct mg_request_info *ri;
	struct mg_file fi;
	char date[64], src_addr[IP_ADDR_STR_LEN];
	struct tm *tm;

	const char *referer;
	const char *user_agent;

	char buf[4096];

	if (!conn || !conn->dom_ctx) {
		return;
	}

	if (conn->dom_ctx->config[ACCESS_LOG_FILE] != NULL) {
		if (mg_fopen(conn,
		             conn->dom_ctx->config[ACCESS_LOG_FILE],
		             MG_FOPEN_MODE_APPEND,
		             &fi)
		    == 0) {
			fi.access.fp = NULL;
		}
	} else {
		fi.access.fp = NULL;
	}

	/* Log is written to a file and/or a callback. If both are not set,
	 * executing the rest of the function is pointless. */
	if ((fi.access.fp == NULL)
	    && (conn->phys_ctx->callbacks.log_access == NULL)) {
		return;
	}

	tm = localtime(&conn->conn_birth_time);
	if (tm != NULL) {
		strftime(date, sizeof(date), "%d/%b/%Y:%H:%M:%S %z", tm);
	} else {
		mg_strlcpy(date, "01/Jan/1970:00:00:00 +0000", sizeof(date));
		date[sizeof(date) - 1] = '\0';
	}

	ri = &conn->request_info;

	sockaddr_to_string(src_addr, sizeof(src_addr), &conn->client.rsa);
	referer = header_val(conn, "Referer");
	user_agent = header_val(conn, "User-Agent");

	mg_snprintf(conn,
	            NULL, /* Ignore truncation in access log */
	            buf,
	            sizeof(buf),
	            "%s - %s [%s] \"%s %s%s%s HTTP/%s\" %d %" INT64_FMT " %s %s",
	            src_addr,
	            (ri->remote_user == NULL) ? "-" : ri->remote_user,
	            date,
	            ri->request_method ? ri->request_method : "-",
	            ri->request_uri ? ri->request_uri : "-",
	            ri->query_string ? "?" : "",
	            ri->query_string ? ri->query_string : "",
	            ri->http_version,
	            conn->status_code,
	            conn->num_bytes_sent,
	            referer,
	            user_agent);

	if (conn->phys_ctx->callbacks.log_access) {
		conn->phys_ctx->callbacks.log_access(conn, buf);
	}

	if (fi.access.fp) {
		int ok = 1;
		flockfile(fi.access.fp);
		if (fprintf(fi.access.fp, "%s\n", buf) < 1) {
			ok = 0;
		}
		if (fflush(fi.access.fp) != 0) {
			ok = 0;
		}
		funlockfile(fi.access.fp);
		if (mg_fclose(&fi.access) != 0) {
			ok = 0;
		}
		if (!ok) {
			mg_cry_internal(conn,
			                "Error writing log file %s",
			                conn->dom_ctx->config[ACCESS_LOG_FILE]);
		}
	}
}

#endif /* Externally provided function */


/* Verify given socket address against the ACL.
 * Return -1 if ACL is malformed, 0 if address is disallowed, 1 if allowed.
 */
static int
check_acl(struct mg_context *phys_ctx, uint32_t remote_ip)
{
	int allowed, flag;
	uint32_t net, mask;
	struct vec vec;

	if (phys_ctx) {
		const char *list = phys_ctx->dd.config[ACCESS_CONTROL_LIST];

		/* If any ACL is set, deny by default */
		allowed = (list == NULL) ? '+' : '-';

		while ((list = next_option(list, &vec, NULL)) != NULL) {
			flag = vec.ptr[0];
			if ((flag != '+' && flag != '-')
			    || (parse_net(&vec.ptr[1], &net, &mask) == 0)) {
				mg_cry_internal(fc(phys_ctx),
				                "%s: subnet must be [+|-]x.x.x.x[/x]",
				                __func__);
				return -1;
			}

			if (net == (remote_ip & mask)) {
				allowed = flag;
			}
		}

		return allowed == '+';
	}
	return -1;
}


#if !defined(_WIN32)
static int
set_uid_option(struct mg_context *phys_ctx)
{
	int success = 0;

	if (phys_ctx) {
		/* We are currently running as curr_uid. */
		const uid_t curr_uid = getuid();
		/* If set, we want to run as run_as_user. */
		const char *run_as_user = phys_ctx->dd.config[RUN_AS_USER];
		const struct passwd *to_pw = NULL;

		if (run_as_user != NULL && (to_pw = getpwnam(run_as_user)) == NULL) {
			/* run_as_user does not exist on the system. We can't proceed
			 * further. */
			mg_cry_internal(fc(phys_ctx),
			                "%s: unknown user [%s]",
			                __func__,
			                run_as_user);
		} else if (run_as_user == NULL || curr_uid == to_pw->pw_uid) {
			/* There was either no request to change user, or we're already
			 * running as run_as_user. Nothing else to do.
			 */
			success = 1;
		} else {
			/* Valid change request.  */
			if (setgid(to_pw->pw_gid) == -1) {
				mg_cry_internal(fc(phys_ctx),
				                "%s: setgid(%s): %s",
				                __func__,
				                run_as_user,
				                strerror(errno));
			} else if (setgroups(0, NULL) == -1) {
				mg_cry_internal(fc(phys_ctx),
				                "%s: setgroups(): %s",
				                __func__,
				                strerror(errno));
			} else if (setuid(to_pw->pw_uid) == -1) {
				mg_cry_internal(fc(phys_ctx),
				                "%s: setuid(%s): %s",
				                __func__,
				                run_as_user,
				                strerror(errno));
			} else {
				success = 1;
			}
		}
	}

	return success;
}
#endif /* !_WIN32 */


static void
tls_dtor(void *key)
{
	struct mg_workerTLS *tls = (struct mg_workerTLS *)key;
	/* key == pthread_getspecific(sTlsKey); */

	if (tls) {
		if (tls->is_master == 2) {
			tls->is_master = -3; /* Mark memory as dead */
			mg_free(tls);
		}
	}
	pthread_setspecific(sTlsKey, NULL);
}


#if !defined(NO_SSL)

static int ssl_use_pem_file(struct mg_context *phys_ctx,
                            struct mg_domain_context *dom_ctx,
                            const char *pem,
                            const char *chain);
static const char *ssl_error(void);


static int
refresh_trust(struct mg_connection *conn)
{
	static int reload_lock = 0;
	static long int data_check = 0;
	volatile int *p_reload_lock = (volatile int *)&reload_lock;

	struct stat cert_buf;
	long int t;
	const char *pem;
	const char *chain;
	int should_verify_peer;

	if ((pem = conn->dom_ctx->config[SSL_CERTIFICATE]) == NULL) {
		/* If peem is NULL and conn->phys_ctx->callbacks.init_ssl is not,
		 * refresh_trust still can not work. */
		return 0;
	}
	chain = conn->dom_ctx->config[SSL_CERTIFICATE_CHAIN];
	if (chain == NULL) {
		/* pem is not NULL here */
		chain = pem;
	}
	if (*chain == 0) {
		chain = NULL;
	}

	t = data_check;
	if (stat(pem, &cert_buf) != -1) {
		t = (long int)cert_buf.st_mtime;
	}

	if (data_check != t) {
		data_check = t;

		should_verify_peer = 0;
		if (conn->dom_ctx->config[SSL_DO_VERIFY_PEER] != NULL) {
			if (mg_strcasecmp(conn->dom_ctx->config[SSL_DO_VERIFY_PEER], "yes")
			    == 0) {
				should_verify_peer = 1;
			} else if (mg_strcasecmp(conn->dom_ctx->config[SSL_DO_VERIFY_PEER],
			                         "optional")
			           == 0) {
				should_verify_peer = 1;
			}
		}

		if (should_verify_peer) {
			char *ca_path = conn->dom_ctx->config[SSL_CA_PATH];
			char *ca_file = conn->dom_ctx->config[SSL_CA_FILE];
			if (SSL_CTX_load_verify_locations(conn->dom_ctx->ssl_ctx,
			                                  ca_file,
			                                  ca_path)
			    != 1) {
				mg_cry_internal(
				    fc(conn->phys_ctx),
				    "SSL_CTX_load_verify_locations error: %s "
				    "ssl_verify_peer requires setting "
				    "either ssl_ca_path or ssl_ca_file. Is any of them "
				    "present in "
				    "the .conf file?",
				    ssl_error());
				return 0;
			}
		}

		if (1 == mg_atomic_inc(p_reload_lock)) {
			if (ssl_use_pem_file(conn->phys_ctx, conn->dom_ctx, pem, chain)
			    == 0) {
				return 0;
			}
			*p_reload_lock = 0;
		}
	}
	/* lock while cert is reloading */
	while (*p_reload_lock) {
		sleep(1);
	}

	return 1;
}

#if defined(OPENSSL_API_1_1)
#else
static pthread_mutex_t *ssl_mutexes;
#endif /* OPENSSL_API_1_1 */

static int
sslize(struct mg_connection *conn,
       SSL_CTX *s,
       int (*func)(SSL *),
       volatile int *stop_server)
{
	int ret, err;
	int short_trust;
	unsigned i;

	if (!conn) {
		return 0;
	}

	short_trust =
	    (conn->dom_ctx->config[SSL_SHORT_TRUST] != NULL)
	    && (mg_strcasecmp(conn->dom_ctx->config[SSL_SHORT_TRUST], "yes") == 0);

	if (short_trust) {
		int trust_ret = refresh_trust(conn);
		if (!trust_ret) {
			return trust_ret;
		}
	}

	conn->ssl = SSL_new(s);
	if (conn->ssl == NULL) {
		return 0;
	}
	SSL_set_app_data(conn->ssl, (char *)conn);

	ret = SSL_set_fd(conn->ssl, conn->client.sock);
	if (ret != 1) {
		err = SSL_get_error(conn->ssl, ret);
		mg_cry_internal(conn, "SSL error %i, destroying SSL context", err);
		SSL_free(conn->ssl);
		conn->ssl = NULL;
/* Avoid CRYPTO_cleanup_all_ex_data(); See discussion:
 * https://wiki.openssl.org/index.php/Talk:Library_Initialization */
#if !defined(OPENSSL_API_1_1)
		ERR_remove_state(0);
#endif
		return 0;
	}

	/* SSL functions may fail and require to be called again:
	 * see https://www.openssl.org/docs/manmaster/ssl/SSL_get_error.html
	 * Here "func" could be SSL_connect or SSL_accept. */
	for (i = 16; i <= 1024; i *= 2) {
		ret = func(conn->ssl);
		if (ret != 1) {
			err = SSL_get_error(conn->ssl, ret);
			if ((err == SSL_ERROR_WANT_CONNECT)
			    || (err == SSL_ERROR_WANT_ACCEPT)
			    || (err == SSL_ERROR_WANT_READ) || (err == SSL_ERROR_WANT_WRITE)
			    || (err == SSL_ERROR_WANT_X509_LOOKUP)) {
				/* Need to retry the function call "later".
				 * See https://linux.die.net/man/3/ssl_get_error
				 * This is typical for non-blocking sockets. */
				if (*stop_server) {
					/* Don't wait if the server is going to be stopped. */
					break;
				}
				mg_sleep(i);

			} else if (err == SSL_ERROR_SYSCALL) {
				/* This is an IO error. Look at errno. */
				err = errno;
				mg_cry_internal(conn, "SSL syscall error %i", err);
				break;

			} else {
				/* This is an SSL specific error, e.g. SSL_ERROR_SSL */
				mg_cry_internal(conn, "sslize error: %s", ssl_error());
				break;
			}

		} else {
			/* success */
			break;
		}
	}

	if (ret != 1) {
		SSL_free(conn->ssl);
		conn->ssl = NULL;
/* Avoid CRYPTO_cleanup_all_ex_data(); See discussion:
 * https://wiki.openssl.org/index.php/Talk:Library_Initialization */
#if !defined(OPENSSL_API_1_1)
		ERR_remove_state(0);
#endif
		return 0;
	}

	return 1;
}


/* Return OpenSSL error message (from CRYPTO lib) */
static const char *
ssl_error(void)
{
	unsigned long err;
	err = ERR_get_error();
	return ((err == 0) ? "" : ERR_error_string(err, NULL));
}


static int
hexdump2string(void *mem, int memlen, char *buf, int buflen)
{
	int i;
	const char hexdigit[] = "0123456789abcdef";

	if ((memlen <= 0) || (buflen <= 0)) {
		return 0;
	}
	if (buflen < (3 * memlen)) {
		return 0;
	}

	for (i = 0; i < memlen; i++) {
		if (i > 0) {
			buf[3 * i - 1] = ' ';
		}
		buf[3 * i] = hexdigit[(((uint8_t *)mem)[i] >> 4) & 0xF];
		buf[3 * i + 1] = hexdigit[((uint8_t *)mem)[i] & 0xF];
	}
	buf[3 * memlen - 1] = 0;

	return 1;
}


static void
ssl_get_client_cert_info(struct mg_connection *conn)
{
	X509 *cert = SSL_get_peer_certificate(conn->ssl);
	if (cert) {
		char str_subject[1024];
		char str_issuer[1024];
		char str_finger[1024];
		unsigned char buf[256];
		char *str_serial = NULL;
		unsigned int ulen;
		int ilen;
		unsigned char *tmp_buf;
		unsigned char *tmp_p;

		/* Handle to algorithm used for fingerprint */
		const EVP_MD *digest = EVP_get_digestbyname("sha1");

		/* Get Subject and issuer */
		X509_NAME *subj = X509_get_subject_name(cert);
		X509_NAME *iss = X509_get_issuer_name(cert);

		/* Get serial number */
		ASN1_INTEGER *serial = X509_get_serialNumber(cert);

		/* Translate serial number to a hex string */
		BIGNUM *serial_bn = ASN1_INTEGER_to_BN(serial, NULL);
		str_serial = BN_bn2hex(serial_bn);
		BN_free(serial_bn);

		/* Translate subject and issuer to a string */
		(void)X509_NAME_oneline(subj, str_subject, (int)sizeof(str_subject));
		(void)X509_NAME_oneline(iss, str_issuer, (int)sizeof(str_issuer));

		/* Calculate SHA1 fingerprint and store as a hex string */
		ulen = 0;

		/* ASN1_digest is deprecated. Do the calculation manually,
		 * using EVP_Digest. */
		ilen = i2d_X509(cert, NULL);
		tmp_buf = (ilen > 0)
		              ? (unsigned char *)mg_malloc_ctx((unsigned)ilen + 1,
		                                               conn->phys_ctx)
		              : NULL;
		if (tmp_buf) {
			tmp_p = tmp_buf;
			(void)i2d_X509(cert, &tmp_p);
			if (!EVP_Digest(
			        tmp_buf, (unsigned)ilen, buf, &ulen, digest, NULL)) {
				ulen = 0;
			}
			mg_free(tmp_buf);
		}

		if (!hexdump2string(
		        buf, (int)ulen, str_finger, (int)sizeof(str_finger))) {
			*str_finger = 0;
		}

		conn->request_info.client_cert = (struct mg_client_cert *)
		    mg_malloc_ctx(sizeof(struct mg_client_cert), conn->phys_ctx);
		if (conn->request_info.client_cert) {
			conn->request_info.client_cert->peer_cert = (void *)cert;
			conn->request_info.client_cert->subject =
			    mg_strdup_ctx(str_subject, conn->phys_ctx);
			conn->request_info.client_cert->issuer =
			    mg_strdup_ctx(str_issuer, conn->phys_ctx);
			conn->request_info.client_cert->serial =
			    mg_strdup_ctx(str_serial, conn->phys_ctx);
			conn->request_info.client_cert->finger =
			    mg_strdup_ctx(str_finger, conn->phys_ctx);
		} else {
			mg_cry_internal(conn,
			                "%s",
			                "Out of memory: Cannot allocate memory for client "
			                "certificate");
		}

		/* Strings returned from bn_bn2hex must be freed using OPENSSL_free,
		 * see https://linux.die.net/man/3/bn_bn2hex */
		OPENSSL_free(str_serial);
	}
}


#if defined(OPENSSL_API_1_1)
#else
static void
ssl_locking_callback(int mode, int mutex_num, const char *file, int line)
{
	(void)line;
	(void)file;

	if (mode & 1) {
		/* 1 is CRYPTO_LOCK */
		(void)pthread_mutex_lock(&ssl_mutexes[mutex_num]);
	} else {
		(void)pthread_mutex_unlock(&ssl_mutexes[mutex_num]);
	}
}
#endif /* OPENSSL_API_1_1 */


#if !defined(NO_SSL_DL)
static void *
load_dll(char *ebuf, size_t ebuf_len, const char *dll_name, struct ssl_func *sw)
{
	union {
		void *p;
		void (*fp)(void);
	} u;
	void *dll_handle;
	struct ssl_func *fp;
	int ok;
	int truncated = 0;

	if ((dll_handle = dlopen(dll_name, RTLD_LAZY)) == NULL) {
		mg_snprintf(NULL,
		            NULL, /* No truncation check for ebuf */
		            ebuf,
		            ebuf_len,
		            "%s: cannot load %s",
		            __func__,
		            dll_name);
		return NULL;
	}

	ok = 1;
	for (fp = sw; fp->name != NULL; fp++) {
#if defined(_WIN32)
		/* GetProcAddress() returns pointer to function */
		u.fp = (void (*)(void))dlsym(dll_handle, fp->name);
#else
		/* dlsym() on UNIX returns void *. ISO C forbids casts of data
		 * pointers to function pointers. We need to use a union to make a
		 * cast. */
		u.p = dlsym(dll_handle, fp->name);
#endif /* _WIN32 */
		if (u.fp == NULL) {
			if (ok) {
				mg_snprintf(NULL,
				            &truncated,
				            ebuf,
				            ebuf_len,
				            "%s: %s: cannot find %s",
				            __func__,
				            dll_name,
				            fp->name);
				ok = 0;
			} else {
				size_t cur_len = strlen(ebuf);
				if (!truncated) {
					mg_snprintf(NULL,
					            &truncated,
					            ebuf + cur_len,
					            ebuf_len - cur_len - 3,
					            ", %s",
					            fp->name);
					if (truncated) {
						/* If truncated, add "..." */
						strcat(ebuf, "...");
					}
				}
			}
			/* Debug:
			 * printf("Missing function: %s\n", fp->name); */
		} else {
			fp->ptr = u.fp;
		}
	}

	if (!ok) {
		(void)dlclose(dll_handle);
		return NULL;
	}

	return dll_handle;
}


static void *ssllib_dll_handle;    /* Store the ssl library handle. */
static void *cryptolib_dll_handle; /* Store the crypto library handle. */

#endif /* NO_SSL_DL */


#if defined(SSL_ALREADY_INITIALIZED)
static int cryptolib_users = 1; /* Reference counter for crypto library. */
#else
static int cryptolib_users = 0; /* Reference counter for crypto library. */
#endif


static int
initialize_ssl(char *ebuf, size_t ebuf_len)
{
#if defined(OPENSSL_API_1_1)
	if (ebuf_len > 0) {
		ebuf[0] = 0;
	}

#if !defined(NO_SSL_DL)
	if (!cryptolib_dll_handle) {
		cryptolib_dll_handle = load_dll(ebuf, ebuf_len, CRYPTO_LIB, crypto_sw);
		if (!cryptolib_dll_handle) {
			mg_snprintf(NULL,
			            NULL, /* No truncation check for ebuf */
			            ebuf,
			            ebuf_len,
			            "%s: error loading library %s",
			            __func__,
			            CRYPTO_LIB);
			DEBUG_TRACE("%s", ebuf);
			return 0;
		}
	}
#endif /* NO_SSL_DL */

	if (mg_atomic_inc(&cryptolib_users) > 1) {
		return 1;
	}

#else /* not OPENSSL_API_1_1 */
	int i, num_locks;
	size_t size;

	if (ebuf_len > 0) {
		ebuf[0] = 0;
	}

#if !defined(NO_SSL_DL)
	if (!cryptolib_dll_handle) {
		cryptolib_dll_handle = load_dll(ebuf, ebuf_len, CRYPTO_LIB, crypto_sw);
		if (!cryptolib_dll_handle) {
			mg_snprintf(NULL,
			            NULL, /* No truncation check for ebuf */
			            ebuf,
			            ebuf_len,
			            "%s: error loading library %s",
			            __func__,
			            CRYPTO_LIB);
			DEBUG_TRACE("%s", ebuf);
			return 0;
		}
	}
#endif /* NO_SSL_DL */

	if (mg_atomic_inc(&cryptolib_users) > 1) {
		return 1;
	}

	/* Initialize locking callbacks, needed for thread safety.
	 * http://www.openssl.org/support/faq.html#PROG1
	 */
	num_locks = CRYPTO_num_locks();
	if (num_locks < 0) {
		num_locks = 0;
	}
	size = sizeof(pthread_mutex_t) * ((size_t)(num_locks));

	/* allocate mutex array, if required */
	if (num_locks == 0) {
		/* No mutex array required */
		ssl_mutexes = NULL;
	} else {
		/* Mutex array required - allocate it */
		ssl_mutexes = (pthread_mutex_t *)mg_malloc(size);

		/* Check OOM */
		if (ssl_mutexes == NULL) {
			mg_snprintf(NULL,
			            NULL, /* No truncation check for ebuf */
			            ebuf,
			            ebuf_len,
			            "%s: cannot allocate mutexes: %s",
			            __func__,
			            ssl_error());
			DEBUG_TRACE("%s", ebuf);
			return 0;
		}

		/* initialize mutex array */
		for (i = 0; i < num_locks; i++) {
			if (0 != pthread_mutex_init(&ssl_mutexes[i], &pthread_mutex_attr)) {
				mg_snprintf(NULL,
				            NULL, /* No truncation check for ebuf */
				            ebuf,
				            ebuf_len,
				            "%s: error initializing mutex %i of %i",
				            __func__,
				            i,
				            num_locks);
				DEBUG_TRACE("%s", ebuf);
				mg_free(ssl_mutexes);
				return 0;
			}
		}
	}

	CRYPTO_set_locking_callback(&ssl_locking_callback);
	CRYPTO_set_id_callback(&mg_current_thread_id);
#endif /* OPENSSL_API_1_1 */

#if !defined(NO_SSL_DL)
	if (!ssllib_dll_handle) {
		ssllib_dll_handle = load_dll(ebuf, ebuf_len, SSL_LIB, ssl_sw);
		if (!ssllib_dll_handle) {
#if !defined(OPENSSL_API_1_1)
			mg_free(ssl_mutexes);
#endif
			DEBUG_TRACE("%s", ebuf);
			return 0;
		}
	}
#endif /* NO_SSL_DL */

#if defined(OPENSSL_API_1_1)
	/* Initialize SSL library */
	OPENSSL_init_ssl(0, NULL);
	OPENSSL_init_ssl(OPENSSL_INIT_LOAD_SSL_STRINGS
	                     | OPENSSL_INIT_LOAD_CRYPTO_STRINGS,
	                 NULL);
#else
	/* Initialize SSL library */
	SSL_library_init();
	SSL_load_error_strings();
#endif

	return 1;
}


static int
ssl_use_pem_file(struct mg_context *phys_ctx,
                 struct mg_domain_context *dom_ctx,
                 const char *pem,
                 const char *chain)
{
	if (SSL_CTX_use_certificate_file(dom_ctx->ssl_ctx, pem, 1) == 0) {
		mg_cry_internal(fc(phys_ctx),
		                "%s: cannot open certificate file %s: %s",
		                __func__,
		                pem,
		                ssl_error());
		return 0;
	}

	/* could use SSL_CTX_set_default_passwd_cb_userdata */
	if (SSL_CTX_use_PrivateKey_file(dom_ctx->ssl_ctx, pem, 1) == 0) {
		mg_cry_internal(fc(phys_ctx),
		                "%s: cannot open private key file %s: %s",
		                __func__,
		                pem,
		                ssl_error());
		return 0;
	}

	if (SSL_CTX_check_private_key(dom_ctx->ssl_ctx) == 0) {
		mg_cry_internal(fc(phys_ctx),
		                "%s: certificate and private key do not match: %s",
		                __func__,
		                pem);
		return 0;
	}

	/* In contrast to OpenSSL, wolfSSL does not support certificate
	 * chain files that contain private keys and certificates in
	 * SSL_CTX_use_certificate_chain_file.
	 * The CivetWeb-Server used pem-Files that contained both information.
	 * In order to make wolfSSL work, it is split in two files.
	 * One file that contains key and certificate used by the server and
	 * an optional chain file for the ssl stack.
	 */
	if (chain) {
		if (SSL_CTX_use_certificate_chain_file(dom_ctx->ssl_ctx, chain) == 0) {
			mg_cry_internal(fc(phys_ctx),
			                "%s: cannot use certificate chain file %s: %s",
			                __func__,
			                pem,
			                ssl_error());
			return 0;
		}
	}
	return 1;
}


#if defined(OPENSSL_API_1_1)
static unsigned long
ssl_get_protocol(int version_id)
{
	long unsigned ret = (long unsigned)SSL_OP_ALL;
	if (version_id > 0)
		ret |= SSL_OP_NO_SSLv2;
	if (version_id > 1)
		ret |= SSL_OP_NO_SSLv3;
	if (version_id > 2)
		ret |= SSL_OP_NO_TLSv1;
	if (version_id > 3)
		ret |= SSL_OP_NO_TLSv1_1;
	return ret;
}
#else
static long
ssl_get_protocol(int version_id)
{
	long ret = (long)SSL_OP_ALL;
	if (version_id > 0)
		ret |= SSL_OP_NO_SSLv2;
	if (version_id > 1)
		ret |= SSL_OP_NO_SSLv3;
	if (version_id > 2)
		ret |= SSL_OP_NO_TLSv1;
	if (version_id > 3)
		ret |= SSL_OP_NO_TLSv1_1;
	return ret;
}
#endif /* OPENSSL_API_1_1 */


/* SSL callback documentation:
 * https://www.openssl.org/docs/man1.1.0/ssl/SSL_set_info_callback.html
 * https://wiki.openssl.org/index.php/Manual:SSL_CTX_set_info_callback(3)
 * https://linux.die.net/man/3/ssl_set_info_callback */
/* Note: There is no "const" for the first argument in the documentation,
 * however some (maybe most, but not all) headers of OpenSSL versions /
 * OpenSSL compatibility layers have it. Having a different definition
 * will cause a warning in C and an error in C++. With inconsitent
 * definitions of this function, having a warning in one version or
 * another is unavoidable. */
static void
ssl_info_callback(SSL *ssl, int what, int ret)
{
	(void)ret;

	if (what & SSL_CB_HANDSHAKE_START) {
		SSL_get_app_data(ssl);
	}
	if (what & SSL_CB_HANDSHAKE_DONE) {
		/* TODO: check for openSSL 1.1 */
		//#define SSL3_FLAGS_NO_RENEGOTIATE_CIPHERS 0x0001
		// ssl->s3->flags |= SSL3_FLAGS_NO_RENEGOTIATE_CIPHERS;
	}
}


static int
ssl_servername_callback(SSL *ssl, int *ad, void *arg)
{
	struct mg_context *ctx = (struct mg_context *)arg;
	struct mg_domain_context *dom =
	    (struct mg_domain_context *)ctx ? &(ctx->dd) : NULL;

#if defined(GCC_DIAGNOSTIC)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wcast-align"
#endif /* defined(GCC_DIAGNOSTIC) */

	/* We used an aligned pointer in SSL_set_app_data */
	struct mg_connection *conn = (struct mg_connection *)SSL_get_app_data(ssl);

#if defined(GCC_DIAGNOSTIC)
#pragma GCC diagnostic pop
#endif /* defined(GCC_DIAGNOSTIC) */

	const char *servername = SSL_get_servername(ssl, TLSEXT_NAMETYPE_host_name);

	(void)ad;

	if ((ctx == NULL) || (conn->phys_ctx == ctx)) {
		DEBUG_TRACE("%s", "internal error - assertion failed");
		return SSL_TLSEXT_ERR_NOACK;
	}

	/* Old clients (Win XP) will not support SNI. Then, there
	 * is no server name available in the request - we can
	 * only work with the default certificate.
	 * Multiple HTTPS hosts on one IP+port are only possible
	 * with a certificate containing all alternative names.
	 */
	if ((servername == NULL) || (*servername == 0)) {
		DEBUG_TRACE("%s", "SSL connection not supporting SNI");
		conn->dom_ctx = &(ctx->dd);
		SSL_set_SSL_CTX(ssl, conn->dom_ctx->ssl_ctx);
		return SSL_TLSEXT_ERR_NOACK;
	}

	DEBUG_TRACE("TLS connection to host %s", servername);

	while (dom) {
		if (!mg_strcasecmp(servername, dom->config[AUTHENTICATION_DOMAIN])) {

			/* Found matching domain */
			DEBUG_TRACE("TLS domain %s found",
			            dom->config[AUTHENTICATION_DOMAIN]);
			SSL_set_SSL_CTX(ssl, dom->ssl_ctx);
			conn->dom_ctx = dom;
			return SSL_TLSEXT_ERR_OK;
		}
		dom = dom->next;
	}

	/* Default domain */
	DEBUG_TRACE("TLS default domain %s used",
	            ctx->dd.config[AUTHENTICATION_DOMAIN]);
	conn->dom_ctx = &(ctx->dd);
	SSL_set_SSL_CTX(ssl, conn->dom_ctx->ssl_ctx);
	return SSL_TLSEXT_ERR_OK;
}


/* Setup SSL CTX as required by CivetWeb */
static int
init_ssl_ctx_impl(struct mg_context *phys_ctx,
                  struct mg_domain_context *dom_ctx,
                  const char *pem,
                  const char *chain)
{
	int callback_ret;
	int should_verify_peer;
	int peer_certificate_optional;
	const char *ca_path;
	const char *ca_file;
	int use_default_verify_paths;
	int verify_depth;
	struct timespec now_mt;
	md5_byte_t ssl_context_id[16];
	md5_state_t md5state;
	int protocol_ver;

#if defined(OPENSSL_API_1_1)
	if ((dom_ctx->ssl_ctx = SSL_CTX_new(TLS_server_method())) == NULL) {
		mg_cry_internal(fc(phys_ctx),
		                "SSL_CTX_new (server) error: %s",
		                ssl_error());
		return 0;
	}
#else
	if ((dom_ctx->ssl_ctx = SSL_CTX_new(SSLv23_server_method())) == NULL) {
		mg_cry_internal(fc(phys_ctx),
		                "SSL_CTX_new (server) error: %s",
		                ssl_error());
		return 0;
	}
#endif /* OPENSSL_API_1_1 */

	SSL_CTX_clear_options(dom_ctx->ssl_ctx,
	                      SSL_OP_NO_SSLv2 | SSL_OP_NO_SSLv3 | SSL_OP_NO_TLSv1
	                          | SSL_OP_NO_TLSv1_1);
	protocol_ver = atoi(dom_ctx->config[SSL_PROTOCOL_VERSION]);
	SSL_CTX_set_options(dom_ctx->ssl_ctx, ssl_get_protocol(protocol_ver));
	SSL_CTX_set_options(dom_ctx->ssl_ctx, SSL_OP_SINGLE_DH_USE);
	SSL_CTX_set_options(dom_ctx->ssl_ctx, SSL_OP_CIPHER_SERVER_PREFERENCE);
	SSL_CTX_set_options(dom_ctx->ssl_ctx,
	                    SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION);
	SSL_CTX_set_options(dom_ctx->ssl_ctx, SSL_OP_NO_COMPRESSION);
#if !defined(NO_SSL_DL)
	SSL_CTX_set_ecdh_auto(dom_ctx->ssl_ctx, 1);
#endif /* NO_SSL_DL */

#if defined(__clang__)
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wincompatible-pointer-types"
#endif
#if defined(GCC_DIAGNOSTIC)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wincompatible-pointer-types"
#endif
	/* Depending on the OpenSSL version, the callback may be
	 * 'void (*)(SSL *, int, int)' or 'void (*)(const SSL *, int, int)'
	 * yielding in an "incompatible-pointer-type" warning for the other
	 * version. It seems to be "unclear" what is correct:
	 * https://bugs.launchpad.net/ubuntu/+source/openssl/+bug/1147526
	 * https://www.openssl.org/docs/man1.0.2/ssl/ssl.html
	 * https://www.openssl.org/docs/man1.1.0/ssl/ssl.html
	 * https://github.com/openssl/openssl/blob/1d97c8435171a7af575f73c526d79e1ef0ee5960/ssl/ssl.h#L1173
	 * Disable this warning here.
	 * Alternative would be a version dependent ssl_info_callback and
	 * a const-cast to call 'char *SSL_get_app_data(SSL *ssl)' there.
	 */
	SSL_CTX_set_info_callback(dom_ctx->ssl_ctx, ssl_info_callback);


	SSL_CTX_set_tlsext_servername_callback(dom_ctx->ssl_ctx,
	                                       ssl_servername_callback);
	SSL_CTX_set_tlsext_servername_arg(dom_ctx->ssl_ctx, phys_ctx);

#if defined(GCC_DIAGNOSTIC)
#pragma GCC diagnostic pop
#endif
#if defined(__clang__)
#pragma clang diagnostic pop
#endif

	/* If a callback has been specified, call it. */
	callback_ret = (phys_ctx->callbacks.init_ssl == NULL)
	                   ? 0
	                   : (phys_ctx->callbacks.init_ssl(dom_ctx->ssl_ctx,
	                                                   phys_ctx->user_data));

	/* If callback returns 0, civetweb sets up the SSL certificate.
	 * If it returns 1, civetweb assumes the calback already did this.
	 * If it returns -1, initializing ssl fails. */
	if (callback_ret < 0) {
		mg_cry_internal(fc(phys_ctx),
		                "SSL callback returned error: %i",
		                callback_ret);
		return 0;
	}
	if (callback_ret > 0) {
		/* Callback did everything. */
		return 1;
	}

	/* Use some combination of start time, domain and port as a SSL
	 * context ID. This should be unique on the current machine. */
	md5_init(&md5state);
	clock_gettime(CLOCK_MONOTONIC, &now_mt);
	md5_append(&md5state, (const md5_byte_t *)&now_mt, sizeof(now_mt));
	md5_append(&md5state,
	           (const md5_byte_t *)phys_ctx->dd.config[LISTENING_PORTS],
	           strlen(phys_ctx->dd.config[LISTENING_PORTS]));
	md5_append(&md5state,
	           (const md5_byte_t *)dom_ctx->config[AUTHENTICATION_DOMAIN],
	           strlen(dom_ctx->config[AUTHENTICATION_DOMAIN]));
	md5_append(&md5state, (const md5_byte_t *)phys_ctx, sizeof(*phys_ctx));
	md5_append(&md5state, (const md5_byte_t *)dom_ctx, sizeof(*dom_ctx));
	md5_finish(&md5state, ssl_context_id);

	SSL_CTX_set_session_id_context(dom_ctx->ssl_ctx,
	                               (unsigned char *)ssl_context_id,
	                               sizeof(ssl_context_id));

	if (pem != NULL) {
		if (!ssl_use_pem_file(phys_ctx, dom_ctx, pem, chain)) {
			return 0;
		}
	}

	/* Should we support client certificates? */
	/* Default is "no". */
	should_verify_peer = 0;
	peer_certificate_optional = 0;
	if (dom_ctx->config[SSL_DO_VERIFY_PEER] != NULL) {
		if (mg_strcasecmp(dom_ctx->config[SSL_DO_VERIFY_PEER], "yes") == 0) {
			/* Yes, they are mandatory */
			should_verify_peer = 1;
			peer_certificate_optional = 0;
		} else if (mg_strcasecmp(dom_ctx->config[SSL_DO_VERIFY_PEER],
		                         "optional")
		           == 0) {
			/* Yes, they are optional */
			should_verify_peer = 1;
			peer_certificate_optional = 1;
		}
	}

	use_default_verify_paths =
	    (dom_ctx->config[SSL_DEFAULT_VERIFY_PATHS] != NULL)
	    && (mg_strcasecmp(dom_ctx->config[SSL_DEFAULT_VERIFY_PATHS], "yes")
	        == 0);

	if (should_verify_peer) {
		ca_path = dom_ctx->config[SSL_CA_PATH];
		ca_file = dom_ctx->config[SSL_CA_FILE];
		if (SSL_CTX_load_verify_locations(dom_ctx->ssl_ctx, ca_file, ca_path)
		    != 1) {
			mg_cry_internal(fc(phys_ctx),
			                "SSL_CTX_load_verify_locations error: %s "
			                "ssl_verify_peer requires setting "
			                "either ssl_ca_path or ssl_ca_file. "
			                "Is any of them present in the "
			                ".conf file?",
			                ssl_error());
			return 0;
		}

		if (peer_certificate_optional) {
			SSL_CTX_set_verify(dom_ctx->ssl_ctx, SSL_VERIFY_PEER, NULL);
		} else {
			SSL_CTX_set_verify(dom_ctx->ssl_ctx,
			                   SSL_VERIFY_PEER
			                       | SSL_VERIFY_FAIL_IF_NO_PEER_CERT,
			                   NULL);
		}

		if (use_default_verify_paths
		    && (SSL_CTX_set_default_verify_paths(dom_ctx->ssl_ctx) != 1)) {
			mg_cry_internal(fc(phys_ctx),
			                "SSL_CTX_set_default_verify_paths error: %s",
			                ssl_error());
			return 0;
		}

		if (dom_ctx->config[SSL_VERIFY_DEPTH]) {
			verify_depth = atoi(dom_ctx->config[SSL_VERIFY_DEPTH]);
			SSL_CTX_set_verify_depth(dom_ctx->ssl_ctx, verify_depth);
		}
	}

	if (dom_ctx->config[SSL_CIPHER_LIST] != NULL) {
		if (SSL_CTX_set_cipher_list(dom_ctx->ssl_ctx,
		                            dom_ctx->config[SSL_CIPHER_LIST])
		    != 1) {
			mg_cry_internal(fc(phys_ctx),
			                "SSL_CTX_set_cipher_list error: %s",
			                ssl_error());
		}
	}

	return 1;
}


/* Check if SSL is required.
 * If so, dynamically load SSL library
 * and set up ctx->ssl_ctx pointer. */
static int
init_ssl_ctx(struct mg_context *phys_ctx, struct mg_domain_context *dom_ctx)
{
	void *ssl_ctx = 0;
	int callback_ret;
	const char *pem;
	const char *chain;
	char ebuf[128];

	if (!phys_ctx) {
		return 0;
	}

	if (!dom_ctx) {
		dom_ctx = &(phys_ctx->dd);
	}

	if (!is_ssl_port_used(dom_ctx->config[LISTENING_PORTS])) {
		/* No SSL port is set. No need to setup SSL. */
		return 1;
	}

	/* Check for external SSL_CTX */
	callback_ret =
	    (phys_ctx->callbacks.external_ssl_ctx == NULL)
	        ? 0
	        : (phys_ctx->callbacks.external_ssl_ctx(&ssl_ctx,
	                                                phys_ctx->user_data));

	if (callback_ret < 0) {
		mg_cry_internal(fc(phys_ctx),
		                "external_ssl_ctx callback returned error: %i",
		                callback_ret);
		return 0;
	} else if (callback_ret > 0) {
		dom_ctx->ssl_ctx = (SSL_CTX *)ssl_ctx;
		if (!initialize_ssl(ebuf, sizeof(ebuf))) {
			mg_cry_internal(fc(phys_ctx), "%s", ebuf);
			return 0;
		}
		return 1;
	}
	/* else: external_ssl_ctx does not exist or returns 0,
	 * CivetWeb should continue initializing SSL */

	/* If PEM file is not specified and the init_ssl callback
	 * is not specified, setup will fail. */
	if (((pem = dom_ctx->config[SSL_CERTIFICATE]) == NULL)
	    && (phys_ctx->callbacks.init_ssl == NULL)) {
		/* No certificate and no callback:
		 * Essential data to set up TLS is missing.
		 */
		mg_cry_internal(fc(phys_ctx),
		                "Initializing SSL failed: -%s is not set",
		                config_options[SSL_CERTIFICATE].name);
		return 0;
	}

	chain = dom_ctx->config[SSL_CERTIFICATE_CHAIN];
	if (chain == NULL) {
		chain = pem;
	}
	if ((chain != NULL) && (*chain == 0)) {
		chain = NULL;
	}

	if (!initialize_ssl(ebuf, sizeof(ebuf))) {
		mg_cry_internal(fc(phys_ctx), "%s", ebuf);
		return 0;
	}

	return init_ssl_ctx_impl(phys_ctx, dom_ctx, pem, chain);
}


static void
uninitialize_ssl(void)
{
#if defined(OPENSSL_API_1_1)

	if (mg_atomic_dec(&cryptolib_users) == 0) {

		/* Shutdown according to
		 * https://wiki.openssl.org/index.php/Library_Initialization#Cleanup
		 * http://stackoverflow.com/questions/29845527/how-to-properly-uninitialize-openssl
		 */
		CONF_modules_unload(1);
#else
	int i;

	if (mg_atomic_dec(&cryptolib_users) == 0) {

		/* Shutdown according to
		 * https://wiki.openssl.org/index.php/Library_Initialization#Cleanup
		 * http://stackoverflow.com/questions/29845527/how-to-properly-uninitialize-openssl
		 */
		CRYPTO_set_locking_callback(NULL);
		CRYPTO_set_id_callback(NULL);
		ENGINE_cleanup();
		CONF_modules_unload(1);
		ERR_free_strings();
		EVP_cleanup();
		CRYPTO_cleanup_all_ex_data();
		ERR_remove_state(0);

		for (i = 0; i < CRYPTO_num_locks(); i++) {
			pthread_mutex_destroy(&ssl_mutexes[i]);
		}
		mg_free(ssl_mutexes);
		ssl_mutexes = NULL;
#endif /* OPENSSL_API_1_1 */
	}
}
#endif /* !NO_SSL */


static int
set_gpass_option(struct mg_context *phys_ctx, struct mg_domain_context *dom_ctx)
{
	if (phys_ctx) {
		struct mg_file file = STRUCT_FILE_INITIALIZER;
		const char *path;
		if (!dom_ctx) {
			dom_ctx = &(phys_ctx->dd);
		}
		path = dom_ctx->config[GLOBAL_PASSWORDS_FILE];
		if ((path != NULL) && !mg_stat(fc(phys_ctx), path, &file.stat)) {
			mg_cry_internal(fc(phys_ctx),
			                "Cannot open %s: %s",
			                path,
			                strerror(ERRNO));
			return 0;
		}
		return 1;
	}
	return 0;
}


static int
set_acl_option(struct mg_context *phys_ctx)
{
	return check_acl(phys_ctx, (uint32_t)0x7f000001UL) != -1;
}


static void
reset_per_request_attributes(struct mg_connection *conn)
{
	if (!conn) {
		return;
	}
	conn->connection_type =
	    CONNECTION_TYPE_INVALID; /* Not yet a valid request/response */

	conn->num_bytes_sent = conn->consumed_content = 0;

	conn->path_info = NULL;
	conn->status_code = -1;
	conn->content_len = -1;
	conn->is_chunked = 0;
	conn->must_close = 0;
	conn->request_len = 0;
	conn->throttle = 0;
	conn->data_len = 0;
	conn->chunk_remainder = 0;
	conn->accept_gzip = 0;

	conn->response_info.content_length = conn->request_info.content_length = -1;
	conn->response_info.http_version = conn->request_info.http_version = NULL;
	conn->response_info.num_headers = conn->request_info.num_headers = 0;
	conn->response_info.status_text = NULL;
	conn->response_info.status_code = 0;

	conn->request_info.remote_user = NULL;
	conn->request_info.request_method = NULL;
	conn->request_info.request_uri = NULL;
	conn->request_info.local_uri = NULL;

#if defined(MG_LEGACY_INTERFACE)
	/* Legacy before split into local_uri and request_uri */
	conn->request_info.uri = NULL;
#endif
}


#if 0
/* Note: set_sock_timeout is not required for non-blocking sockets.
 * Leave this function here (commented out) for reference until
 * CivetWeb 1.9 is tested, and the tests confirme this function is
 * no longer required.
*/
static int
set_sock_timeout(SOCKET sock, int milliseconds)
{
        int r0 = 0, r1, r2;

#if defined(_WIN32)
        /* Windows specific */

        DWORD tv = (DWORD)milliseconds;

#else
        /* Linux, ... (not Windows) */

        struct timeval tv;

/* TCP_USER_TIMEOUT/RFC5482 (http://tools.ietf.org/html/rfc5482):
 * max. time waiting for the acknowledged of TCP data before the connection
 * will be forcefully closed and ETIMEDOUT is returned to the application.
 * If this option is not set, the default timeout of 20-30 minutes is used.
*/
/* #define TCP_USER_TIMEOUT (18) */

#if defined(TCP_USER_TIMEOUT)
        unsigned int uto = (unsigned int)milliseconds;
        r0 = setsockopt(sock, 6, TCP_USER_TIMEOUT, (const void *)&uto, sizeof(uto));
#endif

        memset(&tv, 0, sizeof(tv));
        tv.tv_sec = milliseconds / 1000;
        tv.tv_usec = (milliseconds * 1000) % 1000000;

#endif /* _WIN32 */

        r1 = setsockopt(
            sock, SOL_SOCKET, SO_RCVTIMEO, (SOCK_OPT_TYPE)&tv, sizeof(tv));
        r2 = setsockopt(
            sock, SOL_SOCKET, SO_SNDTIMEO, (SOCK_OPT_TYPE)&tv, sizeof(tv));

        return r0 || r1 || r2;
}
#endif


static int
set_tcp_nodelay(SOCKET sock, int nodelay_on)
{
	if (setsockopt(sock,
	               IPPROTO_TCP,
	               TCP_NODELAY,
	               (SOCK_OPT_TYPE)&nodelay_on,
	               sizeof(nodelay_on))
	    != 0) {
		/* Error */
		return 1;
	}
	/* OK */
	return 0;
}


static void
close_socket_gracefully(struct mg_connection *conn)
{
#if defined(_WIN32)
	char buf[MG_BUF_LEN];
	int n;
#endif
	struct linger linger;
	int error_code = 0;
	int linger_timeout = -2;
	socklen_t opt_len = sizeof(error_code);

	if (!conn) {
		return;
	}

	/* http://msdn.microsoft.com/en-us/library/ms739165(v=vs.85).aspx:
	 * "Note that enabling a nonzero timeout on a nonblocking socket
	 * is not recommended.", so set it to blocking now */
	set_blocking_mode(conn->client.sock);

	/* Send FIN to the client */
	shutdown(conn->client.sock, SHUTDOWN_WR);


#if defined(_WIN32)
	/* Read and discard pending incoming data. If we do not do that and
	 * close
	 * the socket, the data in the send buffer may be discarded. This
	 * behaviour is seen on Windows, when client keeps sending data
	 * when server decides to close the connection; then when client
	 * does recv() it gets no data back. */
	do {
		n = pull_inner(NULL, conn, buf, sizeof(buf), /* Timeout in s: */ 1.0);
	} while (n > 0);
#endif

	if (conn->dom_ctx->config[LINGER_TIMEOUT]) {
		linger_timeout = atoi(conn->dom_ctx->config[LINGER_TIMEOUT]);
	}

	/* Set linger option according to configuration */
	if (linger_timeout >= 0) {
		/* Set linger option to avoid socket hanging out after close. This
		 * prevent ephemeral port exhaust problem under high QPS. */
		linger.l_onoff = 1;

#if defined(_MSC_VER)
#pragma warning(push)
#pragma warning(disable : 4244)
#endif
#if defined(GCC_DIAGNOSTIC)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wconversion"
#endif
		/* Data type of linger structure elements may differ,
		 * so we don't know what cast we need here.
		 * Disable type conversion warnings. */

		linger.l_linger = (linger_timeout + 999) / 1000;

#if defined(GCC_DIAGNOSTIC)
#pragma GCC diagnostic pop
#endif
#if defined(_MSC_VER)
#pragma warning(pop)
#endif

	} else {
		linger.l_onoff = 0;
		linger.l_linger = 0;
	}

	if (linger_timeout < -1) {
		/* Default: don't configure any linger */
	} else if (getsockopt(conn->client.sock,
	                      SOL_SOCKET,
	                      SO_ERROR,
#if defined(_WIN32) /* WinSock uses different data type here */
	                      (char *)&error_code,
#else
	                      &error_code,
#endif
	                      &opt_len)
	           != 0) {
		/* Cannot determine if socket is already closed. This should
		 * not occur and never did in a test. Log an error message
		 * and continue. */
		mg_cry_internal(conn,
		                "%s: getsockopt(SOL_SOCKET SO_ERROR) failed: %s",
		                __func__,
		                strerror(ERRNO));
	} else if (error_code == ECONNRESET) {
		/* Socket already closed by client/peer, close socket without linger
		 */
	} else {

		/* Set linger timeout */
		if (setsockopt(conn->client.sock,
		               SOL_SOCKET,
		               SO_LINGER,
		               (char *)&linger,
		               sizeof(linger))
		    != 0) {
			mg_cry_internal(
			    conn,
			    "%s: setsockopt(SOL_SOCKET SO_LINGER(%i,%i)) failed: %s",
			    __func__,
			    linger.l_onoff,
			    linger.l_linger,
			    strerror(ERRNO));
		}
	}

	/* Now we know that our FIN is ACK-ed, safe to close */
	closesocket(conn->client.sock);
	conn->client.sock = INVALID_SOCKET;
}


static void
close_connection(struct mg_connection *conn)
{
#if defined(USE_SERVER_STATS)
	conn->conn_state = 6; /* to close */
#endif

#if defined(USE_LUA) && defined(USE_WEBSOCKET)
	if (conn->lua_websocket_state) {
		lua_websocket_close(conn, conn->lua_websocket_state);
		conn->lua_websocket_state = NULL;
	}
#endif

	mg_lock_connection(conn);

	/* Set close flag, so keep-alive loops will stop */
	conn->must_close = 1;

	/* call the connection_close callback if assigned */
	if (conn->phys_ctx->callbacks.connection_close != NULL) {
		if (conn->phys_ctx->context_type == CONTEXT_SERVER) {
			conn->phys_ctx->callbacks.connection_close(conn);
		}
	}

	/* Reset user data, after close callback is called.
	 * Do not reuse it. If the user needs a destructor,
	 * it must be done in the connection_close callback. */
	mg_set_user_connection_data(conn, NULL);


#if defined(USE_SERVER_STATS)
	conn->conn_state = 7; /* closing */
#endif

#if !defined(NO_SSL)
	if (conn->ssl != NULL) {
		/* Run SSL_shutdown twice to ensure completely close SSL connection
		 */
		SSL_shutdown(conn->ssl);
		SSL_free(conn->ssl);
/* Avoid CRYPTO_cleanup_all_ex_data(); See discussion:
 * https://wiki.openssl.org/index.php/Talk:Library_Initialization */
#if !defined(OPENSSL_API_1_1)
		ERR_remove_state(0);
#endif
		conn->ssl = NULL;
	}
#endif
	if (conn->client.sock != INVALID_SOCKET) {
		close_socket_gracefully(conn);
		conn->client.sock = INVALID_SOCKET;
	}

	if (conn->host) {
		mg_free((void *)conn->host);
		conn->host = NULL;
	}

	mg_unlock_connection(conn);

#if defined(USE_SERVER_STATS)
	conn->conn_state = 8; /* closed */
#endif
}


void
mg_close_connection(struct mg_connection *conn)
{
#if defined(USE_WEBSOCKET)
	struct mg_context *client_ctx = NULL;
#endif /* defined(USE_WEBSOCKET) */

	if ((conn == NULL) || (conn->phys_ctx == NULL)) {
		return;
	}

#if defined(USE_WEBSOCKET)
	if (conn->phys_ctx->context_type == CONTEXT_SERVER) {
		if (conn->in_websocket_handling) {
			/* Set close flag, so the server thread can exit. */
			conn->must_close = 1;
			return;
		}
	}
	if (conn->phys_ctx->context_type == CONTEXT_WS_CLIENT) {

		unsigned int i;

		/* ws/wss client */
		client_ctx = conn->phys_ctx;

		/* client context: loops must end */
		client_ctx->stop_flag = 1;
		conn->must_close = 1;

		/* We need to get the client thread out of the select/recv call
		 * here. */
		/* Since we use a sleep quantum of some seconds to check for recv
		 * timeouts, we will just wait a few seconds in mg_join_thread. */

		/* join worker thread */
		for (i = 0; i < client_ctx->cfg_worker_threads; i++) {
			if (client_ctx->worker_threadids[i] != 0) {
				mg_join_thread(client_ctx->worker_threadids[i]);
			}
		}
	}
#endif /* defined(USE_WEBSOCKET) */

	close_connection(conn);

#if !defined(NO_SSL)
	if (conn->client_ssl_ctx != NULL) {
		SSL_CTX_free((SSL_CTX *)conn->client_ssl_ctx);
	}
#endif

#if defined(USE_WEBSOCKET)
	if (client_ctx != NULL) {
		/* free context */
		mg_free(client_ctx->worker_threadids);
		mg_free(client_ctx);
		(void)pthread_mutex_destroy(&conn->mutex);
		mg_free(conn);
	} else if (conn->phys_ctx->context_type == CONTEXT_HTTP_CLIENT) {
		mg_free(conn);
	}
#else
	if (conn->phys_ctx->context_type == CONTEXT_HTTP_CLIENT) { /* Client */
		mg_free(conn);
	}
#endif /* defined(USE_WEBSOCKET) */
}


/* Only for memory statistics */
static struct mg_context common_client_context;


static struct mg_connection *
mg_connect_client_impl(const struct mg_client_options *client_options,
                       int use_ssl,
                       char *ebuf,
                       size_t ebuf_len)
{
	struct mg_connection *conn = NULL;
	SOCKET sock;
	union usa sa;
	struct sockaddr *psa;
	socklen_t len;

	unsigned max_req_size =
	    (unsigned)atoi(config_options[MAX_REQUEST_SIZE].default_value);

	/* Size of structures, aligned to 8 bytes */
	size_t conn_size = ((sizeof(struct mg_connection) + 7) >> 3) << 3;
	size_t ctx_size = ((sizeof(struct mg_context) + 7) >> 3) << 3;

	conn = (struct mg_connection *)mg_calloc_ctx(
	    1, conn_size + ctx_size + max_req_size, &common_client_context);

	if (conn == NULL) {
		mg_snprintf(NULL,
		            NULL, /* No truncation check for ebuf */
		            ebuf,
		            ebuf_len,
		            "calloc(): %s",
		            strerror(ERRNO));
		return NULL;
	}

#if defined(GCC_DIAGNOSTIC)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wcast-align"
#endif /* defined(GCC_DIAGNOSTIC) */
	/* conn_size is aligned to 8 bytes */

	conn->phys_ctx = (struct mg_context *)(((char *)conn) + conn_size);

#if defined(GCC_DIAGNOSTIC)
#pragma GCC diagnostic pop
#endif /* defined(GCC_DIAGNOSTIC) */

	conn->buf = (((char *)conn) + conn_size + ctx_size);
	conn->buf_size = (int)max_req_size;
	conn->phys_ctx->context_type = CONTEXT_HTTP_CLIENT;
	conn->dom_ctx = &(conn->phys_ctx->dd);

	if (!connect_socket(&common_client_context,
	                    client_options->host,
	                    client_options->port,
	                    use_ssl,
	                    ebuf,
	                    ebuf_len,
	                    &sock,
	                    &sa)) {
		/* ebuf is set by connect_socket,
		 * free all memory and return NULL; */
		mg_free(conn);
		return NULL;
	}

#if !defined(NO_SSL)
#if defined(OPENSSL_API_1_1)
	if (use_ssl
	    && (conn->client_ssl_ctx = SSL_CTX_new(TLS_client_method())) == NULL) {
		mg_snprintf(NULL,
		            NULL, /* No truncation check for ebuf */
		            ebuf,
		            ebuf_len,
		            "SSL_CTX_new error");
		closesocket(sock);
		mg_free(conn);
		return NULL;
	}
#else
	if (use_ssl
	    && (conn->client_ssl_ctx = SSL_CTX_new(SSLv23_client_method()))
	           == NULL) {
		mg_snprintf(NULL,
		            NULL, /* No truncation check for ebuf */
		            ebuf,
		            ebuf_len,
		            "SSL_CTX_new error");
		closesocket(sock);
		mg_free(conn);
		return NULL;
	}
#endif /* OPENSSL_API_1_1 */
#endif /* NO_SSL */


#if defined(USE_IPV6)
	len = (sa.sa.sa_family == AF_INET) ? sizeof(conn->client.rsa.sin)
	                                   : sizeof(conn->client.rsa.sin6);
	psa = (sa.sa.sa_family == AF_INET)
	          ? (struct sockaddr *)&(conn->client.rsa.sin)
	          : (struct sockaddr *)&(conn->client.rsa.sin6);
#else
	len = sizeof(conn->client.rsa.sin);
	psa = (struct sockaddr *)&(conn->client.rsa.sin);
#endif

	conn->client.sock = sock;
	conn->client.lsa = sa;

	if (getsockname(sock, psa, &len) != 0) {
		mg_cry_internal(conn,
		                "%s: getsockname() failed: %s",
		                __func__,
		                strerror(ERRNO));
	}

	conn->client.is_ssl = use_ssl ? 1 : 0;
	if (0 != pthread_mutex_init(&conn->mutex, &pthread_mutex_attr)) {
		mg_snprintf(NULL,
		            NULL, /* No truncation check for ebuf */
		            ebuf,
		            ebuf_len,
		            "Can not create mutex");
#if !defined(NO_SSL)
		SSL_CTX_free(conn->client_ssl_ctx);
#endif
		closesocket(sock);
		mg_free(conn);
		return NULL;
	}


#if !defined(NO_SSL)
	if (use_ssl) {
		common_client_context.dd.ssl_ctx = conn->client_ssl_ctx;

		/* TODO: Check ssl_verify_peer and ssl_ca_path here.
		 * SSL_CTX_set_verify call is needed to switch off server
		 * certificate checking, which is off by default in OpenSSL and
		 * on in yaSSL. */
		/* TODO: SSL_CTX_set_verify(conn->client_ssl_ctx,
		 * SSL_VERIFY_PEER, verify_ssl_server); */

		if (client_options->client_cert) {
			if (!ssl_use_pem_file(&common_client_context,
			                      &(common_client_context.dd),
			                      client_options->client_cert,
			                      NULL)) {
				mg_snprintf(NULL,
				            NULL, /* No truncation check for ebuf */
				            ebuf,
				            ebuf_len,
				            "Can not use SSL client certificate");
				SSL_CTX_free(conn->client_ssl_ctx);
				closesocket(sock);
				mg_free(conn);
				return NULL;
			}
		}

		if (client_options->server_cert) {
			SSL_CTX_load_verify_locations(conn->client_ssl_ctx,
			                              client_options->server_cert,
			                              NULL);
			SSL_CTX_set_verify(conn->client_ssl_ctx, SSL_VERIFY_PEER, NULL);
		} else {
			SSL_CTX_set_verify(conn->client_ssl_ctx, SSL_VERIFY_NONE, NULL);
		}

		if (!sslize(conn,
		            conn->client_ssl_ctx,
		            SSL_connect,
		            &(conn->phys_ctx->stop_flag))) {
			mg_snprintf(NULL,
			            NULL, /* No truncation check for ebuf */
			            ebuf,
			            ebuf_len,
			            "SSL connection error");
			SSL_CTX_free(conn->client_ssl_ctx);
			closesocket(sock);
			mg_free(conn);
			return NULL;
		}
	}
#endif

	if (0 != set_non_blocking_mode(sock)) {
		mg_cry_internal(conn,
		                "Cannot set non-blocking mode for client %s:%i",
		                client_options->host,
		                client_options->port);
	}

	return conn;
}


CIVETWEB_API struct mg_connection *
mg_connect_client_secure(const struct mg_client_options *client_options,
                         char *error_buffer,
                         size_t error_buffer_size)
{
	return mg_connect_client_impl(client_options,
	                              1,
	                              error_buffer,
	                              error_buffer_size);
}


struct mg_connection *
mg_connect_client(const char *host,
                  int port,
                  int use_ssl,
                  char *error_buffer,
                  size_t error_buffer_size)
{
	struct mg_client_options opts;
	memset(&opts, 0, sizeof(opts));
	opts.host = host;
	opts.port = port;
	return mg_connect_client_impl(&opts,
	                              use_ssl,
	                              error_buffer,
	                              error_buffer_size);
}


static const struct {
	const char *proto;
	size_t proto_len;
	unsigned default_port;
} abs_uri_protocols[] = {{"http://", 7, 80},
                         {"https://", 8, 443},
                         {"ws://", 5, 80},
                         {"wss://", 6, 443},
                         {NULL, 0, 0}};


/* Check if the uri is valid.
 * return 0 for invalid uri,
 * return 1 for *,
 * return 2 for relative uri,
 * return 3 for absolute uri without port,
 * return 4 for absolute uri with port */
static int
get_uri_type(const char *uri)
{
	int i;
	const char *hostend, *portbegin;
	char *portend;
	unsigned long port;

	/* According to the HTTP standard
	 * http://www.w3.org/Protocols/rfc2616/rfc2616-sec5.html#sec5.1.2
	 * URI can be an asterisk (*) or should start with slash (relative uri),
	 * or it should start with the protocol (absolute uri). */
	if ((uri[0] == '*') && (uri[1] == '\0')) {
		/* asterisk */
		return 1;
	}

	/* Valid URIs according to RFC 3986
	 * (https://www.ietf.org/rfc/rfc3986.txt)
	 * must only contain reserved characters :/?#[]@!$&'()*+,;=
	 * and unreserved characters A-Z a-z 0-9 and -._~
	 * and % encoded symbols.
	 */
	for (i = 0; uri[i] != 0; i++) {
		if (uri[i] < 33) {
			/* control characters and spaces are invalid */
			return 0;
		}
		if (uri[i] > 126) {
			/* non-ascii characters must be % encoded */
			return 0;
		} else {
			switch (uri[i]) {
			case '"':  /* 34 */
			case '<':  /* 60 */
			case '>':  /* 62 */
			case '\\': /* 92 */
			case '^':  /* 94 */
			case '`':  /* 96 */
			case '{':  /* 123 */
			case '|':  /* 124 */
			case '}':  /* 125 */
				return 0;
			default:
				/* character is ok */
				break;
			}
		}
	}

	/* A relative uri starts with a / character */
	if (uri[0] == '/') {
		/* relative uri */
		return 2;
	}

	/* It could be an absolute uri: */
	/* This function only checks if the uri is valid, not if it is
	 * addressing the current server. So civetweb can also be used
	 * as a proxy server. */
	for (i = 0; abs_uri_protocols[i].proto != NULL; i++) {
		if (mg_strncasecmp(uri,
		                   abs_uri_protocols[i].proto,
		                   abs_uri_protocols[i].proto_len)
		    == 0) {

			hostend = strchr(uri + abs_uri_protocols[i].proto_len, '/');
			if (!hostend) {
				return 0;
			}
			portbegin = strchr(uri + abs_uri_protocols[i].proto_len, ':');
			if (!portbegin) {
				return 3;
			}

			port = strtoul(portbegin + 1, &portend, 10);
			if ((portend != hostend) || (port <= 0) || !is_valid_port(port)) {
				return 0;
			}

			return 4;
		}
	}

	return 0;
}


/* Return NULL or the relative uri at the current server */
static const char *
get_rel_url_at_current_server(const char *uri, const struct mg_connection *conn)
{
	const char *server_domain;
	size_t server_domain_len;
	size_t request_domain_len = 0;
	unsigned long port = 0;
	int i, auth_domain_check_enabled;
	const char *hostbegin = NULL;
	const char *hostend = NULL;
	const char *portbegin;
	char *portend;

	auth_domain_check_enabled =
	    !mg_strcasecmp(conn->dom_ctx->config[ENABLE_AUTH_DOMAIN_CHECK], "yes");

	/* DNS is case insensitive, so use case insensitive string compare here
	 */
	for (i = 0; abs_uri_protocols[i].proto != NULL; i++) {
		if (mg_strncasecmp(uri,
		                   abs_uri_protocols[i].proto,
		                   abs_uri_protocols[i].proto_len)
		    == 0) {

			hostbegin = uri + abs_uri_protocols[i].proto_len;
			hostend = strchr(hostbegin, '/');
			if (!hostend) {
				return 0;
			}
			portbegin = strchr(hostbegin, ':');
			if ((!portbegin) || (portbegin > hostend)) {
				port = abs_uri_protocols[i].default_port;
				request_domain_len = (size_t)(hostend - hostbegin);
			} else {
				port = strtoul(portbegin + 1, &portend, 10);
				if ((portend != hostend) || (port <= 0)
				    || !is_valid_port(port)) {
					return 0;
				}
				request_domain_len = (size_t)(portbegin - hostbegin);
			}
			/* protocol found, port set */
			break;
		}
	}

	if (!port) {
		/* port remains 0 if the protocol is not found */
		return 0;
	}

/* Check if the request is directed to a different server. */
/* First check if the port is the same (IPv4 and IPv6). */
#if defined(USE_IPV6)
	if (conn->client.lsa.sa.sa_family == AF_INET6) {
		if (ntohs(conn->client.lsa.sin6.sin6_port) != port) {
			/* Request is directed to a different port */
			return 0;
		}
	} else
#endif
	{
		if (ntohs(conn->client.lsa.sin.sin_port) != port) {
			/* Request is directed to a different port */
			return 0;
		}
	}

	/* Finally check if the server corresponds to the authentication
	 * domain of the server (the server domain).
	 * Allow full matches (like http://mydomain.com/path/file.ext), and
	 * allow subdomain matches (like http://www.mydomain.com/path/file.ext),
	 * but do not allow substrings (like
	 * http://notmydomain.com/path/file.ext
	 * or http://mydomain.com.fake/path/file.ext).
	 */
	if (auth_domain_check_enabled) {
		server_domain = conn->dom_ctx->config[AUTHENTICATION_DOMAIN];
		server_domain_len = strlen(server_domain);
		if ((server_domain_len == 0) || (hostbegin == NULL)) {
			return 0;
		}
		if ((request_domain_len == server_domain_len)
		    && (!memcmp(server_domain, hostbegin, server_domain_len))) {
			/* Request is directed to this server - full name match. */
		} else {
			if (request_domain_len < (server_domain_len + 2)) {
				/* Request is directed to another server: The server name
				 * is longer than the request name.
				 * Drop this case here to avoid overflows in the
				 * following checks. */
				return 0;
			}
			if (hostbegin[request_domain_len - server_domain_len - 1] != '.') {
				/* Request is directed to another server: It could be a
				 * substring
				 * like notmyserver.com */
				return 0;
			}
			if (0
			    != memcmp(server_domain,
			              hostbegin + request_domain_len - server_domain_len,
			              server_domain_len)) {
				/* Request is directed to another server:
				 * The server name is different. */
				return 0;
			}
		}
	}

	return hostend;
}


static int
get_message(struct mg_connection *conn, char *ebuf, size_t ebuf_len, int *err)
{
	if (ebuf_len > 0) {
		ebuf[0] = '\0';
	}
	*err = 0;

	reset_per_request_attributes(conn);

	if (!conn) {
		mg_snprintf(conn,
		            NULL, /* No truncation check for ebuf */
		            ebuf,
		            ebuf_len,
		            "%s",
		            "Internal error");
		*err = 500;
		return 0;
	}
	/* Set the time the request was received. This value should be used for
	 * timeouts. */
	clock_gettime(CLOCK_MONOTONIC, &(conn->req_time));

	conn->request_len =
	    read_message(NULL, conn, conn->buf, conn->buf_size, &conn->data_len);
	DEBUG_ASSERT(conn->request_len < 0 || conn->data_len >= conn->request_len);
	if ((conn->request_len >= 0) && (conn->data_len < conn->request_len)) {
		mg_snprintf(conn,
		            NULL, /* No truncation check for ebuf */
		            ebuf,
		            ebuf_len,
		            "%s",
		            "Invalid message size");
		*err = 500;
		return 0;
	}

	if ((conn->request_len == 0) && (conn->data_len == conn->buf_size)) {
		mg_snprintf(conn,
		            NULL, /* No truncation check for ebuf */
		            ebuf,
		            ebuf_len,
		            "%s",
		            "Message too large");
		*err = 413;
		return 0;
	}

	if (conn->request_len <= 0) {
		if (conn->data_len > 0) {
			mg_snprintf(conn,
			            NULL, /* No truncation check for ebuf */
			            ebuf,
			            ebuf_len,
			            "%s",
			            "Malformed message");
			*err = 400;
		} else {
			/* Server did not recv anything -> just close the connection */
			conn->must_close = 1;
			mg_snprintf(conn,
			            NULL, /* No truncation check for ebuf */
			            ebuf,
			            ebuf_len,
			            "%s",
			            "No data received");
			*err = 0;
		}
		return 0;
	}
	return 1;
}


static int
get_request(struct mg_connection *conn, char *ebuf, size_t ebuf_len, int *err)
{
	const char *cl;
	if (!get_message(conn, ebuf, ebuf_len, err)) {
		return 0;
	}

	if (parse_http_request(conn->buf, conn->buf_size, &conn->request_info)
	    <= 0) {
		mg_snprintf(conn,
		            NULL, /* No truncation check for ebuf */
		            ebuf,
		            ebuf_len,
		            "%s",
		            "Bad request");
		*err = 400;
		return 0;
	}

	/* Message is a valid request */

	/* Is there a "host" ? */
	conn->host = alloc_get_host(conn);
	if (!conn->host) {
		mg_snprintf(conn,
		            NULL, /* No truncation check for ebuf */
		            ebuf,
		            ebuf_len,
		            "%s",
		            "Bad request: Host mismatch");
		*err = 400;
		return 0;
	}

	/* Do we know the content length? */
	if ((cl = get_header(conn->request_info.http_headers,
	                     conn->request_info.num_headers,
	                     "Content-Length"))
	    != NULL) {
		/* Request/response has content length set */
		char *endptr = NULL;
		conn->content_len = strtoll(cl, &endptr, 10);
		if (endptr == cl) {
			mg_snprintf(conn,
			            NULL, /* No truncation check for ebuf */
			            ebuf,
			            ebuf_len,
			            "%s",
			            "Bad request");
			*err = 411;
			return 0;
		}
		/* Publish the content length back to the request info. */
		conn->request_info.content_length = conn->content_len;
	} else if ((cl = get_header(conn->request_info.http_headers,
	                            conn->request_info.num_headers,
	                            "Transfer-Encoding"))
	               != NULL
	           && !mg_strcasecmp(cl, "chunked")) {
		conn->is_chunked = 1;
		conn->content_len = -1; /* unknown content length */
	} else {
		const struct mg_http_method_info *meth =
		    get_http_method_info(conn->request_info.request_method);
		if (!meth) {
			/* No valid HTTP method */
			mg_snprintf(conn,
			            NULL, /* No truncation check for ebuf */
			            ebuf,
			            ebuf_len,
			            "%s",
			            "Bad request");
			*err = 411;
			return 0;
		}
		if (meth->request_has_body) {
			/* POST or PUT request without content length set */
			conn->content_len = -1; /* unknown content length */
		} else {
			/* Other request */
			conn->content_len = 0; /* No content */
		}
	}

	conn->connection_type = CONNECTION_TYPE_REQUEST; /* Valid request */
	return 1;
}


/* conn is assumed to be valid in this internal function */
static int
get_response(struct mg_connection *conn, char *ebuf, size_t ebuf_len, int *err)
{
	const char *cl;
	if (!get_message(conn, ebuf, ebuf_len, err)) {
		return 0;
	}

	if (parse_http_response(conn->buf, conn->buf_size, &conn->response_info)
	    <= 0) {
		mg_snprintf(conn,
		            NULL, /* No truncation check for ebuf */
		            ebuf,
		            ebuf_len,
		            "%s",
		            "Bad response");
		*err = 400;
		return 0;
	}

	/* Message is a valid response */

	/* Do we know the content length? */
	if ((cl = get_header(conn->response_info.http_headers,
	                     conn->response_info.num_headers,
	                     "Content-Length"))
	    != NULL) {
		/* Request/response has content length set */
		char *endptr = NULL;
		conn->content_len = strtoll(cl, &endptr, 10);
		if (endptr == cl) {
			mg_snprintf(conn,
			            NULL, /* No truncation check for ebuf */
			            ebuf,
			            ebuf_len,
			            "%s",
			            "Bad request");
			*err = 411;
			return 0;
		}
		/* Publish the content length back to the response info. */
		conn->response_info.content_length = conn->content_len;

		/* TODO: check if it is still used in response_info */
		conn->request_info.content_length = conn->content_len;

	} else if ((cl = get_header(conn->response_info.http_headers,
	                            conn->response_info.num_headers,
	                            "Transfer-Encoding"))
	               != NULL
	           && !mg_strcasecmp(cl, "chunked")) {
		conn->is_chunked = 1;
		conn->content_len = -1; /* unknown content length */
	} else {
		conn->content_len = -1; /* unknown content length */
	}

	conn->connection_type = CONNECTION_TYPE_RESPONSE; /* Valid response */
	return 1;
}


int
mg_get_response(struct mg_connection *conn,
                char *ebuf,
                size_t ebuf_len,
                int timeout)
{
	int err, ret;
	char txt[32]; /* will not overflow */
	char *save_timeout;
	char *new_timeout;

	if (ebuf_len > 0) {
		ebuf[0] = '\0';
	}

	if (!conn) {
		mg_snprintf(conn,
		            NULL, /* No truncation check for ebuf */
		            ebuf,
		            ebuf_len,
		            "%s",
		            "Parameter error");
		return -1;
	}

	/* Implementation of API function for HTTP clients */
	save_timeout = conn->dom_ctx->config[REQUEST_TIMEOUT];

	if (timeout >= 0) {
		mg_snprintf(conn, NULL, txt, sizeof(txt), "%i", timeout);
		new_timeout = txt;
		/* Not required for non-blocking sockets.
		set_sock_timeout(conn->client.sock, timeout);
		*/
	} else {
		new_timeout = NULL;
	}

	conn->dom_ctx->config[REQUEST_TIMEOUT] = new_timeout;
	ret = get_response(conn, ebuf, ebuf_len, &err);
	conn->dom_ctx->config[REQUEST_TIMEOUT] = save_timeout;

#if defined(MG_LEGACY_INTERFACE)
	/* TODO: 1) uri is deprecated;
	 *       2) here, ri.uri is the http response code */
	conn->request_info.uri = conn->request_info.request_uri;
#endif
	conn->request_info.local_uri = conn->request_info.request_uri;

	/* TODO (mid): Define proper return values - maybe return length?
	 * For the first test use <0 for error and >0 for OK */
	return (ret == 0) ? -1 : +1;
}


struct mg_connection *
mg_download(const char *host,
            int port,
            int use_ssl,
            char *ebuf,
            size_t ebuf_len,
            const char *fmt,
            ...)
{
	struct mg_connection *conn;
	va_list ap;
	int i;
	int reqerr;

	if (ebuf_len > 0) {
		ebuf[0] = '\0';
	}

	va_start(ap, fmt);

	/* open a connection */
	conn = mg_connect_client(host, port, use_ssl, ebuf, ebuf_len);

	if (conn != NULL) {
		i = mg_vprintf(conn, fmt, ap);
		if (i <= 0) {
			mg_snprintf(conn,
			            NULL, /* No truncation check for ebuf */
			            ebuf,
			            ebuf_len,
			            "%s",
			            "Error sending request");
		} else {
			get_response(conn, ebuf, ebuf_len, &reqerr);

#if defined(MG_LEGACY_INTERFACE)
			/* TODO: 1) uri is deprecated;
			 *       2) here, ri.uri is the http response code */
			conn->request_info.uri = conn->request_info.request_uri;
#endif
			conn->request_info.local_uri = conn->request_info.request_uri;
		}
	}

	/* if an error occurred, close the connection */
	if ((ebuf[0] != '\0') && (conn != NULL)) {
		mg_close_connection(conn);
		conn = NULL;
	}

	va_end(ap);
	return conn;
}


struct websocket_client_thread_data {
	struct mg_connection *conn;
	mg_websocket_data_handler data_handler;
	mg_websocket_close_handler close_handler;
	void *callback_data;
};


#if defined(USE_WEBSOCKET)
#if defined(_WIN32)
static unsigned __stdcall websocket_client_thread(void *data)
#else
static void *
websocket_client_thread(void *data)
#endif
{
	struct websocket_client_thread_data *cdata =
	    (struct websocket_client_thread_data *)data;

#if !defined(_WIN32)
	struct sigaction sa;

	/* Ignore SIGPIPE */
	memset(&sa, 0, sizeof(sa));
	sa.sa_handler = SIG_IGN;
	sigaction(SIGPIPE, &sa, NULL);
#endif

	mg_set_thread_name("ws-clnt");

	if (cdata->conn->phys_ctx) {
		if (cdata->conn->phys_ctx->callbacks.init_thread) {
			/* 3 indicates a websocket client thread */
			/* TODO: check if conn->phys_ctx can be set */
			cdata->conn->phys_ctx->callbacks.init_thread(cdata->conn->phys_ctx,
			                                             3);
		}
	}

	read_websocket(cdata->conn, cdata->data_handler, cdata->callback_data);

	DEBUG_TRACE("%s", "Websocket client thread exited\n");

	if (cdata->close_handler != NULL) {
		cdata->close_handler(cdata->conn, cdata->callback_data);
	}

	/* The websocket_client context has only this thread. If it runs out,
	   set the stop_flag to 2 (= "stopped"). */
	cdata->conn->phys_ctx->stop_flag = 2;

	mg_free((void *)cdata);

#if defined(_WIN32)
	return 0;
#else
	return NULL;
#endif
}
#endif


struct mg_connection *
mg_connect_websocket_client(const char *host,
                            int port,
                            int use_ssl,
                            char *error_buffer,
                            size_t error_buffer_size,
                            const char *path,
                            const char *origin,
                            mg_websocket_data_handler data_func,
                            mg_websocket_close_handler close_func,
                            void *user_data)
{
	struct mg_connection *conn = NULL;

#if defined(USE_WEBSOCKET)
	struct mg_context *newctx = NULL;
	struct websocket_client_thread_data *thread_data;
	static const char *magic = "x3JJHMbDL1EzLkh9GBhXDw==";
	static const char *handshake_req;

	if (origin != NULL) {
		handshake_req = "GET %s HTTP/1.1\r\n"
		                "Host: %s\r\n"
		                "Upgrade: websocket\r\n"
		                "Connection: Upgrade\r\n"
		                "Sec-WebSocket-Key: %s\r\n"
		                "Sec-WebSocket-Version: 13\r\n"
		                "Origin: %s\r\n"
		                "\r\n";
	} else {
		handshake_req = "GET %s HTTP/1.1\r\n"
		                "Host: %s\r\n"
		                "Upgrade: websocket\r\n"
		                "Connection: Upgrade\r\n"
		                "Sec-WebSocket-Key: %s\r\n"
		                "Sec-WebSocket-Version: 13\r\n"
		                "\r\n";
	}

#if defined(__clang__)
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wformat-nonliteral"
#endif

	/* Establish the client connection and request upgrade */
	conn = mg_download(host,
	                   port,
	                   use_ssl,
	                   error_buffer,
	                   error_buffer_size,
	                   handshake_req,
	                   path,
	                   host,
	                   magic,
	                   origin);

#if defined(__clang__)
#pragma clang diagnostic pop
#endif

	/* Connection object will be null if something goes wrong */
	if (conn == NULL) {
		if (!*error_buffer) {
			/* There should be already an error message */
			mg_snprintf(conn,
			            NULL, /* No truncation check for ebuf */
			            error_buffer,
			            error_buffer_size,
			            "Unexpected error");
		}
		return NULL;
	}

	if (conn->response_info.status_code != 101) {
		/* We sent an "upgrade" request. For a correct websocket
		 * protocol handshake, we expect a "101 Continue" response.
		 * Otherwise it is a protocol violation. Maybe the HTTP
		 * Server does not know websockets. */
		if (!*error_buffer) {
			/* set an error, if not yet set */
			mg_snprintf(conn,
			            NULL, /* No truncation check for ebuf */
			            error_buffer,
			            error_buffer_size,
			            "Unexpected server reply");
		}

		DEBUG_TRACE("Websocket client connect error: %s\r\n", error_buffer);
		mg_free(conn);
		return NULL;
	}

	/* For client connections, mg_context is fake. Since we need to set a
	 * callback function, we need to create a copy and modify it. */
	newctx = (struct mg_context *)mg_malloc(sizeof(struct mg_context));
	if (!newctx) {
		DEBUG_TRACE("%s\r\n", "Out of memory");
		mg_free(conn);
		return NULL;
	}

	memcpy(newctx, conn->phys_ctx, sizeof(struct mg_context));
	newctx->user_data = user_data;
	newctx->context_type = CONTEXT_WS_CLIENT; /* ws/wss client context */
	newctx->cfg_worker_threads = 1; /* one worker thread will be created */
	newctx->worker_threadids =
	    (pthread_t *)mg_calloc_ctx(newctx->cfg_worker_threads,
	                               sizeof(pthread_t),
	                               newctx);

	conn->phys_ctx = newctx;
	conn->dom_ctx = &(newctx->dd);

	thread_data = (struct websocket_client_thread_data *)
	    mg_calloc_ctx(sizeof(struct websocket_client_thread_data), 1, newctx);
	if (!thread_data) {
		DEBUG_TRACE("%s\r\n", "Out of memory");
		mg_free(newctx);
		mg_free(conn);
		return NULL;
	}

	thread_data->conn = conn;
	thread_data->data_handler = data_func;
	thread_data->close_handler = close_func;
	thread_data->callback_data = user_data;

	/* Start a thread to read the websocket client connection
	 * This thread will automatically stop when mg_disconnect is
	 * called on the client connection */
	if (mg_start_thread_with_id(websocket_client_thread,
	                            (void *)thread_data,
	                            newctx->worker_threadids)
	    != 0) {
		mg_free((void *)thread_data);
		mg_free((void *)newctx->worker_threadids);
		mg_free((void *)newctx);
		mg_free((void *)conn);
		conn = NULL;
		DEBUG_TRACE("%s",
		            "Websocket client connect thread could not be started\r\n");
	}

#else
	/* Appease "unused parameter" warnings */
	(void)host;
	(void)port;
	(void)use_ssl;
	(void)error_buffer;
	(void)error_buffer_size;
	(void)path;
	(void)origin;
	(void)user_data;
	(void)data_func;
	(void)close_func;
#endif

	return conn;
}


/* Prepare connection data structure */
static void
init_connection(struct mg_connection *conn)
{
	/* Is keep alive allowed by the server */
	int keep_alive_enabled =
	    !mg_strcasecmp(conn->dom_ctx->config[ENABLE_KEEP_ALIVE], "yes");

	if (!keep_alive_enabled) {
		conn->must_close = 1;
	}

	/* Important: on new connection, reset the receiving buffer. Credit
	 * goes to crule42. */
	conn->data_len = 0;
	conn->handled_requests = 0;
	mg_set_user_connection_data(conn, NULL);

#if defined(USE_SERVER_STATS)
	conn->conn_state = 2; /* init */
#endif

	/* call the init_connection callback if assigned */
	if (conn->phys_ctx->callbacks.init_connection != NULL) {
		if (conn->phys_ctx->context_type == CONTEXT_SERVER) {
			void *conn_data = NULL;
			conn->phys_ctx->callbacks.init_connection(conn, &conn_data);
			mg_set_user_connection_data(conn, conn_data);
		}
	}
}


/* Process a connection - may handle multiple requests
 * using the same connection.
 * Must be called with a valid connection (conn  and
 * conn->phys_ctx must be valid).
 */
static void
process_new_connection(struct mg_connection *conn)
{
	struct mg_request_info *ri = &conn->request_info;
	int keep_alive, discard_len;
	char ebuf[100];
	const char *hostend;
	int reqerr, uri_type;

#if defined(USE_SERVER_STATS)
	int mcon = mg_atomic_inc(&(conn->phys_ctx->active_connections));
	mg_atomic_add(&(conn->phys_ctx->total_connections), 1);
	if (mcon > (conn->phys_ctx->max_connections)) {
		/* could use atomic compare exchange, but this
		 * seems overkill for statistics data */
		conn->phys_ctx->max_connections = mcon;
	}
#endif

	init_connection(conn);

	DEBUG_TRACE("Start processing connection from %s",
	            conn->request_info.remote_addr);

	/* Loop over multiple requests sent using the same connection
	 * (while "keep alive"). */
	do {

		DEBUG_TRACE("calling get_request (%i times for this connection)",
		            conn->handled_requests + 1);

#if defined(USE_SERVER_STATS)
		conn->conn_state = 3; /* ready */
#endif

		if (!get_request(conn, ebuf, sizeof(ebuf), &reqerr)) {
			/* The request sent by the client could not be understood by
			 * the server, or it was incomplete or a timeout. Send an
			 * error message and close the connection. */
			if (reqerr > 0) {
				DEBUG_ASSERT(ebuf[0] != '\0');
				mg_send_http_error(conn, reqerr, "%s", ebuf);
			}
		} else if (strcmp(ri->http_version, "1.0")
		           && strcmp(ri->http_version, "1.1")) {
			mg_snprintf(conn,
			            NULL, /* No truncation check for ebuf */
			            ebuf,
			            sizeof(ebuf),
			            "Bad HTTP version: [%s]",
			            ri->http_version);
			mg_send_http_error(conn, 505, "%s", ebuf);
		}

		if (ebuf[0] == '\0') {
			uri_type = get_uri_type(conn->request_info.request_uri);
			switch (uri_type) {
			case 1:
				/* Asterisk */
				conn->request_info.local_uri = NULL;
				break;
			case 2:
				/* relative uri */
				conn->request_info.local_uri = conn->request_info.request_uri;
				break;
			case 3:
			case 4:
				/* absolute uri (with/without port) */
				hostend = get_rel_url_at_current_server(
				    conn->request_info.request_uri, conn);
				if (hostend) {
					conn->request_info.local_uri = hostend;
				} else {
					conn->request_info.local_uri = NULL;
				}
				break;
			default:
				mg_snprintf(conn,
				            NULL, /* No truncation check for ebuf */
				            ebuf,
				            sizeof(ebuf),
				            "Invalid URI");
				mg_send_http_error(conn, 400, "%s", ebuf);
				conn->request_info.local_uri = NULL;
				break;
			}

#if defined(MG_LEGACY_INTERFACE)
			/* Legacy before split into local_uri and request_uri */
			conn->request_info.uri = conn->request_info.local_uri;
#endif
		}

		DEBUG_TRACE("http: %s, error: %s",
		            (ri->http_version ? ri->http_version : "none"),
		            (ebuf[0] ? ebuf : "none"));

		if (ebuf[0] == '\0') {
			if (conn->request_info.local_uri) {

/* handle request to local server */
#if defined(USE_SERVER_STATS)
				conn->conn_state = 4; /* processing */
#endif
				handle_request(conn);

#if defined(USE_SERVER_STATS)
				conn->conn_state = 5; /* processed */

				mg_atomic_add(&(conn->phys_ctx->total_data_read),
				              conn->consumed_content);
				mg_atomic_add(&(conn->phys_ctx->total_data_written),
				              conn->num_bytes_sent);
#endif

				DEBUG_TRACE("%s", "handle_request done");

				if (conn->phys_ctx->callbacks.end_request != NULL) {
					conn->phys_ctx->callbacks.end_request(conn,
					                                      conn->status_code);
					DEBUG_TRACE("%s", "end_request callback done");
				}
				log_access(conn);
			} else {
				/* TODO: handle non-local request (PROXY) */
				conn->must_close = 1;
			}
		} else {
			conn->must_close = 1;
		}

		if (ri->remote_user != NULL) {
			mg_free((void *)ri->remote_user);
			/* Important! When having connections with and without auth
			 * would cause double free and then crash */
			ri->remote_user = NULL;
		}

		/* NOTE(lsm): order is important here. should_keep_alive() call
		 * is using parsed request, which will be invalid after
		 * memmove's below.
		 * Therefore, memorize should_keep_alive() result now for later
		 * use in loop exit condition. */
		keep_alive = (conn->phys_ctx->stop_flag == 0) && should_keep_alive(conn)
		             && (conn->content_len >= 0);


		/* Discard all buffered data for this request */
		discard_len = ((conn->content_len >= 0) && (conn->request_len > 0)
		               && ((conn->request_len + conn->content_len)
		                   < (int64_t)conn->data_len))
		                  ? (int)(conn->request_len + conn->content_len)
		                  : conn->data_len;
		DEBUG_ASSERT(discard_len >= 0);
		if (discard_len < 0) {
			DEBUG_TRACE("internal error: discard_len = %li",
			            (long int)discard_len);
			break;
		}
		conn->data_len -= discard_len;
		if (conn->data_len > 0) {
			DEBUG_TRACE("discard_len = %lu", (long unsigned)discard_len);
			memmove(conn->buf, conn->buf + discard_len, (size_t)conn->data_len);
		}

		DEBUG_ASSERT(conn->data_len >= 0);
		DEBUG_ASSERT(conn->data_len <= conn->buf_size);

		if ((conn->data_len < 0) || (conn->data_len > conn->buf_size)) {
			DEBUG_TRACE("internal error: data_len = %li, buf_size = %li",
			            (long int)conn->data_len,
			            (long int)conn->buf_size);
			break;
		}

		conn->handled_requests++;

	} while (keep_alive);

	DEBUG_TRACE("Done processing connection from %s (%f sec)",
	            conn->request_info.remote_addr,
	            difftime(time(NULL), conn->conn_birth_time));

	close_connection(conn);

#if defined(USE_SERVER_STATS)
	mg_atomic_add(&(conn->phys_ctx->total_requests), conn->handled_requests);
	mg_atomic_dec(&(conn->phys_ctx->active_connections));
#endif
}


#if defined(ALTERNATIVE_QUEUE)

static void
produce_socket(struct mg_context *ctx, const struct socket *sp)
{
	unsigned int i;

	while (!ctx->stop_flag) {
		for (i = 0; i < ctx->cfg_worker_threads; i++) {
			/* find a free worker slot and signal it */
			if (ctx->client_socks[i].in_use == 0) {
				ctx->client_socks[i] = *sp;
				ctx->client_socks[i].in_use = 1;
				event_signal(ctx->client_wait_events[i]);
				return;
			}
		}
		/* queue is full */
		mg_sleep(1);
	}
}


static int
consume_socket(struct mg_context *ctx, struct socket *sp, int thread_index)
{
	DEBUG_TRACE("%s", "going idle");
	ctx->client_socks[thread_index].in_use = 0;
	event_wait(ctx->client_wait_events[thread_index]);
	*sp = ctx->client_socks[thread_index];
	DEBUG_TRACE("grabbed socket %d, going busy", sp ? sp->sock : -1);

	return !ctx->stop_flag;
}

#else /* ALTERNATIVE_QUEUE */

/* Worker threads take accepted socket from the queue */
static int
consume_socket(struct mg_context *ctx, struct socket *sp, int thread_index)
{
#define QUEUE_SIZE(ctx) ((int)(ARRAY_SIZE(ctx->queue)))

	(void)thread_index;

	(void)pthread_mutex_lock(&ctx->thread_mutex);
	DEBUG_TRACE("%s", "going idle");

	/* If the queue is empty, wait. We're idle at this point. */
	while ((ctx->sq_head == ctx->sq_tail) && (ctx->stop_flag == 0)) {
		pthread_cond_wait(&ctx->sq_full, &ctx->thread_mutex);
	}

	/* If we're stopping, sq_head may be equal to sq_tail. */
	if (ctx->sq_head > ctx->sq_tail) {
		/* Copy socket from the queue and increment tail */
		*sp = ctx->queue[ctx->sq_tail % QUEUE_SIZE(ctx)];
		ctx->sq_tail++;

		DEBUG_TRACE("grabbed socket %d, going busy", sp ? sp->sock : -1);

		/* Wrap pointers if needed */
		while (ctx->sq_tail > QUEUE_SIZE(ctx)) {
			ctx->sq_tail -= QUEUE_SIZE(ctx);
			ctx->sq_head -= QUEUE_SIZE(ctx);
		}
	}

	(void)pthread_cond_signal(&ctx->sq_empty);
	(void)pthread_mutex_unlock(&ctx->thread_mutex);

	return !ctx->stop_flag;
#undef QUEUE_SIZE
}


/* Master thread adds accepted socket to a queue */
static void
produce_socket(struct mg_context *ctx, const struct socket *sp)
{
#define QUEUE_SIZE(ctx) ((int)(ARRAY_SIZE(ctx->queue)))
	if (!ctx) {
		return;
	}
	(void)pthread_mutex_lock(&ctx->thread_mutex);

	/* If the queue is full, wait */
	while ((ctx->stop_flag == 0)
	       && (ctx->sq_head - ctx->sq_tail >= QUEUE_SIZE(ctx))) {
		(void)pthread_cond_wait(&ctx->sq_empty, &ctx->thread_mutex);
	}

	if (ctx->sq_head - ctx->sq_tail < QUEUE_SIZE(ctx)) {
		/* Copy socket to the queue and increment head */
		ctx->queue[ctx->sq_head % QUEUE_SIZE(ctx)] = *sp;
		ctx->sq_head++;
		DEBUG_TRACE("queued socket %d", sp ? sp->sock : -1);
	}

	(void)pthread_cond_signal(&ctx->sq_full);
	(void)pthread_mutex_unlock(&ctx->thread_mutex);
#undef QUEUE_SIZE
}
#endif /* ALTERNATIVE_QUEUE */


struct worker_thread_args {
	struct mg_context *ctx;
	int index;
};


static void *
worker_thread_run(struct worker_thread_args *thread_args)
{
	struct mg_context *ctx = thread_args->ctx;
	struct mg_connection *conn;
	struct mg_workerTLS tls;
#if defined(MG_LEGACY_INTERFACE)
	uint32_t addr;
#endif

	mg_set_thread_name("worker");

	tls.is_master = 0;
	tls.thread_idx = (unsigned)mg_atomic_inc(&thread_idx_max);
#if defined(_WIN32)
	tls.pthread_cond_helper_mutex = CreateEvent(NULL, FALSE, FALSE, NULL);
#endif

	/* Initialize thread local storage before calling any callback */
	pthread_setspecific(sTlsKey, &tls);

	if (ctx->callbacks.init_thread) {
		/* call init_thread for a worker thread (type 1) */
		ctx->callbacks.init_thread(ctx, 1);
	}

	/* Connection structure has been pre-allocated */
	if (((int)thread_args->index < 0)
	    || ((unsigned)thread_args->index
	        >= (unsigned)ctx->cfg_worker_threads)) {
		mg_cry_internal(fc(ctx),
		                "Internal error: Invalid worker index %i",
		                (int)thread_args->index);
		return NULL;
	}
	conn = ctx->worker_connections + thread_args->index;

	/* Request buffers are not pre-allocated. They are private to the
	 * request and do not contain any state information that might be
	 * of interest to anyone observing a server status.  */
	conn->buf = (char *)mg_malloc_ctx(ctx->max_request_size, conn->phys_ctx);
	if (conn->buf == NULL) {
		mg_cry_internal(fc(ctx),
		                "Out of memory: Cannot allocate buffer for worker %i",
		                (int)thread_args->index);
		return NULL;
	}
	conn->buf_size = (int)ctx->max_request_size;

	conn->phys_ctx = ctx;
	conn->dom_ctx = &(ctx->dd); /* Use default domain and default host */
	conn->host = NULL;          /* until we have more information. */

	conn->thread_index = thread_args->index;
	conn->request_info.user_data = ctx->user_data;
	/* Allocate a mutex for this connection to allow communication both
	 * within the request handler and from elsewhere in the application
	 */
	if (0 != pthread_mutex_init(&conn->mutex, &pthread_mutex_attr)) {
		mg_free(conn->buf);
		mg_cry_internal(fc(ctx), "%s", "Cannot create mutex");
		return NULL;
	}

#if defined(USE_SERVER_STATS)
	conn->conn_state = 1; /* not consumed */
#endif

#if defined(ALTERNATIVE_QUEUE)
	while ((ctx->stop_flag == 0)
	       && consume_socket(ctx, &conn->client, conn->thread_index)) {
#else
	/* Call consume_socket() even when ctx->stop_flag > 0, to let it
	 * signal sq_empty condvar to wake up the master waiting in
	 * produce_socket() */
	while (consume_socket(ctx, &conn->client, conn->thread_index)) {
#endif

		conn->conn_birth_time = time(NULL);

/* Fill in IP, port info early so even if SSL setup below fails,
 * error handler would have the corresponding info.
 * Thanks to Johannes Winkelmann for the patch.
 */
#if defined(USE_IPV6)
		if (conn->client.rsa.sa.sa_family == AF_INET6) {
			conn->request_info.remote_port =
			    ntohs(conn->client.rsa.sin6.sin6_port);
		} else
#endif
		{
			conn->request_info.remote_port =
			    ntohs(conn->client.rsa.sin.sin_port);
		}

		sockaddr_to_string(conn->request_info.remote_addr,
		                   sizeof(conn->request_info.remote_addr),
		                   &conn->client.rsa);

		DEBUG_TRACE("Start processing connection from %s",
		            conn->request_info.remote_addr);

		conn->request_info.is_ssl = conn->client.is_ssl;

		if (conn->client.is_ssl) {
#if !defined(NO_SSL)
			/* HTTPS connection */
			if (sslize(conn,
			           conn->dom_ctx->ssl_ctx,
			           SSL_accept,
			           &(conn->phys_ctx->stop_flag))) {
				/* conn->dom_ctx is set in get_request */

				/* Get SSL client certificate information (if set) */
				ssl_get_client_cert_info(conn);

				/* process HTTPS connection */
				process_new_connection(conn);

				/* Free client certificate info */
				if (conn->request_info.client_cert) {
					mg_free((void *)(conn->request_info.client_cert->subject));
					mg_free((void *)(conn->request_info.client_cert->issuer));
					mg_free((void *)(conn->request_info.client_cert->serial));
					mg_free((void *)(conn->request_info.client_cert->finger));
					/* Free certificate memory */
					X509_free(
					    (X509 *)conn->request_info.client_cert->peer_cert);
					conn->request_info.client_cert->peer_cert = 0;
					conn->request_info.client_cert->subject = 0;
					conn->request_info.client_cert->issuer = 0;
					conn->request_info.client_cert->serial = 0;
					conn->request_info.client_cert->finger = 0;
					mg_free(conn->request_info.client_cert);
					conn->request_info.client_cert = 0;
				}
			} else {
				/* make sure the connection is cleaned up on SSL failure */
				close_connection(conn);
			}
#endif
		} else {
			/* process HTTP connection */
			process_new_connection(conn);
		}

		DEBUG_TRACE("%s", "Connection closed");
	}


	pthread_setspecific(sTlsKey, NULL);
#if defined(_WIN32)
	CloseHandle(tls.pthread_cond_helper_mutex);
#endif
	pthread_mutex_destroy(&conn->mutex);

	/* Free the request buffer. */
	conn->buf_size = 0;
	mg_free(conn->buf);
	conn->buf = NULL;

#if defined(USE_SERVER_STATS)
	conn->conn_state = 9; /* done */
#endif

	DEBUG_TRACE("%s", "exiting");
	return NULL;
}


/* Threads have different return types on Windows and Unix. */
#if defined(_WIN32)
static unsigned __stdcall worker_thread(void *thread_func_param)
{
	struct worker_thread_args *pwta =
	    (struct worker_thread_args *)thread_func_param;
	worker_thread_run(pwta);
	mg_free(thread_func_param);
	return 0;
}
#else
static void *
worker_thread(void *thread_func_param)
{
	struct worker_thread_args *pwta =
	    (struct worker_thread_args *)thread_func_param;
	struct sigaction sa;

	/* Ignore SIGPIPE */
	memset(&sa, 0, sizeof(sa));
	sa.sa_handler = SIG_IGN;
	sigaction(SIGPIPE, &sa, NULL);

	worker_thread_run(pwta);
	mg_free(thread_func_param);
	return NULL;
}
#endif /* _WIN32 */


/* This is an internal function, thus all arguments are expected to be
 * valid - a NULL check is not required. */
static void
accept_new_connection(const struct socket *listener, struct mg_context *ctx)
{
	struct socket so;
	char src_addr[IP_ADDR_STR_LEN];
	socklen_t len = sizeof(so.rsa);
	int on = 1;

	if ((so.sock = accept(listener->sock, &so.rsa.sa, &len))
	    == INVALID_SOCKET) {
	} else if (!check_acl(ctx, ntohl(*(uint32_t *)&so.rsa.sin.sin_addr))) {
		sockaddr_to_string(src_addr, sizeof(src_addr), &so.rsa);
		mg_cry_internal(fc(ctx),
		                "%s: %s is not allowed to connect",
		                __func__,
		                src_addr);
		closesocket(so.sock);
	} else {
		/* Put so socket structure into the queue */
		DEBUG_TRACE("Accepted socket %d", (int)so.sock);
		set_close_on_exec(so.sock, fc(ctx));
		so.is_ssl = listener->is_ssl;
		so.ssl_redir = listener->ssl_redir;
		if (getsockname(so.sock, &so.lsa.sa, &len) != 0) {
			mg_cry_internal(fc(ctx),
			                "%s: getsockname() failed: %s",
			                __func__,
			                strerror(ERRNO));
		}

		/* Set TCP keep-alive. This is needed because if HTTP-level
		 * keep-alive
		 * is enabled, and client resets the connection, server won't get
		 * TCP FIN or RST and will keep the connection open forever. With
		 * TCP keep-alive, next keep-alive handshake will figure out that
		 * the client is down and will close the server end.
		 * Thanks to Igor Klopov who suggested the patch. */
		if (setsockopt(so.sock,
		               SOL_SOCKET,
		               SO_KEEPALIVE,
		               (SOCK_OPT_TYPE)&on,
		               sizeof(on))
		    != 0) {
			mg_cry_internal(
			    fc(ctx),
			    "%s: setsockopt(SOL_SOCKET SO_KEEPALIVE) failed: %s",
			    __func__,
			    strerror(ERRNO));
		}

		/* Disable TCP Nagle's algorithm. Normally TCP packets are coalesced
		 * to effectively fill up the underlying IP packet payload and
		 * reduce the overhead of sending lots of small buffers. However
		 * this hurts the server's throughput (ie. operations per second)
		 * when HTTP 1.1 persistent connections are used and the responses
		 * are relatively small (eg. less than 1400 bytes).
		 */
		if ((ctx->dd.config[CONFIG_TCP_NODELAY] != NULL)
		    && (!strcmp(ctx->dd.config[CONFIG_TCP_NODELAY], "1"))) {
			if (set_tcp_nodelay(so.sock, 1) != 0) {
				mg_cry_internal(
				    fc(ctx),
				    "%s: setsockopt(IPPROTO_TCP TCP_NODELAY) failed: %s",
				    __func__,
				    strerror(ERRNO));
			}
		}

		/* We are using non-blocking sockets. Thus, the
		 * set_sock_timeout(so.sock, timeout);
		 * call is no longer required. */

		/* The "non blocking" property should already be
		 * inherited from the parent socket. Set it for
		 * non-compliant socket implementations. */
		set_non_blocking_mode(so.sock);

		so.in_use = 0;
		produce_socket(ctx, &so);
	}
}


static void
master_thread_run(void *thread_func_param)
{
	struct mg_context *ctx = (struct mg_context *)thread_func_param;
	struct mg_workerTLS tls;
	struct pollfd *pfd;
	unsigned int i;
	unsigned int workerthreadcount;

	if (!ctx) {
		return;
	}

	mg_set_thread_name("master");

/* Increase priority of the master thread */
#if defined(_WIN32)
	SetThreadPriority(GetCurrentThread(), THREAD_PRIORITY_ABOVE_NORMAL);
#elif defined(USE_MASTER_THREAD_PRIORITY)
	int min_prio = sched_get_priority_min(SCHED_RR);
	int max_prio = sched_get_priority_max(SCHED_RR);
	if ((min_prio >= 0) && (max_prio >= 0)
	    && ((USE_MASTER_THREAD_PRIORITY) <= max_prio)
	    && ((USE_MASTER_THREAD_PRIORITY) >= min_prio)) {
		struct sched_param sched_param = {0};
		sched_param.sched_priority = (USE_MASTER_THREAD_PRIORITY);
		pthread_setschedparam(pthread_self(), SCHED_RR, &sched_param);
	}
#endif

/* Initialize thread local storage */
#if defined(_WIN32)
	tls.pthread_cond_helper_mutex = CreateEvent(NULL, FALSE, FALSE, NULL);
#endif
	tls.is_master = 1;
	pthread_setspecific(sTlsKey, &tls);

	if (ctx->callbacks.init_thread) {
		/* Callback for the master thread (type 0) */
		ctx->callbacks.init_thread(ctx, 0);
	}

	/* Server starts *now* */
	ctx->start_time = time(NULL);

	/* Start the server */
	pfd = ctx->listening_socket_fds;
	while (ctx->stop_flag == 0) {
		for (i = 0; i < ctx->num_listening_sockets; i++) {
			pfd[i].fd = ctx->listening_sockets[i].sock;
			pfd[i].events = POLLIN;
		}

		if (poll(pfd, ctx->num_listening_sockets, 200) > 0) {
			for (i = 0; i < ctx->num_listening_sockets; i++) {
				/* NOTE(lsm): on QNX, poll() returns POLLRDNORM after the
				 * successful poll, and POLLIN is defined as
				 * (POLLRDNORM | POLLRDBAND)
				 * Therefore, we're checking pfd[i].revents & POLLIN, not
				 * pfd[i].revents == POLLIN. */
				if ((ctx->stop_flag == 0) && (pfd[i].revents & POLLIN)) {
					accept_new_connection(&ctx->listening_sockets[i], ctx);
				}
			}
		}
	}

	/* Here stop_flag is 1 - Initiate shutdown. */
	DEBUG_TRACE("%s", "stopping workers");

	/* Stop signal received: somebody called mg_stop. Quit. */
	close_all_listening_sockets(ctx);

	/* Wakeup workers that are waiting for connections to handle. */
	(void)pthread_mutex_lock(&ctx->thread_mutex);
#if defined(ALTERNATIVE_QUEUE)
	for (i = 0; i < ctx->cfg_worker_threads; i++) {
		event_signal(ctx->client_wait_events[i]);

		/* Since we know all sockets, we can shutdown the connections. */
		if (ctx->client_socks[i].in_use) {
			shutdown(ctx->client_socks[i].sock, SHUTDOWN_BOTH);
		}
	}
#else
	pthread_cond_broadcast(&ctx->sq_full);
#endif
	(void)pthread_mutex_unlock(&ctx->thread_mutex);

	/* Join all worker threads to avoid leaking threads. */
	workerthreadcount = ctx->cfg_worker_threads;
	for (i = 0; i < workerthreadcount; i++) {
		if (ctx->worker_threadids[i] != 0) {
			mg_join_thread(ctx->worker_threadids[i]);
		}
	}

#if defined(USE_LUA)
	/* Free Lua state of lua background task */
	if (ctx->lua_background_state) {
		lua_State *lstate = (lua_State *)ctx->lua_background_state;
		lua_getglobal(lstate, LUABACKGROUNDPARAMS);
		if (lua_istable(lstate, -1)) {
			reg_boolean(lstate, "shutdown", 1);
			lua_pop(lstate, 1);
			mg_sleep(2);
		}
		lua_close(lstate);
		ctx->lua_background_state = 0;
	}
#endif

	DEBUG_TRACE("%s", "exiting");

#if defined(_WIN32)
	CloseHandle(tls.pthread_cond_helper_mutex);
#endif
	pthread_setspecific(sTlsKey, NULL);

	/* Signal mg_stop() that we're done.
	 * WARNING: This must be the very last thing this
	 * thread does, as ctx becomes invalid after this line. */
	ctx->stop_flag = 2;
}


/* Threads have different return types on Windows and Unix. */
#if defined(_WIN32)
static unsigned __stdcall master_thread(void *thread_func_param)
{
	master_thread_run(thread_func_param);
	return 0;
}
#else
static void *
master_thread(void *thread_func_param)
{
	struct sigaction sa;

	/* Ignore SIGPIPE */
	memset(&sa, 0, sizeof(sa));
	sa.sa_handler = SIG_IGN;
	sigaction(SIGPIPE, &sa, NULL);

	master_thread_run(thread_func_param);
	return NULL;
}
#endif /* _WIN32 */


static void
free_context(struct mg_context *ctx)
{
	int i;
	struct mg_handler_info *tmp_rh;

	if (ctx == NULL) {
		return;
	}

	if (ctx->callbacks.exit_context) {
		ctx->callbacks.exit_context(ctx);
	}

	/* All threads exited, no sync is needed. Destroy thread mutex and
	 * condvars
	 */
	(void)pthread_mutex_destroy(&ctx->thread_mutex);
#if defined(ALTERNATIVE_QUEUE)
	mg_free(ctx->client_socks);
	for (i = 0; (unsigned)i < ctx->cfg_worker_threads; i++) {
		event_destroy(ctx->client_wait_events[i]);
	}
	mg_free(ctx->client_wait_events);
#else
	(void)pthread_cond_destroy(&ctx->sq_empty);
	(void)pthread_cond_destroy(&ctx->sq_full);
#endif

	/* Destroy other context global data structures mutex */
	(void)pthread_mutex_destroy(&ctx->nonce_mutex);

#if defined(USE_TIMERS)
	timers_exit(ctx);
#endif

	/* Deallocate config parameters */
	for (i = 0; i < NUM_OPTIONS; i++) {
		if (ctx->dd.config[i] != NULL) {
#if defined(_MSC_VER)
#pragma warning(suppress : 6001)
#endif
			mg_free(ctx->dd.config[i]);
		}
	}

	/* Deallocate request handlers */
	while (ctx->dd.handlers) {
		tmp_rh = ctx->dd.handlers;
		ctx->dd.handlers = tmp_rh->next;
		if (tmp_rh->handler_type == REQUEST_HANDLER) {
			pthread_cond_destroy(&tmp_rh->refcount_cond);
			pthread_mutex_destroy(&tmp_rh->refcount_mutex);
		}
		mg_free(tmp_rh->uri);
		mg_free(tmp_rh);
	}

#if !defined(NO_SSL)
	/* Deallocate SSL context */
	if (ctx->dd.ssl_ctx != NULL) {
		void *ssl_ctx = (void *)ctx->dd.ssl_ctx;
		int callback_ret =
		    (ctx->callbacks.external_ssl_ctx == NULL)
		        ? 0
		        : (ctx->callbacks.external_ssl_ctx(&ssl_ctx, ctx->user_data));

		if (callback_ret == 0) {
			SSL_CTX_free(ctx->dd.ssl_ctx);
		}
		/* else: ignore error and ommit SSL_CTX_free in case
		 * callback_ret is 1 */
	}
#endif /* !NO_SSL */

	/* Deallocate worker thread ID array */
	if (ctx->worker_threadids != NULL) {
		mg_free(ctx->worker_threadids);
	}

	/* Deallocate worker thread ID array */
	if (ctx->worker_connections != NULL) {
		mg_free(ctx->worker_connections);
	}

	/* deallocate system name string */
	mg_free(ctx->systemName);

	/* Deallocate context itself */
	mg_free(ctx);
}


void
mg_stop(struct mg_context *ctx)
{
	pthread_t mt;
	if (!ctx) {
		return;
	}

	/* We don't use a lock here. Calling mg_stop with the same ctx from
	 * two threads is not allowed. */
	mt = ctx->masterthreadid;
	if (mt == 0) {
		return;
	}

	ctx->masterthreadid = 0;

	/* Set stop flag, so all threads know they have to exit. */
	ctx->stop_flag = 1;

	/* Wait until everything has stopped. */
	while (ctx->stop_flag != 2) {
		(void)mg_sleep(10);
	}

	mg_join_thread(mt);
	free_context(ctx);

#if defined(_WIN32)
	(void)WSACleanup();
#endif /* _WIN32 */
}


static void
get_system_name(char **sysName)
{
#if defined(_WIN32)
#if !defined(__SYMBIAN32__)
#if defined(_WIN32_WCE)
	*sysName = mg_strdup("WinCE");
#else
	char name[128];
	DWORD dwVersion = 0;
	DWORD dwMajorVersion = 0;
	DWORD dwMinorVersion = 0;
	DWORD dwBuild = 0;
	BOOL wowRet, isWoW = FALSE;

#if defined(_MSC_VER)
#pragma warning(push)
/* GetVersion was declared deprecated */
#pragma warning(disable : 4996)
#endif
	dwVersion = GetVersion();
#if defined(_MSC_VER)
#pragma warning(pop)
#endif

	dwMajorVersion = (DWORD)(LOBYTE(LOWORD(dwVersion)));
	dwMinorVersion = (DWORD)(HIBYTE(LOWORD(dwVersion)));
	dwBuild = ((dwVersion < 0x80000000) ? (DWORD)(HIWORD(dwVersion)) : 0);
	(void)dwBuild;

	wowRet = IsWow64Process(GetCurrentProcess(), &isWoW);

	sprintf(name,
	        "Windows %u.%u%s",
	        (unsigned)dwMajorVersion,
	        (unsigned)dwMinorVersion,
	        (wowRet ? (isWoW ? " (WoW64)" : "") : " (?)"));

	*sysName = mg_strdup(name);
#endif
#else
	*sysName = mg_strdup("Symbian");
#endif
#else
	struct utsname name;
	memset(&name, 0, sizeof(name));
	uname(&name);
	*sysName = mg_strdup(name.sysname);
#endif
}


struct mg_context *
mg_start(const struct mg_callbacks *callbacks,
         void *user_data,
         const char **options)
{
	struct mg_context *ctx;
	const char *name, *value, *default_value;
	int idx, ok, workerthreadcount;
	unsigned int i;
	int itmp;
	void (*exit_callback)(const struct mg_context *ctx) = 0;

	struct mg_workerTLS tls;

#if defined(_WIN32)
	WSADATA data;
	WSAStartup(MAKEWORD(2, 2), &data);
#endif /* _WIN32  */

	/* Allocate context and initialize reasonable general case defaults. */
	if ((ctx = (struct mg_context *)mg_calloc(1, sizeof(*ctx))) == NULL) {
		return NULL;
	}

	/* Random number generator will initialize at the first call */
	ctx->dd.auth_nonce_mask =
	    (uint64_t)get_random() ^ (uint64_t)(ptrdiff_t)(options);

	if (mg_init_library_called == 0) {
		/* Legacy INIT, if mg_start is called without mg_init_library.
		 * Note: This may cause a memory leak */
		const char *ports_option =
		    config_options[LISTENING_PORTS].default_value;

		if (options) {
			const char **run_options = options;
			const char *optname = config_options[LISTENING_PORTS].name;

			/* Try to find the "listening_ports" option */
			while (*run_options) {
				if (!strcmp(*run_options, optname)) {
					ports_option = run_options[1];
				}
				run_options += 2;
			}
		}

		if (is_ssl_port_used(ports_option)) {
			/* Initialize with SSL support */
			mg_init_library(MG_FEATURES_TLS);
		} else {
			/* Initialize without SSL support */
			mg_init_library(MG_FEATURES_DEFAULT);
		}
	}

	tls.is_master = -1;
	tls.thread_idx = (unsigned)mg_atomic_inc(&thread_idx_max);
#if defined(_WIN32)
	tls.pthread_cond_helper_mutex = NULL;
#endif
	pthread_setspecific(sTlsKey, &tls);

	ok = (0 == pthread_mutex_init(&ctx->thread_mutex, &pthread_mutex_attr));
#if !defined(ALTERNATIVE_QUEUE)
	ok &= (0 == pthread_cond_init(&ctx->sq_empty, NULL));
	ok &= (0 == pthread_cond_init(&ctx->sq_full, NULL));
#endif
	ok &= (0 == pthread_mutex_init(&ctx->nonce_mutex, &pthread_mutex_attr));
	if (!ok) {
		/* Fatal error - abort start. However, this situation should never
		 * occur in practice. */
		mg_cry_internal(fc(ctx),
		                "%s",
		                "Cannot initialize thread synchronization objects");
		mg_free(ctx);
		pthread_setspecific(sTlsKey, NULL);
		return NULL;
	}

	if (callbacks) {
		ctx->callbacks = *callbacks;
		exit_callback = callbacks->exit_context;
		ctx->callbacks.exit_context = 0;
	}
	ctx->user_data = user_data;
	ctx->dd.handlers = NULL;
	ctx->dd.next = NULL;

#if defined(USE_LUA) && defined(USE_WEBSOCKET)
	ctx->dd.shared_lua_websockets = NULL;
#endif

	/* Store options */
	while (options && (name = *options++) != NULL) {
		if ((idx = get_option_index(name)) == -1) {
			mg_cry_internal(fc(ctx), "Invalid option: %s", name);
			free_context(ctx);
			pthread_setspecific(sTlsKey, NULL);
			return NULL;
		} else if ((value = *options++) == NULL) {
			mg_cry_internal(fc(ctx), "%s: option value cannot be NULL", name);
			free_context(ctx);
			pthread_setspecific(sTlsKey, NULL);
			return NULL;
		}
		if (ctx->dd.config[idx] != NULL) {
			mg_cry_internal(fc(ctx), "warning: %s: duplicate option", name);
			mg_free(ctx->dd.config[idx]);
		}
		ctx->dd.config[idx] = mg_strdup_ctx(value, ctx);
		DEBUG_TRACE("[%s] -> [%s]", name, value);
	}

	/* Set default value if needed */
	for (i = 0; config_options[i].name != NULL; i++) {
		default_value = config_options[i].default_value;
		if ((ctx->dd.config[i] == NULL) && (default_value != NULL)) {
			ctx->dd.config[i] = mg_strdup_ctx(default_value, ctx);
		}
	}

	/* Request size option */
	itmp = atoi(ctx->dd.config[MAX_REQUEST_SIZE]);
	if (itmp < 1024) {
		mg_cry_internal(fc(ctx), "%s", "max_request_size too small");
		free_context(ctx);
		pthread_setspecific(sTlsKey, NULL);
		return NULL;
	}
	ctx->max_request_size = (unsigned)itmp;

	/* Worker thread count option */
	workerthreadcount = atoi(ctx->dd.config[NUM_THREADS]);

	if (workerthreadcount > MAX_WORKER_THREADS) {
		mg_cry_internal(fc(ctx), "%s", "Too many worker threads");
		free_context(ctx);
		pthread_setspecific(sTlsKey, NULL);
		return NULL;
	}

	if (workerthreadcount <= 0) {
		mg_cry_internal(fc(ctx), "%s", "Invalid number of worker threads");
		free_context(ctx);
		pthread_setspecific(sTlsKey, NULL);
		return NULL;
	}

/* Document root */
#if defined(NO_FILES)
	if (ctx->dd.config[DOCUMENT_ROOT] != NULL) {
		mg_cry_internal(fc(ctx), "%s", "Document root must not be set");
		free_context(ctx);
		pthread_setspecific(sTlsKey, NULL);
		return NULL;
	}
#endif

	get_system_name(&ctx->systemName);

#if defined(USE_LUA)
	/* If a Lua background script has been configured, start it. */
	if (ctx->dd.config[LUA_BACKGROUND_SCRIPT] != NULL) {
		char ebuf[256];
		struct vec opt_vec;
		struct vec eq_vec;
		const char *sparams;
		lua_State *state = mg_prepare_lua_context_script(
		    ctx->dd.config[LUA_BACKGROUND_SCRIPT], ctx, ebuf, sizeof(ebuf));
		if (!state) {
			mg_cry_internal(fc(ctx), "lua_background_script error: %s", ebuf);
			free_context(ctx);
			pthread_setspecific(sTlsKey, NULL);
			return NULL;
		}
		ctx->lua_background_state = (void *)state;

		lua_newtable(state);
		reg_boolean(state, "shutdown", 0);

		sparams = ctx->dd.config[LUA_BACKGROUND_SCRIPT_PARAMS];

		while ((sparams = next_option(sparams, &opt_vec, &eq_vec)) != NULL) {
			reg_llstring(
			    state, opt_vec.ptr, opt_vec.len, eq_vec.ptr, eq_vec.len);
			if (mg_strncasecmp(sparams, opt_vec.ptr, opt_vec.len) == 0)
				break;
		}
		lua_setglobal(state, LUABACKGROUNDPARAMS);

	} else {
		ctx->lua_background_state = 0;
	}
#endif

	/* NOTE(lsm): order is important here. SSL certificates must
	 * be initialized before listening ports. UID must be set last. */
	if (!set_gpass_option(ctx, NULL) ||
#if !defined(NO_SSL)
	    !init_ssl_ctx(ctx, NULL) ||
#endif
	    !set_ports_option(ctx) ||
#if !defined(_WIN32)
	    !set_uid_option(ctx) ||
#endif
	    !set_acl_option(ctx)) {
		free_context(ctx);
		pthread_setspecific(sTlsKey, NULL);
		return NULL;
	}

	ctx->cfg_worker_threads = ((unsigned int)(workerthreadcount));
	ctx->worker_threadids = (pthread_t *)mg_calloc_ctx(ctx->cfg_worker_threads,
	                                                   sizeof(pthread_t),
	                                                   ctx);

	if (ctx->worker_threadids == NULL) {
		mg_cry_internal(fc(ctx),
		                "%s",
		                "Not enough memory for worker thread ID array");
		free_context(ctx);
		pthread_setspecific(sTlsKey, NULL);
		return NULL;
	}
	ctx->worker_connections =
	    (struct mg_connection *)mg_calloc_ctx(ctx->cfg_worker_threads,
	                                          sizeof(struct mg_connection),
	                                          ctx);
	if (ctx->worker_connections == NULL) {
		mg_cry_internal(fc(ctx),
		                "%s",
		                "Not enough memory for worker thread connection array");
		free_context(ctx);
		pthread_setspecific(sTlsKey, NULL);
		return NULL;
	}


#if defined(ALTERNATIVE_QUEUE)
	ctx->client_wait_events =
	    (void **)mg_calloc_ctx(sizeof(ctx->client_wait_events[0]),
	                           ctx->cfg_worker_threads,
	                           ctx);
	if (ctx->client_wait_events == NULL) {
		mg_cry_internal(fc(ctx),
		                "%s",
		                "Not enough memory for worker event array");
		mg_free(ctx->worker_threadids);
		free_context(ctx);
		pthread_setspecific(sTlsKey, NULL);
		return NULL;
	}

	ctx->client_socks =
	    (struct socket *)mg_calloc_ctx(sizeof(ctx->client_socks[0]),
	                                   ctx->cfg_worker_threads,
	                                   ctx);
	if (ctx->client_socks == NULL) {
		mg_cry_internal(fc(ctx),
		                "%s",
		                "Not enough memory for worker socket array");
		mg_free(ctx->client_wait_events);
		mg_free(ctx->worker_threadids);
		free_context(ctx);
		pthread_setspecific(sTlsKey, NULL);
		return NULL;
	}

	for (i = 0; (unsigned)i < ctx->cfg_worker_threads; i++) {
		ctx->client_wait_events[i] = event_create();
		if (ctx->client_wait_events[i] == 0) {
			mg_cry_internal(fc(ctx), "Error creating worker event %i", i);
			while (i > 0) {
				i--;
				event_destroy(ctx->client_wait_events[i]);
			}
			mg_free(ctx->client_socks);
			mg_free(ctx->client_wait_events);
			mg_free(ctx->worker_threadids);
			free_context(ctx);
			pthread_setspecific(sTlsKey, NULL);
			return NULL;
		}
	}
#endif


#if defined(USE_TIMERS)
	if (timers_init(ctx) != 0) {
		mg_cry_internal(fc(ctx), "%s", "Error creating timers");
		free_context(ctx);
		pthread_setspecific(sTlsKey, NULL);
		return NULL;
	}
#endif

	/* Context has been created - init user libraries */
	if (ctx->callbacks.init_context) {
		ctx->callbacks.init_context(ctx);
	}
	ctx->callbacks.exit_context = exit_callback;
	ctx->context_type = CONTEXT_SERVER; /* server context */

	/* Start master (listening) thread */
	mg_start_thread_with_id(master_thread, ctx, &ctx->masterthreadid);

	/* Start worker threads */
	for (i = 0; i < ctx->cfg_worker_threads; i++) {
		struct worker_thread_args *wta = (struct worker_thread_args *)
		    mg_malloc_ctx(sizeof(struct worker_thread_args), ctx);
		if (wta) {
			wta->ctx = ctx;
			wta->index = (int)i;
		}

		if ((wta == NULL)
		    || (mg_start_thread_with_id(worker_thread,
		                                wta,
		                                &ctx->worker_threadids[i])
		        != 0)) {

			/* thread was not created */
			if (wta != NULL) {
				mg_free(wta);
			}

			if (i > 0) {
				mg_cry_internal(fc(ctx),
				                "Cannot start worker thread %i: error %ld",
				                i + 1,
				                (long)ERRNO);
			} else {
				mg_cry_internal(fc(ctx),
				                "Cannot create threads: error %ld",
				                (long)ERRNO);
				free_context(ctx);
				pthread_setspecific(sTlsKey, NULL);
				return NULL;
			}
			break;
		}
	}

	pthread_setspecific(sTlsKey, NULL);
	return ctx;
}


#if defined(MG_EXPERIMENTAL_INTERFACES)
/* Add an additional domain to an already running web server. */
int
mg_start_domain(struct mg_context *ctx, const char **options)
{
	const char *name;
	const char *value;
	const char *default_value;
	struct mg_domain_context *new_dom;
	struct mg_domain_context *dom;
	int idx, i;

	if ((ctx == NULL) || (ctx->stop_flag != 0) || (options == NULL)) {
		return -1;
	}

	new_dom = (struct mg_domain_context *)
	    mg_calloc_ctx(1, sizeof(struct mg_domain_context), ctx);

	if (!new_dom) {
		/* Out of memory */
		return -6;
	}

	/* Store options - TODO: unite duplicate code */
	while (options && (name = *options++) != NULL) {
		if ((idx = get_option_index(name)) == -1) {
			mg_cry_internal(fc(ctx), "Invalid option: %s", name);
			mg_free(new_dom);
			return -2;
		} else if ((value = *options++) == NULL) {
			mg_cry_internal(fc(ctx), "%s: option value cannot be NULL", name);
			mg_free(new_dom);
			return -2;
		}
		if (new_dom->config[idx] != NULL) {
			mg_cry_internal(fc(ctx), "warning: %s: duplicate option", name);
			mg_free(new_dom->config[idx]);
		}
		new_dom->config[idx] = mg_strdup_ctx(value, ctx);
		DEBUG_TRACE("[%s] -> [%s]", name, value);
	}

	/* Authentication domain is mandatory */
	/* TODO: Maybe use a new option hostname? */
	if (!new_dom->config[AUTHENTICATION_DOMAIN]) {
		mg_cry_internal(fc(ctx), "%s", "authentication domain required");
		mg_free(new_dom);
		return -4;
	}

	/* Set default value if needed. Take the config value from
	 * ctx as a default value. */
	for (i = 0; config_options[i].name != NULL; i++) {
		default_value = ctx->dd.config[i];
		if ((new_dom->config[i] == NULL) && (default_value != NULL)) {
			new_dom->config[i] = mg_strdup_ctx(default_value, ctx);
		}
	}

	new_dom->handlers = NULL;
	new_dom->next = NULL;
	new_dom->nonce_count = 0;
	new_dom->auth_nonce_mask =
	    (uint64_t)get_random() ^ ((uint64_t)get_random() << 31);

#if defined(USE_LUA) && defined(USE_WEBSOCKET)
	new_dom->shared_lua_websockets = NULL;
#endif

	if (!init_ssl_ctx(ctx, new_dom)) {
		/* Init SSL failed */
		mg_free(new_dom);
		return -3;
	}

	/* Add element to linked list. */
	mg_lock_context(ctx);

	idx = 0;
	dom = &(ctx->dd);
	for (;;) {
		if (!strcasecmp(new_dom->config[AUTHENTICATION_DOMAIN],
		                dom->config[AUTHENTICATION_DOMAIN])) {
			/* Domain collision */
			mg_cry_internal(fc(ctx),
			                "domain %s already in use",
			                new_dom->config[AUTHENTICATION_DOMAIN]);
			mg_free(new_dom);
			return -5;
		}

		/* Count number of domains */
		idx++;

		if (dom->next == NULL) {
			dom->next = new_dom;
			break;
		}
		dom = dom->next;
	}

	mg_unlock_context(ctx);

	/* Return domain number */
	return idx;
}
#endif


/* Feature check API function */
unsigned
mg_check_feature(unsigned feature)
{
	static const unsigned feature_set = 0
/* Set bits for available features according to API documentation.
 * This bit mask is created at compile time, according to the active
 * preprocessor defines. It is a single const value at runtime. */
#if !defined(NO_FILES)
	                                    | MG_FEATURES_FILES
#endif
#if !defined(NO_SSL)
	                                    | MG_FEATURES_SSL
#endif
#if !defined(NO_CGI)
	                                    | MG_FEATURES_CGI
#endif
#if defined(USE_IPV6)
	                                    | MG_FEATURES_IPV6
#endif
#if defined(USE_WEBSOCKET)
	                                    | MG_FEATURES_WEBSOCKET
#endif
#if defined(USE_LUA)
	                                    | MG_FEATURES_LUA
#endif
#if defined(USE_DUKTAPE)
	                                    | MG_FEATURES_SSJS
#endif
#if !defined(NO_CACHING)
	                                    | MG_FEATURES_CACHE
#endif
#if defined(USE_SERVER_STATS)
	                                    | MG_FEATURES_STATS
#endif
#if defined(USE_ZLIB)
	                                    | MG_FEATURES_COMPRESSION
#endif

/* Set some extra bits not defined in the API documentation.
 * These bits may change without further notice. */
#if defined(MG_LEGACY_INTERFACE)
	                                    | 0x00008000u
#endif
#if defined(MG_EXPERIMENTAL_INTERFACES)
	                                    | 0x00004000u
#endif
#if defined(MEMORY_DEBUGGING)
	                                    | 0x00001000u
#endif
#if defined(USE_TIMERS)
	                                    | 0x00020000u
#endif
#if !defined(NO_NONCE_CHECK)
	                                    | 0x00040000u
#endif
#if !defined(NO_POPEN)
	                                    | 0x00080000u
#endif
	    ;
	return (feature & feature_set);
}


/* strcat with additional NULL check to avoid clang scan-build warning. */
#define strcat0(a, b)                                                          \
	{                                                                          \
		if ((a != NULL) && (b != NULL)) {                                      \
			strcat(a, b);                                                      \
		}                                                                      \
	}


/* Get system information. It can be printed or stored by the caller.
 * Return the size of available information. */
static int
mg_get_system_info_impl(char *buffer, int buflen)
{
	char block[256];
	int system_info_length = 0;

#if defined(_WIN32)
	const char *eol = "\r\n";
#else
	const char *eol = "\n";
#endif

	const char *eoobj = "}";
	int reserved_len = (int)strlen(eoobj) + (int)strlen(eol);

	if ((buffer == NULL) || (buflen < 1)) {
		buflen = 0;
	} else {
		*buffer = 0;
	}

	mg_snprintf(NULL, NULL, block, sizeof(block), "{%s", eol);
	system_info_length += (int)strlen(block);
	if (system_info_length < buflen) {
		strcat0(buffer, block);
	}

	/* Server version */
	{
		const char *version = mg_version();
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"version\" : \"%s\",%s",
		            version,
		            eol);
		system_info_length += (int)strlen(block);
		if (system_info_length < buflen) {
			strcat0(buffer, block);
		}
	}

	/* System info */
	{
#if defined(_WIN32)
		DWORD dwVersion = 0;
		DWORD dwMajorVersion = 0;
		DWORD dwMinorVersion = 0;
		SYSTEM_INFO si;

		GetSystemInfo(&si);

#if defined(_MSC_VER)
#pragma warning(push)
/* GetVersion was declared deprecated */
#pragma warning(disable : 4996)
#endif
		dwVersion = GetVersion();
#if defined(_MSC_VER)
#pragma warning(pop)
#endif

		dwMajorVersion = (DWORD)(LOBYTE(LOWORD(dwVersion)));
		dwMinorVersion = (DWORD)(HIBYTE(LOWORD(dwVersion)));

		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"os\" : \"Windows %u.%u\",%s",
		            (unsigned)dwMajorVersion,
		            (unsigned)dwMinorVersion,
		            eol);
		system_info_length += (int)strlen(block);
		if (system_info_length < buflen) {
			strcat0(buffer, block);
		}

		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"cpu\" : \"type %u, cores %u, mask %x\",%s",
		            (unsigned)si.wProcessorArchitecture,
		            (unsigned)si.dwNumberOfProcessors,
		            (unsigned)si.dwActiveProcessorMask,
		            eol);
		system_info_length += (int)strlen(block);
		if (system_info_length < buflen) {
			strcat0(buffer, block);
		}
#else
		struct utsname name;
		memset(&name, 0, sizeof(name));
		uname(&name);

		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"os\" : \"%s %s (%s) - %s\",%s",
		            name.sysname,
		            name.version,
		            name.release,
		            name.machine,
		            eol);
		system_info_length += (int)strlen(block);
		if (system_info_length < buflen) {
			strcat0(buffer, block);
		}
#endif
	}

	/* Features */
	{
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"features\" : %lu,%s"
		            "\"feature_list\" : \"Server:%s%s%s%s%s%s%s%s%s\",%s",
		            (unsigned long)mg_check_feature(0xFFFFFFFFu),
		            eol,
		            mg_check_feature(MG_FEATURES_FILES) ? " Files" : "",
		            mg_check_feature(MG_FEATURES_SSL) ? " HTTPS" : "",
		            mg_check_feature(MG_FEATURES_CGI) ? " CGI" : "",
		            mg_check_feature(MG_FEATURES_IPV6) ? " IPv6" : "",
		            mg_check_feature(MG_FEATURES_WEBSOCKET) ? " WebSockets"
		                                                    : "",
		            mg_check_feature(MG_FEATURES_LUA) ? " Lua" : "",
		            mg_check_feature(MG_FEATURES_SSJS) ? " JavaScript" : "",
		            mg_check_feature(MG_FEATURES_CACHE) ? " Cache" : "",
		            mg_check_feature(MG_FEATURES_STATS) ? " Stats" : "",
		            eol);
		system_info_length += (int)strlen(block);
		if (system_info_length < buflen) {
			strcat0(buffer, block);
		}

#if defined(USE_LUA)
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"lua_version\" : \"%u (%s)\",%s",
		            (unsigned)LUA_VERSION_NUM,
		            LUA_RELEASE,
		            eol);
		system_info_length += (int)strlen(block);
		if (system_info_length < buflen) {
			strcat0(buffer, block);
		}
#endif
#if defined(USE_DUKTAPE)
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"javascript\" : \"Duktape %u.%u.%u\",%s",
		            (unsigned)DUK_VERSION / 10000,
		            ((unsigned)DUK_VERSION / 100) % 100,
		            (unsigned)DUK_VERSION % 100,
		            eol);
		system_info_length += (int)strlen(block);
		if (system_info_length < buflen) {
			strcat0(buffer, block);
		}
#endif
	}

	/* Build date */
	{
#if defined(GCC_DIAGNOSTIC)
#pragma GCC diagnostic push
/* Disable bogus compiler warning -Wdate-time */
#pragma GCC diagnostic ignored "-Wdate-time"
#endif
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"build\" : \"%s\",%s",
		            __DATE__,
		            eol);

#if defined(GCC_DIAGNOSTIC)
#pragma GCC diagnostic pop
#endif

		system_info_length += (int)strlen(block);
		if (system_info_length < buflen) {
			strcat0(buffer, block);
		}
	}


	/* Compiler information */
	/* http://sourceforge.net/p/predef/wiki/Compilers/ */
	{
#if defined(_MSC_VER)
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"compiler\" : \"MSC: %u (%u)\",%s",
		            (unsigned)_MSC_VER,
		            (unsigned)_MSC_FULL_VER,
		            eol);
		system_info_length += (int)strlen(block);
		if (system_info_length < buflen) {
			strcat0(buffer, block);
		}
#elif defined(__MINGW64__)
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"compiler\" : \"MinGW64: %u.%u\",%s",
		            (unsigned)__MINGW64_VERSION_MAJOR,
		            (unsigned)__MINGW64_VERSION_MINOR,
		            eol);
		system_info_length += (int)strlen(block);
		if (system_info_length < buflen) {
			strcat0(buffer, block);
		}
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"compiler\" : \"MinGW32: %u.%u\",%s",
		            (unsigned)__MINGW32_MAJOR_VERSION,
		            (unsigned)__MINGW32_MINOR_VERSION,
		            eol);
		system_info_length += (int)strlen(block);
		if (system_info_length < buflen) {
			strcat0(buffer, block);
		}
#elif defined(__MINGW32__)
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"compiler\" : \"MinGW32: %u.%u\",%s",
		            (unsigned)__MINGW32_MAJOR_VERSION,
		            (unsigned)__MINGW32_MINOR_VERSION,
		            eol);
		system_info_length += (int)strlen(block);
		if (system_info_length < buflen) {
			strcat0(buffer, block);
		}
#elif defined(__clang__)
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"compiler\" : \"clang: %u.%u.%u (%s)\",%s",
		            __clang_major__,
		            __clang_minor__,
		            __clang_patchlevel__,
		            __clang_version__,
		            eol);
		system_info_length += (int)strlen(block);
		if (system_info_length < buflen) {
			strcat0(buffer, block);
		}
#elif defined(__GNUC__)
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"compiler\" : \"gcc: %u.%u.%u\",%s",
		            (unsigned)__GNUC__,
		            (unsigned)__GNUC_MINOR__,
		            (unsigned)__GNUC_PATCHLEVEL__,
		            eol);
		system_info_length += (int)strlen(block);
		if (system_info_length < buflen) {
			strcat0(buffer, block);
		}
#elif defined(__INTEL_COMPILER)
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"compiler\" : \"Intel C/C++: %u\",%s",
		            (unsigned)__INTEL_COMPILER,
		            eol);
		system_info_length += (int)strlen(block);
		if (system_info_length < buflen) {
			strcat0(buffer, block);
		}
#elif defined(__BORLANDC__)
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"compiler\" : \"Borland C: 0x%x\",%s",
		            (unsigned)__BORLANDC__,
		            eol);
		system_info_length += (int)strlen(block);
		if (system_info_length < buflen) {
			strcat0(buffer, block);
		}
#elif defined(__SUNPRO_C)
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"compiler\" : \"Solaris: 0x%x\",%s",
		            (unsigned)__SUNPRO_C,
		            eol);
		system_info_length += (int)strlen(block);
		if (system_info_length < buflen) {
			strcat0(buffer, block);
		}
#else
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"compiler\" : \"other\",%s",
		            eol);
		system_info_length += (int)strlen(block);
		if (system_info_length < buflen) {
			strcat0(buffer, block);
		}
#endif
	}

	/* Determine 32/64 bit data mode.
	 * see https://en.wikipedia.org/wiki/64-bit_computing */
	{
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"data_model\" : \"int:%u/%u/%u/%u, float:%u/%u/%u, "
		            "char:%u/%u, "
		            "ptr:%u, size:%u, time:%u\"%s",
		            (unsigned)sizeof(short),
		            (unsigned)sizeof(int),
		            (unsigned)sizeof(long),
		            (unsigned)sizeof(long long),
		            (unsigned)sizeof(float),
		            (unsigned)sizeof(double),
		            (unsigned)sizeof(long double),
		            (unsigned)sizeof(char),
		            (unsigned)sizeof(wchar_t),
		            (unsigned)sizeof(void *),
		            (unsigned)sizeof(size_t),
		            (unsigned)sizeof(time_t),
		            eol);
		system_info_length += (int)strlen(block);
		if (system_info_length < buflen) {
			strcat0(buffer, block);
		}
	}

	/* Terminate string */
	if ((buflen > 0) && buffer && buffer[0]) {
		if (system_info_length < buflen) {
			strcat0(buffer, eoobj);
			strcat0(buffer, eol);
		}
	}
	system_info_length += reserved_len;

	return system_info_length;
}


#if defined(USE_SERVER_STATS)
/* Get context information. It can be printed or stored by the caller.
 * Return the size of available information. */
static int
mg_get_context_info_impl(const struct mg_context *ctx, char *buffer, int buflen)

{
	char block[256];
	int context_info_length = 0;

#if defined(_WIN32)
	const char *eol = "\r\n";
#else
	const char *eol = "\n";
#endif
	struct mg_memory_stat *ms = get_memory_stat((struct mg_context *)ctx);

	const char *eoobj = "}";
	int reserved_len = (int)strlen(eoobj) + (int)strlen(eol);

	if ((buffer == NULL) || (buflen < 1)) {
		buflen = 0;
	} else {
		*buffer = 0;
	}

	mg_snprintf(NULL, NULL, block, sizeof(block), "{%s", eol);
	context_info_length += (int)strlen(block);
	if (context_info_length < buflen) {
		strcat0(buffer, block);
	}

	if (ms) { /* <-- should be always true */
		/* Memory information */
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"memory\" : {%s"
		            "\"blocks\" : %i,%s"
		            "\"used\" : %" INT64_FMT ",%s"
		            "\"maxUsed\" : %" INT64_FMT "%s"
		            "}%s%s",
		            eol,
		            ms->blockCount,
		            eol,
		            ms->totalMemUsed,
		            eol,
		            ms->maxMemUsed,
		            eol,
		            (ctx ? "," : ""),
		            eol);

		context_info_length += (int)strlen(block);
		if (context_info_length + reserved_len < buflen) {
			strcat0(buffer, block);
		}
	}

	if (ctx) {
		/* Declare all variables at begin of the block, to comply
		 * with old C standards. */
		char start_time_str[64] = {0};
		char now_str[64] = {0};
		time_t start_time = ctx->start_time;
		time_t now = time(NULL);

		/* Connections information */
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"connections\" : {%s"
		            "\"active\" : %i,%s"
		            "\"maxActive\" : %i,%s"
		            "\"total\" : %" INT64_FMT "%s"
		            "},%s",
		            eol,
		            ctx->active_connections,
		            eol,
		            ctx->max_connections,
		            eol,
		            ctx->total_connections,
		            eol,
		            eol);

		context_info_length += (int)strlen(block);
		if (context_info_length + reserved_len < buflen) {
			strcat0(buffer, block);
		}

		/* Requests information */
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"requests\" : {%s"
		            "\"total\" : %" INT64_FMT "%s"
		            "},%s",
		            eol,
		            ctx->total_requests,
		            eol,
		            eol);

		context_info_length += (int)strlen(block);
		if (context_info_length + reserved_len < buflen) {
			strcat0(buffer, block);
		}

		/* Data information */
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"data\" : {%s"
		            "\"read\" : %" INT64_FMT "%s,"
		            "\"written\" : %" INT64_FMT "%s"
		            "},%s",
		            eol,
		            ctx->total_data_read,
		            eol,
		            ctx->total_data_written,
		            eol,
		            eol);

		context_info_length += (int)strlen(block);
		if (context_info_length + reserved_len < buflen) {
			strcat0(buffer, block);
		}

		/* Execution time information */
		gmt_time_string(start_time_str,
		                sizeof(start_time_str) - 1,
		                &start_time);
		gmt_time_string(now_str, sizeof(now_str) - 1, &now);

		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"time\" : {%s"
		            "\"uptime\" : %.0f,%s"
		            "\"start\" : \"%s\",%s"
		            "\"now\" : \"%s\"%s"
		            "}%s",
		            eol,
		            difftime(now, start_time),
		            eol,
		            start_time_str,
		            eol,
		            now_str,
		            eol,
		            eol);

		context_info_length += (int)strlen(block);
		if (context_info_length + reserved_len < buflen) {
			strcat0(buffer, block);
		}
	}

	/* Terminate string */
	if ((buflen > 0) && buffer && buffer[0]) {
		if (context_info_length < buflen) {
			strcat0(buffer, eoobj);
			strcat0(buffer, eol);
		}
	}
	context_info_length += reserved_len;

	return context_info_length;
}
#endif


#if defined(MG_EXPERIMENTAL_INTERFACES)
/* Get connection information. It can be printed or stored by the caller.
 * Return the size of available information. */
static int
mg_get_connection_info_impl(const struct mg_context *ctx,
                            int idx,
                            char *buffer,
                            int buflen)
{
	const struct mg_connection *conn;
	const struct mg_request_info *ri;
	char block[256];
	int connection_info_length = 0;
	int state = 0;
	const char *state_str = "unknown";

#if defined(_WIN32)
	const char *eol = "\r\n";
#else
	const char *eol = "\n";
#endif

	const char *eoobj = "}";
	int reserved_len = (int)strlen(eoobj) + (int)strlen(eol);

	if ((buffer == NULL) || (buflen < 1)) {
		buflen = 0;
	} else {
		*buffer = 0;
	}

	if ((ctx == NULL) || (idx < 0)) {
		/* Parameter error */
		return 0;
	}

	if ((unsigned)idx >= ctx->cfg_worker_threads) {
		/* Out of range */
		return 0;
	}

	/* Take connection [idx]. This connection is not locked in
	 * any way, so some other thread might use it. */
	conn = (ctx->worker_connections) + idx;

	/* Initialize output string */
	mg_snprintf(NULL, NULL, block, sizeof(block), "{%s", eol);
	connection_info_length += (int)strlen(block);
	if (connection_info_length < buflen) {
		strcat0(buffer, block);
	}

	/* Init variables */
	ri = &(conn->request_info);

#if defined(USE_SERVER_STATS)
	state = conn->conn_state;

	/* State as string */
	switch (state) {
	case 0:
		state_str = "undefined";
		break;
	case 1:
		state_str = "not used";
		break;
	case 2:
		state_str = "init";
		break;
	case 3:
		state_str = "ready";
		break;
	case 4:
		state_str = "processing";
		break;
	case 5:
		state_str = "processed";
		break;
	case 6:
		state_str = "to close";
		break;
	case 7:
		state_str = "closing";
		break;
	case 8:
		state_str = "closed";
		break;
	case 9:
		state_str = "done";
		break;
	}
#endif

	/* Connection info */
	if ((state >= 3) && (state < 9)) {
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"connection\" : {%s"
		            "\"remote\" : {%s"
		            "\"protocol\" : \"%s\",%s"
		            "\"addr\" : \"%s\",%s"
		            "\"port\" : %u%s"
		            "},%s"
		            "\"handled_requests\" : %u%s"
		            "},%s",
		            eol,
		            eol,
		            get_proto_name(conn),
		            eol,
		            ri->remote_addr,
		            eol,
		            ri->remote_port,
		            eol,
		            eol,
		            conn->handled_requests,
		            eol,
		            eol);

		connection_info_length += (int)strlen(block);
		if (connection_info_length + reserved_len < buflen) {
			strcat0(buffer, block);
		}
	}

	/* Request info */
	if ((state >= 4) && (state < 6)) {
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"request_info\" : {%s"
		            "\"method\" : \"%s\",%s"
		            "\"uri\" : \"%s\",%s"
		            "\"query\" : %s%s%s%s"
		            "},%s",
		            eol,
		            ri->request_method,
		            eol,
		            ri->request_uri,
		            eol,
		            ri->query_string ? "\"" : "",
		            ri->query_string ? ri->query_string : "null",
		            ri->query_string ? "\"" : "",
		            eol,
		            eol);

		connection_info_length += (int)strlen(block);
		if (connection_info_length + reserved_len < buflen) {
			strcat0(buffer, block);
		}
	}

	/* Execution time information */
	if ((state >= 2) && (state < 9)) {
		char start_time_str[64] = {0};
		char now_str[64] = {0};
		time_t start_time = conn->conn_birth_time;
		time_t now = time(NULL);

		gmt_time_string(start_time_str,
		                sizeof(start_time_str) - 1,
		                &start_time);
		gmt_time_string(now_str, sizeof(now_str) - 1, &now);

		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"time\" : {%s"
		            "\"uptime\" : %.0f,%s"
		            "\"start\" : \"%s\",%s"
		            "\"now\" : \"%s\"%s"
		            "},%s",
		            eol,
		            difftime(now, start_time),
		            eol,
		            start_time_str,
		            eol,
		            now_str,
		            eol,
		            eol);

		connection_info_length += (int)strlen(block);
		if (connection_info_length + reserved_len < buflen) {
			strcat0(buffer, block);
		}
	}

	/* Remote user name */
	if ((ri->remote_user) && (state < 9)) {
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"user\" : {%s"
		            "\"name\" : \"%s\",%s"
		            "},%s",
		            eol,
		            ri->remote_user,
		            eol,
		            eol);

		connection_info_length += (int)strlen(block);
		if (connection_info_length + reserved_len < buflen) {
			strcat0(buffer, block);
		}
	}

	/* Data block */
	if (state >= 3) {
		mg_snprintf(NULL,
		            NULL,
		            block,
		            sizeof(block),
		            "\"data\" : {%s"
		            "\"read\" : %" INT64_FMT ",%s"
		            "\"written\" : %" INT64_FMT "%s"
		            "},%s",
		            eol,
		            conn->consumed_content,
		            eol,
		            conn->num_bytes_sent,
		            eol,
		            eol);

		connection_info_length += (int)strlen(block);
		if (connection_info_length + reserved_len < buflen) {
			strcat0(buffer, block);
		}
	}

	/* State */
	mg_snprintf(NULL,
	            NULL,
	            block,
	            sizeof(block),
	            "\"state\" : \"%s\"%s",
	            state_str,
	            eol);

	connection_info_length += (int)strlen(block);
	if (connection_info_length + reserved_len < buflen) {
		strcat0(buffer, block);
	}

	/* Terminate string */
	if ((buflen > 0) && buffer && buffer[0]) {
		if (connection_info_length < buflen) {
			strcat0(buffer, eoobj);
			strcat0(buffer, eol);
		}
	}
	connection_info_length += reserved_len;

	return connection_info_length;
}
#endif


/* Get system information. It can be printed or stored by the caller.
 * Return the size of available information. */
int
mg_get_system_info(char *buffer, int buflen)
{
	if ((buffer == NULL) || (buflen < 1)) {
		return mg_get_system_info_impl(NULL, 0);
	} else {
		/* Reset buffer, so we can always use strcat. */
		buffer[0] = 0;
		return mg_get_system_info_impl(buffer, buflen);
	}
}


/* Get context information. It can be printed or stored by the caller.
 * Return the size of available information. */
int
mg_get_context_info(const struct mg_context *ctx, char *buffer, int buflen)
{
#if defined(USE_SERVER_STATS)
	if ((buffer == NULL) || (buflen < 1)) {
		return mg_get_context_info_impl(ctx, NULL, 0);
	} else {
		/* Reset buffer, so we can always use strcat. */
		buffer[0] = 0;
		return mg_get_context_info_impl(ctx, buffer, buflen);
	}
#else
	(void)ctx;
	if ((buffer != NULL) && (buflen > 0)) {
		buffer[0] = 0;
	}
	return 0;
#endif
}


#if defined(MG_EXPERIMENTAL_INTERFACES)
int
mg_get_connection_info(const struct mg_context *ctx,
                       int idx,
                       char *buffer,
                       int buflen)
{
	if ((buffer == NULL) || (buflen < 1)) {
		return mg_get_connection_info_impl(ctx, idx, NULL, 0);
	} else {
		/* Reset buffer, so we can always use strcat. */
		buffer[0] = 0;
		return mg_get_connection_info_impl(ctx, idx, buffer, buflen);
	}
}
#endif


/* Initialize this library. This function does not need to be thread safe.
 */
unsigned
mg_init_library(unsigned features)
{
#if !defined(NO_SSL)
	char ebuf[128];
#endif

	unsigned features_to_init = mg_check_feature(features & 0xFFu);
	unsigned features_inited = features_to_init;

	if (mg_init_library_called <= 0) {
		/* Not initialized yet */
		if (0 != pthread_mutex_init(&global_lock_mutex, NULL)) {
			return 0;
		}
	}

	mg_global_lock();

	if (mg_init_library_called <= 0) {
		if (0 != pthread_key_create(&sTlsKey, tls_dtor)) {
			/* Fatal error - abort start. However, this situation should
			 * never occur in practice. */
			mg_global_unlock();
			return 0;
		}

#if defined(_WIN32)
		InitializeCriticalSection(&global_log_file_lock);
#endif
#if !defined(_WIN32)
		pthread_mutexattr_init(&pthread_mutex_attr);
		pthread_mutexattr_settype(&pthread_mutex_attr, PTHREAD_MUTEX_RECURSIVE);
#endif

#if defined(USE_LUA)
		lua_init_optional_libraries();
#endif
	}

	mg_global_unlock();

#if !defined(NO_SSL)
	if (features_to_init & MG_FEATURES_SSL) {
		if (!mg_ssl_initialized) {
			if (initialize_ssl(ebuf, sizeof(ebuf))) {
				mg_ssl_initialized = 1;
			} else {
				(void)ebuf;
				DEBUG_TRACE("Initializing SSL failed: %s", ebuf);
				features_inited &= ~((unsigned)(MG_FEATURES_SSL));
			}
		} else {
			/* ssl already initialized */
		}
	}
#endif

	/* Start WinSock for Windows */
	mg_global_lock();
	if (mg_init_library_called <= 0) {
#if defined(_WIN32)
		WSADATA data;
		WSAStartup(MAKEWORD(2, 2), &data);
#endif /* _WIN32 */
		mg_init_library_called = 1;
	} else {
		mg_init_library_called++;
	}
	mg_global_unlock();

	return features_inited;
}


/* Un-initialize this library. */
unsigned
mg_exit_library(void)
{
	if (mg_init_library_called <= 0) {
		return 0;
	}

	mg_global_lock();

	mg_init_library_called--;
	if (mg_init_library_called == 0) {
#if defined(_WIN32)
		(void)WSACleanup();
#endif /* _WIN32  */
#if !defined(NO_SSL)
		if (mg_ssl_initialized) {
			uninitialize_ssl();
			mg_ssl_initialized = 0;
		}
#endif

#if defined(_WIN32)
		(void)DeleteCriticalSection(&global_log_file_lock);
#endif /* _WIN32 */
#if !defined(_WIN32)
		(void)pthread_mutexattr_destroy(&pthread_mutex_attr);
#endif

		(void)pthread_key_delete(sTlsKey);

#if defined(USE_LUA)
		lua_exit_optional_libraries();
#endif

		mg_global_unlock();
		(void)pthread_mutex_destroy(&global_lock_mutex);
		return 1;
	}

	mg_global_unlock();
	return 1;
}


/* End of civetweb.c */
