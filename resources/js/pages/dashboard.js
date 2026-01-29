

import ApexCharts from "apexcharts";

/*---------------------------------------------
|  1️⃣  ESTADÍSTICAS DE VENTAS
----------------------------------------------*/
var colors = ["#F59E0B", "#22C55E"];
var dataColors = document.querySelector("#crm-project-statistics")?.dataset.colors;

if (dataColors) {
    colors = dataColors.split(",");
}

var options = {
    chart: {
        height: 350,
        type: 'bar',
        toolbar: { show: false }
    },
    plotOptions: {
        bar: {
            horizontal: false,
            endingShape: 'rounded',
            columnWidth: '30%',
        },
    },
    dataLabels: { enabled: false },
    stroke: {
        show: true,
        width: 3,
        colors: ['transparent']
    },
    colors: colors,
    series: [
        {
            name: 'Pedidos',
            data: [120, 150, 180, 160, 210, 240, 220, 250, 280, 300, 330, 310],
        },
        {
            name: 'Ventas (€)',
            data: [900, 1100, 1300, 1250, 1500, 1650, 1550, 1750, 1900, 2100, 2250, 2400],
        }
    ],
    xaxis: {
        categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    },
    legend: { offsetY: 7 },
    fill: { opacity: 1 },
    grid: {
        borderColor: '#9ca3af20',
        padding: { bottom: 5 },
    },
};

var chart = new ApexCharts(
    document.querySelector("#crm-project-statistics"),
    options
);
chart.render();

/*---------------------------------------------
|  2️⃣  OBJETIVO MENSUAL
----------------------------------------------*/
var colors = ["#FACC15", "#22C55E"];
var dataColors = document.querySelector("#monthly-target")?.dataset.colors;
if (dataColors) {
    colors = dataColors.split(",");
}

var options = {
    chart: {
        height: 280,
        type: 'donut',
    },
    legend: { show: false },
    stroke: { colors: ['transparent'] },
    series: [28, 134], // pedidos pendientes / entregados
    labels: ["Pedidos Pendientes", "Pedidos Entregados"],
    colors: colors,
    responsive: [
        {
            breakpoint: 480,
            options: {
                chart: { width: 200 },
                legend: { position: 'bottom' }
            }
        }
    ]
};

var chart = new ApexCharts(
    document.querySelector("#monthly-target"),
    options
);
chart.render();

/*---------------------------------------------
|  3️⃣  PRODUCTIVIDAD / TIPO DE PRODUCTO
----------------------------------------------*/
var colors = ["#EF4444", "#F97316", "#3B82F6", "#10B981"];
var dataColors = document.querySelector("#project-overview-chart")?.dataset.colors;
if (dataColors) {
    colors = dataColors.split(",");
}

var options = {
    chart: {
        height: 350,
        type: 'radialBar'
    },
    colors: colors,
    series: [85, 70, 80, 65],
    labels: ['Pizzas', 'Bocatas', 'Bebidas', 'Postres'],
    plotOptions: {
        radialBar: {
            track: { margin: 5 }
        }
    }
};

var chart = new ApexCharts(
    document.querySelector("#project-overview-chart"),
    options
);
chart.render();
s