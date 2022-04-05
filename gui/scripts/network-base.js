Vue.component('network-node', {
    props: ['node'],
    template: `
    <div 
    class="node unselectable" 
    :id="node.id" 
    :style="{ left: node.x + 'px', top: node.y + 'px' }" 
    @mouseenter="node.hover = true"
    @mouseleave="node.hover = false"
    > 
        {{ node.title.length > 25 ? node.title.substr(0, 25) + '...' : node.title }} <br/> 
        <div>{{ node.observation == '' ? findMaxValue(node.values) : node.observation }} </div>
    </div>`,
    methods: {
        findMaxValue: function (values) {
            var maxValue = 0;
            var maxValueName = null;
            for (var i = 0; i < values.length; i++) {
                if (values[i].probability > maxValue) {
                    maxValue = values[i].probability;
                    maxValueName = values[i].name;
                }
            }
            return maxValueName;
        }
    }
})


Vue.component('network-link', {
    props: ['id', 'x1', 'y1', 'x2', 'y2'],
    template: `
    <g>
        <line
        :id="id"
        :x1="x1"
        :y1="y1"
        :x2="x2"
        :y2="y2"
        />
    </g>`
})


Vue.component('network-link-handle', {
    props: ['link'],
    template: `
    <div
    class="link-handle"
    @mouseenter="link.hover = true"
    @mouseleave="link.hover = false"
    :style="{ left: (link.x1 + link.x2) / 2 + 'px', top: (link.y1 + link.y2) / 2 + 'px' }" 
    ></div>`
})