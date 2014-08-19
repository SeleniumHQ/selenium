#include <lua.h>
#include <lauxlib.h>
#include <setjmp.h>

#ifdef _WIN32
static void *mmap(void *addr, int64_t len, int prot, int flags, int fd,
    int offset)
{
    HANDLE fh = (HANDLE) _get_osfhandle(fd);
    HANDLE mh = CreateFileMapping(fh, 0, PAGE_READONLY, 0, 0, 0);
    void *p = MapViewOfFile(mh, FILE_MAP_READ, 0, 0, (size_t) len);
    CloseHandle(mh);
    return p;
}

static void munmap(void *addr, int64_t length)
{
    UnmapViewOfFile(addr);
}

#define MAP_FAILED NULL
#define MAP_PRIVATE 0
#define PROT_READ 0
#else
#include <sys/mman.h>
#endif

static const char *LUASOCKET = "luasocket";
static const char lua_regkey_ctx = 1;
static const char lua_regkey_connlist = 2;

/* Forward declarations */
static void handle_request(struct mg_connection *);
static int handle_lsp_request(struct mg_connection *, const char *,
struct file *, struct lua_State *);

static void reg_string(struct lua_State *L, const char *name, const char *val)
{
    if (name!=NULL && val!=NULL) {
        lua_pushstring(L, name);
        lua_pushstring(L, val);
        lua_rawset(L, -3);
    }
}

static void reg_int(struct lua_State *L, const char *name, int val)
{
    if (name!=NULL) {
        lua_pushstring(L, name);
        lua_pushinteger(L, val);
        lua_rawset(L, -3);
    }
}

static void reg_boolean(struct lua_State *L, const char *name, int val)
{
    if (name!=NULL) {
        lua_pushstring(L, name);
        lua_pushboolean(L, val != 0);
        lua_rawset(L, -3);
    }
}

static void reg_conn_function(struct lua_State *L, const char *name,
    lua_CFunction func, struct mg_connection *conn)
{
    if (name!=NULL && func!=NULL && conn!=NULL) {
        lua_pushstring(L, name);
        lua_pushlightuserdata(L, conn);
        lua_pushcclosure(L, func, 1);
        lua_rawset(L, -3);
    }
}

static void reg_function(struct lua_State *L, const char *name, lua_CFunction func)
{
    if (name!=NULL && func!=NULL) {
        lua_pushstring(L, name);
        lua_pushcclosure(L, func, 0);
        lua_rawset(L, -3);
    }
}

static void lua_cry(struct mg_connection *conn, int err, lua_State * L, const char * lua_title, const char * lua_operation)
{
    switch (err) {
    case LUA_OK:
    case LUA_YIELD:
        break;
    case LUA_ERRRUN:
        mg_cry(conn, "%s: %s failed: runtime error: %s", lua_title, lua_operation, lua_tostring(L, -1));
        break;
    case LUA_ERRSYNTAX:
        mg_cry(conn, "%s: %s failed: syntax error: %s", lua_title, lua_operation, lua_tostring(L, -1));
        break;
    case LUA_ERRMEM:
        mg_cry(conn, "%s: %s failed: out of memory", lua_title, lua_operation);
        break;
    case LUA_ERRGCMM:
        mg_cry(conn, "%s: %s failed: error during garbage collection", lua_title, lua_operation);
        break;
    case LUA_ERRERR:
        mg_cry(conn, "%s: %s failed: error in error handling: %s", lua_title, lua_operation, lua_tostring(L, -1));
        break;
    default:
        mg_cry(conn, "%s: %s failed: error %i", lua_title, lua_operation, err);
        break;
    }
}

static int lsp_sock_close(lua_State *L)
{
    int num_args = lua_gettop(L);
    if ((num_args == 1) && lua_istable(L, -1)) {
        lua_getfield(L, -1, "sock");
        closesocket((SOCKET) lua_tonumber(L, -1));
    } else {
        return luaL_error(L, "invalid :close() call");
    }
    return 1;
}

static int lsp_sock_recv(lua_State *L)
{
    int num_args = lua_gettop(L);
    char buf[2000];
    int n;

    if ((num_args == 1) && lua_istable(L, -1)) {
        lua_getfield(L, -1, "sock");
        n = recv((SOCKET) lua_tonumber(L, -1), buf, sizeof(buf), 0);
        if (n <= 0) {
            lua_pushnil(L);
        } else {
            lua_pushlstring(L, buf, n);
        }
    } else {
        return luaL_error(L, "invalid :close() call");
    }
    return 1;
}

static int lsp_sock_send(lua_State *L)
{
    int num_args = lua_gettop(L);
    const char *buf;
    size_t len, sent = 0;
    int n = 0, sock;

    if ((num_args == 2) && lua_istable(L, -2) && lua_isstring(L, -1)) {
        buf = lua_tolstring(L, -1, &len);
        lua_getfield(L, -2, "sock");
        sock = (int) lua_tonumber(L, -1);
        while (sent < len) {
            if ((n = send(sock, buf + sent, (int)(len - sent), 0)) <= 0) {
                break;
            }
            sent += n;
        }
        lua_pushnumber(L, n);
    } else {
        return luaL_error(L, "invalid :close() call");
    }
    return 1;
}

static const struct luaL_Reg luasocket_methods[] = {
    {"close", lsp_sock_close},
    {"send", lsp_sock_send},
    {"recv", lsp_sock_recv},
    {NULL, NULL}
};

