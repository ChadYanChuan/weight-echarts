/**
 * Created by dd on 2016/7/27.
 */

$(function(){
    var totalV = 2,max = 1.1;//总的权重
    var plen = indexList.length;
    var indexList_list = [];
        indexList_list = JSON.parse(JSON.stringify(indexList)),
        indexListAfterTab = [],//用于保存计算后 原有数据 一级
        childListAfterTab = [];//子对象 数据保存


    //dom树 层级数据处理
    function tagListNum(){
        var parentTag = [],
            noParentTag = [],
            domTree = [];//最终结构 数据
        for(var  tl in tagList){
            //一级数据
            if(tagList[tl].parent == 0){
                parentTag.push(tagList[tl]);
            }else{
                noParentTag.push(tagList[tl]);
            }
        }
        
        $(parentTag).each(function(index){
            var tree = {},childTag = [];

            $(noParentTag).each(function(ind){
                if(parentTag[index].id == noParentTag[ind].parent){
                    childTag.push(noParentTag[ind]);
                }
            });

            tree = {
                parentTag:parentTag[index],
                childTag:childTag
            }
            domTree.push(tree);
        });

        
        domTrees(domTree);
    }


    //父 showtab
    $(document).on("click","#showTabs .showtab-parent span",function(){

           var isWhat = $(this).attr("isparent"),
                data = JSON.parse($(this).attr("obj")),
                tabid = ($(this).attr("id")).substring(4,10),
                parentAllAfterTab = [];//根据父级 删除所有自己

           console.log(data);
            $(this).parent().parent().remove();
            $("#"+tabid).attr("isAdd",false);
            $($("#"+tabid+" .dropdown-menu li")).each(function(index){
                $(this).attr("isAdd",false);

            });
            var childPar = [];
            $($(this).parent().next().children("div")).each(function (index){
                parentAllAfterTab.push(JSON.parse($(this).children("span").attr("obj")));
                childPar.push(parentAllAfterTab[index].factor);
            });

           deleteTabs(subId(data.factor));

           deleteTabs2(subId2(childPar));//子级 同时删除

           afterTab(data.id,data.factory,false);

       });
    //子 showtab
    $(document).on("click","#showTabs .showtab-cols .showtab-col  span",function(){

           var isWhat = $(this).attr("ischild"),
                data = JSON.parse($(this).attr("obj")),
               tabid = ($(this).attr("id")).substring(4,10);

           $(this).parent().remove();
           $("#"+tabid).attr("isAdd",false);
            console.log(data);
        deleteTabs2(subId(data.factor));
        afterTab(data.id,data.factory,true);
       });

    //添加dom 树结构
    function domTrees(obj){

        //动态添加 tab
        $(obj).each(function(index){

            var liHtml = "";
            var i = 0;

            for(;i < obj[index].childTag.length;i++){
                liHtml += '<li id=cd-'+index+'_'+i+' obj='+JSON.stringify(obj[index].childTag[i])+'><a href="#">'+obj[index].childTag[i].name+'</a></li>';
            }

            //二级
            var childHtml = '<ul class="dropdown-menu">'+liHtml+'</ul>';
            //一级
            var tabhtml = '<li class="dropdown" id=tab'+index+' tabid='+obj[index].parentTag.id+' parent='+obj[index].parentTag.parent+'>' +
                '<a href="#" class="dropdown-toggle" data-toggle="dropdown">'+obj[index].parentTag.name+'<b class="caret"></b></a>' +
                childHtml+
                '</li>';


            $("#mainTab").append(tabhtml);
            $("#tab"+index).data(obj[index].parentTag);

        });

        //添加事件
        $("#mainTab .dropdown").on("click",function(e){

            var data = $(this).data(),
                txt = $(this).children("a")[0].outerText,
                checked = $(this).attr("isCheck"),
                isAdd = $(this).attr("isAdd"),
                willDelId = $(this).attr("id");

            var html = '<span isparent=true id=del-'+willDelId+' class="showtab-del" obj='+JSON.stringify(data)+'>X</span>';

            var ht = '<div class="showtab-row">' +
                        '<div id="showtab-par-del'+data.id+'" class="showtab-parent">'+txt+html+'</div>' +
                        '<div class="showtab-cols">' +

                        '</div>' +
                    '</div>'
            $(this).attr("isCheck",true);
            $(this).attr("isAdd",true);
            
            if(isAdd != "true"){
                $("#showTabs ").append(ht);
            }
            
            afterTab(data.id,data.factor,false);
        });
        //子
        $(".dropdown-menu li").on("click",function(e){
            e.stopPropagation();
            var data = JSON.parse($(this).attr("obj")),
                txt = $(this).children("a")[0].outerText,
                checked = $(this).attr("isCheck"),
                isAdd = $(this).attr("isAdd"),
                willDelId = $(this).attr("id");;

            console.log(data);
            var html = '<div class="showtab-col ">'+txt+'<span ischild=true id=del-'+willDelId+' class="showtab-del" obj='+JSON.stringify(data)+'>X</span></div>';
            $(this).attr("isCheck",true);
            $(this).attr("isAdd",true);

            if(isAdd != "true"){
                $("#showtab-par-del"+data.parent).next().append(html);
            }
            afterTab(data.id,data.factor,true);

        });
    }

    //初始化
    function init(){
        tagListNum();
        Number(indexList_list);
    }
    //数据处理
    function Number(obj){
        //一级
        var parent = {},//一级列表 对象
            parentList = [],
            parentName = [],
            child = {},
            childchart = [];//记录图标个数

        //求和 一级
        var sum = Sum(obj);
        $(obj).each(function(index) {

            obj[index].totalValue = parseFloat(2 / sum * obj[index].totalValue).toFixed(3);

            if(indexListAfterTab){
                //--------------------
                $(indexListAfterTab).each(function(i){
                    if(obj[index].id == indexListAfterTab[i].id){
                        obj[index].totalValue = indexListAfterTab[i].totalValue;
                        
                    }
                });

            }

            parentList.push(obj[index].totalValue);//需要计算
            var nameObj = {
                id:obj[index].id,
                name:obj[index].name,
                max:max
            }
            parentName.push(nameObj);

            var childList = [],
                childName = [];
            var childsum = Sum(obj[index].children);
            $(obj[index].children).each(function(childindex){

                var childNameObj = {
                    id:obj[index].children[childindex].id,
                    name:obj[index].children[childindex].name,
                    max:max
                }
                obj[index].children[childindex].totalValue = parseFloat(totalV / childsum * obj[index].children[childindex].totalValue).toFixed(3);

                if(childListAfterTab){
                    //--------------------
                    $(childListAfterTab).each(function(i){
                        if(obj[index].children[childindex].id == childListAfterTab[i].id){
                            obj[index].children[childindex].totalValue = childListAfterTab[i].totalValue;

                        }
                    });

                }

                childList.push(obj[index].children[childindex].totalValue);
                childName.push(childNameObj);
            });

            var childchar = {
                childList:childList,
                childName:childName
            }
            childchart.push(childchar);
        });
        parent = {
            parentList:parentList,
            parentName:parentName
        };


        parentChart(parent);
        childChartDom(childchart);
    }

    function childChartDom(obj){
        $("#mainList").html("");
        var mlist = "";
        var childchart = obj;
        var len = childchart.length;
        for(var i = 0;i < len;i++){
            if(childchart[i].childList != "undefined" && childchart[i].childList.length <= 0){
                continue;
            }
            mlist = '<div id=list'+i+' class="mlist"></div>';
            $("#mainList").append(mlist);
            childChart("list"+i,childchart[i]);//二级权重图
        }
    }
    function Sum(obj){
        var s = 0;
        for(var par in obj){
            s += parseFloat(obj[par].totalValue);
        }
        return s;
    }
    function deleteTabs(obj){
        console.log(obj);

        var willDel = obj;

        for(var i = 0;i < willDel.length;i++){

            for(var j = 0;j < indexListAfterTab.length;j++){

                if(indexListAfterTab[j].id == willDel[i].id){
                    indexListAfterTab.splice(j);
                    //continue;
                }

            }
        }
    }

    function deleteTabs2(obj){
        console.log(obj);
        var willDel = obj;//.concat(childListAfterTab);

        for(var i = 0;i < willDel.length;i++){

            for(var j =0;j < childListAfterTab.length;j++){
                if(childListAfterTab[j].id == willDel[i].id){
                    //console.log(childListAfterTab[j].id +","+ willDel[i].id);
                    childListAfterTab.splice(j);
                    continue;
                }
            }
        }
    }
    //id获取 净化...
    function subId(obj){
        var isObj = obj;
        var idArr = [];//处理后的 新数组
        //id 数值处理
        for(var o in isObj){
            var arrObj = new Object();
            arrObj.id = parseInt(o.substring(3,o.length)),
                arrObj.value = isObj[o];

            idArr.push(arrObj);
        }
        return idArr;
    }
    function subId2(arr){
        var arrs = arr;
        var idArr = [];//处理后的 新数组
        //id 数值处理
        for(var i = 0;i < arrs.length;i++){
            var isObj = arrs[i];
            for(var o in isObj){
                var arrObj = new Object();
                arrObj.id = parseInt(o.substring(3,o.length)),
                    arrObj.value = isObj[o];

                idArr.push(arrObj);
            }
        }

        return idArr;
    }

    //树结构切换 isChild 是否为子菜单
    function afterTab(id,obj,isChild){

        var newIndexList = JSON.parse(JSON.stringify(indexList));
        var idArr = subId(obj);
       //console.log(idArr);
       for(var ind in newIndexList){

                for(var iso in idArr){
                    //判断id是否 相等
                    if(newIndexList[ind].id == idArr[iso].id){
                        console.log(newIndexList[ind].id +","+ idArr[iso].id);
                        newIndexList[ind].rate = newIndexList[ind].rate + idArr[iso].value;
                        newIndexList[ind].totalValue = newIndexList[ind].rate * indexList[ind].innerValue;

                        newIndexList[ind].isNumer = newIndexList[ind].id;

                        //放入新数组
                        indexListAfterTab.push(newIndexList[ind]);
                    }
                    if(isChild){

                        $(newIndexList[ind].children).each(function(index){
                            if(newIndexList[ind].children[index].id == idArr[iso].id){

                                console.log("PPP,"+newIndexList[ind].children[index].id +","+ idArr[iso].id);

                                newIndexList[ind].children[index].rate = newIndexList[ind].children[index].rate + idArr[iso].value;
                                newIndexList[ind].children[index].totalValue = newIndexList[ind].children[index].rate * indexList[ind].children[index].innerValue;
                                //放入新数组
                                childListAfterTab.push(newIndexList[ind].children[index]);
                            }
                        });
                    }
            }

            
            
       }

        // 数组去重 一级
        if(indexListAfterTab && indexListAfterTab.length > 1){
            indexListAfterTab = unique(indexListAfterTab);
        }
        //数据去重 二级
        if(childListAfterTab && childListAfterTab.length > 1){
            childListAfterTab = unique(childListAfterTab);
        }
        // Number(indexListObj);
        Number(newIndexList);
    }
    function unique(argument) {
        var c = [];
        for(var i = 0,l = argument.length;i < l;i++){

            for(var j = (i+1);j < l;j++){
                if(argument[i].id === argument[j].id) j = ++i;
            }

            c.push(argument[i]);
        }
        return c;
    }
    //一级 图
    function parentChart(obj){
        // indexListAfterTab = [];
        var myChart = echarts.init(document.getElementById('main'));
        myChart.clear();
        option = {
            title: {
                text: ''
            },
            tooltip: {
                show:false
            },
            legend: {
                show:false,
                data: ['权重1']
            },
            radar: {
                // shape: 'circle',
                indicator: obj.parentName
            },
            series: [{
                name: 'test',
                type: 'radar',
                // areaStyle: {normal: {}},
                data : [
                    {
                        value : obj.parentList,
                        name : '权重1',
                        label: {
                            normal: {
                                show: true,
                                formatter:function(params) {
                                    return params.value;
                                }
                            }
                        }
                    }

                ]
            }],
            color: ['#61a0a8', '#d48265', '#91c7ae','#749f83']
        };
        myChart.setOption(option);
    }
    //二级 图
    function childChart(id,obj){
        // indexListAfterTab = [];
        var myChart1 = echarts.init(document.getElementById(id));
        option1 = {
            title: {
                show:false,
                text: '二级'
            },
            tooltip: {
                show:false
            },
            legend: {
                show:false,
                data: ['权重1']
            },
            radar: {
                // shape: 'circle',
                indicator: obj.childName,
                nameGap:10
            },

            series: [{
                name: 'test',
                type: 'radar',
                // areaStyle: {normal: {}},
                data : [
                    {
                        value : obj.childList,
                        name : '权重1',
                        label: {
                            normal: {
                                show: true,
                                formatter:function(params) {
                                    return params.value;
                                }
                            }
                        }
                    }

                ]
            }],
            color: ['#61a0a8', '#d48265', '#91c7ae','#749f83']
        };
        myChart1.setOption(option1);
    }
    
    init();
});



//})();



