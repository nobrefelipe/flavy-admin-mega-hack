<template>

    <section class="menu-create" :class="{updating: loading}">


        <div class="menu-image">

            <img :src="baseUrlPreviewImg" height="200">
            <button id="upload_widget" class="button outlined">Upload image</button>

        </div>


        <form v-on:submit.prevent="createMenuItem">

            <input type="text" placeholder="title" v-model="menuItem.title" class="form-item" required>
            <input type="text" placeholder="description" v-model="menuItem.description" class="form-item" required>
            <input type="text" placeholder="allergens" v-model="menuItem.allergens" class="form-item">
            <input type="text" placeholder="price" v-model="menuItem.price" class="form-item" required>
            <input type="hidden" placeholder="imageUrl" v-model="menuItem.imageUrl" class="form-item" >
            <input type="text" placeholder="toppings" v-model="menuItem.toppings" class="form-item">

            <select name="filter"  v-model="menuItem.filter" class="form-item" required>

                <option selected value="select">Filter</option>
                <option v-for="category in categories" :key="category" :value="category">{{category}}</option>

            </select>

            <input type="number" placeholder="priority" v-model="menuItem.priority" class="form-item">

            <label for="outOfStock">

                <input type="checkbox"  id="outOfStock" v-model="menuItem.outOfStock">

                Out of stock

            </label>

            <button type="submit" class="button primary">CREARE</button>

        </form>





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

            menuItem: {

                id: '',
                title: "",
                slug: "",
                description: "",
                allergens: "",
                price: "",
                price_in_cents: null,
                imageUrl: "",
                filter: "select",
                outOfStock: false,
                toppings: ""

            }

        }),

        computed:{

           categories(){ return localStorage.getItem("menuCategories").split(','); },

        },


        mounted(){

            let vm = this;

            // SET RESTAURANT NAME
            this.$store.commit("setRestaurantName");


            var myWidget = cloudinary.createUploadWidget({
                    cloudName: 'flavy',
                    uploadPreset: 'ml_default',
                    cropping: true,
                    folder: RESTID
                }, (error, result) => {
                    if (!error && result && result.event === "success") {
                        console.log('Done! Here is the image info: ', result.info);

                        vm.menuItem.imageUrl = result.info.path;
                        vm.baseUrlPreviewImg = `https://res.cloudinary.com/flavy/image/upload/c_scale,w_200/${result.info.path}`;

                    }
                }
            );

            document.getElementById("upload_widget").addEventListener("click", function(){
                myWidget.open();
            }, false);

        },

        methods: {

             ID() {
                // Math.random should be unique because of its seeding algorithm.
                // Convert it to base 36 (numbers + letters), and grab the first 9 characters
                // after the decimal.
                return '_' + Math.random().toString(36).substr(2, 9);
            },

            GENERATE_SLUG(str){

                str = str.replace(/^\s+|\s+$/g, ''); // trim
                str = str.toLowerCase();

                // remove accents, swap ñ for n, etc
                var from = "àáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
                var to   = "aaaaaeeeeiiiioooouuuunc------";

                for (var i=0, l=from.length ; i<l ; i++) {
                    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
                }

                str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
                    .replace(/\s+/g, '-') // collapse whitespace and replace by -
                    .replace(/-+/g, '-'); // collapse dashes

                return str;


            },

            createMenuItem(){

                const RESTID =  localStorage.getItem("restaurantId");

                console.log(RESTID)

                let vm = this;

                let menuItem = this.menuItem;

                // UNIQUE ID
                menuItem.id = this.ID();

                // SLUG
                menuItem.slug = this.GENERATE_SLUG(menuItem.title);

                // PRICE IN CENTS
                // convert comma or dot separated price to cents
                menuItem.price_in_cents = parseFloat(menuItem.price.replace(',','.').replace(' ','') * 100);

                // TOPPINGS:
                // remove white space and last comma
                menuItem.toppings = menuItem.toppings.replace(/\s/g, "").replace(/,\s*$/, "")

                // convert toppings string into array
                menuItem.toppings = menuItem.toppings ? menuItem.toppings.split(',') : []

                let customer = firestore.collection('customers').doc(RESTID);

                return customer.update({
                    menu: firebase.firestore.FieldValue.arrayUnion(vm.menuItem)
                }).then( () => {

                    console.log(menuItem.toppings);

                    let user = localStorage.getItem("user");

                    // AFTER UPDATING THE ITEM WE FETCH THE MENU AGAIN
                    fetch(`https://us-central1-flavy-app.cloudfunctions.net/getRestaurantByAdmin?user=${user}`, { method: 'GET'})

                        .then(function (response) {

                            return response.json()


                        }).then( data =>{

                        localStorage.setItem("restaurantMenu", JSON.stringify(data.restaurantMenu));

                        vm.loading = false;

                    });


                    this.resetForm(); //clear form automatically after successful request

                }).catch( err => {

                    console.log("error uploading", err)

                });


            },


            resetForm() {
                console.log('Reseting the form')
                var self = this; //you need this because *this* will refer to Object.keys below`

                //Iterate through each object field, key is name of the object field`
                Object.keys(this.menuItem).forEach(function(key,index) {
                    self.menuItem[key] = '';
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

        justify-content: center;


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