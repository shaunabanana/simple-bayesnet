Vue.component('node-graph-bar', {
    props: ['percentage', 'color'],
    template: `
    <div 
    class="node-graph-bar"
    >
        <div 
        class="node-graph-bar-highlight"
        :style="{ width: 150 * percentage + 'px', background: color }"></div>
    </div>`
})


Vue.component('node-graph-item', {
    props: ['title', 'percentage', 'color'],
    template: `
    <div
    class="node-graph-item" 
    >
        <div class="node-graph-text" > {{ title }} </div>
        <node-graph-bar 
        :percentage="percentage"
        :color="color"
        ></node-graph-bar>
        <div class="node-graph-text" > {{ Math.round( Number(percentage) * 100 ) }}% </div>
    </div>`
})


Vue.component('node-info-panel', {
    props: ['node'],
    template: `
        <div
        class="node-info-panel"
        :style="{ left: Number(node.x) + 40 + 'px', top: Number(node.y) - 20 + 'px' }"
        >
            <div class="node-info-title"> {{ node.title }} </div>

            <node-graph-item
            v-for="(value, index) in node.values"
            :key="value.name"
            :title="value.name"
            :percentage="node.observation == '' ? value.probability : (node.observation == value.name ? '1.0' : '0.0')"
            :color="getColor(node.values.length, index)"
            ></node-graph-item>

            <div class="node-info-subtitle"> Set observation </div>

            <span
            v-for="value in node.values"
            :key="value.name + 'button'"
            >
                <button
                class="observe-button"
                :class="{ active: node.observation == value.name }"
                @click="node.observation == value.name ? node.observation = '' : node.observation = value.name; $emit('observe')"
                >
                    {{ value.name }}
                </button>
            </span>
        </div>
    `,
    methods: {
        getColor: function(numColors, index) {
            var colors = {
                1: [ '#FF7675' ],
                2: [ '#FF7675', '#74B9FF' ],
                3: [ '#FF7675', '#FDCB6E', '#74B9FF' ],
                4: [ '#FF7675', '#FDCB6E', '#55EFC4', '#74B9FF' ],
                5: [ '#FF7675', '#FAB1A0', '#FDCB6E', '#55EFC4', '#74B9FF' ],
                6: [ '#FF7675', '#FAB1A0', '#FDCB6E', '#55EFC4', '#25DFE5', '#74B9FF' ],
                7: [ '#FF7675', '#FAB1A0', '#FFEAA7', '#FDCB6E', '#55EFC4', '#25DFE5', '#74B9FF' ]
            }
            return colors[numColors][index];
        }
    }
})