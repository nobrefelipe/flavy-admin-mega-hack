<template>

    <section class="user-control">


        <a-icon type="loading" class="loading"/>


    </section>

</template>

<script>
    export default {

        name: "UserControl",

        mounted() {

            let user = localStorage.getItem("user");

            fetch(`https://us-central1-flavy-app.cloudfunctions.net/getRestaurantByAdmin?user=${user}`, { method: 'GET'})

                .then(function (response) {

                    return response.json()


                }).then( data =>{

                    localStorage.setItem("restaurantId", data.restaurantInfo.restaurantId);
                    localStorage.setItem("restaurantName", data.restaurantInfo.name);
                    localStorage.setItem("restaurantMenu", JSON.stringify(data.restaurantMenu));
        
                    this.$router.push('/dashboard')

                });

        }

    }
</script>

<style lang="scss">

    .user-control{

        position: absolute;

        top:0; left: 0; right: 0; bottom: 0;

        display: flex;

        align-items: center;

        justify-content: center;

    }

</style>