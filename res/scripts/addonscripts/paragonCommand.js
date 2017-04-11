$.apiURL = 'https://api.agora.gg';

$.fetchData = function (url) {
    var HttpRequest = Packages.com.gmt2001.HttpRequest;
    var HashMap = Packages.java.util.HashMap;
    var response = HttpRequest.getData(HttpRequest.RequestType.GET, url, "", new HashMap());
    return response.content;
};

$.getCurrentMatch = function (id) {
    var JSONObject = Packages.org.json.JSONObject;
    var matchData = new JSONObject($.fetchData($.apiURL + "/games/now/" + id));
    if (matchData.toString().indexOf('data":[]') != -1) {
        return "no result";
    }
    var matchId = matchData.getJSONObject("data").getString("id");
    return matchId;
};

$.getDivision = function (elonum) {
    var division = "";
    var elo = $.parseInt(elonum);
    switch (true) {
        case (elo <= 1099):
            division = "Bronze";
            break;
        case (elo > 1099 && elo <= 1299):
            division = "Silver";
            break;
        case (elo > 1299 && elo <= 1499):
            division = "Gold";
            break;
        case (elo > 1499 && elo <= 1699):
            division = "Platinum";
            break;
        case (elo > 1699):
            division = "Diamond";
            break;
        default:
            division = "No division available.";
            break;
    }
    return division;
};

$.getEpicAccount = function (username) {
    if ($.inidb.get("paragon", username.toLowerCase()) == null) {
        $.say($.getWhisperString(username.toLowerCase()) + "You must specify an Epic Games account name.");
        return;
    } else {
        return $.inidb.get("paragon", username.toLowerCase());
    }
};

$.getHeroName = function (herostring) {
    var hero = "";
    switch (true) {
        case herostring.equalsIgnoreCase("tomahawk"):
            hero = "Khaimera";
            break;
        case herostring.equalsIgnoreCase("wardrum"):
            hero = "Narbash";
            break;
        case herostring.equalsIgnoreCase("tacticia"):
            hero = "Lt. Belicia";
            break;
        case herostring.equalsIgnoreCase("sword"):
            hero = "Greystone";
            break;
        case herostring.equalsIgnoreCase("pyro"):
            hero = "Iggy & Scorch";
            break;
        case herostring.equalsIgnoreCase("kurohane"):
            hero = "Kallari";
            break;
        case herostring.equalsIgnoreCase("arcblade"):
            hero = "Feng Mao";
            break;
        case herostring.equalsIgnoreCase("riftmage"):
            hero = "Gideon";
            break;
        case herostring.equalsIgnoreCase("vamp"):
            hero = "Countess";
            break;
        case herostring.equalsIgnoreCase("coil"):
            hero = "GRIM.exe";
            break;
        case herostring.equalsIgnoreCase("price"):
            hero = "Murdock";
            break;
        case herostring.equalsIgnoreCase("venus"):
            hero = "The Fey";
            break;
        case herostring.equalsIgnoreCase("totem"):
            hero = "Dekker";
            break;
        case herostring.equalsIgnoreCase("hammer"):
            hero = "Sevarog";
            break;
        case herostring.equalsIgnoreCase("hyperbreach"):
            hero = "Howitzer";
            break;
        case herostring.equalsIgnoreCase("muriel"):
            hero = "Muriel";
            break;
        case herostring.equalsIgnoreCase("sparrow"):
            hero = "Sparrow";
            break;
        case herostring.equalsIgnoreCase("kwang"):
            hero = "Kwang";
            break;
        case herostring.equalsIgnoreCase("grux"):
            hero = "Grux";
            break;
        case herostring.equalsIgnoreCase("twinblast"):
            hero = "TwinBlast";
            break;
        case herostring.equalsIgnoreCase("rampage"):
            hero = "Rampage";
            break;
        case herostring.equalsIgnoreCase("steel"):
            hero = "Steel";
            break;
        case herostring.equalsIgnoreCase("gadget"):
            hero = "Gadget";
            break;
        default:
            hero = "No information available or player has not played this hero.";
            break;
    }
    return hero;
};

