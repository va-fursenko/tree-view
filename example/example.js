import TreeView from '../src/TreeView.vue';

new Vue({
    el: '#root-container',

    components: {
        'tree-view': TreeView
    },

    data: {
        selectedId: null,
        categories: [
            {id: 1, name: "Авто", children: true},
            {id: 195, name: "Бытовая техника", children: true},
            {id: 292, name: "Все для офиса", children: true},
            {id: 331, name: "Детские товары", children: true},
            {id: 589, name: "Дом и дача", children: true},
            {id: 1174, name: "Досуг и развлечения", children: true},
            {id: 1426, name: "Компьютерная техника", children: true},
            {id: 1523, name: "Красота и здоровье", children: true},
            {id: 1654, name: "Оборудование", children: true},
            {id: 1736, name: "Одежда, обувь и аксессуары", children: true},
            {id: 1998, name: "Подарки и цветы", children: true},
            {id: 2065, name: "Продукты", children: true},
            {id: 2162, name: "Спорт и отдых", children: true},
            {id: 2327, name: "Товары для животных", children: true},
            {id: 2359, name: "Услуги", children: true},
            {id: 2383, name: "Электроника", children: true}
        ],
        nodesUrl: "http://insbor.ru/vue/multi-select/product-categories.php?search="
    }
});