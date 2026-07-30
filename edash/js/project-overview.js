window.addEventListener("DOMContentLoaded", async ()=>{

    await loadHTML(

        "pages/project-overview.html",

        "#page-root"

    );

    initializeProjectOverview();

});



function initializeProjectOverview(){

    animateCards();

    createEnergyChart();

    createProductionChart();

    updateWeather();

}



function updateWeather(){

    const temp = document.getElementById("weatherTemp");

    if(temp){

        temp.innerHTML="34.6°C";

    }

}



function createEnergyChart(){

    const canvas=document.getElementById("energyChart");

    if(!canvas) return;

    new Chart(canvas,{

        type:"line",

        data:{

            labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],

            datasets:[

                {

                    label:"Production",

                    data:[8,10,12,15,13,9,11]

                },

                {

                    label:"Consumption",

                    data:[6,7,8,8,7,6,5]

                }

            ]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false

        }

    });

}



function createProductionChart(){

    const canvas=document.getElementById("productionChart");

    if(!canvas) return;

    new Chart(canvas,{

        type:"bar",

        data:{

            labels:["PV1","PV2","PV3","PV4"],

            datasets:[{

                data:[92,86,88,95]

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{

                    display:false

                }

            }

        }

    });

}