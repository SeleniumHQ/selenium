%% @author Bob Ippolito <bob@mochimedia.com>
%% @copyright 2007 Mochi Media, Inc.

%% @doc Utilities for parsing and quoting.

-module(mochiweb_util).
-author('bob@mochimedia.com').
-export([join/2, quote_plus/1, urlencode/1, parse_qs/1, unquote/1]).
-export([path_split/1]).
-export([urlsplit/1, urlsplit_path/1, urlunsplit/1, urlunsplit_path/1]).
-export([guess_mime/1, parse_header/1]).
-export([shell_quote/1, cmd/1, cmd_string/1, cmd_port/2]).
-export([test/0]).

-define(PERCENT, 37).  % $\% 
-define(FULLSTOP, 46). % $\.
-define(IS_HEX(C), ((C >= $0 andalso C =< $9) orelse
		    (C >= $a andalso C =< $f) orelse
		    (C >= $A andalso C =< $F))).
-define(QS_SAFE(C), ((C >= $a andalso C =< $z) orelse
		     (C >= $A andalso C =< $Z) orelse
		     (C >= $0 andalso C =< $9) orelse
		     (C =:= ?FULLSTOP orelse C =:= $- orelse C =:= $~ orelse
		      C =:= $_))).
                                 

hexdigit(C) when C < 10 -> $0 + C;
hexdigit(C) when C < 16 -> $A + (C - 10).

unhexdigit(C) when C >= $0, C =< $9 -> C - $0;
unhexdigit(C) when C >= $a, C =< $f -> C - $a + 10;
unhexdigit(C) when C >= $A, C =< $F -> C - $A + 10.

