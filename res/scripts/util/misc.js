//Function takes the amount of user and the name of points/currency and converts accordingly
//then calls next function with information that was processed
$.econNameFormat = function (amt, name) {
    regex = /.$\w[^aeiou]+y/i;
    if (name === undefined) {
        name = "";
    }
    if (amt > 1) {
        if ($.inidb.exists("settings", "pointNameMultiple")) {
            name = $.inidb.get("settings", "pointNameMultiple");
        } else {
            if (regex.test(name)) {
                name = " " + name + "ies";
            } else {
                name = " " + name + "s";
            }
        }
    }
    return $.formatNumbers(amt, name);
}
//Converts int based numbers (not string based) to normal currency values. Ex: 1000 -> 1,000
// can also take the name of points or currency when returning.
$.formatNumbers = function (n, econ) {
    if (econ === undefined) {
        econ = "";
    }
    return n.toFixed().replace(/./g, function (c, i, a) {
        return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
    }
    ) + " " + econ;
}

$.isJSON = function isJSON(data) {
    var ret = true;
    try {
        JSON.parse(data);
    } catch (e) {
        ret = false;
    }
    return ret;
}

$.say = function (s) {
    if ($.botsession !== null) {
        $.logChat($.botname, s);
        if (s.startsWith('.')) {
            $.botsession.say(s);
        }

        if (s.startsWith('@') && s.endsWith(',')) {
            return;
        }
        if (!s.startsWith('.')) {
            if (!$.inidb.exists("settings", "response_@all") || $.inidb.get("settings", "response_@all").equalsIgnoreCase("1")
                    || s.equals($.lang.get("net.quorrabot.misc.response-disable")) == true || s.indexOf(".timeout ") != -1 || s.indexOf(".ban ") != -1
                    || s.indexOf(".unban ") != -1 || s.equalsIgnoreCase(".clear") || s.equalsIgnoreCase(".mods")) {

                var whispercheck = s.substring(0, 3);
                if (whispercheck.equalsIgnoreCase("/w ")) {
                    sleep(1000);
                    $.botsession.say(s);
                } else {
                    $.botsession.say(s);
                }
            }
        }
    }
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}


$.replaceAll = function (string, find, replace) {
    if (find.equals(replace)) {
        return string;
    }

    if (find.indexOf("(") != -1) {
        while (string.indexOf(find) >= 0) {
            string = string.replace(find, replace);
        }
        return string;
    } else {
        var args = string.split(" ");
        var retstr = "";

        for (var i = 0; i < args.length; i++) {
            if (args[i].indexOf(find) >= 0) {
                var substr = args[i].substring(args[i].indexOf(find), find.length + 1);
                var substr2 = substr.substring(find.length, find.length + 1);

                if (isNaN(substr2) || substr2 == "") {
                    args[i] = args[i].replace(find, replace);
                }
            }

            retstr += args[i];

            if (i < args.length) {
                retstr += " ";
            }
        }

        return retstr;
    }
}

$.list = {};

$.list.forEach = function (list, callback) {
    for (var i = 0; i < list.size(); i++) {
        callback(i, list.get(i));
    }
}

$.randElement = function (arr) {
    if (arr == null)
        return null;
    return arr[$.randRange(0, arr.length - 1)];
}

$.randRange = function (min, max) {
    if (min == max) {
        return min;
    }

    return $.rand(max) + min;
}

$.randInterval = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

$.rand = function (max) {
    if (max == 0) {
        return max;
    }

    $.random = new java.security.SecureRandom();
    return Math.abs($.random.nextInt()) % max;
}

$.array = {};
$.array.contains = function (arr, itm) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == itm || (arr[i] instanceof java.lang.String && arr[i].equals(itm)) || (itm instanceof java.lang.String && itm.equals(arr[i])))
            return true;
    }
    return false;
}

