import { Component, AfterViewInit, OnInit } from '@angular/core';
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from "@amcharts/amcharts5/percent";
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Dark from '@amcharts/amcharts5/themes/Dark';
import { __values } from 'tslib';
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { RestService } from 'src/app/core/services/rest.service';
// import { DataService } from 'src/app/common/data.service';
import { environment } from 'src/environments/environment';
import { Time } from '@angular/common';
import { getTime } from '@amcharts/amcharts5/.internal/core/util/Time';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardserviceService } from 'src/app/core/services/dashboardservice.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent {
  dateForm!: FormGroup;
  data: any = [];
  linedata: any = [];
  values: any;
  cids: any;
  endDate: any;
  startDate: any;
  head: any
  payload:any;
  root:any;
  series:any;
  intial:boolean=true;
  chart: any;
  constructor(private restServ: RestService, private fb: FormBuilder,private dashserv:DashboardserviceService) { }


  chartFun() {
    this.restServ.post(environment.timeGraph, this.payload, {}).subscribe(res => {
      //            let values: number[] = [];
      // let cids: string[] = [];
      this.head = res.message
      this.data = res?.data.map((e: { count: any; timestamp: any; }) => ({
        date: e.timestamp,
        value: e.count
      }))
      this.dataline(this.data.length);

    })
  }

  dataline(e: any) {
    this.linedata = [];
    let cumulativeValue = 0;
  
    for (let i = 0; i < e; i++) {
      var date = new Date(this.data[i].date);
      cumulativeValue += this.data[i].value;
  
      this.linedata.push({
        date: date.getTime(),
        value: cumulativeValue
      });
    }
  
    if (this.intial) {
      this.linechart(this.linedata);
      this.intial = false;
    } else {
      let data = this.linedata;
      this.series.data.setAll(data);
  
      this.series.appear(1000);
      this.chart.appear(1000, 100);
    }
  }




  //   }
  ngAfterViewInit() {
    this.submitOnChips();
    this.dateForm = this.fb.group({
      date: ['', [Validators.required]]
    });

    // this.getDateRange();
    


  }
  submitOnChips() {
    this.dashserv.filterControl.subscribe(async res => {
      // this.chartAllData = []
      if (Object.keys(res).length != 0) {
        this.payload = res;
        // console.log("this.payload ::",this.payload);
        
        // this.sectorWise()
      }
      else{
        let res:any = {data:[],message:"Sector Wise Classification"}
        // this.chartAllData.push(res)
      }
      this.chartFun();
    })
  }

  linechart(e: any) {
    this.root = am5.Root.new("chartdiv");
    this.root._logo?.dispose();

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    // this.root.setThemes([
    //   am5themes_Dark.new(this.root)
    // ]);
    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
     this.chart = this.root.container.children.push(am5xy.XYChart.new(this.root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true,
      paddingLeft: 0
    }));
    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    let cursor = this.chart.set("cursor", am5xy.XYCursor.new(this.root, {
      behavior: "none"
    }));
    cursor.lineY.set("visible", false);


    // Generate random data
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    let value = 100;

    function generateData() {
      // value = Math.round((Math.random() * 10 - 5) + value);
      // am5.time.add(date, "day", 1);
      // return {
      //   date: date.getTime(),
      //   value: value
      // };
    }
    function generateDatas(count: number) {
      // console.log("LineData", this.linedata)

      // let data = this.linedata
      let data = [];
      // let data = []
      for (var i = 0; i < count; ++i) {
        data.push(generateData());
      }
      // console.log("Data from gneertaeDates", data)
      return data;
    }


    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    let xAxis = this.chart.xAxes.push(am5xy.DateAxis.new(this.root, {
      maxDeviation: 0.2,
      baseInterval: {
        timeUnit: "day",
        count: 1
      },
      
      renderer: am5xy.AxisRendererX.new(this.root, {
        // minorGridEnabled: true
      }),
      tooltip: am5.Tooltip.new(this.root, {})
    }));

    let yAxis = this.chart.yAxes.push(am5xy.ValueAxis.new(this.root, {
      renderer: am5xy.AxisRendererY.new(this.root, {
        pan: "zoom"
      })
    }));


    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    this.series = this.chart.series.push(am5xy.LineSeries.new(this.root, {
      name: "Series",
      xAxis: xAxis,
      yAxis: yAxis,
      stroke: am5.color('#f00'),
      width: 10,
      valueYField: "value",
      valueXField: "date",
      tooltip: am5.Tooltip.new(this.root, {
        labelText: "{valueY}"
      })
    }));


    // Add scrollbar
    // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    this.chart.set("scrollbarX", am5.Scrollbar.new(this.root, {
      orientation: "horizontal"
    }));


    // Set data
    // console.log("line data", e);

    let data = e;
    // console.log("data : ", data);
    //generateDatas(1200);
    this.series.data.setAll(data);


    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    this.series.appear(1000);
    this.chart.appear(1000, 100);
  }

  getDateRange() {
    const date = new Date();
    this.endDate = this.formatDate(date);
    // this.endDate = new Date();
    const givenDateTime = this.endDate
    const [datePart, timePart] = givenDateTime.split(" ");
    const [year, month, day] = datePart.split("-");
    const [hour, minute, second] = timePart.split(":");
    const originalDateTime = new Date(year, month - 1, day, hour, minute, second);
    // console.log("givenDateTime",originalDateTime.getTime())
    const oneHourBefore = new Date(originalDateTime.getTime() - 7 * 24 * 60 * 60 * 1000);
    this.startDate = this.formatDate(oneHourBefore)
    // this.chartFun();
  }



  formatDate(oneHourBefore: any) {
    const formattedDateTime = `${oneHourBefore.getFullYear()}-${(oneHourBefore.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${oneHourBefore.getDate().toString().padStart(2, "0")} ${oneHourBefore
        .getHours()
        .toString()
        .padStart(2, "0")}:${oneHourBefore.getMinutes().toString().padStart(2, "0")}:${oneHourBefore
          .getSeconds()
          .toString()
          .padStart(2, "0")}`;
    return formattedDateTime
  }
}