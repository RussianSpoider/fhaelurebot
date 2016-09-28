$.Notice = {
    NoticeReqMessages: parseInt($.inidb.get('notice', 'reqmessages')) ? parseInt($.inidb.get('notice', 'reqmessages')) : 25,
    NoticeInterval: parseInt($.inidb.get('notice', 'interval')) ? parseInt($.inidb.get('notice', 'interval')) : 10,
    NoticeToggle: $.inidb.get('settings', 'noticetoggle') ? $.inidb.get('settings', 'noticetoggle') : "true",
    NumberOfNotices: (parseInt($.inidb.GetKeyList('notices', '').length)) ? (parseInt($.inidb.GetKeyList('notices', '').length)) : 0,
    MessageCount: 0,
    NTimerCount: 0,
    NoticeTimers: $.inidb.GetKeyList('notice_timers', '') ? $.inidb.GetKeyList('notice_timers', '') : '',
}

$.notices = [];
for(var i=0;i<$.Notice.NumberOfNotices;i++) {
    var m = $.inidb.get('notices', 'message_' + i);
    if(m!=null) {
        $.notices.push(m);
    }
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
    $.notices = [];
    for(var i=0;i<$.Notice.NumberOfNotices;i++) {
        var m = $.inidb.get('notices', 'message_' + i);
        if(m!=null) {
            $.notices.push(m);
        }
    }
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
        }
        if (args.length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-usage"));
            return;
        }
        
        if (action.equalsIgnoreCase('config')) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-config", $.Notice.NoticeToggle, $.Notice.NoticeInterval, $.Notice.NoticeReqMessages, $.Notice.NumberOfNotices));
            return;
        } 
        
        if (action.equalsIgnoreCase('toggle')) {
            if ($.Notice.NoticeToggle=="true") {
                $.Notice.NoticeToggle = "false";
                $.inidb.set('settings', 'noticetoggle', "false");
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-disabled"));
            } else {
                $.Notice.NoticeToggle = "true";
                $.inidb.set('settings', 'noticetoggle', "true");
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-enabled"));
                return;
            }
        }
        
        if (action.equalsIgnoreCase('interval')) {
            if (args.length < 2) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-interval-usage"));
                return;
            } else if (parseInt(args[1]) < 2) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-interval-404"));
                return;
            } else {
                $.inidb.set('notice', 'interval', parseInt(args[1]));
                $.Notice.NoticeInterval = parseInt(args[1]);
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-inteval-success"));
                return;
            }
        } 
        
        if (action.equalsIgnoreCase('trigger')) {
            if (args.length < 2) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-trigger-usage"));
                return;
            } else if (parseInt(args[1]) < 1) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-trigger-404"));
                return;
            } else {
                $.inidb.set('notice', 'reqmessages', parseInt(args[1]));
                $.Notice.NoticeReqMessages = parseInt(args[1]);
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-trigger-success"));
                return;
            }
        }
        
        if(action.toLowerCase()!="trigger" | action.toLowerCase()!="interval") {
            if((args[1]!=null || args[1]!="") && parseInt(args[1]) > 0) {
                args[1] = parseInt(args[1] - 1);
            } else if(parseInt(args[1] == 0)) {
                args[1] = 1;
            }
        }
        
        if (action.equalsIgnoreCase('get')) {
            if (args.length < 2) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-get-usage", $.Notice.NumberOfNotices));
                return;
            } else if ($.notices[args[1]]==null) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-error-notice-404"));
                return;
            } else {
                $.say($.notices[args[1]]);
                return;
            }
        } 
        
        if (action.equalsIgnoreCase('edit')) {
            if (args.length < 2) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-edit-usage", $.Notice.NumberOfNotices));
                return;
            } else if ($.notices[args[1]]==null) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-error-notice-404"));
                return;
            } else {
                var message = argsString.substring(argsString.indexOf(action) + action.length() + 3);
                $.inidb.set('notices', 'message_' + args[1], message);
                $.Notice.reloadNotices();
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-edit-success"));
                return;
            }
        } 
        if (action.equalsIgnoreCase('timer')) {
            if (args.length < 3) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-timer-usage", $.Notice.NumberOfNotices));
                return;
            } else if ($.notices[args[1]]==null) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-error-notice-404"));
                return;
            } else {
                var message = argsString.substring(argsString.indexOf(action) + action.length() + 3);
                $.inidb.set('notice_timers', 'message_' + args[1], args[2]);
                $.timer.addTimer("./handlers/noticeHandler.js", "notice_timer_message_" + args[1], true, function () {
                    if ($.Notice.NumberOfNotices > 0 && $.Notice.NoticeToggle=="true") {
                            $.SendNotice(args[1]);
                            return;
                    }
                }, args[2] * 60 * 1000);
                
                var timer = parseInt(args[1]);
                timer++;
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-timer-success", timer));
                return;
            }
        } 
        
        if (action.equalsIgnoreCase('remove')) {
            if (args.length < 2) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-remove-usage", $.Notice.NumberOfNotices));
                return;
            } else if (parseInt(args[1]) > $.Notice.NumberOfNotices) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-error-notice-404"));
                return;
            } else {
                $.inidb.del('notices', 'message_' + args[1]);
                $.Notice.NumberOfNotices--;
                if($.inidb.exists('notice_timers', 'message_' + args[1])) {
                    $.inidb.del('notice_timers','message_' + args[1]);
                    $.Notice.NoticeTimers.splice('message_' + args[1]);
                    $.timer.clearTimer("./handlers/noticeHandler.js", "notice_timer_message_" + args[1], true);
                }
                $.Notice.reloadNotices();
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-remove-success"));
                return;
            }
        } 
        
        if (action.equalsIgnoreCase('add')) {
            if (args.length < 2) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-add-usage"));
                return;
            } else {
                var message = argsString.substring(argsString.indexOf(action) + action.length() + 1);
                $.inidb.set('notices', 'message_' + $.Notice.NumberOfNotices, message);
                $.Notice.NumberOfNotices++;
                $.Notice.reloadNotices();
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-add-success"));
                return;
            }
        } 
        if (action.equalsIgnoreCase('send')) {
            if (args[1]==null) {
                $.SendNotice();
                return;
            } else if ($.notices[args[1]]==null) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-error-notice-404"));
                return;
            } else {
                $.SendNotice(args[1]);
                return;
            }
        } 
        
        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.noticehandler.notice-usage"));
        return;
    }
});