$.logChat = function (sender, message) {
    if (!$.moduleEnabled("./util/fileSystem.js") || !$.logEnable || (sender.equalsIgnoreCase($.botname) && message.equalsIgnoreCase(".mods"))) {
        return;
    }
    if (!$.logChatEnable) {
        return;
    }

    var datefmt = new java.text.SimpleDateFormat("yyyy-MM-dd");
    datefmt.setTimeZone(java.util.TimeZone.getTimeZone($.timezone));

    var date = datefmt.format(new java.util.Date());

    datefmt = new java.text.SimpleDateFormat("MM-dd-yyyy @ HH:mm:ss Z");
    datefmt.setTimeZone(java.util.TimeZone.getTimeZone($.timezone));

    var timestamp = datefmt.format(new java.util.Date());

    var str = timestamp + " [" + sender + "] " + message;

    $.writeToFile(str, "./logs/chatlog_" + date + ".txt", true);
}

$.logLink = function (sender, message) {
    if (!$.moduleEnabled("./util/fileSystem.js") || !$.logEnable) {
        return;
    }

    var datefmt = new java.text.SimpleDateFormat("yyyy-MM-dd");
    datefmt.setTimeZone(java.util.TimeZone.getTimeZone($.timezone));

    var date = datefmt.format(new java.util.Date());

    datefmt = new java.text.SimpleDateFormat("MM-dd-yyyy @ HH:mm:ss Z");
    datefmt.setTimeZone(java.util.TimeZone.getTimeZone($.timezone));

    var timestamp = datefmt.format(new java.util.Date());

    var str = timestamp + " [" + sender + "] " + message;

    $.writeToFile(str, "./logs/linklog_" + date + ".txt", true);
}

$.logEvent = function (file, line, message) {
    if (!$.moduleEnabled("./util/fileSystem.js") || !$.logEnable) {
        return;
    }

    var datefmt = new java.text.SimpleDateFormat("yyyy-MM-dd");
    datefmt.setTimeZone(java.util.TimeZone.getTimeZone($.timezone));

    var date = datefmt.format(new java.util.Date());

    datefmt = new java.text.SimpleDateFormat("MM-dd-yyyy @ HH:mm:ss Z");
    datefmt.setTimeZone(java.util.TimeZone.getTimeZone($.timezone));

    var timestamp = datefmt.format(new java.util.Date());

    var str = timestamp + " [" + file + "#" + line + "] " + message;

    $.writeToFile(str, "./logs/eventlog_" + date + ".txt", true);
}

$.logError = function (file, line, message) {
    if (!$.moduleEnabled("./util/fileSystem.js") || !$.logEnable) {
        return;
    }

    var datefmt = new java.text.SimpleDateFormat("yyyy-MM-dd");
    datefmt.setTimeZone(java.util.TimeZone.getTimeZone($.timezone));

    var date = datefmt.format(new java.util.Date());

    datefmt = new java.text.SimpleDateFormat("MM-dd-yyyy @ HH:mm:ss Z");
    datefmt.setTimeZone(java.util.TimeZone.getTimeZone($.timezone));

    var timestamp = datefmt.format(new java.util.Date());

    var str = timestamp + " [" + file + "#" + line + "] " + message;

    $.writeToFile(str, "./logs/errorlog_" + date + ".txt", true);
}

