var betMinimum = $.inidb.set('betSettings', 'betMinimum', 1),
        betMaximum = $.inidb.set('betSettings', 'betMaximum', 1000),
        betMessageToggle = $.inidb.set('betSettings', 'betMessageToggle', true),
        time = 0,
        betStatus = false,
        betTimerStatus = false,
        betTimer = $.inidb.set('betSettings', 'betTimer', 0),
        betPot = 0,
        betOptions = [],
        betTable = [];

/** 
 * @function hasKey
 * @param {Array} list
 * @param {*} value
 * @param {Number} [subIndex]
 * @returns {boolean}
 */
function hasKey(list, value, subIndex) {
    var i;

    if (subIndex > -1) {
        for (i in list) {
            if (list[i][subIndex].equalsIgnoreCase(value)) {
                return true;
            }
        }
    } else {
        for (i in list) {
            if (list[i].equalsIgnoreCase(value)) {
                return true;
            }
        }
    }
    return false;
}
;

/**
 * @function betOpen
 */
function betOpen(event, bet, timer) {
    var sender = event.getSender(),
            args = event.getArgs(),
            string,
            betOp = '',
            i;

    if (betStatus || betTimerStatus) {
        $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.bet.opened'));
        return;
    }

    if (bet.length < 2 && !timer) {
        $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.options'));
        return;
    }

    for (i = 0; i < bet.length; i++) {
        betOptions.push(bet[i].toLowerCase().trim());
        if (!isNaN(bet[i])) {
            $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.open'));
            betOptions = [];
            return;
        }
    }

    string = betOptions.join(' vs ');

    betStatus = true;
    betTimerStatus = true

    $.say($.lang.get('net.quorrabot.betsystem.opened', string, $.pointNameMultiple));

    if (timer > 0) {
        setTimeout(function () {
            if (betStatus) {
                $.say($.lang.get('net.quorrabot.betsystem.auto.close.warn', string));
            }
        }, (betTimer / 2) * 1000);
        setTimeout(function () {
            betTimerStatus = false;
            if (betStatus) {
                $.say($.lang.get('net.quorrabot.betsystem.auto.close'));
            }
        }, betTimer * 1000);
    }
}
;

/**
 * @function resetBet
 */
function resetBet() {
    betPot = 0;
    betTotal = 0;
    betWinners = '';
    betOptions = [];
    betTable = [];
    betStatus = false;
    betTimerStatus = false;
}

/**
 * @function betClose
 */
function betClose(sender, event, subAction) {
    var args = event.getArgs(),
            betWinning = subAction,
            betWinPercent = 0,
            betPointsWon = 0,
            betWinners = '',
            betTotal = 0,
            bet,
            a = 0,
            i;

    if (!betStatus) {
        $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.bet.closed'));
        return;
    }

    if (!subAction) {
        $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.win.option'));
        return;
    }

    if (subAction && subAction.equalsIgnoreCase('refundall')) {
        betStatus = false;// Have this here in case it takes longer for the loop to end. 
        for (i in betTable) {
            bet = betTable[i];
            $.inidb.incr('points', i, bet.amount);
        }
        $.say($.lang.get('net.quorrabot.betsystem.close.refund', $.pointNameMultiple));
        resetBet();
        return;
    }

    if (!hasKey(betOptions, betWinning)) {
        $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.option.404'));
        return;
    }

    betWinning = subAction.toLowerCase();
    betStatus = false;
    betTimerStatus = false;

    for (i in betTable) {
        bet = betTable[i];
        if (bet.option.equalsIgnoreCase(betWinning)) {
            betTotal = bet.amount;
        }
    }

    for (i in betTable) {
        a++;
        bet = betTable[i];
        if (bet.option.equalsIgnoreCase(betWinning)) {
            betPointsWon = (betPot / betTotal);
            if (betPointsWon > 0) {
                if (betWinners.length > 0) {
                    betWinners += ', ';
                }
                betWinners += i;
            }
        }
    }

    /**
     * Disable for now.  Needs to have a different value for
     * betMinimum, right now this is the minimum amount, not
     * minimum users. Could set a default through a set command
     * and perhaps override with !bet open min=num option option
     * 
     * if (a < betMinimum) {
     *   for (i in betTable) {
     *     bet = betTable[i];
     *     $.inidb.incr('points', i, bet.amount);
     *   }
     *
     *   $.say($.lang.get('betsystem.not.enough.ppl'));
     *   resetBet();
     *   return;
     * }
     **/

    if (betTotal == 0) {
        $.say($.lang.get('net.quorrabot.betsystem.closed.404', betWinning));
        resetBet();
        return;
    }

    if (betPot <= 0) {
        for (i in betTable) {
            bet = betTable[i];
            $.inidb.incr('points', i, bet.amount);
        }
        $.say($.lang.get('net.quorrabot.betsystem.err.points.refunded'));
        resetBet();
        return;
    }
    var winners = "";
    var win = 0;

    for (i in betTable) {
        bet = betTable[i];
        if (bet.option.equalsIgnoreCase(betWinning)) {
            win = (bet.amount*2);
            $.inidb.incr('points', i, win);
            winners += " +" + win.toString() + " " + $.username.resolve(i) + ", ";
        }
    }


    winners = winners.toString().substring(winners, winners.length - 2);

    $.say($.lang.get('net.quorrabot.betsystem.closed', betWinning, winners));
    resetBet();
}
;

