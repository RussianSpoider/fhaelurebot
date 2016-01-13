$.Notice = {
    NoticeReqMessages: parseInt($.inidb.get('notice', 'reqmessages')) ? parseInt($.inidb.get('notice', 'reqmessages')) : 25,
    NoticeInterval: parseInt($.inidb.get('notice', 'interval')) ? parseInt($.inidb.get('notice', 'interval')) : 10,
    NoticeToggle: $.inidb.get('settings', 'noticetoggle') ? $.inidb.get('settings', 'noticetoggle') : false,
    NumberOfNotices: parseInt($.inidb.GetKeyList('notices', '').length) ? parseInt($.inidb.GetKeyList('notices', '').length) : 0,
    MessageCount: 0,
}

$.Notice.reloadNotices = function () {
    var keys = $.inidb.GetKeyList('notices', '');
    var count = 0;
    for (var i = 0; i < keys.length; i++) {
        $.inidb.set('tempnotices', keys[i], $.inidb.get('notices', keys[i]));
    }
    $.inidb.RemoveFile('notices');
    keys = $.inidb.GetKeyList('tempnotices', '');
    for (var i = 0; i < keys.length; i++) {
        $.inidb.set('notices', 'message_' + count, $.inidb.get('tempnotices', keys[i]));
        count++;
    }
    $.inidb.RemoveFile('tempnotices');
};

$.on('ircChannelMessage', function (event) {
    $.Notice.MessageCount++;
});

$.on('command', function (event) {
    var sender = event.getSender();
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs();
    var action = args[0];

    if (command.equalsIgnoreCase('notice')) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        } else if (args.length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.noticehandler.notice-usage"));
            return;
        } else if (action.equalsIgnoreCase('get')) {
            if (args.length < 2) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.noticehandler.notice-get-usage", $.Notice.NumberOfNotices));
                return;
            } else if (!$.inidb.exists('notices', 'message_' + args[1])) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.noticehandler.notice-error-notice-404"));
                return;
            } else {
                $.say($.inidb.get('notices', 'message_' + args[1]));
                return;
            }
        } else if (action.equalsIgnoreCase('edit')) {
            if (args.length < 3) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.noticehandler.notice-edit-usage", $.Notice.NumberOfNotices));
                return;
            } else if (!$.inidb.exists('notices', 'message_' + args[1])) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.noticehandler.notice-error-notice-404"));
                return;
            } else {
                var message = argsString.substring(argsString.indexOf(action) + action.length() + 3);
                $.inidb.set('notices', 'message_' + args[1], message);
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.noticehandler.notice-edit-success"));
                return;
            }
        } else if (action.equalsIgnoreCase('remove')) {
            if (args.length < 2) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.noticehandler.notice-remove-usage", $.Notice.NumberOfNotices));
                return;
            } else if (!$.inidb.exists('notices', 'message_' + args[1])) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.noticehandler.notice-error-notice-404"));
                return;
            } else {
                $.inidb.del('notices', 'message_' + args[1]);
                $.Notice.NumberOfNotices--;
                $.Notice.reloadNotices();
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.noticehandler.notice-remove-success"));
                return;
            }
        } else if (action.equalsIgnoreCase('add')) {
            if (args.length < 2) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.noticehandler.notice-add-usage"));
                return;
            } else {
                var message = argsString.substring(argsString.indexOf(action) + action.length() + 1);
                $.inidb.set('notices', 'message_' + $.Notice.NumberOfNotices, message);
                $.Notice.NumberOfNotices++;
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.noticehandler.notice-add-success"));
                return;
            }
        } else if (action.equalsIgnoreCase('interval')) {
            if (args.length < 2) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.noticehandler.notice-interval-usage"));
                return;
            } else if (parseInt(args[1]) < 2) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.noticehandler.notice-interval-404"));
                return;
            } else {
                $.inidb.set('notice', 'interval', parseInt(args[1]));
                $.Notice.NoticeInterval = parseInt(args[1]);
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.noticehandler.notice-inteval-success"));
                return;
            }
        } else if (action.equalsIgnoreCase('req')) {
            if (args.length < 2) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.noticehandler.notice-req-usage"));
                return;
            } else if (parseInt(args[1]) < 1) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.noticehandler.notice-req-404"));
                return;
            } else {
                $.inidb.set('notice', 'reqmessages', parseInt(args[1]));
                $.Notice.NoticeReqMessages = parseInt(args[1]);
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.noticehandler.notice-req-success"));
                return;
            }
        } else if (action.equalsIgnoreCase('config')) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.noticehandler.notice-config", $.Notice.NoticeToggle, $.Notice.NoticeInterval, $.Notice.NoticeReqMessages, $.Notice.NumberOfNotices));
            return;
        } else if (action.equalsIgnoreCase('toggle')) {
            if ($.Notice.NoticeToggle) {
                $.Notice.NoticeToggle = false;
                $.inidb.set('settings', 'noticetoggle', false);
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.noticehandler.notice-disabled"));
            } else {
                $.Notice.NoticeToggle = true;
                $.inidb.set('settings', 'noticetoggle', true);
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.noticehandler.notice-enabled"));
                return;
            }
        } else {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.noticehandler.notice-usage"));
            return;
        }
    }
});

setTimeout(function () { 
    if ($.moduleEnabled('./handlers/noticeHandler.js')) {
        $.registerChatCommand('./handlers/noticeHandler.js', 'notice');
    }
}, 10 * 1000);

$.SendNotice = function () {
    var EventBus = Packages.me.mast3rplan.phantombot.event.EventBus;
    var CommandEvent = Packages.me.mast3rplan.phantombot.event.command.CommandEvent;
    var notice = $.inidb.get('notices', 'message_' + $.randRange(0, $.Notice.NumberOfNotices));

    if (notice.toLowerCase().startsWith('command:')) {
        notice = notice.substring(8);
        EventBus.instance().post(new CommandEvent($.botname, notice, ' '));
        return;
    } else {
        $.say(notice);
        return;
    }
};

$.timer.addTimer("./handlers/noticehandler.js", "Notices", true, function () {
    if ($.Notice.NumberOfNotices > 0 && $.Notice.NoticeToggle) {
        if ($.Notice.MessageCount >= $.Notice.NoticeReqMessages) {
            $.SendNotice();
            $.Notice.MessageCount = 0;
            return;
        }
    }
}, $.Notice.NoticeInterval * 60 * 1000);
