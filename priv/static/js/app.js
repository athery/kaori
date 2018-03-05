(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};

require.register("phoenix/priv/static/phoenix.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "phoenix");
  (function() {
    (function (global, factory) {
typeof exports === 'object' ? factory(exports) :
typeof define === 'function' && define.amd ? define(['exports'], factory) :
factory(global.Phoenix = global.Phoenix || {});
}(this, (function (exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Phoenix Channels JavaScript client
 *
 * ## Socket Connection
 *
 * A single connection is established to the server and
 * channels are multiplexed over the connection.
 * Connect to the server using the `Socket` class:
 *
 * ```javascript
 *     let socket = new Socket("/socket", {params: {userToken: "123"}})
 *     socket.connect()
 * ```
 *
 * The `Socket` constructor takes the mount point of the socket,
 * the authentication params, as well as options that can be found in
 * the Socket docs, such as configuring the `LongPoll` transport, and
 * heartbeat.
 *
 * ## Channels
 *
 * Channels are isolated, concurrent processes on the server that
 * subscribe to topics and broker events between the client and server.
 * To join a channel, you must provide the topic, and channel params for
 * authorization. Here's an example chat room example where `"new_msg"`
 * events are listened for, messages are pushed to the server, and
 * the channel is joined with ok/error/timeout matches:
 *
 * ```javascript
 *     let channel = socket.channel("room:123", {token: roomToken})
 *     channel.on("new_msg", msg => console.log("Got message", msg) )
 *     $input.onEnter( e => {
 *       channel.push("new_msg", {body: e.target.val}, 10000)
 *        .receive("ok", (msg) => console.log("created message", msg) )
 *        .receive("error", (reasons) => console.log("create failed", reasons) )
 *        .receive("timeout", () => console.log("Networking issue...") )
 *     })
 *     channel.join()
 *       .receive("ok", ({messages}) => console.log("catching up", messages) )
 *       .receive("error", ({reason}) => console.log("failed join", reason) )
 *       .receive("timeout", () => console.log("Networking issue. Still waiting...") )
 *```
 *
 * ## Joining
 *
 * Creating a channel with `socket.channel(topic, params)`, binds the params to
 * `channel.params`, which are sent up on `channel.join()`.
 * Subsequent rejoins will send up the modified params for
 * updating authorization params, or passing up last_message_id information.
 * Successful joins receive an "ok" status, while unsuccessful joins
 * receive "error".
 *
 * ## Duplicate Join Subscriptions
 *
 * While the client may join any number of topics on any number of channels,
 * the client may only hold a single subscription for each unique topic at any
 * given time. When attempting to create a duplicate subscription,
 * the server will close the existing channel, log a warning, and
 * spawn a new channel for the topic. The client will have their
 * `channel.onClose` callbacks fired for the existing channel, and the new
 * channel join will have its receive hooks processed as normal.
 *
 * ## Pushing Messages
 *
 * From the previous example, we can see that pushing messages to the server
 * can be done with `channel.push(eventName, payload)` and we can optionally
 * receive responses from the push. Additionally, we can use
 * `receive("timeout", callback)` to abort waiting for our other `receive` hooks
 *  and take action after some period of waiting. The default timeout is 5000ms.
 *
 *
 * ## Socket Hooks
 *
 * Lifecycle events of the multiplexed connection can be hooked into via
 * `socket.onError()` and `socket.onClose()` events, ie:
 *
 * ```javascript
 *     socket.onError( () => console.log("there was an error with the connection!") )
 *     socket.onClose( () => console.log("the connection dropped") )
 * ```
 *
 *
 * ## Channel Hooks
 *
 * For each joined channel, you can bind to `onError` and `onClose` events
 * to monitor the channel lifecycle, ie:
 *
 * ```javascript
 *     channel.onError( () => console.log("there was an error!") )
 *     channel.onClose( () => console.log("the channel has gone away gracefully") )
 * ```
 *
 * ### onError hooks
 *
 * `onError` hooks are invoked if the socket connection drops, or the channel
 * crashes on the server. In either case, a channel rejoin is attempted
 * automatically in an exponential backoff manner.
 *
 * ### onClose hooks
 *
 * `onClose` hooks are invoked only in two cases. 1) the channel explicitly
 * closed on the server, or 2). The client explicitly closed, by calling
 * `channel.leave()`
 *
 *
 * ## Presence
 *
 * The `Presence` object provides features for syncing presence information
 * from the server with the client and handling presences joining and leaving.
 *
 * ### Syncing initial state from the server
 *
 * `Presence.syncState` is used to sync the list of presences on the server
 * with the client's state. An optional `onJoin` and `onLeave` callback can
 * be provided to react to changes in the client's local presences across
 * disconnects and reconnects with the server.
 *
 * `Presence.syncDiff` is used to sync a diff of presence join and leave
 * events from the server, as they happen. Like `syncState`, `syncDiff`
 * accepts optional `onJoin` and `onLeave` callbacks to react to a user
 * joining or leaving from a device.
 *
 * ### Listing Presences
 *
 * `Presence.list` is used to return a list of presence information
 * based on the local state of metadata. By default, all presence
 * metadata is returned, but a `listBy` function can be supplied to
 * allow the client to select which metadata to use for a given presence.
 * For example, you may have a user online from different devices with
 * a metadata status of "online", but they have set themselves to "away"
 * on another device. In this case, the app may choose to use the "away"
 * status for what appears on the UI. The example below defines a `listBy`
 * function which prioritizes the first metadata which was registered for
 * each user. This could be the first tab they opened, or the first device
 * they came online from:
 *
 * ```javascript
 *     let state = {}
 *     state = Presence.syncState(state, stateFromServer)
 *     let listBy = (id, {metas: [first, ...rest]}) => {
 *       first.count = rest.length + 1 // count of this user's presences
 *       first.id = id
 *       return first
 *     }
 *     let onlineUsers = Presence.list(state, listBy)
 * ```
 *
 *
 * ### Example Usage
 *```javascript
 *     // detect if user has joined for the 1st time or from another tab/device
 *     let onJoin = (id, current, newPres) => {
 *       if(!current){
 *         console.log("user has entered for the first time", newPres)
 *       } else {
 *         console.log("user additional presence", newPres)
 *       }
 *     }
 *     // detect if user has left from all tabs/devices, or is still present
 *     let onLeave = (id, current, leftPres) => {
 *       if(current.metas.length === 0){
 *         console.log("user has left from all devices", leftPres)
 *       } else {
 *         console.log("user left from a device", leftPres)
 *       }
 *     }
 *     let presences = {} // client's initial empty presence state
 *     // receive initial presence data from server, sent after join
 *     myChannel.on("presence_state", state => {
 *       presences = Presence.syncState(presences, state, onJoin, onLeave)
 *       displayUsers(Presence.list(presences))
 *     })
 *     // receive "presence_diff" from server, containing join/leave events
 *     myChannel.on("presence_diff", diff => {
 *       presences = Presence.syncDiff(presences, diff, onJoin, onLeave)
 *       this.setState({users: Presence.list(room.presences, listBy)})
 *     })
 * ```
 * @module phoenix
 */

var VSN = "2.0.0";
var SOCKET_STATES = { connecting: 0, open: 1, closing: 2, closed: 3 };
var DEFAULT_TIMEOUT = 10000;
var WS_CLOSE_NORMAL = 1000;
var CHANNEL_STATES = {
  closed: "closed",
  errored: "errored",
  joined: "joined",
  joining: "joining",
  leaving: "leaving"
};
var CHANNEL_EVENTS = {
  close: "phx_close",
  error: "phx_error",
  join: "phx_join",
  reply: "phx_reply",
  leave: "phx_leave"
};
var CHANNEL_LIFECYCLE_EVENTS = [CHANNEL_EVENTS.close, CHANNEL_EVENTS.error, CHANNEL_EVENTS.join, CHANNEL_EVENTS.reply, CHANNEL_EVENTS.leave];
var TRANSPORTS = {
  longpoll: "longpoll",
  websocket: "websocket"
};

/**
 * Initializes the Push
 * @param {Channel} channel - The Channel
 * @param {string} event - The event, for example `"phx_join"`
 * @param {Object} payload - The payload, for example `{user_id: 123}`
 * @param {number} timeout - The push timeout in milliseconds
 */

var Push = function () {
  function Push(channel, event, payload, timeout) {
    _classCallCheck(this, Push);

    this.channel = channel;
    this.event = event;
    this.payload = payload || {};
    this.receivedResp = null;
    this.timeout = timeout;
    this.timeoutTimer = null;
    this.recHooks = [];
    this.sent = false;
  }

  /**
   *
   * @param {number} timeout
   */


  _createClass(Push, [{
    key: "resend",
    value: function resend(timeout) {
      this.timeout = timeout;
      this.reset();
      this.send();
    }

    /**
     *
     */

  }, {
    key: "send",
    value: function send() {
      if (this.hasReceived("timeout")) {
        return;
      }
      this.startTimeout();
      this.sent = true;
      this.channel.socket.push({
        topic: this.channel.topic,
        event: this.event,
        payload: this.payload,
        ref: this.ref,
        join_ref: this.channel.joinRef()
      });
    }

    /**
     *
     * @param {*} status
     * @param {*} callback
     */

  }, {
    key: "receive",
    value: function receive(status, callback) {
      if (this.hasReceived(status)) {
        callback(this.receivedResp.response);
      }

      this.recHooks.push({ status: status, callback: callback });
      return this;
    }

    // private

  }, {
    key: "reset",
    value: function reset() {
      this.cancelRefEvent();
      this.ref = null;
      this.refEvent = null;
      this.receivedResp = null;
      this.sent = false;
    }
  }, {
    key: "matchReceive",
    value: function matchReceive(_ref) {
      var status = _ref.status,
          response = _ref.response,
          ref = _ref.ref;

      this.recHooks.filter(function (h) {
        return h.status === status;
      }).forEach(function (h) {
        return h.callback(response);
      });
    }
  }, {
    key: "cancelRefEvent",
    value: function cancelRefEvent() {
      if (!this.refEvent) {
        return;
      }
      this.channel.off(this.refEvent);
    }
  }, {
    key: "cancelTimeout",
    value: function cancelTimeout() {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }, {
    key: "startTimeout",
    value: function startTimeout() {
      var _this = this;

      if (this.timeoutTimer) {
        this.cancelTimeout();
      }
      this.ref = this.channel.socket.makeRef();
      this.refEvent = this.channel.replyEventName(this.ref);

      this.channel.on(this.refEvent, function (payload) {
        _this.cancelRefEvent();
        _this.cancelTimeout();
        _this.receivedResp = payload;
        _this.matchReceive(payload);
      });

      this.timeoutTimer = setTimeout(function () {
        _this.trigger("timeout", {});
      }, this.timeout);
    }
  }, {
    key: "hasReceived",
    value: function hasReceived(status) {
      return this.receivedResp && this.receivedResp.status === status;
    }
  }, {
    key: "trigger",
    value: function trigger(status, response) {
      this.channel.trigger(this.refEvent, { status: status, response: response });
    }
  }]);

  return Push;
}();

/**
 *
 * @param {string} topic
 * @param {Object} params
 * @param {Socket} socket
 */


var Channel = exports.Channel = function () {
  function Channel(topic, params, socket) {
    var _this2 = this;

    _classCallCheck(this, Channel);

    this.state = CHANNEL_STATES.closed;
    this.topic = topic;
    this.params = params || {};
    this.socket = socket;
    this.bindings = [];
    this.timeout = this.socket.timeout;
    this.joinedOnce = false;
    this.joinPush = new Push(this, CHANNEL_EVENTS.join, this.params, this.timeout);
    this.pushBuffer = [];
    this.rejoinTimer = new Timer(function () {
      return _this2.rejoinUntilConnected();
    }, this.socket.reconnectAfterMs);
    this.joinPush.receive("ok", function () {
      _this2.state = CHANNEL_STATES.joined;
      _this2.rejoinTimer.reset();
      _this2.pushBuffer.forEach(function (pushEvent) {
        return pushEvent.send();
      });
      _this2.pushBuffer = [];
    });
    this.onClose(function () {
      _this2.rejoinTimer.reset();
      _this2.socket.log("channel", "close " + _this2.topic + " " + _this2.joinRef());
      _this2.state = CHANNEL_STATES.closed;
      _this2.socket.remove(_this2);
    });
    this.onError(function (reason) {
      if (_this2.isLeaving() || _this2.isClosed()) {
        return;
      }
      _this2.socket.log("channel", "error " + _this2.topic, reason);
      _this2.state = CHANNEL_STATES.errored;
      _this2.rejoinTimer.scheduleTimeout();
    });
    this.joinPush.receive("timeout", function () {
      if (!_this2.isJoining()) {
        return;
      }
      _this2.socket.log("channel", "timeout " + _this2.topic + " (" + _this2.joinRef() + ")", _this2.joinPush.timeout);
      var leavePush = new Push(_this2, CHANNEL_EVENTS.leave, {}, _this2.timeout);
      leavePush.send();
      _this2.state = CHANNEL_STATES.errored;
      _this2.joinPush.reset();
      _this2.rejoinTimer.scheduleTimeout();
    });
    this.on(CHANNEL_EVENTS.reply, function (payload, ref) {
      _this2.trigger(_this2.replyEventName(ref), payload);
    });
  }

  _createClass(Channel, [{
    key: "rejoinUntilConnected",
    value: function rejoinUntilConnected() {
      this.rejoinTimer.scheduleTimeout();
      if (this.socket.isConnected()) {
        this.rejoin();
      }
    }
  }, {
    key: "join",
    value: function join() {
      var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.timeout;

      if (this.joinedOnce) {
        throw "tried to join multiple times. 'join' can only be called a single time per channel instance";
      } else {
        this.joinedOnce = true;
        this.rejoin(timeout);
        return this.joinPush;
      }
    }
  }, {
    key: "onClose",
    value: function onClose(callback) {
      this.on(CHANNEL_EVENTS.close, callback);
    }
  }, {
    key: "onError",
    value: function onError(callback) {
      this.on(CHANNEL_EVENTS.error, function (reason) {
        return callback(reason);
      });
    }
  }, {
    key: "on",
    value: function on(event, callback) {
      this.bindings.push({ event: event, callback: callback });
    }
  }, {
    key: "off",
    value: function off(event) {
      this.bindings = this.bindings.filter(function (bind) {
        return bind.event !== event;
      });
    }
  }, {
    key: "canPush",
    value: function canPush() {
      return this.socket.isConnected() && this.isJoined();
    }
  }, {
    key: "push",
    value: function push(event, payload) {
      var timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.timeout;

      if (!this.joinedOnce) {
        throw "tried to push '" + event + "' to '" + this.topic + "' before joining. Use channel.join() before pushing events";
      }
      var pushEvent = new Push(this, event, payload, timeout);
      if (this.canPush()) {
        pushEvent.send();
      } else {
        pushEvent.startTimeout();
        this.pushBuffer.push(pushEvent);
      }

      return pushEvent;
    }

    /** Leaves the channel
     *
     * Unsubscribes from server events, and
     * instructs channel to terminate on server
     *
     * Triggers onClose() hooks
     *
     * To receive leave acknowledgements, use the a `receive`
     * hook to bind to the server ack, ie:
     *
     * ```javascript
     *     channel.leave().receive("ok", () => alert("left!") )
     * ```
     */

  }, {
    key: "leave",
    value: function leave() {
      var _this3 = this;

      var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.timeout;

      this.state = CHANNEL_STATES.leaving;
      var onClose = function onClose() {
        _this3.socket.log("channel", "leave " + _this3.topic);
        _this3.trigger(CHANNEL_EVENTS.close, "leave");
      };
      var leavePush = new Push(this, CHANNEL_EVENTS.leave, {}, timeout);
      leavePush.receive("ok", function () {
        return onClose();
      }).receive("timeout", function () {
        return onClose();
      });
      leavePush.send();
      if (!this.canPush()) {
        leavePush.trigger("ok", {});
      }

      return leavePush;
    }

    /**
     * Overridable message hook
     *
     * Receives all events for specialized message handling
     * before dispatching to the channel callbacks.
     *
     * Must return the payload, modified or unmodified
     */

  }, {
    key: "onMessage",
    value: function onMessage(event, payload, ref) {
      return payload;
    }

    // private

  }, {
    key: "isMember",
    value: function isMember(topic, event, payload, joinRef) {
      if (this.topic !== topic) {
        return false;
      }
      var isLifecycleEvent = CHANNEL_LIFECYCLE_EVENTS.indexOf(event) >= 0;

      if (joinRef && isLifecycleEvent && joinRef !== this.joinRef()) {
        this.socket.log("channel", "dropping outdated message", { topic: topic, event: event, payload: payload, joinRef: joinRef });
        return false;
      } else {
        return true;
      }
    }
  }, {
    key: "joinRef",
    value: function joinRef() {
      return this.joinPush.ref;
    }
  }, {
    key: "sendJoin",
    value: function sendJoin(timeout) {
      this.state = CHANNEL_STATES.joining;
      this.joinPush.resend(timeout);
    }
  }, {
    key: "rejoin",
    value: function rejoin() {
      var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.timeout;
      if (this.isLeaving()) {
        return;
      }
      this.sendJoin(timeout);
    }
  }, {
    key: "trigger",
    value: function trigger(event, payload, ref, joinRef) {
      var _this4 = this;

      var handledPayload = this.onMessage(event, payload, ref, joinRef);
      if (payload && !handledPayload) {
        throw "channel onMessage callbacks must return the payload, modified or unmodified";
      }

      this.bindings.filter(function (bind) {
        return bind.event === event;
      }).map(function (bind) {
        return bind.callback(handledPayload, ref, joinRef || _this4.joinRef());
      });
    }
  }, {
    key: "replyEventName",
    value: function replyEventName(ref) {
      return "chan_reply_" + ref;
    }
  }, {
    key: "isClosed",
    value: function isClosed() {
      return this.state === CHANNEL_STATES.closed;
    }
  }, {
    key: "isErrored",
    value: function isErrored() {
      return this.state === CHANNEL_STATES.errored;
    }
  }, {
    key: "isJoined",
    value: function isJoined() {
      return this.state === CHANNEL_STATES.joined;
    }
  }, {
    key: "isJoining",
    value: function isJoining() {
      return this.state === CHANNEL_STATES.joining;
    }
  }, {
    key: "isLeaving",
    value: function isLeaving() {
      return this.state === CHANNEL_STATES.leaving;
    }
  }]);

  return Channel;
}();

var Serializer = {
  encode: function encode(msg, callback) {
    var payload = [msg.join_ref, msg.ref, msg.topic, msg.event, msg.payload];
    return callback(JSON.stringify(payload));
  },
  decode: function decode(rawPayload, callback) {
    var _JSON$parse = JSON.parse(rawPayload),
        _JSON$parse2 = _slicedToArray(_JSON$parse, 5),
        join_ref = _JSON$parse2[0],
        ref = _JSON$parse2[1],
        topic = _JSON$parse2[2],
        event = _JSON$parse2[3],
        payload = _JSON$parse2[4];

    return callback({ join_ref: join_ref, ref: ref, topic: topic, event: event, payload: payload });
  }
};

/** Initializes the Socket
 *
 *
 * For IE8 support use an ES5-shim (https://github.com/es-shims/es5-shim)
 *
 * @param {string} endPoint - The string WebSocket endpoint, ie, `"ws://example.com/socket"`,
 *                                               `"wss://example.com"`
 *                                               `"/socket"` (inherited host & protocol)
 * @param {Object} opts - Optional configuration
 * @param {string} opts.transport - The Websocket Transport, for example WebSocket or Phoenix.LongPoll.
 *
 * Defaults to WebSocket with automatic LongPoll fallback.
 * @param {Function} opts.encode - The function to encode outgoing messages.
 *
 * Defaults to JSON:
 *
 * ```javascript
 * (payload, callback) => callback(JSON.stringify(payload))
 * ```
 *
 * @param {Function} opts.decode - The function to decode incoming messages.
 *
 * Defaults to JSON:
 *
 * ```javascript
 * (payload, callback) => callback(JSON.parse(payload))
 * ```
 *
 * @param {number} opts.timeout - The default timeout in milliseconds to trigger push timeouts.
 *
 * Defaults `DEFAULT_TIMEOUT`
 * @param {number} opts.heartbeatIntervalMs - The millisec interval to send a heartbeat message
 * @param {number} opts.reconnectAfterMs - The optional function that returns the millsec reconnect interval.
 *
 * Defaults to stepped backoff of:
 *
 * ```javascript
 *  function(tries){
 *    return [1000, 5000, 10000][tries - 1] || 10000
 *  }
 * ```
 * @param {Function} opts.logger - The optional function for specialized logging, ie:
 * ```javascript
 * logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
 * ```
 *
 * @param {number}  opts.longpollerTimeout - The maximum timeout of a long poll AJAX request.
 *
 * Defaults to 20s (double the server long poll timer).
 *
 * @param {Object}  opts.params - The optional params to pass when connecting
 *
 *
*/

var Socket = exports.Socket = function () {
  function Socket(endPoint) {
    var _this5 = this;

    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Socket);

    this.stateChangeCallbacks = { open: [], close: [], error: [], message: [] };
    this.channels = [];
    this.sendBuffer = [];
    this.ref = 0;
    this.timeout = opts.timeout || DEFAULT_TIMEOUT;
    this.transport = opts.transport || window.WebSocket || LongPoll;
    this.defaultEncoder = Serializer.encode;
    this.defaultDecoder = Serializer.decode;
    if (this.transport !== LongPoll) {
      this.encode = opts.encode || this.defaultEncoder;
      this.decode = opts.decode || this.defaultDecoder;
    } else {
      this.encode = this.defaultEncoder;
      this.decode = this.defaultDecoder;
    }
    this.heartbeatIntervalMs = opts.heartbeatIntervalMs || 30000;
    this.reconnectAfterMs = opts.reconnectAfterMs || function (tries) {
      return [1000, 2000, 5000, 10000][tries - 1] || 10000;
    };
    this.logger = opts.logger || function () {}; // noop
    this.longpollerTimeout = opts.longpollerTimeout || 20000;
    this.params = opts.params || {};
    this.endPoint = endPoint + "/" + TRANSPORTS.websocket;
    this.heartbeatTimer = null;
    this.pendingHeartbeatRef = null;
    this.reconnectTimer = new Timer(function () {
      _this5.disconnect(function () {
        return _this5.connect();
      });
    }, this.reconnectAfterMs);
  }

  _createClass(Socket, [{
    key: "protocol",
    value: function protocol() {
      return location.protocol.match(/^https/) ? "wss" : "ws";
    }
  }, {
    key: "endPointURL",
    value: function endPointURL() {
      var uri = Ajax.appendParams(Ajax.appendParams(this.endPoint, this.params), { vsn: VSN });
      if (uri.charAt(0) !== "/") {
        return uri;
      }
      if (uri.charAt(1) === "/") {
        return this.protocol() + ":" + uri;
      }

      return this.protocol() + "://" + location.host + uri;
    }
  }, {
    key: "disconnect",
    value: function disconnect(callback, code, reason) {
      if (this.conn) {
        this.conn.onclose = function () {}; // noop
        if (code) {
          this.conn.close(code, reason || "");
        } else {
          this.conn.close();
        }
        this.conn = null;
      }
      callback && callback();
    }

    /**
     *
     * @param {Object} params - The params to send when connecting, for example `{user_id: userToken}`
     */

  }, {
    key: "connect",
    value: function connect(params) {
      var _this6 = this;

      if (params) {
        console && console.log("passing params to connect is deprecated. Instead pass :params to the Socket constructor");
        this.params = params;
      }
      if (this.conn) {
        return;
      }

      this.conn = new this.transport(this.endPointURL());
      this.conn.timeout = this.longpollerTimeout;
      this.conn.onopen = function () {
        return _this6.onConnOpen();
      };
      this.conn.onerror = function (error) {
        return _this6.onConnError(error);
      };
      this.conn.onmessage = function (event) {
        return _this6.onConnMessage(event);
      };
      this.conn.onclose = function (event) {
        return _this6.onConnClose(event);
      };
    }

    /**
     * Logs the message. Override `this.logger` for specialized logging. noops by default
     * @param {string} kind
     * @param {string} msg
     * @param {Object} data
     */

  }, {
    key: "log",
    value: function log(kind, msg, data) {
      this.logger(kind, msg, data);
    }

    // Registers callbacks for connection state change events
    //
    // Examples
    //
    //    socket.onError(function(error){ alert("An error occurred") })
    //

  }, {
    key: "onOpen",
    value: function onOpen(callback) {
      this.stateChangeCallbacks.open.push(callback);
    }
  }, {
    key: "onClose",
    value: function onClose(callback) {
      this.stateChangeCallbacks.close.push(callback);
    }
  }, {
    key: "onError",
    value: function onError(callback) {
      this.stateChangeCallbacks.error.push(callback);
    }
  }, {
    key: "onMessage",
    value: function onMessage(callback) {
      this.stateChangeCallbacks.message.push(callback);
    }
  }, {
    key: "onConnOpen",
    value: function onConnOpen() {
      var _this7 = this;

      this.log("transport", "connected to " + this.endPointURL());
      this.flushSendBuffer();
      this.reconnectTimer.reset();
      if (!this.conn.skipHeartbeat) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(function () {
          return _this7.sendHeartbeat();
        }, this.heartbeatIntervalMs);
      }
      this.stateChangeCallbacks.open.forEach(function (callback) {
        return callback();
      });
    }
  }, {
    key: "onConnClose",
    value: function onConnClose(event) {
      this.log("transport", "close", event);
      this.triggerChanError();
      clearInterval(this.heartbeatTimer);
      this.reconnectTimer.scheduleTimeout();
      this.stateChangeCallbacks.close.forEach(function (callback) {
        return callback(event);
      });
    }
  }, {
    key: "onConnError",
    value: function onConnError(error) {
      this.log("transport", error);
      this.triggerChanError();
      this.stateChangeCallbacks.error.forEach(function (callback) {
        return callback(error);
      });
    }
  }, {
    key: "triggerChanError",
    value: function triggerChanError() {
      this.channels.forEach(function (channel) {
        return channel.trigger(CHANNEL_EVENTS.error);
      });
    }
  }, {
    key: "connectionState",
    value: function connectionState() {
      switch (this.conn && this.conn.readyState) {
        case SOCKET_STATES.connecting:
          return "connecting";
        case SOCKET_STATES.open:
          return "open";
        case SOCKET_STATES.closing:
          return "closing";
        default:
          return "closed";
      }
    }
  }, {
    key: "isConnected",
    value: function isConnected() {
      return this.connectionState() === "open";
    }
  }, {
    key: "remove",
    value: function remove(channel) {
      this.channels = this.channels.filter(function (c) {
        return c.joinRef() !== channel.joinRef();
      });
    }
  }, {
    key: "channel",
    value: function channel(topic) {
      var chanParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var chan = new Channel(topic, chanParams, this);
      this.channels.push(chan);
      return chan;
    }
  }, {
    key: "push",
    value: function push(data) {
      var _this8 = this;

      var topic = data.topic,
          event = data.event,
          payload = data.payload,
          ref = data.ref,
          join_ref = data.join_ref;

      var callback = function callback() {
        _this8.encode(data, function (result) {
          _this8.conn.send(result);
        });
      };
      this.log("push", topic + " " + event + " (" + join_ref + ", " + ref + ")", payload);
      if (this.isConnected()) {
        callback();
      } else {
        this.sendBuffer.push(callback);
      }
    }

    /**
     * Return the next message ref, accounting for overflows
     */

  }, {
    key: "makeRef",
    value: function makeRef() {
      var newRef = this.ref + 1;
      if (newRef === this.ref) {
        this.ref = 0;
      } else {
        this.ref = newRef;
      }

      return this.ref.toString();
    }
  }, {
    key: "sendHeartbeat",
    value: function sendHeartbeat() {
      if (!this.isConnected()) {
        return;
      }
      if (this.pendingHeartbeatRef) {
        this.pendingHeartbeatRef = null;
        this.log("transport", "heartbeat timeout. Attempting to re-establish connection");
        this.conn.close(WS_CLOSE_NORMAL, "hearbeat timeout");
        return;
      }
      this.pendingHeartbeatRef = this.makeRef();
      this.push({ topic: "phoenix", event: "heartbeat", payload: {}, ref: this.pendingHeartbeatRef });
    }
  }, {
    key: "flushSendBuffer",
    value: function flushSendBuffer() {
      if (this.isConnected() && this.sendBuffer.length > 0) {
        this.sendBuffer.forEach(function (callback) {
          return callback();
        });
        this.sendBuffer = [];
      }
    }
  }, {
    key: "onConnMessage",
    value: function onConnMessage(rawMessage) {
      var _this9 = this;

      this.decode(rawMessage.data, function (msg) {
        var topic = msg.topic,
            event = msg.event,
            payload = msg.payload,
            ref = msg.ref,
            join_ref = msg.join_ref;

        if (ref && ref === _this9.pendingHeartbeatRef) {
          _this9.pendingHeartbeatRef = null;
        }

        _this9.log("receive", (payload.status || "") + " " + topic + " " + event + " " + (ref && "(" + ref + ")" || ""), payload);
        _this9.channels.filter(function (channel) {
          return channel.isMember(topic, event, payload, join_ref);
        }).forEach(function (channel) {
          return channel.trigger(event, payload, ref, join_ref);
        });
        _this9.stateChangeCallbacks.message.forEach(function (callback) {
          return callback(msg);
        });
      });
    }
  }]);

  return Socket;
}();

var LongPoll = exports.LongPoll = function () {
  function LongPoll(endPoint) {
    _classCallCheck(this, LongPoll);

    this.endPoint = null;
    this.token = null;
    this.skipHeartbeat = true;
    this.onopen = function () {}; // noop
    this.onerror = function () {}; // noop
    this.onmessage = function () {}; // noop
    this.onclose = function () {}; // noop
    this.pollEndpoint = this.normalizeEndpoint(endPoint);
    this.readyState = SOCKET_STATES.connecting;

    this.poll();
  }

  _createClass(LongPoll, [{
    key: "normalizeEndpoint",
    value: function normalizeEndpoint(endPoint) {
      return endPoint.replace("ws://", "http://").replace("wss://", "https://").replace(new RegExp("(.*)\/" + TRANSPORTS.websocket), "$1/" + TRANSPORTS.longpoll);
    }
  }, {
    key: "endpointURL",
    value: function endpointURL() {
      return Ajax.appendParams(this.pollEndpoint, { token: this.token });
    }
  }, {
    key: "closeAndRetry",
    value: function closeAndRetry() {
      this.close();
      this.readyState = SOCKET_STATES.connecting;
    }
  }, {
    key: "ontimeout",
    value: function ontimeout() {
      this.onerror("timeout");
      this.closeAndRetry();
    }
  }, {
    key: "poll",
    value: function poll() {
      var _this10 = this;

      if (!(this.readyState === SOCKET_STATES.open || this.readyState === SOCKET_STATES.connecting)) {
        return;
      }

      Ajax.request("GET", this.endpointURL(), "application/json", null, this.timeout, this.ontimeout.bind(this), function (resp) {
        if (resp) {
          var status = resp.status,
              token = resp.token,
              messages = resp.messages;

          _this10.token = token;
        } else {
          var status = 0;
        }

        switch (status) {
          case 200:
            messages.forEach(function (msg) {
              return _this10.onmessage({ data: msg });
            });
            _this10.poll();
            break;
          case 204:
            _this10.poll();
            break;
          case 410:
            _this10.readyState = SOCKET_STATES.open;
            _this10.onopen();
            _this10.poll();
            break;
          case 0:
          case 500:
            _this10.onerror();
            _this10.closeAndRetry();
            break;
          default:
            throw "unhandled poll status " + status;
        }
      });
    }
  }, {
    key: "send",
    value: function send(body) {
      var _this11 = this;

      Ajax.request("POST", this.endpointURL(), "application/json", body, this.timeout, this.onerror.bind(this, "timeout"), function (resp) {
        if (!resp || resp.status !== 200) {
          _this11.onerror(resp && resp.status);
          _this11.closeAndRetry();
        }
      });
    }
  }, {
    key: "close",
    value: function close(code, reason) {
      this.readyState = SOCKET_STATES.closed;
      this.onclose();
    }
  }]);

  return LongPoll;
}();

var Ajax = exports.Ajax = function () {
  function Ajax() {
    _classCallCheck(this, Ajax);
  }

  _createClass(Ajax, null, [{
    key: "request",
    value: function request(method, endPoint, accept, body, timeout, ontimeout, callback) {
      if (window.XDomainRequest) {
        var req = new XDomainRequest(); // IE8, IE9
        this.xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback);
      } else {
        var _req = window.XMLHttpRequest ? new window.XMLHttpRequest() : // IE7+, Firefox, Chrome, Opera, Safari
        new ActiveXObject("Microsoft.XMLHTTP"); // IE6, IE5
        this.xhrRequest(_req, method, endPoint, accept, body, timeout, ontimeout, callback);
      }
    }
  }, {
    key: "xdomainRequest",
    value: function xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback) {
      var _this12 = this;

      req.timeout = timeout;
      req.open(method, endPoint);
      req.onload = function () {
        var response = _this12.parseJSON(req.responseText);
        callback && callback(response);
      };
      if (ontimeout) {
        req.ontimeout = ontimeout;
      }

      // Work around bug in IE9 that requires an attached onprogress handler
      req.onprogress = function () {};

      req.send(body);
    }
  }, {
    key: "xhrRequest",
    value: function xhrRequest(req, method, endPoint, accept, body, timeout, ontimeout, callback) {
      var _this13 = this;

      req.open(method, endPoint, true);
      req.timeout = timeout;
      req.setRequestHeader("Content-Type", accept);
      req.onerror = function () {
        callback && callback(null);
      };
      req.onreadystatechange = function () {
        if (req.readyState === _this13.states.complete && callback) {
          var response = _this13.parseJSON(req.responseText);
          callback(response);
        }
      };
      if (ontimeout) {
        req.ontimeout = ontimeout;
      }

      req.send(body);
    }
  }, {
    key: "parseJSON",
    value: function parseJSON(resp) {
      if (!resp || resp === "") {
        return null;
      }

      try {
        return JSON.parse(resp);
      } catch (e) {
        console && console.log("failed to parse JSON response", resp);
        return null;
      }
    }
  }, {
    key: "serialize",
    value: function serialize(obj, parentKey) {
      var queryStr = [];
      for (var key in obj) {
        if (!obj.hasOwnProperty(key)) {
          continue;
        }
        var paramKey = parentKey ? parentKey + "[" + key + "]" : key;
        var paramVal = obj[key];
        if ((typeof paramVal === "undefined" ? "undefined" : _typeof(paramVal)) === "object") {
          queryStr.push(this.serialize(paramVal, paramKey));
        } else {
          queryStr.push(encodeURIComponent(paramKey) + "=" + encodeURIComponent(paramVal));
        }
      }
      return queryStr.join("&");
    }
  }, {
    key: "appendParams",
    value: function appendParams(url, params) {
      if (Object.keys(params).length === 0) {
        return url;
      }

      var prefix = url.match(/\?/) ? "&" : "?";
      return "" + url + prefix + this.serialize(params);
    }
  }]);

  return Ajax;
}();

Ajax.states = { complete: 4 };

var Presence = exports.Presence = {
  syncState: function syncState(currentState, newState, onJoin, onLeave) {
    var _this14 = this;

    var state = this.clone(currentState);
    var joins = {};
    var leaves = {};

    this.map(state, function (key, presence) {
      if (!newState[key]) {
        leaves[key] = presence;
      }
    });
    this.map(newState, function (key, newPresence) {
      var currentPresence = state[key];
      if (currentPresence) {
        var newRefs = newPresence.metas.map(function (m) {
          return m.phx_ref;
        });
        var curRefs = currentPresence.metas.map(function (m) {
          return m.phx_ref;
        });
        var joinedMetas = newPresence.metas.filter(function (m) {
          return curRefs.indexOf(m.phx_ref) < 0;
        });
        var leftMetas = currentPresence.metas.filter(function (m) {
          return newRefs.indexOf(m.phx_ref) < 0;
        });
        if (joinedMetas.length > 0) {
          joins[key] = newPresence;
          joins[key].metas = joinedMetas;
        }
        if (leftMetas.length > 0) {
          leaves[key] = _this14.clone(currentPresence);
          leaves[key].metas = leftMetas;
        }
      } else {
        joins[key] = newPresence;
      }
    });
    return this.syncDiff(state, { joins: joins, leaves: leaves }, onJoin, onLeave);
  },
  syncDiff: function syncDiff(currentState, _ref2, onJoin, onLeave) {
    var joins = _ref2.joins,
        leaves = _ref2.leaves;

    var state = this.clone(currentState);
    if (!onJoin) {
      onJoin = function onJoin() {};
    }
    if (!onLeave) {
      onLeave = function onLeave() {};
    }

    this.map(joins, function (key, newPresence) {
      var currentPresence = state[key];
      state[key] = newPresence;
      if (currentPresence) {
        var _state$key$metas;

        (_state$key$metas = state[key].metas).unshift.apply(_state$key$metas, _toConsumableArray(currentPresence.metas));
      }
      onJoin(key, currentPresence, newPresence);
    });
    this.map(leaves, function (key, leftPresence) {
      var currentPresence = state[key];
      if (!currentPresence) {
        return;
      }
      var refsToRemove = leftPresence.metas.map(function (m) {
        return m.phx_ref;
      });
      currentPresence.metas = currentPresence.metas.filter(function (p) {
        return refsToRemove.indexOf(p.phx_ref) < 0;
      });
      onLeave(key, currentPresence, leftPresence);
      if (currentPresence.metas.length === 0) {
        delete state[key];
      }
    });
    return state;
  },
  list: function list(presences, chooser) {
    if (!chooser) {
      chooser = function chooser(key, pres) {
        return pres;
      };
    }

    return this.map(presences, function (key, presence) {
      return chooser(key, presence);
    });
  },


  // private

  map: function map(obj, func) {
    return Object.getOwnPropertyNames(obj).map(function (key) {
      return func(key, obj[key]);
    });
  },
  clone: function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
};

/**
 *
 * Creates a timer that accepts a `timerCalc` function to perform
 * calculated timeout retries, such as exponential backoff.
 *
 * ## Examples
 *
 * ```javascript
 *    let reconnectTimer = new Timer(() => this.connect(), function(tries){
 *      return [1000, 5000, 10000][tries - 1] || 10000
 *    })
 *    reconnectTimer.scheduleTimeout() // fires after 1000
 *    reconnectTimer.scheduleTimeout() // fires after 5000
 *    reconnectTimer.reset()
 *    reconnectTimer.scheduleTimeout() // fires after 1000
 * ```
 * @param {Function} callback
 * @param {Function} timerCalc
 */

var Timer = function () {
  function Timer(callback, timerCalc) {
    _classCallCheck(this, Timer);

    this.callback = callback;
    this.timerCalc = timerCalc;
    this.timer = null;
    this.tries = 0;
  }

  _createClass(Timer, [{
    key: "reset",
    value: function reset() {
      this.tries = 0;
      clearTimeout(this.timer);
    }

    /**
     * Cancels any previous scheduleTimeout and schedules callback
     */

  }, {
    key: "scheduleTimeout",
    value: function scheduleTimeout() {
      var _this15 = this;

      clearTimeout(this.timer);

      this.timer = setTimeout(function () {
        _this15.tries = _this15.tries + 1;
        _this15.callback();
      }, this.timerCalc(this.tries + 1));
    }
  }]);

  return Timer;
}();

})));
  })();
});

