function scroller() {
    var container = d3.select('body');
    var dispatch = d3.dispatch('active', 'progress');
    var sections = null;
    var sectionPositions = [];
    var currentIndex = -1;
    var containerStart = 0;

    function scroll(els) {
        sections = els;
        d3.select(window)
            .on('scroll.scroller', position)
            .on('resize.scroller', resize);

        resize();

        var timer = d3.timer(function () {
            position();
            timer.stop();
        });
    }

    function resize() {
        sectionPositions = [];
        var startPos;
        sections.each(function (d, i) {
            var top = this.getBoundingClientRect().top;
            if (i === 0) {
                startPos = top;
            }
            sectionPositions.push(top - startPos);
        });
        containerStart = container.node().getBoundingClientRect().top + window.pageYOffset;
    }

    function position() {
        var pos = window.pageYOffset - 10 - containerStart;
        var sectionIndex = d3.bisect(sectionPositions, pos);
        sectionIndex = Math.min(sections.size() - 1, sectionIndex);

        if (currentIndex !== sectionIndex) {
            // @v4 you now `.call` the dispatch callback
            dispatch.call('active', this, sectionIndex);
            currentIndex = sectionIndex;
        }

        var prevIndex = Math.max(sectionIndex - 1, 0);
        var prevTop = sectionPositions[prevIndex];
        var progress = (pos - prevTop) / (sectionPositions[sectionIndex] - prevTop);
        // @v4 you now `.call` the dispatch callback
        dispatch.call('progress', this, currentIndex, progress);
    }

    scroll.container = function (value) {
        if (arguments.length === 0) {
            return container;
        }
        container = value;
        return scroll;
    };

    scroll.on = function (action, callback) {
        dispatch.on(action, callback);
    };

    return scroll;
}

function display() {

    var scroll = scroller()
        .container(d3.select('#scroll-container'));

    scroll(d3.selectAll('.step'));


    scroll.on('active', function (index) {
        d3.selectAll('.step')
            .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });

        // activate current section
        changeScheme(index)
    });
}
function selection_clone() {
    return this.parentNode.insertBefore(this.cloneNode(true), this.nextSibling);
}

d3.selection.prototype.clone = function() {
    return this.select(selection_clone);
};

function changeScheme(i) {

    //console.log("active section №" + (i + 1))
    var path1=d3.select("path#net-load-1").attr("d"),
        path2=d3.select("path#net-load-2").attr("d"),
        path3=d3.select("path#net-load-3").attr("d")
    if (!d3.select("path#clone").node()) {
        var path = d3.select("path#net-load-1").clone(),
            path0 = d3.select("path#net-load-1").clone()
        path.attr("id", "clone")
        path0.attr("id", "clone2")
    }
    else {
        var path = d3.select("path#clone"),
            path0 = d3.select("path#clone2")
    }

    if (i==0){
        path.transition().duration(1000).attr("opacity",1)
            .attr("d",path1)
            .attr("transform","translate(0 0)");
        path0.transition().duration(500).attr("opacity",1)
            .attr("d",path1)
            .attr("transform","translate(0 0)");
    }
    if (i==1){
        path.transition().duration(1000).attr("opacity",1)
            .attr("d",path2)
            .attr("transform","translate(0 150)");
        path0.transition().duration(500).attr("opacity",1)
            .attr("d",path2)
            .attr("transform","translate(0 150)")
    }
    if (i==2){
        path.transition().duration(1000).attr("opacity",1)
            .attr("d",path3)
            .attr("transform","translate(0 300)");
        path0.transition().duration(500).attr("opacity",1)
            .attr("d",path3)
            .attr("transform","translate(0 300)");
    }
}

function drawGraph() {
    var width = d3.select("#graph-container").node().getBoundingClientRect().width
    var hh=document.documentElement.clientHeight-50
    hh =  hh>619 ? 619 : hh
    var height = (document.documentElement.clientWidth>456) ? hh : "50vh"
    var graph = d3.select('#graph')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox',"0 0 865 769")
        .attr('preserveAspectRatio',"xMidYMin meet");

    var svg = d3.select('#graph svg');

    //load svg content from external svg

    var file =  "assets/images/graph.svg"

    d3.xml(file).then(function(documentFragment,error) {
        if (error) {console.log(error); return;}
        var svgNode = documentFragment
            .getElementsByTagName("svg")[0];
        svg.node().appendChild(svgNode);
        //$("g#Scheme6_2 > ").hide();

        var path1=d3.select("path#net-load-1"),
            path2=d3.select("path#net-load-2"),
            path3=d3.select("path#net-load-3")

        path1.attr("d","M1,497.409783 C85.9240804,334.230866 85.9240804,0.874838727 128.253582,0.874838727 C170.583084,0.874838727 226.763539,304.81701 344.860813,304.81701 C421.067421,304.81701 455.526931,273.736273 508.898622,273.736273 C609.510858,273.736273 609.510858,605.806627 748.403123,605.806627 C799.34356,605.806627 842.468391,559.398645 877.777614,466.58268 ").attr('stroke', path1.attr('fill')).attr('fill','none')
        path2.attr("d","M1,251.409783 C74.8173542,141.044626 68.464784,0.874838727 139.253582,0.874838727 C216.096441,0.874838727 280.192715,85.8170098 355.860813,85.8170098 C422.979088,85.8170098 455.526931,60.7362731 508.898622,60.7362731 C609.510858,60.7362731 609.510858,332.806627 748.403123,332.806627 C799.34356,332.806627 842.468391,295.065311 877.777614,219.58268").attr('stroke', path2.attr('fill')).attr('fill','none')
        path3.attr("d","M-2.84217094e-14,65.8768373 C73.8173542,37.1190572 67.464784,0.595103435 138.253582,0.595103435 C215.096441,0.595103435 279.192715,22.7284319 354.860813,22.7284319 C421.979088,22.7284319 454.526931,16.19316 507.898622,16.19316 C608.510858,16.19316 608.510858,87.0863619 747.403123,87.0863619 C798.34356,87.0863619 841.468391,77.252131 876.777614,57.583669").attr('stroke', path3.attr('fill')).attr('fill','none')

        path1.attr("opacity",0)
        path2.attr("opacity",0)
        path3.attr("opacity",0)

        display();


    });



}
drawGraph();
