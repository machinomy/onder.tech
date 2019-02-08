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
    drawGraph() // find place and draw scheme from Scheme.svg
}


/* resize the scheme for current width */
function updateSvg() {
    var width = d3.select("#graph-container").node().getBoundingClientRect().width
    var hh = document.documentElement.clientHeight-50
    hh =  hh > 619 ? 619 : hh
    var height = (document.documentElement.clientWidth>456) ? hh : "50vh"
    d3.select('#graph')
        .select('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('preserveAspectRatio',"xMidYMin meet");
}

function fixedHeader() {
    var pos = window.pageYOffset
    var nav = document.getElementById("navbar");
    var logo = document.getElementById("logo");
    if (pos>50) {
        nav.classList.add("fixed-nav");
        document.body.classList.add("has-navbar-fixed-top")
    }
    else {
        nav.classList.remove("fixed-nav");
        document.body.classList.remove("has-navbar-fixed-top")
    }
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

function changeScheme(j) {
    var paths = []
    for (var i = 0; i < 3; i++) {
        paths.push(d3.select("path#net-load-" + (i + 1)).attr("d")) //collect paths
    }

    var clones = []
    if (!d3.select("path#clone0").node()) { //create 'ghost' lines if they are not exist yet
        for (var i = 0; i < 4; i++) {
            clones.push(d3.select("path#net-load-1").clone().attr("id", "clone" + i).attr("stroke-width", i/1.5))
        }
    }
    else {
        for (var i = 0; i < 4; i++) { //or collect it
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

        var path1=d3.select("path#net-load-1"),
            path2=d3.select("path#net-load-2"),
            path3=d3.select("path#net-load-3")
        path1.attr("opacity",0)
        path2.attr("opacity",0)
        path3.attr("opacity",0)
        path1.attr("d","M1,497.409783 C85.9240804,334.230866 85.9240804,0.874838727 128.253582,0.874838727 C170.583084,0.874838727 226.763539,304.81701 344.860813,304.81701 C421.067421,304.81701 455.526931,273.736273 508.898622,273.736273 C609.510858,273.736273 609.510858,605.806627 748.403123,605.806627 C799.34356,605.806627 842.468391,559.398645 877.777614,466.58268 ").attr('stroke', path1.attr('fill')).attr('fill','none')
        path2.attr("d","M1 421.409783C74.8173542 311.044626 68.464784 170.874838727 139.253582 170.874838727C216.096441 170.874838727 280.192715 255.8170098 355.860813 255.8170098C422.979088 255.8170098 455.526931 230.7362731 508.898622 230.7362731C609.510858 230.7362731 609.510858 502.806627 748.403123 502.806627C799.34356 502.806627 842.468391 465.065311 877.777614 389.58268" ).attr('stroke', path2.attr('fill')).attr('fill','none')
        path3.attr("d","M-2.84217094e-14 465.87683730000003C73.8173542 437.1190572 67.464784 400.595103435 138.253582 400.595103435C215.096441 400.595103435 279.192715 422.7284319 354.860813 422.7284319C421.979088 422.7284319 454.526931 416.19316 507.898622 416.19316C608.510858 416.19316 608.510858 487.0863619 747.403123 487.0863619C798.34356 487.0863619 841.468391 477.252131 876.777614 457.583669" ).attr('stroke', path3.attr('fill')).attr('fill','none')

        display();
    });



}

