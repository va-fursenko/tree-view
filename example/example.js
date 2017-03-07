import TreeView from '../src/TreeView.vue';

new Vue({
    el: '#root-container',

    components: {
        'tree-view': TreeView
    },

    data: {
        selectedId: null,
        categories: [
            {id: 1, name: "Авто", children: 1},
            {id: 195, name: "Бытовая техника", children: 1},
            {id: 292, name: "Все для офиса", children: 1},
            {id: 331, name: "Детские товары", children: 1},
            {id: 589, name: "Дом и дача", children: 1},
            {id: 1174, name: "Досуг и развлечения", children: 1},
            {id: 1426, name: "Компьютерная техника", children: 1},
            {id: 1523, name: "Красота и здоровье", children: 1},
            {id: 1654, name: "Оборудование", children: 1},
            {id: 1736, name: "Одежда, обувь и аксессуары", children: 1},
            {id: 1998, name: "Подарки и цветы", children: 1},
            {id: 2065, name: "Продукты", children: 1},
            {id: 2162, name: "Спорт и отдых", children: 1},
            {id: 2327, name: "Товары для животных", children: 1},
            {id: 2359, name: "Услуги", children: 1},
            {id: 2383, name: "Электроника", children: 1}
        ],
        nodesUrl: "http://insbor.ru/vue/tree-view/product-categories.php"
    }
});