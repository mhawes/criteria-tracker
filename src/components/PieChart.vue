<template>
  <Pie :data="chartData" />
</template>

<script setup lang="ts">
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, ArcElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, ArcElement)

const chartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Unknown'],
  datasets: [
    {
      label: 'Sales',
      data: [10, 20, 15, 5],
      backgroundColor: [
        'green',
        'red',
        'blue',
        'grey'
      ],
      hoverOffset: 4
    }
  ]
}
</script>