$.on('command', function (event) {
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
        if (!action) {
            $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.command.usage'));
            return;
        }

        /**
         * @commandpath bet open [option option option ...] - Opens a bet with options; not allowed to be digits, words only.
         */
        if (action.equalsIgnoreCase('open')) {
            betOpen(event, bet, betTimer);
            return;

            /**
             * @commandpath bet close [option] - Closes the bet and selects option as the winner.
             * @commandpath bet close refundall - Closes the bet and refunds all points.
             */
        } else if (action.equalsIgnoreCase('close')) {
            betClose(sender, event, subAction);
            return;

            /**
             * @commandpath bet setminimum [value] - Set the minimum value of a bet.
             */
        } else if (action.equalsIgnoreCase('setminimum')) {
            if (!subAction) {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.set.min.usage'));
                return;
            }

            betMinimum = parseInt(subAction);
            $.inidb.set('betSettings', 'betMinimum', betMinimum);
            $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.set.min', betMinimum, $.pointNameMultiple));
            return;

            /**
             * @commandpath bet setmaximum [value] - Set the maximum value of a bet.
             */
        } else if (action.equalsIgnoreCase('setmaximum')) {
            if (!subAction) {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.set.max.usage'));
                return;
            }

            betMaximum = parseInt(subAction);
            $.inidb.set('betSettings', 'betMaximum', betMaximum);
            $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.set.max', betMaximum, $.pointNameMultiple));
            return;

            /**
             * @commandpath bet settimer [amount in seconds] - Sets a auto close timer for bets
             */
        } else if (action.equalsIgnoreCase('settimer')) {
            if (!subAction) {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.set.timer.usage'));
                return;
            }

            betTimer = parseInt(subAction);
            $.inidb.set('betSettings', 'betTimer', betTimer);
            $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.set.timer', betTimer));
            return;

            /**
             * @commandpath togglebetmessage - Toggles the bet enter message
             */
        } else if (action.equalsIgnoreCase('togglebetmessage')) {
            if (betMessageToggle) {
                betMessageToggle = false;
                $.inidb.set('betSettings', 'betMessageToggle', false);
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.toggle.off'));
            } else if (!betMessageToggle) {
                betMessageToggle = true;
                $.inidb.set('betSettings', 'betMessageToggle', true);
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.toggle.on'));
            }
            return;

            /**
             * @commandpath bet [ [option amount] | [amount option] ]- Places a bet on option, betting an amount of points.
             */
        } else {
            if (!betStatus || !betTimerStatus) {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.bet.closed'));
                return;
            }

            var betWager,
                    betOption;

            if (!action || !subAction) {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.option.err'));
                return;
            }

            if (isNaN(action) && isNaN(subAction)) {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.option.404'));
                return;
            }
            if (isNaN(action) && !isNaN(subAction)) {
                betWager = parseInt(subAction);
                betOption = action;
            } else {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.option.err'));
                return;
            }

            if (!hasKey(betOptions, betOption.toLowerCase())) {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.option.404'));
                return;
            } else if (betWager < 1) {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.bet.err.neg', $.pointNameMultiple));
                return;
            } else if (betWager < betMinimum) {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.bet.err.less', $.getPointsString(betMinimum)));
                return;
            } else if (betWager > betMaximum) {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.bet.err.more', $.getPointsString(betMaximum)));
                return;
            } else if (parseInt($.getPoints(sender.toLowerCase())) < betWager) {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.points', $.pointNameMultiple));
                return;
            }

            for (i in betTable) {
                if (sender.equalsIgnoreCase(i)) {
                    $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.err.voted'));
                    return;
                }
            }

            $.inidb.decr('points', sender, betWager);

            if (betPot == 0) {
                betPot = betWager;
            } else {
                betPot = (betPot + betWager);
            }

            betTable[sender] = {
                amount: betWager,
                option: betOption
            };

            if (betMessageToggle = true) {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.betsystem.bet.updated', $.username.resolve(sender), $.getPointsString(betWager), betOption, $.getPointsString(betPot)));
            }
        }
    }
});

if ($.moduleEnabled('./systems/betSystem.js')) {
    $.registerChatCommand('./systems/betSystem.js', 'bet', 7);
}