setTimeout(function () { 
    if ($.moduleEnabled('./handlers/noticeHandler.js')) {
        $.registerChatCommand('./handlers/noticeHandler.js', 'notice');
    }
}, 10 * 1000);

$.SendNotice = function (number) {
    var noticenum = number;
    var EventBus = Packages.me.gloriouseggroll.quorrabot.event.EventBus;
    var CommandEvent = Packages.me.gloriouseggroll.quorrabot.event.command.CommandEvent;
    var notice = "";

    if(noticenum!=null && !isNaN(noticenum)) {
        notice = $.inidb.get('notices', 'message_' + noticenum); 
    } else {
        if($.Notice.NTimerCount > 0) {
            $.Notice.NTimerCount++;
            noticenum = $.Notice.NTimerCount;
        } else if ($.Notice.NTimerCount > $.notices.length) {
            $.Notice.NTimerCount = 0;
            noticenum = 0;
        } else {
            noticenum = 0;
        }
        notice = $.notices[noticenum];
    }
    var noticeList = $.inidb.GetKeyList('notices', '');

    if (notice.toLowerCase().startsWith('!')) {
        notice = notice.substring(1);
        EventBus.instance().post(new CommandEvent($.botname, notice, ' '));
        return;
    } else {

        if (notice.contains('(game)')) {
                notice = $.replaceAll(notice, '(game)', $.getGame($.channelName));
        }
        if (notice.contains('(status)')) {
                notice = $.replaceAll(notice, '(status)', $.getStatus($.channelName));
        }
        if (notice.contains('(random)')) {
            notice = $.replaceAll(notice, '(random)', $.users[$.rand($.users.length)][0]);
        }
        if (notice.contains('(viewers)')) {
            notice = $.replaceAll(notice, '(viewers)', $.getViewers($.channelName));
        }
        if (notice.contains('(#)')) {
            notice = $.replaceAll(notice, '(#)', $.randRange(1, 100));
        } 

        if (notice.contains('(z_stroke)')) {
            notice = $.replaceAll(notice, '(z_stroke)', java.lang.Character.toString(java.lang.Character.toChars(0x01B6)[0]));
        } 

        if (notice.contains('(customapi')) {
            var noticeId = '';
            for(var i=0;i<noticeList.length;i++) {
                if($.inidb.get('notices', 'message_' + i) == notice) {
                    noticeId="Notice ID: #" + parseInt(i+1);
                    break;
                }
            }
            notice = $.customAPI(notice,noticeId,"",$.botName);
        }
        if (notice.contains('(code)')) {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            for (var i = 0; i < 8; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            notice = $.replaceAll(notice, '(code)', text);
        }
   
        $.say(notice);
        return;
    }
};

$.startTimer = function(id) {
        $.timer.addTimer("./handlers/noticeHandler.js", "notice_timer_message_" + id, true, function() {
                $.SendNotice(id);
                return;
        }, parseInt($.inidb.get("notice_timers", "message_" + id)) * 60 * 1000);    
}

if ($.Notice.NumberOfNotices > 0 && $.Notice.NoticeToggle=="true") {
    for(var i=0;i<$.Notice.NoticeTimers.length;i++) {
        var nId = $.Notice.NoticeTimers[i].substring($.Notice.NoticeTimers[i].indexOf("message_") + 8, $.Notice.NoticeTimers[i].length());
        $.startTimer(nId);
    }
}

$.timer.addTimer("./handlers/noticeHandler.js", "Notices", true, function () {
    if ($.Notice.NumberOfNotices > 0 && $.Notice.NoticeToggle=="true") {
        if ($.Notice.MessageCount >= $.Notice.NoticeReqMessages) {
            $.SendNotice();
            $.Notice.MessageCount = 0;
            return;
        }
    }
}, $.Notice.NoticeInterval * 60 * 1000);
