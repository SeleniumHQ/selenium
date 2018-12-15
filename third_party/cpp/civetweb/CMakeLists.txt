# The C API library
set( LIB_TYPE "STATIC" )
if (BUILD_SHARED_LIBS)
  set( LIB_TYPE "SHARED" )
endif()
add_library(civetweb-c-library ${LIB_TYPE} civetweb.c)
set_target_properties(civetweb-c-library PROPERTIES
  OUTPUT_NAME "civetweb"
  VERSION ${CIVETWEB_VERSION}
  SOVERSION ${CIVETWEB_VERSION}
)
if (BUILD_SHARED_LIBS)
  target_compile_definitions(civetweb-c-library PRIVATE CIVETWEB_DLL_EXPORTS)
endif()
target_include_directories(
  civetweb-c-library PUBLIC
  ${PROJECT_SOURCE_DIR}/include)
install(
  TARGETS civetweb-c-library
  ARCHIVE DESTINATION lib
  LIBRARY DESTINATION lib
  RUNTIME DESTINATION bin
  COMPONENT civetweb-c-library)
install(FILES
  ${PROJECT_SOURCE_DIR}/include/civetweb.h
  DESTINATION include
  COMPONENT civetweb-c-library)

# Need Windows sockets if available
find_package(WinSock)
if (WINSOCK_FOUND)
  target_link_libraries(civetweb-c-library WINSOCK::WINSOCK)
endif()

# We need threading
find_package(Threads)
target_link_libraries(civetweb-c-library ${CMAKE_THREAD_LIBS_INIT})

# Need the realtime library if we're using timers
find_package(LibRt)
if (CIVETWEB_ENABLE_WEBSOCKETS AND CIVETWEB_ENABLE_LUA AND LIBRT_FOUND)
  target_link_libraries(civetweb-c-library LIBRT::LIBRT)
endif()

# We need to link OpenSSL if not dynamically loading
if (CIVETWEB_ENABLE_SSL)
  if (CIVETWEB_ENABLE_SSL_DYNAMIC_LOADING)
    find_package(LibDl)
    if (LIBDL_FOUND)
      target_link_libraries(civetweb-c-library -ldl)
    endif()
  else()
    find_package(OpenSSL)
    include_directories(${OPENSSL_INCLUDE_DIR})
    message(STATUS "OpenSSL include directory: ${OPENSSL_INCLUDE_DIR}")
    target_link_libraries(civetweb-c-library ${OPENSSL_LIBRARIES})
  endif()
endif()

