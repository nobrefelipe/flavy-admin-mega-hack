import Vue from 'vue'
import Router from 'vue-router'
import Dashboard from './views/Dashboard.vue'

import firebase from 'firebase';

Vue.use(Router)

let router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/dashboard',
            name: 'Dashboard',
            meta:{ requiresAuth: true },
            component: () => import(/* webpackChunkName: "Dashboard" */ './views/Dashboard.vue')

        },

        {
            path: '/open-orders',
            name: 'OpenOrders',
            meta:{ requiresAuth: true },
            component: () => import(/* webpackChunkName: "OpenOrders" */ './views/OpenOrders.vue')

        },

        {
            path: '/menu',
            name: 'Menu',
            meta:{ requiresAuth: true },
            component: () => import(/* webpackChunkName: "Menu" */ './views/menu/menu.vue')

        },

        {
            path: '/menu/create',
            name: 'MenuCreate',
            meta:{ requiresAuth: true },
            component: () => import(/* webpackChunkName: "MenuCreate" */ './views/menu/create.vue')

        },

        {
            path: '/menu/categories',
            name: 'MenuCategories',
            meta:{ requiresAuth: true },
            component: () => import(/* webpackChunkName: "MenuCreate" */ './views/menu/categories.vue')

        },

        {
            path: '/menu/update/:id',
            name: 'MenuUpdate',
            meta:{ requiresAuth: true },
            component: () => import(/* webpackChunkName: "MenuUpdate" */ './views/menu/update.vue')

        },

        {
            path: '/orders/all',
            name: 'AllOrders',
            meta:{ requiresAuth: true },
            component: () => import(/* webpackChunkName: "AllOrders" */ './views/orders/all.vue')
        },


        {
            path: '/',
            name: 'Login',
            component: () => import(/* webpackChunkName: "Login" */ './views/Login.vue')
        },

        {
            path: '/user-control',
            name: 'UserControl',
            meta:{ requiresAuth: true },
            component: () => import(/* webpackChunkName: "UserControl" */ './views/UserControl.vue'),
        },



    ]
});


// router.beforeEach((to, from,next) => {

//     // CHECKS FOR requiresAuth GUARD
//     if( to.matched.some(record => record.meta.requiresAuth)){

//         //Check if NOT logged in
//         if(!firebase.auth().currentUser){

//             localStorage.removeItem("user");
//             localStorage.removeItem("restaurantId");
//             localStorage.removeItem("restaurantName");

//             next('/')

//         }else{

//             // Proceed to the route
//             next();

//         }

//     }else{

//         next();

//     }

// });

export default router;