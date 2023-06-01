// layout:
//     $(go.TreeLayout,
//         {
//             treeStyle: go.TreeLayout.StyleLastParents,
//             arrangement: go.TreeLayout.ArrangementHorizontal,
//             // properties for most of the tree:
//             angle: 90,
//             layerSpacing: 35,
//             // properties for the "last parents":
//             alternateAngle: 90,
//             alternateLayerSpacing: 35,
//             alternateAlignment: go.TreeLayout.AlignmentBus,
//             alternateNodeSpacing: 20
//         }),
function init() {
    var RANDOM_TEXT = "Lorem Ipsum is simply dummy text of the printing and typesetting industry.." +
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry.." +
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry.." +
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry.."

    // Since 2.2 you can also author concise templates with method chaining instead of GraphObject.make
    // For details, see https://gojs.net/latest/intro/buildingObjects.html
    const $ = go.GraphObject.make;  // for conciseness in defining templates

    var blues = [
        '#E1F5FE',
        '#B3E5FC',
        '#81D4FA',
        '#4FC3F7',
        '#29B6F6',
        '#03A9F4',
        '#039BE5',
        '#0288D1',
        '#0277BD',
        '#01579B'];

    myDiagram = $(go.Diagram, "myDiagramDiv",  // must name or refer to the DIV HTML element
            {
                initialContentAlignment: go.Spot.Center,
                layout: $(go.ForceDirectedLayout),
                // moving and copying nodes also moves and copies their subtrees
                "commandHandler.copiesTree": true,  // for the copy command
                "commandHandler.deletesTree": true, // for the delete command
                "draggingTool.dragsTree": true,  // dragging for both move and copy
                "undoManager.isEnabled": true
            });
    myDiagram.contentAlignment = go.Spot.Center,

    // Define the Node template.
    // This uses a Spot Panel to position a button relative
    // to the ellipse surrounding the text.
    myDiagram.nodeTemplate =
        $(go.Node, "Spot",
            {
                selectionObjectName: "PANEL",
                isTreeExpanded: false,
                isTreeLeaf: false
            },
            // the node's outer shape, which will surround the text
            $(go.Panel, "Auto",
                {name: "PANEL"},
                $(go.Shape, "Rectangle",
                    {fill: "lightblue", stroke: "black"},
                    new go.Binding("fill", "rootdistance", dist => {
                        dist = Math.min(blues.length - 1, dist);
                        return blues[dist];
                    }
                    )
                ),
                $(go.TextBlock,
                    {
                        font: "15pt sans-serif",
                        margin: 15,
                        editable: true,
                        width: 250
                    },
                    new go.Binding("text"))
            ),
            // the expand/collapse button, at the top-right corner
            $("TreeExpanderButton",
                {
                    name: 'TREEBUTTON',
                    width: 20, height: 20,
                    alignment: go.Spot.TopRight,
                    alignmentFocus: go.Spot.Center,
                    // customize the expander behavior to
                    // create children if the node has never been expanded
                    click: (e, obj) => {  // OBJ is the Button
                        var node = obj.part;  // get the Node containing this Button
                        if (node === null) return;
                        e.handled = true;
                        expandNode(node);
                    }
                }
            )  // end TreeExpanderButton
        );  // end Node

    // create the model with a root node data
    myDiagram.model = new go.TreeModel([
        {text:  RANDOM_TEXT,
            color: blues[0],
            everExpanded: false}
    ]);


    document.getElementById('zoomToFit').addEventListener('click', () => myDiagram.zoom());

    document.getElementById('expandAtRandom').addEventListener('click', () => expandAtRandom());
}

function expandNode(node) {
    var diagram = node.diagram;
    diagram.startTransaction("CollapseExpandTree");
    // this behavior is specific to this incrementalTree sample:
    var data = node.data;
    if (!data.everExpanded) {
        // only create children once per node
        diagram.model.setDataProperty(data, "everExpanded", true);
        var numchildren = createSubTree(data);
        if (numchildren === 0) {  // now known no children: don't need Button!
            node.findObject('TREEBUTTON').visible = false;
        }
    }
    // this behavior is generic for most expand/collapse tree buttons:
    if (node.isTreeExpanded) {
        diagram.commandHandler.collapseTree(node);
    } else {
        diagram.commandHandler.expandTree(node);
    }
    diagram.commitTransaction("CollapseExpandTree");
    // myDiagram.zoomToFit();
}

// This dynamically creates the immediate children for a node.
// The sample assumes that we have no idea of whether there are any children
// for a node until we look for them the first time, which happens
// upon the first tree-expand of a node.
function createSubTree(parentdata) {
    var numchildren = Math.floor(3);
    if (myDiagram.nodes.count <= 1) {
        numchildren += 1;  // make sure the root node has at least one child
    }
    // create several node data objects and add them to the model
    var model = myDiagram.model;
    var parent = myDiagram.findNodeForData(parentdata);

    var degrees = 1;
    var grandparent = parent.findTreeParentNode();
    while (grandparent) {
        degrees++;
        grandparent = grandparent.findTreeParentNode();
    }
    var child;
    for (var i = 0; i < numchildren; i++) {
            var childdata = {
                text: "Substantive Legal Issues Head",
                key: model.nodeDataArray.length,
                parent: parentdata.key,

                rootdistance: degrees
            };
        // add to model.nodeDataArray and create a Node
        model.addNodeData(childdata);

        // position the new child node close to the parent
        child = myDiagram.findNodeForData(childdata);

        child.location = parent.location;

    };
    return numchildren;
}

function expandAtRandom() {
    var eligibleNodes = [];
    myDiagram.nodes.each(n => {
        if (!n.isTreeExpanded) eligibleNodes.push(n);
    });
    var node = eligibleNodes[Math.floor(Math.random() * (eligibleNodes.length))];
    expandNode(node);
}

window.addEventListener('DOMContentLoaded', init);