static int lsp_connect(lua_State *L)
{
    int num_args = lua_gettop(L);
    char ebuf[100];
    SOCKET sock;

    if ((num_args == 3) && lua_isstring(L, -3) && lua_isnumber(L, -2) && lua_isnumber(L, -1)) {
        sock = conn2(NULL, lua_tostring(L, -3), (int) lua_tonumber(L, -2),
            (int) lua_tonumber(L, -1), ebuf, sizeof(ebuf));
        if (sock == INVALID_SOCKET) {
            return luaL_error(L, ebuf);
        } else {
            lua_newtable(L);
            reg_int(L, "sock", (int) sock);
            reg_string(L, "host", lua_tostring(L, -4));
            luaL_getmetatable(L, LUASOCKET);
            lua_setmetatable(L, -2);
        }
    } else {
        return luaL_error(L, "connect(host,port,is_ssl): invalid parameter given.");
    }
    return 1;
}

static int lsp_error(lua_State *L)
{
    lua_getglobal(L, "mg");
    lua_getfield(L, -1, "onerror");
    lua_pushvalue(L, -3);
    lua_pcall(L, 1, 0, 0);
    return 0;
}

/* Silently stop processing chunks. */
static void lsp_abort(lua_State *L)
{
    int top = lua_gettop(L);
    lua_getglobal(L, "mg");
    lua_pushnil(L);
    lua_setfield(L, -2, "onerror");
    lua_settop(L, top);
    lua_pushstring(L, "aborting");
    lua_error(L);
}

struct lsp_var_reader_data
{
    const char * begin;
    unsigned len;
    unsigned state;
};

static const char * lsp_var_reader(lua_State *L, void *ud, size_t *sz)
{
    struct lsp_var_reader_data * reader = (struct lsp_var_reader_data *)ud;
    const char * ret;
	(void)(L); /* unused */

    switch (reader->state) {
    case 0:
        ret = "mg.write(";
        *sz = strlen(ret);
        break;
    case 1:
        ret = reader->begin;
        *sz = reader->len;
        break;
    case 2:
        ret = ")";
        *sz = strlen(ret);
        break;
    default:
        ret = 0;
        *sz = 0;
    }

    reader->state++;
    return ret;
}

static int lsp(struct mg_connection *conn, const char *path,
    const char *p, int64_t len, lua_State *L)
{
    int i, j, pos = 0, lines = 1, lualines = 0, is_var, lua_ok;
    char chunkname[MG_BUF_LEN];
    struct lsp_var_reader_data data;

    for (i = 0; i < len; i++) {
        if (p[i] == '\n') lines++;
        if ((i + 1) < len && p[i] == '<' && p[i + 1] == '?') {

            /* <?= ?> means a variable is enclosed and its value should be printed */
            is_var = ((i + 2) < len && p[i + 2] == '=');

            if (is_var) j = i + 2;
            else j = i + 1;

            while (j < len) {
                if (p[j] == '\n') lualines++;
                if ((j + 1) < len && p[j] == '?' && p[j + 1] == '>') {
                    mg_write(conn, p + pos, i - pos);

                    snprintf(chunkname, sizeof(chunkname), "@%s+%i", path, lines);
                    lua_pushlightuserdata(L, conn);
                    lua_pushcclosure(L, lsp_error, 1);

                    if (is_var) {
                        data.begin = p + (i + 3);
                        data.len = j - (i + 3);
                        data.state = 0;
                        lua_ok = lua_load(L, lsp_var_reader, &data, chunkname, NULL);
                    } else {
                        lua_ok = luaL_loadbuffer(L, p + (i + 2), j - (i + 2), chunkname);
                    }

                    if (lua_ok) {
                        /* Syntax error or OOM. Error message is pushed on stack. */
                        lua_pcall(L, 1, 0, 0);
                    } else {
                        /* Success loading chunk. Call it. */
                        lua_pcall(L, 0, 0, 1);
                    }

                    pos = j + 2;
                    i = pos - 1;
                    break;
                }
                j++;
            }

            if (lualines > 0) {
                lines += lualines;
                lualines = 0;
            }
        }
    }

    if (i > pos) {
        mg_write(conn, p + pos, i - pos);
    }

    return 0;
}

/* mg.write: Send data to the client */
static int lsp_write(lua_State *L)
{
    struct mg_connection *conn = lua_touserdata(L, lua_upvalueindex(1));
    int num_args = lua_gettop(L);
    const char *str;
    size_t size;
    int i;

    for (i = 1; i <= num_args; i++) {
        if (lua_isstring(L, i)) {
            str = lua_tolstring(L, i, &size);
            mg_write(conn, str, size);
        }
    }

    return 0;
}

/* mg.read: Read data from the client (e.g., from a POST request) */
static int lsp_read(lua_State *L)
{
    struct mg_connection *conn = lua_touserdata(L, lua_upvalueindex(1));
    char buf[1024];
    int len = mg_read(conn, buf, sizeof(buf));

    if (len <= 0) return 0;
    lua_pushlstring(L, buf, len);

    return 1;
}

/* mg.keep_alive: Allow Lua pages to use the http keep-alive mechanism */
static int lsp_keep_alive(lua_State *L)
{
    struct mg_connection *conn = lua_touserdata(L, lua_upvalueindex(1));
    int num_args = lua_gettop(L);

    /* This function may be called with one parameter (boolean) to set the keep_alive state.
    Or without a parameter to just query the current keep_alive state. */
    if ((num_args==1) && lua_isboolean(L, 1)) {
        conn->must_close = !lua_toboolean(L, 1);
    } else if (num_args != 0) {
        /* Syntax error */
        return luaL_error(L, "invalid keep_alive() call");
    }

    /* Return the current "keep_alive" state. This may be false, even it keep_alive(true) has been called. */
    lua_pushboolean(L, should_keep_alive(conn));
    return 1;
}

