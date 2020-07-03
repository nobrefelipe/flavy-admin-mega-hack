<template>

    <section class="menu-create" :class="{updating: loading}">


        <form v-on:submit.prevent="createMenuItem">

            <input type="text" placeholder="Cibo, birre, drinks" v-model="newCategory" class="form-item" required>

            <button type="submit" class="button primary">AGGIUNGERE</button>

        </form>

        <section class="menu--table">

            <div class="menu--table-body">

                <div v-for="(item, index) in categories" :key="index" class="table-row">

                    <span>{{ item }}</span>

                    <span   @click="deleteItem(index)"  class="delete">delete</span>

                </div>

            </div>

        </section>

    </section>

</template>


<script>


    import firebase from 'firebase'
    import firestore from '@/components/firebaseInit';

    const RESTID =  localStorage.getItem("restaurantId")

    export default {

        name: "create",

        data: () => ({

            baseUrlPreviewImg: null,

            loading: false,

            newCategory: ""

        }),


        mounted(){

            let vm = this;

            // SET RESTAURANT NAME
            this.$store.commit("setRestaurantName");

            this.$store.dispatch('getMenuCategories');

        },

        computed:{

             categories(){ return this.$store.state.menuCategories; },

        },

        methods: {


            async deleteItem(index){

                this.loading =  true;

                const RESTID =  localStorage.getItem("restaurantId");

                let vm = this;

                let newCategory = this.newCategory;

                let customer = firestore.collection('customers').doc(RESTID);

                // DELETE THE ITEM FROM THE DB
                await customer.update({
                    menuCategories: firebase.firestore.FieldValue.arrayRemove(vm.categories[index])
                }).then( () => {

                    vm.$store.dispatch('getMenuCategories');

                    vm.loading =  false;

                }).catch( err => {

                    console.log("error deleting", err)

                    vm.loading =  false;

                });

            },

            createMenuItem(){

                const RESTID =  localStorage.getItem("restaurantId");

                console.log(RESTID)

                let vm = this;

                vm.loading =  true;

                let newCategory = this.newCategory;

                let customer = firestore.collection('customers').doc(RESTID);

                return customer.update({
                    menuCategories: firebase.firestore.FieldValue.arrayUnion(vm.newCategory)
                }).then( () => {

                    vm.$store.dispatch('getMenuCategories');

                    this.resetForm(); //clear form automatically after successful request

                    vm.loading =  false;

                }).catch( err => {

                    console.log("error uploading", err);

                    vm.loading =  false;

                });


            },


            resetForm() {
                console.log('Reseting the form')
                var self = this; //you need this because *this* will refer to Object.keys below`

                //Iterate through each object field, key is name of the object field`
                Object.keys(this.newCategory).forEach(function(key,index) {
                    self.newCategory[key] = '';
                });
            }

        }

    }
</script>

<style lang="scss">

    .menu-create{

        float: none;

        width: 100%;

        padding: 20px;

        display: flex;

        justify-content: space-around;

        align-items: flex-start;

        &.updating{opacity: 0.3}


        .menu-image{

            display: flex;

            flex-direction: column;

        }

        .menu--table{
            margin-top: 20px;
            max-width: 300px;

            .delete{
                font-size: 12px;
                color: red;
                min-width: 0;
                display: flex;
                align-items: center;
                cursor: pointer;
            }
        }

        form{

            width: 100%;

            max-width: 500px;

            padding: 20px;

            display: flex;

            flex-direction: column;

            .form-item{

                float: left;

                width: 100%;

                padding: 10px;

                border: 1px solid #ccc;

                background: transparent;

                margin-bottom: 20px;

            }

        }




        @media all and (max-width: 500px){

            flex-direction: column;

        }

    }

</style>