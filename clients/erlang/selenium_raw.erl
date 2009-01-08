%% @author Brian P O'Rourke <brianorourke@gmail.com> [http://brianorourke.org]
%% @doc SeleniumRC: an Erlang Module
%%
%% Example usage:
%%   Base = "http://localhost:4444/",
%%   {ok, Pid} = selenium:get_new_browser_session("localhost", 4444, "*firefox", Base),
%%   selenium:open(Pid, "/selenium-server/tests/html/test_click_page1.html"),
%%   Links = selenium:get_all_links(Pid),
%%   selenium:stop(Pid).
%%
%% See selenium:test_acceptance() for a more complex example.

-module(selenium).
-author("Brian P O'Rourke (brianorourke@gmail.com)").
-behaviour(gen_server).

-export([get_new_browser_session/4,
         stop/1,
         open/2,
         click/2,
         get_all_links/1,
         get_text/2,
         wait_for_page_to_load/2,
         get_location/1,
         is_prompt_present/1,
         get_xpath_count/2
         ]).

-export([init/1,terminate/2,handle_call/3,handle_cast/2,code_change/3,handle_info/2]).
-export([test/0]).
-define(COMMAND_PATH, "/selenium-server/driver/").
-define(NEW_SESSION, "getNewBrowserSession").
-define(SERVER, selenium).

-record(session,
  {server,
  port,
  id
  }).

-record(cmd,
  {type,
  string,
  params = []
  }).

%%%%%%%%%%%%%
%% PUBLIC API
%%%%%%%%%%%%%

%% @spec get_new_browser_session(string(), integer(), string(), string()) -> Result
%%       Rsult = {ok,Pid} | ignore | {error,Error},
%%       Pid = pid(),
%%       Error = {already_started,Pid} | term()
get_new_browser_session(Server, Port, StartCmd, Url) ->
  gen_server:start_link({local,?SERVER}, ?MODULE, {Server, Port, StartCmd, Url}, []).

%% @spec stop(pid()) -> ok
stop(Pid) ->
  gen_server:call(Pid, stop).


