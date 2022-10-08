//LiteLoaderScript Dev Helper
/// <reference path="c:/Users\zhang\Desktop\MC\LLdev\Library/JS/HelperLib-master/src/index.d.ts"/> 

ll.registerPlugin("HeadKeepInv", "头颅提供死亡不掉, by HelmetGreen", [1,2,0]);

//看有多少指定物品
function CheckHead(pl){
    let itemlist = pl.getInventory().getAllItems();
    let count = 0;
    for(let i in itemlist){
        //log(itemlist[i].type,itemlist[i].aux);
        if(itemlist[i].type == "minecraft:skull" && itemlist[i].aux == 3) {
            count += itemlist[i].count;
        }
    }
    let helmet = pl.getArmor().getItem(0);
    if(helmet.type == "minecraft:skull" && helmet.aux == 3){
        count += 1;
    }
    return count;
}
function RemoveHead(pl){
    let helmet = pl.getArmor().getItem(0);
    if(helmet.type == "minecraft:skull" && helmet.aux == 3){
        pl.getArmor().removeItem(0,1);
        pl.refreshItems();
        return;
    }

    let itemlist = pl.getInventory().getAllItems();
    let count=0;
    for(i of itemlist){
        //log(itemlist[i].type,itemlist[i].aux);
        if(i.type == "minecraft:skull" && i.aux == 3) {
            pl.getInventory().removeItem(count, 1);
            break;
        }
        count ++;
    }
    pl.refreshItems();
}

function DropInventory(pl) {
    //照物品栏复制一份在自身坐标，最后清空自身
    let itemlist = pl.getInventory().getAllItems();
    //let count = 0;
    for(let i in itemlist){
        if(!itemlist[i].isNull()){
            mc.spawnItem(itemlist[i], pl.pos);
        }
    }
    pl.getInventory().removeAllItems();

    //照盔甲栏复制一份在自身坐标，最后清空盔甲栏
    let armor = pl.getArmor().getAllItems();
    for(let j in armor){
        if(!armor[j].isNull()){
            mc.spawnItem(armor[j], pl.pos);
        }
    }
    pl.getArmor().removeAllItems();

    //更新物品栏
    pl.refreshItems();
}

function DropExp(pl) {
    //照玩家经验值和等级，在原地生成经验球，并扣经验
    //掉落的经验值=经验等级×7 且<=100
    //let exp = pl.getTotalExperience();
    let lvl = pl.getLevel();
    //计算掉落量
    let drop = lvl*7;
    if(drop>100) drop = 100;
    //生成经验
    expball = mc.newItem("xp_orb", drop);
    mc.spawnItem(expball , pl.pos);
    //扣除经验
    pl.reduceExperience(drop);
}

function GetXpOrb(v){
    mc.newItem()
}

////玩家死亡时之回调
function DropOnDeath(pl){
    if(CheckHead(pl) > 0) {
        RemoveHead(pl);
        mc.broadcast(Format.Yellow + pl.name+" 消耗了一个头颅,保住了物品栏!");
    }
    else {
        DropInventory(pl);
        DropExp(pl);
    }
}

mc.listen("onPlayerDie", (pl, source) => {
    DropOnDeath(pl);
})