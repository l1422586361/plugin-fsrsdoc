import {
    getBlockAttrs,getBlockByID
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