$.on('command', function (event) {
    var sender = event.getSender();
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args;
    var action;
    var avalue;
    var JSONObject = Packages.org.json.JSONObject;
    var JSONArray = Packages.org.json.JSONArray;

    if (argsString.isEmpty()) {
        args = [];
    } else {
        args = argsString.split(" ");
    }

    if (command.equalsIgnoreCase("paragon")) {

        if (argsString.isEmpty() | argsString.equalsIgnoreCase("help")) {
            $.say($.getWhisperString(sender) + "All stats are provided by Agora.gg. Usage:");
            $.say($.getWhisperString(sender) + "!paragon setname {player} - Set your Paragon name for the !match command (defaults to Twitch username)");
            $.say($.getWhisperString(sender) + "!paragon stats {player} - Fetch a player's current stats");
            $.say($.getWhisperString(sender) + "!paragon elo|rank|winloss|kda|towers {player} - Fetch a player's individual elo/rank/winloss ratio/kda/towers destroyed per game");
            $.say($.getWhisperString(sender) + "!paragon hero {player} {hero} - Fetch various statistics about a player's Hero stats");
            $.say($.getWhisperString(sender) + "!paragon match - Grab a realtime match of the broadcaster's game.");
            $.say($.getWhisperString(sender) + "!paragon help - Displays various commands for the user to use");
            return;
        }

        action = args[0];
        if (args[1] == null) {
            avalue = $.getEpicAccount(sender);
        } else {
            if (!action.equalsIgnoreCase("hero")) {
                avalue = args[1];
            } else {
                if (args[2] != null) {
                    avalue = args[1];
                } else {
                    avalue = $.getEpicAccount(sender);
                }
            }
        }

        if (avalue == null) {
            $.say($.getWhisperString(sender) + "You must specify an Epic Games account name.");
            return;
        }

        var playerIdFetch = new JSONObject($.fetchData($.apiURL + "/players/search/" + avalue));
        var playerId = playerIdFetch.getJSONArray("data").getJSONObject(0).getInt("id");
        var playerInfo = new JSONObject($.fetchData($.apiURL + "/players/" + playerId));
        if (playerInfo.toString().indexOf("404") != -1) {
            $.say($.getWhisperString(sender) + "The Epic account you specified does not exist.");
            return;
        }
        var playerData = playerInfo.getJSONObject("data");

        var stats = playerData.getJSONArray("stats");
        var gamesplayed = stats.getJSONObject(0).getInt("gamesPlayed");
        if (gamesplayed == 0 && !action.equalsIgnoreCase("setname")) {
            $.say(playerData.getString("name") + " has not played this season.");
            return;
        }
        var elo = stats.getJSONObject(0).getInt("elo");
        var lastSeasonElo;
        if (!playerData.toString().contains('ranks":"null')) {
            lastSeasonElo = playerData.getJSONArray("ranks").getJSONObject(0).getInt("elo");
        } else {
            lastSeasonElo = 0;
        }
        var wins = stats.getJSONObject(0).getInt("wins");
        var kills = stats.getJSONObject(0).getInt("kills");
        var deaths = stats.getJSONObject(0).getInt("deaths");
        var assists = stats.getJSONObject(0).getInt("assists");
        var towers = stats.getJSONObject(0).getInt("towers");
        var rank;
        if (stats.toString().indexOf("rank") != -1) {
            rank = stats.getJSONObject(0).getInt("rank");
        } else {
            rank = "Unranked";
        }
        var percentile;
        if (stats.toString().indexOf("percentile") != -1) {
            percentile = stats.getJSONObject(0).getDouble("percentile");
        } else {
            percentile = 0;
        }
        var mode = stats.getJSONObject(0).getInt("mode");

        var kda;
        if (kills == 0 && assists == 0 && deaths == 0) {
            kda = 0;
        } else {
            kda = (kills + assists) / deaths;
            kda = kda.toString().split(".")[1].substring(0, 2);
        }
        var winloss;
        if (wins == 0 && gamesplayed == 0) {
            winloss = 0;
        } else {
            winloss = wins / gamesplayed;
            winloss = winloss.toString().split(".")[1].substring(0, 2);
        }

        var towerspergame = towers / gamesplayed;
        $.println(stats.toString());
        if (stats.toString().indexOf('"heroes":[{') != -1) {
            heroes = stats.getJSONObject(0).getJSONArray("heroes");
        } else {
            heroes = "None";
        }

        var herostats;
        var heroname;
        var herogamesplayed;
        var herowins;
        var besthero;
        var bestheroratio;
        var heroratio;
        var heroratiolist = [];
        if (heroes != "None" && heroes.length() > 0) {
            for (var i = 0; i < heroes.length(); i++) {
                herostats = heroes.getJSONObject(i);

                herogamesplayed = herostats.getInt("gamesPlayed");
                herowins = herostats.getInt("wins");
                heroratio = herowins / herogamesplayed;
                heroratiolist.push(heroratio);
            }
            for (var i = 0; i < heroratiolist.length; i++) {
                bestheroratio = 0;
                if (heroratiolist[i] > bestheroratio) {
                    bestheroratio = heroratiolist[i];
                    besthero = i;
                }
            }
            herostats = heroes.getJSONObject(besthero);

            heroname = $.getHeroName(herostats.getString("hero").split("_")[1]);
            herogamesplayed = herostats.getInt("gamesPlayed");
            herowins = herostats.getInt("wins");
            heroratio = herowins / herogamesplayed;
            if (heroratio < 1) {
                heroratio = heroratio.toString().split(".")[1].substring(0, 2);
            }
            $.herostring = " Best Hero: [" + heroname + " | " + herowins + " - " + (herogamesplayed - herowins) + " (" + heroratio + "%)]";
        } else {
            $.herostring = "";
        }

        if (action.equalsIgnoreCase("setname")) {
            if (playerData.getString("name").equalsIgnoreCase(avalue)) {
                $.inidb.set("paragon", sender.toLowerCase(), playerData.getString("name"));
                $.say($.getWhisperString(sender) + "The Epic Games account " + playerData.getString("name") + " has been linked to your twitch username.");
                return;
            }

            $.say($.getWhisperString(sender) + "That Epic Games account does not exist.");
            return;
        }

        if (action.equalsIgnoreCase("stats")) {
            $.say("/me " + playerData.getString("name")
                    + ": [" + elo.toString() + " | " + $.getDivision(elo) + "]"
                    + " Last Season: [" + lastSeasonElo.toString() + " | " + $.getDivision(lastSeasonElo) + "]"
                    + " Rank: [" + rank + " (" + percentile.toFixed(3) + "%)]"
                    + " Win/Loss Ratio: [" + wins + " - " + (gamesplayed - wins) + " (" + winloss + "%)]"
                    + " KDA: [" + kills + " / " + deaths + " / " + assists + " (" + kda + "%)]"
                    + " Towers Destroyed: [" + towers + " (" + towerspergame.toFixed(2) + "/game)]"
                    + $.herostring
                    );
        }
        if (action.equalsIgnoreCase("elo")) {

            $.say("/me " + playerData.getString("name")
                    + ": [" + elo.toString() + " | " + $.getDivision(elo) + "]"
                    + " Last Season: [" + lastSeasonElo.toString() + " | " + $.getDivision(lastSeasonElo) + "]"
                    );
        }
        if (action.equalsIgnoreCase("rank")) {

            $.say("/me " + playerData.getString("name")
                    + " Rank: [" + rank + " (" + percentile.toFixed(3) + "%)]"
                    );
        }
        if (action.equalsIgnoreCase("winloss")) {

            $.say("/me " + playerData.getString("name")
                    + " Win/Loss Ratio: [" + wins + " - " + (gamesplayed - wins) + " (" + winloss + "%)]"
                    );
        }
        if (action.equalsIgnoreCase("kda")) {

            $.say("/me " + playerData.getString("name")
                    + " KDA: [" + kills + " / " + deaths + " / " + assists + " (" + kda + "%)]"
                    );
        }
        if (action.equalsIgnoreCase("towers")) {

            $.say("/me " + playerData.getString("name")
                    + " Towers Destroyed: [" + towers + " (" + towerspergame.toFixed(2) + "/game)]"
                    );
        }
        if (action.equalsIgnoreCase("besthero")) {
            if ($.herostring == "") {
                $.say("/me " + playerData.getString("name") + " has not played any heroes this season.");
                return;
            }
            $.say("/me " + playerData.getString("name")
                    + $.herostring
                    );
        }
        if (action.equalsIgnoreCase("hero")) {

            var heroes = stats.getJSONObject(0).getJSONArray("heroes");
            var herostats;
            var herostring;
            if (args[2] == null) {
                herostring = argsString.substring(argsString.indexOf(args[1]));
            } else {
                herostring = argsString.substring(argsString.indexOf(args[2]));
            }

            if (herostring.toLowerCase().indexOf('iggy') != -1 || herostring.toLowerCase().indexOf('scorch') != -1) {
                herostring = "Iggy & Scorch";
            }
            if (herostring.toLowerCase().indexOf('fey') != -1) {
                herostring = "The Fey";
            }
            if (herostring.equalsIgnoreCase("grim")) {
                herostring = "GRIM.exe";
            }
            if (herostring.toLowerCase().indexOf('belica') != -1) {
                herostring = "Lt. Belica";
            }
            if (heroes.length() > 0) {

                for (var i = 0; i < heroes.length(); i++) {
                    var hero = heroes.getJSONObject(i);
                    if ($.getHeroName(hero.getString("hero").split("_")[1]).equalsIgnoreCase(herostring)) {
                        herostats = hero;
                        break;
                    }
                }
                if (herostats == null) {
                    $.say($.getHeroName(herostring));
                    return;
                }
                var heroname = $.getHeroName(herostats.getString("hero").split("_")[1]);
                var herogamesplayed = herostats.getInt("gamesPlayed");
                var herowins = herostats.getInt("wins");
                var herokills = herostats.getInt("kills");
                var herodeaths = herostats.getInt("deaths");
                var heroassists = herostats.getInt("assists");
                var herotowers = herostats.getInt("towers");
                var heromode = herostats.getInt("mode");

                var herokda = (herokills + heroassists) / herodeaths;
                herokda = herokda.toString().split(".")[1].substring(0, 2);

                var herowinloss = herowins / herogamesplayed;
                if (herowinloss < 1) {
                    herowinloss = herowinloss.toString().split(".")[1].substring(0, 2);
                }

                var herotowerspergame = herotowers / herogamesplayed;

                $.say("/me " + playerData.getString("name")
                        + "'s " + heroname + " stats: "
                        + " Win/Loss: [" + herowins + " - " + (herogamesplayed - herowins) + " (" + herowinloss + "%)]"
                        + " KDA: [" + herokills + " / " + herodeaths + " / " + heroassists + " (" + herokda + "%)]"
                        + " Towers Destroyed: [" + herotowers + " (" + herotowerspergame.toFixed(2) + "/game)]"
                        );

            }
        }
        if (action.equalsIgnoreCase("profile")) {
            $.say("https://agora.gg/profile/" + playerData.getString("name"));
        }
        if (action.equalsIgnoreCase("match")) {
            var match = $.getCurrentMatch(playerData.getInt("id"));
            if (match == "no result") {
                $.say(playerData.getString("name") + " is not currently in a match.")
            } else {
                $.say("https://agora.gg/game/" + match);
            }
        }
    }
    ;
});

if ($.moduleEnabled('./addonscripts/paragonCommand.js')) {
    $.registerChatCommand("./addonscripts/paragonCommand.js", "paragon");
    $.println('Agora.gg Paragon stats API module loaded.');
};