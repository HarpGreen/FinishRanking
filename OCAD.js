//LiteLoaderScript Dev Helper
/// <reference path="c:\Users\zhang\Dropbox\Aids/dts/HelperLib-master/src/index.d.ts"/> 

ll.registerPlugin(
    /* name */ "OCAD",
    /* introduction */ "原点城玩家广告墙插件",
    /* version */[0, 0, 4],
    /* otherInformation */ {}
);


var DB_PATH = "./plugins/HG/OCAD/db"
/*
key:标题
value:Array(
    player.name,
    content,
    时间戳/60000（分钟数）
    购买天数
)
*/
mc.listen("onJoin", (pl) => {
    OpenADForm(pl);
    CheckExpiredAD();
})

mc.listen("onServerStarted", ()=>{
    let ad_cmd = mc.newCommand("ad", "Players' Advertisements - 玩家广告界面", PermType.Any);
    ad_cmd.overload();
    ad_cmd.setCallback((_cmd, _ori, out, res) => {
        if(_ori.player == null){
            return;
        }
        OpenADForm(_ori.player);
        CheckExpiredAD();
    });
    ad_cmd.setup();
})

//给玩家显示广告列表
function OpenADForm(pl) {
    let adfm = mc.newSimpleForm();
    adfm.setTitle(Format.Bold+Format.Gold+"原点广告 OCAD /ad");
    adfm.addButton("发布广告 Advertise");
    let addb = new KVDatabase(DB_PATH);
    if(addb == null){
        log("玩家 "+pl.name+ "打开广告数据库失败(Player AD DB Failure)");
        return;
    }
    let ad_list = addb.listKey();
    
    //展示的标题排序
    ad_list.sort((a,b) => {
        return addb.get(b)[2] - addb.get(a)[2];
    });
    addb.close();

    if(ad_list != null){
        for(ad_name of ad_list) {
            adfm.addButton(ad_name);
        }
    }
    
    pl.sendForm(adfm, (player, id) =>{
        if(id == null || id <0) {
            return;
        }
        let addb = new KVDatabase(DB_PATH);
        if(addb == null){
            log("玩家 "+pl.name+ "打开广告数据库失败");
            return;
        }
        let ad_list = addb.listKey();
        //展示的标题排序
        ad_list.sort((a,b) => {
            return addb.get(b)[2] - addb.get(a)[2];
        });
        addb.close();
        if(id == 0){
            ADManageForm(player);
            return;
        }
        //let rev_list = ad_list.reverse();
        ShowAD(player, ad_list[id - 1]);
    });

}

//展示某一篇广告
function ShowAD(pl, ad_name) {
    let fm = mc.newCustomForm();
    fm.setTitle(ad_name);
    let addb = new KVDatabase(DB_PATH);
    if(addb == null){
        pl.sendText("广告数据库被占用，请重试. AD DB Busy");
        return;
    }
    let ary = addb.get(ad_name);
    addb.close();
    let minuteremain = ary[3]*1440 - (Math.floor(Date.now()/60000) - ary[2]);
    fm.addLabel(ary[1]);//1-->广告正文
    fm.addLabel(Format.Gray+"Player: "+ary[0]);//0-->玩家名字
    fm.addLabel(Format.Gray+"Time Left (Minutes): "+minuteremain);
    pl.sendForm(fm, (player, datas) =>{
        return OpenADForm(player);
    })
}

//玩家进入管理自己的广告的页面
function ADManageForm(pl) {
    let fm = mc.newCustomForm();
    fm.setTitle("发布广告 Advertise~");
    fm.addLabel("广告费: 2钻/天 FEE:2 DMND/day\n你身上钻石数: "+CheckDiamond(pl));
    fm.addInput("天数 Duration(Days) (1~60)","整数 Integer","1");
    fm.addInput("标题 Title (1~20)");
    fm.addInput("正文 Content");
    fm.addSwitch("彩色标题 (+4钻/天) Colored Title", false);
    fm.addSwitch("加粗标题 (+4钻/天) Bold Title", false);
    pl.sendForm(fm, (player, datas) =>{
        if(datas == null){
            return;
        }
        //获取输入值
        let days = Number.parseInt(datas[1]);
        if(Number.isNaN(days)||days<1||days>60){
            player.sendText(Format.Red+"输入的天数无效 Invalid duration days input");
            return;
        }
        let title = datas[2];
        if(title == null || title.length>20||title.length<1){
            player.sendText(Format.Red+"标题错误 Bad Title");
            return;
        }
        title.replace(/§/g, "");
        let content = datas[3];
        if(content == null){
            player.sendText(Format.Red+"内容错误 Bad content");
            return;
        }
        let colorful = datas[4];
        let bold = datas[5];
        //算钱
        let cost = days * 2;
        if(colorful) cost+=days*4;
        if(bold) cost+=days*4;
        //检查钱
        if(CheckDiamond(player)<cost){
            player.sendText(Format.Red+"身上钻石不足！ 需要至少 "+cost+" 钻. Insufficient dmnd");
            return;
        }
        if(colorful) {
            title = Format.DarkAqua+title;
        }
        if(bold){
            title = Format.Bold+title;
        }
        let addb = new KVDatabase(DB_PATH);
        if(addb == null){
            player.sendText("广告数据库被占用，请重试. AD_DB busy, try again");
            return;
        }
        addb.set(title, new Array(
            player.name,
            content,
            Math.floor(Date.now()/60000),
            days
        ));
        addb.close();
        RemoveDiamond(player, cost);
        GovGetDiamond(cost);
        player.sendText(Format.Green+"您的广告已发布，消费 "+cost+" 钻. Costs u "+cost+" dmnd.");
    });
    
}

function CheckExpiredAD(){
    let addb = new KVDatabase(DB_PATH);
    if(addb == null){
        log("广告数据库被占用");
        return;
    }
    let ad_list = addb.listKey();
    if(ad_list == null) return;
    let ary;
    for(ad_name of ad_list) {
        ary = addb.get(ad_name);
        let timepassed = (Math.floor(Date.now()/60000) - ary[2])/1440;
        //log(ad_name+" 已经展示了 "+timepassed+" 天。期限是 "+ ary[3]+" 天。");
        if(timepassed >= ary[3]){
            addb.delete(ad_name);
            log("已删除 "+ad_name);
        }
    }
    addb.close();
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