import { onMount, onCleanup, createEffect, type JSX } from "solid-js";
import Plotly from "plotly.js-dist-min";

interface LineChartProps {
    data: { x: Date; y: number }[]; // array of points
    label?: string;
    title?: string;
}

export default function LineChart(props: LineChartProps): JSX.Element {
    let container: HTMLDivElement | undefined;
    let layout: Partial<Plotly.Layout>;

    onMount(() => {
        if (!container) return;

        const trace: Plotly.Data = {
            x: props.data.map(p => p.x),
            y: props.data.map(p => p.y),
            mode: "lines" as const, // <-- fix here
            // type: "scattergl" as const, // scattergl doesn't work with rangeslider as of yet
            type: "scatter",
            name: props.label || "Dataset",
            line: { color: "rgba(75,192,192,1)" },
            marker: { color: "rgba(75,192,192,1)" },
        };


        layout = {
            paper_bgcolor: 'rgb(19, 22.5, 30.5)',  // dark background for the chart canvas
            plot_bgcolor: 'rgb(19, 22.5, 30.5)',
            title: { text: props.title || "" },  // <-- fix here
            xaxis: { showgrid: true, rangeslider: { visible: true }, type: "date" },
            yaxis: { range: [0, 1], visible: false, fixedrange: true },
            margin: { t: 40, l: 40, r: 20, b: 40 },
            autosize: true
        };


        Plotly.newPlot(container, [trace], layout, { responsive: true, displaylogo: false, displayModeBar: false });
        container.setAttribute("style", "height: 100%")
    });

    createEffect(() => {
        if (!container) return;

        // Update the trace with new data
        const x = props.data.map(p => p.x);
        const y = props.data.map(p => p.y);


        Plotly.update(container, { x: [x], y: [y] }, {}, [0]);

    });

    onCleanup(() => {
        if (container) Plotly.purge(container);
    });

    return <div ref={container}></div>;
}
