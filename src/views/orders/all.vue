<template>

    <section class="all-orders">

        <h2>All Orders</h2>

       <div class="actions">

           <div class="search">

               <input type="text" placeholder="Search for the Order ID" v-model="searchString"  @click="filterType = 'search' ">

           </div>


           <div class="filters">

               <a-date-picker size="large" @change="onDateChange" format="DD-MM-YYYY"/>

           </div>

       </div>

            <transition-group name="faded" tag="section" class="all-orders-main">

                <div v-for="(order, index) in filteredOrders" :key="index" @click="openOrder(order)"  class="order-item">

                    <section class="order-item-main">

                        <h3 class="order-id">

                            {{ order.orderId }}

                            <a-icon type="ellipsis" />

                        </h3>

                    </section>


                </div>

            </transition-group>
            

    </section>

</template>

<script>

   
    var moment = require('moment');

    import Vue from 'vue';
    import VueFirestore from 'vue-firestore'
    Vue.use(VueFirestore)
    import firestore from '@/components/firebaseInit';


    

    export default {

        name: 'AllOrders',

        data: () => ({

            allOrders: null,

            ordersByDate: '',

            searchString: "",

            filterType: "search"

        }),

        computed:{

            searchByOrderId(){

                if(this.allOrders){

                    return this.allOrders.filter( order => {

                        return order.orderId.match(this.searchString)

                    })

                }

            },

            searchByOrderDate(){

                return this.ordersByDate

            },

            filteredOrders(){

                if(this.filterType === "search"){

                    return this.searchByOrderId

                }else{

                    return this.searchByOrderDate

                }

            },

            ordersGroupByDate(){


                // this gives an object with dates as keys
                const groups = this.allOrders.reduce((groups, order) => {

                    const date = moment(order.date).format('MMM');

                    if (!groups[date]) {
                        groups[date] = [];
                    }
                    groups[date].push(order);

                    return groups;

                }, {});

                const groupArrays = Object.keys(groups).map((date) => {

                    return {
                        date,
                        orders: groups[date]
                    };
                });

                return groupArrays

            }

        },

        mounted(){

            // SET RESTAURANT NAME
            this.$store.commit("setRestaurantName");


            const RESTID =  localStorage.getItem("restaurantId")

            firestore.collection('customers').doc(RESTID).onSnapshot( snapshot =>  {

                let orders = snapshot.data().orders;

                // order desc
                orders.sort(function(a,b){

                    return new Date(b.date.seconds) - new Date(a.date.seconds);

                });


                // Set the orders
                this.allOrders = orders


            });


        },


        methods:{

            onDateChange(date, dateString) {

                // CLEAR SEARCH STRING
                this.searchString = '';

                this.filterType = 'date';

                // FORMAT INPUT DATE
                let formatedDate = moment(date).format("DD-MM-YYYY");

                // FILTER BY DATE
                let filteredByDate =  this.allOrders.filter( order => {

                    let d = moment(order.date).format("DD-MM-YYYY");

                    return d === formatedDate

                })

                this.ordersByDate = filteredByDate;

            },

            openOrder(order){

                console.log(order)
            },

            formatDate(date){

                let newDate = new Date(date * 1000);

                return moment(newDate).locale('it').fromNow();

            }

        }
    }
</script>

<style lang="scss">


    .all-orders{

        float: left;

        width: 100%;

        padding: 20px;


        .actions{

            float: left;

            width: 100%;

            display: flex;

            align-items: center;


            .search{

                float: left;

                input{

                    min-width: 350px;

                    padding: 10px;

                    border: 1px solid #ccc;

                    border-radius: 50px;

                }

            }


            .filters{

                margin-left: auto;

                display: flex;

                align-items: center;

                .ant-input{

                    border-color: #ccc !important;

                    border-radius: 50px !important;

                }

            }

        }


        &-main{

            float: left;

            width: 100%;

            margin-top: 40px;

            display: flex;

            flex-wrap: wrap;

        }


        .order-item{

            position: relative;

            background-color: #fff;

            border-radius: 5px;

            margin: 0 10px 30px 10px;

            display: flex;

            justify-content: center;

            transition: all 0.3s ease;

            flex:1;

            min-width: 175px;

            box-shadow: 0px 5px 25px 0 rgba(0,0,0,0.19);

            cursor: pointer;

            overflow: hidden;

            &:hover{box-shadow: inset 0 0 0 205px rgba(0,0,0,0.1);}

            &.accepted{ background: #6eff28;}

            @media all and (max-width: 540px){

                width: 100%;

                margin: 10px;
            }


            &-main {

                position: relative;

                flex: 1;

                .order-id {

                    display: flex;

                    align-items: center;

                    justify-content: space-between;

                    padding: 15px;

                    font-size: 14px;

                    margin: 0;

                    background: rgba(0, 0, 0, 0.025);

                    span {
                        font-size: 18px
                    }

                }

            }

        }

    }

</style>