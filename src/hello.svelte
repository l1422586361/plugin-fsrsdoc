<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { version, sql as query } from "@/api";
    import { showMessage, fetchPost, Protyle } from "siyuan";
    import BeTextarea from '@brewer/beerui/be-textarea';

    export let app;

    let time: string = "";
    let ver: string = "";

    let divProtyle: HTMLDivElement;
    let protyle: any;
    let blockID: string = '';
    let sql: string = 'SELECT * FROM blocks ORDER BY RANDOM () LIMIT 1;';

    onMount(async () => {
        ver = await version();
        fetchPost("/api/system/currentTime", {}, (response) => {
            time = new Date(response.data).toString();
        });
        protyle = await initProtyle();
    });

    onDestroy(() => {
        showMessage("Hello panel closed");
        protyle.destroy();
    });

    async function initProtyle() {
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
            <select id="left-child-select">
                <option value="条件a">条件a</option>
                <option value="条件a">条件b</option>
                <option value="条件a">条件c</option>
                <option value="条件a">条件d</option>
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
                
                <button on:click={initProtyle}>测试</button>
            </div>
            <div class="fn__hr" />
            {#if isSettingActive}
                    <button on:click={激活设置按钮}>保存</button>
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

