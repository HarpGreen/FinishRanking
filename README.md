# FinishRanking
This plugin should be used in the LiteLoader environment.

Three commands are registered in this simple LLSE plugin:

/finish <player>—— Used when player reaches the end, it is recommended to write this cmd into a command block {OP & command block available}

/rank - Print the rank in the chat, and OS used by players will show as well {available to Any}

/rankreset - reset ranking data {OP & command block available}

Introduction
When my server is holding a parkour race and other minigames, we always need someone there to watch everyone carefully and record the order without any mistakes, and this work is so boring and of course no one like to do it.
In addition, the OS used by players also needs to be known in the game. Asking "which os r u using" one by one is a tedious and unreliable task!
So here is the plugin to solve this problem~

How to use
OP needs to put a command block at the end, so that it will be triggered when a player arrives.
The command in the cmd block should be: finish [player selector], in my case: finish @p[r=5]
All players can use /rank to check the ranking.
After the game, OP can use /rankreset to reset the ranking database~

Install:
Put the plugin file in the plugins folder, and start the BDS server!
(If the server is already running, type "ll load ./plugins/FinishRanking.js" to load a new plugin)

HelmetGreen from OriginCity bedrock server


And...
Because it was originally for my own server use, the function is very simple, and there is no config file, only a KVdatabase, and forgive me for my monotonous white default font XD

Oo of course u can just right-click to open the .js with a text editor, and change any strings :P