%% @spec open(pid(), string()) -> ok
open(Pid, Url) ->
  gen_server:call(Pid, #cmd{type=exec, string="open", params=[Url]}).

%% @spec get_all_links(pid()) -> [string()]
get_all_links(Pid) ->
  gen_server:call(Pid, #cmd{type=string_array, string="getAllLinks"}).

%% @spec get_text(pid(), string()) -> string()
get_text(Pid, Locator) ->
  gen_server:call(Pid, #cmd{type=string, string="getText", params=[Locator]}).

%% @spec wait_for_page_to_load(pid(), integer()) -> ok
wait_for_page_to_load(Pid, Timeout) ->
  gen_server:call(Pid, #cmd{type=exec, string="waitForPageToLoad", params=[Timeout]}).

%% @spec get_location(pid()) -> string()
get_location(Pid) ->
  gen_server:call(Pid, #cmd{type=string, string="getLocation"}).

%% @spec is_prompt_present(pid()) -> string()
is_prompt_present(Pid) ->
  gen_server:call(Pid, #cmd{type=boolean, string="isPromptPresent"}).

%% @spec get_xpath_count(pid(), string()) -> string()
get_xpath_count(Pid, Xpath) ->
  gen_server:call(Pid, #cmd{type=num, string="getXpathCount", params=[Xpath]}).


%% Clicks on a link, button, checkbox or radio button. If the click action
%% causes a new page to load (like a link usually does), call
%% waitForPageToLoad.
%%
%% @spec click(pid(), string()) -> ok
click(Pid, Locator) ->
  gen_server:call(Pid, #cmd{type=exec, string="click", params=[Locator]}).

%%%%%%%%%%%%%%%%%%%%
%% PRIVATE FUNCTIONS
%%%%%%%%%%%%%%%%%%%%

%% @spec ordinal_args([Value]) -> [{integer(), Value}]
%% @doc Turns each list item into a tuple of {Index, Item}
%%      Start index is 1
ordinal_args(Args) -> 
  {Results, _} = lists:foldl( fun (Item, {Acc, X}) ->
                                        {[{X,Item} | Acc], X+1}
                              end, {[],1}, Args),
  lists:reverse(Results).

%% @spec get_command([{Key,Value}]) -> string()
%% @doc composes a complete Selenium request string from a set of query parameters
get_command(Args) ->
  ?COMMAND_PATH ++ "?" ++ mochiweb_util:urlencode(Args).

%% @spec selenium_call(Session, string(), string()) -> RawSeleniumBody | SeleniumError
selenium_call(Session, Verb, Args) ->
  ArgsWithSession = [{"sessionId", Session#session.id} | ordinal_args(Args)],
  Command = get_command([{"cmd", Verb} | ArgsWithSession]),
  selenium_call(Session, Command).

%% @spec selenium_call(Session, string()) -> RawSeleniumBody | SeleniumError
%%       Session = { Server, Port, SessionId }
%%       RawSeleniumBody = string()
%%       SeleniumError = {selenium_error, RawSeleniumBody}
selenium_call(S, Command) ->
  Url = lists:concat(["http://", S#session.server, ":", S#session.port, Command]),
  {ok, {_, _, Body}} = http:request(Url),
  % this is what HTTP response codes are for. but looks like we're
  % reproducing the functionality for some reason...
  {Code,_Response} = lists:split(2, Body),
  case Code of
    "OK"   -> {ok, Body};
    _Else  -> {selenium_error, Body}
  end.

%% @spec strip_prefix(string()) -> string()
%% @doc strips the "OK," from the front of a response.
strip_prefix(Body) ->
  {_Code,Response} = lists:split(3, Body),
  Response.

%% @spec parse_string_array(string()) -> [string()]
%% @doc simple CSV parse of a Selenium response body
parse_string_array(Body) ->
  String = strip_prefix(Body),
  parse_array(String,[],[]).
parse_array([H|T], Current, Results) ->
  case H of
    $,  -> NewString = lists:reverse(Current),
           parse_array(T, [], [NewString|Results]);
    $\\ -> [H2|T2] = T,
           parse_array(T2, [H2|Current], Results);
    _   -> parse_array(T, [H|Current], Results)
  end;
parse_array([],Current,Result) ->
  lists:reverse([lists:reverse(Current)|Result]).

parse_boolean(Body) ->
  list_to_atom( strip_prefix( Body ) ).
parse_boolean_array(Body) ->
  lists:map( lists_to_atom, parse_string_array( Body ) ).
parse_num(Body) ->
  list_to_integer( strip_prefix( Body ) ).
parse_num_array(Body) ->
  lists:map( list_to_integer, parse_string_array(Body) ).

%%%%%%%%%%%%%%%%%%%%%
%% GEN_SERVER SUPPORT
%%%%%%%%%%%%%%%%%%%%%
init({Server, Port, StartCmd, Url}) -> 
  inets:start(),
  Command = get_command([{"cmd", ?NEW_SESSION} | ordinal_args([StartCmd, Url])]),
  {ok, Response} = selenium_call( #session{server = Server, port = Port}, Command ),
  SessionId = strip_prefix(Response),
  {ok, #session{server=Server, port=Port, id=SessionId}}.

handle_call(#cmd{} = Cmd, _, Session) ->
  case selenium_call(Session, Cmd#cmd.string, Cmd#cmd.params) of
    {ok, Response} -> parse_cmd_response(Cmd#cmd.type, Response, Session);
    {selenium_error, Response} -> {reply, {selenium_error, Response}, Session}
  end;
handle_call(stop, _, Session) ->
  selenium_call(Session, "testComplete", []),
  {stop, normal, ok, Session}.

% @spec parse_cmd_response(Type, Response, Session) -> Reply
%       Type = exec | string | string_array | boolean | boolean_array
%              | num | num_array
%       Response = string()
%       Reply = {reply, ReturnVal, Session}
%       Response = term()
% @doc Parses a Selenium response according to its specified return
%      type.
parse_cmd_response(Type, Response, Session) ->
  case Type of
    exec          -> {reply, ok, Session};
    string        -> {reply, strip_prefix(Response), Session};
    string_array  -> {reply, parse_string_array(Response), Session};
    boolean       -> {reply, parse_boolean(Response), Session};
    boolean_array -> {reply, parse_boolean_array(Response), Session};
    num           -> {reply, parse_num(Response), Session};
    num_array     -> {reply, parse_num_array(Response), Session}
  end.

handle_cast(_Request, State) -> {noreply, State}.
terminate(_Reason, _Session) -> ok.
code_change(_OldVsn, Session, _Extra) -> {ok, Session}.
handle_info(_Info, Session) -> {noreply, Session}.

%%%%%%%%%%%%%%%
%% TESTS
%%%%%%%%%%%%%%%
test() ->
  test_args(),
  test_command(),
  test_strip_prefix(),
  test_parse_string_array(),
  test_acceptance(),
  ok.

test_args() ->
  List = ordinal_args(["foo","bar","baz"]),
  [{1,"foo"}|Rest1] = List,
  [{2,"bar"}|Rest2] = Rest1,
  [{3,"baz"}|_] = Rest2.

test_command() ->
  Results = get_command([{"cmd","foo \r\n"},{"param","bar"}]),
  "/selenium-server/driver/?cmd=foo+%0D%0A&param=bar" = Results,
  ok.

test_strip_prefix() ->
  "foo" = strip_prefix("OK,foo"),
  "_REQ" = strip_prefix("BAD_REQ"),
  ok.

test_parse_string_array() ->
  TestString = "OK,veni\\, vidi\\, vici,c:\\\\foo\\\\bar,c:\\\\I came\\, I \\\\saw\\\\\\, I conquered",
  Expected = ["veni, vidi, vici", "c:\\foo\\bar", "c:\\I came, I \\saw\\, I conquered"],
  Expected = parse_string_array(TestString),
  ok.

test_acceptance() ->
  Base = "http://localhost:4444/",
  {ok, Pid} = get_new_browser_session("localhost", 4444, "*firefox", Base),
  open(Pid, "/selenium-server/tests/html/test_click_page1.html"),
  "Click here for next page" = get_text(Pid, "link"),
  Links = get_all_links(Pid),
  6 = length(Links),
  "linkToAnchorOnThisPage" = lists:nth(4, Links),
  click(Pid, "link"),
  wait_for_page_to_load(Pid, 5000),
  "http://localhost:4444/selenium-server/tests/html/test_click_page2.html" = get_location(Pid), 
  click(Pid, "previousPage"),
  wait_for_page_to_load(Pid, 5000),
  "http://localhost:4444/selenium-server/tests/html/test_click_page1.html" = get_location(Pid),
  false = is_prompt_present(Pid),
  0 = get_xpath_count(Pid, "//sandwich"),
  stop(Pid),
  ok.