/* mg.include: Include another .lp file */
static int lsp_include(lua_State *L)
{
    struct mg_connection *conn = lua_touserdata(L, lua_upvalueindex(1));
    int num_args = lua_gettop(L);
    struct file file = STRUCT_FILE_INITIALIZER;
    const char * filename = (num_args == 1) ? lua_tostring(L, 1) : NULL;

    if (filename) {
        if (handle_lsp_request(conn, filename, &file, L)) {
            /* handle_lsp_request returned an error code, meaning an error occured in
            the included page and mg.onerror returned non-zero. Stop processing. */
            lsp_abort(L);
        }
    } else {
        /* Syntax error */
        return luaL_error(L, "invalid include() call");
    }
    return 0;
}

/* mg.cry: Log an error. Default value for mg.onerror. */
static int lsp_cry(lua_State *L)
{
    struct mg_connection *conn = lua_touserdata(L, lua_upvalueindex(1));
    int num_args = lua_gettop(L);
    const char * text = (num_args == 1) ? lua_tostring(L, 1) : NULL;

    if (text) {
        mg_cry(conn, "%s", lua_tostring(L, -1));
    } else {
        /* Syntax error */
        return luaL_error(L, "invalid cry() call");
    }
    return 0;
}

/* mg.redirect: Redirect the request (internally). */
static int lsp_redirect(lua_State *L)
{
    struct mg_connection *conn = lua_touserdata(L, lua_upvalueindex(1));
    int num_args = lua_gettop(L);
    const char * target = (num_args == 1) ? lua_tostring(L, 1) : NULL;

    if (target) {
        conn->request_info.uri = target;
        handle_request(conn);
        lsp_abort(L);
    } else {
        /* Syntax error */
        return luaL_error(L, "invalid redirect() call");
    }
    return 0;
}

/* mg.send_file */
static int lsp_send_file(lua_State *L)
{
    struct mg_connection *conn = lua_touserdata(L, lua_upvalueindex(1));
    int num_args = lua_gettop(L);
    const char * filename = (num_args == 1) ? lua_tostring(L, 1) : NULL;

    if (filename) {
        mg_send_file(conn, filename);
    } else {
        /* Syntax error */
        return luaL_error(L, "invalid send_file() call");
    }
    return 0;
}

/* mg.get_var */
static int lsp_get_var(lua_State *L)
{
    int num_args = lua_gettop(L);
    const char *data, *var_name;
    size_t data_len, occurrence;
    int ret;
    char dst[512];

    if (num_args>=2 && num_args<=3) {
        data = lua_tolstring(L, 1, &data_len);
        var_name = lua_tostring(L, 2);
        occurrence = (num_args>2) ? (long)lua_tonumber(L, 3) : 0;

        ret = mg_get_var2(data, data_len, var_name, dst, sizeof(dst), occurrence);
        if (ret>=0) {
            /* Variable found: return value to Lua */
            lua_pushstring(L, dst);
        } else {
            /* Variable not found (TODO: may be string too long) */
            lua_pushnil(L);
        }
    } else {
        /* Syntax error */
        return luaL_error(L, "invalid get_var() call");
    }
    return 1;
}

/* mg.get_mime_type */
static int lsp_get_mime_type(lua_State *L)
{
    int num_args = lua_gettop(L);
    struct vec mime_type = {0, 0};
    struct mg_context *ctx;
    const char *text;

    lua_pushlightuserdata(L, (void *)&lua_regkey_ctx);
    lua_gettable(L, LUA_REGISTRYINDEX);
    ctx = (struct mg_context *)lua_touserdata(L, -1);

    if (num_args==1) {
        text = lua_tostring(L, 1);
        if (text) {
            if (ctx) {
                get_mime_type(ctx, text, &mime_type);
                lua_pushlstring(L, mime_type.ptr, mime_type.len);
            } else {
                text = mg_get_builtin_mime_type(text);
                lua_pushstring(L, text);
            }
        } else {
            /* Syntax error */
            return luaL_error(L, "invalid argument for get_mime_type() call");
        }
    } else {
        /* Syntax error */
        return luaL_error(L, "invalid get_mime_type() call");
    }
    return 1;
}

/* mg.get_cookie */
static int lsp_get_cookie(lua_State *L)
{
    int num_args = lua_gettop(L);
    const char *cookie;
    const char *var_name;
    int ret;
    char dst[512];

    if (num_args==2) {
        cookie = lua_tostring(L, 1);
        var_name = lua_tostring(L, 2);
        if (cookie!=NULL && var_name!=NULL) {
            ret = mg_get_cookie(cookie, var_name, dst, sizeof(dst));
        } else {
            ret = -1;
        }

        if (ret>=0) {
            lua_pushlstring(L, dst, ret);
        } else {
            lua_pushnil(L);
        }
    } else {
        /* Syntax error */
        return luaL_error(L, "invalid get_cookie() call");
    }
    return 1;
}

/* mg.md5 */
static int lsp_md5(lua_State *L)
{
    int num_args = lua_gettop(L);
    const char *text;
    md5_byte_t hash[16];
    md5_state_t ctx;
    size_t text_len;
    char buf[40];

    if (num_args==1) {
        text = lua_tolstring(L, 1, &text_len);
        if (text) {
            md5_init(&ctx);
            md5_append(&ctx, (const md5_byte_t *) text, text_len);
            md5_finish(&ctx, hash);
            bin2str(buf, hash, sizeof(hash));
            lua_pushstring(L, buf);
        } else {
            lua_pushnil(L);
        }
    } else {
        /* Syntax error */
        return luaL_error(L, "invalid md5() call");
    }
    return 1;
}

/* mg.url_encode */
static int lsp_url_encode(lua_State *L)
{
    int num_args = lua_gettop(L);
    const char *text;
    size_t text_len;
    char dst[512];

    if (num_args==1) {
        text = lua_tolstring(L, 1, &text_len);
        if (text) {
            mg_url_encode(text, dst, sizeof(dst));
            lua_pushstring(L, dst);
        } else {
            lua_pushnil(L);
        }
    } else {
        /* Syntax error */
        return luaL_error(L, "invalid url_encode() call");
    }
    return 1;
}