$.logRotate = function () {
    var cal = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone($.timezone));
    var now = cal.getTimeInMillis();

    cal.set(java.util.Calendar.HOUR, 0);
    cal.set(java.util.Calendar.MINUTE, 0);
    cal.set(java.util.Calendar.SECOND, 0);
    cal.set(java.util.Calendar.MILLISECOND, 0);
    cal.add(java.util.Calendar.DAY_OF_MONTH, 1);

    var tomorrow = cal.getTimeInMillis();

    $.timer.addTimer("./util/misc.js", "logrotate", false, function () {
        $.logRotate();
    }, tomorrow - now + (60 * 1000));

    var chatlogs = $.findFiles(".", "chatlog_");
    var linklogs = $.findFiles(".", "linklog_");
    var eventlogs = $.findFiles(".", "eventlog_");
    var errorlogs = $.findFiles(".", "errorlog_");
    var datefmt = new java.text.SimpleDateFormat("yyyy-MM-dd");
    var date;
    var i;

    datefmt.setTimeZone(java.util.TimeZone.getTimeZone($.timezone));

    for (i = 0; i < chatlogs.length; i++) {
        date = datefmt.parse(chatlogs[i].substring(8, 18));
        cal.setTime(date);
        cal.add(java.util.Calendar.DAY_OF_MONTH, $.logRotateDays);

        if (cal.getTimeInMillis() <= now) {
            $.deleteFile(chatlogs[i], true);
        }
    }

    for (i = 0; i < linklogs.length; i++) {
        date = datefmt.parse(linklogs[i].substring(8, 18));
        cal.setTime(date);
        cal.add(java.util.Calendar.DAY_OF_MONTH, $.logRotateDays);

        if (cal.getTimeInMillis() <= now) {
            $.deleteFile(linklogs[i], true);
        }
    }

    for (i = 0; i < eventlogs.length; i++) {
        date = datefmt.parse(eventlogs[i].substring(9, 19));
        cal.setTime(date);
        cal.add(java.util.Calendar.DAY_OF_MONTH, $.logRotateDays);

        if (cal.getTimeInMillis() <= now) {
            $.deleteFile(eventlogs[i], true);
        }
    }

    for (i = 0; i < errorlogs.length; i++) {
        date = datefmt.parse(errorlogs[i].substring(9, 19));
        cal.setTime(date);
        cal.add(java.util.Calendar.DAY_OF_MONTH, $.logRotateDays);

        if (cal.getTimeInMillis() <= now) {
            $.deleteFile(errorlogs[i], true);
        }
    }
}


$.on('command', function (event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender, event.getTags());
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs();

    if (command.toString().equalsIgnoreCase("say")) {
        if (!$.isModv3(sender, event.getTags())) {
            $.say($.getWhisperString(sender) + $.modmsg);
            return;
        }
        $.say(argsString);
    }
    if (command.equalsIgnoreCase("log")) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);

            return;
        }

        if (args.length == 0) {
            var msg;

            if ($.logEnable) {
                msg = $.lang.get("net.quorrabot.common.enabled");
            } else {
                msg = $.lang.get("net.quorrabot.common.disabled");
            }

            msg = $.lang.get("net.quorrabot.misc.log-status", msg, $.logRotateDays);

            $.say($.getWhisperString(sender) + msg);

            return;
        }

        if (args[0].equalsIgnoreCase("enable")) {
            $.logEnable = true;

            $.logEvent("misc.js", 259, username + " enabled logging");

            $.inidb.set('settings', 'logenable', '1');

            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.misc.log-enable"));
        }

        if (args[0].equalsIgnoreCase("disable")) {
            $.logEvent("misc.js", 267, username + " disabled logging");

            $.logEnable = false;

            $.inidb.set('settings', 'logenable', '0');

            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.misc.log-disable"));
        }

        if (args[0].equalsIgnoreCase("days")) {
            if (args.length == 1 || isNaN(args[1]) || parseInt(args[1]) < 1) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.misc.log-err-bad-days"));

                return;
            }

            $.logEvent("misc.js", 283, username + " changed the number of days logs are kept to " + args[1]);

            $.logRotateDays = parseInt(args[1]);

            $.inidb.set('settings', 'logrotatedays', args[1]);

            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.misc.log-days", args[1]));
        }
    }

    if (command.equalsIgnoreCase("logchat")) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);

            return;
        }
        if (args[0].equalsIgnoreCase("enable")) {
            $.logChatEnable = true;

            $.logEvent("misc.js", 259, username + " enabled chat logging");

            $.inidb.set('settings', 'logchat', '1');

            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.misc.logchat-enable"));
        }

        if (args[0].equalsIgnoreCase("disable")) {
            $.logEvent("misc.js", 267, username + " disabled chat logging");

            $.logChatEnable = false;

            $.inidb.set('settings', 'logchat', '0');

            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.misc.logchat-disable"));
        }
    }

    if (command.equalsIgnoreCase("response")) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);

            return;
        }

        if (args.length == 0) {
            if ($.inidb.exists("settings", "response_@all")
                    && $.inidb.get("settings", "response_@all").equalsIgnoreCase("0")) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.misc.response-disabled"));
            } else {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.misc.response-enabled"));
            }
        } else {
            if (args[0].equalsIgnoreCase("enable")) {
                if ($.inidb.exists("settings", "response_@all")) {
                    $.inidb.del("settings", "response_@all");
                }

                $.logEvent("misc.js", 313, username + " enabled bot responses");

                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.misc.response-enable"));
            } else if (args[0].equalsIgnoreCase("disable")) {
                $.inidb.set("settings", "response_@all", "0");

                $.logEvent("misc.js", 319, username + " disabled bot responses");

                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.misc.response-disable"));
            }
        }
    }
});

