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
    import { getBlockInfoByID } from "./js/query.js"

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
    



    
    async function getProtyle() {
        // let sql = "SELECT * FROM blocks ORDER BY RANDOM () LIMIT 1;";
        let blocks: Block[] = await query(currentSql);
        // console.log(blocks)
        if(blocks.length === 0){
            showMessage("查询为空")
            return
        }
        blockID = blocks[0].id;
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
    let areaRead: boolean = true
    async function 激活设置按钮() {
        isSettingActive = !isSettingActive
        areaRead = !areaRead
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
                {#each 条件组 as item}
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
                <BeButton size='mini' type="default" on:click={getProtyle}>新材料</BeButton>
                <BeButton size='mini' type="default">复习</BeButton>
                <BeButton size='mini' type="default">忽略此材料</BeButton>
                <BeButton size='mini' type="default" on:click={激活设置按钮}>设置</BeButton>
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
        </div>



        <!-- 显示信息 -->
        <div class="fn__hr" />
        <div id="title">{blockID} <svg class="protyle-breadcrumb__arrow"><use xlink:href="#iconRight"></use></svg> {currentBlock.title}</div>

        <div id="dashboard">
            
            <BeForm inline>
                <BeFormItem label="进度">
                    <div style="width: 200px;padding:10px;line-height:12px" title="{blockID}">
                        <BeProgress percentage={70} type="line" strokWidth={20} textInside={true} color='#2fa78e'/>
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

