<template>

    <section class="open-orders-page">

        <nav class="filters">

            <span>Filtrar por: </span>
            <span>

                <h4>Tipo de pagamento:</h4>
                <a-select defaultValue="Select" style="width: 120px"   v-model="selectedPaymentType" @change="filter='method'">
                  <a-select-option value="all">Todos</a-select-option>
                  <a-select-option value="cash">dinheiro</a-select-option>
                  <a-select-option value="card">cartāo</a-select-option>
                </a-select>

            </span>

            <span>

                <h4>Mesa:</h4>
                <input type="number" v-model="enteredTableNumber" @keyup="filter='table'">

            </span>

            <button class="button default"  @click="filter = 'all' ;selectedPaymentType='all'; enteredTableNumber=''">Resetar</button>

        </nav>

        <transition-group name="faded" tag="section" class="view-wrapper">

            <div v-for="(order, index) in computedOrders" :key="index" @click="showModal(index, order)"  class="order-item" :class="pendingPayment(order)">

                <div class="order-item-table">Mesa <span>{{ order.tableNumber }}</span>  </div>

                <section class="order-item-main">

                        <h3 class="order-id">

                            {{ order.orderId }}

                            <span class="payment-method" :class="order.paymentMethod">{{order.paymentMethod}}</span>

                            <span>R${{ order.order_total_in_cents / 100 }}</span>

                        </h3>


                        <ol class="ordered-items">

                            <li v-for="item in order.orderItems" :key="item.title" class="ordered-item">

                                <span class="ordered-item">{{ item.amount }} x {{item.title}}</span>

                                <div class="order-custom" v-if="item.customText">

                                    <h5>Pedidos:</h5>
                                    <span>{{ item.customText }}</span>
                                </div>

                                <div class="order-custom" v-if="item.toppings.length">

                                    <h5>Adicionais:</h5>
                                    <span v-for="topping in item.toppings" :key="topping">{{ topping }}</span>

                                </div>

                            </li>

                        </ol>


                        <span class="order-time-ago">

                            <a-icon type="clock-circle" />

                            {{formatDate(order.date)}}

                        </span>

                    </section>

            </div>

        </transition-group>


        <!-- COMFIRMATION MODAL-->
        <a-modal class="accept-reject-order-modal"
                title="ACEITAR ORDEM?"
                :visible="visible"
                @ok="onRejectOrder"
                :confirmLoading="confirmLoading"
                @cancel="handleCancel"
                :okText="okText"
                cancelText="fechar"
        >
            <h3>Já inseriu a ordem no sistema ou gerou o recibo?</h3>
            <button @click="onAcceptOrder" class="button primary" style="text-transform: none">Sim, aceitar ordem.</button>

        </a-modal>

    </section>

</template>