/* mg.url_decode */
static int lsp_url_decode(lua_State *L)
{
    int num_args = lua_gettop(L);
    const char *text;
    size_t text_len;
    int is_form;
    char dst[512];

    if (num_args==1 || (num_args==2 && lua_isboolean(L, 2))) {
        text = lua_tolstring(L, 1, &text_len);
        is_form = (num_args==2) ? lua_isboolean(L, 2) : 0;
        if (text) {
            mg_url_decode(text, text_len, dst, sizeof(dst), is_form);
            lua_pushstring(L, dst);
        } else {
            lua_pushnil(L);
        }
    } else {
        /* Syntax error */
        return luaL_error(L, "invalid url_decode() call");
    }
    return 1;
}

/* mg.base64_encode */
static int lsp_base64_encode(lua_State *L)
{
    int num_args = lua_gettop(L);
    const char *text;
    size_t text_len;
    char *dst;

    if (num_args==1) {
        text = lua_tolstring(L, 1, &text_len);
        if (text) {
            dst = mg_malloc(text_len*8/6+4);
            if (dst) {
                base64_encode((const unsigned char *)text, text_len, dst);
                lua_pushstring(L, dst);
                mg_free(dst);
            } else {
                return luaL_error(L, "out of memory in base64_encode() call");
            }
        } else {
            lua_pushnil(L);
        }
    } else {
        /* Syntax error */
        return luaL_error(L, "invalid base64_encode() call");
    }
    return 1;
}

/* mg.base64_encode */
static int lsp_base64_decode(lua_State *L)
{
    int num_args = lua_gettop(L);
    const char *text;
    size_t text_len, dst_len;
    int ret;
    char *dst;

    if (num_args==1) {
        text = lua_tolstring(L, 1, &text_len);
        if (text) {
            dst = mg_malloc(text_len);
            if (dst) {
                ret = base64_decode((const unsigned char *)text, text_len, dst, &dst_len);
                if (ret != -1) {
                    mg_free(dst);
                    return luaL_error(L, "illegal character in lsp_base64_decode() call");
                } else {
                    lua_pushlstring(L, dst, dst_len);
                    mg_free(dst);
                }
            } else {
                return luaL_error(L, "out of memory in lsp_base64_decode() call");
            }
        } else {
            lua_pushnil(L);
        }
    } else {
        /* Syntax error */
        return luaL_error(L, "invalid lsp_base64_decode() call");
    }
    return 1;
}

#ifdef USE_WEBSOCKET
struct lua_websock_data {
    lua_State *state;
    char * script;
    unsigned references;
    struct mg_connection *conn[MAX_WORKER_THREADS];
    pthread_mutex_t ws_mutex;
};
#endif

/* mg.write for websockets */
static int lwebsock_write(lua_State *L)
{
#ifdef USE_WEBSOCKET
    int num_args = lua_gettop(L);
    struct lua_websock_data *ws;
    const char *str;
    size_t size;
    int opcode = -1;
    unsigned i;
    struct mg_connection * client = NULL;

    lua_pushlightuserdata(L, (void *)&lua_regkey_connlist);
    lua_gettable(L, LUA_REGISTRYINDEX);
    ws = (struct lua_websock_data *)lua_touserdata(L, -1);

    if (num_args == 1) {
        /* just one text: send it to all client */
        if (lua_isstring(L, 1)) {
            opcode = WEBSOCKET_OPCODE_TEXT;
        }
    } else if (num_args == 2) {
        if (lua_isnumber(L, 1)) {
            /* opcode number and message text */
            opcode = (int)lua_tointeger(L, 1);
        } else if (lua_isstring(L,1)) {
            /* opcode string and message text */
            str = lua_tostring(L, 1);
            if (!mg_strncasecmp(str, "text", 4)) opcode = WEBSOCKET_OPCODE_TEXT;
            else if (!mg_strncasecmp(str, "bin", 3)) opcode = WEBSOCKET_OPCODE_BINARY;
            else if (!mg_strncasecmp(str, "close", 5)) opcode = WEBSOCKET_OPCODE_CONNECTION_CLOSE;
            else if (!mg_strncasecmp(str, "ping", 4)) opcode = WEBSOCKET_OPCODE_PING;
            else if (!mg_strncasecmp(str, "pong", 4)) opcode = WEBSOCKET_OPCODE_PONG;
            else if (!mg_strncasecmp(str, "cont", 4)) opcode = WEBSOCKET_OPCODE_CONTINUATION;
        } else if (lua_isuserdata(L, 1)) {
            /* client id and message text */
            client = (struct mg_connection *) lua_touserdata(L, 1);
            opcode = WEBSOCKET_OPCODE_TEXT;
        }
    } else if (num_args == 3) {
        if (lua_isuserdata(L, 1)) {
            client = (struct mg_connection *) lua_touserdata(L, 1);
            if (lua_isnumber(L, 2)) {
                /* client id, opcode number and message text */
                opcode = (int)lua_tointeger(L, 2);
            } else if (lua_isstring(L,2)) {
                /* client id, opcode string and message text */
                str = lua_tostring(L, 2);
                if (!mg_strncasecmp(str, "text", 4)) opcode = WEBSOCKET_OPCODE_TEXT;
                else if (!mg_strncasecmp(str, "bin", 3)) opcode = WEBSOCKET_OPCODE_BINARY;
                else if (!mg_strncasecmp(str, "close", 5)) opcode = WEBSOCKET_OPCODE_CONNECTION_CLOSE;
                else if (!mg_strncasecmp(str, "ping", 4)) opcode = WEBSOCKET_OPCODE_PING;
                else if (!mg_strncasecmp(str, "pong", 4)) opcode = WEBSOCKET_OPCODE_PONG;
                else if (!mg_strncasecmp(str, "cont", 4)) opcode = WEBSOCKET_OPCODE_CONTINUATION;
            }
        }
    }

    if (opcode>=0 && opcode<16 && lua_isstring(L, num_args)) {
        str = lua_tolstring(L, num_args, &size);
        if (client) {
            for (i=0; i<ws->references; i++) {
                if (client == ws->conn[i]) {
                    mg_websocket_write(ws->conn[i], opcode, str, size);
                }
            }
        } else {
            for (i=0; i<ws->references; i++) {
                mg_websocket_write(ws->conn[i], opcode, str, size);
            }
        }
    } else {
        return luaL_error(L, "invalid websocket write() call");
    }

#endif
    return 0;
}