$.on('ircPrivateMessage', function (event) {
    var sender = event.getSender().toLowerCase();
    var message = event.getMessage().toLowerCase();

    if (sender.equalsIgnoreCase("jtv")) {
        if (message.equalsIgnoreCase("clearchat")) {
            $.logEvent("misc.js", 333, "Received a clear chat notification from jtv");
        } else if (message.indexOf("clearchat") != -1) {
            $.logEvent("misc.js", 335, "Received a purge/timeout/ban notification on user " + message.substring(10) + " from jtv");
        }

        if (message.indexOf("now in slow mode") != -1) {
            $.logEvent("misc.js", 339, "Received a start slow mode (" + message.substring(message.indexOf("every") + 6) + ") notification from jtv");
        }

        if (message.indexOf("no longer in slow mode") != -1) {
            $.logEvent("misc.js", 343, "Received an end slow mode notification from jtv");
        }

        if (message.indexOf("now in subscribers-only") != -1) {
            $.logEvent("misc.js", 347, "Received a start subscribers-only mode notification from jtv");
        }

        if (message.indexOf("no longer in subscribers-only") != -1) {
            $.logEvent("misc.js", 351, "Received an end subscribers-only mode notification from jtv");
        }

        if (message.indexOf("now in r9k") != -1) {
            $.logEvent("misc.js", 355, "Received a start r9k mode notification from jtv");
        }

        if (message.indexOf("no longer in r9k") != -1) {
            $.logEvent("misc.js", 359, "Received an end r9k mode notification from jtv");
        }

        if (message.indexOf("hosttarget") != -1) {
            var target = message.substring(11, message.indexOf(" ", 12));

            if (target.equalsIgnoreCase("-")) {
                $.logEvent("misc.js", 366, "Received an end host mode notification from jtv");
            } else {
                $.logEvent("misc.js", 368, "Received a start host mode notification on user " + target + " from jtv");
            }
        }
    }
});

$.on('ircChannelMessage', function (event) {
    var sender = event.getSender();
    var message = event.getMessage();

    $.logChat(sender, message);
});

$.timer.addTimer("./util/misc.js", "registercommand", false, function () {
    $.registerChatCommand("./util/misc.js", "log", "admin");
    $.registerChatCommand("./util/misc.js", "say", "admin");
    $.registerChatCommand("./util/misc.js", "logchat", "admin");
    $.registerChatCommand("./util/misc.js", "response", "admin");
}, 5000);

var logEnable = $.inidb.get('settings', 'logenable');
var logChatEnable = $.inidb.get('settings', 'logchat');

if (logEnable == null || logEnable == undefined) {
    $.logEnable = false;
} else {
    $.logEnable = logEnable.equalsIgnoreCase("1");
}

if (logChatEnable == null || logChat == undefined) {
    $.logChatEnable = false;
} else {
    $.logChatEnable = logChatEnable.equalsIgnoreCase("1");
}

