import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import VueFirestore from 'vue-firestore'
Vue.use(VueFirestore)

import firebase from 'firebase';
import './registerServiceWorker'

import './components/firebaseInit';

// ANT DESIGN
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
Vue.use(Antd)


Vue.config.productionTip = false


let app;
firebase.auth().onAuthStateChanged( user => {

  if(!app){

    app =
        new Vue({
            router,
            store,
            render: h => h(App)
        }).$mount('#app')

  }

})
