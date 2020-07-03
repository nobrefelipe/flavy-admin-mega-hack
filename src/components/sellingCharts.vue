<template>

     <div class="chats">

        <h2>Gráficos de vendas</h2>

        <div class="chart-container">
            
            <div id="hamburgers-chart"></div>

        </div>

        <div class="chart-container">

            <div id="best-sellers-chart"></div>

        </div>

    </div>
    
</template>

<script>
    var moment = require("moment");

    // Import Chart plugin
    import { Chart } from "frappe-charts/dist/frappe-charts.esm.js";
    import "frappe-charts/dist/frappe-charts.min.css";

    /*
        Chart Data
        lets fake some data for now
        TODO: importar os dados de vendadas reais. Nao vai dar tempo de fazer real para o hackaton. 
    */

   //HanburgersChart
    const HanburgersChartData = {
        labels: [
            "há 5 dias",
            "há 4 dias",
            "há 3 dias",
            "há 2 dias",
            "antes de ontem",
            "ontem",
            "hoje"
        ],
        datasets: [
            {
                name: "Essa semana",
                values: [250, 400, 300, 350, 80, 520, 170]
            },
        ]
    };


    //bestSellersChart
    const bestSellersChartData = {
        labels: [
            "há 5 dias",
            "há 4 dias",
            "há 3 dias",
            "há 2 dias",
            "antes de ontem",
            "ontem",
            "hoje"
        ],
        datasets: [
            {
                name: "Vegetariano",
                values: [25, 40, 30, 25, 8, 22, 17]
            },
            {
                name: "Classico",
                values: [35, 30, 40, 35, 10, 32, 15]
            },
             {
                name: "Vegano",
                values: [10, 8, 14, 15, 8, 12, 17]
            },
        ]
    };

    export default {

        name : "sellingCharts",

        mounted(){

            const HanburgersChart = new Chart("#hamburgers-chart", {                   
                title: "Vendas totais ( R$ )",
                data: HanburgersChartData,
                type: 'axis-mixed', // or 'bar', 'line', 'scatter', 'pie', 'percentage'
                height: 250,
                colors: ['#7cd6fd', '#743ee2']
            });

            const bestSellersChart = new Chart("#best-sellers-chart", {                   
                title: "Hamburgueres Mais Vendidos",
                data: bestSellersChartData,
                type: 'bar', // or 'bar', 'line', 'scatter', 'pie', 'percentage'
                height: 250,
                colors: ['#7cd6fd', '#743ee2', "#ff0000"]
            })

        }

    };


</script>


<style lang="scss">


    .chats{

        float: left;

        width: 100%;

        display: flex;

        flex-wrap: wrap;

        justify-content: space-between;

        h2{
            width: 100%;

            padding: 20px;
        
        }

        .chart-container{

            width: 48%;

            @media all and (max-width: 1025px) {
                width: 100%;
            }

        }

        .chart{

            border-bottom: 1px solid #999;

            margin: 15px 0;

        }

        svg{
            & > text { font-size: 16px;}
        }

    }


</style>
