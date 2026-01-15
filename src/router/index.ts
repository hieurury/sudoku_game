import { createWebHistory, createRouter } from "vue-router";

//layouts
import MainLayout from "../layouts/MainLayout.vue";
//views
import Home from "../views/Home.vue";
import SinglePlay from "../views/SinglePlay.vue";

const routes = [
    {
        path: "/",
        component: MainLayout,
        children: [
            {
                path: "",
                name: "HomeView",
                component: Home,
            },
            {
                path: "single-play",
                name: "SinglePlayView",
                component: SinglePlay,
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;