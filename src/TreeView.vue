<template>
    <div :class="{'tree-view__root': isRoot, 'tree-view__node': isNode}">

        <template v-if="isRoot">
            <i
                class="fa fa-plus"
                v-if="!readonly"
                @click="addChildNode()"
                title="Add root node"
            > </i>

            <tree-view
                v-for="node in nodes"
                :key="node.id"
                :node="node"
                :nodes-url="nodesUrl"
                :readonly="readonly"
                v-model="selectedId"
            > </tree-view>
        </template>

        <template v-else-if="isNode">
            <div class="tree-view__node-name">
                <i
                    v-if="childrenExists"
                    class="fa"
                    :class="{
                        'fa-angle-up': isOpen && !isLoading,
                        'fa-angle-down': !isOpen || isLoading
                    }"
                    :title="(isOpen ? 'Hide' : 'Show') + ' child nodes'"
                    @click="selectNode(true)"
                > </i>

                <template v-if="!isEditing">
                    <span
                        class="tree-view__node-name"
                        :class="{'tree-view__bold': isSelected}"
                        @click="selectNode()"
                    >
                        {{ node.name }}
                    </span>
                    <i
                        class="fa fa-spinner fa-pulse fa-fw"
                        v-if="childrenExists && isLoading"
                    > </i>
                    <div v-if="!readonly && isSelected && !isLoading" class="tree-view__node-edit tree-view__hide">
                        <i class="fa fa-pencil-square-o" @click="editNode()" title="Edit node"> </i>
                        <i class="fa fa-plus" v-if="!isNew" @click="addChildNode()" title="Add child node"> </i>
                        <i class="fa fa-trash-o" @click="deleteNode()" title="Recursively remove mode"> </i>
                    </div>
                </template>

                <div v-else-if="!readonly" class="tree-view__node-edit">
                    <input
                        class="tree-view__name-edit-input"
                        :value="node.name"
                        ref="nameInput"
                        @keydown.enter="saveNode()"
                        @keyup.esc="editNode(false)"
                    >
                    <i class="fa fa-check" @click="saveNode()" title="Save node"> </i>
                    <i class="fa fa-times" @click="editNode(false)" title="Cancel node edit"> </i>
                </div>
            </div>

            <div v-show="isOpen" v-if="hasChildren">
                <tree-view
                    v-for="child in node.children"
                    :key="node.id"
                    :node="child"
                    :nodes-url="nodesUrl"
                    :readonly="readonly"
                    v-model="selectedId"
                    ref="children"
                > </tree-view>
            </div>
        </template>

    </div>
</template>

