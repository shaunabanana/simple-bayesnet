Vue.component('network-canvas', {
    props: ['nodes', 'links'],
    template: `
    <div 
    class="canvas" 
    id="container"
    @mousedown="mouseDown"
    @mouseup="mouseUp"
    @mousemove="mouseMove"
    >

        <network-link-handle
        v-for="link in links"
        v-if="!getNodeById(link.src).ignored && !getNodeById(link.dest).ignored"
        :key="link.id + 'link'"
        :link="link"
        :id="link.id"
        :class="[ currentSelectedLink && currentSelectedLink == link.id ? 'link-handle-selected' : (link.hover ? 'link-handle-hover': ''), link.ignored ? 'ignored' : '' ]"
        ></network-link-handle>

        <node-info-panel
        v-if="currentSelectedNode && !linking && !batchLinking && !getNodeById(currentSelectedNode).ignored"
        :node="getNodeById(currentSelectedNode)"
        @observe="query"
        ></node-info-panel>

        <pie
        v-for="node in nodes"
        v-if="!node.ignored"
        :key="node.id + 'pie'"
        :node="node"
        ></pie>

        <network-node
        v-for="node in nodes"
        :key="node.id + 'node'"
        :node="node"
        :class="{ select: currentSelectedNode && node.id == currentSelectedNode, hover: node.hover, ignored: node.ignored }"
        ></network-node>
    </div>
    `,
    methods: {

    }
})