struct laction_arg {
    lua_State *state;
    const char *script;
    pthread_mutex_t *pmutex;
    char txt[1];
};

static int lua_action(struct laction_arg *arg)
{
    int err, ok;
    struct mg_context *ctx;

    (void)pthread_mutex_lock(arg->pmutex);

    lua_pushlightuserdata(arg->state, (void *)&lua_regkey_ctx);
    lua_gettable(arg->state, LUA_REGISTRYINDEX);
    ctx = (struct mg_context *)lua_touserdata(arg->state, -1);

    err = luaL_loadstring(arg->state, arg->txt);
    if (err != 0) {
        lua_cry(fc(ctx), err, arg->state, arg->script, "timer");
        (void)pthread_mutex_unlock(arg->pmutex);
        mg_free(arg);
        return 0;
    }
    err = lua_pcall(arg->state, 0, 1, 0);
    if (err != 0) {
        lua_cry(fc(ctx), err, arg->state, arg->script, "timer");
        (void)pthread_mutex_unlock(arg->pmutex);
        mg_free(arg);
        return 0;
    }

    ok = lua_type(arg->state, -1);
    if (lua_isboolean(arg->state, -1)) {
       ok = lua_toboolean(arg->state, -1);
    } else {
       ok = 0;
    }
    lua_pop(arg->state, 1);

    (void)pthread_mutex_unlock(arg->pmutex);

    if (!ok) {
        mg_free(arg);
    }
    return ok;
}

static int lua_action_free(struct laction_arg *arg)
{
    if (lua_action(arg)) {
        mg_free(arg);
    }
    return 0;
}

static int lwebsocket_set_timer(lua_State *L, int is_periodic)
{
#ifdef USE_TIMERS
    int num_args = lua_gettop(L);
    struct lua_websock_data *ws;
    int type1,type2, ok = 0;
    double timediff;
    struct mg_context *ctx;
    struct laction_arg *arg;
    const char *txt;
    size_t txt_len;

    lua_pushlightuserdata(L, (void *)&lua_regkey_ctx);
    lua_gettable(L, LUA_REGISTRYINDEX);
    ctx = (struct mg_context *)lua_touserdata(L, -1);

    lua_pushlightuserdata(L, (void *)&lua_regkey_connlist);
    lua_gettable(L, LUA_REGISTRYINDEX);
    ws = (struct lua_websock_data *)lua_touserdata(L, -1);

    if (num_args < 2) {
        return luaL_error(L, "not enough arguments for set_timer/interval() call");
    }

    type1 = lua_type(L, 1);
    type2 = lua_type(L, 2);

    if (type1==LUA_TSTRING && type2==LUA_TNUMBER && num_args==2) {
        timediff = (double)lua_tonumber(L, 2);
        txt = lua_tostring(L, 1);
        txt_len = strlen(txt);
        arg = mg_malloc(sizeof(struct laction_arg) + txt_len + 10);
        arg->state = L;
        arg->script = ws->script;
        arg->pmutex = &(ws->ws_mutex);
        memcpy(arg->txt, "return(", 7);
        memcpy(arg->txt+7, txt, txt_len);
        arg->txt[txt_len+7] = ')';
        arg->txt[txt_len+8] = 0;
        ok = (0==timer_add(ctx, timediff, is_periodic, 1, (taction)(is_periodic ? lua_action : lua_action_free), (void*)arg));
    } else if (type1==LUA_TFUNCTION && type2==LUA_TNUMBER)  {
        /* TODO: not implemented yet */
        return luaL_error(L, "invalid arguments for set_timer/interval() call");
    } else {
        return luaL_error(L, "invalid arguments for set_timer/interval() call");
    }

    lua_pushboolean(L, ok);
    return 1;

#else
    return 0;
#endif
}

/* mg.set_timeout for websockets */
static int lwebsocket_set_timeout(lua_State *L)
{
    return lwebsocket_set_timer(L, 0);
}

/* mg.set_interval for websockets */
static int lwebsocket_set_interval(lua_State *L)
{
    return lwebsocket_set_timer(L, 1);
}

enum {
    LUA_ENV_TYPE_LUA_SERVER_PAGE = 0,
    LUA_ENV_TYPE_PLAIN_LUA_PAGE = 1,
    LUA_ENV_TYPE_LUA_WEBSOCKET = 2,
};

