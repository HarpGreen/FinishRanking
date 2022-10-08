
//Register plugin /*********2022-9-5 [1,0,0] */
ll.registerPlugin(
    "STP",
    "原点城传送服插件, 作者 HelmetGreen, 原点城基岩版服务器自用, 暂不分享",
    [1,0,0]
)

//Register player cmds: stp
mc.listen("onServerStarted", () => {
    //玩家命令
    let occmd = mc.newCommand("stp", "服务器传送", PermType.Any);
    occmd.setEnum("ServerName", ["minigame"]);
    occmd.optional("action", ParamType.Enum, "ServerName", 1);
    //occmd.overload(["OpenPanel"]);
    occmd.overload(["ServerName"]);
    occmd.setCallback((_cmd, _ori, out, res) => {
        switch (res.action) { 
            case "minigame":
                OnSTPcmd(_ori.player);
                break;
            default:
        }
    });
    occmd.setup();
    log("Command stp is registered");

});

//stp
function OnSTPcmd(pl){
    pl.transServer(CONFIG.get("ip"),CONFIG.get("port"));
}

//config
var CONFIG = data.openConfig(".\\plugins\\HG\\STP\\config.json", "json", JSON.stringify({
    ip: "124.222.36.231",
    port: 19132
}))