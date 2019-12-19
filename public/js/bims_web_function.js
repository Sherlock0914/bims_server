var barChart;
var GAUGERANGECOLOR = new Array();
var DPM =[]; //Sherlock add;

function BarChart() {
    var dom = document.getElementById("bar-chart");
    //using dark style
    var barChart = echarts.init(dom);
    option = null;
    var bar_config = {
        rotate: 90,
        align: 'left',
        verticalAlign: 'middle',
        position: 'insideBottom',
        distance: 12,
        onChange: function () {
            var labelOption = {
                normal: {
                    rotate: bar_config.rotate,
                    align: bar_config.align,
                    verticalAlign: bar_config.verticalAlign,
                    position: bar_config.position,
                    distance: bar_config.distance
                }
            };
            barChart.setOption({
                series: [{
                    label: labelOption
                }, {
                    label: labelOption
                }, {
                    label: labelOption
                }, {
                    label: labelOption
                }]
            });
        }
    };
    var labelOption = {
        normal: {
            show: true,
            position: bar_config.position,
            distance: bar_config.distance,
            align: bar_config.align,
            verticalAlign: bar_config.verticalAlign,
            rotate: bar_config.rotate,
            formatter: '{a} {b}: {c}',
            fontSize: 10
        }
    };
    option = {
        color: ['#006699', '#836FFF', '#228B22', '#e5323e'],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['P2', 'P3', 'P4'],
            textStyle: {
                color: 'white'
            }
        },
        grid: {
            top: '15%',
            bottom: '12%',
            left: '12%',
        },
        calculable: true,
        xAxis: [{
            type: 'category',
            axisTick: {
                show: false
            },
            axisLine: {
                lineStyle: {
                    color: 'white'
                }
            },
            data: ['利用率', '達成率', '良率']
        }],
        yAxis: [{
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: 'white'
                }
            }
        }],
        series: [{
                name: 'P2',
                type: 'bar',
                barGap: 0,
                label: labelOption,
                data: [12, 53, 95]
            },
            {
                name: 'P3',
                type: 'bar',
                label: labelOption,
                data: [34, 12, 93]
            },
            {
                name: 'P4',
                type: 'bar',
                barGap: 0,
                label: labelOption,
                data: [32, 33, 92]
            }
        ]
    };


    if (option && typeof option === "object") {
        barChart.setOption(option, true);
        barChart.setOption({
            backgroundColor: 'rgba(255, 255, 255, 0)'
        })
    }
}

function Gaugechart(num) {
    var dom = document.getElementById('gauge' + num);
    var myChart = echarts.init(dom);
    option = null;
    option = {
        tooltip: {
            formatter: function (params) {
                var res = params.data.note;
                return res;
            },
            backgroundColor: 'rgba(28,28,28,0.95)',
        },
        series: [{
            name: "",
            type: 'gauge',
            radius: 65,
            title: {
                offsetCenter: [0, '110%'],
                color: 'white', //#285de9
                textStyle: { // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    fontWeight: 'bolder',
                    fontSize: 16,
                    color: '#40E0D0',
                    shadowColor: '#fff', //默认透明
                    shadowBlur: 0
                }
            },
            axisLine: { // 坐标轴线
                lineStyle: { // 属性lineStyle控制线条样式 #145C08
                    color: getGaugeRangeColor(num - 1),
                    width: 12,
                    shadowColor: '#fff', //默认透明
                    shadowBlur: 0
                }
            },
            axisLabel: { // 坐标轴小标记
                textStyle: { // 属性lineStyle控制线条样式
                    fontSize: '80%'
                }
            },
            axisTick: { // 坐标轴小标记
                length: 5, // 属性length控制线长
                lineStyle: { // 属性lineStyle控制线条样式
                    color: '#fff',
                    shadowColor: '#fff', //默认透明
                    shadowBlur: 0
                }
            },
            splitLine: { // 分隔线
                length: 15, // 属性length控制线长
                lineStyle: { // 属性lineStyle（详见lineStyle）控制线条样式
                    width: 1,
                    color: '#fff',
                    shadowColor: '#fff', //默认透明
                    shadowBlur: 0
                }
            },
            pointer: { // 分隔线
                shadowColor: '#fff', //默认透明
                shadowBlur: 1,
                length: 30,
                width: 6,
            },
            detail: {
                formatter: '{value}%',
                backgroundColor: 'rgba(30,144,255,0.8)',
                borderWidth: 0,
                borderColor: '#285de9',
                shadowColor: '#fff', //默认透明
                shadowBlur: 0,
                fontSize: 10,
                offsetCenter: [0, '70%'], // x, y，单位px
                textStyle: { // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    fontWeight: 'bolder',
                    color: '#fff'
                }
            },
            data: [{
                value: 50,
                index: num,
                note: ""
            }]
        }]
    };

    setInterval(function () {
        //option.series[0].data[0].value = (Math.random() * 100).toFixed(2) - 0; Sherlock mark
        option.series[0].data[0].value = DPM[num-1];
        option.series[0].data[0].note = getNote(num - 1);
        option.series[0].axisLine.lineStyle.color = getGaugeRangeColor(num - 1);
        UpdateLight(num, option.series[0].data[0].value);
        option.series[0].name = "設備稼動率(1-故障時間/總時間)";
        myChart.setOption(option, true);
    }, 2000);;
    if (option && typeof option === "object") {
        myChart.setOption(option, true);
    }
}