# If Lua support is needed we build some extra Lua libraries
if (CIVETWEB_ENABLE_LUA)
  include(ExternalProject)

  # Determine if we should print to the output
  if (CIVETWEB_ENABLE_THIRD_PARTY_OUTPUT)
    set(THIRD_PARTY_LOGGING 0)
  else()
    set(THIRD_PARTY_LOGGING 1)
  endif()

  # If Lua is static we must build it from source
  if (NOT CIVETWEB_ENABLE_LUA_SHARED)
    if (LINUX)
      set(LUA_MAKE_TARGET linux)
    elseif(DARWIN)
      set(LUA_MAKE_TARGET macosx)
    elseif(FREEBSD)
      set(LUA_MAKE_TARGET freebsd)
    elseif(WINDOWS)
      set(LUA_MAKE_TARGET mingw)
    elseif(UNIX)
      set(LUA_MAKE_TARGET posix)
    else()
      set(LUA_MAKE_TARGET generic)
    endif()
    set(LUA_BUILD_COMMAND "${CMAKE_MAKE_PROGRAM};${LUA_MAKE_TARGET}")
    if (BUILD_SHARED_LIBS)
      set(LUA_BUILD_COMMAND "${LUA_BUILD_COMMAND};MYCFLAGS=-fPIC")
    endif()
    ExternalProject_Add(lua
      URL "http://www.lua.org/ftp/lua-${CIVETWEB_LUA_VERSION}.tar.gz"
      URL_MD5 ${CIVETWEB_LUA_MD5_HASH}
      PREFIX "${CIVETWEB_THIRD_PARTY_DIR}"
      CONFIGURE_COMMAND ""
      BUILD_COMMAND ${LUA_BUILD_COMMAND}
      BUILD_IN_SOURCE 1
      INSTALL_COMMAND make install "INSTALL_TOP=<INSTALL_DIR>"
      LOG_DOWNLOAD ${THIRD_PARTY_LOGGING}
      LOG_UPDATE ${THIRD_PARTY_LOGGING}
      LOG_CONFIGURE ${THIRD_PARTY_LOGGING}
      LOG_BUILD ${THIRD_PARTY_LOGGING}
      LOG_TEST ${THIRD_PARTY_LOGGING}
      LOG_INSTALL ${THIRD_PARTY_LOGGING})
    ExternalProject_Get_Property(lua INSTALL_DIR)
    set(LUA_INSTALL_DIR ${INSTALL_DIR})
    unset(INSTALL_DIR)
    link_directories("${LUA_INSTALL_DIR}/lib")
    include_directories("${LUA_INSTALL_DIR}/include")
    set(LUA_LIBRARIES "${LUA_INSTALL_DIR}/lib/liblua.a")
    add_dependencies(civetweb-c-library lua)
  else()
    find_package(Lua)
  endif()

  # Lua Filesystem Support
  string(REPLACE "." "_" LUA_FILESYSTEM_VERSION_UNDERSCORE ${CIVETWEB_LUA_FILESYSTEM_VERSION})
  ExternalProject_Add(luafilesystem
    URL "https://github.com/keplerproject/luafilesystem/archive/v_${LUA_FILESYSTEM_VERSION_UNDERSCORE}.tar.gz"
    URL_MD5 ${CIVETWEB_LUA_FILESYSTEM_MD5_HASH}
    PREFIX "${CIVETWEB_THIRD_PARTY_DIR}"
    PATCH_COMMAND ${CMAKE_COMMAND} -E copy
      "${CMAKE_CURRENT_SOURCE_DIR}/cmake/luafilesystem/CMakeLists.txt" <SOURCE_DIR>/CMakeLists.txt
    CMAKE_ARGS
      "-DCMAKE_C_COMPILER=${CMAKE_C_COMPILER}"
      "-DCMAKE_INSTALL_PREFIX=<INSTALL_DIR>"
    LOG_DOWNLOAD ${THIRD_PARTY_LOGGING}
    LOG_UPDATE ${THIRD_PARTY_LOGGING}
    LOG_CONFIGURE ${THIRD_PARTY_LOGGING}
    LOG_BUILD ${THIRD_PARTY_LOGGING}
    LOG_TEST ${THIRD_PARTY_LOGGING}
    LOG_INSTALL ${THIRD_PARTY_LOGGING})
  ExternalProject_Get_Property(luafilesystem INSTALL_DIR)
  set(LUA_FILESYSTEM_INSTALL_DIR ${INSTALL_DIR})
  unset(INSTALL_DIR)
  link_directories("${LUA_FILESYSTEM_INSTALL_DIR}/lib")
  include_directories("${LUA_FILESYSTEM_INSTALL_DIR}/include")
  set(LUA_LIBRARIES "${LUA_LIBRARIES};${LUA_FILESYSTEM_INSTALL_DIR}/lib/libluafilesystem.a")
  add_dependencies(civetweb-c-library luafilesystem)

  # Lua SQLite Support
  if (${CIVETWEB_LUA_SQLITE_VERSION} VERSION_EQUAL "0.9.3")
    set(LUA_SQLITE_FILENAME lsqlite3_fsl09w.zip)
  elseif (${CIVETWEB_LUA_SQLITE_VERSION} VERSION_EQUAL "0.9.2")
    set(LUA_SQLITE_FILENAME lsqlite3_fsl09v.zip)
  elseif (${CIVETWEB_LUA_SQLITE_VERSION} VERSION_EQUAL "0.9.1")
    set(LUA_SQLITE_FILENAME lsqlite3_fsl09t.zip)
  else()
    message(FATAL_ERROR "The Lua SQLite archive filename is unknown for version ${CIVETWEB_LUA_SQLITE_VERSION}")
  endif()
  ExternalProject_Add(luasqlite
    URL "http://lua.sqlite.org/index.cgi/zip/${LUA_SQLITE_FILENAME}"
    URL_MD5 ${CIVETWEB_LUA_SQLITE_MD5_HASH}
    PREFIX "${CIVETWEB_THIRD_PARTY_DIR}"
    PATCH_COMMAND ${CMAKE_COMMAND} -E copy
      "${CMAKE_CURRENT_SOURCE_DIR}/cmake/luasqlite/CMakeLists.txt" <SOURCE_DIR>/CMakeLists.txt
    CMAKE_ARGS
      "-DCMAKE_C_COMPILER=${CMAKE_C_COMPILER}"
      "-DCMAKE_INSTALL_PREFIX=<INSTALL_DIR>"
    LOG_DOWNLOAD ${THIRD_PARTY_LOGGING}
    LOG_UPDATE ${THIRD_PARTY_LOGGING}
    LOG_CONFIGURE ${THIRD_PARTY_LOGGING}
    LOG_BUILD ${THIRD_PARTY_LOGGING}
    LOG_TEST ${THIRD_PARTY_LOGGING}
    LOG_INSTALL ${THIRD_PARTY_LOGGING})
  ExternalProject_Get_Property(luasqlite INSTALL_DIR)
  set(LUA_SQLITE_INSTALL_DIR ${INSTALL_DIR})
  unset(INSTALL_DIR)
  link_directories("${LUA_SQLITE_INSTALL_DIR}/lib")
  set(LUA_LIBRARIES "${LUA_LIBRARIES};${LUA_SQLITE_INSTALL_DIR}/lib/libluasqlite.a")
  add_dependencies(civetweb-c-library luasqlite)

  # Lua XML Support
  if (${CIVETWEB_LUA_XML_VERSION} VERSION_EQUAL "1.8.0")
    set(LUA_XML_FILENAME LuaXML_130610.zip)
  elseif (${CIVETWEB_LUA_XML_VERSION} VERSION_EQUAL "1.7.4")
    set(LUA_XML_FILENAME LuaXML_101012.zip)
  else()
    message(FATAL_ERROR "The Lua XML archive filename is unknown for version ${CIVETWEB_LUA_XML_VERSION}")
  endif()
  ExternalProject_Add(luaxml
# Old:
#    URL "http://viremo.eludi.net/LuaXML/${LUA_XML_FILENAME}"
#    URL_MD5 ${CIVETWEB_LUA_XML_MD5_HASH}
#    PREFIX "${CIVETWEB_THIRD_PARTY_DIR}"
#
# TODO: find current sourde
# viremo.eludi.net does no longer exist
# An extended version is available at https://github.com/n1tehawk/LuaXML
# but the last commit there was in 2015
#
    URL "https://github.com/n1tehawk/LuaXML/archive/v1.8.0.zip"
    PREFIX "${CIVETWEB_THIRD_PARTY_DIR}"
#
# TODO: fix this patch command (needs someone with deeper CMake know how)
    PATCH_COMMAND ${CMAKE_COMMAND} -E copy
      "${CMAKE_CURRENT_SOURCE_DIR}/cmake/luaxml/CMakeLists.txt" <SOURCE_DIR>/CMakeLists.txt
    CMAKE_ARGS
      "-DCMAKE_C_COMPILER=${CMAKE_C_COMPILER}"
      "-DCMAKE_INSTALL_PREFIX=<INSTALL_DIR>"
    LOG_DOWNLOAD ${THIRD_PARTY_LOGGING}
    LOG_UPDATE ${THIRD_PARTY_LOGGING}
    LOG_CONFIGURE ${THIRD_PARTY_LOGGING}
    LOG_BUILD ${THIRD_PARTY_LOGGING}
    LOG_TEST ${THIRD_PARTY_LOGGING}
    LOG_INSTALL ${THIRD_PARTY_LOGGING})
  ExternalProject_Get_Property(luaxml INSTALL_DIR)
  set(LUA_XML_INSTALL_DIR ${INSTALL_DIR})
  unset(INSTALL_DIR)
  link_directories("${LUA_XML_INSTALL_DIR}/lib")
  set(LUA_LIBRARIES "${LUA_LIBRARIES};${LUA_XML_INSTALL_DIR}/lib/libluaxml.a")
  add_dependencies(civetweb-c-library luaxml)

  # SQLite Support
  string (REGEX MATCHALL "[0-9]+" SQLITE_VERSION_MATCHES ${CIVETWEB_SQLITE_VERSION})
  list(GET SQLITE_VERSION_MATCHES 0 SQLITE_VERSION_MAJOR)
  list(GET SQLITE_VERSION_MATCHES 1 SQLITE_VERSION_MINOR)
  list(GET SQLITE_VERSION_MATCHES 2 SQLITE_VERSION_PATCH)
  set(SQLITE_FILE_VERSION ${SQLITE_VERSION_MAJOR}0${SQLITE_VERSION_MINOR}0${SQLITE_VERSION_PATCH}00)
  ExternalProject_Add(sqlite
    URL "http://www.sqlite.org/2015/sqlite-amalgamation-${SQLITE_FILE_VERSION}.zip"
    URL_MD5 ${CIVETWEB_SQLITE_MD5_HASH}
    PREFIX "${CIVETWEB_THIRD_PARTY_DIR}"
    PATCH_COMMAND ${CMAKE_COMMAND} -E copy
      "${CMAKE_CURRENT_SOURCE_DIR}/cmake/sqlite/CMakeLists.txt" <SOURCE_DIR>/CMakeLists.txt
    CMAKE_ARGS
      "-DCMAKE_C_COMPILER=${CMAKE_C_COMPILER}"
      "-DCMAKE_INSTALL_PREFIX=<INSTALL_DIR>"
    LOG_DOWNLOAD ${THIRD_PARTY_LOGGING}
    LOG_UPDATE ${THIRD_PARTY_LOGGING}
    LOG_CONFIGURE ${THIRD_PARTY_LOGGING}
    LOG_BUILD ${THIRD_PARTY_LOGGING}
    LOG_TEST ${THIRD_PARTY_LOGGING}
    LOG_INSTALL ${THIRD_PARTY_LOGGING})
  ExternalProject_Get_Property(sqlite INSTALL_DIR)
  set(SQLITE_INSTALL_DIR ${INSTALL_DIR})
  unset(INSTALL_DIR)
  link_directories("${SQLITE_INSTALL_DIR}/lib")
  include_directories("${SQLITE_INSTALL_DIR}/include")
  set(LUA_LIBRARIES "${LUA_LIBRARIES};${SQLITE_INSTALL_DIR}/lib/libsqlite.a")
  add_dependencies(civetweb-c-library sqlite)

  # Link all the Lua libraries
  target_link_libraries(civetweb-c-library ${LUA_LIBRARIES})
