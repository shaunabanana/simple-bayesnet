Vue.component('pie', {
    props: ['node'],
    template: `
    <div class="pie"
    :style="{ left: node.x - 4 + 'px', top: node.y - 4 + 'px', background: getColor(2, 0)}">
        <div class="pie-segment"
        v-for="(value, index) in node.values"
        :style="{ '--offset': getOffset(node, index), '--value': getValue(node, index), '--bg': getColor(node.values.length, index), '--over50': getValue(node, index) > 50 ? 1 : 0}"
        ></div>
    </div>
    `,
    methods: {
        getOffset: function(node, index) {
            var offset = 0;
            for (var i = 0; i < index; i++) {
                offset += this.getValue(node, i);
            }
            return offset;
        },
        getValue: function(node, index) {
            if (node.observation != '') {
                if (node.values[index].name == node.observation) {
                    return 100;
                } else {
                    return 0;
                }
            } else {
                return Math.round(node.values[index].probability * 100);
            }
        },
        getColor: function(numColors, index) {
            var colors = {
                1: [ '#FF7675' ],
                2: [ '#FF7675', '#74B9FF' ],
                3: [ '#FF7675', '#FDCB6E', '#74B9FF' ],
                4: [ '#FF7675', '#FDCB6E', '#55EFC4', '#74B9FF' ],
                5: [ '#FF7675', '#FAB1A0', '#FDCB6E', '#55EFC4', '#74B9FF' ],
                6: [ '#FF7675', '#FAB1A0', '#FDCB6E', '#55EFC4', '#25DFE5', '#74B9FF' ],
                7: [ '#FF7675', '#FAB1A0', '#FFEAA7', '#FDCB6E', '#55EFC4', '#25DFE5', '#74B9FF' ],
                8: [ '#FF7675', '#FAB1A0', '#FFEAA7', '#FDCB6E', '#55EFC4', '#25DFE5', '#74B9FF', '#A698FF' ],
                9: [ '#FF7675', '#FAB1A0', '#FFEAA7', '#FDCB6E', 'B1E18C', '#55EFC4', '#25DFE5', '#74B9FF', '#A698FF' ],
                10: [ '#FF7675', '#FAB1A0', '#FFEAA7', '#FDCB6E', 'B1E18C', '#55EFC4', '#25DFE5', '#74B9FF', '#A698FF', '#FF8FC5' ]
            }
            return colors[numColors][index];
        },
    }
});
