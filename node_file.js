require('shelljs/global');
var fs = require('fs');
var path = require('path')
let channelId = process.argv[2];
if(!channelId){
    console.error('请传入一个正确的渠道id 打单个渠道 传1 ');
    return;
}

// 需要替换的配置文件
let needRepList = [
    "./output/platform/application/config.php",
    "./output/admin/application/config.php",
    "./output/platform/application/database.php",
    "./output/admin/application/database.php"

];

/**设置渠道参数*/
function replaceChanelStr(repList, _projectPath) {
    fs.readFile(_projectPath, {
        encoding: 'utf-8'
    }, function (err, _data) {
        if (err) {
            console.error(err);
            return;
        }
        let len = repList.length;
        //替换配置
        for (let i = 0; i < len; ++i) {
            let info = repList[i];
            let posStr = info[0];
            let channelStr = info[1];
             console.log('%s -> %s',posStr,channelStr);
            // 这把要处理成正则
            _data = _data.replace(posStr, channelStr);
        }
        //写入替换后的内容
        fs.writeFile(_projectPath, _data, 'utf-8', function (err, data) {
            if (err) {
                console.error(err);
                return;
            }
        });
    });
}
// 修改参数
    function modifyValue() {
        fs.readFile('./' + channelId + '/phpConfig.json', 'utf-8', function(err, data) {
            if (err) {
                console.error('渠道%d: phpConfig.json信息读取错误', channelIdList);
                return;
            } else {
                let json_data = JSON.parse(data);
                let config_Info = [
                    ['[-redis_host-]', json_data.redis_host.value], //
                    ['[-redis_port-]', json_data.redis_port.value], //
                    ['[-redis_auth-]', json_data.redis_auth.value], //
                ];
                let database_Info = [
                    ['[-mysql_hostname-]', json_data.mysql_hostname.value], //
                    ['[-mysql_database-]', json_data.mysql_database.value], //
                    ['[-mysql_username-]', json_data.mysql_username.value], //
                    ['[-mysql_password-]', json_data.mysql_password.value], //
                ];
                //config
                console.log('更换参数',needRepList[0]);
                replaceChanelStr(config_Info,needRepList[0]);
                //database
                console.log('更换参数',needRepList[1]);
                replaceChanelStr(database_Info,needRepList[1]);
             }
        });
    }

//递归创建目录 同步方法
function mkdirsSync(dirname) {
    //检测目录是否存在
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        //递归调用检测指定文件的父级目录是否存在
        if (mkdirsSync(path.dirname(dirname))) {
            //创建当前目录
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

//  替换配置文件
//  channelId => 渠道ID
//  file => 文件名
//  dataPath => 文件路径
function createConfig(channelId, file, dataPath){

    if(!channelId || !file || !dataPath){
        console.error('迁移失败-》',dataPath+file);
        return false;
    }
    mkdirsSync(dataPath);
    let Path = `${file} ${dataPath}`;
    let state = exec(`cp -f ${Path}`);
    if(state == 0){
        console.info('迁移成功-》',dataPath+file);
        return true;
    }
    console.error('迁移失败-》',dataPath+file);
    return false;
}

var config ={
    './defaultCfg/platform/config.php' : `./output/platform/application/`,
    //配置文件，redis/充值地址...
    './defaultCfg/platform/database.php' : `./output/platform/application/`,
    //数据库配置文件
    './defaultCfg/admin/config.php' : `./output/admin/application/`,
    './defaultCfg/admin/database.php' : `./output/admin/application/`
};
var config_com =[
    "appCfg/android/res/mipmap-mdpi/ic_launcher.png" , `./output/platform/public/static/agent/images/`
    //二维码中间的icon：logo.png  48*48
];

let count = 0;
//单独迁移图标
mkdirsSync(config_com[1]);
let png_state = exec(`cp -r -f './'${channelId}/${config_com[0]} ${config_com[1]}`);
if(png_state == 0){
    console.info('迁移成功-》',config_com[0]);
    count++;
}else{
    console.error('迁移失败-》',config_com[0]);
}

let config_arr = Object.keys(config);
let conf_len = config_arr.length;
//循环处理配置文件（覆盖成模板文件)
    for(let x=0; x< conf_len; ++x){
        let state = createConfig(channelId,config_arr[x],config[config_arr[x]]);
            if(!!state){
                count++;
            }
    }
    console.warn('\n渠道=>'+channelId+'\n迁移成功数=>',count);
    //替换配置参数
 //   modifyValue();
