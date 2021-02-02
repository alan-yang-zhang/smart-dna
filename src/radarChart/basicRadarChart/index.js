import Chart from "../../chart.js";
d3.json("data.json").then(function(data){
    /* ----------------------------配置参数------------------------  */
    const chart = new Chart();
    const config = {
        margins: {top: 40, left: 40, bottom: 40, right: 40},
        textColor: 'black',
        title: 'Coverage at-a-glance',
        radius: 110,
        animateDuration: 1000,
        pointsNum: 6,
        tickNum: 5,
        axisfillColor: ['white','white'],
        polygonfillColor: ['#6699ff', '#ffffcc'],
        textLabelIcon: ['0.jpg', '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'],
        axisStrokeColor: 'gray',
        pointsSize: 1,
        startAngle: 30
    }

    function changeRadian(angle) {
        if (!angle) { 
            return 0;
        }

        return Math.PI / 180 * angle;
    }

    chart.margins(config.margins);
    
    /* ----------------------------尺度转换------------------------  */
    chart.scaleRadius = d3.scaleLinear()
                            .domain([0, 100])
                            .range([0, config.radius])

    /* ----------------------------渲染坐标轴------------------------  */
    chart.renderAxes = function(){

        // ----渲染背景多边形-----
        const points = getPolygonPoints(config.pointsNum, config.radius, config.tickNum);

        const axes = chart.body().append('g')
                                .attr('class', 'axes')
                                .attr('transform', 'translate(' + chart.getBodyWidth() / 2 + ',' + chart.getBodyHeight() / 2 + ')')
                                .selectAll('axis')
                                .data(points);
            
              axes.enter()
                    .append('polygon')
                    .attr('class', 'axis')
                    .merge(axes)
                        .attr('points', (d) => d)
                        .attr('fill', (d,i) => i%2 === 0?config.axisfillColor[0]:config.axisfillColor[1])
                        .attr('stroke', config.axisStrokeColor);
            
              axes.exit()
                    .remove();

        // ----渲染对角线-----
        const line = d3.line();

        const outerPoints = getOuterPoints(points[0]);
        
        const lines = d3.select('.axes')
                    .selectAll('.line')
                    .data(outerPoints);
            
              lines.enter()
                     .append('path')
                     .attr('class', 'line')
                   .merge(lines)
                     .attr('d', (d) => {
                         return line([
                             [0, 0],
                             [d[0], d[1]]
                         ]);
                     })
                     .attr('stroke', config.axisStrokeColor);
            
                lines.exit()
                     .remove();

        //生成背景多边形的顶点             
        function getPolygonPoints(vertexNum, outerRadius, tickNum){
            const points = [];
            let polygon;

            if (vertexNum < 3) return points;

            const anglePiece = Math.PI * 2 / vertexNum;
            const radiusReduce = outerRadius / tickNum;
            const startRadian = changeRadian(config.startAngle);

            for (let r=outerRadius; r>0; r-=radiusReduce){
                polygon = [];
            
                for (let i=0; i<vertexNum; i++){
                    polygon.push(
                        Math.sin(i * anglePiece + startRadian) * r + ',' +Math.cos(i * anglePiece + startRadian) * r 
                    );
                }

                points.push(polygon.join(' '));
            }

            return points;
        }

        //得到最外层多边形的顶点
        function getOuterPoints(outerPoints){
             const points = outerPoints.split(' ').map((d) => d.split(','));
             return points;
        }
    }

    /* ----------------------------渲染文本标签------------------------  */
    chart.renderText = function(){
        const startRadian = changeRadian(config.startAngle);
        const keys = Object.keys(data[0]).filter(key => key !== 'subject');
        const textGroups = d3.select('.axes')
            .selectAll('.label')
            .data(keys)
            .enter().append("g")
            .attr("class", "text-group")
            .attr("transform", (d,i) =>  computeTextTransform(d, i));
              
        textGroups.append('text')
            .attr('class', 'label')
            .attr('x', (d,i) => computeTextX(data,i))
            .attr('y', 12)
            .text((d) => d)
            .attr('text-anchor', (d,i) => computeTextAnchor(data,i));

        textGroups.append('image')
            .attr('class', 'label')
            .attr('xlink:href', (d,i) => config.textLabelIcon[i])
            .attr('height', '16')
            .attr('width', '16');

        function computeTextTransform(data, i){
            let x = Math.sin(i * Math.PI * 2 / keys.length + startRadian) * (config.radius + 20);

            const angle = i * 360 / keys.length;

            if ( angle >= 180){
                x = x - 25
            }

            let y = computeTextY(data, i);

            return "translate(" + x + "," + y + ")"; 
        }

        function computeTextY(data, i){
            let currentY = Math.cos(i * Math.PI * 2 / keys.length + startRadian) * (config.radius + 20);

            if (keys.length < 3) return;

            const angle = i * 360 / keys.length;

            if ( angle === 0 || angle === 300){
                return currentY - 30;
            }else if ( angle === 120 || angle === 180){

                return currentY + 15
            }else{
                return currentY - 7
            }
            
        }

        function computeTextAnchor(data, i){
            if (keys.length < 3) return;

            const angle = i * 360 / keys.length;

            if ( angle < 180){
                return 'start';
            }else{
                return 'end'
            }
        }

        function computeTextX(data, i){
            let x = 20;

            const angle = i * 360 / keys.length;

            if ( angle >= 180){
                x = -5
            }

            return x;
        }
    }

    /* ----------------------------渲染数据多边形------------------------  */
    chart.renderPolygons = function(){
        const newData = handleData2(data);

        const polygons = chart.body().selectAll('.polygons')
                                .data(newData);
                
              polygons.enter()
                        .append('g')
                        .attr('class', (d) => 'g-' + d.person)
                        .attr('transform', 'translate(' + chart.getBodyWidth()/2 + ',' + chart.getBodyHeight()/2 + ')')
                        .append('polygon')
                        .attr('class', 'polygon')
                    .merge(polygons)
                        .attr('fill', (d,i) => config.polygonfillColor[i])
                        .style('opacity', 0.75)
                        .attr('stroke', (d,i) => chart._colors(i))
                        .attr('stroke-width', '2')
                        .attr('points', (d,i) => {
                            const miniPolygon = [];
                            d.forEach(() => {
                                miniPolygon.push("0,0")
                            });
                            return miniPolygon.join(' ');
                        })
                        .transition().duration(config.animateDuration)
                        .attr('points', generatePolygons);
              
              polygons.exit()
                        .remove();
                        

        //处理数据，转化数据结构，方便渲染
        function handleData(data){
            const newData = [];

            Object.keys(data[0]).forEach((key) => {
                if (key !== 'subject'){
                    const item = [];
                    item.person = key;
                    newData.push(item);
                }
                
            });

            data.forEach((d) => {
                newData.forEach((item,i) => {
                    item.push([d.subject, d['person' + (i+1)]]);
                });
            });

            return newData;
        }

        function handleData2(data){
            const newData = [];
        
        
        
            data.forEach((d, index) => {
                newData[index] = [];
                newData[index]['person'] = d.subject;
        
                Object.keys(d).forEach((key) => {
                    if (key !== 'subject') {
                        const item = [];
                        item.push(key, d[key]);
                        newData[index].push(item);
                    }
                });
            });
        
            return newData;
        }

        function handleData(data){
            const newData = [];

            Object.keys(data[0]).forEach((key) => {
                if (key !== 'subject'){
                    const item = [];
                    item.person = key;
                    newData.push(item);
                }
                
            });

            data.forEach((d) => {
                newData.forEach((item,i) => {
                    item.push([d.subject, d['person' + (i+1)]]);
                });
            });

            return newData;
        }

        //计算多边形的顶点并生成顶点圆圈
        function generatePolygons(d,index){
            const points = [];
            const anglePiece = Math.PI * 2 / d.length; 
            const startRadian = changeRadian(config.startAngle);

            d.forEach((item,i) => {
                const x = Math.sin(i * anglePiece + anglePiece/2) * chart.scaleRadius(item[1]);
                const y = Math.cos(i * anglePiece + startRadian) * chart.scaleRadius(item[1]);

                //添加交点圆圈
                const currentPointGroup = d3.select('.g-' + d.person).append('g');

                const currentPoint = currentPointGroup.append('circle')
                    .attr('class', 'point-' + d.person)
                    .attr('id', 'point')
                    .attr('fill', config.pointsColor)
                    .attr('stroke', chart._colors(index))
                    .attr('r', config.pointsSize)
                    .transition().duration(config.animateDuration)
                    .attr('cx', x)
                    .attr('cy', y)

                if (i === 1) {
                    currentPoint.attr('r', 8)
                        .attr('fill', "pink")
                    
                    currentPointGroup.append('text').text("!")
                        .attr('x', x)
                        .attr("font-size", 15)
                        .attr('y', y + 5)
                        .attr('fill', 'white')
                        .attr('text-anchor', 'middle')
                        .attr('stroke', 'white');


                }
                points.push(x + ',' + y);
            });

            return points.join(' ');
        }
        
    }

    /* ----------------------------渲染图标题------------------------  */
    chart.renderTitle = function(){
        chart.svg().append('text')
                .classed('title', true)
                .attr('x', chart.width()/2)
                .attr('y', 0)
                .attr('dy', '2em')
                .text(config.title)
                .attr('fill', config.textColor)
                .attr('text-anchor', 'middle')
                .attr('stroke', config.textColor);
    }

    /* ----------------------------渲染底部图------------------------  */
    chart.renderFooter = function(){
        const footerLabel = chart.svg().append('g')
            .attr('id', 'footerLabel')
            .attr('transform', 'translate(120,320)');

        const footerLabelItem = footerLabel.append('g').attr('transform', 'translate(0,0)');

        footerLabelItem.append('circle')
            .attr('cx', -10)
            .attr('cy',23)
            .attr('r', 4)
            .attr('dy', '2em')
            .attr('fill', '#529fca')

        footerLabelItem.append('text').classed('foot-title', true)
            .attr('dy', '2em')
            .text(data[0].subject)
            .attr('fill', config.textColor)

        const footerLabelItem2 = footerLabel.append('g').attr('transform', 'translate(150,0)');

        footerLabelItem2.append('circle')
            .attr('cx', -10)
            .attr('cy',23)
            .attr('r', 4)
            .attr('dy', '2em')
            .attr('fill', '#FFA500')

        footerLabelItem2.append('text').classed('foot-title', true)
            .attr('dy', '2em')
            .text(data[1].subject)
            .attr('fill', config.textColor)
    }

    /* ----------------------------绑定鼠标交互事件------------------------  */
    chart.addMouseOn = function(){

        d3.selectAll('.polygon')
            .on('mouseover', function(d){
                const e = d3.event;
                const position = d3.mouse(chart.svg().node());

                d3.select(e.target)
                    .attr('stroke-width', '4');

                chart.svg()
                    .append('text')
                    .classed('tip', true)
                    .attr('x', position[0]+5)
                    .attr('y', position[1])
                    .attr('fill', config.textColor)
                    .text(d.person);
            })
            .on('mouseleave', function(){
                const e = d3.event;

                d3.select(e.target)
                    .attr('stroke-width', '2');

                d3.select('.tip').remove();
            })
    }
        
    chart.render = function(){

        chart.renderTitle();

        chart.renderAxes();

        chart.renderText();

        chart.renderPolygons();

        chart.renderFooter();

        chart.addMouseOn();

    }

    chart.renderChart();

});














