import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({

  state: {

      restaurantName: "",
      menuCategories: null,

  },

  mutations: {

      setRestaurantName: (state) => {

          const RESTAURANT_NAME =  localStorage.getItem("restaurantName");

          document.title = `${RESTAURANT_NAME} | Flavy`

          Vue.set(state, 'restaurantName', RESTAURANT_NAME)

      },

      setMenuCategories: (state, menuCategories) => {

        Vue.set(state, 'menuCategories', menuCategories)

    }

  },

  actions: {


    getMenuCategories: async (context) => {

        let user = localStorage.getItem("user");

        await fetch(`https://us-central1-flavy-app.cloudfunctions.net/getRestaurantByAdmin?user=${user}`, { method: 'GET'})

            .then(function(response) {

                return response.json();

            }).then( data => {

                context.commit('setMenuCategories', data.menuCategories);

            }).catch( error => {

               // window.location.href = '/'
                console.log("[ERROR]", error)

            })


    },

  }

})
