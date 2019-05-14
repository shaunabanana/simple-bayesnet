Vue.component('network-node', {
    props: ['id', 'title', 'value', 'x', 'y'],
    template: `
    <div 
    class="node unselectable" 
    :id="id" 
    :style="{ left: x + 'px', top: y + 'px' }" 
    @mouseenter="$emit('mouse-enter')"
    @mouseleave="$emit('mouse-leave')"
    > 
        {{ title.length > 25 ? title.substr(0, 25) + '...' : title }} <br/> 
        <div>{{ value }} </div>
    </div>`
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
    props: ['x1', 'y1', 'x2', 'y2'],
    template: `
    <div
    class="link-handle"
    @mouseenter="$emit('mouse-enter')"
    @mouseleave="$emit('mouse-leave')"
    :style="{ left: (x1 + x2) / 2 + 'px', top: (y1 + y2) / 2 + 'px' }" 
    ></div>`
})