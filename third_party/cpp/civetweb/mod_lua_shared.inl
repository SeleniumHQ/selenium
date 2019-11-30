/* Copyright (c) 2018 CivetWeb developers
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


/* Interface functions */
LUA_SHARED_INTERFACE void lua_shared_init(void);

LUA_SHARED_INTERFACE void lua_shared_exit(void);

LUA_SHARED_INTERFACE void lua_shared_register(struct lua_State *L);


/* Shared data for all Lua states */
static lua_State *L_shared;
static pthread_mutex_t lua_shared_lock;


/* Library init.
 * This function must be called before all other functions. Not thread-safe. */
LUA_SHARED_INTERFACE void
lua_shared_init(void)
{
	/* Create a new Lua state to store all shared data.
	 * In fact, this is used as a hashmap. */
	L_shared = lua_newstate(lua_allocator, NULL);

	lua_newtable(L_shared);
	lua_setglobal(L_shared, "shared");

	/* Mutex for locking access to the shared state from different threads. */
	pthread_mutex_init(&lua_shared_lock, &pthread_mutex_attr);
}


/* Library exit.
 * This function should be called for cleanup. Not thread-safe. */
LUA_SHARED_INTERFACE void
lua_shared_exit(void)
{
	/* Destroy Lua state */
	lua_close(L_shared);
	L_shared = 0;

	/* Destroy mutex. */
	pthread_mutex_destroy(&lua_shared_lock);
}

#if defined(MG_EXPERIMENTAL_INTERFACES)
static double
shared_locked_add(const char *name, size_t namlen, double value, int op)
{
	double ret;

	pthread_mutex_lock(&lua_shared_lock);

	lua_getglobal(L_shared, "shared");
	lua_pushlstring(L_shared, name, namlen);
	lua_rawget(L_shared, -2);
	ret = lua_tonumber(L_shared, -1);

	if (op > 0) {
		ret += value;
	} else {
		ret = value;
	}

	lua_getglobal(L_shared, "shared");
	lua_pushlstring(L_shared, name, namlen);
	lua_pushnumber(L_shared, ret);
	lua_rawset(L_shared, -3);

	lua_pop(L_shared, 3);

	pthread_mutex_unlock(&lua_shared_lock);

	return ret;
}


static int
lua_shared_add(struct lua_State *L)
{
	size_t symlen = 0;
	const char *sym = lua_tolstring(L, 1, &symlen);
	double num = lua_tonumber(L, 2);

	double ret = shared_locked_add(sym, symlen, num, 1);
	lua_pushnumber(L, ret);
	return 1;
}


static int
lua_shared_inc(struct lua_State *L)
{
	size_t symlen = 0;
	const char *sym = lua_tolstring(L, 1, &symlen);

	double ret = shared_locked_add(sym, symlen, +1.0, 1);
	lua_pushnumber(L, ret);
	return 1;
}


static int
lua_shared_dec(struct lua_State *L)
{
	size_t symlen = 0;
	const char *sym = lua_tolstring(L, 1, &symlen);

	double ret = shared_locked_add(sym, symlen, -1.0, 1);
	lua_pushnumber(L, ret);
	return 1;
}


static int
lua_shared_exchange(struct lua_State *L)
{
	size_t namlen = 0;
	const char *name = lua_tolstring(L, 1, &namlen);
	double num = lua_tonumber(L, 2);
	double ret;

	pthread_mutex_lock(&lua_shared_lock);

	lua_getglobal(L_shared, "shared");
	lua_pushlstring(L_shared, name, namlen);
	lua_rawget(L_shared, -2);
	ret = lua_tonumber(L_shared, -1);

	lua_getglobal(L_shared, "shared");
	lua_pushlstring(L_shared, name, namlen);
	lua_pushnumber(L_shared, num);
	lua_rawset(L_shared, -3);

	lua_pop(L_shared, 3);

	pthread_mutex_unlock(&lua_shared_lock);

	lua_pushnumber(L, ret);
	return 1;
}

/*
static int
lua_shared_push(struct lua_State *L)
{
    int val_type = lua_type(L, 1);

    if ((val_type != LUA_TNUMBER) && (val_type != LUA_TSTRING)
        && (val_type != LUA_TBOOLEAN)) {
        return luaL_error(L, "shared value must be string, number or boolean");
    }

    pthread_mutex_lock(&lua_shared_lock);

    lua_getglobal(L_shared, "shared");
    lua_pushnumber(L_shared, num);

    if (val_type == LUA_TNUMBER) {
        double num = lua_tonumber(L, 3);
        lua_pushnumber(L_shared, num);

    } else if (val_type == LUA_TBOOLEAN) {
        int i = lua_toboolean(L, 3);
        lua_pushboolean(L_shared, i);

    } else {
        size_t len = 0;
        const char *str = lua_tolstring(L, 3, &len);
        lua_pushlstring(L_shared, str, len);
    }

    lua_rawset(L_shared, -3);
    lua_pop(L_shared, 1);

    pthread_mutex_unlock(&lua_shared_lock);

    return 0;
}
*/
#endif


