import { Component, OnInit, Input, ElementRef } from "@angular/core";
import * as d3 from 'd3'


export interface pieShape{
  innerRadius: number,
  outerRadius: number
}

@Component({
  selector: "app-chart",
  templateUrl: "./chart.component.html",
  styleUrls: ["./chart.component.css"]
})
export class ChartComponent implements OnInit {
  width = 1000;
  height = Math.min(this.width, 500);

  @Input("data") data;
  @Input('type') type; // unimplemented
  @Input('pieShape') pieShape: pieShape = {
    innerRadius: Math.min(this.width, this.height) / 4 - 1, 
    outerRadius: Math.min(this.width, this.height) / 2 - 1
  };

  constructor(
    private readonly native: ElementRef
  ) {}

  ngOnInit() {
    let pie = d3
      .pie()
      .sort(null)
      .value(d => d.value);

    let arcLabel = (() => {
      const radius = (Math.min(this.width, this.height) / 2) * 0.8;
      return d3
        .arc()
        .innerRadius(radius)
        .outerRadius(radius);
    })();

    let arc = d3
      .arc()
      .innerRadius(this.pieShape.innerRadius)
      .outerRadius(this.pieShape.outerRadius);

    console.log("parsed data",this.data);

    let color = d3
      .scaleOrdinal()
      .domain(this.data.map(d => d.name))
      .range(
        d3
          .quantize(
            t => d3.interpolateSpectral(t * 0.8 + 0.1),
            this.data.length
          )
          .reverse()
      );

    let chart = (() => {
      const arcs = pie(this.data);

      const svg = d3
        .create("svg")
        .attr("viewBox", [
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        ]);

      svg
        .append("g")
        .attr("stroke", "white")
        .selectAll("path")
        .data(arcs)
        .join("path")
        .attr("fill", d => color(d.data.name))
        .attr("d", arc)
        .append("title")
        .text(d => `${d.data.name}: ${d.data.value.toLocaleString()}`);

      svg
        .append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(arcs)
        .join("text")
        .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
        .call(text =>
          text
            .append("tspan")
            .attr("y", "-0.4em")
            .attr("font-weight", "bold")
            .text(d => d.data.name)
        )
        .call(text =>
          text
            .filter(d => d.endAngle - d.startAngle > 0.25)
            .append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .text(d => d.data.value.toLocaleString())
        );

      return svg.node();
    })();

    // d3.select("body")
    //   .node()
    //   .appendChild(chart);

    console.log('chart ', this.native.nativeElement, chart)
    this.native.nativeElement.appendChild(chart)

  }
}

