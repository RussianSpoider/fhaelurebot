    var messageToggle = $.getSetIniDbBoolean('settings', 'soundboardmessages', false);

    /**
     * @function audioHookExists
     * @param {string} hook
     */
    function audioHookExists(hook) {
        var keys = $.inidb.GetKeyList('soundboard_hooks', ''),
            hookList = [],
            i;

        for (i in keys) {
            if (keys[i].equalsIgnoreCase(hook)) {
                return true;
            }
        }

        return false;
    };

    /**
     * @function getSoundBoardCommands
     */
    function getSoundBoardCommands() {
        var keys = $.inidb.GetKeyList('soundBoardCommands', ''),
            hooks = [],
            i;

        for (i in keys) {
            hooks.push('!' + keys[i]);
        }

        return hooks;
    };

    /**
     * @function loadSoundBoardCommands
     */
    function loadSoundBoardCommands() {
        if ($.moduleEnabled('./systems/soundboardSystem.js')) {
            var commands = $.inidb.GetKeyList('soundBoardCommands', ''),
                i;
                
            for (i in commands) {
                if (!$.commandExists(commands[i])) {
                    $.registerChatCommand('./systems/soundboardSystem.js', commands[i], 7);
                } else {
                    $.log.error('Cannot add custom command audio hook, command already exists: ' + commands[i]);
                }
            }
        }
    };

    /**
     * @event command
     */
    $.on('command', function(event) {
        var sender = event.getSender().toLowerCase(),
            command = event.getCommand(),
            args = event.getArgs(),
            subCommand = args[0],
            action = args[1],
            subAction = args[2],
            actionArgs = args[3],
            audioHook = args[1],
            audioHookListStr;

        /**
         * Checks if the command is a adio hook 
         */
        if ($.inidb.exists('soundBoardCommands', command)) {
            if ($.inidb.get('soundBoardCommands', command).match(/\(list\)/g)) {
                $.paginateArray(getSoundBoardCommands(), 'net.quorrabot.soundboard.list', ', ', true, sender);
                return;
            }
            if (messageToggle) {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.soundboard.play.success', $.inidb.get('soundBoardCommands', command)));
            }
            $.soundboard.triggerAudioPanel($.inidb.get('soundBoardCommands', command));
            return;
        }

        /**
         * @commandpath audiohook [play | list] - Base command for audio hooks.
         * @commandpath audiohook play [soundboard_hook] - Sends the soundboard_hook request to the Panel. 
         * @commandpath audiohook list - Lists the audio hooks.
         * @commandpath audiohook togglemessages - Enables the success message once a sfx is sent.
         * @commandpath audiohook customcommand [add / remove] [command] [sound] - Adds a custom command that will trigger that sound. Use tag "(list)" to display all the commands.
         */
        if (command.equalsIgnoreCase('soundboard')) {
            var hookKeys = $.inidb.GetKeyList('soundboard_hooks', ''),
                hookList = [],
                idx;

            for (idx in hookKeys) {
                hookList[hookKeys[idx]] = hookKeys[idx];
            }

            if (subCommand === undefined) {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.soundboard.usage'));
                return;
            }

            if (subCommand.equalsIgnoreCase('play')) {
                if (audioHook === undefined) {
                    $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.soundboard.play.usage'));
                    return;
                }

                if (audioHookExists(audioHook) === undefined) {
                    return;
                }

                if (messageToggle) {
                    $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.soundboard.play.success', audioHook));
                }
                $.soundboard.triggerAudioPanel(audioHook);
            }

            if (subCommand.equalsIgnoreCase('togglemessages')) {
                if (messageToggle) {
                    messageToggle = false;
                    $.inidb.set('settings', 'soundboardmessages', messageToggle);
                } else {
                    messageToggle = true;
                    $.inidb.set('settings', 'soundboardmessages', messageToggle);
                }
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.soundboard.toggle', messageToggle));
                return;
            }

            if (subCommand.equalsIgnoreCase('list')) {
                if (args[1] === undefined) {
                    var totalPages = $.paginateArray(hookKeys, 'net.quorrabot.soundboard.list', ', ', true, sender, 1);
                    $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.soundboard.list.total', totalPages));
                } else if (isNaN(args[1])) {
                    var totalPages = $.paginateArray(hookKeys, 'net.quorrabot.soundboard.list', ', ', true, sender, 1);
                    $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.soundboard.list.total', totalPages));
                } else {
                    $.paginateArray(hookKeys, 'net.quorrabot.soundboard.list', ', ', true, sender, parseInt(args[1]));
                }
                return;
            }

            if (subCommand.equalsIgnoreCase('customcommand')) {
                if (action === undefined) {
                    $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.soundboard.customcommand.usage'));
                    return;
                }

                if (action.equalsIgnoreCase('add')) {
                    if (subAction === undefined || actionArgs === undefined) {
                        $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.soundboard.customcommand.add.usage'));
                        return;
                    }

                    subAction = subAction.replace('!', '');

                    if ($.inidb.exists('soundBoardCommands', subAction.toLowerCase())) {
                        $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.soundboard.customcommand.add.error.exists'));
                        return;
                    }

                    if (actionArgs.equalsIgnoreCase('(list)')) {
                        $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.soundboard.customcommand.add.list', subAction));
                        $.inidb.set('soundBoardCommands', subAction.toLowerCase(), actionArgs);
                        $.registerChatCommand('./systems/soundBoardSystem.js', subAction.toLowerCase(), 7);
                        return;
                    }

                    if (!audioHookExists(actionArgs)) {
                        $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.soundboard.customcommand.add.error.fx.null'));
                        return;
                    }

                    $.inidb.set('soundBoardCommands', subAction.toLowerCase(), actionArgs);
                    $.registerChatCommand('./systems/soundBoardSystem.js', subAction.toLowerCase(), 7);
                    $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.soundboard.customcommand.add.success', subAction, actionArgs));
                    return;
                }

                if (action.equalsIgnoreCase('remove')) {
                    if (subAction === undefined) {
                        $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.soundboard.customcommand.remove.usage'));
                        return;
                    }

                    subAction = subAction.replace('!', '');

                    if (!$.inidb.exists('soundBoardCommands', subAction.toLowerCase())) {
                        $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.soundboard.customcommand.remove.error.404'));
                        return;
                    }

                    $.inidb.del('soundBoardCommands', subAction.toLowerCase());
                    $.unregisterChatCommand(subAction.toLowerCase());
                    $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.soundboard.customcommand.remove.success', subAction));
                    return;
                }
            }
        }
    });
    setTimeout(function(){ 
        if ($.moduleEnabled('./systems/soundBoardSystem.js')) {
            $.registerChatCommand('./systems/soundBoardSystem.js', 'soundboard', 1);
            loadSoundBoardCommands();
        }
    },10*1000);

    $.loadSoundBoardCommands = loadSoundBoardCommands;