<script lang="babel">
    import { Http } from './common/http';

    /**
     * New empty node model
     *
     * @return {{id: number, name: string, children: Array}}
     */
    let newNode = () => {
        return {
                  id: -(Math.floor(Math.random() * 899999) + 100000),
                name: 'New item',
            children: []
        }
    };

    export default {
        name: 'TreeView',

        // Obtained parameters
        props: {
            // Single node
            node: {
                type: Object,
                default: null
            },
            // Nodes list
            nodes: {
                type: Array,
                default: null
            },
            // Component value
            value: {
                default: null,
                twoWay: true
            },
            // Readonly flag
            readonly: {
                type: Boolean,
                default: false
            },
            // Url to ajax load child nodes
            nodesUrl: {
                type: String,
                default: ''
            },
            // Url to ajax save nodes
            saveUrl: {
                type: String,
                default: ''
            },
            // Url to ajax delete nodes
            deleteUrl: {
                type: String,
                default: ''
            }
        },

        // Inner data store
        data () {
            return {
                // Inner properties
                isOpen: false,
                isLoading: null,
                isEditing: false,
                selectedId: this.value
            }
        },

        // Computed properties
        computed: {
            /**
             * Possible component's custom events
             *
             * @return {Object}
             */
            events () {
                return {
                    NODES_BEFORE_LOAD: 'nodes-before-load',
                    NODES_AFTER_LOAD: 'nodes-after-load',
                    NODE_ADD: 'node-add',
                    NODE_BEFORE_DELETE: 'node-before-delete',
                    NODE_DELETE: 'node-delete',
                    NODE_AFTER_DELETE: 'node-after-delete',
                    NODE_BEFORE_SAVE: 'node-before-save',
                    NODE_AFTER_SAVE: 'node-after-save'
                };
            },

            /**
             * Check, whether component is selected
             *
             * @return {Boolean}
             */
            isSelected () {
                let result = this.isNode && this.selectedId == this.node.id;
                if (!result && this.isEditing) {
                    this.isEditing = false;
                }
                return result;
            },

            /**
             * Check, whether component is a root element
             *
             * @returns {Boolean}
             */
            isRoot () {
                return typeof this.nodes == 'object' && this.nodes !== null;
            },

            /**
             * Check, whether component is a node element
             *
             * @returns {Boolean}
             */
            isNode () {
                return Boolean(!this.isRoot && typeof this.node == 'object' && this.node);
            },

            /**
             * Check, whether item has children
             *
             * @returns {Boolean}
             */
            childrenExists () {
                // Bad model
                if (!this.node) {
                    return false;
                }
                // Child nodes has not loaded yet, but available
                if (this.canLoadChildren) {
                    return true;
                }
                // Children nodes already or not
                return this.hasChildren;
            },

            /**
             * Check, whether node has already loaded children
             *
             * @return {Boolean}
             */
            hasChildren () {
                return Boolean(
                    this.node
                    && Array.isArray(this.node.children)
                    && this.node.children.length > 0
                );
            },

            /**
             * Check, whether children ready to load
             */
            canLoadChildren () {
                return Boolean(
                    this.node && this.node.children > 0
                    && typeof this.nodesUrl == 'string' && this.nodesUrl
                );
            },

            /**
             * New, yet not saved node flag
             *
             * @return {Boolean}
             */
            isNew () {
                return this.node && this.node.id < 0;
            }
        },

        methods: {
            /**
             * Toggle child subtree visibility
             *
             * @param {Boolean} forceToggle
             */
            selectNode (forceToggle = false) {
                // Check whether, node already selected, opened and click was without force toggle parameter
                if (this.isSelected && this.isOpen && !forceToggle) {

                    return true;
                }
                // Update value and emit 'input' event
                this.updateValue();
                // Exit if node closes or has no children
                if (!this.childrenExists || this.isLoading) {

                    return false;
                }
                // If we open new, yet not loaded node and can use ajax callback to load it
                if (!this.isOpen && this.canLoadChildren) {
                    this.$emit(this.events.NODES_BEFORE_LOAD, this.node.id);
                    this.isLoading = true;
                    let self = this;
                    Http.ajaxAction(self.nodesUrl, {id: self.node.id}, (response) => {
                        self.setChildren(response.data);
                        self.isLoading = false;
                        self.$emit(self.events.NODES_AFTER_LOAD, self.node.id, response.data);
                    });
                }
                // Don't close node if click was with force toggle parameter (Click on name, not chevron)
                if (forceToggle || !this.isOpen) {
                    this.isOpen = !this.isOpen;
                }
            },

            /**
             * Set node children list
             *
             * @param {Array} children
             */
            setChildren (children) {
                if (!this.node) {
                    this.node = newNode();
                }
                this.node.children = children;
            },

            /**
             * Set value to this.node.id and call this method in parent component
             *
             * @param {Number|Boolean|String} newValue
             */
            updateValue (newValue = null) {
                this.selectedId = arguments.length || !this.node ? newValue : this.node.id;
                // If parent is TreeView node or root, set value to it
                if (this.$parent && (this.$parent.isNode || this.$parent.isRoot) && typeof this.$parent.updateValue === 'function') {
                    this.$parent.updateValue(this.selectedId);
                }
                this.$emit('input', this.selectedId);
            },

            /**
             * Start new child node creation to selected
             */
            addChildNode () {
                let node = newNode();
                if (this.isNode) {
                    if (!Array.isArray(this.node.children)) {
                        this.node.children = [];
                    }
                    this.node.children.push(node);
                } else {
                    if (!Array.isArray(this.nodes)) {
                        this.nodes = [];
                    }
                    this.nodes.push(node);
                }
                this.$emit(this.events.NODE_ADD, node);
                this.isOpen = true;
            },

            /**
             * Recursively delete selected node
             */
            deleteNode () {
                if (!confirm("Really delete node and all it's children?") || !this.isNode) {
                    return false;
                }
                this.$emit(this.events.NODE_BEFORE_DELETE, this.node.id);

                if (typeof this.deleteUrl == 'string' && this.deleteUrl) {
                    this.isLoading = true;
                    let self = this;
                    Http.ajaxAction(self.deleteUrl, {id: self.node.id}, (response) => {
                        self.$parent.deleteChildNode(self.node.id);
                        self.isLoading = false;
                        self.$emit(self.events.NODE_AFTER_DELETE, self.node.id, response);
                    });
                } else {
                    this.$parent.deleteChildNode(this.node.id);
                }
            },

            /**
             * Child node delete
             *
             * @param {number} childId
             */
            deleteChildNode (childId) {
                let spliceChild = (nodes, spliceId) => {
                    for (let i in nodes) {
                        if (nodes.hasOwnProperty(i) && spliceId == nodes[i].id) {
                            this.$emit(this.events.NODE_DELETE, nodes[i]);
                            nodes.splice(i, 1);
                            return true;
                        }
                    }
                    return false;
                };

                if (spliceChild(this.isNode ? this.node.children : this.nodes, childId)) {
                    this.updateValue(null);
                }
            },

            /**
             * Start or end node edit
             *
             * @param {Boolean} isEdit
             */
            editNode (isEdit = true) {
                this.isEditing = isEdit;
            },

            /**
             * Save node
             */
            saveNode () {
                this.$emit(this.events.NODE_BEFORE_SAVE, this.$refs.nameInput.value);
                if (typeof this.saveUrl == 'string' && this.saveUrl) {
                    this.isLoading = true;
                    let self = this;
                    Http.ajaxAction(
                        self.saveUrl,
                        {
                            id: self.node.id,
                            name: self.node.name,
                            parent_id: self.isRoot || !self.$parent.node
                                ? 0
                                : self.$parent.node.id
                        },
                        (response) => {
                            if (self.node.id < 0 && response.data.id) {
                                self.node.id = response.data.id;
                            }
                            self.node.name = self.$refs.nameInput.value;
                            self.isLoading = false;
                            self.isEditing = false;
                            self.$emit(self.events.NODE_AFTER_SAVE, self.node, response);
                        }
                    );
                } else {
                    this.node.name = this.$refs.nameInput.value;
                    this.isEditing = false;
                    this.$emit(this.events.NODE_AFTER_SAVE, this.node);
                }
            }
        },

        // Fields watches
        watch: {
            value (newValue) {
                this.selectedId = newValue;
            }
        },

        // Component create event handler
        created () {

        }
    }
