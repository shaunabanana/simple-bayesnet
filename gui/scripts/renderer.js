app = new Vue({
    el: '#app',
    data: {
        dataset: "",

        nextNodeId: 1, 
        nextLinkId: 1,
        currentNode: null,
        currentLink: null,
        currentSelectedNode: null,
        currentSelectedLink: null,

        mouseIsDown: false,
        dragging: false,
        panning: false,
        linking: false,
        busy: false,

        runningInference: false,

        batchLinking: false,

        popupShowing: false,
        popupText: 'Hello, smart interactions!',

        linkStart: null,
        linkEnd: null,
        newLink: {
            x1: 100,
            y1: 100,
            x2: 300,
            y2: 400
        },
        nodes: [],
        links: [],
    },
    methods: {
        getNodeById: function (id) {
            for (var i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].id == id) {
                    return this.nodes[i];
                }
            }
            return null;
        },
        getLinkById: function (id) {
            for (var i = 0; i < this.links.length; i++) {
                if (this.links[i].id == id) {
                    return this.links[i];
                }
            }
            return null;
        },
        getLinkByNodes: function (id1, id2) {
            for (var i = 0; i < this.links.length; i++) {
                if (
                    (this.links[i].src == id1 && this.links[i].dest == id2) 
                    || (this.links[i].src == id2 && this.links[i].dest == id1)
                ) {
                    return this.links[i];
                }
            }
            return null;
        },
        mouseDown: function (e) {
            this.mouseIsDown = true;
            if ( $(e.target).hasClass('node') ) {
                this.currentNode = Number( $(e.target).attr('id') );
            } else {
                this.currentNode = null;
            }
        },

        mouseUp: function (e) {

            if ( // User just selected a node.
                $(e.target).hasClass('node')
                && !this.dragging 
                && !this.panning 
                && !this.linking
            ) {
                this.currentSelectedNode = Number($(e.target).attr('id'));
                this.currentSelectedLink = null;
            
                
            } else if ( // User just selected a link.
                $(e.target).hasClass('link-handle')
                && !this.dragging
                && !this.panning 
                && !this.linking
            ) {
                this.currentSelectedLink = Number($(e.target).attr('id'));
                this.currentSelectedNode = null;


            } else if ( // User just created a link between two nodes.
                $(e.target).hasClass('node')
                && !this.getNodeById(Number($(e.target).attr('id'))).ignored
                && this.linking
            ) {
                this.addLink(this.linkStart.id, this.linkEnd.id);
                
            } else if ( // User just clicked on an empty part of the canvas
                !$(e.target).hasClass('node')
                && !$(e.target).hasClass('link-handle')
                && !$(e.target).hasClass('observe-button') 
                && !this.dragging && !this.panning && (!this.linking || this.batchLinking)
            ) {
                this.currentSelectedLink = null;
                this.currentSelectedNode = null;
                this.batchLinking = false;
            }

            this.currentLink = null;
            this.currentNode = null;
            
            this.mouseIsDown = false;
            this.dragging = false;
            this.panning = false;
            this.linking = false;

            $('body').css( 'cursor', 'default' );
        },

        doDragging: function (e) {
            var node = this.getNodeById(this.currentNode);
            if (node) {
                node.x = node.x + e.movementX;
                node.y = node.y + e.movementY;
            }
            this.updateLinkPositions();
        },

        doPanning: function (e) {
            for (var i = 0; i < this.nodes.length; i++) {
                var node = this.nodes[i];
                node.x = node.x + e.movementX;
                node.y = node.y + e.movementY;
            }
            this.updateLinkPositions();
        },

        doLinking: function (e) {
            this.linkStart = this.getNodeById(this.currentSelectedNode);
            if (this.linkStart) {
                this.newLink.x1 = this.linkStart.x + 50;
                this.newLink.y1 = this.linkStart.y + 50;
                if ( 
                    $(e.target).hasClass('node') 
                    && Number($(e.target).attr('id')) != this.currentSelectedNode
                    && !this.getNodeById(Number($(e.target).attr('id'))).ignored
                ) {
                    this.linkEnd = this.getNodeById( Number($(e.target).attr('id')) );
                    var linkCoords = this.calcLinkCoordinates(
                        this.linkStart.x, 
                        this.linkStart.y, 
                        this.linkEnd.x,
                        this.linkEnd.y
                    );
                    this.newLink.x2 = linkCoords.x2;
                    this.newLink.y2 = linkCoords.y2;
                } else {
                    this.newLink.x2 = e.clientX;
                    this.newLink.y2 = e.clientY;
                }
            }
        },

        mouseMove: function (e) {
            if (this.dragging) {
                this.doDragging(e);

            } else if (this.panning) {
                this.doPanning(e);

            } else if (this.linking) {
                this.doLinking(e);

            } else if (this.batchLinking) {
                this.linking = true;

            } else if (this.mouseIsDown) {
                if (this.currentNode) {
                    if ( this.currentSelectedNode == this.currentNode ) {
                        this.linking = true;
                        this.newLink.x1 = -10;
                        this.newLink.y1 = -10;
                        this.newLink.x2 = -10;
                        this.newLink.y2 = -10;
                    } else {
                        this.dragging = true;
                    }
                } else {
                    $('body').css( 'cursor', 'move' );
                    this.panning = true;
                }
            }
        },

        addNode: function (title, values) {

            app.nodes.push({ 
                id: this.nextNodeId, 
                title: title, 
                value: '',
                observation: '',
                x: 100,
                y: 100,
                hover: false,
                ignored: false,
                values: values
            })
            this.nextNodeId ++;

        },

        modifyNode: function (title, values) {

            for (var i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].title == title) {
                    this.nodes[i].values = values;
                }
            }

        },

        addLink: function (nodeId1, nodeId2) {

            if ( this.getLinkByNodes(nodeId1, nodeId2) ) {
                return;
            }

            var node1 = this.getNodeById(nodeId1);
            var node2 = this.getNodeById(nodeId2);

            if (node1 && node2 && !node1.ignored && !node2.ignored) {
                app.links.push({ 
                    id: this.nextLinkId,
                    src: nodeId1,
                    dest: nodeId2,
                    x1: 0,
                    x2: 0,
                    y1: 0,
                    y2: 0,
                    hover: false,
                    ignored: false
                })
                this.updateLinkPositions();
                this.nextLinkId ++;
            }

            this.updateModel();
        },

        deleteLink: function (linkId) {
            for (var i = 0; i < this.links.length; i++) {
                if (this.links[i].id == linkId) {
                    this.links.splice(i, 1);
                }
            }
            this.updateModel();
        },

        deleteCurrentLink: function () {
            this.deleteLink(this.currentSelectedLink);
            this.currentSelectedLink = null;
        },

        toggleIgnore: function () {
            var node = this.getNodeById(this.currentSelectedNode);
            node.ignored = !node.ignored;
            for (var i = 0; i < this.links.length; i++) {
                if (this.links[i].src == this.currentSelectedNode || this.links[i].dest == this.currentSelectedNode) {
                    this.links[i].ignored = node.ignored;
                }
            }
            if (this.runningInference) {
                this.query();
            }
        },

        calcLinkCoordinates: function (x1, y1, x2, y2) {
            var dx = (x2 - x1);
            var dy = (y2 - y1);

            var d = Math.sqrt( dx * dx + dy * dy );
            var linkRatio = (d - 100 - 10) / d;
            var startRatio = 50.0 / d;
            var result = {};
            result.x1 = x1 + 50 + dx * startRatio;
            result.y1 = y1 + 50 + dy * startRatio;
            result.x2 = result.x1 + dx * linkRatio;
            result.y2 = result.y1 + dy * linkRatio;
            
            return result;
        },

        updateLinkPositions: function () {

            for (var i = 0; i < this.links.length; i++) {

                var src = this.getNodeById(this.links[i].src);
                var dest = this.getNodeById(this.links[i].dest);

                var linkCoords = this.calcLinkCoordinates(src.x, src.y, dest.x, dest.y);
                this.links[i].x1 = linkCoords.x1;
                this.links[i].y1 = linkCoords.y1;
                this.links[i].x2 = linkCoords.x2;
                this.links[i].y2 = linkCoords.y2;
            }

        },

        layoutNodes: function () {

            var spacing = 150;

            var numNodes = this.nodes.length;
            var numFirstRow = 1;
            var numLastRow = 1;
            var numRows = numNodes;
            var countedNodes = 0;

            while (numFirstRow <= numRows || numLastRow < numFirstRow / 2) {
                numFirstRow ++;
                numRows = 0;
                countedNodes = 0;
                while (countedNodes < numNodes) {
                    if (numRows % 2 == 0) {
                        countedNodes += numFirstRow;
                    } else {
                        countedNodes += numFirstRow - 1;
                    }
                    numRows++;
                }
                if ((numRows - 1) % 2 == 0) {
                    numLastRow = numFirstRow - (countedNodes - numNodes);
                } else {
                    numLastRow = numFirstRow - (countedNodes - numNodes) - 1;
                }
            }

            var offsetX = ( $(window).width() - (numFirstRow - 1) * spacing - 100 ) / 2;
            var offsetY = ( $(window).height() - (numRows - 1) * spacing - 100 ) / 2;

            var currentCol = 1;
            var currentRow = 0;

            var currentX = offsetX;
            var currentY = offsetY;
            
            for (var i = 0; i < this.nodes.length; i++) {
                this.nodes[i].x = currentX;
                this.nodes[i].y = currentY;

                if (currentRow % 2 == 0) {
                    if (currentCol < numFirstRow) {
                        currentX += spacing;
                        currentCol ++;
                    } else {
                        currentX = offsetX + spacing / 2;
                        currentY += spacing * Math.sqrt(3) / 2;
                        currentCol = 1;
                        currentRow ++;
                    }
                } else {
                    if (currentCol < numFirstRow - 1) {
                        currentX += spacing;
                        currentCol ++;
                    } else {
                        currentX = offsetX;
                        currentY += spacing * Math.sqrt(3) / 2;
                        currentCol = 1;
                        currentRow ++;
                    }
                }
            }

        },

        resetAll: function () {
            this.nodes.splice(0, this.nodes.length);
            this.links.splice(0, this.links.length);

            this.data = "";

            this.nextNodeId = 1;
            this.nextLinkId = 1;
            this.currentNode = null;
            this.currentLink = null;
            this.currentSelectedNode = null;
            this.currentSelectedLink = null;

            this.mouseIsDown = false;
            this.dragging = false;
            this.panning = false;
            this.linking = false;
            this.busy = false;

            this.runningInference = false;

            this.batchLinking = false;

            this.popupShowing = false;

            this.linkStart = null;
            this.linkEnd = null;
        },

        initVariables: function (variables) {
            for (var i = 0; i < variables.length; i++) {
                this.addNode(
                    variables[i].title,
                    variables[i].values
                )
            }
            this.layoutNodes();

            eel.getData()(result => {
                console.log(result);
                this.dataset = result;
            });
        },

        loadData: function () {
            $('#file').trigger('click');
        },

        gotFilePath: function (event) {
            console.log(event.target.files);

            if (event.target.files && event.target.files.length > 0) {
                let filename = event.target.files[0].name;
                let reader = new FileReader();
                reader.onload = () => {
                    this.resetAll();
                    if ( filename.substr(filename.length - 5, 5) === '.json' ) {
                        eel.loadModel(reader.result)(model => {
                            var model = JSON.parse(model);
                            console.log(model);
                            this.resetAll();

                            this.dataset = model.dataset

                            var maxNodeId = 0;
                            for (var i = 0; i < model.nodes.length; i++) {
                                this.nodes.push( model.nodes[i] );
                                if (model.nodes[i].id > maxNodeId) {
                                    maxNodeId = model.nodes[i].id;
                                }
                            }
                            this.nextNodeId = maxNodeId + 1;

                            var maxLinkId = 0;
                            for (var i = 0; i < model.links.length; i++) {
                                this.links.push( model.links[i] );
                                if (model.links[i].id > maxLinkId) {
                                    maxLinkId = model.links[i].id;
                                }
                            }
                            this.nextLinkId = maxLinkId + 1;

                            //this.layoutNodes();
                            this.updateLinkPositions();
                        });
                    } else {
                        eel.loadFile(filename, reader.result)(variables => {
                            console.log(variables);
                            this.initVariables(JSON.parse(variables));
                        });
                    }
                }
                reader.readAsDataURL(event.target.files[0]);
            }
        },

        download(content, fileName, contentType) {
            var a = document.createElement("a");
            var file = new Blob([content], {type: contentType});
            a.href = URL.createObjectURL(file);
            a.download = fileName;
            a.click();
        },

        saveData: function () {
            var userModel = {
                dataset: this.dataset,
                nodes: this.nodes,
                links: this.links,
                modelStructure: this.getModelStructure()
            };

            this.download(JSON.stringify(userModel), 'model.json', 'text/json');
        },

        getModelStructure: function () {
            var model = [];

            for (var i = 0; i < this.links.length; i++) {
                if (!this.links[i].ignored) {
                    model.push(
                        [
                            this.getNodeById(this.links[i].src).title,
                            this.getNodeById(this.links[i].dest).title
                        ]
                    )
                }
            }

            return model;
        },

        updateModel: function () {
            eel.updateModel(JSON.stringify(this.getModelStructure()))();
            this.query();
        },

        query: function () {
            if (!this.runningInference) return;

            query = {
                variables: [],
                evidence: {}
            };

            for (var i = 0; i < this.nodes.length; i++) {
                if (!this.nodes[i].ignored) {
                    for (var j = 0; j < this.links.length; j++) {
                        if (this.links[j].src == this.nodes[i].id || this.links[j].dest == this.nodes[i].id) {
                            if (this.nodes[i].observation == '') {
                                query.variables.push(this.nodes[i].title)
                            } else {
                                query.evidence[this.nodes[i].title] = this.nodes[i].observation;
                            }
                            break;
                        }
                    }
                }
            }

            this.busy = true;
            this.showPopup("Running inteference...")
            console.log('Reasoning...');

            eel.query(JSON.stringify(query))( result => {
                console.log('Done reasoning.');
                result = JSON.parse(result);

                for (var i = 0; i < result.length; i++) {
                    this.modifyNode( result[i].title, result[i].values )
                }
                this.hidePopup();
                this.busy = false;
            });
        },

        showPopup: function (text) {
            this.popupText = text;
            this.popupShowing = true;
        },

        hidePopup: function () {
            this.popupShowing = false;
        },

        showHidePopup: function (text) {
            this.showPopup(text);
            setTimeout(() => {
                this.hidePopup();
            }, 3500);
        }
    }
})
/*
app.addNode(
    'General Software Development #2',
    [
        { name: '0', probability: 0.3 },
        { name: '1', probability: 0.6 },
        { name: '2', probability: 0.1 },
    ]
)
*/
app.layoutNodes();