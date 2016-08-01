/**
 * Created by dd on 2016/7/27.
 */

$(function(){
    var totalV = 2,max = 1;//总的权重
    var plen = indexList.length;
    var indexList_list = [];//jQuery.extend({}, {}, indexList);
        indexList_list = JSON.parse(JSON.stringify(indexList));

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
        //console.log(parentTag);
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

        console.log(domTree);
        domTrees(domTree);
    }

    //父 showtab
    $("#showTabs .showtab-parent").on("click","span",function(){
           // alert(12);
           var isWhat = $(this).attr("isparent"),
                data = JSON.parse($(this).attr("obj"));
            console.log(data);

       });
    //子 showtab
    $("#showTabs .showtab-col").on("click","span",function(){
           // alert(12);
           var isWhat = $(this).attr("ischild"),
                data = JSON.parse($(this).attr("obj"));
            console.log(data);
       });
    
    //添加dom 树结构
    function domTrees(obj){

        //var parentList = obj.parentTag,
        //    childList = obj.childTag;

        //动态添加 tab
        $(obj).each(function(index){

            var liHtml = "";
            var i = 0;

            for(;i < obj[index].childTag.length;i++){
                liHtml += '<li id=child'+index+'_'+i+' obj='+JSON.stringify(obj[index].childTag[i])+'><a href="#">'+obj[index].childTag[i].name+'</a></li>';
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

            //$("#child"+index+"_"+i).data(obj[index].childTag[i]);
        });

        //添加事件
        $("#mainTab .dropdown").on("click",function(e){
            //e.stopPropagation();

            var data = $(this).data(),
                txt = $(this).children("a")[0].outerText,
                checked = $(this).attr("isCheck");

            console.log(data);

            var html = '<span isparent=true id=showtab-del'+data.id+' class="showtab-del" obj='+JSON.stringify(data)+'>X</span>';

            $(this).attr("isCheck",true);

            // if(checked != "true"){
                $("#showTabs .showtab-parent").empty();
                $("#showTabs .showtab-parent").html(txt+html);
                $("#showTabs .showtab-col").empty();
                afterTab(data.id,data.factor,false);
            // }
            
        });
        //子
        $(".dropdown-menu li").on("click",function(e){
            e.stopPropagation();
            var data = JSON.parse($(this).attr("obj")),
                txt = $(this).children("a")[0].outerText,
                checked = $(this).attr("isCheck");

            console.log(data);
            var html = '<span ischild=true id=showtab-del'+data.id+' class="showtab-del" obj='+JSON.stringify(data)+'>X</span>';
            $(this).attr("isCheck",true);

            // if(checked != "true"){
                $("#showTabs .showtab-col").html(txt+html);
                afterTab(data.id,data.factor,true);
            // }


            
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

            parentList.push(obj[index].totalValue);//需要计算
            var nameObj = {
                id:obj[index].id,
                name:obj[index].name
                //max:max
            }
            parentName.push(nameObj);

            var childList = [],
                childName = [];
            var childsum = Sum(obj[index].children);
            $(obj[index].children).each(function(childindex){
                var childNameObj = {
                    id:obj[index].children[childindex].id,
                    name:obj[index].children[childindex].name
                    //max:max
                }

                obj[index].children[childindex].totalValue = parseFloat(totalV / childsum * obj[index].children[childindex].totalValue).toFixed(3);
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

    function childChartDom(childchart){
        $("#mainList").html("");
        var len = childchart.length;
        var mlist = "";
        for(var i = 0;i <= len;i++){

            if(childchart[i].childList.length <= 0){
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
    //树结构切换 isChild 是否为子菜单
    function afterTab(id,obj,isChild){

        var newIndexList = JSON.parse(JSON.stringify(indexList));
            //newIndexList = indexList.concat();
        var isObj = obj;

        var idArr = [];//处理后的 新数组
        //id 数值处理
       for(var o in isObj){
           var arrObj = new Object();
           arrObj.id = parseInt(o.substring(3,o.length)),
           arrObj.value = obj[o];

            idArr.push(arrObj);
       }
       //console.log(idArr);
       for(var ind in newIndexList){



                for(var iso in idArr){
                    //判断id是否 相等
                    if(newIndexList[ind].id == idArr[iso].id){
                        console.log(newIndexList[ind].id +","+ idArr[iso].id);
                        newIndexList[ind].rate = newIndexList[ind].rate + idArr[iso].value;
                        newIndexList[ind].totalValue = newIndexList[ind].rate * indexList[ind].innerValue;
                    }
                    if(isChild){

                        $(newIndexList[ind].children).each(function(index){
                            if(newIndexList[ind].children[index].id == idArr[iso].id){

                                console.log("PPP,"+newIndexList[ind].children[index].id +","+ idArr[iso].id);

                                newIndexList[ind].children[index].rate = newIndexList[ind].children[index].rate + idArr[iso].value;
                                newIndexList[ind].children[index].totalValue = newIndexList[ind].children[index].rate * indexList[ind].children[index].innerValue;

                            }
                        });
                    }
            }

       }
        Number(newIndexList);
    }
    //一级 图
    function parentChart(obj){
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
        var myChart1 = echarts.init(document.getElementById(id));
        option1 = {
            title: {
                show:false,
                text: '二级'
            },
            tooltip: {},
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



