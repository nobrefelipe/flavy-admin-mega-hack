<template>

    <section class="menu-create" :class="{updating: loading}">

       <div class="menu-image">

           <img :src="previewImg" height="200">
           <button id="upload_widget" class="button outlined">Upload image</button>

       </div>

        <form v-on:submit.prevent="updateMenuItem">
            
            Name
            <input type="text" placeholder="title" v-model="computedMenuItem.title" class="form-item" required>

            Description
            <input type="text" placeholder="description" v-model="computedMenuItem.description" class="form-item" required>

            Allergens
            <input type="text" placeholder="allergens" v-model="computedMenuItem.allergens" class="form-item">
            
            Price
            <input type="text" placeholder="price" v-model="computedMenuItem.price" class="form-item" required>
            
            <input type="hidden" placeholder="imageUrl" v-model="computedMenuItem.imageUrl" class="form-item" >

            Toppings
            <input type="text" placeholder="toppings" v-model="computedMenuItem.toppings" class="form-item">

            Category
            <select name="filter"  v-model="computedMenuItem.filter" class="form-item" required>

                <option selected>Filter</option>
                <option v-for="category in categories" :key="category" :value="category">{{category}}</option>

            </select>

            Priority
            <input type="number" placeholder="priority" v-model="menuItem.priority" class="form-item">

            <label for="outOfStock">

                <a-switch id="outOfStock" :checked="computedMenuItem.outOfStock" @change="setOutOfStock"/>

                Out of stock

            </label>

            <button type="submit" class="button primary">
                <a-icon v-if="loading" type="loading" />
                UPDATE
            </button>

        </form>





    </section>

</template>

<script>


    import firebase from 'firebase'
    import firestore from '@/components/firebaseInit';

    const RESTID =  localStorage.getItem("restaurantId")

    export default {

        name: "update",

        data: () => ({

            baseUrlPreviewImg: null,

            menuItemRef: null,

            loading: false,

            menuItem: {

                id: '',
                title: "",
                slug: "",
                description: "",
                allergens: " ",
                price: "",
                price_in_cents: null,
                imageUrl: "",
                priority: "",
                filter: "",
                outOfStock: false,
                toppings: ""

            }

        }),


        computed:{

            categories(){ return localStorage.getItem("menuCategories").split(','); },

            computedMenuItem(){

                return this.menuItem

            },

            previewImg(){

                return this.baseUrlPreviewImg

            }

        },


        mounted(){

            let vm = this;

            // SET RESTAURANT NAME
            this.$store.commit("setRestaurantName");

            // CLOUDINARY INIT UPLOAD
            var myWidget = cloudinary.createUploadWidget({
                    cloudName: 'flavy',
                    uploadPreset: 'ml_default',
                    cropping: true,
                    folder: RESTID
                }, (error, result) => {
                    if (!error && result && result.event === "success") {
                        console.log('Done! Here is the image info: ', result.info);

                        vm.menuItem.imageUrl = result.info.path;
                        vm.baseUrlPreviewImg = `https://res.cloudinary.com/flavy/image/upload/c_scale,w_250/${result.info.path}`;

                    }
                }
            );

            document.getElementById("upload_widget").addEventListener("click", function(){
                myWidget.open();
            }, false);


            // All menu items
            let menu = localStorage.getItem("restaurantMenu");
                menu =  JSON.parse(menu);


           // Get the current menu item by id
           let menuItem =  menu.filter( item => {

                return item.id === vm.$route.params.id

            })[0]


            // THE REFERENCE TO CURRENT MENU ITEM TO BE UPDATED (DELETED) LATER
            this.menuItemRef = menuItem;


            // Show the current values fo the item on the form
            this.menuItem = {

                id: menuItem.id,
                title: menuItem.title,
                slug: menuItem.slug,
                description: menuItem.description,
                allergens: menuItem.allergens,
                price: menuItem.price,
                priority: menuItem.priority,
                price_in_cents: menuItem.price_in_cents,
                imageUrl: menuItem.imageUrl,
                outOfStock: menuItem.outOfStock,
                filter: menuItem.filter,
                toppings: menuItem.toppings
            }

            vm.baseUrlPreviewImg = `https://res.cloudinary.com/flavy/image/upload/c_scale,w_250/${vm.menuItem.imageUrl}`;

        },

        methods: {

            setOutOfStock(checked){

                this.menuItem.outOfStock = checked

            },


            async updateMenuItem(){

                let vm = this;

                vm.loading = true;

                let menuItemRef = this.menuItemRef;

                let menuItem = vm.menuItem;


                let customer = await firestore.collection('customers').doc(RESTID);


                // DELETE THE ITEM FROM THE DB
                await customer.update({
                    menu: firebase.firestore.FieldValue.arrayRemove(menuItemRef)
                }).then( () => {

                    console.log(" DELETE ",menuItemRef.title);


                }).catch( err => {

                    console.log("error deleting", err)

                    vm.loading = false;

                });


                // PRICE IN CENTS
                // convert comma or dot separated price to cents
                menuItem.price_in_cents = parseFloat(menuItem.price.replace(',','.').replace(' ','') * 100);

                // TOPPINGS:
                // remove white space and last comma
                menuItem.toppings = menuItem.toppings.length ? menuItem.toppings.replace(/\s/g, "").replace(/,\s*$/, "") : []

                // convert toppings string into array
                menuItem.toppings = menuItem.toppings.length ? menuItem.toppings.split(',') : []


                // RE INSERT THE UPDATED ITEM TO TH DB
                customer.update({
                    menu: firebase.firestore.FieldValue.arrayUnion(menuItem)
                }).then( () => {

                    console.log(" UPDATED ", menuItem.title);

                    let user = localStorage.getItem("user");

                    // AFTER UPDATING THE ITEM WE FETCH THE MENU AGAIN
                    fetch(`https://us-central1-flavy-app.cloudfunctions.net/getRestaurantByAdmin?user=${user}`, { method: 'GET'})

                        .then(function (response) {

                            return response.json()


                        }).then( data =>{

                            localStorage.setItem("restaurantMenu", JSON.stringify(data.restaurantMenu));

                            vm.loading = false;

                        });


                }).catch( err => {

                    console.log("error uploading", err);

                    vm.loading = false;

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

        justify-content: space-between;

        align-items: center;


        &.updating{opacity: 0.3}

        .menu-image{

            display: flex;

            flex-direction: column;



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