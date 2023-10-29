<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { version, sql as query } from "@/api";
    import { showMessage, fetchPost, Protyle } from "siyuan";
    // import '@brewer/beerui/assets/beer.css'
    import {
        BeTextarea

    } from '@brewer/beerui';
    import { 获取配置,写入配置 } from "./writeConfig.js";

    export let app;

    let time: string = "";
    let ver: string = "";
    let divProtyle: HTMLDivElement;
    let protyle: any;
    let conf: any;
    let blockID: string = '';




    let 条件组 = [];
    let sql: string = ''; 

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
        sql = 条件组.find(dict => dict.title ='Default')['sql'] || 'SELECT * FROM blocks ORDER BY RANDOM () LIMIT 1;'; // TODO：后面加入到设置里，初始条件
        // console.log(sql)
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
        let blocks: Block[] = await query(sql);
        blockID = blocks[0].id;
        return new Protyle(app, divProtyle, {
            blockId: blockID
        });
    }

    let isSettingActive: boolean = false
    let areaRead: boolean = true
    async function 激活设置按钮() {
        isSettingActive = !isSettingActive
        areaRead = !areaRead
    }
    async function 保存设置() {
        激活设置按钮()
    }


</script>

<style>
    .top {
        width: 100%;
        /* height: 30%; */
        position: fixed;
        top: auto;
        /* height: 200px; */
        background-color: #f6f6f6;
    }
    .right-child {
        display: inline-block;
        /* vertical-align: top; */
        /* float: left; */
        margin-left: 20px;
        vertical-align: top;
    }
    .left-child {
        display: inline-block;
        vertical-align: top;
        /* vertical-align: top; */
        /* float: left; */
        
    }
    #right-child-1 {
        display: flex;
        justify-content: space-between;
    }
    #left-child-select{
        width: 100%;
    }
    #protyle{
        height: 70%;
        width: 100%;
        position: absolute;
        top: 240px;
        /* margin-top: 200px; */
        overflow: auto;
    }
    /* p{
        font-size: 20px;
    } */
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
            <!-- 下拉框 -->

            <select id="left-child-select" bind:value={sql} >
                <option label="default" disabled hidden>Select an option</option>
                {#each 条件组 as item(item.title,item.sql)}
                    <option label="{item.title}" value="{item.sql}"/>
                {/each}
            </select>
            <div class="fn__hr" />
            <BeTextarea bind:value={sql} rows="9" cols="40" bind:readonly={areaRead}> </BeTextarea>
        </div>
        
        <!-- <div>Protyle demo: id = {blockID}</div> -->
        <div class="right-child">  
            <!-- 右侧 -->
            <div id="right-child-1">
                <p>当前： name</p>
                <button>复制</button>
                <p>-/--</p>
            </div>
            <div class="fn__hr" />
            <div>
                <button>新材料</button>
                <button>复习</button>
                <button>忽略此材料</button>
                <button on:click={激活设置按钮}>设置</button>
                
                <button on:click={getProtyle}>测试</button>
            </div>
            <div class="fn__hr" />
            {#if isSettingActive}
                    <button on:click={保存设置}>保存</button>
                    <button on:click={激活设置按钮}>取消</button>
            {:else}
                <button on:click={激活设置按钮} style="display: none">保存</button>
                <button on:click={激活设置按钮} style="display: none">取消</button>
            {/if}
        </div>
    </div>
    
    
    <div class="fn__hr" />
    <div class="fn__hr" />
    <div id="protyle" bind:this={divProtyle}/>
    
</div>