static void prepare_lua_request_info(struct mg_connection *conn, lua_State *L)
{
    char src_addr[IP_ADDR_STR_LEN] = "";
    int i;

    sockaddr_to_string(src_addr, sizeof(src_addr), &conn->client.rsa);

    /* Export mg.request_info */
    lua_pushstring(L, "request_info");
    lua_newtable(L);
    reg_string(L, "request_method", conn->request_info.request_method);
    reg_string(L, "uri", conn->request_info.uri);
    reg_string(L, "http_version", conn->request_info.http_version);
    reg_string(L, "query_string", conn->request_info.query_string);
    reg_int(L, "remote_ip", conn->request_info.remote_ip); /* remote_ip is deprecated, use remote_addr instead */
    reg_string(L, "remote_addr", src_addr);
    /* TODO: ip version */
    reg_int(L, "remote_port", conn->request_info.remote_port);
    reg_int(L, "num_headers", conn->request_info.num_headers);
    reg_int(L, "server_port", ntohs(conn->client.lsa.sin.sin_port));

    if (conn->request_info.remote_user != NULL) {
        reg_string(L, "remote_user", conn->request_info.remote_user);
        reg_string(L, "auth_type", "Digest");
    }

    reg_boolean(L, "https", conn->ssl != NULL);

    if (conn->status_code > 0) {
        /* Lua error handler should show the status code */
        reg_int(L, "status", conn->status_code);
    }

    lua_pushstring(L, "http_headers");
    lua_newtable(L);
    for (i = 0; i < conn->request_info.num_headers; i++) {
        reg_string(L, conn->request_info.http_headers[i].name, conn->request_info.http_headers[i].value);
    }
    lua_rawset(L, -3);

    lua_rawset(L, -3);
}

static void prepare_lua_environment(struct mg_context * ctx, struct mg_connection *conn, struct lua_websock_data *conn_list, lua_State *L, const char *script_name, int lua_env_type)
{
    const char * preload_file = ((conn != NULL) ? conn->ctx->config[LUA_PRELOAD_FILE] : NULL);

    extern void luaL_openlibs(lua_State *);
    luaL_openlibs(L);

#ifdef USE_LUA_SQLITE3
    {
        extern int luaopen_lsqlite3(lua_State *);
        luaopen_lsqlite3(L);
    }
#endif
#ifdef USE_LUA_SQLITE3
    {
        extern int luaopen_LuaXML(lua_State *);
        luaopen_LuaXML(L);
    }
#endif
#ifdef USE_LUA_FILE_SYSTEM
    {
        extern int luaopen_lfs(lua_State *);
        luaopen_lfs(L);
    }
#endif

    luaL_newmetatable(L, LUASOCKET);
    lua_pushliteral(L, "__index");
    luaL_newlib(L, luasocket_methods);
    lua_rawset(L, -3);
    lua_pop(L, 1);
    lua_register(L, "connect", lsp_connect);

    /* Store context in the registry */
    if (ctx) {
        lua_pushlightuserdata(L, (void *)&lua_regkey_ctx);
        lua_pushlightuserdata(L, (void *)ctx);
        lua_settable(L, LUA_REGISTRYINDEX);
    }
    if (conn_list) {
        lua_pushlightuserdata(L, (void *)&lua_regkey_connlist);
        lua_pushlightuserdata(L, (void *)conn_list);
        lua_settable(L, LUA_REGISTRYINDEX);
    }

    /* Register mg module */
    lua_newtable(L);

    switch (lua_env_type) {
    case LUA_ENV_TYPE_LUA_SERVER_PAGE:
        reg_string(L, "lua_type", "page");
        break;
    case LUA_ENV_TYPE_PLAIN_LUA_PAGE:
        reg_string(L, "lua_type", "script");
        break;
    case LUA_ENV_TYPE_LUA_WEBSOCKET:
        reg_string(L, "lua_type", "websocket");
        break;
    }

    if (lua_env_type==LUA_ENV_TYPE_LUA_SERVER_PAGE || lua_env_type==LUA_ENV_TYPE_PLAIN_LUA_PAGE) {
        reg_conn_function(L, "cry", lsp_cry, conn);
        reg_conn_function(L, "read", lsp_read, conn);
        reg_conn_function(L, "write", lsp_write, conn);
        reg_conn_function(L, "keep_alive", lsp_keep_alive, conn);
        reg_conn_function(L, "send_file", lsp_send_file, conn);
    }

    if (lua_env_type==LUA_ENV_TYPE_LUA_SERVER_PAGE) {
        reg_conn_function(L, "include", lsp_include, conn);
        reg_conn_function(L, "redirect", lsp_redirect, conn);
    }

    if (lua_env_type==LUA_ENV_TYPE_LUA_WEBSOCKET) {
        reg_function(L, "write", lwebsock_write);
#ifdef USE_TIMERS
        reg_function(L, "set_timeout", lwebsocket_set_timeout);
        reg_function(L, "set_interval", lwebsocket_set_interval);
#endif
        /* reg_conn_function(L, "send_file", lsp_send_file, conn); */
    }

    reg_function(L, "get_var", lsp_get_var);
    reg_function(L, "get_mime_type", lsp_get_mime_type);
    reg_function(L, "get_cookie", lsp_get_cookie);
    reg_function(L, "md5", lsp_md5);
    reg_function(L, "url_encode", lsp_url_encode);
    reg_function(L, "url_decode", lsp_url_decode);
    reg_function(L, "base64_encode", lsp_base64_encode);
    reg_function(L, "base64_decode", lsp_base64_decode);

    reg_string(L, "version", CIVETWEB_VERSION);
    reg_string(L, "document_root", ctx->config[DOCUMENT_ROOT]);
    reg_string(L, "auth_domain", ctx->config[AUTHENTICATION_DOMAIN]);
#if defined(USE_WEBSOCKET)
    reg_string(L, "websocket_root", ctx->config[WEBSOCKET_ROOT]);
#endif
    reg_string(L, "script_name", script_name);

    if (ctx->systemName != NULL) {
        reg_string(L, "system", ctx->systemName);
    }

    /* Export connection specific info */
    if (conn!=NULL) {
        prepare_lua_request_info(conn, L);
    }

    lua_setglobal(L, "mg");

    /* Register default mg.onerror function */
    IGNORE_UNUSED_RESULT(luaL_dostring(L, "mg.onerror = function(e) mg.write('\\nLua error:\\n', "
        "debug.traceback(e, 1)) end"));

    /* Preload */
    if ((preload_file != NULL) && (*preload_file != 0)) {
        IGNORE_UNUSED_RESULT(luaL_dofile(L, preload_file));
    }

    if (ctx->callbacks.init_lua != NULL) {
        ctx->callbacks.init_lua(conn, L);
    }
}

