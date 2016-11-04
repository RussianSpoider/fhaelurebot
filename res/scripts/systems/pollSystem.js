$.poll = {
    id: 0,
    options: [],
    votes: [],
    voters: [],
    callback: function() {},
    pollRunning: false,
    pollMaster: '',
    time: 0,
    question: '',
    minVotes: 0,
    result: '',
    pollTimerId: -1,
    hasTie: 0,
    counts: [],
};

var rePollOpenFourOptions = new RegExp(/"([\w\W]+)"\s+"([\w\W]+)"\s+(\d+)\s+(\d+)/),
    rePollOpenThreeOptions = new RegExp(/"([\w\W]+)"\s+"([\w\W]+)"\s+(\d+)/),
    rePollOpenTwoOptions = new RegExp(/"([\w\W]+)"\s+"([\w\W]+)"/);

function runPoll(question, options, time, pollMaster, minVotes, callback) {
        var optionsStr = "";

        if ($.poll.pollRunning) {
            return false
        }

        $.poll.pollRunning = true;
        $.poll.pollMaster = pollMaster;
        $.poll.time = (isNaN(time) || time == 0 ? false : time * 1000);
        $.poll.callback = callback;
        $.poll.question = question;
        $.poll.options = options;
        $.poll.minVotes = (minVotes ? minVotes : 1);
        $.poll.votes = [];
        $.poll.voters = [];
        $.poll.counts = [];
        $.poll.hasTie = 0;

        for (var i = 0; i < $.poll.options.length; i++) {
            optionsStr += (i + 1) + ") " + $.poll.options[i] + " ";
        }

        $.say($.lang.get('net.quorrabot.pollsystem.poll.started', $.username.resolve(pollMaster), time, $.poll.minVotes, $.poll.question, optionsStr));
        if ($.poll.time) {
            $.poll.pollTimerId = setTimeout(function() {
                endPoll();
                clearTimeout($.poll.pollTimerId);
            }, $.poll.time);
        }

        return true;
};

function makeVote(sender, voteText) {
        var optionIndex = voteText;

        if (!$.poll.pollRunning) {
            $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.pollsystem.vote.nopoll'));
        }

        if ($.array.contains($.poll.voters, sender.toLowerCase())) {
            $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.pollsystem.vote.already'));
            return;
        }
        if(parseInt(voteText)) {
            optionIndex = parseInt(voteText);
        } else {
            for(var i=0;i<$.poll.options.length;i++) {
                if(voteText.toString().equalsIgnoreCase($.poll.options[i])){
                    optionIndex = i + 1;
                }
            }
        }
        
        if (isNaN(optionIndex) || optionIndex < 1 || optionIndex > $.poll.options.length) {
            $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.pollsystem.vote.invalid', voteText));
            return;
        } 
        
        
        optionIndex--;
        $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.pollsystem.vote.success', $.poll.options[optionIndex], $.poll.question));
        $.poll.voters.push(sender);
        $.poll.votes.push(optionIndex);
};

function endPoll() {
        var mostVotes = -1,
            i;

        if (!$.poll.pollRunning) {
            return;
        }

        if ($.poll.pollTimerId > -1) {
            clearTimeout($.poll.pollTimerId);
            $.poll.pollTimerId = -1;
        }

        if ($.poll.minVotes > 0 && $.poll.votes.length < $.poll.minVotes) {
            $.poll.result = '';
            $.poll.pollMaster = '';
            $.poll.pollRunning = false;
            $.poll.callback(false);
            return;
        }

        for (i = 0; i < $.poll.options.length; $.poll.counts.push(0), i++);
        for (i = 0; i < $.poll.votes.length; $.poll.counts[$.poll.votes[i++]] += 1);
        for (i = 0; i < $.poll.counts.length; winner = (($.poll.counts[i] > mostVotes) ? i : winner), mostVotes = (($.poll.counts[i] > mostVotes) ? $.poll.counts[i] : mostVotes), i++);
        for (i = 0; i < $.poll.counts.length;
            (i != winner && $.poll.counts[i] == $.poll.counts[winner] ? $.poll.hasTie = 1 : 0), ($.poll.hasTie == 1 ? i = $.poll.counts.length : 0), i++);

        $.poll.result = $.poll.options[winner];
        $.poll.pollMaster = '';
        $.poll.pollRunning = false;
        $.inidb.set('pollresults', 'question', $.poll.question);
        $.inidb.set('pollresults', 'result', $.poll.result);
        $.inidb.set('pollresults', 'votes', $.poll.votes.length);
        $.inidb.set('pollresults', 'options', $.poll.options.join(','));
        $.inidb.set('pollresults', 'counts', $.poll.counts.join(','));
        $.inidb.set('pollresults', 'istie', $.poll.hasTie);
        $.poll.callback($.poll.result);
};