require.register("phoenix_html/priv/static/phoenix_html.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "phoenix_html");
  (function() {
    "use strict";

(function() {
  function buildHiddenInput(name, value) {
    var input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    return input;
  }

  function handleLinkClick(link) {
    var message = link.getAttribute("data-confirm");
    if(message && !window.confirm(message)) {
        return;
    }

    var to = link.getAttribute("data-to"),
        method = buildHiddenInput("_method", link.getAttribute("data-method")),
        csrf = buildHiddenInput("_csrf_token", link.getAttribute("data-csrf")),
        form = document.createElement("form");

    form.method = (link.getAttribute("data-method") === "get") ? "get" : "post";
    form.action = to;
    form.style.display = "hidden";

    form.appendChild(csrf);
    form.appendChild(method);
    document.body.appendChild(form);
    form.submit();
  }

  window.addEventListener("click", function(e) {
    var element = e.target;

    while (element && element.getAttribute) {
      if(element.getAttribute("data-method")) {
        handleLinkClick(element);
        e.preventDefault();
        return false;
      } else {
        element = element.parentNode;
      }
    }
  }, false);
})();
  })();
});
require.register("js/app.js", function(exports, require, module) {
"use strict";

require("phoenix_html");

require("./blueimp-gallery.min");

// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
var $grid = $('.grid').masonry({
    itemSelector: '.grid-item',
    percentPosition: true,
    columnWidth: '.grid-sizer'
});
// layout Masonry after each image loads


// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

// import socket from "./socket"

$grid.imagesLoaded().progress(function () {
    $grid.masonry();
});

document.getElementById('conception-gallery').onclick = function (event) {
    event = event || window.event;
    var target = event.target || event.srcElement,
        link = target.src ? target.parentNode : target,
        options = { index: link, event: event },
        links = this.getElementsByTagName('a');
    blueimp.Gallery(links, options);
};

});

