<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { version, sql as query } from "@/api";
    import { showMessage, fetchPost, Protyle } from "siyuan";
    // import '@brewer/beerui/assets/beer.css'
    import {
        BeTextarea,BeProgress, BeInput,BeSelect,BeOption, BeButton,BeFormItem, BeForm



    } from '@brewer/beerui';
    import '@brewer/beerui/assets/beer.css'
    import { 获取配置,写入配置 } from "./js/writeConfig.js";
    import { getBlockInfoByID, getStatisticalProgress,convertArrToDict,getCurrentDate } from "./js/query.js"

    export let app;

    let time: string = "";
    let ver: string = "";
    let divProtyle: HTMLDivElement;
    let protyle: any;
    let conf: any;
    let blockID: string = '';




    let 条件组: string[] = [];
    let currentTitle: string = ''
    let currentSql: string = ''; 

    let currentBlock: any = {
        'tags':['无'],
        'attrs':['无']
    };

    let 查询总数: number = 0
    let 当前已完成 = 0
    let 进度 = (当前已完成/查询总数) * 100



    onMount(async () => {
        ver = await version();
        fetchPost("/api/system/currentTime", {}, (response) => {
            time = new Date(response.data).toString();
        });
        protyle = await initProtyle();
        // 载入数据
        conf = await 获取配置();
        console.log(conf)
        条件组 = conf.条件组
        currentTitle = 'Default'
        currentSql = 条件组.find(dict => dict.title == currentTitle)['sql']; // TODO：后面加入到设置里，初始条件
        // currentBlock = {}
        // console.log(currentSql)
        
    });

    onDestroy(() => {
        showMessage("Hello panel closed");
        protyle.destroy();
    });

    async function initProtyle() {
        // let sql = "SELECT * FROM blocks ORDER BY RANDOM () LIMIT 1;";
        let blocks: Block[] = await query('SELECT * FROM blocks ORDER BY RANDOM () LIMIT 1;');
        blockID = blocks[0].id;
        return new Protyle(app, divProtyle, {
            blockId: blockID
        });
    }
    

    // 漫游区
    let isStudyActive: boolean = true
    async function getProtyle() {
        // let sql = "SELECT * FROM blocks ORDER BY RANDOM () LIMIT 1;";
        let blocks: Block[] = await query(currentSql);
        // console.log(blocks)
        if(blocks.length === 0){
            showMessage("查询为空")
            return
        }

        // 初始化
        let currentDate = await getCurrentDate()
        let currentConditions = 条件组.find(item => item.title === currentTitle)
        if(currentConditions.due != currentDate){
            条件组 = await getStatisticalProgress(条件组,currentTitle,currentSql)
            conf.条件组 = 条件组
            写入配置(conf)
        }
        
        
        查询总数 = currentConditions.totalNumber
        当前已完成 = currentConditions.completed
        进度=((当前已完成/查询总数) * 100).toFixed(1) // 精度为小数点后一位

        while(true){
            let randomIndex = Math.floor(Math.random() * blocks.length)
            let blockInfo = await getBlockInfoByID(blocks[randomIndex].id)
            let attrs = await convertArrToDict(blockInfo.attrs)
            // TODO：后期要将忽略条件写成统一的方法
            if(!attrs.some(item => item.randomNoteType === 'ignore')){
                // TODO： 添加fsrs内容
                blockID = blocks[randomIndex].id
                break
            }
        }

        


        console.log(查询总数,当前已完成,进度)
        // blockID = blocks[0].id;
        
        // console.log(blockID)
        // console.log(getBlockAttrs(blockID))
        // console.log(getBlockByID(blockID))
   
        currentBlock = await getBlockInfoByID(blockID)

        // console.log(222,currentBlock)

        return new Protyle(app, divProtyle, {
            blockId: blockID
        });
    }

    function changeCurrent(event){
        // 下拉列表属性跟踪
        // 条件组 = conf.条件组
        currentTitle = event.detail
        let current条件 = 条件组.find(item => item.title === currentTitle)
        currentSql = current条件.sql
    }


    // 设置按钮功能区
    let isSettingActive: boolean = false
    async function 激活设置按钮() {
        isSettingActive = !isSettingActive
        isStudyActive = false
        if ( isAddConditions = true){
            isAddConditions = !isAddConditions
        }
    }


    async function 保存设置() {
        if (var1 !='' && var2 !=''){
            // 新增条件
            const isDuplicate = 条件组.some(item => item.title === var1 && item.sql === var2)
            let newConditions = {"title":var1,"sql": var2}
            if(isDuplicate){
                showMessage('已有重复的条件')
                return
            }else{
                // 如果title重复，修改原来的，如果title不重复，新增加一个
                if(条件组.some(item => item.title === var1)){
                    条件组 = 条件组.filter(item=>item.title !== var1)
                }
                条件组.push(newConditions)
                conf.条件组 = 条件组
                写入配置(conf)
                var1 = ''
                var2 = ''
            }
        }

        激活设置按钮()
    }


    // 增加条件功能区
    let isAddConditions: boolean = false
    let var1: string = ''
    let var2: string = ''
    async function 激活增加条件按钮() {
        if(isAddConditions == false){
            isAddConditions = !isAddConditions
        }
        var1 = ''
        var2 = ''
    }

    // 编辑当前条件功能区
    async function 激活编辑当前条件按钮(){
        if(isAddConditions == false){
            isAddConditions = !isAddConditions
        }
        var1 = currentTitle
        var2 = currentSql
    }

    // 删除当前条件功能区
    function 激活删除当前条件按钮(){
        // 获取当前条件标题
        条件组 = 条件组.filter(item => item.title != currentTitle)
        // console.log(条件组)
        conf.条件组 = 条件组
        写入配置(conf)
        // console.log(条件组)
        // 重置当前选项
        // TODO：bug——删除激活后下拉列表不跟手
        currentTitle = 条件组[0].title
        currentSql = 条件组[0].sql
    }

    function addCompleteWithCondition(group: object,key: string){
        // 条件组设置指定条件 增加已完成计数
        let current  = group.find(item => item.title == key)

        current['completed'] += 1
        当前已完成 += 1
        let newGroup = group.filter(item => item.title != key)
        newGroup.push(current)
        // console.log(newGroup)
        return newGroup
    }

    // 忽略当前材料
    async function 激活忽略当前材料(){
        // await setBlockAttrs(blockID,{ "custom-randomNoteType": "ignore" })
        // // 如果当前id已经加过忽略了，不重复计数
        // 条件组 = addCompleteWithCondition(条件组,currentTitle)
        // conf.条件组 = 条件组
        // 写入配置(conf)
        let aa = await convertArrToDict(currentBlock.attrs)
        console.log(aa)


        // let result = await getBlockInfoByID(blockID)
        // console.log(45555,result)
    }
    async function 测试按钮() {
        // let aa = await getStatisticalProgress(条件组,currentTitle,currentSql)
        // 条件组 = aa
        // conf.条件组 = aa
        // 写入配置(conf)
        // console.log(1112,aa)

        await addCompleteWithCondition(条件组,currentTitle)
    }

