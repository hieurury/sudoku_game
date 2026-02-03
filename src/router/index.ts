import { createWebHistory, createRouter } from "vue-router";

//layouts
import MainLayout from "../layouts/MainLayout.vue";
//views
import Home from "../views/Home.vue";
import QuickPlay from "../views/QuickPlay.vue";

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
                path: "quick-play",
                name: "QuickPlayView",
                component: QuickPlay,
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;