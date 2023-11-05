import {
    getBlockAttrs,getBlockByID,sql as query
} from "../api"




function getEleWithKey(obj,subtring){
    // 获取字典中，键含指定字符串的元素
    let result = {}
    for (let key in obj){
        if(obj.hasOwnProperty(key) && key.includes(subtring)){
            result[key.replace(new RegExp(subtring,"g"),"")] = obj[key]
        }
    }
    return result
}

export async function getBlockInfoByID(id: BlockId) {
    // 基于blockID获取其他信息
    let AttrsData = await getBlockAttrs(id)
    let BlockData = await getBlockByID(id)
    let BlockInfo: any = {}
    // console.log(222,currentBlock)
    BlockInfo.id = BlockData.id
    BlockInfo.title = BlockData.content || '无'
    if(AttrsData.tags){
        BlockInfo.tags = (AttrsData.tags.split(',') || AttrsData.tags)
    }else{
        BlockInfo.tags = ['无']
    }

    // currentBlock.attrs = getEleWithKey(AttrsData,'custom-') || {}

    // if(AttrsData.)
    // console.log(333,getEleWithKey(AttrsData,'custom-'))
    let attrs = await getEleWithKey(AttrsData,'custom-')
    // console.log(555,Object.keys(attrs).length)
    if(Object.keys(attrs).length != 0){
        let arr = []
        for(let key in attrs){
            // 将字典转化为数组
            arr.push(key+": "+attrs[key])
        }
        BlockInfo.attrs = arr
    }else{
        BlockInfo.attrs = ['无']
    }

    console.log(444,BlockInfo)
    return BlockInfo
}

function getCurrentDate(){
    // 获取当前日期，以2023-11-05的格式
    let currentDate = new Date()
    let year = currentDate.getFullYear()
    let month = String(currentDate.getMonth() + 1).padStart(2,'0')
    let day = String(currentDate.getDate()).padStart(2,'0')
    let formattedDate = year+'-'+month+'-'+day
    return formattedDate
}

function convertArrToDict(arr: string[]){
    // 将aaa: 111字符串数组转化为字典
    let obj = []
    for(let e in arr){
        if(arr[e] == '无'){
            return obj
        }
        let str = arr[e].split(":")
        if(str.length === 2){
            let key = str[0].trim()   // 去除空格
            let value = str[1].trim()
            let dict = {[key]: value}
            obj.push(dict)
        }else{
            console.log("无法解析的字符串")
            return
        }
    }
    return obj
    
}


export async function getStatisticalProgress(conditionGroup: object,key: string,sql: string) {
    // 将统计结果写入到条件组指定条件中
    let currentDate = await getCurrentDate()

    // 获取已有due，如果和当天一样，不进行计算
    let dict = conditionGroup.find(item => item.title === key)
    if(dict.due == currentDate){
        return conditionGroup
    }

    
    // 查询SQL获取总数
    let blocks: Block[] = await query(sql)
    if(blocks.length === 0){
        showMessage("查询为空")
        return
    }
    let 查询总数 = blocks.length
    console.log(查询总数)
    let 当前已完成 = 0

    // 进行查询总数的计算
    for(let block in blocks){
        let blockInfo: object = await getBlockInfoByID(blocks[block]["id"])
        // 将attr里字符串转化为字典
        let attrs: object = await convertArrToDict(blockInfo.attrs)
        if(attrs.some(item => item.randomNoteType === 'ignore')){
            // 减去忽略的
            查询总数 = 查询总数 - 1
        }
    } 
    // console.log(currentDate)
    // console.log(blocks)
    console.log(查询总数)


    // 进行当前已完成的计算
    // TODO：未到期的计数+1

    let currentCondition = {
        'title': key,
        'sql': sql,
        'due': currentDate,
        'totalNumber': 查询总数,
        'completed': 当前已完成
    }
    let newConditionGroup = conditionGroup.filter(item => item.title !== key)
    newConditionGroup.push(currentCondition)
    // console.log(conditionGroup.filter(item => item.title !== key))
    return newConditionGroup
}