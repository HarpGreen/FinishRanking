//LiteLoaderScript Dev Helper
/// <reference path="c:/Users\zhang\Desktop\MC\LLdev\Library/JS/HelperLib-master/src/index.d.ts"/> 


ll.registerPlugin(
    "Citizen",
    "原点城市民管理系统, by HelmetGreen",
    [1, 0, 0]
);

const KVDB_PATH = "./plugins/HG/Citizen/";

mc.listen("onServerStarted", () => {
    let regcmd = mc.newCommand("regcitizen", "Origin Citizen registration cmd. By HelmetGreen", PermType.GameMasters);
    regcmd.mandatory("player", ParamType.Player);
    regcmd.overload(["player"]);
    regcmd.setCallback((_cmd, _ori, out, res) => {
        RegCitizen(res.player[0]);
    });
    regcmd.setup();

    let tpcitycmd = mc.newCommand("tpcity","玩家付1oc回到中心岛",PermType.GameMasters);
    tpcitycmd.mandatory("player", ParamType.Player);
    tpcitycmd.overload(["player"]);
    tpcitycmd.setCallback((_cmd, _ori, out, res)=>{
        TPCity(res.player[0]);
    });
    tpcitycmd.setup();
});

function RegCitizen(pl) {
    let citizendb = new KVDatabase(KVDB_PATH);
    if(citizendb == null){
        pl.sendText(Format.Red+"错误！未能成功注册成为市民！请稍后重试！持续出现此错误请联系腐竹。");
        return false;
    }
    if(citizendb.get(pl.xuid) != null){
        citizendb.close();
        pl.sendText(Format.Green+"你已经是市民了,无需重复登记！");
        return false;
    }
    let dmd = CheckDiamond(pl);
    if(dmd < 5){
        citizendb.close();
        pl.sendText(Format.Red+"错误！未能成功注册成为市民！身上钻石不足！注册市民需要5钻工本费~");
        return false;
    }
    RemoveDiamond(pl,5);//工本费，在这里改
    GovGetDiamond(5);//还有这
    if(citizendb.set(pl.xuid, new Array(pl.name, system.getTimeStr))){
        pl.sendText(Format.Green+"成功获得城市户口！");
        pl.sendToast(Format.Bold+Format.Aqua+"成为市民！","成功到达原点城中心岛，并获得城市户口！");
        citizendb.close();
        return true;
    }
    else{
        pl.sendText(Format.Red+"错误！未能成功注册成为市民！持续出现此错误请联系腐竹。");
        citizendb.close();
        let loss = dmd - CheckDiamond(pl);
        if(loss > 0){
            AddDiamond(pl, loss);
        }
        return false;
    }
}

function TPCity(pl){
    let citizendb = new KVDatabase(KVDB_PATH);
    if(citizendb == null){
        pl.sendText(Format.Red+"错误！认证市民身份时出错！数据库占用中，请稍后重试！持续出现此错误请联系腐竹。");
        return false;
    }
    if(citizendb.get(pl.xuid) == null){
        citizendb.close();
        pl.sendText(Format.Red+"抱歉，此功能仅供具有城市户口的老玩家使用，您并不具有城市户口。\n您可以选择在附近生存，远离城市的产能过剩，然后在合适的时机向市区进发！");
        return false;
    }

    let ocs = CheckOC(pl);
    if(ocs < 1){
        pl.sendText(Format.Red+"错误！执行此操作需要至少1oc");
        citizendb.close();
        return false;
    }
    if(!RemoveOC(pl,1)){
        pl.sendText(Format.Red+"错误！扣除oc时失败！");
        citizendb.close();
        return false;
    }
    else{
        citizendb.close();
        mc.runcmd("spawnpoint \""+pl.name+"\" 520 68 -250");
        let pos = new IntPos(520, 68, -250, 0);
        pl.teleport(pos);
        pl.sendText(Format.Yellow+"成功消费1oc传送至中心岛，以后记得严格保护好自己的床(重生点)~");
        return true;
    }
}

function CheckDiamond(pl) {
    let itemlist = pl.getInventory().getAllItems();
    var count = 0;
    for (let i in itemlist) {
        if (itemlist[i].type == "minecraft:diamond") {
            count += itemlist[i].count;
        }
    }
    return count;
}

function RemoveDiamond(pl, num) {
    let res = mc.runcmdEx("clear \"" + pl.name + "\" minecraft:diamond 0 " + num);
    log(res.output);
    pl.refreshItems();
}

function AddDiamond(pl, num) {
    let res = mc.runcmdEx("give \"" + pl.name + "\" minecraft:diamond " + num);
    log(res.output);
    pl.refreshItems();
}

function GovGetDiamond(num) {
    let ob = mc.getScoreObjective("diamond");
    if (ob == null) {
        log("警告：无diamond计分板，国库收款失败！");
        return false;
    }
    if (num > 0) {
        ob.addScore("gov", num);
    }
    else if (num < 0) {
        ob.reduceScore("gov", -num);
    }
    return true;
}

function CheckOC(pl) {
    return pl.getScore("oc");
}
function RemoveOC(pl, num) {
    let o = this.CheckOC(pl);
    if (o >= num) {
        if(o == 1){
            mc.getScoreObjective("oc").reduceScore(pl, num);
            return true;
        }
        if (mc.getScoreObjective("oc").reduceScore(pl, num)) return true;
        else {
            mc.runcmd("scoreboard players set \"" + pl.name + "\" oc " + o);//reduceScore报错貌似还是会扣，所以增加这道保险
            return false;
        }
    }
    else {
        pl.sendText("OC不足");
        return false;
    }
}
function AddOC(pl, num) {
    let o = this.CheckOC(pl);
    if (mc.getScoreObjective("oc").addScore(pl, num)) return true;
    else {
        mc.runcmd("scoreboard players set \"" + pl.name + "\" oc " + o);//reduceScore报错貌似还是会扣，所以增加这道保险
        return false;
    }
}