static int lua_error_handler(lua_State *L)
{
    const char *error_msg =  lua_isstring(L, -1) ?  lua_tostring(L, -1) : "?\n";

    lua_getglobal(L, "mg");
    if (!lua_isnil(L, -1)) {
        lua_getfield(L, -1, "write");   /* call mg.write() */
        lua_pushstring(L, error_msg);
        lua_pushliteral(L, "\n");
        lua_call(L, 2, 0);
        IGNORE_UNUSED_RESULT(luaL_dostring(L, "mg.write(debug.traceback(), '\\n')"));
    } else {
        printf("Lua error: [%s]\n", error_msg);
        IGNORE_UNUSED_RESULT(luaL_dostring(L, "print(debug.traceback(), '\\n')"));
    }
    /* TODO(lsm): leave the stack balanced */

    return 0;
}

static void * lua_allocator(void *ud, void *ptr, size_t osize, size_t nsize) {

    (void)ud; (void)osize; /* not used */

    if (nsize == 0) {
        mg_free(ptr);
        return NULL;
    }
    return mg_realloc(ptr, nsize);
}

void mg_exec_lua_script(struct mg_connection *conn, const char *path,
    const void **exports)
{
    int i;
    lua_State *L;

    /* Assume the script does not support keep_alive. The script may change this by calling mg.keep_alive(true). */
    conn->must_close=1;

    /* Execute a plain Lua script. */
    if (path != NULL && (L = lua_newstate(lua_allocator, NULL)) != NULL) {
        prepare_lua_environment(conn->ctx, conn, NULL, L, path, LUA_ENV_TYPE_PLAIN_LUA_PAGE);
        lua_pushcclosure(L, &lua_error_handler, 0);

        if (exports != NULL) {
            lua_pushglobaltable(L);
            for (i = 0; exports[i] != NULL && exports[i + 1] != NULL; i += 2) {
                lua_pushstring(L, exports[i]);
                lua_pushcclosure(L, (lua_CFunction) exports[i + 1], 0);
                lua_rawset(L, -3);
            }
        }

        if (luaL_loadfile(L, path) != 0) {
            lua_error_handler(L);
        }
        lua_pcall(L, 0, 0, -2);
        lua_close(L);
    }
}

static void lsp_send_err(struct mg_connection *conn, struct lua_State *L,
    const char *fmt, ...)
{
    char buf[MG_BUF_LEN];
    va_list ap;
    int len;

    va_start(ap, fmt);
    len = vsnprintf(buf, sizeof(buf), fmt, ap);
    va_end(ap);

    if (L == NULL) {
        send_http_error(conn, 500, http_500_error, "%s", buf);
    } else {
        lua_pushstring(L, buf);
        lua_error(L);
    }
}

static int handle_lsp_request(struct mg_connection *conn, const char *path, struct file *filep, struct lua_State *ls)
{
    void *p = NULL;
    lua_State *L = NULL;
    int error = 1;

    /* Assume the script does not support keep_alive. The script may change this by calling mg.keep_alive(true). */
    conn->must_close=1;

    /* We need both mg_stat to get file size, and mg_fopen to get fd */
    if (!mg_stat(conn, path, filep) || !mg_fopen(conn, path, "r", filep)) {
        lsp_send_err(conn, ls, "File [%s] not found", path);
    } else if (filep->membuf == NULL &&
        (p = mmap(NULL, (size_t) filep->size, PROT_READ, MAP_PRIVATE,
        fileno(filep->fp), 0)) == MAP_FAILED) {
            lsp_send_err(conn, ls, "mmap(%s, %zu, %d): %s", path, (size_t) filep->size,
                fileno(filep->fp), strerror(errno));
    } else if ((L = (ls != NULL ? ls : lua_newstate(lua_allocator, NULL))) == NULL) {
        send_http_error(conn, 500, http_500_error, "%s", "luaL_newstate failed");
    } else {
        /* We're not sending HTTP headers here, Lua page must do it. */
        if (ls == NULL) {
            prepare_lua_environment(conn->ctx, conn, NULL, L, path, LUA_ENV_TYPE_LUA_SERVER_PAGE);
        }
        error = lsp(conn, path, filep->membuf == NULL ? p : filep->membuf,
            filep->size, L);
    }

    if (L != NULL && ls == NULL) lua_close(L);
    if (p != NULL) munmap(p, filep->size);
    mg_fclose(filep);
    return error;
}

#ifdef USE_WEBSOCKET
struct mg_shared_lua_websocket_list {
    struct lua_websock_data ws;
    struct mg_shared_lua_websocket_list *next;
};

