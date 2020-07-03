<template>

    <section class="menu">

        <section class="menu--header">

            <h1>Menu</h1>

            <div class="actions" >

                <div class="search">

                    <input type="text" placeholder="Search for item name" v-model="searchString"  @click="filterType = 'search' ">

                </div>

            </div>

            <router-link class="button outlined" to="/menu/categories" style="margin-left: auto">CATEGORIES</router-link>

            <router-link class="button secondary" to="/menu/create" style="margin-left: auto">ADD ITEM</router-link>


        </section>


        <section class="menu--table">

            <div class="menu--table-body">

                <div v-for="item in computedMenuItems" class="table-row">

                    <span>{{ item.title }}</span>

                    <span><router-link class="button outlined" :to="`/menu/update/${item.id}`"><a-icon type="edit" /> Edit</router-link></span>

                </div>

            </div>

        </section>

    </section>

</template>

<script>
    export default {

        name: "menuPage",

        data: () => ({

            searchString: "",

            filterType: null

        }),

        computed:{

            menuItems(){ return JSON.parse(localStorage.getItem("restaurantMenu")) },

            searchByName(){

                let searchString = this.searchString.toLowerCase();

                if(this.menuItems){

                    return this.menuItems.filter( item => {

                        let elm = item.title.toLowerCase();

                        return elm.match(searchString)

                    })

                }

            },


            computedMenuItems(){

                if(this.filterType === "search"){

                    return this.searchByName

                }else{

                    // sort alphabetically
                    return this.menuItems.sort(function(a, b){
                        if(a.title < b.title) { return -1; }
                        if(a.title > b.title) { return 1; }
                        return 0;
                    })

                }

            }


        },

        methods:{



        }

    }
</script>

<style lang="scss">

    .menu{

        float: left;

        width: 100%;

        padding: 30px 15px;

        &--header{

            float: left;

            width: 100%;

            display: flex;

            justify-content: space-between;

            align-items: center;

            h1{margin: 0;}

            .button{ width: 160px}

            .actions{

                float: left;

                display: flex;

                align-items: center;

                margin-left: auto;


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


            @media all and(max-width: 450px){

                flex-direction: column;

                .button{width: 100%}

                .actions{margin: 0; width: 100%; .search{width: 100%; input{ width: 100%;}}}

            }

        }

    }

    .menu--table{

        display: flex;

        flex-direction: column;

        width: 100%;

        border: 1px solid #ccc;

        &-body{

            float: left;

            width: 100%;

            display: flex;

            flex-direction: column;

            .table-row{

                padding: 15px 10px;

                float: left;

                display: flex;

                justify-content: space-between;

                font-size: 20px;

                span{ min-width: 92px}

                &:not(:last-of-type){

                    border-bottom: 1px solid #ccc;
                }

                &:nth-of-type(even){

                    background: #ededed;

                }

            }

        }

    }

</style>