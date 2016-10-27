/* 
 * Copyright (C) 2016 www.quorrabot.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package me.gloriouseggroll.quorrabot.event;

import com.google.common.collect.Sets;
import java.util.Set;
import java.util.concurrent.ArrayBlockingQueue;
//import java.util.concurrent.Executors;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import me.gloriouseggroll.quorrabot.Quorrabot;

public class EventBus
{

    private static final EventBus instance = new EventBus();

    public static EventBus instance()
    {
        return instance;
    }
    
    /*public static ExecutorService newFixedThreadPoolWithQueueSize(int nThreads, int queueSize) {
           return new ThreadPoolExecutor(nThreads, nThreads,
                                         5000L, TimeUnit.MILLISECONDS,
                                         new ArrayBlockingQueue<Runnable>(queueSize, true), new ThreadPoolExecutor.CallerRunsPolicy());
    }*/
    
    
    //private final com.google.common.eventbus.AsyncEventBus aeventBus = new com.google.common.eventbus.AsyncEventBus(newFixedThreadPoolWithQueueSize(1,3), new ExceptionHandler());
    private final com.google.common.eventbus.EventBus aeventBus = new com.google.common.eventbus.EventBus(new ExceptionHandler());
    
    //private final com.google.common.eventbus.AsyncEventBus aeventBus = new com.google.common.eventbus.AsyncEventBus(Executors.newFixedThreadPool(8), new ExceptionHandler());
    private final com.google.common.eventbus.EventBus eventBus = new com.google.common.eventbus.EventBus(new ExceptionHandler());
    private final Set<Listener> listeners = Sets.newHashSet();

    public void register(Listener listener)
    {
        listeners.add(listener);
        eventBus.register(listener);
        aeventBus.register(listener);
    }

    public void unregister(Listener listener)
    {
        listeners.remove(listener);
        eventBus.unregister(listener);
        aeventBus.unregister(listener);
    }

    public void post(Event event)
    {
        if (Quorrabot.instance() == null || Quorrabot.instance().isExiting())
        {
            return;
        }

        eventBus.post(event);
    }

    public void postAsync(Event event)
    {
        if (Quorrabot.instance() == null || Quorrabot.instance().isExiting())
        {
            return;
        }

        aeventBus.post(event);
    }
}