static void * lua_websocket_new(const char * script, struct mg_connection *conn)
{
    struct mg_shared_lua_websocket_list **shared_websock_list = &(conn->ctx->shared_lua_websockets);
    struct lua_websock_data *ws;
    int err, ok = 0;

    assert(conn->lua_websocket_state == NULL);

    /* lock list (mg_context global) */
    mg_lock_context(conn->ctx);
    while (*shared_websock_list) {
        /* check if ws already in list */
        if (0==strcmp(script,(*shared_websock_list)->ws.script)) {
            break;
        }
        shared_websock_list = &((*shared_websock_list)->next);
    }
    if (*shared_websock_list == NULL) {
        /* add ws to list */
        *shared_websock_list = mg_calloc(sizeof(struct mg_shared_lua_websocket_list), 1);
        if (*shared_websock_list == NULL) {
            mg_unlock_context(conn->ctx);
            mg_cry(conn, "Cannot create shared websocket struct, OOM");
            return NULL;
        }
        /* init ws list element */
        ws = &(*shared_websock_list)->ws;
        ws->script = mg_strdup(script); /* TODO: handle OOM */
        pthread_mutex_init(&(ws->ws_mutex), NULL);
        ws->state = lua_newstate(lua_allocator, NULL);
        ws->conn[0] = conn;
        ws->references = 1;
        (void)pthread_mutex_lock(&(ws->ws_mutex));
        prepare_lua_environment(conn->ctx, NULL, ws, ws->state, script, LUA_ENV_TYPE_LUA_WEBSOCKET);
        err = luaL_loadfile(ws->state, script);
        if (err != 0) {
            lua_cry(conn, err, ws->state, script, "load");
        }
        err = lua_pcall(ws->state, 0, 0, 0);
        if (err != 0) {
            lua_cry(conn, err, ws->state, script, "init");
        }
    } else {
        /* inc ref count */
        ws = &(*shared_websock_list)->ws;
        (void)pthread_mutex_lock(&(ws->ws_mutex));
        (*shared_websock_list)->ws.conn[(ws->references)++] = conn;
    }
    mg_unlock_context(conn->ctx);

    /* call add */
    lua_getglobal(ws->state, "open");
    lua_newtable(ws->state);
    prepare_lua_request_info(conn, ws->state);
    lua_pushstring(ws->state, "client");
    lua_pushlightuserdata(ws->state, (void *)conn);
    lua_rawset(ws->state, -3);

    err = lua_pcall(ws->state, 1, 1, 0);
    if (err != 0) {
        lua_cry(conn, err, ws->state, script, "open handler");
    } else {
        if (lua_isboolean(ws->state, -1)) {
            ok = lua_toboolean(ws->state, -1);
        }
        lua_pop(ws->state, 1);
    }
    if (!ok) {
        /* Remove from ws connection list. */
        /* TODO: Check if list entry and Lua state needs to be deleted (see websocket_close). */
        (*shared_websock_list)->ws.conn[--(ws->references)] = 0;
        ws = NULL;
    }

    (void)pthread_mutex_unlock(&(ws->ws_mutex));

    return (void*)ws;
}

static int lua_websocket_data(struct mg_connection * conn, void *ws_arg, int bits, char *data, size_t data_len)
{
    struct lua_websock_data *ws = (struct lua_websock_data *)(ws_arg);
    int err, ok = 0;

    assert(ws != NULL);
    assert(ws->state != NULL);

    (void)pthread_mutex_lock(&ws->ws_mutex);

    lua_getglobal(ws->state, "data");
    lua_newtable(ws->state);
    lua_pushstring(ws->state, "client");
    lua_pushlightuserdata(ws->state, (void *)conn);
    lua_rawset(ws->state, -3);
    lua_pushstring(ws->state, "bits"); /* TODO: dont use "bits" but fields with a meaning according to http://tools.ietf.org/html/rfc6455, section 5.2 */
    lua_pushnumber(ws->state, bits);
    lua_rawset(ws->state, -3);
    lua_pushstring(ws->state, "data");
    lua_pushlstring(ws->state, data, data_len);
    lua_rawset(ws->state, -3);

    err = lua_pcall(ws->state, 1, 1, 0);
    if (err != 0) {
        lua_cry(conn, err, ws->state, ws->script, "data handler");
    } else {
        if (lua_isboolean(ws->state, -1)) {
            ok = lua_toboolean(ws->state, -1);
        }
        lua_pop(ws->state, 1);
    }
    (void)pthread_mutex_unlock(&ws->ws_mutex);

    return ok;
}

static int lua_websocket_ready(struct mg_connection * conn, void * ws_arg)
{
    struct lua_websock_data *ws = (struct lua_websock_data *)(ws_arg);
    int err, ok = 0;

    assert(ws != NULL);
    assert(ws->state != NULL);

    (void)pthread_mutex_lock(&ws->ws_mutex);

    lua_getglobal(ws->state, "ready");
    lua_newtable(ws->state);
    lua_pushstring(ws->state, "client");
    lua_pushlightuserdata(ws->state, (void *)conn);
    lua_rawset(ws->state, -3);

    err = lua_pcall(ws->state, 1, 1, 0);
    if (err != 0) {
        lua_cry(conn, err, ws->state, ws->script, "ready handler");
    } else {
        if (lua_isboolean(ws->state, -1)) {
            ok = lua_toboolean(ws->state, -1);
        }
        lua_pop(ws->state, 1);
    }

    (void)pthread_mutex_unlock(&ws->ws_mutex);

    return ok;
}

static void lua_websocket_close(struct mg_connection * conn, void * ws_arg)
{
    struct lua_websock_data *ws = (struct lua_websock_data *)(ws_arg);
    struct mg_shared_lua_websocket_list **shared_websock_list = &(conn->ctx->shared_lua_websockets);
    int err = 0;
    unsigned i;

    assert(ws != NULL);
    assert(ws->state != NULL);

    (void)pthread_mutex_lock(&ws->ws_mutex);

    lua_getglobal(ws->state, "close");
    lua_newtable(ws->state);
    lua_pushstring(ws->state, "client");
    lua_pushlightuserdata(ws->state, (void *)conn);
    lua_rawset(ws->state, -3);

    err = lua_pcall(ws->state, 1, 0, 0);
    if (err != 0) {
        lua_cry(conn, err, ws->state, ws->script, "close handler");
    }
    for (i=0;i<ws->references;i++) {
        if (ws->conn[i]==conn) {
            ws->references--;
            ws->conn[i] = ws->conn[ws->references];
        }
    }
    /* TODO: Delete lua_websock_data and remove it from the websocket list.
       This must only be done, when all connections are closed, and all
       asynchronous operations and timers are completed/expired. */
    (void)pthread_mutex_unlock(&ws->ws_mutex);
}
#endif