function UpdateLight(num, value) {
    let index = num - 1;
    id = 'gauge' + num.toString() + '-light';
    value = parseInt(value) / 100;
    var color_array = getGaugeRangeColor(index);
    let color = "";

    if (value < color_array[0][0]) {
        color = color_array[0][1];
    } else if (value <= color_array[1][0]) {
        color = color_array[1][1];
    } else {
        color = color_array[2][1];
    }
    $("#" + id).css("color", color);

}

function getNote(index) {
    let note = [`<p>良品率=可用Port總數/Port安裝總數*100%<br/>Range:前一天PM 8:00~第二天AM7:59<br/><br/>資料來源:MES<br/>Green<1%<br/>Red>=1%</p>`,
        `利用率=使用中Port數量/可用Port總數*100%<br/>Range:前一天PM8:00~第二天AM8:00<br/>資料來源:MES<br/>Red>=80%<br/>Yellow>=75%<br/>Green<75%`,
        `Re-BRP率=Pass數量<Run in次數>1>/Pass總數量*100%<br/>Range:前一天PM 8:00~第二天AM7:59<br/>資料來源:MES<br/>Red>10%<br/>Yellow>=8%<br/>Green<5%`,
        `當天達成率=當天達標數量/當天Pass總量*100%<br/>Range:前一天PM 8:00~第二天AM7:59<br/>資料來源:MES<br/>Green>=95%<br/>Yellow>=90%<br/>Red<90%`,
        `周達成率=當周達標數量/當周Pass總量*100%<br/>Range:週一PM 8:00~下週一AM7:59<br/>資料來源:MES<br/>Green>=95%<br/>Yellow>=90%<br/>Red<90%`,
        `月達成率=當月達標數量/當月Pass總量*100%<br/>Range:上月1號AM 8:00~下月1號AM7:59<br/>資料來源:MES<br/>Green>=95%<br/>Yellow>=90%<br/>Red<90%`,
        `當天良率=Pass/(FAIL+PASS)*100%<br/>Range:前一天AM8:00~第二天AM7:59<br/>資料來源:MES<br/>Green>=95%<br/>Yellow>=93%<br/>Red<93%`,
        `周良率=Pass/(FAIL+PASS)*100%<br/>Range:週一PM 8:00~下週一AM7:59<br/>資料來源:MES<br/>Green>=95%<br/>Yellow>=93%<br/>Red<93%`,
        `月良率=Pass/(FAIL+PASS)*100%<br/>Range:上月1號AM 8:00~下月1號AM7:59<br/>資料來源:MES<br/>Green>=95%<br/>Yellow>=93%<br/>Red<93%`
    ];
    return note[index];
}

function setGaugeRangeColor() {
    GAUGERANGECOLOR[0] = [
        [0.01, '#9ACD32'],
        [0.5, '#CD3333'],
        [1, '#CD3333']
    ];
    GAUGERANGECOLOR[1] = [
        [0.75, '#9ACD32'],
        [0.8, '#FFC125'],
        [1, '#CD3333']
    ];
    GAUGERANGECOLOR[2] = [
        [0.05, '#9ACD32'],
        [0.1, '#FFC125'],
        [1, '#CD3333']
    ];
    GAUGERANGECOLOR[3] = [
        [0.9, '#CD3333'],
        [0.95, '#FFC125'],
        [1, '#9ACD32']
    ];
    GAUGERANGECOLOR[4] = [
        [0.9, '#CD3333'],
        [0.95, '#FFC125'],
        [1, '#9ACD32']
    ];
    GAUGERANGECOLOR[5] = [
        [0.9, '#CD3333'],
        [0.95, '#FFC125'],
        [1, '#9ACD32']
    ];
    GAUGERANGECOLOR[6] = [
        [0.93, '#CD3333'],
        [0.95, '#FFC125'],
        [1, '#9ACD32']
    ];
    GAUGERANGECOLOR[7] = [
        [0.93, '#CD3333'],
        [0.95, '#FFC125'],
        [1, '#9ACD32']
    ];
    GAUGERANGECOLOR[8] = [
        [0.93, '#CD3333'],
        [0.95, '#FFC125'],
        [1, '#9ACD32']
    ];
}

function getGaugeRangeColor(index) {
    return GAUGERANGECOLOR[index];
}
//Sherlock add begin
function getDPM(forEach){
    return $.ajax({
        data: {},
        url: 'http://localhost:55688/bims/api/All/KS?site=P3',
        dataType: 'json',
        timeout: 4000,
        success: function (data) {
                DPM.push(data.port_yield)
                DPM.push(data.port_util)
                DPM.push(data.re_brp)
                DPM.push(data.on_target_day)
                DPM.push(data.on_target_week)
                DPM.push(data.on_target_month)
                DPM.push(data.fpy_day)
                DPM.push(data.fpy_week)
                DPM.push(data.fpy_month)
        },
        error: function (jqXHR, textStatus, errorThrown) {}
    });
}
//Sherlock add end