import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import NewRoom from '../views/NewRoom.vue';
import UserProfile from '../views/UserProfile.vue';
import Lobby from '../views/Lobby.vue';
import Round from '../views/Round.vue';

// import { auth } from '../firebase';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/new-room',
    name: 'NewRoom',
    component: NewRoom,
  },
  {
    path: '/room/:id',
    name: 'Room',
    component: Lobby,
  },
  {
    path: '/room/:id/round/:number',
    name: 'Round',
    component: Round,
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

// router.beforeEach((to, from, next) => {
//   if (to.name !== 'Home' && !auth.currentUser) {
//     next({
//       name: 'Home',
//     });
//   }
//
//   next();
// });

export default router;