%% @spec shell_quote(string()) -> string()
%% @doc Quote a string according to UNIX shell quoting rules, returns a string
%%      surrounded by double quotes.
shell_quote(L) ->
    shell_quote(L, [$\"]).

%% @spec cmd_port([string()], Options) -> port()
%% @doc open_port({spawn, mochiweb_util:cmd_string(Argv)}, Options).
cmd_port(Argv, Options) ->
    open_port({spawn, cmd_string(Argv)}, Options).

%% @spec cmd([string()]) -> string()
%% @doc os:cmd(cmd_string(Argv)).
cmd(Argv) ->
    os:cmd(cmd_string(Argv)).

%% @spec cmd_string([string()]) -> string()
%% @doc Create a shell quoted command string from a list of arguments.
cmd_string(Argv) ->
    join([shell_quote(X) || X <- Argv], " ").

%% @spec join([string()], Separator) -> string()
%% @doc Join a list of strings together with the given separator
%%      string or char.
join([], _Separator) ->
    [];
join([S], _Separator) ->
    lists:flatten(S);
join(Strings, Separator) ->
    lists:flatten(revjoin(lists:reverse(Strings), Separator, [])).

revjoin([], _Separator, Acc) ->
    Acc;
revjoin([S | Rest], Separator, []) ->
    revjoin(Rest, Separator, [S]);
revjoin([S | Rest], Separator, Acc) ->
    revjoin(Rest, Separator, [S, Separator | Acc]).    

%% @spec quote_plus(atom() | integer() | string()) -> string()
%% @doc URL safe encoding of the given term.
quote_plus(Atom) when is_atom(Atom) ->
    quote_plus(atom_to_list(Atom));
quote_plus(Int) when is_integer(Int) ->
    quote_plus(integer_to_list(Int));
quote_plus(String) ->
    quote_plus(String, []).

quote_plus([], Acc) ->
    lists:reverse(Acc);
quote_plus([C | Rest], Acc) when ?QS_SAFE(C) ->
    quote_plus(Rest, [C | Acc]);
quote_plus([$\s | Rest], Acc) ->
    quote_plus(Rest, [$+ | Acc]);
quote_plus([C | Rest], Acc) ->
    <<Hi:4, Lo:4>> = <<C>>,
    quote_plus(Rest, [hexdigit(Lo), hexdigit(Hi), ?PERCENT | Acc]).

%% @spec urlencode([{Key, Value}]) -> string()
%% @doc URL encode the property list.
urlencode(Props) ->
    RevPairs = lists:foldl(fun ({K, V}, Acc) ->
				   [[quote_plus(K), $=, quote_plus(V)] | Acc]
			   end, [], Props),
    lists:flatten(revjoin(RevPairs, $&, [])).

%% @spec parse_qs(string() | binary()) -> [{Key, Value}]
%% @doc Parse a query string or application/x-www-form-urlencoded.
parse_qs(Binary) when is_binary(Binary) ->
    parse_qs(binary_to_list(Binary));
parse_qs(String) ->
    parse_qs(String, []).

parse_qs([], Acc) ->
    lists:reverse(Acc);
parse_qs(String, Acc) ->
    {Key, Rest} = parse_qs_key(String),
    {Value, Rest1} = parse_qs_value(Rest),
    parse_qs(Rest1, [{Key, Value} | Acc]).

parse_qs_key(String) ->
    parse_qs_key(String, []).

parse_qs_key([], Acc) ->
    {qs_revdecode(Acc), ""};
parse_qs_key([$= | Rest], Acc) ->
    {qs_revdecode(Acc), Rest};
parse_qs_key(Rest=[$; | _], Acc) ->
    {qs_revdecode(Acc), Rest};
parse_qs_key(Rest=[$& | _], Acc) ->
    {qs_revdecode(Acc), Rest};
parse_qs_key([C | Rest], Acc) ->
    parse_qs_key(Rest, [C | Acc]).

parse_qs_value(String) ->
    parse_qs_value(String, []).

parse_qs_value([], Acc) ->
    {qs_revdecode(Acc), ""};
parse_qs_value([$; | Rest], Acc) ->
    {qs_revdecode(Acc), Rest};
parse_qs_value([$& | Rest], Acc) ->
    {qs_revdecode(Acc), Rest};
parse_qs_value([C | Rest], Acc) ->
    parse_qs_value(Rest, [C | Acc]).

%% @spec unquote(string() | binary()) -> string()
%% @doc Unquote a URL encoded string.
unquote(Binary) when is_binary(Binary) ->
    unquote(binary_to_list(Binary));
unquote(String) ->
    qs_revdecode(lists:reverse(String)).

qs_revdecode(S) ->
    qs_revdecode(S, []).

qs_revdecode([], Acc) ->
    Acc;
qs_revdecode([$+ | Rest], Acc) ->
    qs_revdecode(Rest, [$\s | Acc]);
qs_revdecode([Lo, Hi, ?PERCENT | Rest], Acc) when ?IS_HEX(Lo), ?IS_HEX(Hi) ->
    qs_revdecode(Rest, [(unhexdigit(Lo) bor (unhexdigit(Hi) bsl 4)) | Acc]);
qs_revdecode([C | Rest], Acc) ->
    qs_revdecode(Rest, [C | Acc]).

%% @spec urlsplit(Url) -> {Scheme, Netloc, Path, Query, Fragment}
%% @doc Return a 5-tuple, does not expand % escapes. Only supports HTTP style
%%      URLs.
urlsplit(Url) ->
    {Scheme, Url1} = urlsplit_scheme(Url),
    {Netloc, Url2} = urlsplit_netloc(Url1),
    {Path, Query, Fragment} = urlsplit_path(Url2),
    {Scheme, Netloc, Path, Query, Fragment}.

urlsplit_scheme(Url) ->
    urlsplit_scheme(Url, []).

urlsplit_scheme([], Acc) ->
    {"", lists:reverse(Acc)};
urlsplit_scheme(":" ++ Rest, Acc) ->
    {string:to_lower(lists:reverse(Acc)), Rest};
urlsplit_scheme([C | Rest], Acc) ->
    urlsplit_scheme(Rest, [C | Acc]).

urlsplit_netloc("//" ++ Rest) ->
    urlsplit_netloc(Rest, []);
urlsplit_netloc(Path) ->
    {"", Path}.

urlsplit_netloc(Rest=[C | _], Acc) when C =:= $/; C =:= $?; C =:= $# ->
    {lists:reverse(Acc), Rest};
urlsplit_netloc([C | Rest], Acc) ->
    urlsplit_netloc(Rest, [C | Acc]).


%% @spec path_split(string()) -> {Part, Rest}
%% @doc Split a path starting from the left, as in URL traversal.
%%      path_split("foo/bar") = {"foo", "bar"},
%%      path_split("/foo/bar") = {"", "foo/bar"}.
path_split(S) ->
    path_split(S, []).

path_split("", Acc) ->
    {lists:reverse(Acc), ""};
path_split("/" ++ Rest, Acc) ->
    {lists:reverse(Acc), Rest};
path_split([C | Rest], Acc) ->
    path_split(Rest, [C | Acc]).


%% @spec urlunsplit({Scheme, Netloc, Path, Query, Fragment}) -> string()
%% @doc Assemble a URL from the 5-tuple. Path must be absolute.
urlunsplit({Scheme, Netloc, Path, Query, Fragment}) ->
    lists:flatten([case Scheme of "" -> "";  _ -> [Scheme, "://"] end,
		   Netloc,
		   urlunsplit_path({Path, Query, Fragment})]).

%% @spec urlunsplit_path({Path, Query, Fragment}) -> string()
%% @doc Assemble a URL path from the 3-tuple.
urlunsplit_path({Path, Query, Fragment}) ->
    lists:flatten([Path,
		   case Query of "" -> ""; _ -> [$? | Query] end,
		   case Fragment of "" -> ""; _ -> [$# | Fragment] end]).

%% @spec urlsplit_path(Url) -> {Path, Query, Fragment}
%% @doc Return a 3-tuple, does not expand % escapes. Only supports HTTP style
%%      paths.
urlsplit_path(Path) ->
    urlsplit_path(Path, []).

urlsplit_path("", Acc) ->
    {lists:reverse(Acc), "", ""};
urlsplit_path("?" ++ Rest, Acc) ->
    {Query, Fragment} = urlsplit_query(Rest),
    {lists:reverse(Acc), Query, Fragment};
urlsplit_path("#" ++ Rest, Acc) ->
    {lists:reverse(Acc), "", Rest};
urlsplit_path([C | Rest], Acc) ->
    urlsplit_path(Rest, [C | Acc]).

urlsplit_query(Query) ->
    urlsplit_query(Query, []).

urlsplit_query("", Acc) ->
    {lists:reverse(Acc), ""};
urlsplit_query("#" ++ Rest, Acc) ->
    {lists:reverse(Acc), Rest};
urlsplit_query([C | Rest], Acc) ->
    urlsplit_query(Rest, [C | Acc]).

%% @spec guess_mime(string()) -> string()
%% @doc  Guess the mime type of a file by the extension of its filename.
guess_mime(File) ->
    case filename:extension(File) of
	".html" ->
	    "text/html";
	".xhtml" ->
	    "application/xhtml+xml";
	".xml" ->
	    "application/xml";
	".css" ->
	    "text/css";
	".js" ->
	    "application/x-javascript";
	".jpg" ->
	    "image/jpeg";
	".gif" ->
	    "image/gif";
	".swf" ->
	    "application/x-shockwave-flash";
	".zip" ->
	    "application/zip";
	".bz2" ->
	    "application/x-bzip2";
	".gz" ->
	    "application/x-gzip";
	".tar" ->
	    "application/x-tar";
	".tgz" ->
	    "application/x-gzip";
	_ ->
	    "text/plain"
    end.

%% @spec parse_header(string()) -> {Type, [{K, V}]}
%% @doc  Parse a Content-Type like header, return the main Content-Type
%%       and a property list of options.
parse_header(String) ->
    %% TODO: This is exactly as broken as Python's cgi module.
    %%       Should parse properly like mochiweb_cookies.
    [Type | Parts] = [string:strip(S) || S <- string:tokens(String, ";")],
    F = fun (S, Acc) ->
		case lists:splitwith(fun (C) -> C =/= $= end, S) of
		    {"", _} ->
			%% Skip anything with no name
			Acc;
		    {_, ""} ->
			%% Skip anything with no value
			Acc;
		    {Name, [$\= | Value]} ->
			[{string:to_lower(string:strip(Name)),
			  unquote_header(string:strip(Value))} | Acc]
		end
	end,
    {string:to_lower(Type),
     lists:foldr(F, [], Parts)}.

unquote_header("\"" ++ Rest) ->
    unquote_header(Rest, []);
unquote_header(S) ->
    S.

unquote_header("", Acc) ->
    lists:reverse(Acc);
unquote_header("\"", Acc) ->
    lists:reverse(Acc);
unquote_header([$\\, C | Rest], Acc) ->
    unquote_header(Rest, [C | Acc]);
unquote_header([C | Rest], Acc) ->
    unquote_header(Rest, [C | Acc]).

shell_quote([], Acc) ->
    lists:reverse([$\" | Acc]);
shell_quote([C | Rest], Acc) when C =:= $\" orelse C =:= $\` orelse
                                  C =:= $\\ orelse C =:= $\$ ->
    shell_quote(Rest, [C, $\\ | Acc]);
shell_quote([C | Rest], Acc) ->
    shell_quote(Rest, [C | Acc]).

test() ->
    test_join(),
    test_quote_plus(),
    test_unquote(),
    test_urlencode(),
    test_parse_qs(),
    test_urlsplit_path(),
    test_urlunsplit_path(),
    test_urlsplit(),
    test_urlunsplit(),
    test_path_split(),
    test_guess_mime(),
    test_parse_header(),
    test_shell_quote(),
    test_cmd(),
    test_cmd_string(),
    ok.

test_shell_quote() ->
    "\"foo \\$bar\\\"\\`' baz\"" = shell_quote("foo $bar\"`' baz"),
    ok.

test_cmd() ->
    "$bling$ `word`!\n" = cmd(["echo", "$bling$ `word`!"]),
    ok.

test_cmd_string() ->
    "\"echo\" \"\\$bling\\$ \\`word\\`!\"" = cmd_string(["echo", "$bling$ `word`!"]),
    ok.

test_parse_header() ->
    {"multipart/form-data", [{"boundary", "AaB03x"}]} =
	parse_header("multipart/form-data; boundary=AaB03x"),
    ok.
    
test_guess_mime() ->
    "text/plain" = guess_mime(""),
    "application/zip" = guess_mime(".zip"),
    "application/zip" = guess_mime("x.zip"),
    "text/html" = guess_mime("x.html"),
    "application/xhtml+xml" = guess_mime("x.xhtml"),
    ok.

test_path_split() ->
    {"", "foo/bar"} = path_split("/foo/bar"),
    {"foo", "bar"} = path_split("foo/bar"),
    {"bar", ""} = path_split("bar"),
    ok.

test_urlsplit() ->
    {"", "", "/foo", "", "bar?baz"} = urlsplit("/foo#bar?baz"),
    {"http", "host:port", "/foo", "", "bar?baz"} =
	urlsplit("http://host:port/foo#bar?baz"),
    ok.

test_urlsplit_path() ->
    {"/foo/bar", "", ""} = urlsplit_path("/foo/bar"),
    {"/foo", "baz", ""} = urlsplit_path("/foo?baz"),
    {"/foo", "", "bar?baz"} = urlsplit_path("/foo#bar?baz"),
    {"/foo", "", "bar?baz#wibble"} = urlsplit_path("/foo#bar?baz#wibble"),
    {"/foo", "bar", "baz"} = urlsplit_path("/foo?bar#baz"),
    {"/foo", "bar?baz", "baz"} = urlsplit_path("/foo?bar?baz#baz"),
    ok.

test_urlunsplit() ->
    "/foo#bar?baz" = urlunsplit({"", "", "/foo", "", "bar?baz"}),
    "http://host:port/foo#bar?baz" =
	urlunsplit({"http", "host:port", "/foo", "", "bar?baz"}),
    ok.

test_urlunsplit_path() ->
    "/foo/bar" = urlunsplit_path({"/foo/bar", "", ""}),
    "/foo?baz" = urlunsplit_path({"/foo", "baz", ""}),
    "/foo#bar?baz" = urlunsplit_path({"/foo", "", "bar?baz"}),
    "/foo#bar?baz#wibble" = urlunsplit_path({"/foo", "", "bar?baz#wibble"}),
    "/foo?bar#baz" = urlunsplit_path({"/foo", "bar", "baz"}),
    "/foo?bar?baz#baz" = urlunsplit_path({"/foo", "bar?baz", "baz"}),
    ok.

test_join() ->
    "foo,bar,baz" = join(["foo", "bar", "baz"], $,),
    "foo,bar,baz" = join(["foo", "bar", "baz"], ","),
    "foo bar" = join([["foo", " bar"]], ","),
    "foo bar,baz" = join([["foo", " bar"], "baz"], ","),
    "foo" = join(["foo"], ","),
    "foobarbaz" = join(["foo", "bar", "baz"], ""),
    ok.

test_quote_plus() ->
    "foo" = quote_plus(foo),
    "1" = quote_plus(1),
    "foo" = quote_plus("foo"),
    "foo+bar" = quote_plus("foo bar"),
    "foo%0A" = quote_plus("foo\n"),
    "foo%0A" = quote_plus("foo\n"),
    "foo%3B%26%3D" = quote_plus("foo;&="),
    ok.

test_unquote() ->
    "foo bar" = unquote("foo+bar"),
    "foo bar" = unquote("foo%20bar"),
    "foo\r\n" = unquote("foo%0D%0A"),
    ok.
    
test_urlencode() ->
    "foo=bar&baz=wibble+%0D%0A&z=1" = urlencode([{foo, "bar"},
						 {"baz", "wibble \r\n"},
						 {z, 1}]),
    ok.

test_parse_qs() ->
    [{"foo", "bar"}, {"baz", "wibble \r\n"}, {"z", "1"}] =
	parse_qs("foo=bar&baz=wibble+%0D%0A&z=1"),
    ok.