require.register("js/blueimp-gallery.min.js", function(exports, require, module) {
"use strict";

!function () {
  "use strict";
  function t(t, e) {
    var i;for (i in e) {
      e.hasOwnProperty(i) && (t[i] = e[i]);
    }return t;
  }function e(t) {
    if (!this || this.find !== e.prototype.find) return new e(t);if (this.length = 0, t) if ("string" == typeof t && (t = this.find(t)), t.nodeType || t === t.window) this.length = 1, this[0] = t;else {
      var i = t.length;for (this.length = i; i;) {
        this[i -= 1] = t[i];
      }
    }
  }e.extend = t, e.contains = function (t, e) {
    do {
      if ((e = e.parentNode) === t) return !0;
    } while (e);return !1;
  }, e.parseJSON = function (t) {
    return window.JSON && JSON.parse(t);
  }, t(e.prototype, { find: function find(t) {
      var i = this[0] || document;return "string" == typeof t && (t = i.querySelectorAll ? i.querySelectorAll(t) : "#" === t.charAt(0) ? i.getElementById(t.slice(1)) : i.getElementsByTagName(t)), new e(t);
    }, hasClass: function hasClass(t) {
      return !!this[0] && new RegExp("(^|\\s+)" + t + "(\\s+|$)").test(this[0].className);
    }, addClass: function addClass(t) {
      for (var e, i = this.length; i;) {
        if (i -= 1, !(e = this[i]).className) return e.className = t, this;if (this.hasClass(t)) return this;e.className += " " + t;
      }return this;
    }, removeClass: function removeClass(t) {
      for (var e, i = new RegExp("(^|\\s+)" + t + "(\\s+|$)"), s = this.length; s;) {
        (e = this[s -= 1]).className = e.className.replace(i, " ");
      }return this;
    }, on: function on(t, e) {
      for (var i, s, n = t.split(/\s+/); n.length;) {
        for (t = n.shift(), i = this.length; i;) {
          (s = this[i -= 1]).addEventListener ? s.addEventListener(t, e, !1) : s.attachEvent && s.attachEvent("on" + t, e);
        }
      }return this;
    }, off: function off(t, e) {
      for (var i, s, n = t.split(/\s+/); n.length;) {
        for (t = n.shift(), i = this.length; i;) {
          (s = this[i -= 1]).removeEventListener ? s.removeEventListener(t, e, !1) : s.detachEvent && s.detachEvent("on" + t, e);
        }
      }return this;
    }, empty: function empty() {
      for (var t, e = this.length; e;) {
        for (t = this[e -= 1]; t.hasChildNodes();) {
          t.removeChild(t.lastChild);
        }
      }return this;
    }, first: function first() {
      return new e(this[0]);
    } }), "function" == typeof define && define.amd ? define(function () {
    return e;
  }) : (window.blueimp = window.blueimp || {}, window.blueimp.helper = e);
}(), function (t) {
  "use strict";
  "function" == typeof define && define.amd ? define(["./blueimp-helper"], t) : (window.blueimp = window.blueimp || {}, window.blueimp.Gallery = t(window.blueimp.helper || window.jQuery));
}(function (t) {
  "use strict";
  function e(t, i) {
    return void 0 === document.body.style.maxHeight ? null : this && this.options === e.prototype.options ? void (t && t.length ? (this.list = t, this.num = t.length, this.initOptions(i), this.initialize()) : this.console.log("blueimp Gallery: No or empty list provided as first argument.", t)) : new e(t, i);
  }return t.extend(e.prototype, { options: { container: "#blueimp-gallery", slidesContainer: "div", titleElement: "h3", displayClass: "blueimp-gallery-display", controlsClass: "blueimp-gallery-controls", singleClass: "blueimp-gallery-single", leftEdgeClass: "blueimp-gallery-left", rightEdgeClass: "blueimp-gallery-right", playingClass: "blueimp-gallery-playing", slideClass: "slide", slideLoadingClass: "slide-loading", slideErrorClass: "slide-error", slideContentClass: "slide-content", toggleClass: "toggle", prevClass: "prev", nextClass: "next", closeClass: "close", playPauseClass: "play-pause", typeProperty: "type", titleProperty: "title", altTextProperty: "alt", urlProperty: "href", srcsetProperty: "urlset", displayTransition: !0, clearSlides: !0, stretchImages: !1, toggleControlsOnReturn: !0, toggleControlsOnSlideClick: !0, toggleSlideshowOnSpace: !0, enableKeyboardNavigation: !0, closeOnEscape: !0, closeOnSlideClick: !0, closeOnSwipeUpOrDown: !0, emulateTouchEvents: !0, stopTouchEventsPropagation: !1, hidePageScrollbars: !0, disableScroll: !0, carousel: !1, continuous: !0, unloadElements: !0, startSlideshow: !1, slideshowInterval: 5e3, index: 0, preloadRange: 2, transitionSpeed: 400, slideshowTransitionSpeed: void 0, event: void 0, onopen: void 0, onopened: void 0, onslide: void 0, onslideend: void 0, onslidecomplete: void 0, onclose: void 0, onclosed: void 0 }, carouselOptions: { hidePageScrollbars: !1, toggleControlsOnReturn: !1, toggleSlideshowOnSpace: !1, enableKeyboardNavigation: !1, closeOnEscape: !1, closeOnSlideClick: !1, closeOnSwipeUpOrDown: !1, disableScroll: !1, startSlideshow: !0 }, console: window.console && "function" == typeof window.console.log ? window.console : { log: function log() {} }, support: function (e) {
      function i() {
        var t,
            i,
            s = n.transition;document.body.appendChild(e), s && (t = s.name.slice(0, -9) + "ransform", void 0 !== e.style[t] && (e.style[t] = "translateZ(0)", i = window.getComputedStyle(e).getPropertyValue(s.prefix + "transform"), n.transform = { prefix: s.prefix, name: t, translate: !0, translateZ: !!i && "none" !== i })), void 0 !== e.style.backgroundSize && (n.backgroundSize = {}, e.style.backgroundSize = "contain", n.backgroundSize.contain = "contain" === window.getComputedStyle(e).getPropertyValue("background-size"), e.style.backgroundSize = "cover", n.backgroundSize.cover = "cover" === window.getComputedStyle(e).getPropertyValue("background-size")), document.body.removeChild(e);
      }var s,
          n = { touch: void 0 !== window.ontouchstart || window.DocumentTouch && document instanceof DocumentTouch },
          o = { webkitTransition: { end: "webkitTransitionEnd", prefix: "-webkit-" }, MozTransition: { end: "transitionend", prefix: "-moz-" }, OTransition: { end: "otransitionend", prefix: "-o-" }, transition: { end: "transitionend", prefix: "" } };for (s in o) {
        if (o.hasOwnProperty(s) && void 0 !== e.style[s]) {
          n.transition = o[s], n.transition.name = s;break;
        }
      }return document.body ? i() : t(document).on("DOMContentLoaded", i), n;
    }(document.createElement("div")), requestAnimationFrame: window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame, cancelAnimationFrame: window.cancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame, initialize: function initialize() {
      if (this.initStartIndex(), !1 === this.initWidget()) return !1;this.initEventListeners(), this.onslide(this.index), this.ontransitionend(), this.options.startSlideshow && this.play();
    }, slide: function slide(t, e) {
      window.clearTimeout(this.timeout);var i,
          s,
          n,
          o = this.index;if (o !== t && 1 !== this.num) {
        if (e || (e = this.options.transitionSpeed), this.support.transform) {
          for (this.options.continuous || (t = this.circle(t)), i = Math.abs(o - t) / (o - t), this.options.continuous && (s = i, (i = -this.positions[this.circle(t)] / this.slideWidth) !== s && (t = -i * this.num + t)), n = Math.abs(o - t) - 1; n;) {
            n -= 1, this.move(this.circle((t > o ? t : o) - n - 1), this.slideWidth * i, 0);
          }t = this.circle(t), this.move(o, this.slideWidth * i, e), this.move(t, 0, e), this.options.continuous && this.move(this.circle(t - i), -this.slideWidth * i, 0);
        } else t = this.circle(t), this.animate(o * -this.slideWidth, t * -this.slideWidth, e);this.onslide(t);
      }
    }, getIndex: function getIndex() {
      return this.index;
    }, getNumber: function getNumber() {
      return this.num;
    }, prev: function prev() {
      (this.options.continuous || this.index) && this.slide(this.index - 1);
    }, next: function next() {
      (this.options.continuous || this.index < this.num - 1) && this.slide(this.index + 1);
    }, play: function play(t) {
      var e = this;window.clearTimeout(this.timeout), this.interval = t || this.options.slideshowInterval, this.elements[this.index] > 1 && (this.timeout = this.setTimeout(!this.requestAnimationFrame && this.slide || function (t, i) {
        e.animationFrameId = e.requestAnimationFrame.call(window, function () {
          e.slide(t, i);
        });
      }, [this.index + 1, this.options.slideshowTransitionSpeed], this.interval)), this.container.addClass(this.options.playingClass);
    }, pause: function pause() {
      window.clearTimeout(this.timeout), this.interval = null, this.cancelAnimationFrame && (this.cancelAnimationFrame.call(window, this.animationFrameId), this.animationFrameId = null), this.container.removeClass(this.options.playingClass);
    }, add: function add(t) {
      var e;for (t.concat || (t = Array.prototype.slice.call(t)), this.list.concat || (this.list = Array.prototype.slice.call(this.list)), this.list = this.list.concat(t), this.num = this.list.length, this.num > 2 && null === this.options.continuous && (this.options.continuous = !0, this.container.removeClass(this.options.leftEdgeClass)), this.container.removeClass(this.options.rightEdgeClass).removeClass(this.options.singleClass), e = this.num - t.length; e < this.num; e += 1) {
        this.addSlide(e), this.positionSlide(e);
      }this.positions.length = this.num, this.initSlides(!0);
    }, resetSlides: function resetSlides() {
      this.slidesContainer.empty(), this.unloadAllSlides(), this.slides = [];
    }, handleClose: function handleClose() {
      var t = this.options;this.destroyEventListeners(), this.pause(), this.container[0].style.display = "none", this.container.removeClass(t.displayClass).removeClass(t.singleClass).removeClass(t.leftEdgeClass).removeClass(t.rightEdgeClass), t.hidePageScrollbars && (document.body.style.overflow = this.bodyOverflowStyle), this.options.clearSlides && this.resetSlides(), this.options.onclosed && this.options.onclosed.call(this);
    }, close: function close() {
      function t(i) {
        i.target === e.container[0] && (e.container.off(e.support.transition.end, t), e.handleClose());
      }var e = this;this.options.onclose && this.options.onclose.call(this), this.support.transition && this.options.displayTransition ? (this.container.on(this.support.transition.end, t), this.container.removeClass(this.options.displayClass)) : this.handleClose();
    }, circle: function circle(t) {
      return (this.num + t % this.num) % this.num;
    }, move: function move(t, e, i) {
      this.translateX(t, e, i), this.positions[t] = e;
    }, translate: function translate(t, e, i, s) {
      var n = this.slides[t].style,
          o = this.support.transition,
          a = this.support.transform;n[o.name + "Duration"] = s + "ms", n[a.name] = "translate(" + e + "px, " + i + "px)" + (a.translateZ ? " translateZ(0)" : "");
    }, translateX: function translateX(t, e, i) {
      this.translate(t, e, 0, i);
    }, translateY: function translateY(t, e, i) {
      this.translate(t, 0, e, i);
    }, animate: function animate(t, e, i) {
      if (i) var s = this,
          n = new Date().getTime(),
          o = window.setInterval(function () {
        var a = new Date().getTime() - n;if (a > i) return s.slidesContainer[0].style.left = e + "px", s.ontransitionend(), void window.clearInterval(o);s.slidesContainer[0].style.left = (e - t) * (Math.floor(a / i * 100) / 100) + t + "px";
      }, 4);else this.slidesContainer[0].style.left = e + "px";
    }, preventDefault: function preventDefault(t) {
      t.preventDefault ? t.preventDefault() : t.returnValue = !1;
    }, stopPropagation: function stopPropagation(t) {
      t.stopPropagation ? t.stopPropagation() : t.cancelBubble = !0;
    }, onresize: function onresize() {
      this.initSlides(!0);
    }, onmousedown: function onmousedown(t) {
      t.which && 1 === t.which && "VIDEO" !== t.target.nodeName && (t.preventDefault(), (t.originalEvent || t).touches = [{ pageX: t.pageX, pageY: t.pageY }], this.ontouchstart(t));
    }, onmousemove: function onmousemove(t) {
      this.touchStart && ((t.originalEvent || t).touches = [{ pageX: t.pageX, pageY: t.pageY }], this.ontouchmove(t));
    }, onmouseup: function onmouseup(t) {
      this.touchStart && (this.ontouchend(t), delete this.touchStart);
    }, onmouseout: function onmouseout(e) {
      if (this.touchStart) {
        var i = e.target,
            s = e.relatedTarget;s && (s === i || t.contains(i, s)) || this.onmouseup(e);
      }
    }, ontouchstart: function ontouchstart(t) {
      this.options.stopTouchEventsPropagation && this.stopPropagation(t);var e = (t.originalEvent || t).touches[0];this.touchStart = { x: e.pageX, y: e.pageY, time: Date.now() }, this.isScrolling = void 0, this.touchDelta = {};
    }, ontouchmove: function ontouchmove(t) {
      this.options.stopTouchEventsPropagation && this.stopPropagation(t);var e,
          i,
          s = (t.originalEvent || t).touches[0],
          n = (t.originalEvent || t).scale,
          o = this.index;if (!(s.length > 1 || n && 1 !== n)) if (this.options.disableScroll && t.preventDefault(), this.touchDelta = { x: s.pageX - this.touchStart.x, y: s.pageY - this.touchStart.y }, e = this.touchDelta.x, void 0 === this.isScrolling && (this.isScrolling = this.isScrolling || Math.abs(e) < Math.abs(this.touchDelta.y)), this.isScrolling) this.translateY(o, this.touchDelta.y + this.positions[o], 0);else for (t.preventDefault(), window.clearTimeout(this.timeout), this.options.continuous ? i = [this.circle(o + 1), o, this.circle(o - 1)] : (this.touchDelta.x = e /= !o && e > 0 || o === this.num - 1 && e < 0 ? Math.abs(e) / this.slideWidth + 1 : 1, i = [o], o && i.push(o - 1), o < this.num - 1 && i.unshift(o + 1)); i.length;) {
        o = i.pop(), this.translateX(o, e + this.positions[o], 0);
      }
    }, ontouchend: function ontouchend(t) {
      this.options.stopTouchEventsPropagation && this.stopPropagation(t);var e,
          i,
          s,
          n,
          o,
          a = this.index,
          r = this.options.transitionSpeed,
          l = this.slideWidth,
          h = Number(Date.now() - this.touchStart.time) < 250,
          d = h && Math.abs(this.touchDelta.x) > 20 || Math.abs(this.touchDelta.x) > l / 2,
          c = !a && this.touchDelta.x > 0 || a === this.num - 1 && this.touchDelta.x < 0,
          u = !d && this.options.closeOnSwipeUpOrDown && (h && Math.abs(this.touchDelta.y) > 20 || Math.abs(this.touchDelta.y) > this.slideHeight / 2);this.options.continuous && (c = !1), e = this.touchDelta.x < 0 ? -1 : 1, this.isScrolling ? u ? this.close() : this.translateY(a, 0, r) : d && !c ? (i = a + e, s = a - e, n = l * e, o = -l * e, this.options.continuous ? (this.move(this.circle(i), n, 0), this.move(this.circle(a - 2 * e), o, 0)) : i >= 0 && i < this.num && this.move(i, n, 0), this.move(a, this.positions[a] + n, r), this.move(this.circle(s), this.positions[this.circle(s)] + n, r), a = this.circle(s), this.onslide(a)) : this.options.continuous ? (this.move(this.circle(a - 1), -l, r), this.move(a, 0, r), this.move(this.circle(a + 1), l, r)) : (a && this.move(a - 1, -l, r), this.move(a, 0, r), a < this.num - 1 && this.move(a + 1, l, r));
    }, ontouchcancel: function ontouchcancel(t) {
      this.touchStart && (this.ontouchend(t), delete this.touchStart);
    }, ontransitionend: function ontransitionend(t) {
      var e = this.slides[this.index];t && e !== t.target || (this.interval && this.play(), this.setTimeout(this.options.onslideend, [this.index, e]));
    }, oncomplete: function oncomplete(e) {
      var i,
          s = e.target || e.srcElement,
          n = s && s.parentNode;s && n && (i = this.getNodeIndex(n), t(n).removeClass(this.options.slideLoadingClass), "error" === e.type ? (t(n).addClass(this.options.slideErrorClass), this.elements[i] = 3) : this.elements[i] = 2, s.clientHeight > this.container[0].clientHeight && (s.style.maxHeight = this.container[0].clientHeight), this.interval && this.slides[this.index] === n && this.play(), this.setTimeout(this.options.onslidecomplete, [i, n]));
    }, onload: function onload(t) {
      this.oncomplete(t);
    }, onerror: function onerror(t) {
      this.oncomplete(t);
    }, onkeydown: function onkeydown(t) {
      switch (t.which || t.keyCode) {case 13:
          this.options.toggleControlsOnReturn && (this.preventDefault(t), this.toggleControls());break;case 27:
          this.options.closeOnEscape && (this.close(), t.stopImmediatePropagation());break;case 32:
          this.options.toggleSlideshowOnSpace && (this.preventDefault(t), this.toggleSlideshow());break;case 37:
          this.options.enableKeyboardNavigation && (this.preventDefault(t), this.prev());break;case 39:
          this.options.enableKeyboardNavigation && (this.preventDefault(t), this.next());}
    }, handleClick: function handleClick(e) {
      function i(e) {
        return t(n).hasClass(e) || t(o).hasClass(e);
      }var s = this.options,
          n = e.target || e.srcElement,
          o = n.parentNode;i(s.toggleClass) ? (this.preventDefault(e), this.toggleControls()) : i(s.prevClass) ? (this.preventDefault(e), this.prev()) : i(s.nextClass) ? (this.preventDefault(e), this.next()) : i(s.closeClass) ? (this.preventDefault(e), this.close()) : i(s.playPauseClass) ? (this.preventDefault(e), this.toggleSlideshow()) : o === this.slidesContainer[0] ? s.closeOnSlideClick ? (this.preventDefault(e), this.close()) : s.toggleControlsOnSlideClick && (this.preventDefault(e), this.toggleControls()) : o.parentNode && o.parentNode === this.slidesContainer[0] && s.toggleControlsOnSlideClick && (this.preventDefault(e), this.toggleControls());
    }, onclick: function onclick(t) {
      if (!(this.options.emulateTouchEvents && this.touchDelta && (Math.abs(this.touchDelta.x) > 20 || Math.abs(this.touchDelta.y) > 20))) return this.handleClick(t);delete this.touchDelta;
    }, updateEdgeClasses: function updateEdgeClasses(t) {
      t ? this.container.removeClass(this.options.leftEdgeClass) : this.container.addClass(this.options.leftEdgeClass), t === this.num - 1 ? this.container.addClass(this.options.rightEdgeClass) : this.container.removeClass(this.options.rightEdgeClass);
    }, handleSlide: function handleSlide(t) {
      this.options.continuous || this.updateEdgeClasses(t), this.loadElements(t), this.options.unloadElements && this.unloadElements(t), this.setTitle(t);
    }, onslide: function onslide(t) {
      this.index = t, this.handleSlide(t), this.setTimeout(this.options.onslide, [t, this.slides[t]]);
    }, setTitle: function setTitle(t) {
      var e = this.slides[t].firstChild,
          i = e.title || e.alt,
          s = this.titleElement;s.length && (this.titleElement.empty(), i && s[0].appendChild(document.createTextNode(i)));
    }, setTimeout: function setTimeout(t, e, i) {
      var s = this;return t && window.setTimeout(function () {
        t.apply(s, e || []);
      }, i || 0);
    }, imageFactory: function imageFactory(e, i) {
      function s(e) {
        if (!n) {
          if (e = { type: e.type, target: o }, !o.parentNode) return l.setTimeout(s, [e]);n = !0, t(h).off("load error", s), c && "load" === e.type && (o.style.background = 'url("' + d + '") center no-repeat', o.style.backgroundSize = c), i(e);
        }
      }var n,
          o,
          a,
          r,
          l = this,
          h = this.imagePrototype.cloneNode(!1),
          d = e,
          c = this.options.stretchImages;return "string" != typeof d && (d = this.getItemProperty(e, this.options.urlProperty), a = this.getItemProperty(e, this.options.titleProperty), r = this.getItemProperty(e, this.options.altTextProperty) || a), !0 === c && (c = "contain"), (c = this.support.backgroundSize && this.support.backgroundSize[c] && c) ? o = this.elementPrototype.cloneNode(!1) : (o = h, h.draggable = !1), a && (o.title = a), r && (o.alt = r), t(h).on("load error", s), h.src = d, o;
    }, createElement: function createElement(e, i) {
      var s = e && this.getItemProperty(e, this.options.typeProperty),
          n = s && this[s.split("/")[0] + "Factory"] || this.imageFactory,
          o = e && n.call(this, e, i),
          a = this.getItemProperty(e, this.options.srcsetProperty);return o || (o = this.elementPrototype.cloneNode(!1), this.setTimeout(i, [{ type: "error", target: o }])), a && o.setAttribute("srcset", a), t(o).addClass(this.options.slideContentClass), o;
    }, loadElement: function loadElement(e) {
      this.elements[e] || (this.slides[e].firstChild ? this.elements[e] = t(this.slides[e]).hasClass(this.options.slideErrorClass) ? 3 : 2 : (this.elements[e] = 1, t(this.slides[e]).addClass(this.options.slideLoadingClass), this.slides[e].appendChild(this.createElement(this.list[e], this.proxyListener))));
    }, loadElements: function loadElements(t) {
      var e,
          i = Math.min(this.num, 2 * this.options.preloadRange + 1),
          s = t;for (e = 0; e < i; e += 1) {
        s += e * (e % 2 == 0 ? -1 : 1), s = this.circle(s), this.loadElement(s);
      }
    }, unloadElements: function unloadElements(t) {
      var e, i;for (e in this.elements) {
        this.elements.hasOwnProperty(e) && (i = Math.abs(t - e)) > this.options.preloadRange && i + this.options.preloadRange < this.num && (this.unloadSlide(e), delete this.elements[e]);
      }
    }, addSlide: function addSlide(t) {
      var e = this.slidePrototype.cloneNode(!1);e.setAttribute("data-index", t), this.slidesContainer[0].appendChild(e), this.slides.push(e);
    }, positionSlide: function positionSlide(t) {
      var e = this.slides[t];e.style.width = this.slideWidth + "px", this.support.transform && (e.style.left = t * -this.slideWidth + "px", this.move(t, this.index > t ? -this.slideWidth : this.index < t ? this.slideWidth : 0, 0));
    }, initSlides: function initSlides(e) {
      var i, s;for (e || (this.positions = [], this.positions.length = this.num, this.elements = {}, this.imagePrototype = document.createElement("img"), this.elementPrototype = document.createElement("div"), this.slidePrototype = document.createElement("div"), t(this.slidePrototype).addClass(this.options.slideClass), this.slides = this.slidesContainer[0].children, i = this.options.clearSlides || this.slides.length !== this.num), this.slideWidth = this.container[0].offsetWidth, this.slideHeight = this.container[0].offsetHeight, this.slidesContainer[0].style.width = this.num * this.slideWidth + "px", i && this.resetSlides(), s = 0; s < this.num; s += 1) {
        i && this.addSlide(s), this.positionSlide(s);
      }this.options.continuous && this.support.transform && (this.move(this.circle(this.index - 1), -this.slideWidth, 0), this.move(this.circle(this.index + 1), this.slideWidth, 0)), this.support.transform || (this.slidesContainer[0].style.left = this.index * -this.slideWidth + "px");
    }, unloadSlide: function unloadSlide(t) {
      var e, i;null !== (i = (e = this.slides[t]).firstChild) && e.removeChild(i);
    }, unloadAllSlides: function unloadAllSlides() {
      var t, e;for (t = 0, e = this.slides.length; t < e; t++) {
        this.unloadSlide(t);
      }
    }, toggleControls: function toggleControls() {
      var t = this.options.controlsClass;this.container.hasClass(t) ? this.container.removeClass(t) : this.container.addClass(t);
    }, toggleSlideshow: function toggleSlideshow() {
      this.interval ? this.pause() : this.play();
    }, getNodeIndex: function getNodeIndex(t) {
      return parseInt(t.getAttribute("data-index"), 10);
    }, getNestedProperty: function getNestedProperty(t, e) {
      return e.replace(/\[(?:'([^']+)'|"([^"]+)"|(\d+))\]|(?:(?:^|\.)([^\.\[]+))/g, function (e, i, s, n, o) {
        var a = o || i || s || n && parseInt(n, 10);e && t && (t = t[a]);
      }), t;
    }, getDataProperty: function getDataProperty(e, i) {
      var s, n;if (e.dataset ? (s = i.replace(/-([a-z])/g, function (t, e) {
        return e.toUpperCase();
      }), n = e.dataset[s]) : e.getAttribute && (n = e.getAttribute("data-" + i.replace(/([A-Z])/g, "-$1").toLowerCase())), "string" == typeof n) {
        if (/^(true|false|null|-?\d+(\.\d+)?|\{[\s\S]*\}|\[[\s\S]*\])$/.test(n)) try {
          return t.parseJSON(n);
        } catch (t) {}return n;
      }
    }, getItemProperty: function getItemProperty(t, e) {
      var i = this.getDataProperty(t, e);return void 0 === i && (i = t[e]), void 0 === i && (i = this.getNestedProperty(t, e)), i;
    }, initStartIndex: function initStartIndex() {
      var t,
          e = this.options.index,
          i = this.options.urlProperty;if (e && "number" != typeof e) for (t = 0; t < this.num; t += 1) {
        if (this.list[t] === e || this.getItemProperty(this.list[t], i) === this.getItemProperty(e, i)) {
          e = t;break;
        }
      }this.index = this.circle(parseInt(e, 10) || 0);
    }, initEventListeners: function initEventListeners() {
      function e(t) {
        var e = i.support.transition && i.support.transition.end === t.type ? "transitionend" : t.type;i["on" + e](t);
      }var i = this,
          s = this.slidesContainer;t(window).on("resize", e), t(document.body).on("keydown", e), this.container.on("click", e), this.support.touch ? s.on("touchstart touchmove touchend touchcancel", e) : this.options.emulateTouchEvents && this.support.transition && s.on("mousedown mousemove mouseup mouseout", e), this.support.transition && s.on(this.support.transition.end, e), this.proxyListener = e;
    }, destroyEventListeners: function destroyEventListeners() {
      var e = this.slidesContainer,
          i = this.proxyListener;t(window).off("resize", i), t(document.body).off("keydown", i), this.container.off("click", i), this.support.touch ? e.off("touchstart touchmove touchend touchcancel", i) : this.options.emulateTouchEvents && this.support.transition && e.off("mousedown mousemove mouseup mouseout", i), this.support.transition && e.off(this.support.transition.end, i);
    }, handleOpen: function handleOpen() {
      this.options.onopened && this.options.onopened.call(this);
    }, initWidget: function initWidget() {
      function e(t) {
        t.target === i.container[0] && (i.container.off(i.support.transition.end, e), i.handleOpen());
      }var i = this;return this.container = t(this.options.container), this.container.length ? (this.slidesContainer = this.container.find(this.options.slidesContainer).first(), this.slidesContainer.length ? (this.titleElement = this.container.find(this.options.titleElement).first(), 1 === this.num && this.container.addClass(this.options.singleClass), this.options.onopen && this.options.onopen.call(this), this.support.transition && this.options.displayTransition ? this.container.on(this.support.transition.end, e) : this.handleOpen(), this.options.hidePageScrollbars && (this.bodyOverflowStyle = document.body.style.overflow, document.body.style.overflow = "hidden"), this.container[0].style.display = "block", this.initSlides(), void this.container.addClass(this.options.displayClass)) : (this.console.log("blueimp Gallery: Slides container not found.", this.options.slidesContainer), !1)) : (this.console.log("blueimp Gallery: Widget container not found.", this.options.container), !1);
    }, initOptions: function initOptions(e) {
      this.options = t.extend({}, this.options), (e && e.carousel || this.options.carousel && (!e || !1 !== e.carousel)) && t.extend(this.options, this.carouselOptions), t.extend(this.options, e), this.num < 3 && (this.options.continuous = !!this.options.continuous && null), this.support.transition || (this.options.emulateTouchEvents = !1), this.options.event && this.preventDefault(this.options.event);
    } }), e;
}), function (t) {
  "use strict";
  "function" == typeof define && define.amd ? define(["./blueimp-helper", "./blueimp-gallery"], t) : t(window.blueimp.helper || window.jQuery, window.blueimp.Gallery);
}(function (t, e) {
  "use strict";
  t.extend(e.prototype.options, { fullScreen: !1 });var i = e.prototype.initialize,
      s = e.prototype.close;return t.extend(e.prototype, { getFullScreenElement: function getFullScreenElement() {
      return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    }, requestFullScreen: function requestFullScreen(t) {
      t.requestFullscreen ? t.requestFullscreen() : t.webkitRequestFullscreen ? t.webkitRequestFullscreen() : t.mozRequestFullScreen ? t.mozRequestFullScreen() : t.msRequestFullscreen && t.msRequestFullscreen();
    }, exitFullScreen: function exitFullScreen() {
      document.exitFullscreen ? document.exitFullscreen() : document.webkitCancelFullScreen ? document.webkitCancelFullScreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.msExitFullscreen && document.msExitFullscreen();
    }, initialize: function initialize() {
      i.call(this), this.options.fullScreen && !this.getFullScreenElement() && this.requestFullScreen(this.container[0]);
    }, close: function close() {
      this.getFullScreenElement() === this.container[0] && this.exitFullScreen(), s.call(this);
    } }), e;
}), function (t) {
  "use strict";
  "function" == typeof define && define.amd ? define(["./blueimp-helper", "./blueimp-gallery"], t) : t(window.blueimp.helper || window.jQuery, window.blueimp.Gallery);
}(function (t, e) {
  "use strict";
  t.extend(e.prototype.options, { indicatorContainer: "ol", activeIndicatorClass: "active", thumbnailProperty: "thumbnail", thumbnailIndicators: !0 });var i = e.prototype.initSlides,
      s = e.prototype.addSlide,
      n = e.prototype.resetSlides,
      o = e.prototype.handleClick,
      a = e.prototype.handleSlide,
      r = e.prototype.handleClose;return t.extend(e.prototype, { createIndicator: function createIndicator(e) {
      var i,
          s,
          n = this.indicatorPrototype.cloneNode(!1),
          o = this.getItemProperty(e, this.options.titleProperty),
          a = this.options.thumbnailProperty;return this.options.thumbnailIndicators && (a && (i = this.getItemProperty(e, a)), void 0 === i && (s = e.getElementsByTagName && t(e).find("img")[0]) && (i = s.src), i && (n.style.backgroundImage = 'url("' + i + '")')), o && (n.title = o), n;
    }, addIndicator: function addIndicator(t) {
      if (this.indicatorContainer.length) {
        var e = this.createIndicator(this.list[t]);e.setAttribute("data-index", t), this.indicatorContainer[0].appendChild(e), this.indicators.push(e);
      }
    }, setActiveIndicator: function setActiveIndicator(e) {
      this.indicators && (this.activeIndicator && this.activeIndicator.removeClass(this.options.activeIndicatorClass), this.activeIndicator = t(this.indicators[e]), this.activeIndicator.addClass(this.options.activeIndicatorClass));
    }, initSlides: function initSlides(t) {
      t || (this.indicatorContainer = this.container.find(this.options.indicatorContainer), this.indicatorContainer.length && (this.indicatorPrototype = document.createElement("li"), this.indicators = this.indicatorContainer[0].children)), i.call(this, t);
    }, addSlide: function addSlide(t) {
      s.call(this, t), this.addIndicator(t);
    }, resetSlides: function resetSlides() {
      n.call(this), this.indicatorContainer.empty(), this.indicators = [];
    }, handleClick: function handleClick(t) {
      var e = t.target || t.srcElement,
          i = e.parentNode;if (i === this.indicatorContainer[0]) this.preventDefault(t), this.slide(this.getNodeIndex(e));else {
        if (i.parentNode !== this.indicatorContainer[0]) return o.call(this, t);this.preventDefault(t), this.slide(this.getNodeIndex(i));
      }
    }, handleSlide: function handleSlide(t) {
      a.call(this, t), this.setActiveIndicator(t);
    }, handleClose: function handleClose() {
      this.activeIndicator && this.activeIndicator.removeClass(this.options.activeIndicatorClass), r.call(this);
    } }), e;
}), function (t) {
  "use strict";
  "function" == typeof define && define.amd ? define(["./blueimp-helper", "./blueimp-gallery"], t) : t(window.blueimp.helper || window.jQuery, window.blueimp.Gallery);
}(function (t, e) {
  "use strict";
  t.extend(e.prototype.options, { videoContentClass: "video-content", videoLoadingClass: "video-loading", videoPlayingClass: "video-playing", videoPosterProperty: "poster", videoSourcesProperty: "sources" });var i = e.prototype.handleSlide;return t.extend(e.prototype, { handleSlide: function handleSlide(t) {
      i.call(this, t), this.playingVideo && this.playingVideo.pause();
    }, videoFactory: function videoFactory(e, i, s) {
      var n,
          o,
          a,
          r,
          l,
          h = this,
          d = this.options,
          c = this.elementPrototype.cloneNode(!1),
          u = t(c),
          p = [{ type: "error", target: c }],
          m = s || document.createElement("video"),
          y = this.getItemProperty(e, d.urlProperty),
          f = this.getItemProperty(e, d.typeProperty),
          g = this.getItemProperty(e, d.titleProperty),
          v = this.getItemProperty(e, this.options.altTextProperty) || g,
          C = this.getItemProperty(e, d.videoPosterProperty),
          w = this.getItemProperty(e, d.videoSourcesProperty);if (u.addClass(d.videoContentClass), g && (c.title = g), m.canPlayType) if (y && f && m.canPlayType(f)) m.src = y;else if (w) for (; w.length;) {
        if (o = w.shift(), y = this.getItemProperty(o, d.urlProperty), f = this.getItemProperty(o, d.typeProperty), y && f && m.canPlayType(f)) {
          m.src = y;break;
        }
      }return C && (m.poster = C, n = this.imagePrototype.cloneNode(!1), t(n).addClass(d.toggleClass), n.src = C, n.draggable = !1, n.alt = v, c.appendChild(n)), (a = document.createElement("a")).setAttribute("target", "_blank"), s || a.setAttribute("download", g), a.href = y, m.src && (m.controls = !0, (s || t(m)).on("error", function () {
        h.setTimeout(i, p);
      }).on("pause", function () {
        m.seeking || (r = !1, u.removeClass(h.options.videoLoadingClass).removeClass(h.options.videoPlayingClass), l && h.container.addClass(h.options.controlsClass), delete h.playingVideo, h.interval && h.play());
      }).on("playing", function () {
        r = !1, u.removeClass(h.options.videoLoadingClass).addClass(h.options.videoPlayingClass), h.container.hasClass(h.options.controlsClass) ? (l = !0, h.container.removeClass(h.options.controlsClass)) : l = !1;
      }).on("play", function () {
        window.clearTimeout(h.timeout), r = !0, u.addClass(h.options.videoLoadingClass), h.playingVideo = m;
      }), t(a).on("click", function (t) {
        h.preventDefault(t), r ? m.pause() : m.play();
      }), c.appendChild(s && s.element || m)), c.appendChild(a), this.setTimeout(i, [{ type: "load", target: c }]), c;
    } }), e;
}), function (t) {
  "use strict";
  "function" == typeof define && define.amd ? define(["./blueimp-helper", "./blueimp-gallery-video"], t) : t(window.blueimp.helper || window.jQuery, window.blueimp.Gallery);
}(function (t, e) {
  "use strict";
  if (!window.postMessage) return e;t.extend(e.prototype.options, { vimeoVideoIdProperty: "vimeo", vimeoPlayerUrl: "//player.vimeo.com/video/VIDEO_ID?api=1&player_id=PLAYER_ID", vimeoPlayerIdPrefix: "vimeo-player-", vimeoClickToPlay: !0 });var i = e.prototype.textFactory || e.prototype.imageFactory,
      s = function s(t, e, i, _s) {
    this.url = t, this.videoId = e, this.playerId = i, this.clickToPlay = _s, this.element = document.createElement("div"), this.listeners = {};
  },
      n = 0;return t.extend(s.prototype, { canPlayType: function canPlayType() {
      return !0;
    }, on: function on(t, e) {
      return this.listeners[t] = e, this;
    }, loadAPI: function loadAPI() {
      function e() {
        !s && n.playOnReady && n.play(), s = !0;
      }for (var i, s, n = this, o = "//f.vimeocdn.com/js/froogaloop2.min.js", a = document.getElementsByTagName("script"), r = a.length; r;) {
        if (r -= 1, a[r].src === o) {
          i = a[r];break;
        }
      }i || ((i = document.createElement("script")).src = o), t(i).on("load", e), a[0].parentNode.insertBefore(i, a[0]), /loaded|complete/.test(i.readyState) && e();
    }, onReady: function onReady() {
      var t = this;this.ready = !0, this.player.addEvent("play", function () {
        t.hasPlayed = !0, t.onPlaying();
      }), this.player.addEvent("pause", function () {
        t.onPause();
      }), this.player.addEvent("finish", function () {
        t.onPause();
      }), this.playOnReady && this.play();
    }, onPlaying: function onPlaying() {
      this.playStatus < 2 && (this.listeners.playing(), this.playStatus = 2);
    }, onPause: function onPause() {
      this.listeners.pause(), delete this.playStatus;
    }, insertIframe: function insertIframe() {
      var t = document.createElement("iframe");t.src = this.url.replace("VIDEO_ID", this.videoId).replace("PLAYER_ID", this.playerId), t.id = this.playerId, this.element.parentNode.replaceChild(t, this.element), this.element = t;
    }, play: function play() {
      var t = this;this.playStatus || (this.listeners.play(), this.playStatus = 1), this.ready ? !this.hasPlayed && (this.clickToPlay || window.navigator && /iP(hone|od|ad)/.test(window.navigator.platform)) ? this.onPlaying() : this.player.api("play") : (this.playOnReady = !0, window.$f ? this.player || (this.insertIframe(), this.player = $f(this.element), this.player.addEvent("ready", function () {
        t.onReady();
      })) : this.loadAPI());
    }, pause: function pause() {
      this.ready ? this.player.api("pause") : this.playStatus && (delete this.playOnReady, this.listeners.pause(), delete this.playStatus);
    } }), t.extend(e.prototype, { VimeoPlayer: s, textFactory: function textFactory(t, e) {
      var o = this.options,
          a = this.getItemProperty(t, o.vimeoVideoIdProperty);return a ? (void 0 === this.getItemProperty(t, o.urlProperty) && (t[o.urlProperty] = "//vimeo.com/" + a), n += 1, this.videoFactory(t, e, new s(o.vimeoPlayerUrl, a, o.vimeoPlayerIdPrefix + n, o.vimeoClickToPlay))) : i.call(this, t, e);
    } }), e;
}), function (t) {
  "use strict";
  "function" == typeof define && define.amd ? define(["./blueimp-helper", "./blueimp-gallery-video"], t) : t(window.blueimp.helper || window.jQuery, window.blueimp.Gallery);
}(function (t, e) {
  "use strict";
  if (!window.postMessage) return e;t.extend(e.prototype.options, { youTubeVideoIdProperty: "youtube", youTubePlayerVars: { wmode: "transparent" }, youTubeClickToPlay: !0 });var i = e.prototype.textFactory || e.prototype.imageFactory,
      s = function s(t, e, i) {
    this.videoId = t, this.playerVars = e, this.clickToPlay = i, this.element = document.createElement("div"), this.listeners = {};
  };return t.extend(s.prototype, { canPlayType: function canPlayType() {
      return !0;
    }, on: function on(t, e) {
      return this.listeners[t] = e, this;
    }, loadAPI: function loadAPI() {
      var t,
          e = this,
          i = window.onYouTubeIframeAPIReady,
          s = "//www.youtube.com/iframe_api",
          n = document.getElementsByTagName("script"),
          o = n.length;for (window.onYouTubeIframeAPIReady = function () {
        i && i.apply(this), e.playOnReady && e.play();
      }; o;) {
        if (o -= 1, n[o].src === s) return;
      }(t = document.createElement("script")).src = s, n[0].parentNode.insertBefore(t, n[0]);
    }, onReady: function onReady() {
      this.ready = !0, this.playOnReady && this.play();
    }, onPlaying: function onPlaying() {
      this.playStatus < 2 && (this.listeners.playing(), this.playStatus = 2);
    }, onPause: function onPause() {
      e.prototype.setTimeout.call(this, this.checkSeek, null, 2e3);
    }, checkSeek: function checkSeek() {
      this.stateChange !== YT.PlayerState.PAUSED && this.stateChange !== YT.PlayerState.ENDED || (this.listeners.pause(), delete this.playStatus);
    }, onStateChange: function onStateChange(t) {
      switch (t.data) {case YT.PlayerState.PLAYING:
          this.hasPlayed = !0, this.onPlaying();break;case YT.PlayerState.PAUSED:case YT.PlayerState.ENDED:
          this.onPause();}this.stateChange = t.data;
    }, onError: function onError(t) {
      this.listeners.error(t);
    }, play: function play() {
      var t = this;this.playStatus || (this.listeners.play(), this.playStatus = 1), this.ready ? !this.hasPlayed && (this.clickToPlay || window.navigator && /iP(hone|od|ad)/.test(window.navigator.platform)) ? this.onPlaying() : this.player.playVideo() : (this.playOnReady = !0, window.YT && YT.Player ? this.player || (this.player = new YT.Player(this.element, { videoId: this.videoId, playerVars: this.playerVars, events: { onReady: function onReady() {
            t.onReady();
          }, onStateChange: function onStateChange(e) {
            t.onStateChange(e);
          }, onError: function onError(e) {
            t.onError(e);
          } } })) : this.loadAPI());
    }, pause: function pause() {
      this.ready ? this.player.pauseVideo() : this.playStatus && (delete this.playOnReady, this.listeners.pause(), delete this.playStatus);
    } }), t.extend(e.prototype, { YouTubePlayer: s, textFactory: function textFactory(t, e) {
      var n = this.options,
          o = this.getItemProperty(t, n.youTubeVideoIdProperty);return o ? (void 0 === this.getItemProperty(t, n.urlProperty) && (t[n.urlProperty] = "//www.youtube.com/watch?v=" + o), void 0 === this.getItemProperty(t, n.videoPosterProperty) && (t[n.videoPosterProperty] = "//img.youtube.com/vi/" + o + "/maxresdefault.jpg"), this.videoFactory(t, e, new s(o, n.youTubePlayerVars, n.youTubeClickToPlay))) : i.call(this, t, e);
    } }), e;
});
//# sourceMappingURL=blueimp-gallery.min.js.map

});

