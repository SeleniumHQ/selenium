/* "civetweb_private_lua.h" */
/* Project internal header to allow main.c to call a non-public function in
 * mod_lua.inl */

#ifndef CIVETWEB_PRIVATE_LUA_H
#define CIVETWEB_PRIVATE_LUA_H

int run_lua(const char *file_name);


#endif