/* Read access to shared element (x = shared.element) */
static int
lua_shared_index(struct lua_State *L)
{
	int key_type = lua_type(L, 2);
	int val_type;

	if ((key_type != LUA_TNUMBER) && (key_type != LUA_TSTRING)
	    && (key_type != LUA_TBOOLEAN)) {
		return luaL_error(L, "shared index must be string, number or boolean");
	}

	if (key_type == LUA_TNUMBER) {
		double num = lua_tonumber(L, 2);

		pthread_mutex_lock(&lua_shared_lock);
		lua_getglobal(L_shared, "shared");
		lua_pushnumber(L_shared, num);

	} else if (key_type == LUA_TBOOLEAN) {
		int i = lua_toboolean(L, 2);

		pthread_mutex_lock(&lua_shared_lock);
		lua_getglobal(L_shared, "shared");
		lua_pushboolean(L_shared, i);

	} else {
		size_t len = 0;
		const char *str = lua_tolstring(L, 2, &len);

		if ((len > 1) && (0 == memcmp(str, "__", 2))) {
#if defined(MG_EXPERIMENTAL_INTERFACES)
			/* Return functions */
			if (0 == strcmp(str, "__add")) {
				lua_pushcclosure(L, lua_shared_add, 0);
			} else if (0 == strcmp(str, "__inc")) {
				lua_pushcclosure(L, lua_shared_inc, 0);
			} else if (0 == strcmp(str, "__dec")) {
				lua_pushcclosure(L, lua_shared_dec, 0);
			} else if (0 == strcmp(str, "__exchange")) {
				lua_pushcclosure(L, lua_shared_exchange, 0);
				/*
			} else if (0 == strcmp(str, "__push")) {
				lua_pushcclosure(L, lua_shared_push, 0);
			} else if (0 == strcmp(str, "__pop")) {
				lua_pushcclosure(L, lua_shared_pop, 0);
				*/
			} else
#endif
			{
				/* Unknown reserved index */
				lua_pushnil(L);
			}
			return 1;
		}

		pthread_mutex_lock(&lua_shared_lock);
		lua_getglobal(L_shared, "shared");
		lua_pushlstring(L_shared, str, len);
	}

	lua_rawget(L_shared, -2);

	val_type = lua_type(L_shared, -1);

	if (val_type == LUA_TNUMBER) {
		double num = lua_tonumber(L_shared, -1);
		lua_pushnumber(L, num);

	} else if (val_type == LUA_TBOOLEAN) {
		int i = lua_toboolean(L_shared, -1);
		lua_pushboolean(L, i);

	} else if (val_type == LUA_TNIL) {
		lua_pushnil(L);

	} else {
		size_t len = 0;
		const char *str = lua_tolstring(L_shared, -1, &len);
		lua_pushlstring(L, str, len);
	}

	lua_pop(L_shared, 2);

	pthread_mutex_unlock(&lua_shared_lock);

	return 1;
}


/* Write access to shared element (shared.element = x) */
static int
lua_shared_newindex(struct lua_State *L)
{
	int key_type = lua_type(L, 2);
	int val_type = lua_type(L, 3);

	if ((key_type != LUA_TNUMBER) && (key_type != LUA_TSTRING)
	    && (key_type != LUA_TBOOLEAN)) {
		return luaL_error(L, "shared index must be string, number or boolean");
	}
	if ((val_type != LUA_TNUMBER) && (val_type != LUA_TSTRING)
	    && (val_type != LUA_TBOOLEAN) && (val_type != LUA_TNIL)) {
		return luaL_error(L, "shared value must be string, number or boolean");
	}

	if (key_type == LUA_TNUMBER) {
		double num = lua_tonumber(L, 2);

		pthread_mutex_lock(&lua_shared_lock);
		lua_getglobal(L_shared, "shared");
		lua_pushnumber(L_shared, num);

	} else if (key_type == LUA_TBOOLEAN) {
		int i = lua_toboolean(L, 2);

		pthread_mutex_lock(&lua_shared_lock);
		lua_getglobal(L_shared, "shared");
		lua_pushboolean(L_shared, i);

	} else {
		size_t len = 0;
		const char *str = lua_tolstring(L, 2, &len);

		if ((len > 1) && (0 == memcmp(str, "__", 2))) {
			return luaL_error(L, "shared index is reserved");
		}

		pthread_mutex_lock(&lua_shared_lock);
		lua_getglobal(L_shared, "shared");
		lua_pushlstring(L_shared, str, len);
	}

	if (val_type == LUA_TNUMBER) {
		double num = lua_tonumber(L, 3);
		lua_pushnumber(L_shared, num);

	} else if (val_type == LUA_TBOOLEAN) {
		int i = lua_toboolean(L, 3);
		lua_pushboolean(L_shared, i);

	} else if (val_type == LUA_TNIL) {
		lua_pushnil(L_shared);

	} else {
		size_t len = 0;
		const char *str = lua_tolstring(L, 3, &len);
		lua_pushlstring(L_shared, str, len);
	}

	lua_rawset(L_shared, -3);
	lua_pop(L_shared, 1);

	pthread_mutex_unlock(&lua_shared_lock);

	return 0;
}


/* Register the "shared" library in a new Lua state.
 * Call it once for every Lua state accessing "shared" elements. */
LUA_SHARED_INTERFACE void
lua_shared_register(struct lua_State *L)
{
	lua_newuserdata(L, 0);
	lua_newtable(L);

	lua_pushliteral(L, "__index");
	lua_pushcclosure(L, lua_shared_index, 0);
	lua_rawset(L, -3);

	lua_pushliteral(L, "__newindex");
	lua_pushcclosure(L, lua_shared_newindex, 0);
	lua_rawset(L, -3);

	lua_setmetatable(L, -2);
	lua_setglobal(L, "shared");
}