<script>

    var moment = require('moment');

    import Vue from 'vue';
    import VueFirestore from 'vue-firestore'
    Vue.use(VueFirestore)

    import firebase from 'firebase'
    import firestore from '@/components/firebaseInit';


    export default {

        name: 'home',

        data: () => ({

            enteredTableNumber: null,

            selectedPaymentType: 'all',

            filter: 'all',

            openOrders: null,

            clickedOrder: null,

            clickedOrderIndex: null,

            visible: false,

            confirmLoading: false,

            okText: "Rejeitar a ordem",

            firecloudAPI: "https://us-central1-flavy-app.cloudfunctions.net"

        }),

        computed:{

            filterResults(){

                let selectedPaymentType = this.selectedPaymentType != 'all' ? this.selectedPaymentType : null
                let enteredTableNumber  = this.enteredTableNumber != '' ? this.enteredTableNumber : null

                return this.openOrders.filter( order => {

                    // IF PAYMENT TYPE AND TABLE NUMBER
                    if(selectedPaymentType && enteredTableNumber ){

                        return order.tableNumber === enteredTableNumber && order.paymentMethod === selectedPaymentType;

                    }

                    // IF ONLY TABLE NUMBER
                    if(!selectedPaymentType && enteredTableNumber ){

                        return order.tableNumber === enteredTableNumber

                    }

                    // IF ONLY PAYMENT TYPE
                    if(!enteredTableNumber && selectedPaymentType){

                        return order.paymentMethod === selectedPaymentType

                    }

                    // IF NONE
                    if(!enteredTableNumber && !enteredTableNumber){

                        return order

                    }


                })

            },


            computedOrders(){

                if(this.filter === "all"){

                    return this.openOrders

                }
                else{

                    return this.filterResults

                }



            },

        },

        mounted(){

            // SET RESTAURANT NAME
            this.$store.commit("setRestaurantName");


            const RESTID =  localStorage.getItem("restaurantId")

            firestore.collection('customers').doc(RESTID).onSnapshot( snapshot =>  {

                let orders = snapshot.data().orders;

                if (orders){


                    // Filter orders to show only not accepted orders
                    let filtred = orders.filter(order => {


                        return order.orderStatus === 'ordered' || order.paymentStatus === 'pending'

                    })

                    // ORDER DESC
                    filtred.sort(function(a,b){

                        return new Date(b.date) + new Date(a.date);
                    });


                    // SET THE ORDERS
                    this.openOrders = filtred;


                }


            });



        },

        methods:{

            pendingPayment(order){

                if(order.paymentStatus === "pending") return "pending"

            },

            showModal(index, order) {

                this.clickedOrder = order;
                this.clickedOrderIndex = index;
                this.visible = true

            },

            async onRejectOrder(){

                this.confirmLoading = true;

                let order = this.clickedOrder;

                const RESTID =  localStorage.getItem("restaurantId")

                let arr = firestore.collection('customers');

                let query = arr.where('orders', 'array-contains', order)

                /**
                 *
                 * STRIPE CANCEL ORDER PAYMENT
                 *
                 */

                if(order.paymentIntentID && ( order.paymentMethod === "card"  || order.paymentMethod === "PaymentRequestButton")){

                    await fetch(`${this.firecloudAPI}/stripeIntentsCancel?customerId=${RESTID}&paymentId=${order.paymentIntentID}`, { method: 'GET' });

                }


                let order_to_be_updated;

                // GET THE ORDER TO BE UPDATED
                await query.get().then(snapshot => {

                    snapshot.docs.forEach( doc => {

                        order_to_be_updated = doc.data().orders

                    })

                });


                // GET CLICKED ORDER BY ID
                let filtred = order_to_be_updated.filter(ord => {

                    return ord.orderId === order.orderId

                }).shift()// filtered returns an Array, use shift() to remove the object from it


                let customer = firestore.collection('customers').doc(RESTID);

                // DELETE THE ITEM
                customer.update({

                    orders: firebase.firestore.FieldValue.arrayRemove(filtred)

                }).then( () => {

                    // SEND PUSH NOTIFICATION
                    fetch(`${this.firecloudAPI}/sendWebPushNotification?pnToken=${order.PN_TOKEN}&orderID=${order.orderId}&restaurantId=${RESTID}&orderStatus=reject`, { method: 'GET' });

                    this.visible = false;

                    this.confirmLoading = false;

                });

            },

            handleCancel(e) {


                this.visible = false

            },

            async onAcceptOrder(){


                this.confirmLoading = true;

                this.okText = "Processing";

                let order = this.clickedOrder;

                let index = this.clickedOrderIndex;

                const RESTID =  localStorage.getItem("restaurantId")

                let arr = firestore.collection('customers');

                let query = arr.where('orders', 'array-contains', order)

                let order_to_be_updated;

                /**
                 *
                 * STRIPE CAPTURE ORDER PAYMENT
                 *
                 */

                if(order.paymentIntentID && ( order.paymentMethod === "card"  || order.paymentMethod === "PaymentRequestButton")){

                    await fetch(`${this.firecloudAPI}/stripeIntentsCapture?customerId=${RESTID}&paymentId=${order.paymentIntentID}`, { method: 'GET' });

                }


                // GET THE ORDER TO BE UPDATED
                await query.get().then(snapshot => {

                    snapshot.docs.forEach( doc => {

                        order_to_be_updated = doc.data().orders

                    })

                });


                // GET CLICKED ORDER BY ID
                let filtred = order_to_be_updated.filter(ord => {

                    return ord.orderId === order.orderId

                }).shift()// filtered returns an Array, use shift() to remove the object from it


                let customer = firestore.collection('customers').doc(RESTID);

                // DELETE THE ITEM
                customer.update({

                    orders: firebase.firestore.FieldValue.arrayRemove(filtred)

                });

                // UPDATE ORDER STATUS
                filtred.orderStatus = "accepted";

                // IF PAYMENT IS MADE BY CARD, WE CAN SET IT AS PAYED
                //if(order.paymentIntentID && ( order.paymentMethod === "card"  || order.paymentMethod === "PaymentRequestButton")){

                    filtred.paymentStatus = "payed";

                //}


                // REINSERT THE ITEM
                customer.update({

                    orders: firebase.firestore.FieldValue.arrayUnion(filtred)

                }).then( () => {

                    // SEND PUSH NOTIFICATION
                    fetch(`${this.firecloudAPI}/sendWebPushNotification?pnToken=${order.PN_TOKEN}&orderID=${order.orderId}&restaurantId=${RESTID}&orderStatus=accepted`, { method: 'GET' });

                    this.visible = false;

                    this.confirmLoading = false;


                    this.okText = "Rejeitar Ordem";

                });


            },

            formatDate(date){

               return moment(date).locale('pt').fromNow();

            },


        }
    }