$.on('command', function (event) {
    var sender = event.getSender().toLowerCase(),
        command = event.getCommand(),
        argsString = event.getArguments().trim(),
        args = event.getArgs(),
        action = args[0];

    if (command.equalsIgnoreCase('vote') && action) {
        if (!$.poll.pollRunning) {
            $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.pollsystem.vote.nopoll'));
            return;
        }
        makeVote(sender, action);
    }
    
    if (command.equalsIgnoreCase("poll")) {
        
        if (!action) {
            if ($.poll.pollRunning) {
                var optionsStr = "";
                for (var i = 0; i < $.poll.options.length; i++) {
                    optionsStr += (i + 1) + ") " + $.poll.options[i] + (i == $.poll.options.length - 1 ? "" : " ");
                }
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.pollsystem.poll.running', $.poll.question, optionsStr));
            } else {
                if (!$.isMod(sender)) {
                    $.say($.getWhisperString(sender) + $.modmsg);
                    return;
                }
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.pollsystem.poll.usage'));
            }
            return;
        }
        
        if (!$.isModv3(sender, event.getTags())) {
            $.say($.getWhisperString(sender) + $.modmsg);
            return;
        }
        
        if (action.equalsIgnoreCase('result')) {
            if ($.poll.pollRunning) {
                $.say($.lang.get('net.quorrabot.pollsystem.results.running'));
            } else if ($.poll.result != '') {
                if ($.poll.hasTie) {
                    $.say($.lang.get('net.quorrabot.pollsystem.results.lastpoll', $.poll.question, $.poll.votes.length, "Tie!", $.poll.options.join('", "'), $.poll.counts.join('", "')));
                } else {
                    $.say($.lang.get('net.quorrabot.pollsystem.results.lastpoll', $.poll.question, $.poll.votes.length, $.poll.result, $.poll.options.join('", "'), $.poll.counts.join(', ')));
                }
            } else {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.pollsystem.results.404'));
            }
        }
        
        if (action.equalsIgnoreCase('open')) {
            var time = 60,
                question = '',
                options = [],
                minVotes = 1;

            argsString = argsString + ""; // Cast as a JavaScript string.

            if (argsString.match(rePollOpenFourOptions)) {
                question = argsString.match(rePollOpenFourOptions)[1];
                options = argsString.match(rePollOpenFourOptions)[2].split(/,\s*/);
                time = parseInt(argsString.match(rePollOpenFourOptions)[3]);
                minVotes = parseInt(argsString.match(rePollOpenFourOptions)[4]);
            } else if (argsString.match(rePollOpenThreeOptions)) {
                question = argsString.match(rePollOpenThreeOptions)[1];
                options = argsString.match(rePollOpenThreeOptions)[2].split(/,\s*/);
                time = parseInt(argsString.match(rePollOpenThreeOptions)[3]);
            } else if (argsString.match(rePollOpenTwoOptions)) {
                question = argsString.match(rePollOpenTwoOptions)[1];
                options = argsString.match(rePollOpenTwoOptions)[2].split(/,\s*/);
            } else {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.pollsystem.open.usage'));
                return;
            }

            if (isNaN(time) || !question || !options || options.length == 0 || isNaN(minVotes) || minVotes < 1) {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.pollsystem.open.usage'));
                return;
            }
            if (options.length == 1) {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.pollsystem.open.moreoptions'));
                return;
            }

            if (runPoll(question, options, (time == 0 ? 60 : time), sender, minVotes, function(winner) {
                    if (winner === false) {
                        $.say($.lang.get('net.quorrabot.pollsystem.runpoll.novotes', question));
                        return;
                    }
                    if ($.poll.hasTie) {
                        $.say($.lang.get('net.quorrabot.pollsystem.runpoll.tie', question));
                    } else {
                        $.say($.lang.get('net.quorrabot.pollsystem.runpoll.winner', question, winner));
                    }
                })) {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.pollsystem.runpoll.started'));
            } else {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.pollsystem.results.running'));
            }
            
            if (action.equalsIgnoreCase('close')) {
                if (!$.poll.pollRunning) {
                    $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.pollsystem.close.nopoll'));
                    return;
                }
                endPoll();
            }

        }
    }
});

    if ($.moduleEnabled('./systems/pollSystem.js')) {
        $.registerChatCommand("./systems/pollSystem.js", "poll", "mod");
        $.registerChatCommand("./systems/pollSystem.js", "vote");
    }
