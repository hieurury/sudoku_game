import { createWebHistory, createRouter } from "vue-router";

//layouts
//views
import Home from "../views/Home.vue";
import QuickPlay from "../views/QuickPlay.vue";
import TowerPlay from "../views/TowerPlay.vue";

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
    },
    {
        path: "/tower-play/:levelId",
        name: "TowerPlay",
        component: TowerPlay,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;