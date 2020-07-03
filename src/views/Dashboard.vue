<template>

    <section class="dashboard">


        <div class="dashboard-quick-links">

            <router-link to="/open-orders">ORDENS ABERTAS</router-link>

            <router-link to="/orders/all">TODAS AS ORDENS</router-link>

            <router-link to="/menu" style="margin-left: auto;" class="button secondary">MENU</router-link>

        </div>

      <selling-charts />


    </section>

</template>

<script>

    import sellingCharts from "@/components/sellingCharts";


    export default {

        components:{sellingCharts},

        name: 'Dashboard',


        data: () => ({


        }),

        computed:{

        },

        mounted(){

            const RESTID =  localStorage.getItem("restaurantId");

            // SET RESTAURANT NAME
            this.$store.commit("setRestaurantName");



            fetch(`https://us-central1-flavy-app.cloudfunctions.net/getRestaurant?customerId=${RESTID}`, { method: 'GET'})

                .then(function (response) {

                    return response.json()


                }).then( data =>{

                    console.log(data)

                    localStorage.setItem("menuCategories", data.menuCategories);

                });

             
        },


    }
</script>

<style lang="scss">

    .dashboard{


        float: left;

        width: 100%;

        &-quick-links{

            padding: 20px;

            display: flex;

            flex-wrap: wrap;


            a{

                float: left;

                padding: 20px 30px;

                border-radius: 5px;

                margin: 0 20px 20px 0;

                background: var(--color-primary);

                color: #fff !important;

                box-shadow: -10px 10px 25px 0 rgba(0,0,0,0.13);

                transition: all .3s ease;

                &:hover{

                    background: var(--color-secondary);

                }

            }
        }

        

    }



</style>

