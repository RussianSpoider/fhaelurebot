$.betSystem = {
    betMinimum: ($.inidb.get('betsettings', 'betminimum') ? $.inidb.get('betsettings', 'betminimum') : 1),
    betMaximum: ($.inidb.get('betsettings', 'betmaximum') ? $.inidb.get('betsettings', 'betmaximum') : 1000),
    time: 0,
    betStatus: false,
    betPot: 0,
    betOptions: [],
    betTable: [],
}


    function betOpen(event, bet) {
        var sender = event.getSender(),
            args = event.getArgs(),
            string,
            betOp = '',
            i;

        if ($.betSystem.betStatus) {
            $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.bet.opened'));
            return;
        }

        if (bet.length < 2) {
            $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.options'));
            return;
        }

        for (i = 0; i < bet.length; i++) {
            $.betSystem.betOptions.push(bet[i].toLowerCase().trim());
            if (!isNaN(bet[i])) {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.open'));
                $.betSystem.betOptions = [];
                return;
            }
        }

        string = $.betSystem.betOptions.join(' vs ');

        $.betSystem.betStatus = true;

        $.say($.lang.get('net.quorrabot.betsystem.opened', string, $.pointNameMultiple));
    };

    function resetBet() {
        $.betSystem.betPot = 0;
        $.betSystem.betWinRatio = 0;
        $.betSystem.totalBets = 0;
        $.betSystem.betWinners = '';
        $.betSystem.betOptions = [];
        $.betSystem.betTable = [];
    }

    function betClose(sender, event, subAction) {
        var args = event.getArgs(),
            betWinning = subAction,
            betWinPercent = 0,
            betPointsWon = 0,
            betWinners = '',
            betWinRatio = 0,
            totalBets = 0,
            bet,
            a = 0,
            i;

        if (!$.betSystem.betStatus) {
            $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.bet.closed'));
            return;
        }

        if (!betWinning) {
            $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.win.option'));
            return;
        }

        if (!$.array.contains($.betSystem.betOptions, betWinning)) {
            $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.option.404'));
            return;
        }

        betWinning = subAction.toLowerCase();
        $.betSystem.betStatus = false;

        for (i in $.betSystem.betTable) {
            bet = $.betSystem.betTable[i];
            if (bet.option.equalsIgnoreCase(betWinning)) {
                betWinRatio++;
            }
            totalBets++;
        }
        
        var betChance = Math.round(totalBets / betWinRatio);

        if (betChance == 0) {
            $.say($.lang.get('net.quorrabot.betsystem.closed.404', betWinning));
            resetBet();
            return;
        }

        if ($.betSystem.betPot <= 0) {
            for (i in $.betSystem.betTable) {
                bet = $.betSystem.betTable[i];
                $.inidb.incr('points', i, bet.amount);
            }
            $.say($.lang.get('net.quorrabot.betsystem.err.points.refunded'));
            resetBet();
            return;
        }
        
        var winAmount = 0;
        var winnerString = "";
        
        for (i in $.betSystem.betTable) {
            bet = $.betSystem.betTable[i];
            if (bet.option.equalsIgnoreCase(betWinning)) {
                winAmount = bet.amount + (bet.amount * betChance);
                if (winAmount > 0) {
                    if (betWinners.length > 0) {
                        betWinners += ', ';
                        winnerString += ', ';
                    }
                    betWinners += i;
                    winnerString += i + " [+" + winAmount + "]";
                }
            }
        }

        // For the Panel
        $.inidb.set('betresults', 'winners', winnerString);
        betChance = betChance * 100;
        $.say($.lang.get('net.quorrabot.betsystem.closed', betWinning, betChance.toString(), winnerString));
        resetBet();
    };

    $.on('command', function(event) {
        var sender = event.getSender(),
            command = event.getCommand(),
            argString = event.getArguments().trim(),
            args = event.getArgs(),
            action = args[0],
            subAction = args[1],
            bet = args.slice(1);

        /**
         * @commandpath bet - Performs bet operations.
         */
        if (command.equalsIgnoreCase('bet')) {
            if (!action && !$.isModv3(sender, event.getTags())) {
                $.say($.getWhisperString(sender) + $.modmsg);
                return;
            } else if (!action) {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.command.usage'));
                return;
            }

            /**
             * @commandpath bet open [option option option ...] - Opens a bet with options; not allowed to be digits, words only.
             */
            if (action.equalsIgnoreCase('open')) {
                if (!$.isModv3(sender, event.getTags())) {
                    $.say($.getWhisperString(sender) + $.modmsg);
                    return;
                }

                betOpen(event, bet);
                return;

                /**
                 * @commandpath bet close [option] - Closes the bet and selects option as the winner.
                 */
            } else if (action.equalsIgnoreCase('close')) {
                if (!$.isModv3(sender, event.getTags())) {
                    $.say($.getWhisperString(sender) + $.modmsg);
                    return;
                }
                betClose(sender, event, subAction);
                return;

                /**
                 * @commandpath bet setminimum [value] - Set the minimum value of a bet.
                 */
            } else if (action.equalsIgnoreCase('setminimum')) {
                if (!$.isModv3(sender, event.getTags())) {
                    $.say($.getWhisperString(sender) + $.modmsg);
                    return;
                }

                if (!subAction) {
                    $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.set.min.usage'));
                    return;
                }

                $.betSystem.betMinimum = parseInt(subAction);
                $.inidb.set('betsettings', 'betminimum', $.betSystem.betMinimum);
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.set.min', $.betSystem.betMinimum, $.pointNameMultiple));
                return;

                /**
                 * @commandpath bet setmaximum [value] - Set the maximum value of a bet.
                 */
            } else if (action.equalsIgnoreCase('setmaximum')) {
                if (!$.isModv3(sender, event.getTags())) {
                    $.say($.getWhisperString(sender) + $.modmsg);
                    return;
                }

                if (!subAction) {
                    $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.set.max.usage'));
                    return;
                }

                $.betSystem.betMaximum = parseInt(subAction);
                $.inidb.set('betsettings', 'betmaximum', $.betSystem.betMaximum);
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.set.max', $.betSystem.betMaximum, $.pointNameMultiple));
                return;

                /**
                 * @commandpath bet [ [option amount] | [amount option] ]- Places a bet on option, betting an amount of points.
                 */
            } else {
                if (!$.betSystem.betStatus) {
                    $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.bet.closed'));
                    return;
                }

                var betWager,
                    betOption;

                if (!action || !subAction) {
                    $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.option.404'));
                    return;
                }

                if (isNaN(action) && isNaN(subAction)) {
                    $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.option.404'));
                    return;
                }
                if (isNaN(action) && !isNaN(subAction)) {
                    betWager = parseInt(subAction);
                    betOption = action;
                }
                if (!isNaN(action) && isNaN(subAction)) {
                    betWager = parseInt(action);
                    betOption = subAction;
                }

                if (!$.array.contains($.betSystem.betOptions, betOption.toLowerCase())) {
                    $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.option.404'));
                    return;
                } else if (betWager < 1) {
                    $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.bet.err.neg', $.pointNameMultiple));
                    return;
                } else if (betWager < $.betSystem.betMinimum) {
                    $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.bet.err.less', $.getPointsString($.betSystem.betMinimum)));
                    return;
                } else if (betWager > $.betSystem.betMaximum) {
                    $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.bet.err.more', $.getPointsString($.betSystem.betMaximum)));
                    return;
                } else if (parseInt($.getPoints(sender.toLowerCase())) < betWager) {
                    $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.points', $.pointNameMultiple));
                    return;
                }

                for (i in $.betSystem.betTable) {
                    if (sender.equalsIgnoreCase(i)) {
                        $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.voted'));
                        return;
                    }
                }

                $.inidb.decr('points', sender, betWager);

                if ($.betSystem.betPot == 0) {
                    $.betSystem.betPot = betWager;
                } else {
                    $.betSystem.betPot = ($.betSystem.betPot + betWager);
                }

                $.betSystem.betTable[sender] = {
                    amount: betWager,
                    option: betOption
                };

                $.say($.lang.get('net.quorrabot.betsystem.bet.updated', $.username.resolve(sender), $.getPointsString(betWager), betOption, $.getPointsString($.betSystem.betPot)));
            }
        }
    });

setTimeout(function () {
    if ($.moduleEnabled('./systems/betSystem.js')) {
        $.registerChatCommand("./systems/betSystem.js", "bet");
    }
}, 10 * 1000);
