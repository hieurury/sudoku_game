import { createWebHistory, createRouter } from "vue-router";

//layouts
import MainLayout from "../layouts/MainLayout.vue";
//views
import Home from "../views/Home.vue";
import QuickPlay from "../views/QuickPlay.vue";

const routes = [
    {
        path: "/",
        name: "HomeView",
        component: Home,
    },
    {
        path: "/quick-play",
        name: "QuickPlay",
        component: QuickPlay,
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;