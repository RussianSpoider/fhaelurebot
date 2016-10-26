/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package me.gloriouseggroll.quorrabot.event.gamewisp;

import me.gloriouseggroll.quorrabot.twitchchat.Channel;
/**
 *
 * @author Tom
 */
public class GameWispAnniversaryEvent extends GameWispEvent {

    private final String username;
    private final int months;
    private final int tier;

    public GameWispAnniversaryEvent(String username, int months, int tier) {
        this.username = username;
        this.months = months;
        this.tier = tier;
    }

    public GameWispAnniversaryEvent(String username, int months, int tier, Channel channel) {
        super(channel);
        this.username = username;
        this.months = months;
        this.tier = tier;
    }

    public String getUsername() {
        return username;
    }

    public int getMonths() {
        return months;
    }
    
    public int getTier() {
        return tier;
    }
}