endif()

# The web server executable
if (CIVETWEB_ENABLE_SERVER_EXECUTABLE)
    add_executable(civetweb-c-executable main.c)
    set_target_properties(civetweb-c-executable PROPERTIES
        OUTPUT_NAME "civetweb"
    )
    if (CIVETWEB_INSTALL_EXECUTABLE)
        install(
            TARGETS civetweb-c-executable
            ARCHIVE DESTINATION lib
            LIBRARY DESTINATION lib
            RUNTIME DESTINATION bin
            COMPONENT server)
    endif()
    if (BUILD_SHARED_LIBS)
        target_compile_definitions(civetweb-c-executable PRIVATE CIVETWEB_DLL_IMPORTS)
    endif()
    target_include_directories(
        civetweb-c-executable PUBLIC
        ${PROJECT_SOURCE_DIR}/include)
    target_link_libraries(civetweb-c-executable civetweb-c-library)
    if (LIBRT_FOUND)
        target_link_libraries(civetweb-c-executable LIBRT::LIBRT)
    endif()
endif()

if (CIVETWEB_ENABLE_LUA)
  add_library(lua-library third_party/lfs.c third_party/lsqlite3.c third_party/LuaXML_lib.c third_party/sqlite3.c)
  set_target_properties(lua-library PROPERTIES
    OUTPUT_NAME "lua-library"
    VERSION ${CIVETWEB_VERSION}
    SOVERSION ${CIVETWEB_VERSION}
  )
  target_include_directories(
    lua-library PUBLIC
    ${PROJECT_SOURCE_DIR}/src/third_party/lua-5.2.4)
  install(
    TARGETS lua-library
    ARCHIVE DESTINATION lib
    LIBRARY DESTINATION lib
    RUNTIME DESTINATION bin
    COMPONENT lua-library)
endif()

# The C++ API library
if (CIVETWEB_ENABLE_CXX)
  add_library(civetweb-cpp ${LIB_TYPE} CivetServer.cpp)
  set_target_properties(civetweb-cpp PROPERTIES
    OUTPUT_NAME "civetweb-cpp"
    VERSION ${CIVETWEB_VERSION}
    SOVERSION ${CIVETWEB_VERSION}
  )
  if (BUILD_SHARED_LIBS)
    target_compile_definitions(civetweb-cpp PRIVATE CIVETWEB_DLL_EXPORTS)
  endif()
  target_include_directories(
    civetweb-cpp PUBLIC
    ${PROJECT_SOURCE_DIR}/include)
  install(
    TARGETS civetweb-cpp
    ARCHIVE DESTINATION lib
    LIBRARY DESTINATION lib
    RUNTIME DESTINATION bin
    COMPONENT civetweb-cpp)
  install(FILES
    ${PROJECT_SOURCE_DIR}/include/CivetServer.h
    DESTINATION include
    COMPONENT civetweb-cpp)
endif()