var logRotateDays = $.inidb.get('settings', 'logrotatedays');

if (logRotateDays == null || logRotateDays == undefined || isNaN(logRotateDays)) {
    $.logRotateDays = 7;
} else {
    $.logRotateDays = parseInt(logRotateDays);
}

$.timer.addTimer("./util/misc.js", "logrotateinit", false, function () {
    $.logRotate();
}, 60 * 1000);

$.strlen = function (str) {
    if (str == null || str == undefined) {
        return 0;
    }

    if ((typeof str.length) instanceof java.lang.String) {
        if ((typeof str.length).equalsIgnoreCase("number")) {
            return str.length;
        } else {
            return str.length();
        }
    } else {
        if ((typeof str.length) == "number") {
            return str.length;
        } else {
            return str.length();
        }
    }
};
$.getSetIniDbBoolean = function (fileName, key, defaultValue) {
    if ($.inidb.exists(fileName, key)) {
        return ($.inidb.get(fileName, key) == 'true');
    } else {
        $.inidb.set(fileName, key, defaultValue.toString());
        return (defaultValue);
    }
};

$.paginateArray = function (array, langKey, sep, whisper, sender, display_page) {
    var idx,
            output = '',
            maxlen,
            pageCount = 0;

    if (display_page === undefined) {
        display_page = 0;
    }

    maxlen = 440 - $.lang.get(langKey).length;
    for (idx in array) {
        output += array[idx];
        if (output.length >= maxlen) {
            pageCount++;
            if (display_page === 0 || display_page === pageCount) {
                if (whisper) {
                    $.say($.getWhisperString(sender) + $.lang.get(langKey, output));
                } else {
                    $.say($.lang.get(langKey, output));
                }
            }
            output = '';
        } else {
            if (idx < array.length - 1) {
                output += sep;
            }
        }
    }
    pageCount++;
    if (display_page === 0 || display_page === pageCount) {
        if (whisper) {
            $.say($.getWhisperString(sender) + $.lang.get(langKey, output));
        } else {
            $.say($.lang.get(langKey, output));
        }
    }
    return pageCount;
}


$.trueRandElement = function (arr) {
    if (arr == null)
        return null;
    return arr[$.trueRand(arr.length - 1)];
}

$.trueRand = function (max) {
    return $.trueRandRange(0, max);
}

$.trueRandRange = function (min, max) {
    if (min == max) {
        return min;
    }

    try {
        var HttpRequest = Packages.com.gmt2001.HttpRequest;
        var HashMap = Packages.java.util.HashMap;
        var JSONObject = Packages.org.json.JSONObject;

        var j = new JSONObject("{}");
        var p = new JSONObject("{}");
        var h = new HashMap(1);

        var id = $.rand(65535);

        h.put("Content-Type", "application/json-rpc");

        p.put("apiKey", "0d710311-5840-45dd-be83-82904de87c5d");
        p.put("n", 1);
        p.put("min", min);
        p.put("max", max);
        p.put("replacement", true);
        p.put("base", 10);

        j.put("jsonrpc", "2.0");
        j.put("method", "generateIntegers");
        j.put("params", p);
        j.put("id", id);

        var r = HttpRequest.getData(HttpRequest.RequestType.GET, "https://api.random.org/json-rpc/1/invoke", j.toString(), h);

        if (r.success) {
            var d = new JSONObject(r.content);
            var result = d.getJSONObject("result");
            var random = result.getJSONObject("random");
            var data = random.getJSONArray("data");

            if (data.length() > 0) {
                return data.getInt(0);
            }
        } else {
            if (r.httpCode == 0) {
                $.logError("misc.js", 478, "Failed to use random.org: " + r.exception);
            } else {
                $.logError("misc.js", 480, "Failed to use random.org: HTTP" + r.httpCode + " " + r.content);
            }
        }
    } catch (e) {
        $.logError("misc.js", 484, "Failed to use random.org: " + e);
    }

    return $.randRange(min, max);
}