</script>

<style lang="css">
    /* Component container */
    .tree-view__root {
        color: #555;
        background-color: #fff;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
        padding: 4px 6px;
        min-width: 420px;
        display: block;
    }

    /* Chevrons, loader and buttons */
    .tree-view__root i {
        cursor: pointer;
    }

    /* Crete root */
    .tree-view__root > i.fa-plus {
        position: relative;
        display: block;
        float: right;
        right: -1px;
    }
    .tree-view__root i.fa:hover {
        color: #2f2f2f;
    }

    /* Node container */
    .tree-view__node {
        margin-left: 16px;
    }
    /* First level node container */
    .tree-view__root > .tree-view__node {
        margin-left: 0;
    }

    /* Selected tree view value */
    span.tree-view__node-name {
        margin-left: 15px;
        cursor: pointer;
    }
    span.tree-view__node-name.tree-view__bold {
        font-weight: bolder;
    }
    /* Labels with left chevron icon */
    i.fa-angle-up + span.tree-view__node-name,
    i.fa-angle-down + span.tree-view__node-name {
        margin-left: 0;
    }

    /* Node edit buttons block */
    .tree-view__node-edit {
        min-width: 44px;
        display: inline;
    }

    /* Hide selected node edit buttons */
    .tree-view__node-name > .tree-view__node-edit.tree-view__hide > i {
        display: none;
    }
    .tree-view__node-name:hover > .tree-view__node-edit.tree-view__hide > i {
        display: inherit;
    }

    /* Name edit input */
    input.tree-view__name-edit-input {
        width: 240px;
        display: inline;
        height: 26px;
        padding: 2px 6px;
        background-color: #fff;
        background-image: none;
        border: 1px solid #ccc;
        border-radius: 4px;
        -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
        box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
        -webkit-transition: border-color ease-in-out .15s, -webkit-box-shadow ease-in-out .15s;
        -o-transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
        transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
    }

    /* Text style */
    span.tree-view__node-name,
    input.tree-view__name-edit-input {
        color: #555;
        font-size: 14px;
        font-family: inherit;
        text-decoration: none;
    }
</style>