</script>

<style lang="scss">


    .ant-notification{

        .ant-notification-notice{

            background: var(--color-primary);

           .ant-notification-notice-message,
           .ant-notification-notice-description{

               color: #fff;

               margin-bottom: 0;
           }

        }
    }

    .filters{

        position: sticky;

        top: 55px;

        z-index: 999;

        float: left;

        width: 100%;

        background: #fff;

        padding: 0 20px;

        display: flex;

        align-items: center;

        justify-content: flex-end;

        border-bottom: 1px solid #ededed;


        & > span{

            font-size: 12px;

            margin: 0 20px 0 0;

            display: flex;

            align-items: center;

            h4{

                margin: 0 5px 0 0;

                font-weight: 300;

            }

            @media all and (max-width: 450px){

                h4{display: none}

            }

        }


        input{

            border-radius: 40px;

            padding: 5px 10px;

            border: 1px solid #ccc;

            width: 60px;

        }

        .button{

            font-size: 14px;

            padding: 8px 15px;

        }



    }

    .accept-reject-order-modal{

        .ant-btn-primary{ background: var(--color-secondary)}

    }


    .open-orders-page{

        float: left;

        width: 100%;

        min-height: 100vh;

        color: var(--color-secondary);

        background: #868686;



        .view-wrapper{

            display: flex;

            flex-wrap: wrap;

            justify-content: space-between;


            float: left;

            width: 100%;

            min-height: auto;

            padding: 30px 15px;

            background: transparent;

            @media all and (max-width: 600px){

                padding: 30px 0;

            }

        }


        .order-item{

            display: flex;

            position: relative;

            background-color: #fff;

            border-radius: 5px;

            margin: 0 0 30px 0;

            transition: all 0.2s ease-in-out;

            width: calc(50% - 20px);

            box-shadow: -10px 10px 25px 0 rgba(0,0,0,0.13);

            cursor: pointer;

            &.pending{

                .payment-method{

                    background: red;

                    color: #fff;

                }

            }

            &:hover{

                background: var(--color-primary);

                *{ color: #fff !important;}

            }

            &.accepted{ background: #6eff28;}

            @media all and (max-width: 540px){

                width: 100%;

                margin: 10px;
            }



            .payment-method{

                border-radius: 20px;

                padding: 0 10px;

                margin: 0 0 5px 0;

                font-size: 14px !important;


                &.card{ background: green;}

            }


            &-main{

                position: relative;

                padding-bottom: 30px;

                flex:1;

                .order-id{

                    display: flex;

                    align-items: center;

                    justify-content: space-between;

                    padding: 10px 15px 0 15px;

                    font-size: 12px;

                    margin: 0 0 10px 0;

                    background: rgba(0,0,0,0.025);

                    border-bottom: 1px  solid rgba(0,0,0,0.08);

                    span{ font-size: 18px}

                }

                .order-time-ago{

                    position: absolute;

                    bottom: 8px;

                    right: 8px;

                    border: 1px solid #ccc;

                    padding: 2px 10px;

                    border-radius: 15px;

                    font-size: 12px;

                    display: flex;

                    align-items: center;

                    i{ margin-right: 5px}

                }

            }


            &-table{

                padding: 15px;

                width: 90px;

                border-right: 1px  solid rgba(0,0,0,0.08);

                background: rgba(0,0,0,0.025);

                font-size: 12px;

                display: flex;

                flex-direction: column;

                align-items: center;

                justify-content: center;

                span{

                    font-size: 28px;

                    color: var(--color-primary);

                }

            }


            .ordered-items{

                float: left;

                width: 100%;

                display: flex;

                flex-direction: column;

                margin: 0;

                padding: 0 0 0 15px;

                list-style: none;

                li{

                    padding: 5px 0;

                }

                .order-custom{

                    float: left;

                    width: 100%;

                    display: flex;

                    padding-left: 15px;


                    h5{ margin: 2px 10px 0 0;}

                    span{

                        font-size: 13px;

                       &:not(:last-of-type){

                           &:after{

                               content: ",";

                               margin-right: 5px;

                           }
                       }

                    }

                }

            }

        }

    }



</style>


<!--

res menu
[{"imageUrl":"https://hambu.it/wp-content/uploads/2018/10/Chianina-768x512.png","id":"_1czalotuk","filter":"food","price":"13","title":"Chianina","toppings":["Gorgonzola","Melenzane"],"description":"Pane Antichi Cerali, Hamburger di Chianina C.B.B.I., crema al Gorgonzola, Melanzane stufate, Schiacciata calabra e Songino","price_in_cents":1300,"slug":"chianina"},{"filter":"food","price":"14","title":"Chianina Fume ","toppings":["Burrata","Pomodori"],"description":"Pane Rex Corn, Hamburger di Chianina C.C.B.I. affumicato con metodo naturale, Stracciatella di Burrata Profumata al Basilico, Guanciale croccante e Misticanza","price_in_cents":1400,"slug":"chianina-fume","imageUrl":"https://hambu.it/wp-content/uploads/2018/10/Chianina-Fumè-768x512.png","id":"_f87h8zchj"},{"filter":"food","price":"8,50","title":"Classico","toppings":["Formaggio","Cipolla"],"description":"Pane classico, Hamburger di Manzo Nazionale, Pomodoro, Cipolla, Cetrioli, Maionese, Lattuga e Formaggio latteria","price_in_cents":850,"slug":"classico","imageUrl":"https://hambu.it/wp-content/uploads/2018/10/Classico-768x512.png","id":"_o61bvrnv8"},{"description":"Pane al Pomodoro, Hamburger di Vitello, Crema di Bufala IGP, Basilico, Pomodoro, Pesto Genovese D.O.P. senz’aglio","price_in_cents":1050,"slug":"nazionale","imageUrl":"https://hambu.it/wp-content/uploads/2018/11/Nazionale-768x512.png","id":"_baaqaypgn","filter":"food","price":"10,50","title":"Nazionale","toppings":["CremadiBufalaIGP","Aglio"]},{"toppings":["Formaggio","Cipolla","Pomodori"],"description":"Pane Noci e Nocciole, Hamburger di Manzo della Val Curone, Peperoni arrostiti, Pecorino nero, Pancetta dolce, Rucola e Crema di Peperoni","price_in_cents":1200,"slug":"curone","imageUrl":"https://hambu.it/wp-content/uploads/2018/10/Curone-768x512.png","id":"_3efej23gh","filter":"food","price":"12","title":"Curone"},{"filter":"food","price":"12","title":"Fassona","toppings":["Formaggio","Pancetta"],"description":"Pane Antichi Cereali, Hamburger di Fassona COALVI, salsa Hambù, provola dolce, lattuga iceberg, pomodori datterini e Cipolla stufata.","price_in_cents":1200,"slug":"fassona","imageUrl":"https://hambu.it/wp-content/uploads/2018/10/Fassona-768x512.png","id":"_d524erudc"},{"slug":"luganega","imageUrl":"https://hambu.it/wp-content/uploads/2018/10/Luganega-768x512.png","id":"_idn9f33k4","filter":"food","price":"12","title":"Luganega","toppings":["Formaggio","Pomodori"],"description":"Pane Crunchy Mais, Hamburger di Luganega di Monza, Robiola, Funghi Porcini scottati, Guanciale croccante, Radicchio e Aceto Balsamico.","price_in_cents":1200},{"imageUrl":"https://hambu.it/wp-content/uploads/2018/10/Ruspante-768x512.png ","id":"_1zorw3aaf","filter":"food","price":"10","title":"Ruspante ","toppings":["Formaggio","Pomodori"],"description":"Pane Crunchy Mais, Hamburger di Pollo allevato a terra, Pecorino nero, Misticanza, Cruditè di Verdure e Salsa tonnata","price_in_cents":1000,"slug":"ruspante"},{"imageUrl":"https://hambu.it/wp-content/uploads/2018/10/Salmone-768x512.png","id":"_7325cx1b5","filter":"food","price":"14","title":"Salmone","toppings":["LattugaIceberg","Rucola"],"description":"Pane Crunchy Mais, Hamburger di Salmone Norvegese, Caprino di latte vaccino, Pomodorini datterini, Cipolla stufata, Pinoli tostati e Songino","price_in_cents":1400,"slug":"salmone"},{"imageUrl":"https://hambu.it/wp-content/uploads/2018/10/Tartare-768x512.png","id":"_uchx1l2mp","filter":"food","price":"14","title":"Tartare","toppings":["Cetrioli","Pomodori","LattugaIceberg"],"description":"Pane Antichi Cereali, Tartare cruda di Fassona Piemontese COALVI condita con Olio, Pepe, Sale e Capperi, Misticanza all’aceto balsamico, Scaglie di Grana e Senape al Miele","price_in_cents":1400,"slug":"tartare"},{"toppings":["FormaggioVegano","Cipolla"],"description":"Pane Antichi cereali, Hamburger di Tofu e Seitan fresco, Crema di Peperoni, Melanzane, Zucchine grigliate profumate all’origano, Pomodori datterini e Rucola","price_in_cents":1300,"slug":"vegano","imageUrl":"https://hambu.it/wp-content/uploads/2018/10/Vegano-768x512.png","id":"_m8p6216rg","filter":"food","price":"13","title":"Vegano"},{"imageUrl":"https://hambu.it/wp-content/uploads/2018/10/Vegetariano-768x512.png","id":"_i8i8ozbdn","filter":"food","price":"13","title":"Vegetariano","toppings":["Cipolla","Formaggio","Pomodori"],"description":"Pane al Pomodoro con Semi di Papavero, Hamburger di Tofu e Verdure BIO, Pesto di Lattuga e Capperi, Zucchine e Pomodorini secchi marinati, Robiola e Foglia di Lattuga","price_in_cents":1300,"slug":"vegetariano"},{"imageUrl":"http://www.fabbricadipedavena.it/wp-content/uploads/2012/11/dolomiti_pils.png","id":"_xhfo4b21e","filter":"drink","price":"7","title":"Dolomiti Pils ","toppings":[],"description":"Birra pils di colore chiaro e dai riflessi dorati","price_in_cents":700,"slug":"dolomiti-pils"},{"imageUrl":"http://www.fabbricadipedavena.it/wp-content/uploads/2014/12/dolomiti_rossa.png","id":"_lx76f1nx6","filter":"drink","price":"7","title":"Dolomiti Rossa","toppings":[],"description":"Birra rossa di tradizione, appartenente alla categoria delle doppio malto","price_in_cents":700,"slug":"dolomiti-rossa"}]

restaurantId
"4cVrPW9qAL39DmSw5ocp"
restaurantName
"Hambu"
stripeSK
"sk_test_dw3GcF84RPxaSoeIpUjGAVAe00X91UZuZ7"
-->


