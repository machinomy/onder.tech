/*init*/
document.addEventListener("DOMContentLoaded", init);


/*on resize*/

window.addEventListener("resize",  function(){
    updateSvg()
});


/*on orientation change*/

window.addEventListener("orientationchange", function() {
    updateSvg() //resize scheme
});


/* on scroll */

window.onscroll = function() {
    fixedHeader();
}

function init() {
    fixedHeader();
    drawGraph(); // find place and draw scheme from Scheme.svg
}


/* resize the scheme for current width */
function updateSvg() {
    var width = d3.select("#graph-container").node().getBoundingClientRect().width
    var height =679/( 861/width)+'px'
    d3.select('#graph')
        .select('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('preserveAspectRatio',"xMidYMin meet");
}

function fixedHeader() {
    var pos = window.pageYOffset
    var nav = document.getElementById("navbar");

    if (pos>10)
        nav.classList.add("fixed-nav");

    else
        nav.classList.remove("fixed-nav");

    var offset_for_hide=document.getElementsByClassName("footer")[0].offsetTop-50

    if (pos>offset_for_hide)
        nav.classList.add("is-hidden");
    else
        nav.classList.remove("is-hidden");
}


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
            var top = this.getBoundingClientRect().bottom;
            if (i === 0) {
                startPos = top;
            }
            sectionPositions.push(top - startPos);
        });
        containerStart = container.node().getBoundingClientRect().top+ window.pageYOffset;
    }

    function position() {
        var graph=d3.select("#graph").node().getBoundingClientRect().height-100
        var w=window.innerWidth

        if (w>=568) graph=100
        if (w>=768) graph=50
        if (w>=1024) graph=10
        if (w>=1366) graph=-200

        var pos = window.pageYOffset - graph - containerStart;
        var sectionIndex = d3.bisect(sectionPositions, pos);
        sectionIndex = Math.min(sections.size() - 1, sectionIndex);

        if (currentIndex !== sectionIndex) {
            // @v4 you now `.call` the dispatch callback
            dispatch.call('active', this, sectionIndex);
            currentIndex = sectionIndex;
        }

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
            .style('opacity', function (d, i) { return i <= index ? 1 : 0.1; });

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

function changeScheme(j) {

    var paths = []
    for (var i = 0; i < 3; i++) {
        paths.push(d3.select("path#p" + (i + 1)).attr("d")) //collect paths
    }

    var clones = []
    if (!d3.select("path#clone0").node()) { //create 'ghost' lines if they are not exist yet
        for (var i = 0; i < 4; i++) {
            clones.push(d3.select("path#p"+(j+1)).clone().attr("id", "clone" + i).attr("stroke-width", 4-i*0.5))
        }
    }
    else {
        for (var i = 0; i < 4; i++) { //or collect it
            d3.select("path#clone" + i).attr("stroke",d3.select("path#p" + (j+1)).attr("stroke"))
            clones.push(d3.select("path#clone" + i))
        }
    }

    for (var i = 0; i < 4; i++) { //animate ghosts: they are going to current path
        clones[i].transition().duration(i * 200 + 600).attr("opacity", 1)
            .attr("d", paths[j])
    }

}

function drawGraph() {
    var width = d3.select("#graph-container").node().getBoundingClientRect().width
    var height = 679/( 861/width)+'px'

    var graph = d3.select('#graph')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox',"0 0 861 679")
        .attr('preserveAspectRatio',"xMidYMin meet");

    var svg = d3.select('#graph svg');
    var elements = document.querySelectorAll('#graph');
    Stickyfill.add(elements);

    //load svg content from external svg

    var file =  "assets/images/graph.svg"

    d3.xml(file).then(function(documentFragment,error) {
        if (error) {console.log(error); return;}
        var svgNode = documentFragment
            .getElementsByTagName("svg")[0];
        svg.node().appendChild(svgNode);

        var path1=d3.select("path#p1"),
            path2=d3.select("path#p2"),
            path3=d3.select("path#p3")
        path1.attr("opacity",0)
        path2.attr("opacity",0)
        path3.attr("opacity",0)

        display();
        });
}