</script>

<style>
    .top {
        background-color: #f6f6f6;
    }
    .middle-child {
        display: inline-block;
        /* vertical-align: top; */
        /* float: left; */
        margin-left: 20px;
        vertical-align: top;
        width: 300px;
    }
    .left-child {
        display: inline-block;
        vertical-align: top;
        max-height: 300px;
        /* vertical-align: top; */
        /* float: left; */
        
    }

    #protyle{
        max-height: 570px;
        overflow: auto;
        z-index: 0;
    }
    #title{
        height:100%;background-color: var(--b3-theme-background);padding:6px 15px 6px;color: var(--b3-theme-on-surface);user-select:text
    }
    #dashboard{
        background-color: var(--b3-theme-background);
        padding:6px 15px 6px;
    }

</style>

<div class="b3-dialog__content" style="overflow: hidden;max-height:100%">
    <!-- <div>API demo:</div>
    <div class="fn__hr" />
    <div class="plugin-sample__time">
        System current time: <span id="time">{time}</span>
    </div> -->
    <div class="top">
        <!-- 左侧文本框，设置SQL数据 -->
        <div class="left-child">
            <!-- 下拉框 + 文本框 -->
            <!-- <BeSelect id="left-child-select" bind:value={currentSql}> -->
            <BeSelect value={currentTitle} on:change={changeCurrent}>
                {#each 条件组 as item (item.title)}
                    <BeOption style="max-height=200px" label={item.title} value={item.title} />
                {/each}
            </BeSelect>
            <div class="fn__hr" />
            <BeTextarea style="height:165px" bind:value={currentSql} rows="9" cols="40" readonly> </BeTextarea>
        </div>
        {#if isAddConditions}
            <div class="left-child">
                <!-- 下拉框 + 文本框 -->

                <BeInput type="text" bind:value={var1} placeholder="条件名称" />
                <div class="fn__hr" />
                <BeTextarea style="height:165px" bind:value={var2} rows="9" cols="40"> </BeTextarea>
            </div>
        {/if}




        
        <!-- <div>Protyle demo: id = {blockID}</div> -->
        <div class="middle-child">            
            <!-- <div class="fn__hr" /> -->
            <div>
                <BeButton size='mini' type="default" on:click={() => {isStudyActive = true;isSettingActive = false;getProtyle()}}>漫游</BeButton>
                <!-- TODO：复习将查看添加入复习队列即属性块值为queue，且due到期的块 -->
                <BeButton size='mini' type="default">复习</BeButton>
                <BeButton size='mini' type="default" on:click={激活设置按钮}>设置</BeButton>
                <BeButton size='mini' type="default" on:click={测试按钮}>测试</BeButton>
            </div>
            <div class="fn__hr" />
            {#if isSettingActive}
                <BeButton size='mini' type="default" on:click={激活增加条件按钮}>增加条件</BeButton>
                <BeButton size='mini' type="default" on:click={激活编辑当前条件按钮}>编辑当前条件</BeButton>
                <BeButton size='mini' type="default" on:click={激活删除当前条件按钮}>删除当前条件</BeButton>
                <div class="fn__hr" />
                <BeButton size='mini' type="default" on:click={保存设置}>保存</BeButton>
                <BeButton size='mini' type="default" on:click={激活设置按钮}>取消</BeButton>
            {/if}
            {#if isStudyActive}
                <BeButton size='mini' type="default" on:click={激活忽略当前材料}>忽略此材料</BeButton>
                <div class="fn__hr" />
                <!-- TODO：定义块属性值为queue，并使用fsrs定义一些周期调度的属性块 -->
                <BeButton size='mini' type="default">加入到复习队列</BeButton>
                <!-- TODO：机制跟忽略差不多，值不同而已，代表已手动将对应块放到SM -->
                <BeButton size='mini' type="default">加入到SM队列</BeButton>
            {/if}
        </div>



        <!-- 显示信息 -->
        <div class="fn__hr" />
        <div id="title">{blockID} <svg class="protyle-breadcrumb__arrow"><use xlink:href="#iconRight"></use></svg> {currentBlock.title}</div>

        <div id="dashboard">
            
            <BeForm inline>
                <BeFormItem label="进度">
                    <div style="width: 200px;padding:10px;line-height:12px" title="{当前已完成}/{查询总数}">
                        <BeProgress percentage={进度} type="line" strokWidth={20} textInside={true} color='#2fa78e'/>
                    </div>
                    
                </BeFormItem>
                <BeFormItem label="标签">
                    <div>
                        {#each currentBlock.tags as item}
                            <BeButton class='demo-button' type='default' size='mini'>{item}</BeButton>
                        {/each}
                    </div>
                </BeFormItem>
                <BeFormItem label="属性块">
                    <div>
                        {#each currentBlock.attrs as item}
                            <BeButton class='demo-button' type='default' size='mini'>{item}</BeButton>
                        {/each}
                    </div>
                </BeFormItem>
            </BeForm>
        </div>

        <div class="fn__hr" />
        <div id="protyle" bind:this={divProtyle}/>
    </div>
    
    
   

    
</div>