;require.register("js/socket.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _phoenix = require("phoenix");

var socket = new _phoenix.Socket("/socket", { params: { token: window.userToken } });

// When you connect, you'll often need to authenticate the client.
// For example, imagine you have an authentication plug, `MyAuth`,
// which authenticates the session and assigns a `:current_user`.
// If the current user exists you can assign the user's token in
// the connection for use in the layout.
//
// In your "lib/web/router.ex":
//
//     pipeline :browser do
//       ...
//       plug MyAuth
//       plug :put_user_token
//     end
//
//     defp put_user_token(conn, _) do
//       if current_user = conn.assigns[:current_user] do
//         token = Phoenix.Token.sign(conn, "user socket", current_user.id)
//         assign(conn, :user_token, token)
//       else
//         conn
//       end
//     end
//
// Now you need to pass this token to JavaScript. You can do so
// inside a script tag in "lib/web/templates/layout/app.html.eex":
//
//     <script>window.userToken = "<%= assigns[:user_token] %>";</script>
//
// You will need to verify the user token in the "connect/2" function
// in "lib/web/channels/user_socket.ex":
//
//     def connect(%{"token" => token}, socket) do
//       # max_age: 1209600 is equivalent to two weeks in seconds
//       case Phoenix.Token.verify(socket, "user socket", token, max_age: 1209600) do
//         {:ok, user_id} ->
//           {:ok, assign(socket, :user, user_id)}
//         {:error, reason} ->
//           :error
//       end
//     end
//
// Finally, pass the token on connect as below. Or remove it
// from connect if you don't care about authentication.

// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "assets/js/app.js".

// To use Phoenix channels, the first step is to import Socket
// and connect at the socket path in "lib/web/endpoint.ex":
socket.connect();

// Now that you are connected, you can join channels with a topic:
var channel = socket.channel("topic:subtopic", {});
channel.join().receive("ok", function (resp) {
  console.log("Joined successfully", resp);
}).receive("error", function (resp) {
  console.log("Unable to join", resp);
});

exports.default = socket;

});

require.alias("phoenix/priv/static/phoenix.js", "phoenix");
require.alias("phoenix_html/priv/static/phoenix_html.js", "phoenix_html");require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

require('js/app');
//# sourceMappingURL=app.js.map