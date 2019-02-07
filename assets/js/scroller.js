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
    //drawGraph()
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

function changeScheme(i) {
    console.log("active section №" + (i + 1))
}

function drawGraph() {
    var width = d3.select("#graph-container").node().getBoundingClientRect().width
    var hh=document.documentElement.clientHeight-50
    hh =  hh>619 ? 619 : hh
    var height = (document.documentElement.clientWidth>456) ? hh : "50vh"
    var graph = d3.select('#graph')
        .append('svg')
        .attrs({width: width, height: height, viewBox:"130 200 390 400", preserveAspectRatio:"xMidYMin meet"});
    var svg = d3.select('#graph svg');

    //load svg content from external svg

    var file =  "assets/images/scheme.svg"

    d3.xml(file).then(function(documentFragment,error) {
        if (error) {console.log(error); return;}
        var svgNode = documentFragment
            .getElementsByTagName("svg")[0];
        svg.node().appendChild(svgNode);
        //$("g#Scheme6_2 > ").hide();

    });

}

display();