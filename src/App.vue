<template>
  <div id="app">

      <header v-if="$route.name !== 'Login' && $route.name !== 'UserControl'" id="header">

          <span  class="back"
                 v-if="$route.name !== 'Login' && $route.name !== 'UserControl'  && $route.name !== 'Dashboard'"
                 @click="$router.back()">

                    <a-icon type="left" />

          </span>


          <logo-component/>

          <span class="restaurant-name">{{ $store.state.restaurantName }} | <span>admin</span></span>

          <!-- LOGOUT BUTTON -->
          <button class="logout" @click="logout">logout</button>

          <!-- INSTALL THE APP BUTTON -->
          <a class="install-app" :style="{'display': installBtn}" @click="installer()">Install the app</a>

      </header>




    <transition name="faded" mode="out-in">

      <router-view :key="$route.name"/>

    </transition>

  </div>
</template>


<script>

    import firebase from 'firebase'

    import LogoComponent from "@/components/LogoComponent";

    export default {

        components: { LogoComponent },

        data() {
            return {
                installBtn: "none",
                installer: undefined
            };
        },

        created() {
            let installPrompt;

            window.addEventListener("beforeinstallprompt", e => {
                e.preventDefault();
                installPrompt = e;
                this.installBtn = "block";
            });

            this.installer = () => {
                this.installBtn = "none";
                installPrompt.prompt();
                installPrompt.userChoice.then(result => {
                    if (result.outcome === "accepted") {
                        console.log("Install accepted!")
                    } else {
                        console.log("Install denied!")
                    }
                });
            };
        },

        methods: {

            logout(){

                localStorage.removeItem("user");
                localStorage.removeItem("restaurantId");
                localStorage.removeItem("restaurantName");
                localStorage.removeItem("restaurantMenu");

                firebase.auth().signOut();

                window.location.href = '/';

            },


        }
    };
</script>



<style lang="scss" src="./assets/scss/styles.scss"></style>