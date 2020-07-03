<template>

    <section class="login-page">

        <img src="../../public/img/login-bg.jpg" alt="Flavy" class="bg">



        <form @submit.prevent="onLogin">

            <logo-component />

            <span class="error" v-if="error">Invalid email or password</span>


            <label for="email">

                <input type="email" v-model="email" placeholder="email" id="email" :class="{error:error}"/>

            </label>


            <label for="password">

                <input type="password" v-model="password" placeholder="password" id="password" :class="{error:error}"/>

            </label>


            <button class="button primary">LOGIN</button>

        </form>

    </section>

</template>

<script>

    import firebase from 'firebase';

    import LogoComponent from "@/components/LogoComponent";

    export default {

        name: "Login",

        components: { LogoComponent },

        data : () => ({

            email: "",

            password: "",

            error: false

        }),


        methods:{

            onLogin(){

                let vm = this;

                localStorage.setItem("user", null);

                /*
                    Bypass the login validation 
                    TODO: remove it later, this is only for the demo
                */
                localStorage.setItem("user", this.email)

                vm.$router.push('/user-control')

                // firebase.auth().signInWithEmailAndPassword( this.email, this.password)

                //     .then(

                //         user => {

                //             console.log(user.user.email);

                //             localStorage.setItem("user", user.user.email)

                //             vm.$router.push('/user-control')

                //         },

                //         error => {

                //             vm.error = error.code

                //         }

                //     )

            }

        }

    };

</script>

<style lang="scss">

    .login-page{

        position: absolute;

        top:0; left: 0; right: 0; bottom: 0;

        padding: 20px;

        display: flex;

        align-items: center;

        justify-content: center;

        flex-direction: column;

        background: var(--color-secondary);


        .bg{

            position: fixed;

            top:0;left: 0;

            z-index: 0;

            opacity: 0.2;

            width: 100%;

            height: 100%;

            object-fit: cover;

            object-position: 50% 50%;

            filter: blur(8px);

        }


        .logo{

            justify-content: center;

            margin-bottom: 60px;
        }

        form{

            position: relative;

            display: flex;

            flex-direction: column;

            width: 90%;

            max-width: 400px;

            padding: 20px 20px 20px 20px;

            border-radius: 10px;

            background: #fff;

            box-shadow: 0 0 5px rgba(0,0,0,0.2);

            input{

                width: 100%;

                padding: 12px;

                border: 1px solid #999;

                border-radius: 5px;


                &.error{ border-color: red}

            }

            label{

                float: left;

                width: 100%;

                margin-bottom: 20px;

            }


            span.error{

                position: absolute;

                top:90px; left: 0;

                width: 100%;

                text-align: center;

                font-size: 12px;

                color: red;

            }

        }


    }

</style>
