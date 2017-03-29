# tree-view
Компонент VueJS2 для иерархических списков с динамичской загрузкой опций.

Tree VueJS2 component.

[Пример (Example)](http://insbor.ru/vue/tree-view/index.html "Component example")

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
 
 Поле `readonly` - флаг доступности редактирования дерева. Узлы удаляются вместе со всеми дочерними узлами. 
 Добавлять новые узлы можно только к уже сохранённым. Если указаны свойства компонента `save-url` и
 `delete-url`, при сохранении и удалении узлов будут отправлены соответствующие AJAX-запросы на указанные адреса.
 
 При выполнении соответствующих действий с узлами дерева вызываются следующие события `this.events`: 
```js
    {
        NODES_BEFORE_LOAD: 'nodes-before-load',
        NODES_AFTER_LOAD: 'nodes-after-load',
        NODE_ADD: 'node-add',
        NODE_BEFORE_DELETE: 'node-before-delete',
        NODE_DELETE: 'node-delete',
        NODE_AFTER_DELETE: 'node-after-delete',
        NODE_BEFORE_SAVE: 'node-before-save',
        NODE_AFTER_SAVE: 'node-after-save'
    }
```
