# tree-view
Компонент VueJS2 для иерархических списков с динамичской загрузкой опций.

Tree VueJS2 component.

[Пример (Example)](http://insbor.ru/vue/tree-view/ "Component example")

![Пример (example)](https://raw.githubusercontent.com/va-fursenko/tree-view/master/example/tree-view-example.png "Пример (example)")

```html
<tree-view
    :nodes="categories"
    :readonly="false"
    v-model="selectedId"
    nodes-url="/vue/tree-view/product-categories.php"
></tree-view>
```

Если не указан параметр `nodes-url`, то выбор будет вестись только среди явно указанных узлов. 
Иначе, при выборе узла, у которого поле `nodes` больше нуля, на указанный адрес будет отправляться 
AJAX-запрос с параметром `id` с ID текущего узла для получения вложенных узлов. 
Ответ ожидается в виде упакованного в json объекта вида
 ```js
{
    success: true,
    data: {
        nodes: [
            {
                id: 10,
                name: "Автомобильные компрессоры",
                children: 0
            },
            {
                id: 12,
                name: "Вспомогательный инструмент",
                children: 12
            },
           . . .
        ] 
    }
}
```
В поле `children` передаётся количество дочерних элементов, или по крайней мере, `1`, если они ожидаются,
 но количество неизвестно.
 
 Поле readonly - флаг доступности редактирования узлов. Узлы удаляются вместе со всеми дочерними узлами. 
 Добавлять новые узлы можно только к уже сохранённым узлам. Если указаны свойства компонента save-url и
 delete-url, при сохранении и удалении узлов будут отправлены соответствующие AJAX-запросы по указанным адресам.
 
 При выполнении соответствующих действий с узлами дерева вызываются следующие события:
 ```js
    const EVENT_NODES_LOADED = 'nodes-loaded';
    const EVENT_NODES_BEFORE_LOAD = 'nodes-before-load';
    const EVENT_CHILD_NODE_ADD = 'child-node-add';
    const EVENT_NODE_BEFORE_DELETE = 'node-before-delete';
    const EVENT_NODE_DELETED = 'node-deleted';
    const EVENT_NODE_SAVED = 'node-saved';
```