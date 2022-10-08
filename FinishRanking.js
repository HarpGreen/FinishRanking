ll.registerPlugin(
    "FinishRanking",
    "跑酷等比赛的终点排名次功能, by HelmetGreen",
    [1,0,0]
);

mc.listen("onServerStarted", () => {
    var db = new KVDatabase("./plugins/HG/FinishRanking");
    db.close();

    var cmd = mc.newCommand("finish", "仅用于命令方块登记到达终点的玩家", PermType.GameMasters);
    cmd.mandatory("player", ParamType.Player);
    cmd.overload(["player"]);
    cmd.setCallback((_cmd, _ori, out, res) => {
        if(res.player == null) return;
        let pl = res.player[0];
        Finish(pl);
    });
    cmd.setup();

    var rank = mc.newCommand("rank", "查询名次", PermType.Any);
    rank.overload();
    rank.setCallback((_cmd, _ori, out, res) => {
        if(_ori.player != null){
            ShowRank(_ori.player);
        }
    })
    rank.setup();

    var reset = mc.newCommand("rankreset", "删除现有排名(慎用)", PermType.GameMasters)
    reset.overload();
    reset.setCallback((_cmd, _ori, out, res) => {
        DeleteRank();
    })
    reset.setup();
})

//到终点时
function Finish(pl){
    let name = pl.name;
    let dev = pl.getDevice();
    db = new KVDatabase("./plugins/HG/FinishRanking");
    if(db==null){
        pl.sendText("登记名次时发生错误！请重试！", )
    }
    ranklist = db.listKey();
    for(n of ranklist){
        if(n == name){
            db.close();
            return;
        }
    }
    db.set(name, new Array(
        ranklist.length+1,
        dev.os
    ))
    db.close();
    
    mc.broadcast("恭喜玩家 <"+name+"> 使用 ["+dev.os+"] 完成了比赛！使用/rank查看排名");
    mc.broadcast("恭喜玩家 <"+name+"> 使用 ["+dev.os+"] 完成了比赛！", 5);
}

//展示排名
function ShowRank(pl){
    db = new KVDatabase("./plugins/HG/FinishRanking");
    if(db==null) return;
    ranklist = db.listKey();
    let index = new Array(ranklist.length);
    for(let i=0;i<ranklist.length;i++){
        index[db.get(ranklist[i])[0]-1] = i;
    }
    for(let j=0;j<index.length;j++){
        let n = ranklist[index[j]];
        let para = db.get(n);
        pl.sendText(para[0]+" -- <"+n+"> 使用设备"+para[1]);
    }
    db.close();
}

function DeleteRank(){
    db = new KVDatabase("./plugins/HG/FinishRanking");
    if(db==null) return;
    ranklist = db.listKey();
    for(n of ranklist){
        db.delete(n);
    }
    db.close();
    return;
}